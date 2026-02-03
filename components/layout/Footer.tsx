import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/settings';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function Footer({ locale }: { locale: string }) {
    const contactInfo = await getSiteSettings('contact_info');
    const footerContent = await getSiteSettings('footer_content');

    const t = await getTranslations('Navigation');
    const common = await getTranslations('Common');

    // Helper to safety get localized string from JSONB
    const getLocStr = (obj: any, key: string) => {
        if (!obj || !obj[key]) return '';
        return obj[key][locale] || obj[key]['tr'] || ''; // Fallback to TR
    };

    const motto = getLocStr(footerContent, 'motto');
    const facebookLink = footerContent?.social_links?.facebook || '#';
    const instagramLink = footerContent?.social_links?.instagram || '#';
    const linkedinLink = footerContent?.social_links?.linkedin || '#';

    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="block relative h-10 w-40">
                            {/* Using brightness-0 invert to make logo white if needed, or just standard logo */}
                            <Image
                                src="/logo.png"
                                alt="Rotabil Etiket"
                                fill
                                className="object-contain" // brightness-0 invert logic removed if logo is already suitable
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {motto || '2000 yılından beri endüstriyel etiket, ribon ve barkod çözümlerinde güvenilir çözüm ortağınız.'}
                        </p>
                        <div className="flex gap-4">
                            {facebookLink && (
                                <Link href={facebookLink} target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                    <Facebook size={18} />
                                </Link>
                            )}
                            {instagramLink && (
                                <Link href={instagramLink} target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                    <Instagram size={18} />
                                </Link>
                            )}
                            {linkedinLink && (
                                <Link href={linkedinLink} target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                    <Linkedin size={18} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        {/* Assuming 'Corporate' translation exists or hardcode localized logic */}
                        <h3 className="font-bold text-lg mb-6">
                            {locale === 'en' ? 'Corporate' : locale === 'ar' ? 'الشركة' : 'Kurumsal'}
                        </h3>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link href="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
                            <li><Link href="/hakkimizda" className="hover:text-white transition-colors">{t('about')}</Link></li>
                            <li><Link href="/sektorel-cozumler" className="hover:text-white transition-colors">{t('sectoral')}</Link></li>
                            <li><Link href="/bilgi-bankasi" className="hover:text-white transition-colors">{t('blog')}</Link></li>
                            <li><Link href="/iletisim" className="hover:text-white transition-colors">{t('contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t('products')}</h3>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link href="/urunler/etiketler" className="hover:text-white transition-colors">{t('labels')}</Link></li>
                            <li><Link href="/urunler/ribonlar" className="hover:text-white transition-colors">{t('ribbons')}</Link></li>
                            <li><Link href="/urunler/barkod-yazicilar" className="hover:text-white transition-colors">{t('printers')}</Link></li>
                            <li><Link href="/urunler/yedek-parca" className="hover:text-white transition-colors">{t('printheads')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact - Consuming Dynamic Settings */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t('contact')}</h3>
                        <ul className="space-y-4 text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-orange-500 shrink-0 mt-1" size={18} />
                                <span className="text-sm">{contactInfo?.address || 'İstanbul, Türkiye'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-orange-500 shrink-0" size={18} />
                                <span className="text-sm">{contactInfo?.phone || '+90 216 595 03 23'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-orange-500 shrink-0" size={18} />
                                <span className="text-sm">{contactInfo?.email || 'info@rotabiletiket.com'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Rotabil Etiket. {getLocStr(footerContent, 'copyright_text') || 'Tüm hakları saklıdır.'}
                        <span className="mx-2">|</span>
                        <a href="https://www.muratkanik.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            by MK Studio
                        </a>
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="/gizlilik" className="hover:text-white">
                            {locale === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
                        </Link>
                        <Link href="/kvkk" className="hover:text-white">KVKK</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
