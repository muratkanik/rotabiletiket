"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save, AlertCircle } from "lucide-react";

export default function MetaSettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // We start with an empty object
    const [settings, setSettings] = useState({
        meta_app_id: "",
        meta_app_secret: "",
        system_user_access_token: "",
        instagram_business_account_id: "",
        facebook_page_id: "",
        meta_ad_account_id: "",
        openai_api_key: "",
        serper_api_key: "",
        gemini_api_key: ""
    });

    useEffect(() => {
        async function loadSettings() {
            setInitialLoading(true);
            try {
                const { data, error } = await supabase.from("meta_settings").select("*").maybeSingle();

                if (error) {
                    console.error("Settings load error:", error);
                    setErrorMsg("Ayarlar yüklenirken bir hata oluştu: " + error.message);
                }

                if (data) {
                    setSettings({
                        meta_app_id: data.meta_app_id || "",
                        meta_app_secret: data.meta_app_secret || "",
                        system_user_access_token: data.system_user_access_token || "",
                        instagram_business_account_id: data.instagram_business_account_id || "",
                        facebook_page_id: data.facebook_page_id || "",
                        meta_ad_account_id: data.meta_ad_account_id || "",
                        openai_api_key: data.openai_api_key || "",
                        serper_api_key: data.serper_api_key || "",
                        gemini_api_key: data.gemini_api_key || ""
                    });
                }
            } catch (err) {
                console.error("Fetch Exception:", err);
            } finally {
                setInitialLoading(false);
            }
        }
        loadSettings();
    }, [supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const { data: existing } = await supabase.from("meta_settings").select("id").maybeSingle();

            // Allow partial updates if the user leaves something blank but it existed before
            // Actually, since we populated state from `data` in `loadSettings`, the state has the latest values.
            // If they are "", the user either explicitly cleared them or they were never set.
            const payload = { ...settings };

            if (existing && existing.id) {
                const { error: updateError } = await supabase.from("meta_settings").update(payload).eq("id", existing.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase.from("meta_settings").insert([payload]);
                if (insertError) throw insertError;
            }

            alert("Ayarlar başarıyla kaydedildi!");
        } catch (err: any) {
            console.error("Save error:", err);
            setErrorMsg("Kaydedilirken hata oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="max-w-4xl flex items-center justify-center py-20">
                <div className="text-slate-500 animate-pulse">Ayarlar yükleniyor...</div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Meta API Ayarları</h1>
                <p className="text-slate-500">Facebook ve Instagram API entegrasyonu için gerekli olan bilgileri girin.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Meta App ID</label>
                        <input type="text" name="meta_app_id" value={settings.meta_app_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Meta App Secret</label>
                        <input type="password" name="meta_app_secret" value={settings.meta_app_secret} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">System User Access Token</label>
                        <input type="password" name="system_user_access_token" value={settings.system_user_access_token} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Instagram Business Account ID</label>
                        <input type="text" name="instagram_business_account_id" value={settings.instagram_business_account_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Facebook Page ID</label>
                        <input type="text" name="facebook_page_id" value={settings.facebook_page_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Meta Ad Account ID</label>
                        <input type="text" name="meta_ad_account_id" value={settings.meta_ad_account_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 flex-col flex select-none pointer-events-none opacity-50 bg-slate-50 rounded-lg p-2 md:col-span-2 border border-slate-200/50 hidden">
                        {/* Hidden helper debug for values if needed */}
                    </div>
                    <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-medium text-slate-700">OpenAI API Key (Yapay Zeka İçin)</label>
                        <input type="password" name="openai_api_key" value={settings.openai_api_key} onChange={handleChange} placeholder="sk-proj-..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-medium text-slate-700">Gemini API Key (OpenAI Alternatifi / Yapay Zeka İçin)</label>
                        <input type="password" name="gemini_api_key" value={settings.gemini_api_key} onChange={handleChange} placeholder="AIzaSy..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-medium text-slate-700">Serper.dev API Key (SERP Analizi İçin)</label>
                        <input type="password" name="serper_api_key" value={settings.serper_api_key} onChange={handleChange} placeholder="1234abcd..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                        <Save size={18} />
                        {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
                    </button>
                </div>
            </form>
        </div>
    );
}
