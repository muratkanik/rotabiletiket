'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Category {
    id: string;
    title: string;
    slug: string;
    parent_id?: string | null;
    display_order?: number | null;
}

interface Product {
    id: string;
    title: string;
    slug: string;
    category_id: string;
    product_images?: { storage_path: string; is_primary: boolean }[];
}

interface ProductsMegaMenuProps {
    categories: Category[];
    products: Product[];
}

export function ProductsMegaMenu({ categories, products }: ProductsMegaMenuProps) {
    const t = useTranslations('Navigation');
    
    // Build identical visual hierarchy as the Admin Panel D&D system
    const sortedCategories = (() => {
        const sortFn = (a: Category, b: Category) => {
            const aVal = a.display_order || 0;
            const bVal = b.display_order || 0;
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
        };

        const buildHierarchy = (items: Category[], parentId: string | null = null, level: number = 0): (Category & { level: number })[] => {
            return items
                .filter(item => (item.parent_id || null) === parentId)
                .sort(sortFn)
                .flatMap(item => [
                    { ...item, level },
                    ...buildHierarchy(items, item.id, level + 1)
                ]);
        };

        return buildHierarchy(categories);
    })();

    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(sortedCategories.length > 0 ? sortedCategories[0].id : null);

    // Filter products for the active category (limit to top 8)
    const activeProducts = activeCategoryId 
        ? products.filter(p => p.category_id === activeCategoryId).slice(0, 8) 
        : [];

    const activeCategory = categories.find(c => c.id === activeCategoryId);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/')) return path;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
    };

    return (
        <div className="relative group h-24 flex items-center">
            {/* Nav Link Trigger */}
            <Link href="/urunler" className="hover:text-blue-700 transition-colors flex items-center gap-1 py-4 font-medium text-slate-700 hover:bg-slate-50 px-3 rounded-md">
                {t('products')}
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </Link>

            {/* Mega Menu Dropdown */}
            <div className="absolute top-24 left-0 w-[850px] bg-white border border-slate-200 shadow-2xl rounded-b-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 z-50 flex">
                
                {/* Left Panel: Categories */}
                <div className="w-1/3 bg-slate-50 border-r border-slate-100 p-4 max-h-[500px] overflow-y-auto no-scrollbar">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                        {t('categories')}
                    </h3>
                    <ul className="space-y-1">
                        {sortedCategories.map(category => (
                            <li key={category.id}>
                                <Link 
                                    href={`/urunler/${category.slug}`}
                                    onMouseEnter={() => setActiveCategoryId(category.id)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                                        activeCategoryId === category.id 
                                            ? 'bg-blue-600 text-white shadow-md font-medium' 
                                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'
                                    }`}
                                    style={{ paddingLeft: category.level > 0 ? `${(category.level * 1.5) + 0.75}rem` : '0.75rem' }}
                                >
                                    <div className="flex items-center gap-2">
                                        {category.level > 0 && (
                                            <div className="w-2 h-2 border-b border-l border-slate-400 opacity-50 -mt-1"></div>
                                        )}
                                        {category.title}
                                    </div>
                                    {activeCategoryId === category.id && <ChevronRight className="w-4 h-4 opacity-80" />}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Panel: Products Grid */}
                <div className="w-2/3 bg-white p-6 max-h-[500px] overflow-y-auto">
                    {activeCategory && (
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{activeCategory.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">Öne Çıkan Ürünler</p>
                            </div>
                            <Link 
                                href={`/urunler/${activeCategory.slug}`}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                Tümünü Gör <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {activeProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {activeProducts.map(product => {
                                const rawPath = product.product_images?.find(img => img.is_primary)?.storage_path || product.product_images?.[0]?.storage_path;
                                const imgUrl = rawPath ? getImageUrl(rawPath) : null;
                                return (
                                    <Link 
                                        key={product.id} 
                                        href={`/urunler/${activeCategory?.slug || 'detay'}/${product.slug}`}
                                        className="group/item flex flex-col gap-2 rounded-xl p-2 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                    >
                                        <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            {imgUrl ? (
                                                <Image 
                                                    src={imgUrl} 
                                                    alt={product.title} 
                                                    fill 
                                                    className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-slate-50">
                                                    Görsel Yok
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 line-clamp-2 leading-tight group-hover/item:text-blue-600 transition-colors">
                                            {product.title}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm flex-col gap-2">
                            <span className="bg-slate-100 p-3 rounded-full">📦</span>
                            Bu kategoride henüz ürün bulunmuyor.
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}
