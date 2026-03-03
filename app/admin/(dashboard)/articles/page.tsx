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
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Bilgi Bankası</h1>
                    <p className="text-slate-500 mt-1">Makaleleri yönetin ve düzenleyin</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/articles/new">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Makale
                    </Link>
                </Button>
            </div>

            <ClientArticlesPage initialArticles={articles || []} />
        </div>
    );
}
