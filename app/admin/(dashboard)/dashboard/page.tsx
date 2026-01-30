import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tags, Eye, FileText } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch some stats
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Genel Bakış</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Aktif ürün sayısı</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categoryCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Ana ve alt kategoriler</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SEO Durumu</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Aktif</div>
                        <p className="text-xs text-muted-foreground">Ayarlar yapılandırıldı</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
