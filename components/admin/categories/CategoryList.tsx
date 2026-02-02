'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUpDown, Search, Pencil } from 'lucide-react';

interface Category {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    parent: {
        title: string;
    } | null;
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

            <div className="flex items-center gap-2 max-w-sm bg-white p-1 rounded-lg border">
                <Search className="h-4 w-4 text-slate-400 ml-2" />
                <Input
                    placeholder="Ara: Kategori, Üst Kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
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
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedCategories.length > 0 ? (
                            sortedCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
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
                                    <td className="px-6 py-4 text-slate-500">{category.slug}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
                                            <Link href={`/admin/categories/${category.id}`}>
                                                <Pencil className="mr-1 h-3 w-3" /> Düzenle
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))
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
        </div>
    );
}
