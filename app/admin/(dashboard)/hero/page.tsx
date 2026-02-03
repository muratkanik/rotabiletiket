'use client';

import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminHeroPage() {
    const supabase = createClient();
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*, hero_slide_translations(title, language_code)')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error(error);
            toast.error('Slaytlar yüklenemedi');
        } else {
            setSlides(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) {
            toast.error('Silinirken hata oluştu');
        } else {
            toast.success('Slayt silindi');
            fetchSlides();
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('hero_slides').update({ is_active: !currentStatus }).eq('id', id);
        if (error) {
            toast.error('Güncellenirken hata oluştu');
        } else {
            fetchSlides();
        }
    };

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Hero Slider Yönetimi</h1>
                    <p className="text-slate-500 mt-1">Ana sayfa manşet slaytlarını yönetin</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/hero/new">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Slayt
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 w-16">Sıra</th>
                            <th className="p-4 font-semibold text-slate-700 w-32">Görsel/Video</th>
                            <th className="p-4 font-semibold text-slate-700">Başlık (TR)</th>
                            <th className="p-4 font-semibold text-slate-700">Durum</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {slides.length > 0 ? (
                            slides.map((slide) => {
                                const trData = slide.hero_slide_translations?.find((t: any) => t.language_code === 'tr');
                                return (
                                    <tr key={slide.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-mono text-slate-500 text-center">{slide.sort_order}</td>
                                        <td className="p-4">
                                            <div className="relative h-16 w-24 bg-slate-100 rounded overflow-hidden border">
                                                {slide.background_url ? (
                                                    slide.background_url.endsWith('.mp4') ?
                                                        <video src={slide.background_url} className="w-full h-full object-cover" /> :
                                                        <img src={slide.background_url} alt="slide" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">Yok</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-900">
                                            <div dangerouslySetInnerHTML={{ __html: trData?.title || '<span class="text-slate-400 italic">Çeviri Yok</span>' }} />
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleActive(slide.id, slide.is_active)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${slide.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {slide.is_active ? 'Yayında' : 'Pasif'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/hero/${slide.id}`}>
                                                        <Pencil className="h-4 w-4 mr-1" /> Düzenle
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(slide.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    Henüz hiç slayt yok.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
