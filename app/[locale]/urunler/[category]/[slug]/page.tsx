import { Navbar } from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Link } from '@/src/i18n/routing'; // Use localized Link
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Check, Phone, Mail } from 'lucide-react';
import { getLocalizedProduct } from '@/utils/supabase/queries';
import { getLocale, getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();

    // Fetch localized product
    const product = await getLocalizedProduct(slug, locale);

    if (!product) return {
        title: 'Ürün Bulunamadı | Rotabil Etiket',
        description: 'Aradığınız ürün bulunamadı.'
    };

    return {
        title: product.seo_title || `${product.title} | Rotabil Etiket`,
        description: product.seo_description || product.description_html?.replace(/<[^>]*>?/gm, '').substring(0, 160) || product.title,
        keywords: product.keywords || ''
    }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string, category: string }> }) {
    const { slug, category } = await params;
    const locale = await getLocale();
    const t = await getTranslations('Common');
    const tProducts = await getTranslations('Products');

    const product = await getLocalizedProduct(slug, locale);

    if (!product) notFound();

    // Sort images (primary first)
    const images = product.images?.sort((a: any, b: any) => (b.is_primary ? 1 : -1)) || [];
    // Helper for image URLs
    const getImageUrl = (path: string) => {
        if (!path) return '/placeholder-product.jpg';
        if (path.startsWith('/') || path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
    };

    const mainImage = images.length > 0
        ? getImageUrl(images[0].storage_path)
        : '/placeholder-product.jpg';

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.seo_title || product.title,
        image: mainImage,
        description: product.seo_description || product.description_html?.replace(/<[^>]*>?/gm, '').substring(0, 160),
        brand: {
            '@type': 'Brand',
            name: 'Rotabil Etiket',
        },
        offers: {
            '@type': 'Offer',
            url: `https://rotabiletiket.com/${locale}/urunler/${category}/${product.slug}`, // Update URL to include locale
            priceCurrency: 'TRY',
            price: '0.00',
            availability: 'https://schema.org/InStock',
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'TR',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 14,
                returnMethod: 'https://schema.org/ReturnAtKiosk',
                returnFees: 'https://schema.org/FreeReturn'
            },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: '0',
                    currency: 'TRY'
                },
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'TR'
                },
                deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 1,
                        maxValue: 3,
                        unitCode: 'd'
                    },
                    transitTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 1,
                        maxValue: 5,
                        unitCode: 'd'
                    }
                }
            }
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Anasayfa',
                item: `https://rotabiletiket.com/${locale}`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Ürünler',
                item: `https://rotabiletiket.com/${locale}/urunler`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.categories?.title || category,
                item: `https://rotabiletiket.com/${locale}/urunler/${category}`
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: product.title,
                item: `https://rotabiletiket.com/${locale}/urunler/${category}/${product.slug}`
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <div className="container px-4 md:px-6 py-12">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: t('Navigation.home') || 'Anasayfa', href: `/${locale}` },
                    { label: t('Navigation.products') || 'Ürünler', href: `/${locale}/urunler` },
                    { label: product.categories?.title || category, href: `/${locale}/urunler/${category}` },
                    { label: product.title }
                ]} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border">
                            <Image
                                src={mainImage}
                                alt={product.title}
                                fill
                                className="object-contain p-8"
                                priority
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.slice(1).map((img: any) => (
                                    <div key={img.id} className="relative aspect-square bg-slate-50 rounded-lg border overflow-hidden cursor-pointer hover:border-blue-500">
                                        <Image
                                            src={getImageUrl(img.storage_path)}
                                            alt="Product Thumbnail"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Product Video */}
                        {product.video_url && (
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-black border border-slate-200 mt-6">
                                <video 
                                    src={product.video_url} 
                                    className="w-full h-full object-cover" 
                                    controls 
                                    autoPlay 
                                    muted 
                                    loop 
                                />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            {product.title}
                        </h1>

                        <div className="prose prose-slate max-w-none mb-8 text-slate-600 space-y-4">
                            <div dangerouslySetInnerHTML={{ __html: product.description_html }} />
                        </div>

                        {/* Specs Table */}
                        {Object.keys(product.specs || {}).length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-6 mb-8 border">
                                <h3 className="font-semibold text-slate-900 mb-4">{tProducts('details')}</h3>
                                <div className="space-y-3">
                                    {Object.entries(product.specs).map(([key, val]: [string, any]) => (
                                        <div key={key} className="flex border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium text-slate-700 w-1/3 text-sm">{key}</span>
                                            <span className="text-slate-600 text-sm flex-1">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h3 className="font-bold text-blue-900 text-lg mb-2">{t('getQuote')}</h3>
                            <p className="text-blue-700 mb-4 text-sm">
                                {locale === 'tr' ? 'Projenize özel ölçü ve adetler için hemen bizimle iletişime geçin.' : 'Contact us for custom sizes and quantities for your project.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button className="flex-1 bg-orange-600 hover:bg-orange-700 h-12 text-lg" asChild>
                                    <Link href="/iletisim">
                                        <Phone className="mr-2 h-5 w-5" /> {t('contactUs')}
                                    </Link>
                                </Button>
                                <Button className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white h-12 text-lg" asChild>
                                    <Link href={`https://wa.me/905559658918?text=${encodeURIComponent(tProducts('whatsappMessage', { product: product.title }))}`} target="_blank">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        {tProducts('whatsapp') || 'WhatsApp'}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="hidden lg:flex flex-1 hover:bg-white h-12 text-lg border-blue-200 text-blue-700" asChild>
                                    <Link href="mailto:info@rotabiletiket.com">
                                        <Mail className="mr-2 h-5 w-5" /> E-Mail
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
