import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Phone, Mail } from 'lucide-react';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    return {
        title: product ? `${product.title} | Rotabil Etiket` : 'Ürün Detayı',
        description: product?.seo_description || product?.title
    }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string, category: string }> }) {
    const { slug, category } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .eq('slug', slug)
        .single();

    if (!product) notFound();

    // Sort images (primary first)
    const images = product.product_images?.sort((a: any, b: any) => (b.is_primary ? 1 : -1)) || [];
    const mainImage = images.length > 0
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${images[0].storage_path}`
        : '/placeholder-product.jpg';

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="container px-4 md:px-6 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/urunler/${product.categories?.slug}`} className="hover:text-blue-600">{product.categories?.title}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.title}</span>
                </div>

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
                                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`}
                                            alt="Product Thumbnail"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                ))}
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
                                <h3 className="font-semibold text-slate-900 mb-4">Teknik Özellikler</h3>
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
                            <h3 className="font-bold text-blue-900 text-lg mb-2">Fiyat Teklifi Alın</h3>
                            <p className="text-blue-700 mb-4 text-sm">Projenize özel ölçü ve adetler için hemen bizimle iletişime geçin.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button className="flex-1 bg-orange-600 hover:bg-orange-700 h-12 text-lg" asChild>
                                    <Link href="/iletisim">
                                        <Phone className="mr-2 h-5 w-5" /> Hemen Arayın
                                    </Link>
                                </Button>
                                <Button variant="outline" className="flex-1 hover:bg-white h-12 text-lg border-blue-200 text-blue-700" asChild>
                                    <Link href="mailto:info@rotabiletiket.com">
                                        <Mail className="mr-2 h-5 w-5" /> E-posta Gönder
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
