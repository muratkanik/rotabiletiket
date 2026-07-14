import React from 'react';
import { Factory, Clock, Settings, Users } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: 'Üretim Tesisimiz ve Kapasitemiz | Rotabil Etiket',
    description: 'Rotabil Etiket olarak günlük 5 Milyon+ etiket üretim kapasitesi, ileri teknoloji makine parkuru ve uzman kadromuzla hizmet veriyoruz.',
};

export default function ProductionFacilityPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image 
                        src="/img/about/production.png" 
                        alt="Üretim Tesisi" 
                        fill 
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60" />
                </div>
                <div className="container relative z-10 px-4 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-lg">
                        <Factory className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Üretim Tesisimiz</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        İleri teknoloji makine parkuru, alanında uzman operatörler ve yüksek kapasiteli üretim bandı.
                    </p>
                </div>
            </div>

            <div className="container px-4 py-16 md:py-24">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
                    {[
                        { label: 'Günlük Kapasite', value: '5M+', desc: 'Adet Etiket Üretimi' },
                        { label: 'Makine Parkuru', value: '10+', desc: 'İleri Teknoloji Baskı Makinesi' },
                        { label: 'Kalite Kontrol', value: '%100', desc: 'Sıfır Hata Politikası' },
                        { label: 'Hızlı Teslimat', value: '24s', desc: 'Maksimum Hızda Sevkiyat' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                            <h3 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</h3>
                            <p className="font-bold text-slate-900 mb-1">{stat.label}</p>
                            <p className="text-xs text-slate-500">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
                        <div className="space-y-4 translate-y-8">
                            <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-lg relative cursor-pointer hover:scale-105 transition-transform duration-500">
                                <Image
                                    src="/img/about/production.png"
                                    alt="Modern Etiket Üretim Tesisi 1"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-lg relative cursor-pointer hover:scale-105 transition-transform duration-500">
                                <Image
                                    src="/img/about/quality.png"
                                    alt="Modern Etiket Üretim Tesisi 2"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Teknoloji ve Tecrübenin Buluşma Noktası</h2>
                        <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                            Rotabil Etiket üretim tesisleri, sektördeki en son teknoloji baskı makineleri ve tam otomatik kalite kontrol sistemleriyle donatılmıştır. Kuşe, Termal, Silvermat, PP ve özel endüstriyel etiketlerin tamamı kendi bünyemizde üretilmektedir.
                        </p>
                        
                        <div className="space-y-6 mt-8">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Geniş Makine Parkuru</h4>
                                    <p className="text-sm text-slate-600">Farklı ölçü ve özelliklerdeki siparişlere aynı anda yanıt verebilen esnek üretim hattı.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Kesintisiz Üretim</h4>
                                    <p className="text-sm text-slate-600">Müşterilerimizin acil ihtiyaçları için optimize edilmiş, durmaksızın çalışan vardiya sistemi.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Uzman Operatörler</h4>
                                    <p className="text-sm text-slate-600">Sektörde yılların tecrübesine sahip baskı ustaları ve kalite kontrol mühendisleri.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
