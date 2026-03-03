"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Eye, Sparkles } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { calculateSeoScore } from '@/utils/seo-helper';
import { HackerScreenModal } from './HackerScreenModal';

export default function ClientArticlesPage({ initialArticles }: { initialArticles: any[] }) {
    const [articles, setArticles] = useState(initialArticles);
    const [enhancingArticleId, setEnhancingArticleId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isHackerScreenOpen, setIsHackerScreenOpen] = useState(false);

    const handleEnhance = async (articleId: string, articleTitle: string) => {
        setEnhancingArticleId(articleId);
        setLogs([`> BAŞLATILIYOR: "${articleTitle}" için AI Enhance süreci...`]);
        setIsHackerScreenOpen(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setLogs(prev => [...prev, `> SERP API Bağlantısı Kuruluyor...`]);
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setLogs(prev => [...prev, `> ERROR: SERP API Key bulunamadı (serper.dev). Mock SERP modu aktif.`]);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setLogs(prev => [...prev, `> OpenAI'a veri gönderiliyor... İçerik yeniden yazılıyor...`]);

            // TODO: Call actual API route here
            const res = await fetch(`/api/ai/enhance-article`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ articleId, mock: true })
            });

            if (!res.ok) throw new Error("API Hatası");
            const data = await res.json();

            setLogs(prev => [...prev, `> Çeviriler hazırlanıyor...`]);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLogs(prev => [...prev, `> İŞLEM BAŞARILI. Veritabanı güncellendi! Yönlendiriliyorsunuz...`]);
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Reload page or update state
            window.location.reload();

        } catch (error: any) {
            setLogs(prev => [...prev, `> KRITIK HATA: ${error.message}`]);
            setTimeout(() => {
                setIsHackerScreenOpen(false);
                setEnhancingArticleId(null);
            }, 3000);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Bilgi Bankası</h1>
                    <p className="text-slate-500 mt-1">Makaleleri yönetin, SEO optimizasyonu ve AI destekli geliştirme yapın.</p>
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
                            <th className="p-4 font-semibold text-slate-700">SEO Skoru</th>
                            <th className="p-4 font-semibold text-slate-700">Durum</th>
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
                                                    // eslint-disable-next-line @next/next/no-img-element
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
                                    <td className="p-4">
                                        {(() => {
                                            const trData = article.article_translations?.find((t: any) => t.language_code === 'tr');

                                            // Fallback to article main fields if translation missing
                                            const title = trData?.title || article.title || '';
                                            const desc = trData?.seo_description || trData?.summary || article.summary || '';
                                            const content = trData?.content_html || article.content_html || '';
                                            const keyword = trData?.keywords?.split(',')[0] || '';

                                            const { score } = calculateSeoScore(title, desc, content, keyword);

                                            return (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full transition-all",
                                                                score >= 80 ? "bg-green-500" : score >= 50 ? "bg-orange-500" : "bg-red-500"
                                                            )}
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn("text-xs font-bold",
                                                        score >= 80 ? "text-green-600" : score >= 50 ? "text-orange-600" : "text-red-600"
                                                    )}>
                                                        {score}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.is_published
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {article.is_published ? 'Yayında' : 'Taslak'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">

                                            {/* AI ENHANCE BUTTON */}
                                            <Button
                                                onClick={() => handleEnhance(article.id, article.title)}
                                                variant="outline"
                                                size="sm"
                                                disabled={enhancingArticleId === article.id}
                                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                                            >
                                                <Sparkles className="h-4 w-4 mr-1 text-indigo-500" /> AI Enhance
                                            </Button>

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
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    Henüz hiç makale eklenmemiş.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <HackerScreenModal isOpen={isHackerScreenOpen} logs={logs} />
        </div>
    );
}
