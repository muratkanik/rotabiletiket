import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getSiteSettings } from '@/lib/settings';

export async function Navbar() {
    // Fetch settings dynamically (even for Navbar, if we want dynamic links/phones)
    const contactSettings = await getSiteSettings('contact_info');

    return (
        <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
            <div className="container flex h-24 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-20 w-80">
                            <Image
                                src="/logo.png"
                                alt="Rotabil Etiket"
                                fill
                                className="object-contain"
                                priority
                                unoptimized
                            />
                        </div>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
                    <div className="relative group h-24 flex items-center">
                        <button className="hover:text-blue-700 transition-colors flex items-center gap-1 py-4">
                            Ürünlerimiz
                            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <div className="absolute top-24 left-0 w-64 bg-white border border-slate-100 shadow-xl rounded-b-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0">
                            <div className="p-2 flex flex-col">
                                <Link href="/urunler/etiketler" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                                    <span className="font-semibold block">Etiketler</span>
                                    <span className="text-xs text-slate-400 font-normal">Endüstriyel etiket çeşitleri</span>
                                </Link>
                                <Link href="/urunler/ribonlar" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                                    <span className="font-semibold block">Ribonlar</span>
                                    <span className="text-xs text-slate-400 font-normal">Termal transfer ribonlar</span>
                                </Link>
                                <Link href="/urunler/barkod-yazicilar" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                                    <span className="font-semibold block">Barkod Yazıcılar</span>
                                    <span className="text-xs text-slate-400 font-normal">Masaüstü ve endüstriyel</span>
                                </Link>
                                <Link href="/urunler/barkod-yazici-kafasi" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                                    <span className="font-semibold block">Yazıcı Kafaları</span>
                                    <span className="text-xs text-slate-400 font-normal">Orijinal yedek parçalar</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Link href="/sektorel-cozumler" className="hover:text-blue-700 transition-colors">Sektörel Çözümler</Link>
                    <Link href="/bilgi-bankasi" className="hover:text-blue-700 transition-colors">Bilgi Bankası</Link>
                    <Link href="/hakkimizda" className="hover:text-blue-700 transition-colors">Hakkımızda</Link>
                    <Link href="/iletisim" className="hover:text-blue-700 transition-colors">İletişim</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white hidden md:inline-flex" asChild>
                        <Link href="/iletisim">Teklif Al</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
