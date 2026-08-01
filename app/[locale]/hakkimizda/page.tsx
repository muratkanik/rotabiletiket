
import { getSiteSettings } from "@/lib/settings";
import Image from "next/image";
import { CheckCircle2, Factory, ShieldCheck, Users, TrendingUp, History, LucideIcon } from "lucide-react";
import { ExportMap } from '@/components/home/ExportMap';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return locale === 'de'
        ? { title: 'Über uns | Rotabil Etiket', description: 'Rotabil Etiket ist Ihr zuverlässiger Partner für industrielle Etiketten- und Barcodelösungen.' }
        : { title: 'Hakkımızda | Rotabil Etiket', description: '20 yılı aşkın tecrübesiyle Rotabil Etiket, endüstriyel barkod ve etiket çözümlerinde güvenilir iş ortağınız. Üretim gücümüz ve kalite politikamız hakkında bilgi edinin.' };
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    Factory,
    ShieldCheck,
    Users,
    TrendingUp
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isGerman = locale === 'de';
    const heroSettings = await getSiteSettings('hero_section');
    const aboutContent = await getSiteSettings('about_us_content');

    // Default fallbacks if DB is empty
    const history = isGerman ? {
        title: 'Wir sind Hersteller, kein Vermittler',
        text: ['Rotabil Etiket produziert seit 2000 direkt an unseren Standorten in Istanbul.', 'Als Hersteller ohne Zwischenprovisionen bieten wir unseren Kunden hochwertige Etiketten zu wettbewerbsfähigen Preisen.', 'Mit moderner Ausstattung und erfahrenen Teams produzieren wir Millionen Etiketten pro Tag und versenden ab Werk.']
    } : aboutContent?.history || { title: "", text: [] };
    const stats = isGerman ? [{ label: 'Jahre Erfahrung', value: '20+' }, { label: 'Direktverkauf ab Werk', value: '%100' }] : aboutContent?.stats || [];
    const features = isGerman ? [
        { icon: 'Factory', title: 'Direkt ab Werk', desc: 'Produktion in unserem eigenen Werk mit moderner Maschinentechnik.' },
        { icon: 'ShieldCheck', title: 'Herstellergarantie', desc: 'Produktion nach ISO-Standards mit direkter Herstellergarantie.' },
        { icon: 'TrendingUp', title: 'Kostenvorteil', desc: 'Wettbewerbsfähige Preise durch den Wegfall von Zwischenhändlern.' },
        { icon: 'Users', title: 'Sonderanfertigungen', desc: 'Flexible Kapazitäten für individuelle Größen und Mengen.' }
    ] : aboutContent?.features || [];
    const qualityPolicy = isGerman ? [
        { title: 'Direkter Kontakt', desc: 'Direkter Mehrwert für unsere Kunden ohne Zwischenhändler.' },
        { title: 'Produktionsqualität', desc: 'Hundertprozentige Kontrolle von der Produktion bis zum Versand.' }
    ] : aboutContent?.quality_policy || [];
    const missionVision = isGerman ? { vision: 'Einer der technologisch führenden Hersteller industrieller Etiketten zu werden.', mission: 'Lokale Produktion zu stärken und unseren Kunden passende Etikettenlösungen ab Werk anzubieten.' } : aboutContent?.mission_vision || { vision: "", mission: "" };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: isGerman ? 'Über Rotabil Etiket' : 'Hakkımızda | Rotabil Etiket',
        description: isGerman ? 'Rotabil Etiket ist Ihr zuverlässiger Partner für industrielle Etiketten- und Barcodelösungen.' : '20 yılı aşkın tecrübesiyle Rotabil Etiket, endüstriyel barkod ve etiket çözümlerinde güvenilir iş ortağınız. Üretim gücümüz ve kalite politikamız hakkında bilgi edinin.',
        publisher: {
            '@type': 'Organization',
            name: 'Rotabil Etiket',
            logo: {
                '@type': 'ImageObject',
                url: 'https://rotabiletiket.com/logo.png'
            }
        },
        mainEntity: {
            '@type': 'Organization',
            name: 'Rotabil Etiket',
            foundingDate: '2000',
            description: history.text?.[0] || '2000 yılından günümüze etiket sektöründe hizmet vermekteyiz.',
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Introduction Hero */}
            <div className="relative bg-slate-900 py-24 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1565514020176-db79373f7521?q=80&w=2070')] bg-cover bg-center"></div>
                <div className="container relative px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{isGerman ? 'Ihr Partner für industrielle Lösungen' : 'Endüstriyel Çözüm Ortağınız'}</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {isGerman ? 'Seit 2000 verbinden wir Vertrauen, Qualität und Geschwindigkeit in industrieller Kennzeichnung und Barcode-Technik.' : heroSettings?.subtitle || "2000 yılından günümüze, etiketleme ve barkod sistemlerinde güven, kalite ve hızı buluşturuyoruz."}
                    </p>
                </div>
            </div>

            {/* Main Content & History */}
            <div className="container px-4 md:px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800">
                            <History className="mr-2 h-4 w-4" /> {isGerman ? 'Unsere Geschichte und Vision' : 'Tarihçemiz & Vizyonumuz'}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{history.title}</h2>
                        <div className="prose prose-lg text-slate-600 space-y-4">
                            {history.text?.map((paragraph: string, i: number) => (
                                <p key={i} className={i === history.text.length - 1 ? "font-medium text-slate-800 border-l-4 border-orange-500 pl-4 py-2 bg-orange-50/50" : ""}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 translate-y-8">
                                <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-lg relative cursor-pointer hover:scale-105 transition-transform duration-500">
                                    <Image
                                        src="/img/about/production.png"
                                        alt={isGerman ? 'Moderne Etikettenproduktionsanlage' : 'Modern Etiket Üretim Tesisi'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="aspect-square bg-blue-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-md">
                                    <span className="text-5xl font-bold text-blue-600 mb-2">{stats[0]?.value}</span>
                                    <span className="text-sm font-medium text-blue-900">{stats[0]?.label}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-square bg-orange-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-md">
                                    <span className="text-5xl font-bold text-orange-600 mb-2">{stats[1]?.value}</span>
                                    <span className="text-sm font-medium text-orange-900">{stats[1]?.label}</span>
                                </div>
                                <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-lg relative cursor-pointer hover:scale-105 transition-transform duration-500">
                                    <Image
                                        src="/img/about/quality.png"
                                        alt={isGerman ? 'Qualitätskontrollprozesse' : 'Kalite Kontrol Süreçleri'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Us / Features */}
            <div className="bg-slate-50 py-20">
                <div className="container px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">{isGerman ? 'Warum Rotabil Etiket?' : 'Neden Rotabil Etiket?'}</h2>
                        <p className="text-slate-600">{isGerman ? 'Was uns auszeichnet, ist unsere Leidenschaft für Qualität und unser Anspruch, Kunden echten Mehrwert zu bieten.' : 'Bizi sektörde farklı kılan, kaliteye olan tutkumuz ve müşterilerimize verdiğimiz değerdir.'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((item: any, i: number) => {
                            const Icon = iconMap[item.icon] || Factory;
                            return (
                                <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Certificates & Registrations */}
            <div className="bg-white py-20">
                <div className="container px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">{isGerman ? 'Registrierungen und Zertifikate' : 'Tescil ve Sertifikalarımız'}</h2>
                        <p className="text-slate-600">{isGerman ? 'Unsere Marke und Produktionsstandards sind registriert und durch offizielle Stellen abgesichert.' : 'Markamız ve üretim standartlarımız, resmi kurumlar tarafından tescillenmiş ve güvence altına alınmıştır.'}</p>
                    </div>
                    <div className="flex justify-center">
                        <div className="max-w-md w-full bg-slate-50 p-4 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow">
                            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                                <Image 
                                    src="/img/certificates/rotabil-etiket-marka-tescil-belgesi.jpeg" 
                                    alt={isGerman ? 'Markenregistrierungsurkunde von Rotabil Etiket' : 'Rotabil Etiket Marka Tescil Belgesi'}
                                    fill 
                                    className="object-contain p-2" 
                                />
                            </div>
                            <div className="mt-6 text-center mb-2">
                                <h3 className="font-bold text-slate-900 text-xl">{isGerman ? 'Markenregistrierungsurkunde' : 'Marka Tescil Belgesi'}</h3>
                                <p className="text-slate-500 font-medium mt-1">{isGerman ? 'Türkisches Patent- und Markenamt' : 'Türk Patent ve Marka Kurumu'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Policy & Mission/Vision */}
            <div className="container px-4 md:px-6 py-20">
                <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold mb-8">{isGerman ? 'Unsere Qualitätspolitik und Werte' : 'Kalite Politikamız ve Değerlerimiz'}</h2>
                            <div className="space-y-6">
                                {qualityPolicy.map((policy: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 bg-orange-500/20 p-2 rounded-lg h-fit">
                                            <CheckCircle2 className="text-orange-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">{policy.title}</h4>
                                            <p className="text-slate-300 text-sm leading-relaxed">{policy.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold mb-6 text-orange-400">{isGerman ? 'Unsere Vision' : 'Vizyonumuz'}</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                {missionVision.vision}
                            </p>
                            <h3 className="text-xl font-bold mb-6 text-orange-400">{isGerman ? 'Unsere Mission' : 'Misyonumuz'}</h3>
                            <p className="text-slate-300 leading-relaxed">
                                {missionVision.mission}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ExportMap locale={locale} />
        </main>
    )
}
