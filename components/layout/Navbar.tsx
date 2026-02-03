// ... imports
import { getSiteSettings } from '@/lib/settings';

export async function Navbar() {
    const t = await getTranslations('Navigation');
    const tCommon = await getTranslations('Common');
    const contactInfo = await getSiteSettings('contact_info');

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container flex h-24 items-center justify-between">
                {/* ... Logo ... */}

                {/* ... Desktop Menu ... */}
                {/* Replaced hardcoded links if any, but they look like internal links. 
                     The USER wants "contact info" to be dynamic. 
                     Usually this means phone/email displayed in header or usage of them.
                     The current Navbar doesn't display phone/email directly, only links to /iletisim.
                     However, if the User wants "Get Quote" or similar to link to dynamic WhatsApp or Phone, we could use it.
                     For now, let's keep it standard but maybe pass contactInfo to MobileMenu if needed?
                     
                     Actually, looking at `ContactPage`, it uses `getSiteSettings`.
                     If `Navbar` has no phone number displayed textually, we might not need to change much here EXCEPT:
                     - Maybe the "Contact" link or "Get Quote" button.
                     
                     Wait, let's look at the Mobile Menu. It might show phone/email.
                 */}
                {/* ... */}
            </div>
        </nav>
    );
}
// Checking `view_file` output again.
// Line 68: <Link href="/iletisim">{tCommon('getQuote')}</Link>
// Line 62: <Link href="/iletisim" ...>{t('contact')}</Link>
// It seems Navbar mainly links to pages. 
// However, the `MobileMenu` likely contains contact details.
// Let's check `MobileMenu` content first before editing Navbar blindly.

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
                {t('products')}
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute top-24 left-0 w-64 bg-white border border-slate-100 shadow-xl rounded-b-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0">
                <div className="p-2 flex flex-col">
                    <Link href="/urunler/etiketler" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                        <span className="font-semibold block">{t('labels')}</span>
                        <span className="text-xs text-slate-400 font-normal">{t('labelsDesc')}</span>
                    </Link>
                    <Link href="/urunler/ribonlar" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                        <span className="font-semibold block">{t('ribbons')}</span>
                        <span className="text-xs text-slate-400 font-normal">{t('ribbonsDesc')}</span>
                    </Link>
                    <Link href="/urunler/barkod-yazicilar" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                        <span className="font-semibold block">{t('printers')}</span>
                        <span className="text-xs text-slate-400 font-normal">{t('printersDesc')}</span>
                    </Link>
                    <Link href="/urunler/barkod-yazici-kafasi" className="block px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                        <span className="font-semibold block">{t('printheads')}</span>
                        <span className="text-xs text-slate-400 font-normal">{t('printheadsDesc')}</span>
                    </Link>
                </div>
            </div>
        </div>

        <Link href="/sektorel-cozumler" className="hover:text-blue-700 transition-colors">{t('sectoral')}</Link>
        <Link href="/bilgi-bankasi" className="hover:text-blue-700 transition-colors">{t('blog')}</Link>
        <Link href="/hakkimizda" className="hover:text-blue-700 transition-colors">{t('about')}</Link>
        <Link href="/iletisim" className="hover:text-blue-700 transition-colors">{t('contact')}</Link>
    </div>

    <div className="hidden md:flex items-center gap-2">
        <LanguageSwitcher />
        <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
            <Link href="/iletisim">{tCommon('getQuote')}</Link>
        </Button>
    </div>
    <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher />
        <MobileMenu />
    </div>
</div>
        </nav >
    );
}
