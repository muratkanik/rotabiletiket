'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CategoryData {
    title: string;
    slug: string;
    description: string;
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
    const [activeTab, setActiveTab] = useState('general');
    const [selectedLang, setSelectedLang] = useState('tr');

    // Base Data
    const [parentId, setParentId] = useState<string | null>(null);
    const [parentCategories, setParentCategories] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Localized Data
    const [formData, setFormData] = useState<CategoryData>({
        title: '',
        slug: '',
        description: ''
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
                setImageUrl(category.image_url);
                setImagePreview(category.image_url.startsWith('http') ? category.image_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`);
            }

            if (lang === 'tr') {
                setFormData({
                    title: category.title || '',
                    slug: category.slug || '',
                    description: category.description || ''
                });
            } else {
                // Fetch Translation
                const { data: trans } = await supabase
                    .from('category_translations')
                    .select('*')
                    .eq('category_id', id)
                    .eq('language_code', lang)
                    .single();

                if (trans) {
                    setFormData({
                        title: trans.title || '',
                        slug: trans.slug || '',
                        description: trans.description || ''
                    });
                } else {
                    setFormData({
                        title: '',
                        slug: '',
                        description: ''
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
        if (isNew && selectedLang === 'tr' && formData.title) {
            const newSlug = formData.title.toLowerCase().replace(/PRODUCT_LIST_ITEM/g, '-').replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    }, [formData.title, isNew, selectedLang]);


    async function handleSave() {
        setSaving(true);
        try {
            let categoryId = id;

            // 1. Common Data
            const commonData = {
                parent_id: parentId === 'null' || parentId === '' ? null : parentId,
            };

            const contentData = {
                title: formData.title,
                slug: formData.slug,
                description: formData.description
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
            } else {
                if (isNew) {
                    toast.error("Önce Türkçe (Ana Dil) olarak kaydedin.");
                    setSaving(false);
                    return;
                }
                const translationData = {
                    category_id: categoryId,
                    language_code: selectedLang,
                    ...contentData
                };
                const { error } = await supabase.from('category_translations').upsert(translationData, { onConflict: 'category_id, language_code' });
                if (error) throw error;
            }

            // 2. Image Upload
            if (imageFile && selectedLang === 'tr') {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${categoryId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage.from('category-images').upload(filePath, imageFile);
                if (uploadError) throw uploadError;

                await supabase.from('categories').update({ image_url: filePath }).eq('id', categoryId);
                setImageUrl(filePath);
            } else if (imageUrl === null && selectedLang === 'tr' && !isNew) {
                await supabase.from('categories').update({ image_url: null }).eq('id', categoryId);
            }

            toast.success('Kaydedildi');
            if (isNew) {
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/categories"><ChevronLeft size={20} /></Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}</h1>
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
                                    <div className="space-y-4">
                                        {imagePreview ? (
                                            <div className="relative w-32 h-32 bg-slate-100 rounded-lg overflow-hidden group mx-auto border">
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button variant="destructive" size="icon" onClick={() => {
                                                        setImagePreview(null);
                                                        setImageUrl(null);
                                                        setImageFile(null);
                                                    }} disabled={selectedLang !== 'tr'}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className={`w-32 h-32 mx-auto bg-slate-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors ${selectedLang !== 'tr' ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <Upload className="h-6 w-6 mb-2" />
                                                <span className="text-xs text-center px-2">Görsel Yükle</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        setImageFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }} disabled={selectedLang !== 'tr'} />
                                            </label>
                                        )}
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
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori Adı</label>
                                <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                                <label className="block text-sm font-medium mb-1">Açıklama</label>
                                <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
