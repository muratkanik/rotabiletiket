import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/settings";
import Image from "next/image";
import { CheckCircle2, Factory, ShieldCheck, Users, TrendingUp, History, LucideIcon } from "lucide-react";

export const metadata = {
    title: 'Hakkımızda | Rotabil Etiket',
    description: '20 yılı aşkın tecrübesiyle Rotabil Etiket, endüstriyel barkod ve etiket çözümlerinde güvenilir iş ortağınız. Üretim gücümüz ve kalite politikamız hakkında bilgi edinin.'
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    Factory,
    ShieldCheck,
    Users,
    TrendingUp
};

export default async function AboutPage() {
    const heroSettings = await getSiteSettings('hero_section');
    const aboutContent = await getSiteSettings('about_us_content');

    // Default fallbacks if DB is empty
    const history = aboutContent?.history || { title: "", text: [] };
    const stats = aboutContent?.stats || [];
    const features = aboutContent?.features || [];
    const qualityPolicy = aboutContent?.quality_policy || [];
    const missionVision = aboutContent?.mission_vision || { vision: "", mission: "" };

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
                                        alt="Modern Etiket Üretim Tesisi"
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
                                        alt="Kalite Kontrol Süreçleri"
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
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Neden Rotabil Etiket?</h2>
                        <p className="text-slate-600">Bizi sektörde farklı kılan, kaliteye olan tutkumuz ve müşterilerimize verdiğimiz değerdir.</p>
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

            {/* Quality Policy & Mission/Vision */}
            <div className="container px-4 md:px-6 py-20">
                <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Kalite Politikamız ve Değerlerimiz</h2>
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
                            <h3 className="text-xl font-bold mb-6 text-orange-400">Vizyonumuz</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                {missionVision.vision}
                            </p>
                            <h3 className="text-xl font-bold mb-6 text-orange-400">Misyonumuz</h3>
                            <p className="text-slate-300 leading-relaxed">
                                {missionVision.mission}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
