import { notFound } from 'next/navigation';
import locationsData from '../../../data/locations.json';
import { MapPin, Phone, Mail, Truck, Factory, Layers } from 'lucide-react';
import Link from 'next/link';
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 3600;
// Render location pages on demand and cache them with ISR. Pre-rendering every
// location in every locale creates thousands of serverless output files and
// can exceed Vercel's build disk quota.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ locationSlug: string, locale: string }> }) {
    const resolvedParams = await params;
    const { locationSlug, locale } = resolvedParams;
    
    if (!locationSlug.endsWith('-etiket')) {
        return {};
    }
    
    const slugName = locationSlug.replace('-etiket', '');
    const location = locationsData.find((l: any) => l.slug === slugName);
    
    if (!location) {
        return {};
    }
    
    const name = location.district || location.city;
    const isGerman = locale === 'de';
    
    return {
        title: isGerman ? `Etikettenproduktion in ${name} | Rotabil Etiket` : `${name} Etiket Üreticisi ve İmalatı | Tüm Ölçülerde Hızlı Teslimat - Rotabil Etiket`,
        description: isGerman ? `Professionelle Etikettenlösungen von Rotabil Etiket für Unternehmen in ${name} und Umgebung.` : `Rotabil Etiket olarak ${name} ve çevresindeki işletmeler için her ölçüde ve türde etiket üretim ihtiyaçlarınızı karşılıyoruz. ${name} etiket firması arıyorsanız, üretici fiyatlarıyla garantili ürünler.`,
        keywords: isGerman ? `${name} Etiketten, Industrieetiketten ${name}, Barcode-Etiketten ${name}` : `${name} etiket, ${name} etiket firmaları, ${name} etiket üreticisi, ${name} etiket imalatı, ${name} rulo etiket, barkod etiketi ${name}, kuşe etiket ${name}`,
    };
}

export default async function LocationSEOPage({ params }: { params: Promise<{ locationSlug: string, locale: string }> }) {
    const resolvedParams = await params;
    const { locationSlug, locale } = resolvedParams;
    
    if (!locationSlug.endsWith('-etiket')) {
        notFound();
    }
    
    const slugName = locationSlug.replace('-etiket', '');
    const location = locationsData.find((l: any) => l.slug === slugName);
    
    if (!location) {
        notFound();
    }
    
    const name = location.district || location.city;
    const isGerman = locale === 'de';
    const contactInfo = await getSiteSettings('contact_info');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `Rotabil Etiket - ${name}`,
        image: 'https://rotabiletiket.com/logo.png',
        url: `https://rotabiletiket.com/${locale}/${locationSlug}`,
        telephone: contactInfo?.phone || '+90 216 595 03 23',
        address: {
            '@type': 'PostalAddress',
            addressLocality: name,
            addressCountry: 'TR'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: (location as any).lat || '41.0082',
            longitude: (location as any).lon || '28.9784'
        },
        areaServed: {
            '@type': 'City',
            name: name
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '127'
        },
        description: isGerman ? `Rotabil Etiket bietet Unternehmen in ${name} professionelle Etikettenproduktion.` : `Rotabil Etiket olarak ${name} bölgesindeki işletmelere profesyonel etiket üretim hizmeti sunuyoruz.`
    };
    
    return (
        <main className="min-h-screen bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <div className="bg-slate-900 py-24 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-black"></div>
                <div className="container relative z-10 px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6">
                        <MapPin size={16} />
                        {name} {isGerman ? 'Etiketten-Liefergebiet' : 'Etiket Gönderim Bölgesi'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {name} <span className="text-blue-500">{isGerman ? 'Etikettenproduktion' : 'Etiket Üretim Merkezi'}</span>
                    </h1>
                    <p className="text-xl text-slate-200 font-light mb-8 max-w-2xl mx-auto">
                        {isGerman ? `Rotabil Etiket bietet Unternehmen in ${name} professionelle Etikettenlösungen in allen Größen, Ausführungen und Mengen – mit direkter Herstellerqualität und schneller Lieferung.` : `Rotabil Etiket olarak, ${name} bölgesindeki tüm işletmelere her ölçü, tür ve adette profesyonel etiket çözümleri sunuyoruz. %100 üretici güvencesi ve hızlı teslimat.`}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={`/${locale}/iletisim`} className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                            <Phone className="mr-2" size={18} />
                            {isGerman ? 'Angebot anfordern' : 'Hemen Fiyat Alın'}
                        </Link>
                        <Link href={`/${locale}/urunler`} className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                            <Layers className="mr-2" size={18} />
                            {isGerman ? 'Produkte ansehen' : 'Ürünlerimizi İnceleyin'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-white">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">{isGerman ? `Warum sollten Sie uns in ${name} wählen?` : `${name} İçin Neden Bizi Seçmelisiniz?`}</h2>
                        <p className="text-slate-600 max-w-3xl mx-auto block">{isGerman ? 'Mit Erfahrung in verschiedenen Branchen und einem leistungsfähigen Maschinenpark bieten wir Lösungen, die exakt zu Ihren Anforderungen passen.' : 'Farklı sektörlerdeki tecrübemiz ve geniş makine parkurumuz ile firmanızın ihtiyaçlarına tam uyumlu çözümler sağlıyoruz.'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md hover:border-blue-100 group">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Factory size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{isGerman ? 'Direkte Herstellerpreise' : 'Tam Üretici Fiyatları'}</h3>
                            <p className="text-slate-600 leading-relaxed">{isGerman ? `Wir liefern direkt ab Werk in die Region ${name} und schaffen so einen Kostenvorteil.` : `Aracı kullanmadan fabrikadan işletmelere doğrudan satış ile ${name} bölgesine gönderim sağlıyor ve maliyet avantajı yaratıyoruz.`}</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md hover:border-blue-100 group">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Layers size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{isGerman ? 'Produktion in jeder Größe' : 'Her Ölçüde Üretim'}</h3>
                            <p className="text-slate-600 leading-relaxed">{isGerman ? 'Wir produzieren Barcode-, gestrichene, Thermo- und viele weitere Etiketten exakt nach Ihren Maßen.' : 'İhtiyacınıza tam uyan ölçülerde barkod etiketleri, kuşe, termal ve daha birçok çeşit etiketin imalatını yapıyoruz.'}</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md hover:border-blue-100 group">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Truck size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{isGerman ? 'Schnelles Liefernetz' : 'Hızlı Gönderim Ağı'}</h3>
                            <p className="text-slate-600 leading-relaxed">{isGerman ? `Wir liefern Ihre Bestellungen mit schnellen Versand- und Logistiklösungen auch in die Region ${name}.` : `Türkiye&apos;nin her yerine olduğu gibi ${name} bölgesine de siparişlerinizi en hızlı kargo ve lojistik yöntemleriyle ulaştırıyoruz.`}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner Section */}
            <div className="py-20 bg-blue-600 text-white">
                <div className="container px-4 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">{isGerman ? `Suchen Sie die richtige Etikettenlösung für Ihr Unternehmen in ${name}?` : `${name} bölgesinde yer alan işletmeniz için doğru etiket mi arıyorsunuz?`}</h2>
                    <p className="text-blue-100 text-lg mb-8">{isGerman ? 'Wir erfüllen Etikettenanforderungen für Industrie, Handel, Logistik und Lebensmittel. Fragen Sie unser Expertenteam nach einem individuellen Angebot.' : 'Endüstriyel kullanımdan perakendeye, lojistikten gıdaya kadar tüm sektörlerin etiket ihtiyaçlarını karşılıyoruz. İşletmenize özel fiyatları öğrenmek için uzman ekibimize danışın.'}</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border border-blue-400 flex items-center justify-center">
                                <Phone size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-blue-200">{isGerman ? 'Rufen Sie uns an' : 'Bizi Arayın'}</p>
                                <p className="text-xl font-bold">{contactInfo?.phone || "(+90) 216 595 03 23"}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-blue-400"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border border-blue-400 flex items-center justify-center">
                                <Mail size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-blue-200">{isGerman ? 'E-Mail senden' : 'E-Posta Gönderin'}</p>
                                <p className="text-xl font-bold">{contactInfo?.email || "info@rotabiletiket.com"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
