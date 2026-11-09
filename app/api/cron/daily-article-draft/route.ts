import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { callAIFallback } from '@/utils/ai';
import { generateDailyArticle } from '@/lib/ai/daily-article-generator';
import { createReviewToken, sendDraftReviewEmail } from '@/lib/article-review';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const languages = [
    { code: 'en', instruction: 'Translate into clear professional English.' },
    { code: 'de', instruction: 'Übersetze in professionelles Deutsch. Verwende kein Türkisch.' },
    { code: 'fr', instruction: 'Translate into professional French.' },
    { code: 'ar', instruction: 'Translate into professional Arabic.' },
    { code: 'es', instruction: 'Translate into professional Spanish.' },
    { code: 'it', instruction: 'Translate into professional Italian.' },
];

function safeSlug(value: string, fallback: string) {
    const slug = String(value || fallback).toLocaleLowerCase('en-US').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return slug || fallback;
}

export async function GET(request: Request) {
    if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase admin yapılandırması eksik.' }, { status: 500 });

    const runDate = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase.from('ai_content_generation_runs')
        .select('id,status,article_id,keyword,error_message')
        .eq('run_date', runDate).eq('content_type', 'daily_article').maybeSingle();
    if (existing && ['completed', 'no_change'].includes(existing.status)) return NextResponse.json({ success: true, message: 'Bugünün günlük makale taslağı zaten işlendi.', run: existing });

    const { data: run, error: runError } = existing
        ? await supabase.from('ai_content_generation_runs').update({ status: 'started', error_message: null }).eq('id', existing.id).select('id').single()
        : await supabase.from('ai_content_generation_runs').insert({ run_date: runDate, content_type: 'daily_article', keyword: 'Başlatıldı' }).select('id').single();
    if (runError || !run) return NextResponse.json({ error: runError?.message || 'Günlük çalışma kilidi oluşturulamadı.' }, { status: 409 });

    try {
        const { data: settings } = await supabase.from('meta_settings').select('openai_api_key, serper_api_key, gemini_api_key, xai_api_key').single();
        const { data: categories } = await supabase.from('categories').select('title').order('title').limit(100);
        const { data: recent } = await supabase.from('articles').select('keywords,title').order('created_at', { ascending: false }).limit(30);
        const pool = (categories || []).map((category) => `${category.title} etiket çözümleri`).filter(Boolean);
        const index = new Date().getUTCDate() % Math.max(pool.length, 1);
        const baseKeyword = pool[index] || 'endüstriyel termal etiket çözümleri';
        const recentTitles = (recent || []).map((article) => article.title).filter(Boolean).slice(0, 12).join(' | ');
        const keyword = recentTitles ? `${baseKeyword} (önceki başlıklardan farklı, yeni içerik açısı)` : baseKeyword;
        const generated = await generateDailyArticle(keyword, settings || {});
        const baseSlug = safeSlug(generated.article.slug, `rotabil-${runDate}`);
        const { data: duplicate } = await supabase.from('articles').select('id').eq('slug', baseSlug).maybeSingle();
        const slug = duplicate ? `${baseSlug}-${runDate}` : baseSlug;
        const { token, hash } = createReviewToken();
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const sourceUrls = [...generated.serp.tr, ...generated.serp.en].map((item) => item.link).filter(Boolean);

        const { data: article, error: articleError } = await supabase.from('articles').insert({
            title: generated.article.title,
            slug,
            summary: generated.article.summary,
            content_html: generated.article.content_html,
            seo_description: generated.article.seo_description,
            seo_score: generated.seo.score,
            seo_score_details: generated.seo,
            source_urls: sourceUrls,
            ai_generated: true,
            review_status: 'draft',
            review_token_hash: hash,
            review_token_expires_at: expires,
            review_email_status: 'pending',
            is_published: false,
        }).select('id').single();
        if (articleError || !article) throw new Error(articleError?.message || 'Makale taslağı kaydedilemedi.');

        const { error: trError } = await supabase.from('article_translations').insert({
            article_id: article.id, language_code: 'tr', title: generated.article.title, slug,
            summary: generated.article.summary, content_html: generated.article.content_html,
            seo_description: generated.article.seo_description, keywords: generated.article.keywords,
        });
        if (trError) throw new Error(trError.message);

        await Promise.all(languages.map(async (language) => {
            const raw = await callAIFallback(
                `You are a professional SEO translator. ${language.instruction} Preserve HTML tags. Return valid JSON only with title, summary, content_html, seo_description, keywords.`,
                JSON.stringify(generated.article), true, settings || {}
            );
            if (!raw) return;
            const value = JSON.parse(raw);
            await supabase.from('article_translations').insert({
                article_id: article.id, language_code: language.code,
                title: value.title, slug: `${slug}-${language.code}`, summary: value.summary,
                content_html: value.content_html, seo_description: value.seo_description, keywords: value.keywords,
            });
        }));

        const email = await sendDraftReviewEmail({ token, title: generated.article.title, summary: generated.article.summary, seoScore: generated.seo.score });
        await supabase.from('articles').update({ review_email_status: email.sent ? 'sent' : 'failed', review_email_error: email.error }).eq('id', article.id);
        await supabase.from('ai_content_generation_runs').update({ status: 'completed', article_id: article.id, keyword: `${keyword} | SEO ${generated.seo.score}/100` }).eq('id', run.id);

        return NextResponse.json({ success: true, articleId: article.id, keyword, seoScore: generated.seo.score, email: email.sent ? 'sent' : email.error });
    } catch (error: any) {
        await supabase.from('ai_content_generation_runs').update({ status: 'failed', error_message: error.message }).eq('id', run.id);
        return NextResponse.json({ error: error.message || 'Günlük taslak üretilemedi.' }, { status: 500 });
    }
}
