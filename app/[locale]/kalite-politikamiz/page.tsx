import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Microchip, Target, Zap } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: 'Kalite Politikamız ve Sertifikalar | Rotabil Etiket',
    description: 'Rotabil Etiket olarak ISO standartlarında, sıfır hata prensibiyle endüstriyel etiket üretiyoruz. Kalite politikamız ve test süreçlerimizi inceleyin.',
};

export default function QualityPolicyPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 mix-blend-multiply" />
                    <Image 
                        src="/img/about/quality.png" 
                        alt="Kalite" 
                        fill 
                        className="object-cover"
                    />
                </div>
                <div className="container relative z-10 px-4 text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg">
                        <Award className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Kalite Politikamız</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Sıfır hata prensibi, uluslararası standartlar ve %100 müşteri memnuniyeti. Üretimimizin her aşaması sıkı denetim altındadır.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Mükemmellik Tesadüf Değildir</h2>
                        <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                            Rotabil Etiket olarak, barkod ve etiket sistemlerinin endüstriyel süreçlerdeki kritik rolünün farkındayız. Bir etiketin okunamaması veya zorlu şartlarda yıpranmasının tüm üretim hattını durdurabileceğini biliyoruz.
                        </p>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            Bu yüzden üretim hattımızdan çıkan her bir rulo etiket, gelişmiş kalite kontrol süreçlerinden geçer. Kullanılan ham maddeden (ribon, kağıt, yapışkan) baskı netliğine kadar her detay, uluslararası normlara uygun olarak test edilir.
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Sıfır Hata Toleransı</h4>
                                    <p className="text-sm text-slate-600">Fire oranını minimize eden otomasyon destekli kalite kontrol sistemleri.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Garanti Kapsamı</h4>
                                    <p className="text-sm text-slate-600">Söz verdiğimiz dayanıklılık ve yapışkanlık standartları garanti altındadır.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="bg-slate-100 rounded-3xl p-6 aspect-square flex flex-col justify-center items-center text-center shadow-inner">
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">100%</h3>
                                <p className="text-slate-500 font-medium">Baskı Netliği</p>
                            </div>
                            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                                <Image src="/img/about/production.png" alt="Kalite Kontrol" fill className="object-cover" />
                            </div>
                        </div>
                        <div className="space-y-4 mt-12">
                            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                                <Image src="/img/certificates/rotabil-etiket-marka-tescil-belgesi.jpeg" alt="Tescil" fill className="object-cover" />
                            </div>
                            <div className="bg-blue-600 text-white rounded-3xl p-6 aspect-square flex flex-col justify-center items-center text-center shadow-lg">
                                <h3 className="text-4xl font-bold mb-2">ISO</h3>
                                <p className="text-blue-100 font-medium">Standartlarında Üretim</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Processes */}
                <div className="bg-slate-50 rounded-3xl p-8 md:p-16 mb-24">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Etiket Test Aşamalarımız</h2>
                        <p className="text-slate-600">Her etiket türü, kullanım alanının gerektirdiği zorlu koşullara göre test edilir.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Yapışma Testi', desc: 'Farklı yüzeylerde (metal, plastik, ahşap, pürüzlü) yüksek performanslı tutunma testi.', icon: Zap },
                            { title: 'Isı ve Çevre Testi', desc: 'Aşırı sıcak, dondurucu soğuk ve nemli ortamlarda etiketin kimyasal bütünlüğünün korunması.', icon: Microchip },
                            { title: 'Barkod Okunabilirlik', desc: 'Uluslararası ANSI standartlarında barkod okutma cihazlarıyla %100 doğrulama testi.', icon: CheckCircle2 }
                        ].map((test, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6">
                                    <test.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{test.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{test.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
