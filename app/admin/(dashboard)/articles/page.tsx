import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ClientArticlesPage from './ClientArticlesPage';

export default async function AdminArticlesPage() {
    const supabase = await createClient();
    const { data: articles, error } = await supabase
        .from('articles')
        .select(`
            *,
            article_translations (
                language_code,
                title,
                summary,
                content_html,
                seo_description,
                keywords
            )
        `)
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Articles fetch error:", error);
        return (
            <div className="p-8 text-red-500">
                <p className="font-bold">Hata: Makaleler yüklenemedi.</p>
                <p className="text-sm mt-2 font-mono bg-red-50 p-2 rounded">{error.message}</p>
                <p className="text-xs text-red-400 mt-1">Code: {error.code}, Details: {error.details}</p>
            </div>
        );
    }

    return (
        <ClientArticlesPage initialArticles={articles || []} />
    );
}
