"use client";

import { useState } from "react";
import { Megaphone, TrendingUp } from "lucide-react";

export default function MetaAdsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        dailyBudget: 100, // in cents
        creativeImageUrl: "",
        creativeHeadline: "",
        creativeBody: "",
        linkUrl: ""
    });
    const [result, setResult] = useState<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
                    dailyBudget: Number(formData.dailyBudget) * 100 // assuming UI input is in main currency like TL/USD
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
                <p className="text-slate-500">Yeni bir reklam kampanyası oluşturup Meta Reklam Yöneticisi taslaklarına gönderin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="col-span-1 lg:col-span-3">
                    <form onSubmit={handleCreateAd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">

                        <div className="pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" /> Kampanya Bilgileri
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Kampanya Adı</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Günlük Bütçe (TL)</label>
                                <input required type="number" min="10" name="dailyBudget" value={formData.dailyBudget / 100 || ""} onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: Number(e.target.value) * 100 }))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="pb-4 pt-4 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Megaphone size={20} className="text-blue-600" /> Reklam Kreatifi
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Görsel URL</label>
                                <input required type="url" name="creativeImageUrl" value={formData.creativeImageUrl} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Başlık (Headline)</label>
                                <input required type="text" name="creativeHeadline" value={formData.creativeHeadline} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Açıklama (Ana Metin)</label>
                                <textarea required name="creativeBody" value={formData.creativeBody} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Hedef Link URL</label>
                                <input required type="url" name="linkUrl" value={formData.linkUrl} onChange={handleChange} placeholder="https://rotabilet.com/ilgili-sayfa" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
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
                            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20">
                                {loading ? "Oluşturuluyor..." : "Meta Ads'e Gönder"}
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
                        <div className="bg-slate-100 aspect-[1.91/1] w-full relative">
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
                                <div className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">rotabilet.com</div>
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
