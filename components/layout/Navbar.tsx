import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getSiteSettings } from '@/lib/settings';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@supabase/supabase-js';
import { ProductsMegaMenu } from './ProductsMegaMenu';

// Navbar data is public and read-only. Keep this client independent from
// request cookies so locale pages remain statically renderable on Vercel.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function Navbar() {
    const locale = await getLocale();
    const t = await getTranslations('Navigation');
    const tCommon = await getTranslations('Common');
    const contactInfo = await getSiteSettings('contact_info');

    // Fetch categories and products for Mega Menu
    const { data: categories } = await supabase
        .from('categories')
        .select(`
            id, title, slug, parent_id, display_order,
            category_translations(language_code, title, slug)
        `)
        .order('display_order', { ascending: true })
        .order('title', { ascending: true });

    const { data: products } = await supabase
        .from('products')
        .select(`
            id, title, slug, category_id,
            product_images(storage_path, is_primary),
            product_translations(language_code, title, slug)
        `)
        .eq('is_published', true)
        .not('category_id', 'is', null)
        .order('display_order', { ascending: true });

    const localizedCategories = categories?.map(cat => {
        const tr: any = cat.category_translations?.find((t: any) => t.language_code === locale) || {};
        return {
            ...cat,
            title: tr.title || cat.title,
            slug: tr.slug || cat.slug
        };
    }) || [];

    const localizedProducts = products?.map(prod => {
        const tr: any = prod.product_translations?.find((t: any) => t.language_code === locale) || {};
        return {
            ...prod,
            title: tr.title || prod.title,
            slug: tr.slug || prod.slug
        };
    }) || [];

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container flex h-24 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-16 w-52 md:h-20 md:w-80">
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

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
                    <ProductsMegaMenu categories={localizedCategories} products={localizedProducts} />

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
                    <MobileMenu contactInfo={contactInfo} categories={localizedCategories} />
                </div>
            </div>
        </nav>
    );
}
