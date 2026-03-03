"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Send, Sparkles, Package } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function InstagramPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");

    const [imageUrl, setImageUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('id, title, price, image_url, description').order('created_at', { ascending: false }).limit(50);
            if (!error && data) {
                setProducts(data);
            }
        };
        fetchProducts();
    }, [supabase]);

    const handleGenerateAI = async () => {
        if (!selectedProductId) {
            setResult({ error: "Lütfen önce bir ürün seçin." });
            return;
        }

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        setGenerating(true);
        setResult(null);

        try {
            // 1. Generate Caption
            const res = await fetch("/api/ai/generate-caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: product.title,
                    productPrice: product.price,
                    productFeatures: product.description
                })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const generatedCaption = data.text || "Muhteşem bir ürün! Kaçırmak istemezsin.";
            setCaption(generatedCaption);

            // 2. Generate OG Image URL
            const baseUrl = window.location.origin;
            const ogParams = new URLSearchParams({
                title: product.title || "",
                price: product.price ? String(product.price) : "",
                image: product.image_url || "",
                caption: generatedCaption
            });

            setImageUrl(`${baseUrl}/api/og/story?${ogParams.toString()}`);

        } catch (error: any) {
            setResult({ error: error.message || "Yapay zeka içeriği oluşturulamadı. Lütfen Meta Ayarlarından OpenAI API anahtarınızı kontrol edin." });
        }

        setGenerating(false);
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/meta/instagram/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl, caption })
            });
            const data = await res.json();

            if (data.error) {
                setResult(data);
            } else {
                setResult(data);
                // Clear form after success if desired, but here we keep it to show preview
            }
        } catch (error: any) {
            setResult({ error: error.message });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Instagram Otomasyonu</h1>
                    <p className="text-slate-500">Hazırladığınız ürünlerden otomatik AI destekli Story şablonu oluşturun ve yayınlayın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Setup / Generation Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="pb-4 pt-1 border-b border-slate-100 flex items-center gap-2 text-indigo-600 font-semibold text-lg">
                            <Sparkles size={20} /> AI İçerik Üretici
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Web Sitenizdeki Ürünü Seçin</label>
                            <div className="flex relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 z-10">
                                    <Package size={18} />
                                </div>
                                <SearchableSelect
                                    options={products.map((p) => ({ value: p.id, label: `${p.title} (${p.price ? p.price + " TL" : "Fiyatsız"})` }))}
                                    value={selectedProductId}
                                    onChange={setSelectedProductId}
                                    placeholder="Ürün Ara ve Seç..."
                                    emptyText="Bu isimde bir ürün bulunamadı."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 h-[46px]"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Seçtiğiniz ürünün verileri (isim, fiyat, resim) alınarak otonom bir metin ve hikaye görseli (1080x1920) yaratılacaktır.</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={generating || !selectedProductId}
                            className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            {generating ? "Yapay Zeka Çalışıyor..." : "Otomatik Oluştur (AI)"}
                        </button>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handlePublish} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
                        <div className="pb-4 pt-1 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-semibold text-lg">
                            <ImageIcon size={20} className="text-slate-500" /> Paylaşım Detayları
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Resim URL</label>
                            <div className="flex relative">
                                <input required type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://ornek.com/resim.jpg" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Açıklama (Caption)</label>
                            <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={4} placeholder="Gönderi açıklamasını buraya yazın..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"></textarea>
                        </div>

                        {result && (
                            <div className={`p-4 rounded-lg text-sm ${result.error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                {result.error ? result.error : `Başarıyla yayınlandı! Gönderi ID: ${result.meta_post_id}`}
                            </div>
                        )}

                        <button type="submit" disabled={loading || !imageUrl} className="w-full mt-auto py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2">
                            <Send size={18} />
                            {loading ? "Yayınlanıyor..." : "Hemen Story Olarak Yayınla"}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col sticky top-24">
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <h3 className="font-semibold text-slate-800">Canlı Önizleme (Story Formatı)</h3>
                        </div>
                        <div className="flex-1 p-6 flex flex-col items-center bg-slate-100 min-h-[500px]">
                            {imageUrl ? (
                                <div className="w-full max-w-[280px] aspect-[9/16] bg-slate-200 rounded-xl overflow-hidden shadow-lg border-2 border-slate-800 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {generating ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm z-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                                        </div>
                                    ) : null}
                                    <img src={imageUrl} alt="Story Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            ) : (
                                <div className="text-slate-400 text-center flex-1 flex flex-col justify-center items-center h-full">
                                    <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Bir ürün seçip AI ile oluşturduğunuzda<br /> 9:16 Hikaye önizlemeniz burada belirecektir.</p>
                                </div>
                            )}

                            {caption && (
                                <div className="mt-6 w-full max-w-[280px] bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-700 shadow-sm leading-relaxed">
                                    <span className="font-semibold text-indigo-600 block mb-1">Açıklama:</span>
                                    {caption}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
