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
    BookOpen,
    Instagram,
    TrendingUp,
    Settings2,
    X
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
    { name: 'Genel Bakış', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Ürünler', href: '/admin/products', icon: Package },
    { name: 'Kategoriler', href: '/admin/categories', icon: Tags },
    { name: 'Sektörel Çözümler', href: '/admin/sectors', icon: BookOpen },
    { name: 'Bilgi Bankası', href: '/admin/articles', icon: BookOpen },
    { name: 'Görseller', href: '/admin/images', icon: ImageIcon },
    { name: 'Hero Slider', href: '/admin/hero', icon: LayoutDashboard },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Site Ayarları', href: '/admin/settings', icon: Settings },
    { name: 'SEO & Analiz', href: '/admin/seo', icon: BarChart },
    { name: 'Meta Ayarları', href: '/admin/meta-settings', icon: Settings2 },
    { name: 'Instagram', href: '/admin/instagram', icon: Instagram },
    { name: 'Meta Reklamları', href: '/admin/ads', icon: TrendingUp },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <div className={cn(
            "w-64 bg-slate-900 min-h-screen text-slate-300 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white tracking-wider">ROTABİL<span className="text-orange-500">ADMIN</span></h1>
                <button 
                    onClick={onClose}
                    className="lg:hidden text-slate-400 hover:text-white focus:outline-none"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
