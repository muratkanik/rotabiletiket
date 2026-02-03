'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const LANGUAGES = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
];

export default function AdminHeroFormPage() {
    const params = useParams() as { id: string };
    const id = params.id;
    const isNew = id === 'new';
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    // Slide Data
    const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState('image');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Translations
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [activeLang, setActiveLang] = useState('tr');

    useEffect(() => {
        if (!isNew) {
            fetchSlide();
        } else {
            // Init empty translations
            const initialTrans: any = {};
            LANGUAGES.forEach(l => initialTrans[l.code] = {
                title: '', subtitle: '', badge_text: '',
                cta_primary_text: '', cta_primary_link: '',
                cta_secondary_text: '', cta_secondary_link: ''
            });
            setTranslations(initialTrans);
        }
    }, [id]);

    const fetchSlide = async () => {
        setLoading(true);
        // Fetch Slide
        const { data: slide, error } = await supabase.from('hero_slides').select('*').eq('id', id).single();
        if (error) { toast.error('Slayt bulunamadı'); return; }

        setBackgroundUrl(slide.background_url);
        setMediaType(slide.media_type || 'image');
        setSortOrder(slide.sort_order);
        setIsActive(slide.is_active);

        if (slide.background_url) {
            setMediaPreview(slide.background_url);
        }

        // Fetch Translations
        const { data: trans, error: transError } = await supabase.from('hero_slide_translations').select('*').eq('hero_slide_id', id);

        const transMap: any = {};
        LANGUAGES.forEach(l => transMap[l.code] = {
            title: '', subtitle: '', badge_text: '',
            cta_primary_text: '', cta_primary_link: '',
            cta_secondary_text: '', cta_secondary_link: ''
        });

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

    const handleSave = async () => {
        setSaving(true);
        try {
            let slideId = id;
            let finalMediaUrl = backgroundUrl;

            // 1. Upload Media if changed
            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `hero-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('article-images').upload(fileName, mediaFile); // Using existing bucket for now
                if (uploadError) throw uploadError;

                finalMediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${fileName}`;
            }

            // 2. Upsert Slide
            const slideData = {
                background_url: finalMediaUrl,
                media_type: mediaType,
                sort_order: sortOrder,
                is_active: isActive
            };

            if (isNew) {
                const { data, error } = await supabase.from('hero_slides').insert(slideData).select().single();
                if (error) throw error;
                slideId = data.id;
            } else {
                const { error } = await supabase.from('hero_slides').update(slideData).eq('id', slideId);
                if (error) throw error;
            }

            // 3. Upsert Translations
            const transToUpsert = Object.entries(translations).map(([code, data]: [string, any]) => ({
                hero_slide_id: slideId,
                language_code: code,
                title: data.title,
                subtitle: data.subtitle,
                badge_text: data.badge_text,
                cta_primary_text: data.cta_primary_text,
                cta_primary_link: data.cta_primary_link,
                cta_secondary_text: data.cta_secondary_text,
                cta_secondary_link: data.cta_secondary_link,
            }));

            const { error: transErr } = await supabase.from('hero_slide_translations').upsert(transToUpsert, { onConflict: 'hero_slide_id, language_code' });
            if (transErr) throw transErr;

            toast.success('Kaydedildi');
            router.push('/admin/hero');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
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
                        <Link href="/admin/hero"><ChevronLeft size={20} /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Slayt' : 'Slaytı Düzenle'}</h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                    {saving ? 'Kaydediliyor...' : <><Save className="mr-2 h-4 w-4" /> Kaydet</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Media & Settings Column */}
                <Card className="h-fit">
                    <CardHeader><CardTitle>Medya & Ayarlar</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {/* Media Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium">Arkaplan Görseli/Videosu</label>
                            <ImageUpload
                                value={mediaPreview || ''}
                                onChange={(url) => {
                                    setMediaPreview(url);
                                    setBackgroundUrl(url); // Also update state directly if URL is passed (e.g. remove)
                                    setMediaFile(null); // Clear file if URL is set directly
                                    if (url) setMediaType(url.match(/\.(mp4|webm)$/i) ? 'video' : 'image');
                                }}
                                onUploadStart={() => setLoading(true)}
                                onUploadEnd={() => setLoading(false)}
                                // We handle the actual file upload inside ImageUpload now, but wait...
                                // The ImageUpload component I made handles upload internally and returns URL.
                                // So I need to adapt this form to just use the URL returned.
                                // BUT, the previous logic was holding `mediaFile` state to upload on Save.
                                // Let's simplify: ImageUpload uploads immediately.
                                bucket="article-images" // Reusing this bucket as per previous logic
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sıralama</label>
                            <input type="number" className="w-full border rounded p-2" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value))} />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                            <label className="text-sm font-medium">Aktiflik Durumu</label>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </CardContent>
                </Card>

                {/* Content Translations Column */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>İçerik Çevirileri</CardTitle>
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
                            <label className="text-sm font-medium text-slate-700">Başlık (HTML Destekli)</label>
                            <textarea
                                className="w-full border rounded-lg p-3 min-h-[80px] font-mono text-sm"
                                placeholder="Örn: <span>Vurgulu</span> Başlık <br/> Alt Satır"
                                value={currentTrans.title || ''}
                                onChange={e => handleTransChange('title', e.target.value)}
                            />
                            <p className="text-xs text-slate-400">HTML etiketleri kullanabilirsiniz: &lt;br&gt;, &lt;span&gt; vb.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Alt Başlık</label>
                            <textarea
                                className="w-full border rounded-lg p-3 min-h-[80px]"
                                value={currentTrans.subtitle || ''}
                                onChange={e => handleTransChange('subtitle', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Badge (Etiket)</label>
                                <input
                                    className="w-full border rounded-lg p-2.5"
                                    value={currentTrans.badge_text || ''}
                                    onChange={e => handleTransChange('badge_text', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-blue-600">Birinci Buton</h4>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Metin</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={currentTrans.cta_primary_text || ''}
                                        onChange={e => handleTransChange('cta_primary_text', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Link</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={currentTrans.cta_primary_link || ''}
                                        onChange={e => handleTransChange('cta_primary_link', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 border-l pl-4">
                                <h4 className="font-medium text-sm text-slate-600">İkinci Buton (Opsiyonel)</h4>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Metin</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={currentTrans.cta_secondary_text || ''}
                                        onChange={e => handleTransChange('cta_secondary_text', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Link</label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={currentTrans.cta_secondary_link || ''}
                                        onChange={e => handleTransChange('cta_secondary_link', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
