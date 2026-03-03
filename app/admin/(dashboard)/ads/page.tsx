"use client";

import { useState, useEffect } from "react";
import { Megaphone, TrendingUp, Image as ImageIcon, Sparkles, Package } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function MetaAdsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        dailyBudget: 100, // in main currency
        creativeImageUrl: "",
        creativeHeadline: "",
        creativeBody: "",
        linkUrl: ""
    });

    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('id, title, price, image_url, description, slug').order('created_at', { ascending: false }).limit(50);
            if (!error && data) {
                setProducts(data);
            }
        };
        fetchProducts();
    }, [supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
            // 1. Generate Ad Copy (similar to Instagram but tailored for Ads if possible, or same API)
            const res = await fetch("/api/ai/generate-caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: product.title,
                    productPrice: product.price,
                    productFeatures: product.description + " (Bu metin Facebook/Instagram sponsorlu reklamı için yazılacak)"
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const generatedBody = data.text || "Bu fırsatı kaçırmayın!";

            // 2. Generate Ad Headline (shorter)
            const resHeadline = await fetch("/api/ai/generate-caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: product.title,
                    productPrice: product.price,
                    productFeatures: "Sadece 3-4 kelimelik çok vurucu bir başlık yaz."
                })
            });
            const dataHeadline = await resHeadline.json();
            const generatedHeadline = dataHeadline.text ? dataHeadline.text.replace(/["']/g, "") : product.title;

            // 3. Generate OG Image URL (We can use a square format if we had one, but story format works for some placements or we fallback to product image)
            // For Facebook feed, a 1:1 or 1.91:1 image is better. For now we use the raw product image to ensure it looks good in feed, or the OG generator.
            // Let's use the product image directly for feed ads if available, as OG Story image is 9:16 and will be cropped heavily in FB feed.
            const imageUrl = product.image_url || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000";

            setFormData(prev => ({
                ...prev,
                name: `${product.title} - AI Kampanyası`,
                creativeImageUrl: imageUrl,
                creativeHeadline: generatedHeadline.substring(0, 50),
                creativeBody: generatedBody,
                linkUrl: `${window.location.origin}/products/${product.slug || product.id}`
            }));

        } catch (error: any) {
            setResult({ error: error.message || "Yapay zeka içeriği oluşturulamadı." });
        }

        setGenerating(false);
    };

    const handleCreateAd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/meta/ads/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    dailyBudget: Number(formData.dailyBudget) * 100 // converting to cents
                })
            });
            const data = await res.json();
            setResult(data);
        } catch (error: any) {
            setResult({ error: error.message });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Meta Reklamları (Ads Manager)</h1>
                <p className="text-slate-500">Ürünlerinizi seçin, yapay zeka reklam metinlerini hazırlasın, tek tıkla kampanyayı başlatın.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="col-span-1 lg:col-span-3 space-y-6">

                    {/* Setup / Generation Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="pb-4 pt-1 border-b border-slate-100 flex items-center gap-2 text-indigo-600 font-semibold text-lg">
                            <Sparkles size={20} /> AI Reklam Üretici
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Reklamı Yapılacak Ürün</label>
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
                            <p className="text-xs text-slate-500">Seçtiğiniz ürüne özel çarpıcı reklam metinleri, başlıklar ve görseller otomatik üretilecektir.</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={generating || !selectedProductId}
                            className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            {generating ? "Yapay Zeka Reklamı Hazırlıyor..." : "Otomatik Reklam Hazırla (AI)"}
                        </button>
                    </div>

                    <form onSubmit={handleCreateAd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">

                        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" /> Kampanya Ayarları
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Kampanya Adı</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Günlük Bütçe (TL)</label>
                                <input required type="number" min="10" name="dailyBudget" value={formData.dailyBudget || ""} onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: Number(e.target.value) }))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="pb-4 pt-4 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Megaphone size={20} className="text-blue-600" /> Reklam Kreatifi (AI Tarafından Dolduruldu)
                            </h2>
                        </div>

                        <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Görsel URL</label>
                                <input required type="url" name="creativeImageUrl" value={formData.creativeImageUrl} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Başlık (Headline)</label>
                                <input required type="text" name="creativeHeadline" value={formData.creativeHeadline} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Ana Metin (Body)</label>
                                <textarea required name="creativeBody" value={formData.creativeBody} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Yönlendirilecek URL</label>
                                <input required type="url" name="linkUrl" value={formData.linkUrl} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>

                        {result && (
                            <div className={`p-4 rounded-lg text-sm ${result.error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                {result.error ? result.error : (
                                    <div>
                                        <span className="font-semibold block mb-1">Başarıyla Oluşturuldu (Taslak)</span>
                                        Kampanya ID: {result.campaignId}<br />
                                        Reklam Seti ID: {result.adsetId}<br />
                                        Reklam ID: {result.adId}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={loading || !formData.creativeImageUrl} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20">
                                {loading ? "Oluşturuluyor..." : "Meta Ads'e Gönder ve Kampanyayı Başlat"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="col-span-1 lg:col-span-2">
                    {/* Facebook Ad Preview Mockup */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-slate-700 text-sm flex items-center justify-between">
                            Reklam Önizlemesi
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Facebook Akışı</span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                <div>
                                    <div className="font-semibold text-sm text-slate-900">Sayfa Adı</div>
                                    <div className="text-[11px] text-slate-500">Sponsorlu</div>
                                </div>
                            </div>
                            <div className="text-sm text-slate-800 mb-3 whitespace-pre-wrap">
                                {formData.creativeBody || "Reklam açıklama metni burada görüntülenecek..."}
                            </div>
                        </div>
                        <div className="bg-slate-100 aspect-[1.91/1] w-full relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {generating ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm z-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                                </div>
                            ) : null}
                            {formData.creativeImageUrl ? (
                                <img src={formData.creativeImageUrl} alt="Ad Creative" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    <ImageIcon size={32} className="opacity-50" />
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100">
                            <div className="overflow-hidden">
                                <div className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">rotabiletiket.com</div>
                                <div className="font-bold text-slate-900 leading-tight truncate">{formData.creativeHeadline || "Reklam Başlığı"}</div>
                            </div>
                            <div className="ml-4 shrink-0 bg-slate-200 text-slate-800 text-sm font-semibold px-4 py-1.5 rounded">
                                Daha Fazla Bilgi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
