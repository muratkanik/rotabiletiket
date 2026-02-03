'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const LANGUAGES = ['tr', 'en', 'de', 'fr', 'ar'];

export default function AdminSettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Store settings by key
    const [contactInfo, setContactInfo] = useState<any>({});
    const [footerContent, setFooterContent] = useState<any>({
        motto: {},
        social_links: {},
        copyright_text: {}
    });

    // Legal Texts (localized)
    const [privacyPolicy, setPrivacyPolicy] = useState<any>({});
    const [kvkk, setKvkk] = useState<any>({});
    const [userAgreement, setUserAgreement] = useState<any>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data: settings, error } = await supabase
            .from('site_settings')
            .select('*')
            .in('key', ['contact_info', 'footer_content', 'privacy_policy', 'kvkk', 'user_agreement']);

        if (settings) {
            settings.forEach(s => {
                if (s.key === 'contact_info') setContactInfo(s.value);
                if (s.key === 'footer_content') setFooterContent(s.value);
                if (s.key === 'privacy_policy') setPrivacyPolicy(s.value);
                if (s.key === 'kvkk') setKvkk(s.value);
                if (s.key === 'user_agreement') setUserAgreement(s.value);
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await supabase.from('site_settings').upsert({ key: 'contact_info', value: contactInfo });
            await supabase.from('site_settings').upsert({ key: 'footer_content', value: footerContent });

            // Save Legal Texts
            await supabase.from('site_settings').upsert({ key: 'privacy_policy', value: privacyPolicy });
            await supabase.from('site_settings').upsert({ key: 'kvkk', value: kvkk });
            await supabase.from('site_settings').upsert({ key: 'user_agreement', value: userAgreement });

            toast.success('Ayarlar kaydedildi');
        } catch (error) {
            console.error(error);
            toast.error('Kaydedilirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Ayarlar yükleniyor...</div>;

    return (
        <div className="max-w-6xl space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Site Ayarları</h1>
                    <p className="text-slate-500 mt-1">Genel yapılandırma, hukuksal metinler ve footer yönetimi</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>

            <Tabs defaultValue="contact">
                <TabsList className="w-full justify-start h-auto flex-wrap bg-slate-100 p-2 rounded-lg gap-2">
                    <TabsTrigger value="contact" className="px-6 py-2">İletişim Bilgileri</TabsTrigger>
                    <TabsTrigger value="footer" className="px-6 py-2">Footer & Sosyal</TabsTrigger>
                    <TabsTrigger value="privacy" className="px-6 py-2">Gizlilik Politikası</TabsTrigger>
                    <TabsTrigger value="kvkk" className="px-6 py-2">KVKK</TabsTrigger>
                    <TabsTrigger value="agreement" className="px-6 py-2">Kullanıcı Sözleşmesi</TabsTrigger>
                </TabsList>

                {/* Contact Info Tab */}
                <TabsContent value="contact" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Genel İletişim</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>E-posta Adresi</Label>
                                <Input
                                    value={contactInfo.email || ''}
                                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefon Numarası</Label>
                                <Input
                                    value={contactInfo.phone || ''}
                                    onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Adres</Label>
                                <Textarea
                                    value={contactInfo.address || ''}
                                    onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Google Maps Linki</Label>
                                <Input
                                    value={contactInfo.maps_url || ''}
                                    onChange={e => setContactInfo({ ...contactInfo, maps_url: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Footer Content Tab */}
                <TabsContent value="footer" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Sosyal Medya Linkleri</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Facebook</Label>
                                    <Input
                                        value={footerContent.social_links?.facebook || ''}
                                        onChange={e => setFooterContent({ ...footerContent, social_links: { ...footerContent.social_links, facebook: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Instagram</Label>
                                    <Input
                                        value={footerContent.social_links?.instagram || ''}
                                        onChange={e => setFooterContent({ ...footerContent, social_links: { ...footerContent.social_links, instagram: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>LinkedIn</Label>
                                    <Input
                                        value={footerContent.social_links?.linkedin || ''}
                                        onChange={e => setFooterContent({ ...footerContent, social_links: { ...footerContent.social_links, linkedin: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Footer Yazıları (Çok Dilli)</CardTitle></CardHeader>
                        <CardContent>
                            <Tabs defaultValue="tr" className="w-full">
                                <TabsList className="mb-4">
                                    {LANGUAGES.map(lang => (
                                        <TabsTrigger key={lang} value={lang} className="uppercase">{lang}</TabsTrigger>
                                    ))}
                                </TabsList>

                                {LANGUAGES.map(lang => (
                                    <TabsContent key={lang} value={lang} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Alt Slogan (Motto)</Label>
                                            <Textarea
                                                value={footerContent.motto?.[lang] || ''}
                                                onChange={e => setFooterContent({
                                                    ...footerContent,
                                                    motto: { ...footerContent.motto, [lang]: e.target.value }
                                                })}
                                                placeholder={`${lang.toUpperCase()} Slogan...`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Copyright Metni</Label>
                                            <Input
                                                value={footerContent.copyright_text?.[lang] || ''}
                                                onChange={e => setFooterContent({
                                                    ...footerContent,
                                                    copyright_text: { ...footerContent.copyright_text, [lang]: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Privacy Policy Tab */}
                <TabsContent value="privacy" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gizlilik Politikası Yönetimi</CardTitle>
                            <p className="text-sm text-slate-500">Her dil için ayrı içerik girebilirsiniz. HTML destekler.</p>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="tr" className="w-full">
                                <TabsList className="mb-4">
                                    {LANGUAGES.map(lang => (
                                        <TabsTrigger key={lang} value={lang} className="uppercase">{lang}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {LANGUAGES.map(lang => (
                                    <TabsContent key={lang} value={lang}>
                                        <Textarea
                                            value={privacyPolicy?.[lang] || ''}
                                            onChange={e => setPrivacyPolicy({ ...privacyPolicy, [lang]: e.target.value })}
                                            className="min-h-[400px] font-mono text-sm"
                                            placeholder={`<h3>Başlık (Örn)</h3>\n<p>İçerik buraya...</p>`}
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* KVKK Tab */}
                <TabsContent value="kvkk" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>KVKK Metni Yönetimi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="tr" className="w-full">
                                <TabsList className="mb-4">
                                    {LANGUAGES.map(lang => (
                                        <TabsTrigger key={lang} value={lang} className="uppercase">{lang}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {LANGUAGES.map(lang => (
                                    <TabsContent key={lang} value={lang}>
                                        <Textarea
                                            value={kvkk?.[lang] || ''}
                                            onChange={e => setKvkk({ ...kvkk, [lang]: e.target.value })}
                                            className="min-h-[400px] font-mono text-sm"
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* User Agreement Tab */}
                <TabsContent value="agreement" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kullanıcı Sözleşmesi Yönetimi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="tr" className="w-full">
                                <TabsList className="mb-4">
                                    {LANGUAGES.map(lang => (
                                        <TabsTrigger key={lang} value={lang} className="uppercase">{lang}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {LANGUAGES.map(lang => (
                                    <TabsContent key={lang} value={lang}>
                                        <Textarea
                                            value={userAgreement?.[lang] || ''}
                                            onChange={e => setUserAgreement({ ...userAgreement, [lang]: e.target.value })}
                                            className="min-h-[400px] font-mono text-sm"
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
