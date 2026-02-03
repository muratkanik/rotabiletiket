'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    Tags,
    Settings,
    LogOut,
    BarChart,
    Image as ImageIcon,
    Users,
    BookOpen
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
    { name: 'Genel Bakış', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Ürünler', href: '/admin/products', icon: Package },
    { name: 'Görseller', href: '/admin/images', icon: ImageIcon },
    { name: 'Hero Slider', href: '/admin/hero', icon: LayoutDashboard },
    { name: 'Kategoriler', href: '/admin/categories', icon: Tags },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Site Ayarları', href: '/admin/settings', icon: Settings },
    { name: 'SEO & Analiz', href: '/admin/seo', icon: BarChart },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <div className="w-64 bg-slate-900 min-h-screen text-slate-300 flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white tracking-wider">ROTABİL<span className="text-orange-500">ADMIN</span></h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                isActive
                                    ? "bg-orange-600 text-white shadow-md font-medium"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
                >
                    <LogOut size={20} />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
}
