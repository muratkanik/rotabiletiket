import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getSiteSettings } from '@/lib/settings';

export async function Navbar() {
    // Fetch settings dynamically (even for Navbar, if we want dynamic links/phones)
    const contactSettings = await getSiteSettings('contact_info');

    return (
        <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-12 w-48">
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
                    <Link href="/urunler/etiketler" className="hover:text-blue-700 transition-colors">Etiketler</Link>
                    <Link href="/urunler/ribonlar" className="hover:text-blue-700 transition-colors">Ribonlar</Link>
                    <Link href="/urunler/barkod-yazicilar" className="hover:text-blue-700 transition-colors">Yazıcılar</Link>
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
