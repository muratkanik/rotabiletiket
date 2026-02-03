'use client';

import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminSectorsPage() {
    const supabase = createClient();
    const [sectors, setSectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<'display_order' | 'title'>('display_order');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchSectors();
    }, []);

    const fetchSectors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sectors')
            .select(`
                *,
                sector_translations (
                    language_code,
                    title
                )
            `)
            .order('display_order', { ascending: true });

        if (error) {
            console.error(error);
            toast.error('Sektörler yüklenemedi');
        } else {
            setSectors(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu sektörü ve tüm çevirilerini silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase.from('sectors').delete().eq('id', id);
        if (error) {
            toast.error('Silinirken hata oluştu');
        } else {
            toast.success('Sektör silindi');
            fetchSectors();
        }
    };

    const togglePublish = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('sectors').update({ is_published: !currentStatus }).eq('id', id);
        if (error) {
            toast.error('Güncellenirken hata oluştu');
        } else {
            fetchSectors();
        }
    };

    const handleSort = (key: 'display_order' | 'title') => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedSectors = sectors
        .filter(sector => {
            const trData = sector.sector_translations?.find((t: any) => t.language_code === 'tr');
            const title = trData?.title?.toLowerCase() || '';
            const slug = sector.slug.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return title.includes(searchLower) || slug.includes(searchLower);
        })
        .sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            if (sortKey === 'title') {
                const aTr = a.sector_translations?.find((t: any) => t.language_code === 'tr');
                const bTr = b.sector_translations?.find((t: any) => t.language_code === 'tr');
                aValue = aTr?.title || '';
                bValue = bTr?.title || '';
            } else {
                aValue = a.display_order;
                bValue = b.display_order;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Sektörel Çözümler</h1>
                    <p className="text-slate-500 mt-1">Sektör sayfalarını ve içeriklerini yönetin</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/sectors/new">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Sektör
                    </Link>
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Sektör ara..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 w-16 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('display_order')}>
                                <div className="flex items-center gap-1">
                                    Sıra
                                    {sortKey === 'display_order' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="p-4 font-semibold text-slate-700 w-24">Görsel</th>
                            <th className="p-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                    Başlık (TR)
                                    {sortKey === 'title' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="p-4 font-semibold text-slate-700">Slug</th>
                            <th className="p-4 font-semibold text-slate-700">Durum</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredAndSortedSectors.length > 0 ? (
                            filteredAndSortedSectors.map((sector) => {
                                const trData = sector.sector_translations?.find((t: any) => t.language_code === 'tr');
                                return (
                                    <tr key={sector.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-mono text-slate-500 text-center">{sector.display_order}</td>
                                        <td className="p-4">
                                            <div className="relative h-12 w-12 bg-slate-100 rounded overflow-hidden border">
                                                {sector.image_url ? (
                                                    <Image
                                                        src={sector.image_url}
                                                        alt="sector"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized // allowing external urls without config
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">Yok</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-900">
                                            {trData?.title || <span className="text-slate-400 italic">Çeviri Yok</span>}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">
                                            {sector.slug}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => togglePublish(sector.id, sector.is_published)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${sector.is_published ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {sector.is_published ? 'Yayında' : 'Taslak'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/sectors/${sector.id}`}>
                                                        <Pencil className="h-4 w-4 mr-1" /> Düzenle
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(sector.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Henüz sektör eklenmemiş.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
