import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getLocalizedProduct } from '@/utils/supabase/queries';
import { getLocale, getTranslations } from 'next-intl/server';
import { ProductCTA } from '@/components/product/ProductCTA';
import { ProductDurability, ProductDocuments, ProductFAQ } from '@/components/product/ProductExtras';

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
                        <ProductCTA productName={product.title} />

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

                        <ProductDurability durability={product.durability} />
                        <ProductDocuments documents={product.documents} />
                        <ProductFAQ faqs={product.faqs} />

                    </div>
                </div>
            </div>
        </main>
    );
}
