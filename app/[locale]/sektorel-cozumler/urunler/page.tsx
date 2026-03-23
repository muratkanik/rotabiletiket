import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return {
        title: locale === 'tr' ? 'Ürün Kategorilerimiz | Rotabil Etiket' : 'Our Products | Rotabil Etiket',
        description: locale === 'tr' ? 'Tüm ürün kategorilerimiz ve endüstriyel etiketleme çözümleri.' : 'Our comprehensive range of high-quality industrial labels and barcode solutions.'
    };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();
    const tCommon = await getTranslations('Common');

    const { data: categories } = await supabase
        .from('categories')
        .select(`
            *,
            category_translations (
                language_code,
                title,
                description
            )
        `)
        .order('display_order', { ascending: true })
        .order('title', { ascending: true });

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="bg-slate-900 py-10 md:py-16 px-4 text-white text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {locale === 'en' ? 'Our Products' :
                        locale === 'de' ? 'Unsere Produkte' :
                            locale === 'fr' ? 'Nos Produits' :
                                locale === 'tr' ? 'Ürün Kategorilerimiz' : 'منتجاتنا'}
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto">
                    {locale === 'en' ? 'Explore our comprehensive range of high-quality industrial labels, ribbons, and barcode solutions.' :
                        locale === 'de' ? 'Entdecken Sie unser umfassendes Angebot an hochwertigen Industrieetiketten, Thermotransferfolien und Barcode-Lösungen.' :
                            locale === 'fr' ? 'Découvrez notre gamme complète d\'étiquettes industrielles, rubans et solutions de codes-barres.' :
                                locale === 'tr' ? 'İhtiyacınıza uygun endüstriyel etiketler, ribonlar, barkod yazıcılar ve tüm ürün grubumuzu keşfedin.' : 'اكتشف مجموعتنا الشاملة من الملصقات الصناعية عالية الجودة والشرائط وحلول الباركود.'}
                </p>
            </div>

            <div className="container px-4 md:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories?.map((category: any) => {
                        const trans = category.category_translations?.find((t: any) => t.language_code === locale)
                            || category.category_translations?.find((t: any) => t.language_code === 'tr')
                            || {};
                        const title = trans.title || category.title;
                        
                        const getImageUrl = (path: string) => {
                            if (!path) return '/placeholder-sector.jpg';
                            if (path.startsWith('http') || path.startsWith('/')) return path;
                            return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${path}`;
                        };

                        return (
                            <Link
                                key={category.id}
                                href={`/sektorel-cozumler/urunler/${category.slug}`}
                                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all border border-slate-100"
                            >
                                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                                    <Image
                                        src={getImageUrl(category.image_url)}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        {title}
                                    </h3>
                                    <div className="flex items-center text-blue-600 text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
                                        {tCommon('readMore')} <ArrowRight className="ml-1 w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
