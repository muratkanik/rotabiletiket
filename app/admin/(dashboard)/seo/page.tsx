import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminSEOPage() {
    const supabase = await createClient();

    // Fetch global SEO settings (assuming we store them in site_settings)
    const { data: settings } = await supabase
        .from('site_settings')
        .select('*');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">SEO & Analiz Ayarları</h1>
                <Button className="bg-orange-600 hover:bg-orange-700">Kaydet</Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Genel Meta Etiketleri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Başlığı (Default Title)</label>
                            <Input defaultValue="Rotabil Etiket | Barkod ve Otomasyon Sistemleri" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Açıklaması (Description)</label>
                            <Input defaultValue="Endüstriyel etiket, barkod yazıcı, ribbon ve otomasyon çözümleri." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Google Analytics & Tag Manager</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Google Analytics ID (GT-XXXX)</label>
                            <Input placeholder="GT-..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Google Verification Code</label>
                            <Input placeholder="google-site-verification=..." />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
