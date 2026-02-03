'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X } from 'lucide-react';
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

interface ArticleData {
    title: string;
    slug: string;
    summary: string;
    content_html: string;
    seo_title: string;
    seo_description: string;
    keywords: string; // Add keywords
}

const LANGUAGES = [
    { code: 'tr', name: 'Türkçe (Ana Dil)' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
];

export default function ArticleFormPage() {
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
    const [isPublished, setIsPublished] = useState(true);
    const [author, setAuthor] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Localized Data
    const [formData, setFormData] = useState<ArticleData>({
        title: '',
        slug: '',
        summary: '',
        content_html: '',
        seo_title: '',
        seo_description: '',
        keywords: '' // Add keywords
    });

    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        if (!isNew) {
            fetchArticleData(selectedLang);
        }
    }, [selectedLang]);

    // Sync Editor to FormData
    useEffect(() => {
        const rawContentState = convertToRaw(editorState.getCurrentContent());
        const html = draftToHtml(rawContentState);
        setFormData(prev => ({ ...prev, content_html: html }));
    }, [editorState]);


    async function fetchArticleData(lang: string) {
        setLoading(true);
        try {
            // 1. Fetch Base Article
            const { data: article, error } = await supabase
                .from('articles')
                .select('id, title, slug, summary, content_html, image_url, is_published, author, created_at, updated_at, published_at')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Supabase Fetch Error:", error);
                throw error;
            }
            if (!article) throw new Error('Article not found');

            // Common fields
            setIsPublished(article.is_published ?? true);
            setAuthor(article.author || '');

            if (article.image_url) {
                setImageUrl(article.image_url);
                setImagePreview(article.image_url.startsWith('http') || article.image_url.startsWith('/') ? article.image_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${article.image_url}`);
            }

            if (lang === 'tr') {
                // Use base fields

                // Fetch TR keywords from translations if exists
                const { data: trTrans } = await supabase
                    .from('article_translations')
                    .select('keywords, seo_title, seo_description')
                    .eq('article_id', id)
                    .eq('language_code', 'tr')
                    .maybeSingle();

                setFormData({
                    title: article.title || '',
                    slug: article.slug || '',
                    summary: article.summary || '',
                    content_html: article.content_html || '',
                    seo_title: trTrans?.seo_title || article.title,
                    seo_description: trTrans?.seo_description || '',
                    keywords: trTrans?.keywords || ''
                });
                setEditorContent(article.content_html);
            } else {
                // Fetch Translation
                const { data: trans } = await supabase
                    .from('article_translations')
                    .select('*')
                    .eq('article_id', id)
                    .eq('language_code', lang)
                    .maybeSingle();

                if (trans) {
                    setFormData({
                        title: trans.title || '',
                        slug: trans.slug || '',
                        summary: trans.summary || '',
                        content_html: trans.content_html || '',
                        seo_title: trans.seo_title || '',
                        seo_description: trans.seo_description || '',
                        keywords: trans.keywords || '' // Fetch keywords
                    });
                    setEditorContent(trans.content_html);
                } else {
                    // Reset for new translation
                    setFormData({
                        title: '',
                        slug: '',
                        summary: '',
                        content_html: '',
                        seo_title: '',
                        seo_description: '',
                        keywords: ''
                    });
                    setEditorContent('');
                }
            }

        } catch (error) {
            console.error(error);
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
                setEditorState(EditorState.createEmpty());
            }
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }

    // Auto-slug
    useEffect(() => {
        if (isNew && selectedLang === 'tr' && formData.title) {
            const newSlug = formData.title.toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    }, [formData.title, isNew, selectedLang]);

    async function handleSave() {
        setSaving(true);
        try {
            let articleId = id;

            // 1. Common Data
            const commonData = {
                is_published: isPublished,
                author: author
            };

            const contentData = {
                title: formData.title,
                slug: formData.slug,
                summary: formData.summary,
                content_html: formData.content_html,
                // seo_title, seo_description handling varies if base table doesn't have them explicitly separate
                // or if we rely on translations table structure. 
                // For simplified base, we might just store main title/desc.
            };

            if (selectedLang === 'tr') {
                const upsertData = { ...commonData, ...contentData };

                if (isNew) {
                    const { data, error } = await supabase.from('articles').insert(upsertData).select().single();
                    if (error) throw error;
                    articleId = data.id;
                } else {
                    const { error } = await supabase.from('articles').update(upsertData).eq('id', articleId);
                    if (error) throw error;
                }

                // ALSO save to article_translations for TR (to store keywords and SEO)
                // This ensures consistency and future-proofs the specific SEO fields not in base table
                const trTranslationData = {
                    article_id: articleId,
                    language_code: 'tr',
                    ...contentData,
                    seo_title: formData.seo_title,
                    seo_description: formData.seo_description,
                    keywords: formData.keywords
                };
                await supabase.from('article_translations').upsert(trTranslationData, { onConflict: 'article_id, language_code' });

            } else {
                if (isNew) {
                    toast.error("Önce Türkçe (Ana Dil) olarak kaydedin.");
                    setSaving(false);
                    return;
                }
                const translationData = {
                    article_id: articleId,
                    language_code: selectedLang,
                    ...contentData,
                    seo_title: formData.seo_title,
                    seo_description: formData.seo_description,
                    keywords: formData.keywords
                };
                const { error } = await supabase.from('article_translations').upsert(translationData, { onConflict: 'article_id, language_code' });
                if (error) throw error;
            }

            // 2. Image Upload
            if (imageFile && selectedLang === 'tr') {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${articleId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage.from('article-images').upload(filePath, imageFile);
                if (uploadError) throw uploadError;

                // Update article with new image path
                await supabase.from('articles').update({ image_url: filePath }).eq('id', articleId);
                setImageUrl(filePath);
            } else if (imageUrl === null && selectedLang === 'tr' && !isNew) {
                // If marked for removal
                await supabase.from('articles').update({ image_url: null }).eq('id', articleId);
            }

            toast.success('Kaydedildi');
            if (isNew) {
                router.push(`/admin/articles/${articleId}`);
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
        <div className="max-w-6xl mx-auto pb-10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/articles"><ChevronLeft size={20} /></Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Makale' : 'Makaleyi Düzenle'}</h1>
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
                                <CardHeader><CardTitle>Temel Bilgiler</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Yazar</label>
                                        <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={author}
                                            onChange={e => setAuthor(e.target.value)}
                                            placeholder="Yazar Adı"
                                            disabled={selectedLang !== 'tr'}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-0.5">
                                            <h3 className="font-semibold text-slate-900">Yayın Durumu</h3>
                                            <p className="text-xs text-slate-500">Kapalıyken sayfada görünmez</p>
                                        </div>
                                        <Switch
                                            checked={isPublished}
                                            onCheckedChange={setIsPublished}
                                            disabled={selectedLang !== 'tr'}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Öne Çıkan Görsel</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {imagePreview ? (
                                            <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden group">
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
                                            <label className={`aspect-video bg-slate-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors ${selectedLang !== 'tr' ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <Upload className="h-8 w-8 mb-2" />
                                                <span className="text-sm font-medium">Görsel Yükle</span>
                                                <span className="text-xs mt-1">PNG, JPG, WEBP</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        setImageFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }} disabled={selectedLang !== 'tr'} />
                                            </label>
                                        )}
                                        {selectedLang !== 'tr' && <p className="text-xs text-amber-600">Görsel ayarları sadece ana dilde değiştirilebilir.</p>}
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
                                    {selectedLang === 'tr' ? 'Ana İçerik' : 'Çeviri'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Makale Başlığı</label>
                                <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg"
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
                                <label className="block text-sm font-medium mb-1">Özet (Giriş Metni)</label>
                                <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">İçerik</label>
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
                                    <label className="block text-sm font-medium mb-1">SEO Başlık</label>
                                    <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.seo_title}
                                        onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                                        placeholder={formData.title}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">SEO Açıklama</label>
                                    <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 h-[100px]"
                                        value={formData.seo_description}
                                        onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Anahtar Kelimeler (Keywords)</label>
                                    <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="etiket, barkod, yazıcı (virgül ile ayırın)"
                                        value={formData.keywords}
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
