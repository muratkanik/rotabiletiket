'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminSEOPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [globalSeo, setGlobalSeo] = useState<any>({});
    const [seoScripts, setSeoScripts] = useState<any>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data: settings } = await supabase
            .from('site_settings')
            .select('*')
            .in('key', ['global_seo', 'seo_scripts']);

        if (settings) {
            settings.forEach(s => {
                if (s.key === 'global_seo') setGlobalSeo(s.value || {});
                if (s.key === 'seo_scripts') setSeoScripts(s.value || {});
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await supabase.from('site_settings').upsert({ key: 'global_seo', value: globalSeo });
            await supabase.from('site_settings').upsert({ key: 'seo_scripts', value: seoScripts });
            toast.success('SEO ve Analitik ayarları kaydedildi');
        } catch (error) {
            toast.error('Kaydedilirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">SEO & Analiz Ayarları</h1>
                    <p className="text-slate-500 mt-1">Google arama konsolu, analitik kodları ve genel meta ayarları</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Genel Meta Etiketleri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Başlığı (Default Title)</label>
                            <Input 
                                value={globalSeo.default_title || ''} 
                                onChange={e => setGlobalSeo({...globalSeo, default_title: e.target.value})}
                                placeholder="Örn: Rotabil Etiket | Barkod ve Otomasyon" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Açıklaması (Description)</label>
                            <Input 
                                value={globalSeo.default_description || ''} 
                                onChange={e => setGlobalSeo({...globalSeo, default_description: e.target.value})}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Google Analytics & Tag Manager</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Google Analytics ID (G-XXXX)</label>
                            <Input 
                                value={seoScripts.google_analytics_id || ''} 
                                onChange={e => setSeoScripts({...seoScripts, google_analytics_id: e.target.value})}
                                placeholder="G-BP1ZQJPD5X vb." 
                            />
                            <p className="text-xs text-slate-500 mt-1">Sadece ölçüm kimliğini girin. gtag js kodları otomatik eklenecektir.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Google Tag Manager ID (GTM-XXXX)</label>
                            <Input 
                                value={seoScripts.google_tag_manager_id || ''} 
                                onChange={e => setSeoScripts({...seoScripts, google_tag_manager_id: e.target.value})}
                                placeholder="GTM-..." 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Google Search Console Verification Code</label>
                            <Input 
                                value={seoScripts.google_search_console_verification || ''} 
                                onChange={e => setSeoScripts({...seoScripts, google_search_console_verification: e.target.value})}
                                placeholder="Örn: q_x... vb." 
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
