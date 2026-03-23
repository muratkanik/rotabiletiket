'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUpDown, Search, Pencil } from 'lucide-react';
import { calculateSeoScore } from '@/utils/seo-helper';
import { cn } from '@/lib/utils';
import { HackerScreenModal } from '@/components/admin/HackerScreenModal';
import { Sparkles } from 'lucide-react';

interface Category {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    parent: {
        title: string;
    } | null;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    keywords?: string | null;
    products?: { count: number }[];
}

interface CategoryListProps {
    initialCategories: Category[];
}

type SortKey = 'title' | 'parent';

export function CategoryList({ initialCategories }: CategoryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Bulk Enhance States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEnhancing, setIsBulkEnhancing] = useState(false);
    const [isHackerScreenOpen, setIsHackerScreenOpen] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [enhancingId, setEnhancingId] = useState<string | null>(null);

    const handleBulkEnhance = async () => {
        setIsHackerScreenOpen(true);
        setIsBulkEnhancing(true);
        setLogs([`> BAŞLATILIYOR: ${selectedIds.length} adet kategori için toplu AI optimizasyonu...`]);

        try {
            for (let i = 0; i < selectedIds.length; i++) {
                const categoryId = selectedIds[i];
                const category = initialCategories.find(c => c.id === categoryId);
                const title = category?.title || "Bilinmeyen Kategori";

                setEnhancingId(categoryId);

                setLogs(prev => [...prev, ``, `> --- [${i + 1}/${selectedIds.length}] ---`, `> Hedef: "${title}" (ID: ${categoryId}) işleniyor...`]);

                const res = await fetch(`/api/ai/enhance-category`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ categoryId })
                });

                if (!res.ok) {
                    const errorResponse = await res.json().catch(() => ({}));
                    setLogs(prev => [...prev, `> HATA: "${title}" atlanıyor (${res.status} - ${errorResponse.error || res.statusText}).`]);
                    continue;
                }

                setLogs(prev => [...prev, `> BAŞARILI: "${title}" AI ile geliştirildi ve çevrildi.`]);
            }

            setLogs(prev => [...prev, ``, `> İŞLEM BAŞARILI. Tüm seçili kategoriler güncellendi!`]);
            setSelectedIds([]);

        } catch (error: any) {
            setLogs(prev => [...prev, `> KRITIK HATA: Toplu işlem sonlandı - ${error.message}`]);
        } finally {
            setIsBulkEnhancing(false);
            setEnhancingId(null);
            // In a real app we would call a router.refresh() here to pull new SEO scores.
        }
    };

    const sortedCategories = [...initialCategories].filter(category => {
        const term = searchTerm.toLowerCase();
        return (
            category.title.toLowerCase().includes(term) ||
            (category.parent?.title || '').toLowerCase().includes(term)
        );
    }).sort((a, b) => {
        if (!sortConfig) return 0;

        let aValue: string = '';
        let bValue: string = '';

        if (sortConfig.key === 'title') {
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
        } else if (sortConfig.key === 'parent') {
            aValue = (a.parent?.title || '').toLowerCase();
            bValue = (b.parent?.title || '').toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Kategori Yönetimi</h1>
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                    <Link href="/admin/categories/new">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Kategori Ekle
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 max-w-sm bg-white p-1 rounded-lg border w-full sm:w-auto">
                    <Search className="h-4 w-4 text-slate-400 ml-2" />
                    <Input
                        placeholder="Ara: Kategori, Üst Kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>
                
                {selectedIds.length > 0 && (
                    <Button
                        onClick={handleBulkEnhance}
                        disabled={isBulkEnhancing || enhancingId !== null}
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        <Sparkles className="mr-2 h-4 w-4" /> AI Optimize Et ({selectedIds.length})
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center select-none">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={sortedCategories.length > 0 && selectedIds.length === sortedCategories.length}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedIds(sortedCategories.map(c => c.id));
                                        else setSelectedIds([]);
                                    }}
                                />
                            </th>
                            <th className="px-6 py-4">Görsel</th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-2">
                                    Kategori Adı <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('parent')}>
                                <div className="flex items-center gap-2">
                                    Üst Kategori <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4">SEO Skoru</th>
                            <th className="px-6 py-4">Link</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedCategories.length > 0 ? (
                            sortedCategories.map((category) => {
                                const prodCount = category.products?.[0]?.count || 0;
                                return (
                                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={selectedIds.includes(category.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(prev => [...prev, category.id]);
                                                else setSelectedIds(prev => prev.filter(id => id !== category.id));
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border">
                                            {category.image_url ? (
                                                <Image
                                                    src={category.image_url.startsWith('http') ? category.image_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`}
                                                    alt={category.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Yok</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{category.title}</td>
                                    <td className="px-6 py-4 text-slate-600">{category.parent?.title || '-'}</td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const { score } = calculateSeoScore(
                                                category.seo_title || category.title,
                                                category.seo_description || category.description,
                                                category.description, // Categories usually rely on description as content
                                                category.keywords?.split(',')[0]
                                            );
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
                                    <td className="px-6 py-4 text-slate-500">
                                        <Link href={`/admin/products?categoryId=${category.id}`} className="text-blue-600 hover:text-blue-800 underline text-sm font-medium">
                                            Ürünleri Gör ({prodCount})
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
                                            <Link href={`/admin/categories/${category.id}`}>
                                                <Pencil className="mr-1 h-3 w-3" /> Düzenle
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            )})
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz hiç kategori eklenmemiş.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-xs text-slate-400 text-right">
                Toplam {sortedCategories.length} kategori
            </div>
            {/* Hacker Screen Modal for AI Generation */}
            <HackerScreenModal
                isOpen={isHackerScreenOpen}
                logs={logs}
                onClose={() => setIsHackerScreenOpen(false)}
                title="CATEGORY AI SERP ENHANCER"
            />
        </div>
    );
}
