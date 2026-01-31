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

export async function getArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    return (data as Article[]) || [];
}

export async function getArticle(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching article:', error);
        return null;
    }

    return (data as Article) || null;
}
