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
        .select('visited_at, path, referrer, country')
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Link href={stat.href} key={i}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Son 7 Günlük Ziyaretçi Grafiği</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <VisitorsChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Quick Actions or Info */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Son Durum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm font-medium text-slate-600">Toplam Ziyaret (Haftalık)</span>
                                <span className="font-bold text-slate-900">{totalViews}</span>
                            </div>

                            <div className="space-y-2 pt-2">
                                <span className="text-sm font-semibold text-slate-900 block">En Çok Ziyaret Alan Sayfalar</span>
                                {Object.entries(
                                    views?.reduce((acc: any, curr) => {
                                        // Simple path grouping
                                        const p = curr.path || '/';
                                        acc[p] = (acc[p] || 0) + 1;
                                        return acc;
                                    }, {}) || {}
                                )
                                    // @ts-ignore
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([path, count]: any, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="truncate max-w-[200px] text-slate-600" title={path}>{path}</span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Ziyaret Kaynakları (Referrer)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {views?.filter(v => v.referrer).length === 0 ? (
                                <p className="text-sm text-slate-500">Henüz kaynak verisi yok.</p>
                            ) : (
                                Object.entries(
                                    views?.filter(v => v.referrer).reduce((acc: any, curr) => {
                                        try {
                                            const domain = new URL(curr.referrer).hostname.replace('www.', '');
                                            // Ignore internal traffic
                                            if (!domain.includes('rotabiletiket.com') && !domain.includes('localhost')) {
                                                acc[domain] = (acc[domain] || 0) + 1;
                                            }
                                        } catch (e) { }
                                        return acc;
                                    }, {}) || {}
                                )
                                    // @ts-ignore
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([domain, count]: any, i) => (
                                        <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0 border-slate-100">
                                            <span className="font-medium text-slate-700">{domain}</span>
                                            <span className="text-slate-500">{count}</span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
