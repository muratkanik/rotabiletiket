import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/settings";
import Image from "next/image";
import { CheckCircle2, Factory, ShieldCheck, Users, TrendingUp, History } from "lucide-react";

export const metadata = {
    title: 'Hakkımızda | Rotabil Etiket',
    description: '20 yılı aşkın tecrübesiyle Rotabil Etiket, endüstriyel barkod ve etiket çözümlerinde güvenilir iş ortağınız. Üretim gücümüz ve kalite politikamız hakkında bilgi edinin.'
}

export default async function AboutPage() {
    const heroSettings = await getSiteSettings('hero_section');

    const features = [
        { icon: Factory, title: "Modern Üretim", desc: "Son teknoloji makine parkurumuz ile yüksek kapasiteli ve hassas üretim." },
        { icon: ShieldCheck, title: "Kalite Güvencesi", desc: "Her aşamada titiz kalite kontrol süreçleri ve ISO standartlarında üretim." },
        { icon: Users, title: "Uzman Kadro", desc: "Sektörde deneyimli, çözüm odaklı ve dinamik ekibimizle yanınızdayız." },
        { icon: TrendingUp, title: "Sürekli Gelişim", desc: "Ar-Ge yatırımları ve teknolojik yeniliklerle sürekli ilerleyen vizyon." },
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Introduction Hero */}
            <div className="relative bg-slate-900 py-24 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1565514020176-db79373f7521?q=80&w=2070')] bg-cover bg-center"></div>
                <div className="container relative px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Endüstriyel Çözüm Ortağınız</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {heroSettings?.subtitle || "2000 yılından günümüze, etiketleme ve barkod sistemlerinde güven, kalite ve hızı buluşturuyoruz."}
                    </p>
                </div>
            </div>

            {/* Main Content & History */}
            <div className="container px-4 md:px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800">
                            <History className="mr-2 h-4 w-4" /> Tarihçemiz & Vizyonumuz
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">20+ Yıllık Tecrübe ile Geleceği Tasarlıyoruz</h2>
                        <div className="prose prose-lg text-slate-600 space-y-4">
                            <p>
                                Rotabil Etiket olarak, ticari hayatımıza başladığımız 2000 yılından bu yana endüstriyel etiketleme sektöründe öncü bir rol üstleniyoruz.
                                Barkod etiketleri, termal transfer ribonlar ve özel endüstriyel çözümler konusunda uzmanlaşmış yapımızla, binlerce müşterimize hizmet vermekteyiz.
                            </p>
                            <p>
                                Değişen pazar dinamikleri ve gelişen teknolojiyi yakından takip ederek, üretim parkurumuzu sürekli modernize ettik.
                                Bugün, yüksek kapasiteli üretim hatlarımız ve geniş ürün yelpazemizle, farklı sektörlerin en karmaşık ihtiyaçlarına bile hızlı ve etkili çözümler sunabiliyoruz.
                            </p>
                            <p className="font-medium text-slate-800 border-l-4 border-orange-500 pl-4 py-2 bg-orange-50/50">
                                "Sadece etiket üretmiyoruz; işinizin akışını hızlandıran, markanızı en iyi şekilde temsil eden çözümler üretiyoruz."
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 translate-y-8">
                                <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-lg relative">
                                    <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">Görsel 1</div>
                                    {/* Placeholder until real images are uploaded */}
                                </div>
                                <div className="aspect-square bg-blue-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-md">
                                    <span className="text-5xl font-bold text-blue-600 mb-2">20K+</span>
                                    <span className="text-sm font-medium text-blue-900">Tamamlanan Proje</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-square bg-orange-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-md">
                                    <span className="text-5xl font-bold text-orange-600 mb-2">%99</span>
                                    <span className="text-sm font-medium text-orange-900">Müşteri Memnuniyeti</span>
                                </div>
                                <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-lg relative">
                                    <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">Görsel 2</div>
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
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Neden Rotabil Etiket?</h2>
                        <p className="text-slate-600">Bizi sektörde farklı kılan, kaliteye olan tutkumuz ve müşterilerimize verdiğimiz değerdir.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quality Policy & Mission/Vision */}
            <div className="container px-4 md:px-6 py-20">
                <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Kalite Politikamız ve Değerlerimiz</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-orange-500/20 p-2 rounded-lg h-fit">
                                        <CheckCircle2 className="text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">Müşteri Odaklılık</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">Müşterilerimizin beklentilerini tam olarak anlamak ve bu beklentilerin ötesinde çözümler sunmak önceliğimizdir.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-orange-500/20 p-2 rounded-lg h-fit">
                                        <CheckCircle2 className="text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">Doğru Ürün, Zamanında Teslimat</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">Üretim süreçlerimizi sıfır hata prensibiyle yönetiyor, söz verdiğimiz zamanda teslimat yaparak iş akışınızı koruyoruz.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-orange-500/20 p-2 rounded-lg h-fit">
                                        <CheckCircle2 className="text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">Çevreye Saygı</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">Üretim yaparken çevresel etkilerimizi minimize ediyor, sürdürülebilir bir gelecek için sorumluluk alıyoruz.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold mb-6 text-orange-400">Vizyonumuz</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Endüstriyel etiketleme alanında Türkiye'nin lider, dünyanın saygın markalarından biri olmak. Teknolojik gelişmelere öncülük ederek sektör standartlarını belirleyen bir güç haline gelmek.
                            </p>
                            <h3 className="text-xl font-bold mb-6 text-orange-400">Misyonumuz</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Müşterilerimizin ihtiyaçlarını en doğru şekilde analiz ederek, onlara katma değer sağlayan, kaliteli, ekonomik ve yenilikçi etiketleme çözümleri sunmak. Çalışanlarımızın mutluluğunu ve gelişimini gözeterek kurumsal sürekliliği sağlamak.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
