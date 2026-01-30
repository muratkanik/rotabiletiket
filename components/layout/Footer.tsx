import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/settings';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

export async function Footer() {
    const contactInfo = await getSiteSettings('contact_info');

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
                                className="object-contain brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            2000 yılından beri endüstriyel etiket, ribon ve barkod çözümlerinde güvenilir çözüm ortağınız.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                <Linkedin size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Kurumsal</h3>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link></li>
                            <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                            <li><Link href="/sektorel-cozumler" className="hover:text-white transition-colors">Sektörel Çözümler</Link></li>
                            <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Ürünler</h3>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link href="/urunler/etiketler" className="hover:text-white transition-colors">Etiketler</Link></li>
                            <li><Link href="/urunler/ribonlar" className="hover:text-white transition-colors">Ribonlar</Link></li>
                            <li><Link href="/urunler/barkod-yazicilar" className="hover:text-white transition-colors">Barkod Yazıcılar</Link></li>
                            <li><Link href="/urunler/yedek-parca" className="hover:text-white transition-colors">Yedek Parça</Link></li>
                        </ul>
                    </div>

                    {/* Contact - Consuming Dynamic Settings */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">İletişim</h3>
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
                        &copy; {new Date().getFullYear()} Rotabil Etiket. Tüm hakları saklıdır.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="/gizlilik" className="hover:text-white">Gizlilik Politikası</Link>
                        <Link href="/kullanim-kosullari" className="hover:text-white">Kullanım Koşulları</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
