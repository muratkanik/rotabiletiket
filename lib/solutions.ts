import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SolutionPage = {
    id: string;
    slug: string;
    page_kind: 'solution' | 'industry' | 'guide';
    title: string;
    excerpt: string | null;
    content_html: string | null;
    technical_specs: Record<string, string>;
    proof_points: string[];
    image_url: string | null;
    seo_title: string | null;
    seo_description: string | null;
    keywords: string | null;
    is_published: boolean;
    display_order: number;
    updated_at: string;
};

type SolutionTranslation = Partial<SolutionPage> & {
    solution_page_id: string;
    language_code: string;
};

function mergeTranslation(
    page: SolutionPage,
    translations: SolutionTranslation[] | null,
    locale: string
): SolutionPage {
    const translation = translations?.find((item) => item.language_code === locale)
        || translations?.find((item) => item.language_code === 'en');

    if (!translation) return page;

    return {
        ...page,
        title: translation.title || page.title,
        slug: translation.slug || page.slug,
        excerpt: translation.excerpt ?? page.excerpt,
        content_html: translation.content_html ?? page.content_html,
        technical_specs: translation.technical_specs || page.technical_specs,
        seo_title: translation.seo_title || page.seo_title,
        seo_description: translation.seo_description || page.seo_description,
        keywords: translation.keywords || page.keywords,
    };
}

export async function getSolutions(locale: string): Promise<SolutionPage[]> {
    const { data, error } = await supabase
        .from('solution_pages')
        .select('*, solution_page_translations(*)')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .order('title', { ascending: true });

    if (error || !data) {
        if (error) console.error('Error fetching solution pages:', error);
        return [];
    }

    return data.map((page) => mergeTranslation(
        page as SolutionPage,
        page.solution_page_translations as SolutionTranslation[] | null,
        locale
    ));
}

export async function getSolution(slug: string, locale: string): Promise<SolutionPage | null> {
    const { data: basePage } = await supabase
        .from('solution_pages')
        .select('*, solution_page_translations(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

    if (basePage) {
        return mergeTranslation(
            basePage as SolutionPage,
            basePage.solution_page_translations as SolutionTranslation[] | null,
            locale
        );
    }

    const { data: localizedMatch } = await supabase
        .from('solution_page_translations')
        .select('solution_page_id')
        .eq('language_code', locale)
        .eq('slug', slug)
        .maybeSingle();

    if (!localizedMatch) return null;

    const { data: localizedPage } = await supabase
        .from('solution_pages')
        .select('*, solution_page_translations(*)')
        .eq('id', localizedMatch.solution_page_id)
        .eq('is_published', true)
        .maybeSingle();

    if (!localizedPage) return null;

    return mergeTranslation(
        localizedPage as SolutionPage,
        localizedPage.solution_page_translations as SolutionTranslation[] | null,
        locale
    );
}
