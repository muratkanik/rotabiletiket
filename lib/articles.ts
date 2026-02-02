import { createClient } from '@supabase/supabase-js';

// Use a static client that doesn't rely on request cookies
// This is safe for public data and necessary for generateStaticParams
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Article {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content_html: string | null;
    image_url: string | null;
    is_published: boolean;
    created_at: string;
    updated_at?: string;
}

export async function getArticles(locale: string = 'tr'): Promise<Article[]> {
    // 1. Fetch all published base articles
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    if (locale === 'tr') {
        return (articles as Article[]) || [];
    }

    // 2. If locale is not 'tr', fetch translations for these articles
    const articleIds = articles.map(a => a.id);
    const { data: translations } = await supabase
        .from('article_translations')
        .select('*')
        .in('article_id', articleIds)
        .eq('language_code', locale);

    // 3. Merge translations
    const translatedArticles = articles.map(article => {
        const translation = translations?.find(t => t.article_id === article.id);
        if (translation) {
            return {
                ...article,
                title: translation.title,
                slug: translation.slug,
                summary: translation.summary,
                content_html: translation.content_html,
                // Keep image_url from base
            };
        }
        return article;
    });

    return translatedArticles as Article[];
}

export async function getArticle(slug: string, locale: string = 'tr'): Promise<Article | null> {
    // 1. Try to find by slug in base table (for TR)
    let { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    // 2. If not found in base, try finding in translations table (for other langs)
    if (!article && locale !== 'tr') {
        const { data: translationWithId } = await supabase
            .from('article_translations')
            .select('article_id')
            .eq('slug', slug)
            .eq('language_code', locale)
            .maybeSingle();

        if (translationWithId) {
            const { data: baseArticle } = await supabase
                .from('articles')
                .select('*')
                .eq('id', translationWithId.article_id)
                .maybeSingle();
            article = baseArticle;
        }
    }

    if (!article) {
        return null;
    }

    if (locale === 'tr') {
        return article as Article;
    }

    // 3. Fetch translation if locale is not TR
    const { data: translation } = await supabase
        .from('article_translations')
        .select('*')
        .eq('article_id', article.id)
        .eq('language_code', locale)
        .single();

    if (translation) {
        return {
            ...article,
            title: translation.title,
            slug: translation.slug,
            summary: translation.summary,
            content_html: translation.content_html,
            // Keep image_url from base
        } as Article;
    }

    return article as Article;
}
