'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';

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
