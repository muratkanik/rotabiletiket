import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateSolutionContent } from '@/lib/ai/solution-generator';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase admin yapılandırması eksik.' }, { status: 500 });
    const runDate = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase.from('ai_content_generation_runs').select('id,status,solution_page_id').eq('run_date', runDate).eq('content_type', 'solution_page').maybeSingle();
    if (existing) return NextResponse.json({ success: true, message: 'Bugünün günlük taslağı zaten işlendi.', run: existing });

    const { data: categories } = await supabase.from('categories').select('title').order('title').limit(100);
    const topic = categories?.length ? `${categories[(new Date().getUTCDate()) % categories.length].title} için endüstriyel etiketleme çözümleri` : 'endüstriyel termal etiket çözümleri';
    const { data: run, error: runError } = await supabase.from('ai_content_generation_runs').insert({ run_date: runDate, content_type: 'solution_page', keyword: topic }).select('id').single();
    if (runError || !run) return NextResponse.json({ error: runError?.message || 'Günlük çalışma kilidi oluşturulamadı.' }, { status: 409 });

    try {
        const { data: settings } = await supabase.from('meta_settings').select('openai_api_key, serper_api_key, gemini_api_key, xai_api_key').single();
        const generated = await generateSolutionContent(topic, settings || {});
        const { data: page, error: pageError } = await supabase.from('solution_pages').insert({
            slug: `${generated.base.slug}-${runDate}`,
            page_kind: 'solution', title: generated.base.title, excerpt: generated.base.excerpt, content_html: generated.base.content_html,
            technical_specs: generated.base.technical_specs || {}, proof_points: generated.base.proof_points || [], seo_title: generated.base.seo_title,
            seo_description: generated.base.seo_description, keywords: generated.base.keywords, is_published: false, display_order: 0,
        }).select('id').single();
        if (pageError || !page) throw new Error(pageError?.message || 'Taslak kaydedilemedi.');
        for (const language of ['de', 'en'] as const) {
            const translation = generated[language];
            const { error } = await supabase.from('solution_page_translations').insert({ solution_page_id: page.id, language_code: language, ...translation });
            if (error) throw new Error(error.message);
        }
        await supabase.from('ai_content_generation_runs').update({ status: 'completed', solution_page_id: page.id }).eq('id', run.id);
        return NextResponse.json({ success: true, message: 'Günlük teknik çözüm taslağı oluşturuldu.', solutionPageId: page.id, keyword: topic });
    } catch (error: any) {
        await supabase.from('ai_content_generation_runs').update({ status: 'failed', error_message: error.message }).eq('id', run.id);
        return NextResponse.json({ error: error.message || 'Günlük taslak üretilemedi.' }, { status: 500 });
    }
}
