'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { callAIFallback } from '@/utils/ai';

function parseSpecs(value: string) {
    return Object.fromEntries(
        value.split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const separator = line.indexOf(':');
                return separator === -1
                    ? [line, '']
                    : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
            })
    );
}

function parseProofPoints(value: string) {
    return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function text(formData: FormData, key: string) {
    return String(formData.get(key) || '').trim();
}

const targetLanguages = ['en', 'de', 'fr', 'ar', 'es', 'it'];

async function autoTranslateSolution(supabase: any, solutionId: string, source: Record<string, any>) {
    const { data: settings } = await supabase.from('meta_settings').select('openai_api_key, gemini_api_key, xai_api_key').single();
    if (!settings?.openai_api_key && !process.env.OPENROUTER_API_KEY) return;
    const schema = targetLanguages.map((language) => `"${language}": {"title":"","slug":"","excerpt":"","content_html":"","technical_specs":{},"seo_title":"","seo_description":"","keywords":""}`).join(',');
    const raw = await callAIFallback(
        'You are a professional B2B technical SEO translator. Translate the Turkish source into every requested language. Preserve HTML tags and technical meaning. Do not invent certifications, test results or product claims. Return valid JSON only.',
        `Translate this Turkish technical solution into English, German, French, Arabic, Spanish and Italian. Keep each translation natural for industrial label buyers. Use short lowercase Latin slugs. JSON schema: {${schema}}\nSOURCE: ${JSON.stringify(source)}`,
        true,
        settings,
    );
    if (!raw) return;
    const translations = JSON.parse(raw);
    for (const language of targetLanguages) {
        const value = translations[language];
        if (!value?.title || !value?.slug) continue;
        const result = await supabase.from('solution_page_translations').upsert({
            solution_page_id: solutionId,
            language_code: language,
            title: value.title,
            slug: value.slug,
            excerpt: value.excerpt || null,
            content_html: value.content_html || null,
            technical_specs: value.technical_specs || {},
            seo_title: value.seo_title || null,
            seo_description: value.seo_description || null,
            keywords: value.keywords || null,
        }, { onConflict: 'solution_page_id,language_code' });
        if (result.error) console.error(`Solution ${language} translation failed`, result.error);
    }
}

export async function saveSolution(_previousState: unknown, formData: FormData) {
    const supabase = createAdminClient();
    if (!supabase) return { error: 'Supabase admin configuration is missing.' };
    const id = text(formData, 'id');
    const slug = text(formData, 'slug');
    const title = text(formData, 'title');

    if (!slug || !title) return { error: 'Slug and Turkish/base title are required.' };

    const payload = {
        slug,
        page_kind: text(formData, 'page_kind') || 'solution',
        title,
        excerpt: text(formData, 'excerpt') || null,
        content_html: text(formData, 'content_html') || null,
        technical_specs: parseSpecs(text(formData, 'technical_specs')),
        proof_points: parseProofPoints(text(formData, 'proof_points')),
        seo_title: text(formData, 'seo_title') || null,
        seo_description: text(formData, 'seo_description') || null,
        keywords: text(formData, 'keywords') || null,
        is_published: formData.get('is_published') === 'on',
        display_order: Number(formData.get('display_order') || 0),
    };

    const result = id
        ? await supabase.from('solution_pages').update(payload).eq('id', id).select('id').single()
        : await supabase.from('solution_pages').insert(payload).select('id').single();

    if (result.error || !result.data) {
        return { error: result.error?.message || 'Solution could not be saved.' };
    }

    const solutionId = result.data.id;
    if (formData.get('auto_translate') === 'on') {
        try {
            await autoTranslateSolution(supabase, solutionId, {
                title,
                slug,
                excerpt: text(formData, 'excerpt'),
                content_html: text(formData, 'content_html'),
                technical_specs: parseSpecs(text(formData, 'technical_specs')),
                seo_title: text(formData, 'seo_title'),
                seo_description: text(formData, 'seo_description'),
                keywords: text(formData, 'keywords'),
            });
        } catch (error) {
            console.error('Automatic solution translation failed', error);
        }
    }

    for (const language of ['de', 'en']) {
        const languageTitle = text(formData, `${language}_title`);
        const languageSlug = text(formData, `${language}_slug`);
        if (!languageTitle || !languageSlug) continue;

        const translationResult = await supabase.from('solution_page_translations').upsert({
            solution_page_id: solutionId,
            language_code: language,
            title: languageTitle,
            slug: languageSlug,
            excerpt: text(formData, `${language}_excerpt`) || null,
            content_html: text(formData, `${language}_content_html`) || null,
            seo_title: text(formData, `${language}_seo_title`) || null,
            seo_description: text(formData, `${language}_seo_description`) || null,
            keywords: text(formData, `${language}_keywords`) || null,
        }, { onConflict: 'solution_page_id,language_code' });

        if (translationResult.error) return { error: translationResult.error.message };
    }

    revalidatePath('/admin/solutions');
    revalidatePath('/[locale]/cozumler', 'page');
    revalidatePath('/[locale]/cozumler/[slug]', 'page');
    redirect('/admin/solutions');
}

export async function deleteSolution(id: string) {
    const supabase = createAdminClient();
    if (!supabase) return { error: 'Supabase admin configuration is missing.' };
    const { error } = await supabase.from('solution_pages').delete().eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/admin/solutions');
    revalidatePath('/[locale]/cozumler', 'page');
    return { success: true };
}

export async function deleteSolutionAction(formData: FormData) {
    const result = await deleteSolution(String(formData.get('id') || ''));
    if (result.error) throw new Error(result.error);
    redirect('/admin/solutions');
}

export async function bulkUpdateSolutions(ids: string[], isPublished: boolean) {
    const supabase = createAdminClient();
    if (!supabase) return { error: 'Supabase admin configuration is missing.' };

    const validIds = ids.filter(Boolean);
    if (validIds.length === 0) return { error: 'En az bir sayfa seçmelisiniz.' };

    const { error } = await supabase
        .from('solution_pages')
        .update({ is_published: isPublished })
        .in('id', validIds);

    if (error) return { error: error.message };

    revalidatePath('/admin/solutions');
    revalidatePath('/[locale]/cozumler', 'page');
    revalidatePath('/[locale]/cozumler/[slug]', 'page');
    return { success: true, count: validIds.length };
}
