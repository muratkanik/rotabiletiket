import { createClient } from '@/utils/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';

import { notFound } from 'next/navigation';
import { Link } from '@/src/i18n/routing';
import { getLocale } from 'next-intl/server';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const { category: categorySlug } = await params;
    const locale = await getLocale();
    const supabase = await createClient();

    // Fetch Category with Translations
    const { data: category } = await supabase
        .from('categories')
        .select(`
            *,
            category_translations (
                language_code,
                title,
                description,
                seo_title,
                seo_description,
                keywords
            )
        `)
        .eq('slug', categorySlug)
        .single();

    if (!category) return { title: 'Ürünler | Rotabil Etiket' };

    const trans = category.category_translations?.find((t: any) => t.language_code === locale)
        || category.category_translations?.find((t: any) => t.language_code === 'tr')
        || {};

    const title = trans.seo_title || trans.title || category.title;
    const description = trans.seo_description || trans.description || category.description || `En kaliteli ${title} çeşitleri.`;
    const keywords = trans.keywords || '';

    return {
        title: `${title} | Rotabil Etiket`,
        description: description,
        keywords: keywords
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category: categorySlug } = await params;
    const locale = await getLocale();
    const supabase = await createClient();

    // 1. Fetch Category with Translations
    const { data: category } = await supabase
        .from('categories')
        .select(`
            *,
            category_translations (
                language_code,
                title,
                description
            )
        `)
        .eq('slug', categorySlug)
        .single();

    if (!category) {
        notFound();
    }

    const trans = category.category_translations?.find((t: any) => t.language_code === locale)
        || category.category_translations?.find((t: any) => t.language_code === 'tr')
        || {};

    const displayTitle = trans.title || category.title;
    const displayDesc = trans.description || category.description;

    // 2. Fetch Products
    const { data: rawProducts } = await supabase
        .from('products')
        .select(`
            *,
            product_images(*),
            product_translations (
                language_code,
                title,
                slug,
                description_html
            )
        `)
        .eq('category_id', category.id)
        .order('title', { ascending: true });

    const products = rawProducts?.map((p: any) => {
        const trans = p.product_translations?.find((t: any) => t.language_code === locale);
        return {
            ...p,
            title: trans?.title || p.title,
            slug: trans?.slug || p.slug,
            description_html: trans?.description_html || p.description_html
        };
    });

    return (
        <main className="min-h-screen bg-slate-50">


            {/* Header */}
            <div className="bg-slate-900 py-16 text-white text-center">
                <div className="container px-4 md:px-6 mx-auto mb-6">
                    <nav className="flex justify-center text-sm text-slate-400 mb-4" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/" className="hover:text-white transition-colors">Anasayfa</Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-slate-600">/</span>
                                    <span className="text-white font-medium">Ürünler</span>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <span className="mx-2 text-slate-600">/</span>
                                    <span className="text-white font-medium">{displayTitle}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
                <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    {displayDesc || `Endüstriyel standartlarda, yüksek kaliteli ${displayTitle.toLowerCase()} çözümlerimiz.`}
                </p>
            </div>

            {/* Grid */}
            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products?.map((product: any) => (
                        <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                    ))}
                    {products?.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            Bu kategoride henüz ürün bulunmuyor.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
