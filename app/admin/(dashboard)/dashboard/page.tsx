import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitorsChart } from '@/components/admin/dashboard/VisitorsChart';
import { FileText, Image as ImageIcon, LayoutGrid, Users, Eye } from 'lucide-react';
import Link from 'next/link';

// Simple helper to get dates
function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch counts
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    const { count: categoriesCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });

    // Fetch Analytics (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: views } = await supabase
        .from('page_views')
        .select('visited_at')
        .gte('visited_at', sevenDaysAgo.toISOString());

    // Process data for chart
    const last7Days = getLast7Days();
    const chartData = last7Days.map(date => {
        const dayViews = views?.filter(v => v.visited_at.startsWith(date)).length || 0;
        return {
            name: new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' }),
            total: dayViews
        };
    });

    const totalViews = views?.length || 0;
    const today = new Date().toISOString().split('T')[0];
    const todayViews = views?.filter(v => v.visited_at.startsWith(today)).length || 0;

    const stats = [
        { title: 'Toplam Ürün', value: productsCount || 0, icon: LayoutGrid, href: '/admin/products', color: 'text-blue-600' },
        { title: 'Blog Yazıları', value: articlesCount || 0, icon: FileText, href: '/admin/articles', color: 'text-green-600' },
        { title: 'Kategoriler', value: categoriesCount || 0, icon: ImageIcon, href: '/admin/categories', color: 'text-purple-600' },
        { title: 'Bugünkü Ziyaret', value: todayViews, icon: Eye, href: '#', color: 'text-orange-600' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Genel Bakış</h1>
            <CardContent>
                <div className="text-2xl font-bold">Aktif</div>
                <p className="text-xs text-muted-foreground">Ayarlar yapılandırıldı</p>
            </CardContent>
        </Card>
            </div >
        </div >
    );
}
