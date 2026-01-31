import { createClient } from '@/utils/supabase/server';

export interface Article {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content_html: string | null;
    image_url: string | null;
    is_published: boolean;
    created_at: string;
}

export async function getArticles(): Promise<Article[]> {
    const supabase = await createClient();
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
    const supabase = await createClient();
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
