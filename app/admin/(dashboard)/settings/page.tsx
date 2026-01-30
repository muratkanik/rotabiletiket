'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const [seoScripts, setSeoScripts] = useState<any>({});
    const [globalSeo, setGlobalSeo] = useState<any>({});
    const [heroSettings, setHeroSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        const { data } = await supabase.from('site_settings').select('*');
        if (data) {
            const scriptData = data.find(d => d.key === 'seo_scripts')?.value || {};
            const seoData = data.find(d => d.key === 'global_seo')?.value || {};
            const heroData = data.find(d => d.key === 'hero_section')?.value || {};

            setSeoScripts(scriptData);
            setGlobalSeo(seoData);
            setHeroSettings(heroData);
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);

        const updates = [
            supabase.from('site_settings').upsert({ key: 'seo_scripts', value: seoScripts }),
            supabase.from('site_settings').upsert({ key: 'global_seo', value: globalSeo }),
            supabase.from('site_settings').upsert({ key: 'hero_section', value: heroSettings }),
        ];

        await Promise.all(updates);
        setSaving(false);
        router.refresh(); // Refresh server components
        alert('Ayarlar başarıyla kaydedildi!');
    }

    if (loading) return <div className="p-8">Ayarlar yükleniyor...</div>;

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Site Ayarları</h1>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>

            {/* SEO & Scripts */}
            <Card>
                <CardHeader>
                    <CardTitle>SEO & Takip Kodları</CardTitle>
                    <p className="text-sm text-muted-foreground">Google Analytics, GTM ve diğer doğrulama kodları.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Google Analytics ID (ID-XXXX)</label>
                            <input
                                className="w-full border rounded p-2 text-sm"
                                value={seoScripts.google_analytics_id || ''}
                                onChange={e => setSeoScripts({ ...seoScripts, google_analytics_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Google Tag Manager ID (GTM-XXXX)</label>
                            <input
                                className="w-full border rounded p-2 text-sm"
                                value={seoScripts.google_tag_manager_id || ''}
                                onChange={e => setSeoScripts({ ...seoScripts, google_tag_manager_id: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Google Search Console Verification</label>
                            <input
                                className="w-full border rounded p-2 text-sm font-mono text-xs"
                                value={seoScripts.google_search_console_verification || ''}
                                onChange={e => setSeoScripts({ ...seoScripts, google_search_console_verification: e.target.value })}
                                placeholder='<meta name="google-site-verification" ... /> veya sadece kod'
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Özel Scriptler (Head)</label>
                            <textarea
                                className="w-full border rounded p-2 text-sm font-mono text-xs h-24"
                                value={seoScripts.custom_head_scripts || ''}
                                onChange={e => setSeoScripts({ ...seoScripts, custom_head_scripts: e.target.value })}
                                placeholder="<script>...</script>"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Global Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle>Genel SEO Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Varsayılan Site Başlığı</label>
                        <input
                            className="w-full border rounded p-2 text-sm"
                            value={globalSeo.default_title || ''}
                            onChange={e => setGlobalSeo({ ...globalSeo, default_title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Varsayılan Açıklama (Meta Description)</label>
                        <textarea
                            className="w-full border rounded p-2 text-sm h-20"
                            value={globalSeo.default_description || ''}
                            onChange={e => setGlobalSeo({ ...globalSeo, default_description: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Hero Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Giriş Ekranı (Hero)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Ana Başlık (HTML Destekli)</label>
                        <input
                            className="w-full border rounded p-2 text-sm font-mono"
                            value={heroSettings.title || ''}
                            onChange={e => setHeroSettings({ ...heroSettings, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Alt Başlık</label>
                        <textarea
                            className="w-full border rounded p-2 text-sm h-20"
                            value={heroSettings.subtitle || ''}
                            onChange={e => setHeroSettings({ ...heroSettings, subtitle: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Video URL</label>
                        <input
                            className="w-full border rounded p-2 text-sm"
                            value={heroSettings.video_url || ''}
                            onChange={e => setHeroSettings({ ...heroSettings, video_url: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
