'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="md:hidden">
            <button
                onClick={toggleMenu}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-md"
                aria-label="Menüyü aç"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-4 pb-6 overflow-y-auto">
                    <div className="flex flex-col space-y-4">
                        {/* Products Dropdown */}
                        <div className="border-b border-slate-100 pb-4">
                            <button
                                onClick={() => setIsProductsOpen(!isProductsOpen)}
                                className="flex items-center justify-between w-full text-lg font-medium text-slate-800 py-2"
                            >
                                Ürünlerimiz
                                <ChevronDown className={`h-5 w-5 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProductsOpen && (
                                <div className="pl-4 mt-2 flex flex-col space-y-3">
                                    <Link href="/urunler/etiketler" className="text-slate-600 block py-1" onClick={toggleMenu}>
                                        Etiketler
                                    </Link>
                                    <Link href="/urunler/ribonlar" className="text-slate-600 block py-1" onClick={toggleMenu}>
                                        Ribonlar
                                    </Link>
                                    <Link href="/urunler/barkod-yazicilar" className="text-slate-600 block py-1" onClick={toggleMenu}>
                                        Barkod Yazıcılar
                                    </Link>
                                    <Link href="/urunler/barkod-yazici-kafasi" className="text-slate-600 block py-1" onClick={toggleMenu}>
                                        Yazıcı Kafaları
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link href="/sektorel-cozumler" className="text-lg font-medium text-slate-800 py-2 border-b border-slate-100" onClick={toggleMenu}>
                            Sektörel Çözümler
                        </Link>
                        <Link href="/bilgi-bankasi" className="text-lg font-medium text-slate-800 py-2 border-b border-slate-100" onClick={toggleMenu}>
                            Bilgi Bankası
                        </Link>
                        <Link href="/hakkimizda" className="text-lg font-medium text-slate-800 py-2 border-b border-slate-100" onClick={toggleMenu}>
                            Hakkımızda
                        </Link>
                        <Link href="/iletisim" className="text-lg font-medium text-slate-800 py-2 border-b border-slate-100" onClick={toggleMenu}>
                            İletişim
                        </Link>

                        <div className="pt-4">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg" asChild>
                                <Link href="/iletisim" onClick={toggleMenu}>
                                    <Phone className="mr-2 h-5 w-5" /> Teklif Al
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
