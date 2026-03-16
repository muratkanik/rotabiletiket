'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { HackerScreenModal } from '@/components/admin/HackerScreenModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SeoScore } from '@/components/admin/SeoScore';

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
    
    // AI Enhancement State
    const [enhancing, setEnhancing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // Main Sector Data
    const [imageUrl, setImageUrl] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [slug, setSlug] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isPublished, setIsPublished] = useState(true);

    // Linked Products
    const [allProducts, setAllProducts] = useState<{id: string, title: string}[]>([]);
    const [linkedProducts, setLinkedProducts] = useState<string[]>([]);

    // Translations
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const [activeLang, setActiveLang] = useState('tr');

    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch All Products for the Linker
            const { data: prodData } = await supabase.from('products').select('id, product_translations(title, language_code)').order('created_at', { ascending: false });
            if (prodData) {
                const mapped = prodData.map((p: any) => {
                    const trTitle = p.product_translations?.find((t: any) => t.language_code === 'tr')?.title || 'İsimsiz Ürün';
                    return { id: p.id, title: trTitle };
                });
                setAllProducts(mapped);
            }

            if (!isNew) {
                await fetchSector();
            } else {
                // Init translations
                const initialTrans: any = {};
                LANGUAGES.forEach(l => initialTrans[l.code] = { title: '', description: '', content_html: '', seo_title: '', seo_description: '', keywords: '' });
                setTranslations(initialTrans);
            }
        };

        fetchInitialData();
    }, [id]);

    const fetchSector = async () => {
        setLoading(true);
        const { data: sector, error } = await supabase.from('sectors').select('*').eq('id', id).single();
        if (error) { toast.error('Sektör bulunamadı'); return; }

        setImageUrl(sector.image_url || '');
        setVideoUrl(sector.video_url || '');
        setSlug(sector.slug);
        setDisplayOrder(sector.display_order || 0);
        setIsPublished(sector.is_published);

        // Fetch Translations
        const { data: trans, error: transError } = await supabase.from('sector_translations').select('*').eq('sector_id', id);

        const transMap: any = {};
        LANGUAGES.forEach(l => transMap[l.code] = { title: '', description: '', content_html: '', seo_title: '', seo_description: '', keywords: '' });

        if (trans) {
            trans.forEach((t: any) => {
                transMap[t.language_code] = t;
            });
        }
        // Fetch Linked Products
        const { data: linked } = await supabase.from('sector_products').select('product_id').eq('sector_id', id);
        if (linked) {
            setLinkedProducts(linked.map((l: any) => l.product_id));
        }

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
        if (!text) return '';
        return text.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleEnhance = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isNew) {
            toast.error("AI Enhance özelliğini kullanmak için sektörü önce kaydetmelisiniz!");
            return;
        }

        const currentTrans = translations[activeLang] || {};

        setEnhancing(true);
        setLogs([`> BAŞLATILIYOR: "${currentTrans.title || 'İsimsiz'}" için B2B Sektörel AI Enhance süreci...`]);

        try {
            const logInterval = setInterval(() => {
                setLogs(prev => [...prev, `> Sistem rakiplerin kurumsal içeriklerini inceliyor... ${Math.floor(Math.random() * 100)}%`]);
            }, 3000);

            const res = await fetch(`/api/ai/enhance-sector`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectorId: id, mock: false })
            });

            clearInterval(logInterval);

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setLogs(prev => [...prev, `> BAŞARILI: Veritabanına (4 dile birden) kaydedildi.`]);
            toast.success("AI Enhance tamamlandı. Ekran güncelleniyor...");
            
            setTimeout(async () => {
                await fetchSector();
                setEnhancing(false);
                setLogs([]);
            }, 1000);

        } catch (err: any) {
            setLogs(prev => [...prev, `> HATA: ${err.message}`]);
            toast.error("Hata: " + err.message);
            setTimeout(() => {
                setEnhancing(false);
            }, 4000);
        }
    };

    async function handleSave() {
        setSaving(true);
        try {
            let sectorId = id;
            
            // SAFETY CHECK: Ensure TR has a title before proceeding.
            if (!translations['tr']?.title?.trim()) {
                toast.error("Kaydetmeden önce mutlaka **Türkçe** (Ana Dil) için bir Başlık girmelisiniz.");
                setSaving(false);
                return;
            }

            const safeSlug = slug || makeSlug(translations['tr'].title);

            const sectorData = {
                image_url: imageUrl,
                video_url: videoUrl,
                slug: safeSlug,
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

            // Upsert Translations filtering empty titles to avoid breaking the frontend
            const transToUpsert = Object.entries(translations)
                .filter(([_, data]: [string, any]) => data.title?.trim()) 
                .map(([code, data]: [string, any]) => ({
                    sector_id: sectorId,
                    language_code: code,
                    title: data.title,
                    description: data.description,
                    content_html: data.content_html,
                    seo_title: data.seo_title,
                    seo_description: data.seo_description,
                    keywords: data.keywords
                }));

            if (transToUpsert.length > 0) {
                const { error: transErr } = await supabase.from('sector_translations').upsert(transToUpsert, { onConflict: 'sector_id, language_code' });
                if (transErr) throw transErr;
            }

            // Sync Linked Products
            await supabase.from('sector_products').delete().eq('sector_id', sectorId);
            if (linkedProducts.length > 0) {
                const linksToInsert = linkedProducts.map(productId => ({
                    sector_id: sectorId,
                    product_id: productId
                }));
                const { error: linksErr } = await supabase.from('sector_products').insert(linksToInsert);
                if (linksErr) throw linksErr;
            }

            toast.success('Kaydedildi');
            if (isNew) {
                router.push(`/admin/sectors/${sectorId}`);
            } else {
                fetchSector(); 
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Hata oluştu');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    const currentTrans = translations[activeLang] || {};

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <HackerScreenModal isOpen={enhancing} logs={logs} />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/sectors"><ChevronLeft size={20} /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Sektör' : 'Sektörü Düzenle'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && (
                        <Button
                            onClick={handleEnhance}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Enhance
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                        {saving ? 'Kaydediliyor...' : <><Save className="mr-2 h-4 w-4" /> Kaydet</>}
                    </Button>
                </div>
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
                            <label className="text-sm font-medium">Sektör Videosu</label>
                            <VideoUpload
                                value={videoUrl}
                                onChange={setVideoUrl}
                                bucket="product-images"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Slug (URL)</label>
                            <input
                                className="w-full border rounded p-2 text-sm font-mono"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="Otomatik oluşturulur"
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
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                                <TabsTrigger value="content" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2">Genel İçerik</TabsTrigger>
                                <TabsTrigger value="seo" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2">SEO Ayarları</TabsTrigger>
                                <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2">Bağlı Ürünler</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-5 mt-4">
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
                            </TabsContent>

                            <TabsContent value="seo" className="space-y-5 mt-4">
                                <SeoScore
                                    title={currentTrans.title || ''}
                                    description={currentTrans.seo_description || currentTrans.description || ''}
                                    content={currentTrans.content_html || ''}
                                    keyword={currentTrans.keywords?.split(',')[0]}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">SEO Başlığı (Meta Title)</label>
                                    <input
                                        className="w-full border rounded-lg p-2.5"
                                        placeholder="Boş bırakılırsa ana başlık kullanılır"
                                        value={currentTrans.seo_title || ''}
                                        onChange={e => handleTransChange('seo_title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">SEO Açıklaması (Meta Description)</label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 h-24"
                                        placeholder="Arama motorlarında görünecek açıklama..."
                                        value={currentTrans.seo_description || ''}
                                        onChange={e => handleTransChange('seo_description', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Anahtar Kelimeler (Keywords)</label>
                                    <input
                                        className="w-full border rounded-lg p-2.5"
                                        placeholder="virgül, ile, ayırın"
                                        value={currentTrans.keywords || ''}
                                        onChange={e => handleTransChange('keywords', e.target.value)}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="products" className="space-y-5 mt-4">
                                <p className="text-sm text-slate-500 font-medium">Bu sektörde en çok kullanılan ürünleri seçerek eşleştirin.</p>
                                <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1">
                                    {allProducts.length === 0 ? (
                                        <p className="text-sm text-slate-400 p-4 text-center">Henüz eklenmiş bir ürün bulunamadı.</p>
                                    ) : (
                                        allProducts.map(product => (
                                            <div key={product.id} className="flex items-center space-x-3 p-2.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm">
                                                <Switch 
                                                    checked={linkedProducts.includes(product.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setLinkedProducts(prev => [...prev, product.id]);
                                                        else setLinkedProducts(prev => prev.filter(id => id !== product.id));
                                                    }}
                                                />
                                                <label className="text-sm font-medium text-slate-800 cursor-pointer flex-1">{product.title}</label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
