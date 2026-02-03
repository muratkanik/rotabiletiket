'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    { ssr: false }
);

interface ProductData {
    title: string;
    slug: string;
    description_html: string;
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

export default function ProductFormPage() {
    const params = useParams() as { id: string };
    const id = params.id;
    const isNew = id === 'new';
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [selectedLang, setSelectedLang] = useState('tr');

    // Base Data (Shared across langs or specific to TR)
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [isPublished, setIsPublished] = useState(true);
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [images, setImages] = useState<any[]>([]);

    // Localized Data (One set per language potentially, but practically we load/save on demand or keep all in state)
    // Simpler approach: Load data for selectedLang when it changes.
    const [formData, setFormData] = useState<ProductData>({
        title: '',
        slug: '',
        description_html: '',
        seo_title: '',
        seo_description: '',
        keywords: ''
    });

    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        fetchCategories();
        if (!isNew) {
            fetchProductData(selectedLang);
        }
    }, []);

    // Effect to refetch localized data when language changes (if not new)
    useEffect(() => {
        if (!isNew && !loading) {
            fetchProductData(selectedLang);
        }
    }, [selectedLang]);

    // Sync Editor to FormData
    useEffect(() => {
        const rawContentState = convertToRaw(editorState.getCurrentContent());
        const html = draftToHtml(rawContentState);
        setFormData(prev => ({ ...prev, description_html: html }));
    }, [editorState]);

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    }

    async function fetchProductData(lang: string) {
        setLoading(true);
        try {
            // 1. Fetch Base Product
            const { data: product, error } = await supabase
                .from('products')
                .select('*, product_images(*)')
                .eq('id', id)
                .single();

            if (error || !product) throw new Error('Product not found');

            // Common fields (only set once or always from base if 'tr')
            setCategoryId(product.category_id);
            setIsPublished(product.is_published ?? true);

            if (product.specs && typeof product.specs === 'object') {
                setSpecs(Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) })));
            }

            if (product.product_images) {
                setImages(product.product_images.map((img: any) => ({
                    existingId: img.id,
                    path: img.storage_path,
                    preview: img.storage_path.startsWith('http') ? img.storage_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`
                })));
            }

            if (lang === 'tr') {
                // Use base fields
                // Fetch TR keywords from translation if exists
                const { data: trTrans } = await supabase.from('product_translations').select('keywords').eq('product_id', id).eq('language_code', 'tr').maybeSingle();

                setFormData({
                    title: product.title || '',
                    slug: product.slug || '',
                    description_html: product.description_html || '',
                    seo_title: product.seo_title || '',
                    seo_description: product.seo_description || '',
                    keywords: trTrans?.keywords || ''
                });
                setEditorContent(product.description_html);
            } else {
                // Fetch Translation
                const { data: trans } = await supabase
                    .from('product_translations')
                    .select('*')
                    .eq('product_id', id)
                    .eq('language_code', lang)
                    .single();

                if (trans) {
                    setFormData({
                        title: trans.title || '',
                        slug: trans.slug || '',
                        description_html: trans.description_html || '',
                        seo_title: trans.seo_title || '',
                        seo_description: trans.seo_description || '',
                        keywords: trans.keywords || ''
                    });
                    setEditorContent(trans.description_html);
                } else {
                    // No translation yet, reset form for new translation
                    setFormData({
                        title: '',
                        slug: '',
                        description_html: '',
                        seo_title: '',
                        seo_description: '',
                        keywords: ''
                    });
                    setEditorContent('');
                }
            }

        } catch (error) {
            console.error(error);
            // Don't show error toast on initial load if just switching lang and no trans exists
            if (params.id !== 'new' && lang === 'tr') toast.error('Veri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }

    function setEditorContent(html: string | null) {
        if (html) {
            try {
                const blocksFromHTML = convertFromHTML(html);
                if (blocksFromHTML.contentBlocks) {
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHTML.contentBlocks,
                        blocksFromHTML.entityMap
                    );
                    setEditorState(EditorState.createWithContent(contentState));
                } else {
                    setEditorState(EditorState.createEmpty());
                }
            } catch (e) {
                console.error("DraftJS parse error", e);
                setEditorState(EditorState.createEmpty());
            }
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }

    // Auto-slug for default lang
    useEffect(() => {
        if (isNew && selectedLang === 'tr' && formData.title) {
            const newSlug = formData.title.toLowerCase().replace(/PRODUCT_LIST_ITEM/g, '-').replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    }, [formData.title, isNew, selectedLang]);

    async function handleSave() {
        setSaving(true);
        try {
            let productId = id;

            // 1. Data Preparation
            const commonData = {
                category_id: categoryId,
                is_published: isPublished,
                specs: specs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
            };

            const contentData = {
                title: formData.title,
                slug: formData.slug,
                description_html: formData.description_html,
                seo_title: formData.seo_title,
                seo_description: formData.seo_description,
                keywords: formData.keywords
            };

            if (selectedLang === 'tr') {
                // UPSERT BASE PRODUCT
                const upsertData = { ...commonData, ...contentData };

                if (isNew) {
                    const { data, error } = await supabase.from('products').insert(upsertData).select().single();
                    if (error) throw error;
                    productId = data.id;
                } else {
                    const { error } = await supabase.from('products').update(upsertData).eq('id', productId);
                    if (error) throw error;
                }

                // ALSO upsert TR translation for keywords/SEO
                const trTransData = {
                    product_id: productId,
                    language_code: 'tr',
                    ...contentData
                };
                await supabase.from('product_translations').upsert(trTransData, { onConflict: 'product_id, language_code' });
            } else {
                // UPSERT TRANSLATION (Only if product exists)
                if (isNew) {
                    toast.error("Önce Türkçe (Ana Dil) olarak ürünü kaydedin.");
                    setSaving(false);
                    return;
                }

                const translationData = {
                    product_id: productId,
                    language_code: selectedLang,
                    ...contentData
                };

                const { error } = await supabase.from('product_translations').upsert(translationData, { onConflict: 'product_id, language_code' });
                if (error) throw error;
            }

            // 2. Handle Images (Only on Base/Common Update or just always if needed, currently global)
            // Ideally image relations are global.
            if (images.length > 0 && selectedLang === 'tr') { // Only update images if editing TR
                // First delete all images for this product (simple replace strategy)
                await supabase.from('product_images').delete().eq('product_id', productId);

                const imagesToInsert = images.map((img, index) => ({
                    product_id: productId,
                    storage_path: img.path,
                    is_primary: index === 0
                }));
                const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert);
                if (imgError) throw imgError;
            }


            toast.success('Kaydedildi');
            if (isNew) {
                // If it was new, redirect to edit page of the created product
                router.push(`/admin/products/${productId}`);
            } else {
                // Stay on page
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
        <div className="max-w-6xl mx-auto pb-10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/products"><ChevronLeft size={20} /></Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Ürün' : 'Ürünü Düzenle'}</h1>
                        {!isNew && <span className="text-xs text-slate-500">ID: {id}</span>}
                    </div>

                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedLang} onValueChange={setSelectedLang} disabled={isNew}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Dil Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map(l => (
                                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                        {saving ? 'Kaydediliyor...' : <><Save className="mr-2 h-4 w-4" /> Kaydet</>}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                    <TabsTrigger value="content">İçerik ve SEO</TabsTrigger>
                </TabsList>

                {/* TAB: GENERAL */}
                <TabsContent value="general" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Ürün Bilgileri</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kategori</label>
                                        <select className="w-full border rounded-lg p-2.5 outline-none bg-white"
                                            value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={selectedLang !== 'tr'}>
                                            <option value="">Seçiniz...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                        {selectedLang !== 'tr' && <p className="text-xs text-amber-600 mt-1">Kategori sadece ana dilde değiştirilebilir.</p>}
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium">Teknik Özellikler</label>
                                            <Button variant="outline" size="sm" onClick={() => setSpecs([...specs, { key: '', value: '' }])} disabled={selectedLang !== 'tr'}>
                                                <Plus className="h-3 w-3 mr-1" /> Ekle
                                            </Button>
                                        </div>

                                        {specs.map((spec, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input className="w-1/3 border rounded p-2 text-sm" placeholder="Özellik"
                                                    value={spec.key}
                                                    onChange={e => {
                                                        const newSpecs = [...specs];
                                                        newSpecs[i].key = e.target.value;
                                                        setSpecs(newSpecs);
                                                    }} disabled={selectedLang !== 'tr'} />
                                                <input className="flex-1 border rounded p-2 text-sm" placeholder="Değer"
                                                    value={spec.value}
                                                    onChange={e => {
                                                        const newSpecs = [...specs];
                                                        newSpecs[i].value = e.target.value;
                                                        setSpecs(newSpecs);
                                                    }} disabled={selectedLang !== 'tr'} />
                                                <Button variant="ghost" size="icon" onClick={() => {
                                                    const newSpecs = specs.filter((_, idx) => idx !== i);
                                                    setSpecs(newSpecs);
                                                }} disabled={selectedLang !== 'tr'}>
                                                    <X className="h-4 w-4 text-red-400" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Yayın Durumu</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h3 className="font-semibold text-slate-900">Yayında</h3>
                                            <p className="text-xs text-slate-500">Kapatıldığında sitede görünmez</p>
                                        </div>
                                        <Switch
                                            checked={isPublished}
                                            onCheckedChange={setIsPublished}
                                            disabled={selectedLang !== 'tr'}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Görseller</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative aspect-square bg-slate-50 rounded border overflow-hidden group">
                                                <Image src={img.preview} alt="Preview" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => {
                                                        setImages(images.filter((_, idx) => idx !== i));
                                                    }} disabled={selectedLang !== 'tr'}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <label className={`aspect-square bg-slate-50 rounded border border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors relative ${selectedLang !== 'tr' ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Upload className="h-6 w-6 mb-1" />
                                            <span className="text-xs">Yükle</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                if (!e.target.files || e.target.files.length === 0) return;
                                                const file = e.target.files[0];
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                                                const filePath = `${fileName}`;

                                                try {
                                                    const { error } = await supabase.storage.from('product-images').upload(filePath, file);
                                                    if (error) throw error;
                                                    setImages([...images, {
                                                        path: filePath,
                                                        preview: URL.createObjectURL(file), // Or construct public URL immediately
                                                        file: file
                                                    }]);
                                                } catch (err: any) {
                                                    alert('Hata: ' + err.message);
                                                }
                                            }} disabled={selectedLang !== 'tr'} />
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: CONTENT & SEO */}
                <TabsContent value="content" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>İçerik ({selectedLang.toUpperCase()})</span>
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {selectedLang === 'tr' ? 'Ana Tabloyu Düzenliyor' : 'Çeviri Tablosunu Düzenliyor'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ürün Başlığı</label>
                                <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                                <input className="w-full border rounded-lg p-2.5 bg-slate-50 text-slate-500 font-mono text-sm"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Açıklama / İçerik</label>
                                <div className="border rounded-lg p-2 min-h-[400px] bg-white">
                                    <Editor
                                        editorState={editorState}
                                        onEditorStateChange={setEditorState}
                                        wrapperClassName="wrapper-class"
                                        editorClassName="editor-class"
                                        toolbarClassName="toolbar-class"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium mb-1">SEO Başlık (Meta Title)</label>
                                    <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.seo_title}
                                        onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                                        placeholder={formData.title}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Boş bırakılırsa ürün başlığı kullanılır.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">SEO Açıklama (Meta Description)</label>
                                    <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 h-[120px]"
                                        value={formData.seo_description}
                                        onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Anahtar Kelimeler (Keywords)</label>
                                    <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="etiket, ürün, özellik"
                                        value={formData.keywords || ''}
                                        onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
