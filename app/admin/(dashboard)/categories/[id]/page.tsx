'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X, Sparkles, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface CategoryData {
    title: string;
    slug: string;
    description: string;
    seo_title: string;
    seo_description: string;
    keywords: string;
}

const LANGUAGES = [
    { code: 'tr', name: 'Türkçe (Ana Dil)' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
];

export default function CategoryFormPage() {
    const params = useParams() as { id: string };
    const id = params.id;
    const isNew = id === 'new';
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [selectedLang, setSelectedLang] = useState('tr');

    // Base Data
    const [parentId, setParentId] = useState<string | null>(null);
    const [parentCategories, setParentCategories] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');

    // Localized Data
    const [originalTrTitle, setOriginalTrTitle] = useState<string>('');
    const [formData, setFormData] = useState<CategoryData>({
        title: '',
        slug: '',
        description: '',
        seo_title: '',
        seo_description: '',
        keywords: ''
    });

    useEffect(() => {
        fetchParentCategories();
        if (!isNew) {
            fetchCategoryData(selectedLang);
        }
    }, []);

    useEffect(() => {
        if (!isNew && !loading) {
            fetchCategoryData(selectedLang);
        }
    }, [selectedLang]);

    async function fetchParentCategories() {
        // Fetch all categories to choose parent (excluding self if editing)
        let query = supabase.from('categories').select('id, title');
        if (!isNew) {
            query = query.neq('id', id);
        }
        const { data } = await query;
        if (data) setParentCategories(data);
    }

    async function fetchCategoryData(lang: string) {
        setLoading(true);
        try {
            // 1. Fetch Base Category
            const { data: category, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !category) throw new Error('Category not found');

            // Common fields
            setParentId(category.parent_id);
            if (category.image_url) {
                // Determine if it's already an absolute URL or just a filename
                setImageUrl(category.image_url.startsWith('http') || category.image_url.startsWith('/') ? category.image_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`);
            }
            if (category.video_url) {
                setVideoUrl(category.video_url);
            }

            // Always fetch translation for SEO fields (even for TR)
            const { data: trans } = await supabase
                .from('category_translations')
                .select('*')
                .eq('category_id', id)
                .eq('language_code', lang)
                .maybeSingle();

            if (lang === 'tr') {
                const trTitle = trans?.title || category.title || '';
                setOriginalTrTitle(trTitle);
                setFormData({
                    title: trTitle,
                    slug: trans?.slug || category.slug || '',
                    description: trans?.description || category.description || '',
                    // SEO from translation table if exists
                    seo_title: trans?.seo_title || '',
                    seo_description: trans?.seo_description || '',
                    keywords: trans?.keywords || ''
                });
            } else {
                // Fetch TR context explicitly to display it across all tabs
                const { data: trFallback } = await supabase
                    .from('category_translations')
                    .select('title')
                    .eq('category_id', id)
                    .eq('language_code', 'tr')
                    .maybeSingle();
                
                setOriginalTrTitle(trFallback?.title || category.title || '');

                // Fetch Translation
                if (trans) {
                    setFormData({
                        title: trans.title || '',
                        slug: trans.slug || '',
                        description: trans.description || '',
                        seo_title: trans.seo_title || '',
                        seo_description: trans.seo_description || '',
                        keywords: trans.keywords || ''
                    });
                } else {
                    setFormData({
                        title: '',
                        slug: '',
                        description: '',
                        seo_title: '',
                        seo_description: '',
                        keywords: ''
                    });
                }
            }

        } catch (error) {
            console.error(error);
            if (params.id !== 'new' && lang === 'tr') toast.error('Kategori yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }

    // Auto-slug
    useEffect(() => {
        if (selectedLang === 'tr' && formData.title) {
            const generateSlug = (str: string) => {
                return str
                    .toLowerCase()
                    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            };
            setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
        }
    }, [formData.title, selectedLang]);


    async function handleEnhance() {
        if (isNew) {
            toast.error("Önce kategoriyi kaydedin.");
            return;
        }
        setEnhancing(true);
        const toastId = toast.loading("Yapay zeka içerik üretiyor...");
        try {
            const res = await fetch(`/api/ai/enhance-category`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: id })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || res.statusText);
            }
            toast.success("AI İçerik başarıyla üretildi ve kaydedildi.", { id: toastId });
            // re-fetch the data automatically
            fetchCategoryData(selectedLang);
        } catch (error: any) {
            toast.error("Hata: " + error.message, { id: toastId });
        } finally {
            setEnhancing(false);
        }
    }

    async function handleSave(shouldClose: boolean = false) {
        setSaving(true);
        try {
            let categoryId = id;

            // 1. Common Data
            const commonData = {
                parent_id: parentId === 'null' || parentId === '' ? null : parentId,
                video_url: videoUrl,
            };

            const contentData = {
                title: formData.title,
                slug: formData.slug,
                description: formData.description
            };

            const seoData = {
                seo_title: formData.seo_title,
                seo_description: formData.seo_description,
                keywords: formData.keywords
            };

            if (selectedLang === 'tr') {
                const upsertData = { ...commonData, ...contentData };

                if (isNew) {
                    const { data, error } = await supabase.from('categories').insert(upsertData).select().single();
                    if (error) throw error;
                    categoryId = data.id;
                } else {
                    const { error } = await supabase.from('categories').update(upsertData).eq('id', categoryId);
                    if (error) throw error;
                }

                // ALSO upsert SEO data for TR in translations table
                const translationData = {
                    category_id: categoryId,
                    language_code: 'tr',
                    // We don't necessarily need to duplicate title/desc here if we rely on categories table, 
                    // BUT for consistency and "backup" it doesn't hurt.
                    // However, to keep it clean, let's just save SEO fields + basic required fields if any constraint exists?
                    // sector_translations table might not have constraints other than PK.
                    // But usually translations table expects title/description. 
                    // Let's save ALL fields to translation table for TR as well, so we have a full copy there too? 
                    // Reference: In `Sector` logic, we upsert ALL translations.
                    // Let's do the same here for consistency.
                    ...contentData,
                    ...seoData
                };
                await supabase.from('category_translations').upsert(translationData, { onConflict: 'category_id, language_code' });

            } else {
                if (isNew) {
                    toast.error("Önce Türkçe (Ana Dil) olarak kaydedin.");
                    setSaving(false);
                    return;
                }
                const translationData = {
                    category_id: categoryId,
                    language_code: selectedLang,
                    ...contentData,
                    ...seoData
                };
                const { error } = await supabase.from('category_translations').upsert(translationData, { onConflict: 'category_id, language_code' });
                if (error) throw error;
            }

            // 2. Image Update Sync
            if (selectedLang === 'tr') {
                if (imageUrl !== null || !isNew) {
                    await supabase.from('categories').update({ image_url: imageUrl }).eq('id', categoryId);
                }
            }

            toast.success('Kaydedildi');
            if (shouldClose) {
                router.push('/admin/categories');
            } else if (isNew) {
                router.push(`/admin/categories/${categoryId}`);
            } else {
                router.refresh();
            }

        } catch (e: any) {
            toast.error('Hata: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading && !isNew) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            {/* Header Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/categories"><ChevronLeft size={20} /></Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900">{isNew ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}</h1>
                        {!isNew && (
                            <div className="flex flex-col gap-0.5 mt-1">
                                <span className="text-xs text-slate-500 font-mono" title="Kategori ID">ID: {id}</span>
                                <span className="text-sm font-medium text-slate-700" title="Türkçe Adı">
                                    {originalTrTitle}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Select value={selectedLang} onValueChange={setSelectedLang} disabled={isNew}>
                        <SelectTrigger className="w-[160px] bg-white whitespace-nowrap">
                            <SelectValue placeholder="Dil Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map(l => (
                                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <TooltipProvider delayDuration={200}>
                        {!isNew && selectedLang === 'tr' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={handleEnhance}
                                        disabled={enhancing || saving}
                                        variant="outline"
                                        size="icon"
                                        className="text-violet-600 border-violet-200 hover:bg-violet-50 bg-white shrink-0"
                                    >
                                        <Sparkles className={`h-4 w-4 ${enhancing ? 'animate-pulse' : ''}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{enhancing ? 'AI Geliştiriliyor...' : 'AI İçerik Optimizasyonu'}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => handleSave(true)} disabled={saving} variant="secondary" size="icon" className="shrink-0 text-slate-700">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Kaydet ve Çık</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => handleSave(false)} disabled={saving || enhancing} className="shrink-0" size="icon">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Kaydet</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                    <TabsTrigger value="content">İçerik</TabsTrigger>
                </TabsList>

                {/* TAB: GENERAL */}
                <TabsContent value="general" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Üst Kategori</CardTitle></CardHeader>
                                <CardContent>
                                    <select className="w-full border rounded-lg p-2.5 outline-none bg-white"
                                        value={parentId || ''} onChange={e => setParentId(e.target.value)} disabled={selectedLang !== 'tr'}>
                                        <option value="">(Yok - Ana Kategori)</option>
                                        {parentCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                    {selectedLang !== 'tr' && <p className="text-xs text-amber-600 mt-1">Sadece ana dilde değiştirilebilir.</p>}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Kategori Görseli</CardTitle></CardHeader>
                                <CardContent>
                                        <ImageUpload
                                            value={imageUrl || ''}
                                            onChange={(url) => setImageUrl(url || null)}
                                            bucket="category-images"
                                        />
                                        {selectedLang !== 'tr' && <p className="text-xs text-amber-600 mt-1">Sadece ana dilde değiştirilebilir.</p>}
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-6 md:col-span-2">
                            <Card>
                                <CardHeader><CardTitle>Kategori Videosu</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <VideoUpload
                                            value={videoUrl}
                                            onChange={setVideoUrl}
                                            bucket="product-images"
                                        />
                                        {selectedLang !== 'tr' && <p className="text-xs text-amber-600 mt-1">Sadece ana dilde değiştirilebilir.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: CONTENT */}
                <TabsContent value="content" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>İçerik ({selectedLang.toUpperCase()})</span>
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {selectedLang === 'tr' ? 'Ana İçerik' : 'Çeviri'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                                    <TabsTrigger value="basic" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2">Temel Bilgiler</TabsTrigger>
                                    <TabsTrigger value="seo" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2">SEO Ayarları</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kategori Adı</label>
                                        <Input
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="font-medium text-base h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                                        <Input
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            className="bg-slate-50 font-mono"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Açıklama</label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[200px] resize-y"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">SEO Başlığı (Meta Title)</label>
                                        <Input
                                            placeholder={formData.title}
                                            value={formData.seo_title || ''}
                                            onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">SEO Açıklaması (Meta Description)</label>
                                        <Textarea
                                            placeholder="Arama sonuçlarında görünecek açıklama..."
                                            value={formData.seo_description || ''}
                                            onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Anahtar Kelimeler</label>
                                        <Input
                                            placeholder="etiket, rulo etiket, baskı"
                                            value={formData.keywords || ''}
                                            onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
