'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b shadow-sm flex items-center px-4 lg:px-8 justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="font-semibold text-slate-800">Yönetim Paneli</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="hidden sm:inline-block">Admin User</span>
                    </div>
                </header>
                <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
