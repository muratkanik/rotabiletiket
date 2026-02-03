'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea'; // Assuming we have this or use native

const LANGUAGES = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
];

export default function AdminSectorFormPage() {
    const params = useParams() as { id: string };
    const id = params.id;
    const isNew = id === 'new';
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Main Sector Data
    const [imageUrl, setImageUrl] = useState<string>('');
    const [slug, setSlug] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isPublished, setIsPublished] = useState(true);

    // Translations
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [activeLang, setActiveLang] = useState('tr');

    useEffect(() => {
        if (!isNew) {
            fetchSector();
        } else {
            // Init translations
            const initialTrans: any = {};
            LANGUAGES.forEach(l => initialTrans[l.code] = { title: '', description: '', content_html: '' });
            setTranslations(initialTrans);
        }
    }, [id]);

    const fetchSector = async () => {
        setLoading(true);
        const { data: sector, error } = await supabase.from('sectors').select('*').eq('id', id).single();
        if (error) { toast.error('Sektör bulunamadı'); return; }

        setImageUrl(sector.image_url || '');
        setSlug(sector.slug);
        setDisplayOrder(sector.display_order || 0);
        setIsPublished(sector.is_published);

        // Fetch Translations
        const { data: trans, error: transError } = await supabase.from('sector_translations').select('*').eq('sector_id', id);

        const transMap: any = {};
        LANGUAGES.forEach(l => transMap[l.code] = { title: '', description: '', content_html: '' });

        if (trans) {
            trans.forEach((t: any) => {
                transMap[t.language_code] = t;
            });
        }
        setTranslations(transMap);
        setLoading(false);
    };

    const handleTransChange = (field: string, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                [field]: value
            }
        }));
    };

    const makeSlug = (text: string) => {
        return text.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let sectorId = id;
            const sectorData = {
                image_url: imageUrl,
                slug: slug || makeSlug(translations['tr']?.title || 'new-sector'),
                display_order: displayOrder,
                is_published: isPublished
            };

            if (isNew) {
                const { data, error } = await supabase.from('sectors').insert(sectorData).select().single();
                if (error) throw error;
                sectorId = data.id;
            } else {
                const { error } = await supabase.from('sectors').update(sectorData).eq('id', sectorId);
                if (error) throw error;
            }

            // Upsert Translations
            const transToUpsert = Object.entries(translations).map(([code, data]: [string, any]) => ({
                sector_id: sectorId,
                language_code: code,
                title: data.title,
                description: data.description,
                content_html: data.content_html
            }));

            const { error: transErr } = await supabase.from('sector_translations').upsert(transToUpsert, { onConflict: 'sector_id, language_code' });
            if (transErr) throw transErr;

            toast.success('Kaydedildi');
            router.push('/admin/sectors');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    const currentTrans = translations[activeLang] || {};

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/sectors"><ChevronLeft size={20} /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Sektör' : 'Sektörü Düzenle'}</h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                    {saving ? 'Kaydediliyor...' : <><Save className="mr-2 h-4 w-4" /> Kaydet</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <Card className="h-fit">
                    <CardHeader><CardTitle>Sektör Ayarları</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kapak Görseli</label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                bucket="product-images"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Slug (URL)</label>
                            <input
                                className="w-full border rounded p-2 text-sm font-mono"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="Auto-generated if empty"
                            />
                            <p className="text-xs text-slate-400">Boş bırakırsanız Türkçe başlıktan oluşturulur.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sıralama</label>
                            <input
                                type="number"
                                className="w-full border rounded p-2"
                                value={displayOrder}
                                onChange={e => setDisplayOrder(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                            <label className="text-sm font-medium">Yayında</label>
                            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                        </div>
                    </CardContent>
                </Card>

                {/* Content Translations */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>İçerik</CardTitle>
                            <div className="flex gap-1 text-sm bg-slate-100 p-1 rounded-lg">
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => setActiveLang(l.code)}
                                        className={`px-3 py-1 rounded-md transition-all ${activeLang === l.code ? 'bg-white shadow text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {l.code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Başlık</label>
                            <input
                                className="w-full border rounded-lg p-2.5 font-medium text-lg"
                                placeholder="Sektör Başlığı"
                                value={currentTrans.title || ''}
                                onChange={e => handleTransChange('title', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Kısa Açıklama (Opsiyonel)</label>
                            <textarea
                                className="w-full border rounded-lg p-3 min-h-[80px]"
                                placeholder="Kart üzerinde görünecek kısa özet..."
                                value={currentTrans.description || ''}
                                onChange={e => handleTransChange('description', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">İçerik (HTML)</label>
                            <Textarea
                                className="w-full min-h-[300px] font-mono text-sm"
                                placeholder="<p>Detaylı içerik...</p>"
                                value={currentTrans.content_html || ''}
                                onChange={(e: any) => handleTransChange('content_html', e.target.value)}
                            />
                            <p className="text-xs text-slate-400">HTML etiketleri kullanabilirsiniz. İleri düzey düzenleme için HTML yazın.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
