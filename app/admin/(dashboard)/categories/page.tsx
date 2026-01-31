import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function AdminCategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*, parent:parent_id(title)')
        .order('title', { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Kategori Yönetimi</h1>
                <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" /> Yeni Kategori Ekle
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            <th className="px-6 py-4">Görsel</th>
                            <th className="px-6 py-4">Kategori Adı</th>
                            <th className="px-6 py-4">Üst Kategori</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories?.map((category: any) => (
                            <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border">
                                        {category.image_url ? (
                                            <Image src={category.image_url} alt={category.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Yok</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{category.title}</td>
                                <td className="px-6 py-4 text-slate-600">{category.parent?.title || '-'}</td>
                                <td className="px-6 py-4 text-slate-500">{category.slug}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Düzenle</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
