import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const supabase = await createClient();
    const { data: sector } = await supabase
        .from('sectors')
        .select(`
            *,
            sector_translations (
                language_code,
                title,
                content_html,
                seo_title,
                seo_description,
                keywords
            )
        `)
        .eq('slug', slug)
        .single();

    if (!sector) return { title: 'Not Found' };

    const trans = sector.sector_translations?.find((t: any) => t.language_code === locale)
        || sector.sector_translations?.find((t: any) => t.language_code === 'tr')
        || {};

    const title = trans.seo_title || trans.title || sector.title;
    const description = trans.seo_description || `${title} için özel etiketleme çözümleri ve endüstriyel uygulamalar.`;
    const keywords = trans.keywords || '';

    return {
        title: `${title} | Rotabil Etiket`,
        description: description,
        keywords: keywords
    }
}

export default async function SectorDetailPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const supabase = await createClient();

    const { data: sector } = await supabase
        .from('sectors')
        .select(`
            *,
            sector_translations (
                language_code,
                title,
                content_html
            ),
            sector_products (
                product_id,
                products (
                    id,
                    slug,
                    image_url,
                    product_translations (
                        title,
                        language_code
                    )
                )
            )
        `)
        .eq('slug', slug)
        .single();

    if (!sector) notFound();

    const trans = sector.sector_translations?.find((t: any) => t.language_code === locale)
        || sector.sector_translations?.find((t: any) => t.language_code === 'tr')
        || {};

    const displayTitle = trans.title || sector.title;
    const displayContent = trans.content_html || '<p>İçerik hazırlanıyor...</p>';

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src={sector.image_url || '/placeholder-sector.jpg'}
                        alt={displayTitle}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60" />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-3xl md:text-6xl font-bold mb-4">{displayTitle}</h1>
                    <p className="text-lg md:text-xl text-slate-200">Endüstriyel Özel Çözümler</p>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-8 md:py-16">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Optional Video Section */}
                    {sector.video_url && (
                        <div className="mb-12 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-200">
                            <video 
                                src={sector.video_url} 
                                className="w-full h-full object-cover" 
                                controls 
                                autoPlay 
                                muted 
                                loop 
                            />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none text-slate-600 mb-12 md:mb-16 prose-img:w-full prose-img:h-auto break-words overflow-x-auto">
                        <div dangerouslySetInnerHTML={{
                            __html: displayContent
                                .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                                .replace(/src="img\//g, 'src="https://rotabiletiket.com/img/')
                        }} />
                    </div>

                    {/* Linked Products */}
                    {sector.sector_products && sector.sector_products.length > 0 && (
                        <div className="mb-12 md:mb-16">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8 border-b pb-4">
                                {locale === 'en' ? 'Most Used Solutions in this Sector' : 'Bu Sektörde En Çok Kullanılan Çözümlerimiz'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sector.sector_products.map((sp: any) => {
                                    const p = sp.products;
                                    if(!p) return null;
                                    const pTrans = p.product_translations?.find((t: any) => t.language_code === locale) || p.product_translations?.find((t: any) => t.language_code === 'tr') || {};
                                    return (
                                        <Link href={`/${locale}/urunler/${p.slug}`} key={p.id} className="group relative flex gap-4 bg-white border border-slate-100 p-4 rounded-2xl hover:shadow-xl hover:border-blue-100 transition-all">
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                                                <Image 
                                                    src={p.image_url || '/placeholder.png'} 
                                                    alt={pTrans.title || 'Ürün'} 
                                                    fill 
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{pTrans.title || 'İsimsiz Ürün'}</h3>
                                                <span className="text-sm font-medium text-blue-600 group-hover:underline">
                                                    {locale === 'en' ? 'View Details' : 'Ürünü İncele'} &rarr;
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 text-center mt-8">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                            {locale === 'en' ? 'Looking for a Solution?' : 'Bu Sektör İçin Çözüm Mü Arıyorsunuz?'}
                        </h2>
                        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                            {locale === 'en' 
                                ? 'Let our expert team determine your industry-specific needs and offer the right labeling solution.' 
                                : 'Uzman ekibimizle sektörünüze özel ihtiyaçları belirleyip en doğru etiketleme çözümünü sunalım.'}
                        </p>
                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
                            <Link href={`/${locale}/iletisim`}>{locale === 'en' ? 'Get a Quote Now' : 'Hemen Teklif Alın'}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
