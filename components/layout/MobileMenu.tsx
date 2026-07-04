'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Link } from '@/src/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

interface Category {
    id: string;
    title: string;
    slug: string;
}

interface MobileMenuProps {
    contactInfo?: any;
    categories?: Category[];
}

export function MobileMenu({ contactInfo, categories = [] }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const tNav = useTranslations('Navigation');
    const tCommon = useTranslations('Common');
    const locale = useLocale();

    const toggleMenu = () => setIsOpen(!isOpen);

    // Prevent body scrolling when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            <button
                onClick={toggleMenu}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-md"
                aria-label={tCommon('readMore')} // adapting fallback or using a generic open-menu label if available, or just keeping aria-label generic english/localized if strict
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-4 pb-6 overflow-y-auto">
                    <div className="flex flex-col space-y-4">
                        {/* Products Dropdown (Accordion) */}
                        <div className="flex flex-col">
                            <button
                                onClick={() => setIsProductsOpen(!isProductsOpen)}
                                className={`flex items-center justify-between w-full px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
                                    isProductsOpen ? 'bg-slate-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                                <span>{tNav('products')}</span>
                                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div 
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    isProductsOpen ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="flex flex-col space-y-1 pl-4 border-l-2 border-slate-100 ml-4 py-1">
                                    {categories.length > 0 ? categories.map(category => (
                                        <Link 
                                            key={category.id} 
                                            href={`/urunler/${category.slug}`} 
                                            className="text-slate-600 block py-2 px-4 rounded-md hover:bg-slate-50 hover:text-orange-600 transition-colors" 
                                            onClick={toggleMenu}
                                        >
                                            {category.title}
                                        </Link>
                                    )) : (
                                        <span className="text-slate-400 text-sm px-4 py-2">
                                            {locale === 'en' ? 'Loading...' : locale === 'ar' ? 'جاري التحميل...' : locale === 'fr' ? 'Chargement...' : locale === 'de' ? 'Wird geladen...' : 'Yükleniyor...'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link href="/sektorel-cozumler" className="text-lg font-medium text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" onClick={toggleMenu}>
                            {tNav('sectoral')}
                        </Link>
                        <Link href="/bilgi-bankasi" className="text-lg font-medium text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" onClick={toggleMenu}>
                            {tNav('blog')}
                        </Link>
                        <Link href="/hakkimizda" className="text-lg font-medium text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" onClick={toggleMenu}>
                            {tNav('about')}
                        </Link>
                        <Link href="/iletisim" className="text-lg font-medium text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" onClick={toggleMenu}>
                            {tNav('contact')}
                        </Link>

                        <div className="pt-4">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg" asChild>
                                <Link href="/iletisim" onClick={toggleMenu}>
                                    <Phone className="mr-2 h-5 w-5" /> {tCommon('getQuote')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
