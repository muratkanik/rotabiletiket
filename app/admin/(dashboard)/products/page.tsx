import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

export default async function AdminProductsPage() {
    const supabase = createClient();
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(title)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Ürün Yönetimi</h1>
                <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                    <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Yeni Ürün Ekle</Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            <th className="px-6 py-4">Ürün Adı</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products?.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {product.title}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {product.categories?.title || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Yayında
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
                                        {/* Delete would require client component or form action, skipping for now to keep simple */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    Henüz hiç ürün eklenmemiş.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
