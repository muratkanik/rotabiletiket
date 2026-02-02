import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils'; // Assuming this exists or I'll use simple date formatting

export default async function AdminArticlesPage() {
    const supabase = await createClient();
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
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

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 w-20">Görsel</th>
                            <th className="p-4 font-semibold text-slate-700">Başlık</th>
                            <th className="p-4 font-semibold text-slate-700">Yazar</th>
                            <th className="p-4 font-semibold text-slate-700">Durum</th>
                            <th className="p-4 font-semibold text-slate-700">Tarih</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {articles && articles.length > 0 ? (
                            articles.map((article: any) => (
                                <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="relative h-12 w-16 bg-slate-100 rounded overflow-hidden">
                                            {article.image_url ? (
                                                <Image
                                                    src={article.image_url.startsWith('http') || article.image_url.startsWith('/') ? article.image_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${article.image_url}`}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-300">
                                                    <span className="text-xs">Yok</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">
                                        {article.title}
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{article.slug}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">{article.author || '-'}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.is_published
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {article.is_published ? 'Yayında' : 'Taslak'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {article.published_at ? new Date(article.published_at).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/bilgi-bankasi/${article.slug}`} target="_blank">
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/articles/${article.id}`}>
                                                    <Pencil className="h-4 w-4 mr-1" /> Düzenle
                                                </Link>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Henüz hiç makale eklenmemiş.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
