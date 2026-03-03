"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save } from "lucide-react";

export default function MetaSettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        meta_app_id: "",
        meta_app_secret: "",
        system_user_access_token: "",
        instagram_business_account_id: "",
        facebook_page_id: "",
        meta_ad_account_id: "",
        openai_api_key: ""
    });

    useEffect(() => {
        async function loadSettings() {
            const { data } = await supabase.from("meta_settings").select("*").single();
            if (data) setSettings(data);
        }
        loadSettings();
    }, [supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: existing } = await supabase.from("meta_settings").select("id").single();
        if (existing) {
            await supabase.from("meta_settings").update(settings).eq("id", existing.id);
        } else {
            await supabase.from("meta_settings").insert([settings]);
        }

        setLoading(false);
        alert("Ayarlar başarıyla kaydedildi!");
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Meta API Ayarları</h1>
                <p className="text-slate-500">Facebook ve Instagram API entegrasyonu için gerekli olan bilgileri girin.</p>
            </div>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Meta App ID</label>
                        <input required type="text" name="meta_app_id" value={settings.meta_app_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Meta App Secret</label>
                        <input required type="password" name="meta_app_secret" value={settings.meta_app_secret} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">System User Access Token</label>
                        <input required type="password" name="system_user_access_token" value={settings.system_user_access_token} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Instagram Business Account ID</label>
                        <input required type="text" name="instagram_business_account_id" value={settings.instagram_business_account_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Facebook Page ID</label>
                        <input required type="text" name="facebook_page_id" value={settings.facebook_page_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Meta Ad Account ID</label>
                        <input required type="text" name="meta_ad_account_id" value={settings.meta_ad_account_id} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-medium text-slate-700">OpenAI API Key (Yapay Zeka İçin)</label>
                        <input type="password" name="openai_api_key" value={settings.openai_api_key || ""} onChange={handleChange} placeholder="sk-proj-..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
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
