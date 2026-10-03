import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateUPMArticle, readUPMSources, UPM_WATCH_SOURCES } from '@/lib/ai/upm-monitor';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const languages = [
    { code: 'en', instruction: 'Translate to clear professional English.' },
    { code: 'de', instruction: 'Übersetze in professionelles Deutsch. Verwende keine türkischen Wörter.' },
    { code: 'fr', instruction: 'Translate to professional French.' },
    { code: 'ar', instruction: 'Translate to professional Arabic.' },
    { code: 'es', instruction: 'Translate to professional Spanish.' },
    { code: 'it', instruction: 'Translate to professional Italian.' },
];

export async function GET(request: Request) {
    if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase admin yapılandırması eksik.' }, { status: 500 });
    const runDate = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase.from('ai_content_generation_runs').select('id,status,article_id,keyword').eq('run_date', runDate).eq('content_type', 'upm_article').maybeSingle();
    if (existing) return NextResponse.json({ success: true, message: 'UPM kontrolü bugün zaten yapıldı.', run: existing });
    const { data: run, error: runError } = await supabase.from('ai_content_generation_runs').insert({ run_date: runDate, content_type: 'upm_article', keyword: 'UPM resmi kaynak izleme' }).select('id').single();
    if (runError || !run) return NextResponse.json({ error: runError?.message || 'Günlük UPM kontrol kilidi oluşturulamadı.' }, { status: 409 });
    try {
        const watch = await readUPMSources();
        const { data: latestCompleted } = await supabase.from('articles').select('source_fingerprint').eq('source_fingerprint', watch.fingerprint).limit(1).maybeSingle();
        if (latestCompleted) {
            await supabase.from('ai_content_generation_runs').update({ status: 'no_change', keyword: `UPM kaynaklarında değişiklik yok: ${watch.fingerprint}` }).eq('id', run.id);
            return NextResponse.json({ success: true, message: 'UPM kaynaklarında yeni değişiklik bulunmadı.', fingerprint: watch.fingerprint });
        }
        const { data: settings } = await supabase.from('meta_settings').select('openai_api_key, serper_api_key, gemini_api_key, xai_api_key').single();
        const keyword = 'UPM gıda uygulamaları etiket malzemeleri mevzuat güncellemesi';
        const generated = await generateUPMArticle(keyword, watch, settings || {});
        let slug = String(generated.article.slug || `upm-gida-uygulamalari-${runDate}`).replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const { data: duplicate } = await supabase.from('articles').select('id').eq('slug', slug).maybeSingle();
        if (duplicate) slug = `${slug}-${runDate}`;
        const { data: article, error: articleError } = await supabase.from('articles').insert({
            title: generated.article.title, slug, summary: generated.article.summary, content_html: generated.article.content_html,
            is_published: false, seo_description: generated.article.seo_description, seo_score: generated.seo.score, seo_score_details: generated.seo,
            source_urls: UPM_WATCH_SOURCES, source_fingerprint: watch.fingerprint, ai_generated: true, review_status: 'draft',
        }).select('id').single();
        if (articleError || !article) throw new Error(articleError?.message || 'Makale kaydedilemedi.');
        const { error: trError } = await supabase.from('article_translations').insert({ article_id: article.id, language_code: 'tr', title: generated.article.title, slug, summary: generated.article.summary, content_html: generated.article.content_html, seo_description: generated.article.seo_description, keywords: generated.article.keywords });
        if (trError) throw new Error(trError.message);
        for (const language of languages) {
            try {
                const translated = await import('@/utils/ai').then(({ callAIFallback }) => callAIFallback(`You are a professional SEO translator. ${language.instruction} Preserve HTML tags and return valid JSON only with title, summary, content_html, seo_description, keywords.`, JSON.stringify(generated.article), true, settings));
                const value = translated ? JSON.parse(translated) : null;
                if (value) await supabase.from('article_translations').insert({ article_id: article.id, language_code: language.code, title: value.title, slug: `${slug}-${language.code}`, summary: value.summary, content_html: value.content_html, seo_description: value.seo_description, keywords: value.keywords });
            } catch (error) { console.error(`UPM ${language.code} translation failed`, error); }
        }
        await supabase.from('ai_content_generation_runs').update({ status: 'completed', article_id: article.id, keyword: `${generated.article.topic || keyword} | SEO ${generated.seo.score}/100` }).eq('id', run.id);
        return NextResponse.json({ success: true, message: 'UPM kaynaklarından yeni taslak makale oluşturuldu.', articleId: article.id, seoScore: generated.seo.score, fingerprint: watch.fingerprint });
    } catch (error: any) {
        await supabase.from('ai_content_generation_runs').update({ status: 'failed', error_message: error.message }).eq('id', run.id);
        return NextResponse.json({ error: error.message || 'UPM izleme görevi başarısız.' }, { status: 500 });
    }
}
