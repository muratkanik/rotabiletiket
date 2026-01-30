'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductFormPage() {
    const params = useParams() as { id: string };
    const id = params.id;
    const isNew = id === 'new';
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState(''); // Simple text area for now
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [images, setImages] = useState<any[]>([]); // { file, preview, existingId, path }

    useEffect(() => {
        fetchCategories();
        if (!isNew) fetchProduct();
    }, []);

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    }

    async function fetchProduct() {
        const { data: product } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('id', id)
            .single();

        if (product) {
            setTitle(product.title);
            setSlug(product.slug);
            setCategoryId(product.category_id);
            setDescription(product.description_html || '');

            // Transform specs object to array
            const specsArray = Object.entries(product.specs || {}).map(([key, value]) => ({ key, value: String(value) }));
            setSpecs(specsArray);

            // Images
            if (product.product_images) {
                setImages(product.product_images.map((img: any) => ({
                    existingId: img.id,
                    path: img.storage_path,
                    preview: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`
                })));
            }
        }
        setLoading(false);
    }

    // Slug generation
    useEffect(() => {
        if (isNew && title) {
            setSlug(title.toLowerCase().replace(/PRODUCT_LIST_ITEM/g, '-').replace(/[^a-z0-9-]/g, ''));
        }
    }, [title, isNew]);

    async function handleSave() {
        setSaving(true);
        try {
            // 1. Upsert Product
            const productData = {
                title,
                slug,
                category_id: categoryId,
                description_html: description,
                specs: specs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
            };

            let productId = id;

            if (isNew) {
                const { data, error } = await supabase.from('products').insert(productData).select().single();
                if (error) throw error;
                productId = data.id;
            } else {
                const { error } = await supabase.from('products').update(productData).eq('id', productId);
                if (error) throw error;
            }

            // 2. Handle Images
            // Delete existing relations to "replace" (simple approach for now)
            await supabase.from('product_images').delete().eq('product_id', productId);

            if (images.length > 0) {
                const imagesToInsert = images.map((img, index) => ({
                    product_id: productId,
                    storage_path: img.path,
                    is_primary: index === 0
                }));
                const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert);
                if (imgError) throw imgError;
            }

            router.push('/admin/products');
            router.refresh();
        } catch (e: any) {
            alert('Hata: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/products"><ChevronLeft size={20} /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}</h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                    {saving ? <span className="animate-pulse">Kaydediliyor...</span> : <><Save className="mr-2 h-4 w-4" /> Kaydet</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b pb-2">Temel Bilgiler</h3>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ürün Başlığı</label>
                            <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                            <input className="w-full border rounded-lg p-2.5 bg-slate-50 text-slate-500 font-mono text-sm"
                                value={slug} onChange={e => setSlug(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Açıklama (HTML)</label>
                            <textarea className="w-full border rounded-lg p-2.5 h-64 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                value={description} onChange={e => setDescription(e.target.value)} />
                            <p className="text-xs text-slate-400 mt-1">HTML etiketleri kullanabilirsiniz.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-semibold text-slate-900">Teknik Özellikler</h3>
                            <Button variant="outline" size="sm" onClick={() => setSpecs([...specs, { key: '', value: '' }])}>
                                <Plus className="h-3 w-3 mr-1" /> Özellik Ekle
                            </Button>
                        </div>

                        {specs.map((spec, i) => (
                            <div key={i} className="flex gap-2">
                                <input className="w-1/3 border rounded p-2 text-sm" placeholder="Özellik (örn: Boyut)"
                                    value={spec.key} onChange={e => {
                                        const newSpecs = [...specs];
                                        newSpecs[i].key = e.target.value;
                                        setSpecs(newSpecs);
                                    }} />
                                <input className="flex-1 border rounded p-2 text-sm" placeholder="Değer (örn: 10x10 cm)"
                                    value={spec.value} onChange={e => {
                                        const newSpecs = [...specs];
                                        newSpecs[i].value = e.target.value;
                                        setSpecs(newSpecs);
                                    }} />
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const newSpecs = specs.filter((_, idx) => idx !== i);
                                    setSpecs(newSpecs);
                                }}>
                                    <X className="h-4 w-4 text-red-400" />
                                </Button>
                            </div>
                        ))}
                        {specs.length === 0 && <p className="text-sm text-slate-400 italic">Henüz özellik eklenmemiş.</p>}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b pb-2">Kategori & Medya</h3>

                        <div>
                            <label className="block text-sm font-medium mb-1">Kategori</label>
                            <select className="w-full border rounded-lg p-2.5 outline-none bg-white"
                                value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                <option value="">Seçiniz...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t">
                            <label className="block text-sm font-medium mb-2">Ürün Görselleri</label>
                            <div className="grid grid-cols-2 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square bg-slate-50 rounded border overflow-hidden group">
                                        <Image src={img.preview} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => {
                                                setImages(images.filter((_, idx) => idx !== i));
                                            }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <label className="aspect-square bg-slate-50 rounded border border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors relative">
                                    <Upload className="h-6 w-6 mb-1" />
                                    <span className="text-xs">Yükle</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                        if (!e.target.files || e.target.files.length === 0) return;
                                        const file = e.target.files[0];
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                                        const filePath = `${fileName}`;

                                        const { error } = await supabase.storage.from('product-images').upload(filePath, file);

                                        if (error) {
                                            alert('Yükleme hatası: ' + error.message);
                                        } else {
                                            setImages([...images, {
                                                path: filePath,
                                                preview: URL.createObjectURL(file), // Or construct public URL immediately
                                                file: file
                                            }]);
                                        }
                                    }} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
