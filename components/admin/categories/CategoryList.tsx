'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUpDown, Search, Pencil, Trash2 } from 'lucide-react';
import { calculateSeoScore } from '@/utils/seo-helper';
import { cn } from '@/lib/utils';
import { HackerScreenModal } from '@/components/admin/HackerScreenModal';
import { Sparkles, GripVertical } from 'lucide-react';
import { deleteCategory, bulkDeleteCategories, deleteEmptyCategories, updateCategoryParent } from '@/app/admin/(dashboard)/categories/actions';
import { toast } from 'sonner';
import {
    DndContext,
    pointerWithin, useDraggable, useDroppable, DragEndEvent, DragOverlay } from '@dnd-kit/core';

interface Category {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    parent_id?: string | null;
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

interface CategoryRowProps {
    category: Category & { level: number };
    isSelected: boolean;
    onToggleSelect: (id: string, isSelected: boolean) => void;
    onDelete: (id: string, title: string) => void;
    isDeleting: boolean;
}

function CategoryRow({ category, isSelected, onToggleSelect, onDelete, isDeleting }: CategoryRowProps) {
    const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
        id: category.id,
        data: { type: 'category', category }
    });
    
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: category.id,
        data: { type: 'category', category }
    });

    const prodCount = category.products?.[0]?.count || 0;

    return (
        <tr 
            ref={setDroppableRef} 
            className={cn(
                "hover:bg-slate-50/50 transition-colors bg-white",
                isOver && "bg-blue-50/80 outline outline-2 outline-blue-400 outline-offset-[-2px]",
                isDragging && "opacity-30"
            )}
        >
            <td className="px-3 py-4 text-center w-10">
                <div 
                    ref={setDraggableRef} 
                    {...listeners} 
                    {...attributes}
                    className="cursor-move text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center rounded"
                >
                    <GripVertical size={16} />
                </div>
            </td>
            <td className="px-3 py-4 text-center">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={isSelected}
                    onChange={(e) => onToggleSelect(category.id, e.target.checked)}
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
            <td className="px-6 py-4 font-medium text-slate-900">
                <div 
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${category.level * 24}px` }}
                >
                    {category.level > 0 && (
                        <div className="w-4 h-4 border-b-2 border-l-2 border-slate-300 rounded-bl-sm opacity-50 -mt-2 inline-block"></div>
                    )}
                    {category.title}
                </div>
            </td>
            <td className="px-6 py-4">
                {(() => {
                    const { score } = calculateSeoScore(
                        category.seo_title || category.title,
                        category.seo_description || category.description,
                        category.description,
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
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
                        <Link href={`/admin/categories/${category.id}`}>
                            <Pencil className="mr-1 h-3 w-3" /> Düzenle
                        </Link>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(category.id, category.title)}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingParent, setIsUpdatingParent] = useState(false);
    const [activeDragCategory, setActiveDragCategory] = useState<Category | null>(null);

    const handleDragStart = (event: any) => {
        const { active } = event;
        setActiveDragCategory(active.data.current?.category || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveDragCategory(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const newParentId = over.id === 'root-dropzone' ? null : String(over.id);
            
            // Basic cyclical dependency check
            if (String(active.id) === newParentId) return;

            setIsUpdatingParent(true);
            const result = await updateCategoryParent(String(active.id), newParentId);
            setIsUpdatingParent(false);

            if (result.success) {
                toast.success("Kategori hiyerarşisi başarıyla güncellendi.");
            } else {
                toast.error(result.error || "Hiyerarşi güncellenirken hata oluştu.");
            }
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?\n\nBu kategoriye ait ürünler varsa 'Kategori Atanmamış' olarak güncellenecektir.`)) {
            return;
        }
        setIsDeleting(true);
        const result = await deleteCategory(id);
        setIsDeleting(false);
        if (result.success) {
            toast.success("Kategori silindi.");
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } else {
            toast.error(result.error);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Seçili ${selectedIds.length} kategoriyi silmek istediğinize emin misiniz?\n\nBu kategorilere ait ürünler 'Kategori Atanmamış' olarak güncellenecektir.`)) {
            return;
        }
        setIsDeleting(true);
        const result = await bulkDeleteCategories(selectedIds);
        setIsDeleting(false);
        if (result?.success) {
            toast.success(`${selectedIds.length} kategori silindi.`);
            setSelectedIds([]);
        } else {
            toast.error(result?.error || "Toplu silme hatası");
        }
    };

    const handleDeleteEmpty = async () => {
        if (!window.confirm("İçinde ürün olmayan TÜM kategorileri silmek istediğinize emin misiniz?")) {
            return;
        }
        setIsDeleting(true);
        const result = await deleteEmptyCategories();
        setIsDeleting(false);
        if (result?.success) {
            toast.success(result.message || "Boş kategoriler başarıyla silindi.");
            setSelectedIds([]);
        } else {
            toast.error(result?.error || "Boş kategoriler silinirken hata oluştu.");
        }
    };

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

    // Filter categories first
    const filteredCategories = [...initialCategories].filter(category => {
        const term = searchTerm.toLowerCase();
        return (
            category.title.toLowerCase().includes(term) ||
            (category.parent?.title || '').toLowerCase().includes(term)
        );
    });

    // Helper to sort
    const sortFn = (a: Category, b: Category) => {
        if (!sortConfig) return 0;
        let aValue = sortConfig.key === 'title' ? a.title.toLowerCase() : (a.parent?.title || '').toLowerCase();
        let bValue = sortConfig.key === 'title' ? b.title.toLowerCase() : (b.parent?.title || '').toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    };

    // Build flat tree view
    const displayCategories: (Category & { level: number })[] = [];
    const categoryMap = new Map(filteredCategories.map(c => [c.id, c]));
    
    // Find all effective roots (nodes whose parent is absent in the filtered list)
    const effectiveRoots = filteredCategories.filter(c => !c.parent_id || !categoryMap.has(c.parent_id));
    effectiveRoots.sort(sortFn);

    const appendChildren = (parentId: string, level: number) => {
        const children = filteredCategories.filter(c => c.parent_id === parentId);
        children.sort(sortFn);
        children.forEach(child => {
            displayCategories.push({ ...child, level });
            appendChildren(child.id, level + 1);
        });
    };

    effectiveRoots.forEach(root => {
        displayCategories.push({ ...root, level: 0 });
        appendChildren(root.id, 1);
    });

    const { setNodeRef: setRootDropzoneRef, isOver: isRootOver } = useDroppable({
        id: 'root-dropzone'
    });

    return (
        <DndContext 
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={`space-y-6 ${isUpdatingParent ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Kategori Yönetimi</h1>
                <div className="flex gap-2">
                    <Button 
                        variant="destructive" 
                        onClick={handleDeleteEmpty}
                        disabled={isDeleting || isBulkEnhancing}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Boş Kategorileri Sil
                    </Button>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link href="/admin/categories/new">
                            <Plus className="mr-2 h-4 w-4" /> Yeni Kategori Ekle
                        </Link>
                    </Button>
                </div>
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
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleBulkEnhance} 
                            disabled={isBulkEnhancing || enhancingId !== null || isDeleting}
                            className="text-violet-600 border-violet-200 hover:bg-violet-50 bg-white"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isBulkEnhancing ? 'Geliştiriliyor...' : 'Yapay Zeka ile Geliştir'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleBulkDelete} 
                            disabled={isDeleting || isBulkEnhancing}
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 bg-white"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Seçilenleri Sil ({selectedIds.length})
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            <th className="px-3 py-4 w-10"></th>
                            <th className="px-3 py-4 w-12 text-center select-none">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={displayCategories.length > 0 && selectedIds.length === displayCategories.length}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedIds(displayCategories.map(c => c.id));
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
                            <th className="px-6 py-4">SEO Skoru</th>
                            <th className="px-6 py-4">Link</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayCategories.length > 0 ? (
                            displayCategories.map((category) => (
                                <CategoryRow 
                                    key={category.id}
                                    category={category}
                                    isSelected={selectedIds.includes(category.id)}
                                    onToggleSelect={(id, checked) => {
                                        if (checked) setSelectedIds(prev => [...prev, id]);
                                        else setSelectedIds(prev => prev.filter(sId => sId !== id));
                                    }}
                                    onDelete={handleDelete}
                                    isDeleting={isDeleting}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz hiç kategori eklenmemiş.'}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={7} className="p-0">
                                <div 
                                    ref={setRootDropzoneRef}
                                    className={cn(
                                        "h-16 w-full flex items-center justify-center border-t-2 border-dashed bg-slate-50 text-slate-400 text-sm transition-colors",
                                        isRootOver && "bg-blue-50 border-blue-300 text-blue-600"
                                    )}
                                >
                                    Buraya bırakarak ana (root) kategori yapabilirsiniz
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <DragOverlay>
                {activeDragCategory ? (
                    <div className="bg-white px-4 py-2 border rounded-lg shadow-xl flex items-center gap-3 w-64 opacity-90">
                        <GripVertical size={16} className="text-slate-400" />
                        <span className="font-medium">{activeDragCategory.title}</span>
                    </div>
                ) : null}
            </DragOverlay>

            <div className="text-xs text-slate-400 text-right">
                Toplam {displayCategories.length} kategori
            </div>
            {/* Hacker Screen Modal for AI Generation */}
            <HackerScreenModal
                isOpen={isHackerScreenOpen}
                logs={logs}
                onClose={() => setIsHackerScreenOpen(false)}
                title="CATEGORY AI SERP ENHANCER"
            />
            </div>
        </DndContext>
    );
}
