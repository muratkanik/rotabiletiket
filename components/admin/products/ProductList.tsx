'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Eye, ArrowUpDown, Search, Sparkles, GripVertical, Save } from 'lucide-react';
import { calculateSeoScore } from '@/utils/seo-helper';
import { cn } from '@/lib/utils';
import { HackerScreenModal } from '@/components/admin/HackerScreenModal';
import { updateProductsOrder } from '@/app/admin/(dashboard)/products/actions';
import { toast } from 'sonner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Product {
    id: string;
    title: string;
    slug: string;
    categories: {
        id: string;
        title: string;
        slug: string;
    } | null;
    category_id?: string;
    is_published?: boolean;
    description_html?: string | null;
    seo_description?: string | null;
    keywords?: string | null;
    display_order?: number;
}

interface ProductListProps {
    initialProducts: Product[];
    categories: { id: string; title: string; slug: string }[];
}

type SortKey = 'title' | 'category' | 'status' | 'seo_score' | 'display_order';

function SortableTableRow({ product, selectedIds, handleSelect, isDragEnabled, onOrderChange }: { 
    product: Product & { _seoScore: number }, 
    selectedIds: string[], 
    handleSelect: (id: string, selected: boolean) => void,
    isDragEnabled: boolean,
    onOrderChange: (id: string, newOrder: number) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id, disabled: !isDragEnabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? 'relative' as const : undefined,
    };

    return (
        <tr ref={setNodeRef} style={style} className={cn("hover:bg-slate-50/50 transition-colors bg-white", isDragging && "shadow-lg border border-blue-500 rounded-lg")}>
            <td className="px-6 py-4 text-center">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIds.includes(product.id)}
                    onChange={(e) => handleSelect(product.id, e.target.checked)}
                />
            </td>
            <td className="px-4 py-4 w-10">
                <div {...attributes} {...listeners} className={cn("cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600", !isDragEnabled && "hidden")}>
                    <GripVertical size={18} />
                </div>
            </td>
            <td className="px-4 py-4 w-24">
                <Input 
                    type="number" 
                    value={product.display_order ?? 0}
                    onChange={(e) => onOrderChange(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 text-center h-8"
                />
            </td>
            <td className="px-6 py-4 font-medium text-slate-900">
                {product.title}
            </td>
            <td className="px-6 py-4 text-slate-600">
                {product.categories?.title || '-'}
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(product.is_published ?? true)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {(product.is_published ?? true) ? 'Yayında' : 'Pasif'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all",
                                product._seoScore >= 80 ? "bg-green-500" : product._seoScore >= 50 ? "bg-orange-500" : "bg-red-500"
                            )}
                            style={{ width: `${product._seoScore}%` }}
                        />
                    </div>
                    <span className={cn("text-xs font-bold",
                        product._seoScore >= 80 ? "text-green-600" : product._seoScore >= 50 ? "text-orange-600" : "text-red-600"
                    )}>
                        {product._seoScore}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/urunler/${product.categories?.slug}/${product.slug}`} target="_blank">
                            <Eye size={16} className="text-slate-400 hover:text-blue-600" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                            <Pencil size={16} className="text-slate-400 hover:text-orange-600" />
                        </Link>
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export function ProductList({ initialProducts, categories }: ProductListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'display_order', direction: 'asc' });
    const [products, setProducts] = useState(initialProducts);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    const processedProducts = useMemo(() => {
        return products.map(product => {
            const { score } = calculateSeoScore(
                product.title,
                product.seo_description,
                product.description_html,
                product.keywords?.split(',')[0]
            );
            return { ...product, _seoScore: score };
        });
    }, [products]);

    // Bulk Enhance States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEnhancing, setIsBulkEnhancing] = useState(false);
    const [isHackerScreenOpen, setIsHackerScreenOpen] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [enhancingProductId, setEnhancingProductId] = useState<string | null>(null);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = useMemo(() => {
        return [...processedProducts].filter(product => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = product.title.toLowerCase().includes(term) || (product.categories?.title || '').toLowerCase().includes(term);
            const matchesCategory = selectedCategory === 'ALL' || product.categories?.id === selectedCategory;
            
            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            if (!sortConfig) return 0;

            let aValue: string | boolean | number = '';
            let bValue: string | boolean | number = '';

            if (sortConfig.key === 'title') {
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
            } else if (sortConfig.key === 'category') {
                aValue = (a.categories?.title || '').toLowerCase();
                bValue = (b.categories?.title || '').toLowerCase();
            } else if (sortConfig.key === 'status') {
                aValue = a.is_published ?? true;
                bValue = b.is_published ?? true;
            } else if (sortConfig.key === 'seo_score') {
                aValue = a._seoScore;
                bValue = b._seoScore;
            } else if (sortConfig.key === 'display_order') {
                aValue = a.display_order ?? 0;
                bValue = b.display_order ?? 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [processedProducts, searchTerm, selectedCategory, sortConfig]);

    const handleBulkEnhance = async () => {
        setIsHackerScreenOpen(true);
        setIsBulkEnhancing(true);
        setLogs([`> BAŞLATILIYOR: ${selectedIds.length} adet ürün için toplu E-Ticaret AI optimizasyonu...`]);

        try {
            for (let i = 0; i < selectedIds.length; i++) {
                const productId = selectedIds[i];
                const product = initialProducts.find(p => p.id === productId);
                const productTitle = product?.title || "Bilinmeyen Ürün";

                setEnhancingProductId(productId); // Visual feedback

                setLogs(prev => [...prev, ``, `> --- [${i + 1}/${selectedIds.length}] ---`, `> Hedef Ürün: "${productTitle}" (ID: ${productId}) işleniyor...`]);

                const res = await fetch(`/api/ai/enhance-product`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId })
                });

                if (!res.ok) {
                    const errorResponse = await res.json().catch(() => ({}));
                    setLogs(prev => [...prev, `> HATA: "${productTitle}" optimize edilemedi (${res.status} - ${errorResponse.error || res.statusText}). Atlanıyor...`]);
                    continue;
                }

                const result = await res.json();
                if (result.success && result.data) {
                    setProducts(prev => prev.map(p => {
                        if (p.id === productId) {
                            return {
                                ...p,
                                title: result.data.seo_title || p.title,
                                description_html: result.data.content_html,
                                seo_description: result.data.seo_description,
                                keywords: result.data.keywords
                            };
                        }
                        return p;
                    }));
                }

                setLogs(prev => [...prev, `> BAŞARILI: "${productTitle}" optimize edildi ve çoklu dile çevrildi.`]);
            }

            setLogs(prev => [...prev, ``, `> İŞLEM BAŞARILI. Tüm seçili ürünler güncellendi!`]);
            setSelectedIds([]);

        } catch (error: any) {
            setLogs(prev => [...prev, `> KRITIK HATA: Toplu işlem sonlandı - ${error.message}`]);
        } finally {
            setIsBulkEnhancing(false);
            setEnhancingProductId(null);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Because users want drag-n-drop to reflect specifically the active SORT view,
            // we should base the numbers strictly off the visual array's display orders.
            const oldIndex = sortedProducts.findIndex(i => i.id === active.id);
            const newIndex = sortedProducts.findIndex(i => i.id === over.id);
            
            // Move item visually
            const visuallyMoved = arrayMove(sortedProducts, oldIndex, newIndex);
            
            // Re-assign display_order sequentially 1, 2, 3, 4... based on visual order
            setProducts((items) => {
                return items.map(p => {
                    const visualIndex = visuallyMoved.findIndex(v => v.id === p.id);
                    if (visualIndex !== -1) {
                        return { ...p, display_order: visualIndex + 1 };
                    }
                    return p; // Keep original display_order for products not in the visual filter
                });
            });
            
            setHasUnsavedChanges(true);
            // Snap back to order display to show the newly assigned manual order properly sequenced
            setSortConfig({ key: 'display_order', direction: 'asc' });
        }
    };

    const handleOrderChange = (id: string, newOrder: number) => {
        setProducts(items => items.map(p => p.id === id ? { ...p, display_order: newOrder } : p));
        setHasUnsavedChanges(true);
    };

    const saveOrder = async () => {
        setIsSaving(true);
        try {
            const updates = products.map(p => ({
                id: p.id,
                display_order: p.display_order ?? 0
            }));
            const res = await updateProductsOrder(updates);
            if (res.success) {
                toast.success('Sıralama başarıyla kaydedildi!');
                setHasUnsavedChanges(false);
            } else {
                toast.error('Sıralama kaydedilemedi: ' + res.error);
            }
        } catch (e: any) {
            toast.error('Sıralama kaydedilirken bir hata oluştu');
        } finally {
            setIsSaving(false);
        }
    };

    // Allow dragging as long as we aren't filtering out products via search
    // But allow dragging if we are filtering by category
    const isDragEnabled = !searchTerm;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Ürün Yönetimi</h1>
                <div className="flex gap-2">
                    {hasUnsavedChanges && (
                        <Button 
                            onClick={saveOrder} 
                            disabled={isSaving}
                            variant="default"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" /> 
                            {isSaving ? 'Kaydediliyor...' : 'Sıralamayı Kaydet'}
                        </Button>
                    )}
                    <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                        <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Yeni Ürün Ekle</Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 max-w-sm bg-white p-1 rounded-lg border w-full sm:w-auto">
                    <Search className="h-4 w-4 text-slate-400 ml-2" />
                    <Input
                        placeholder="Ara: Ürün, Kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>
                
                {/* Category Filter Dropdown */}
                <div className="flex items-center gap-2 bg-white rounded-lg border w-full sm:w-auto overflow-hidden">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-10 px-3 py-2 bg-transparent w-full text-sm outline-none border-0 focus-visible:ring-0 text-slate-600"
                    >
                        <option value="ALL">Tüm Kategoriler</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                    </select>
                </div>

                {selectedIds.length > 0 && (
                    <Button
                        onClick={handleBulkEnhance}
                        disabled={isBulkEnhancing || enhancingProductId !== null}
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        <Sparkles className="mr-2 h-4 w-4" /> Seçili Olanları Yapay Zekaya Geliştir ({selectedIds.length})
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
                                    checked={sortedProducts.length > 0 && selectedIds.length === sortedProducts.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedIds(sortedProducts.map((p) => p.id));
                                        } else {
                                            setSelectedIds([]);
                                        }
                                    }}
                                />
                            </th>
                            <th className="px-4 py-4 w-10"></th>
                            <th className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors w-24" onClick={() => handleSort('display_order')}>
                                <div className="flex items-center justify-center gap-2">
                                    Sıra <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-2">
                                    Ürün Adı <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('category')}>
                                <div className="flex items-center gap-2">
                                    Kategori <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-2">
                                    Durum <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('seo_score')}>
                                <div className="flex items-center gap-2">
                                    SEO Skoru <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedProducts.length > 0 ? (
                            <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext 
                                    items={sortedProducts.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {sortedProducts.map((product) => (
                                        <SortableTableRow 
                                            key={product.id}
                                            product={product}
                                            selectedIds={selectedIds}
                                            handleSelect={(id, selected) => {
                                                if (selected) {
                                                    setSelectedIds(prev => [...prev, id]);
                                                } else {
                                                    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
                                                }
                                            }}
                                            isDragEnabled={isDragEnabled}
                                            onOrderChange={handleOrderChange}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                    {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz hiç ürün eklenmemiş.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-xs text-slate-400 text-right">
                Toplam {sortedProducts.length} ürün
            </div>

            {/* AI Enhance Hacker Screen */}
            <HackerScreenModal
                isOpen={isHackerScreenOpen}
                logs={logs}
                onClose={() => setIsHackerScreenOpen(false)}
                title="PRODUCT AI SERP ENHANCER"
            />
        </div>
    );
}
