'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, Search } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    slug: string;
    categories: {
        title: string;
        slug: string;
    } | null;
    is_published?: boolean;
}

interface ProductListProps {
    initialProducts: Product[];
}

type SortKey = 'title' | 'category' | 'status';

export function ProductList({ initialProducts }: ProductListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = [...initialProducts].filter(product => {
        const term = searchTerm.toLowerCase();
        return (
            product.title.toLowerCase().includes(term) ||
            (product.categories?.title || '').toLowerCase().includes(term)
        );
    }).sort((a, b) => {
        if (!sortConfig) return 0;

        let aValue: string | boolean = '';
        let bValue: string | boolean = '';

        if (sortConfig.key === 'title') {
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
        } else if (sortConfig.key === 'category') {
            aValue = (a.categories?.title || '').toLowerCase();
            bValue = (b.categories?.title || '').toLowerCase();
        } else if (sortConfig.key === 'status') {
            aValue = a.is_published ?? true; // Default to published if undefined/null for now
            bValue = b.is_published ?? true;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Ürün Yönetimi</h1>
                <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                    <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Yeni Ürün Ekle</Link>
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm bg-white p-1 rounded-lg border">
                <Search className="h-4 w-4 text-slate-400 ml-2" />
                <Input
                    placeholder="Ara: Ürün, Kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
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
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedProducts.length > 0 ? (
                            sortedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
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
        </div>
    );
}
