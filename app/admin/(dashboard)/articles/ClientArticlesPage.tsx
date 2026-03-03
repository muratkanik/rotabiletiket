"use client"

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Eye, Sparkles, ArrowUpDown, Link2 } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { calculateSeoScore } from '@/utils/seo-helper';
import { HackerScreenModal } from './HackerScreenModal';

export default function ClientArticlesPage({ initialArticles }: { initialArticles: any[] }) {
    const [articles, setArticles] = useState(initialArticles);
    const [enhancingArticleId, setEnhancingArticleId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isHackerScreenOpen, setIsHackerScreenOpen] = useState(false);

    // Bulk Linking States
    const [bulkLogs, setBulkLogs] = useState<string[]>([]);
    const [isBulkLinkScreenOpen, setIsBulkLinkScreenOpen] = useState(false);
    const [isBulkLinking, setIsBulkLinking] = useState(false);

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const processedArticles = useMemo(() => {
        return articles.map(article => {
            const trData = article.article_translations?.find((t: any) => t.language_code === 'tr');
            const translatedTitle = trData?.title || article.title || '';
            const desc = trData?.seo_description || trData?.summary || article.summary || '';
            const content = trData?.content_html || article.content_html || '';
            const keyword = trData?.keywords?.split(',')[0] || '';
            const { score } = calculateSeoScore(translatedTitle, desc, content, keyword);
            return { ...article, _seoScore: score, _translatedTitle: translatedTitle };
        });
    }, [articles]);

    const sortedArticles = useMemo(() => {
        let sortable = [...processedArticles];
        if (sortConfig !== null) {
            sortable.sort((a, b) => {
                let aVal, bVal;
                if (sortConfig.key === 'title') {
                    aVal = a._translatedTitle.toLowerCase();
                    bVal = b._translatedTitle.toLowerCase();
                } else if (sortConfig.key === 'seo_score') {
                    aVal = a._seoScore;
                    bVal = b._seoScore;
                } else if (sortConfig.key === 'status') {
                    aVal = a.is_published ? 1 : 0;
                    bVal = b.is_published ? 1 : 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [processedArticles, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleEnhance = async (articleId: string, articleTitle: string) => {
        setEnhancingArticleId(articleId);
        setLogs([`> BAŞLATILIYOR: "${articleTitle}" için AI Enhance süreci...`]);
        setIsHackerScreenOpen(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setLogs(prev => [...prev, `> SERP API Bağlantısı Kuruluyor...`]);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setLogs(prev => [...prev, `> OpenAI'a veri gönderiliyor... İçerik yeniden yazılıyor...`]);

            const res = await fetch(`/api/ai/enhance-article`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ articleId, mock: false })
            });

            if (!res.ok) throw new Error("API Hatası");
            const data = await res.json();

            setLogs(prev => [...prev, `> Çeviriler hazırlanıyor...`]);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLogs(prev => [...prev, `> İŞLEM BAŞARILI. Veritabanı güncellendi! Yönlendiriliyorsunuz...`]);
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Reload page or update state after user closes manually (optional)
            // window.location.reload();

        } catch (error: any) {
            setLogs(prev => [...prev, `> KRITIK HATA: ${error.message}`]);
            setEnhancingArticleId(null);
        }
    };

    const handleBulkLink = async () => {
        setIsBulkLinking(true);
        setBulkLogs([`> BAŞLATILIYOR: Toplu İç Linkleme süreci...`]);
        setIsBulkLinkScreenOpen(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setBulkLogs(prev => [...prev, `> Veritabanından Anahtar Kelimeler (Keywords) çekiliyor...`]);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setBulkLogs(prev => [...prev, `> Makale ve Ürün URL'leri eşleştiriliyor... Makale içerikleri taranıyor...`]);

            const res = await fetch(`/api/articles/bulk-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("API Hatası: " + res.statusText);
            const data = await res.json();

            setBulkLogs(prev => [...prev, `> Eşleştirmeler tamamlandı ve linkler eklendi.`]);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (data.success && data.stats) {
                setBulkLogs(prev => [
                    ...prev,
                    `> İSTATİSTİKLER:`,
                    `   - Bulunan Anahtar Kelime: ${data.stats.totalKeywordsFound}`,
                    `   - Güncellenen Makale Sayısı: ${data.stats.articlesUpdated}`,
                    `   - Oluşturulan Toplam Link: ${data.stats.totalLinksCreated}`
                ]);
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            setBulkLogs(prev => [...prev, `> İŞLEM BAŞARILI. Tüm makaleler için Ağ (Network) örüldü!`]);

        } catch (error: any) {
            setBulkLogs(prev => [...prev, `> KRITIK HATA: ${error.message}`]);
        } finally {
            setIsBulkLinking(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Bilgi Bankası</h1>
                    <p className="text-slate-500 mt-1">Makaleleri yönetin, SEO optimizasyonu ve AI destekli geliştirme yapın.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleBulkLink}
                        disabled={isBulkLinking}
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        <Link2 className="mr-2 h-4 w-4" /> Toplu İç Linkleme
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin/articles/new">
                            <Plus className="mr-2 h-4 w-4" /> Yeni Makale
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 w-20">Görsel</th>
                            <th className="p-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => requestSort('title')}>
                                <div className="flex items-center gap-1">Başlık {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : <ArrowUpDown className="h-3 w-3 text-slate-400" />}</div>
                            </th>
                            <th className="p-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => requestSort('seo_score')}>
                                <div className="flex items-center gap-1">SEO Skoru {sortConfig?.key === 'seo_score' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : <ArrowUpDown className="h-3 w-3 text-slate-400" />}</div>
                            </th>
                            <th className="p-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => requestSort('status')}>
                                <div className="flex items-center gap-1">Durum {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : <ArrowUpDown className="h-3 w-3 text-slate-400" />}</div>
                            </th>
                            <th className="p-4 font-semibold text-slate-700 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sortedArticles && sortedArticles.length > 0 ? (
                            sortedArticles.map((article: any) => (
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
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full transition-all",
                                                        article._seoScore >= 80 ? "bg-green-500" : article._seoScore >= 50 ? "bg-orange-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${article._seoScore}%` }}
                                                />
                                            </div>
                                            <span className={cn("text-xs font-bold",
                                                article._seoScore >= 80 ? "text-green-600" : article._seoScore >= 50 ? "text-orange-600" : "text-red-600"
                                            )}>
                                                {article._seoScore}
                                            </span>
                                        </div>
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

            {/* AI Enhance Hacker Screen */}
            <HackerScreenModal
                isOpen={isHackerScreenOpen}
                logs={logs}
                onClose={() => setIsHackerScreenOpen(false)}
                title="AI SERP ENHANCER OVERRIDE"
            />

            {/* Bulk Internal Linking Hacker Screen */}
            <HackerScreenModal
                isOpen={isBulkLinkScreenOpen}
                logs={bulkLogs}
                onClose={() => {
                    setIsBulkLinkScreenOpen(false);
                    // It's a good idea to refresh the page after bulk linking to see updated SEO scores or content
                    window.location.reload();
                }}
                title="INTERNAL LINKING MATRIX BUILDER"
            />
        </div>
    );
}
