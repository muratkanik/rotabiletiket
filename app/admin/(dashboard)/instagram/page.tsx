"use client";

import { useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";

export default function InstagramPage() {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [result, setResult] = useState<any>(null);

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
            setResult(data);
        } catch (error: any) {
            setResult({ error: error.message });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Instagram Otomasyonu</h1>
                    <p className="text-slate-500">Instagram hesabınızda anında otomatik gönderi yayınlayın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handlePublish} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 h-fit">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Resim URL (Herkese Açık)</label>
                        <div className="flex relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <ImageIcon size={18} />
                            </div>
                            <input required type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://ornek.com/resim.jpg" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                        </div>
                        <p className="text-xs text-slate-500">Resmin Meta sunucuları tarafından ulaşılabilir bir URL olması gerekmektedir.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Açıklama (Caption)</label>
                        <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={5} placeholder="Gönderi açıklamasını buraya yazın..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"></textarea>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-lg text-sm ${result.error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {result.error ? result.error : `Başarıyla yayınlandı! Gönderi ID: ${result.meta_post_id}`}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2">
                        <Send size={18} />
                        {loading ? "Yayınlanıyor..." : "Hemen Yayınla"}
                    </button>
                </form>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h3 className="font-semibold text-slate-800">Önizleme</h3>
                    </div>
                    <div className="flex-1 p-6 flex items-center justify-center bg-slate-100">
                        {imageUrl ? (
                            <div className="max-w-xs w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-3 flex items-center gap-2 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full bg-white rounded-full border-2 border-white"></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800">hesabiniz</span>
                                </div>
                                <div className="aspect-square bg-slate-100 relative">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-slate-800"><span className="font-semibold mr-2">hesabiniz</span>{caption || "Gönderi açıklaması burada görünecek..."}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-center">
                                <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Bir resim URL&apos;si girin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
