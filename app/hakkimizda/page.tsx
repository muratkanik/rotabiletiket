import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/settings";
import Image from "next/image";

export const metadata = {
    title: 'Hakkımızda | Rotabil Etiket',
    description: 'Rotabil Etiket hakkında bilgi alın. 2000 yılından beri endüstriyel çözüm ortağınız.'
}

export default async function AboutPage() {
    const heroSettings = await getSiteSettings('hero_section');

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-20 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
                <p className="text-slate-400">Endüstriyel Çözüm Ortağınız</p>
            </div>

            <div className="container px-4 md:px-6 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-slate-100">
                    <div className="prose prose-lg max-w-none text-slate-600">
                        <p className="lead text-xl text-slate-800 font-medium mb-8">
                            {heroSettings?.subtitle || "2000 yılından günümüze barkod etiketi üretimi ve termal transfer ribbon ithalatı yapmakta olan ROTABİL, barkod yazıcı, barkod okuyucu satış ve teknik destek hizmeti vermektedir."}
                        </p>

                        <p>
                            Sektördeki 20 yılı aşkın tecrübemizle, müşterilerimize en doğru, en kaliteli ve en hızlı çözümleri sunmayı ilke edindik.
                            Gelişen teknolojiyi yakından takip ederek, üretim parkurumuzu sürekli modernize ediyor ve kapasitemizi arttırıyoruz.
                        </p>

                        <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Misyonumuz</h3>
                        <p>
                            Müşterilerimizin ihtiyaçlarını en doğru şekilde analiz ederek, onlara katma değer sağlayan, kaliteli ve ekonomik etiketleme çözümleri sunmak.
                        </p>

                        <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Vizyonumuz</h3>
                        <p>
                            Endüstriyel etiketleme alanında Türkiye'nin lider, dünyanın saygın markalarından biri olmak.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">20+</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Yıllık Tecrübe</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">1000+</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Mutlu Müşteri</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">Milyon+</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Etiket Üretimi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">7/24</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Destek</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
