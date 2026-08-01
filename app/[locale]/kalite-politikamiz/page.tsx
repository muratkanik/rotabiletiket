import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Microchip, Target, Zap } from 'lucide-react';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return locale === 'de'
        ? { title: 'Qualitätspolitik und Zertifikate | Rotabil Etiket', description: 'Industrielle Etiketten nach ISO-Standards mit konsequenter Qualitätskontrolle und Prüfprozessen.' }
        : { title: 'Kalite Politikamız ve Sertifikalar | Rotabil Etiket', description: 'Rotabil Etiket olarak ISO standartlarında, sıfır hata prensibiyle endüstriyel etiket üretiyoruz. Kalite politikamız ve test süreçlerimizi inceleyin.' };
}

export default async function QualityPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isGerman = locale === 'de';
    const certificateCopy = {
        tr: {
            title: 'ISO 9001:2015 Kalite Yönetim Sistemi',
            description: 'Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi adına düzenlenen ISO 9001:2015 sertifikası. Kapsam: Etiket ve barkod baskı hizmetleri. Sertifika no: KY-29635; geçerlilik tarihi: 23.09.2026.',
            trLabel: 'Türkçe sertifika', enLabel: 'İngilizce sertifika', download: 'Sertifika PDF dosyasını indir'
        },
        en: {
            title: 'ISO 9001:2015 Quality Management System',
            description: 'ISO 9001:2015 certificate issued to Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi. Scope: label and barcode printing services. Certificate no.: KY-29635; valid until 23 September 2026.',
            trLabel: 'Turkish certificate', enLabel: 'English certificate', download: 'Download the certificate PDF'
        },
        de: {
            title: 'ISO 9001:2015 Qualitätsmanagementsystem',
            description: 'ISO-9001:2015-Zertifikat für Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi. Geltungsbereich: Etiketten- und Barcode-Druckdienstleistungen. Zertifikat Nr. KY-29635; gültig bis zum 23. September 2026.',
            trLabel: 'Türkische Fassung', enLabel: 'Englische Fassung', download: 'Zertifikat als PDF herunterladen'
        },
        fr: {
            title: 'Système de management de la qualité ISO 9001:2015',
            description: 'Certificat ISO 9001:2015 délivré à Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi. Périmètre : services d’impression d’étiquettes et de codes-barres. N° de certificat : KY-29635 ; valable jusqu’au 23 septembre 2026.',
            trLabel: 'Version turque', enLabel: 'Version anglaise', download: 'Télécharger le certificat PDF'
        },
        es: {
            title: 'Sistema de gestión de la calidad ISO 9001:2015',
            description: 'Certificado ISO 9001:2015 emitido a Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi. Alcance: servicios de impresión de etiquetas y códigos de barras. Nº de certificado: KY-29635; válido hasta el 23 de septiembre de 2026.',
            trLabel: 'Versión turca', enLabel: 'Versión inglesa', download: 'Descargar el certificado en PDF'
        },
        it: {
            title: 'Sistema di gestione della qualità ISO 9001:2015',
            description: 'Certificato ISO 9001:2015 rilasciato a Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi. Ambito: servizi di stampa di etichette e codici a barre. N. certificato: KY-29635; valido fino al 23 settembre 2026.',
            trLabel: 'Versione turca', enLabel: 'Versione inglese', download: 'Scarica il certificato PDF'
        },
        ar: {
            title: 'نظام إدارة الجودة ISO 9001:2015',
            description: 'شهادة ISO 9001:2015 صادرة باسم Rotabil Mümessillik İthalat ve İhracat Sanayi Ticaret Limited Şirketi. النطاق: خدمات طباعة الملصقات والباركود. رقم الشهادة KY-29635؛ سارية حتى 23 سبتمبر 2026.',
            trLabel: 'النسخة التركية', enLabel: 'النسخة الإنجليزية', download: 'تنزيل الشهادة بصيغة PDF'
        }
    } as const;
    const copy = certificateCopy[locale as keyof typeof certificateCopy] || certificateCopy.en;
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 mix-blend-multiply" />
                    <Image 
                        src="/img/about/quality.png" 
                        alt={isGerman ? 'Qualität' : 'Kalite'}
                        fill 
                        className="object-cover"
                    />
                </div>
                <div className="container relative z-10 px-4 text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg">
                        <Award className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">{isGerman ? 'Unsere Qualitätspolitik' : 'Kalite Politikamız'}</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        {isGerman ? 'Das Null-Fehler-Prinzip, internationale Standards und hundertprozentige Kundenzufriedenheit. Jeder Produktionsschritt wird streng überwacht.' : 'Sıfır hata prensibi, uluslararası standartlar ve %100 müşteri memnuniyeti. Üretimimizin her aşaması sıkı denetim altındadır.'}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">{isGerman ? 'Exzellenz ist kein Zufall' : 'Mükemmellik Tesadüf Değildir'}</h2>
                        <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                            {isGerman ? 'Wir wissen, wie wichtig Barcode- und Etikettensysteme für industrielle Prozesse sind. Ein unlesbares oder unter schwierigen Bedingungen beschädigtes Etikett kann eine gesamte Produktionslinie stoppen.' : 'Rotabil Etiket olarak, barkod ve etiket sistemlerinin endüstriyel süreçlerdeki kritik rolünün farkındayız. Bir etiketin okunamaması veya zorlu şartlarda yıpranmasının tüm üretim hattını durdurabileceğini biliyoruz.'}
                        </p>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            {isGerman ? 'Deshalb durchläuft jede Etikettenrolle aus unserer Produktion fortschrittliche Qualitätskontrollen. Von Rohmaterialien wie Farbband, Papier und Klebstoff bis zur Druckschärfe wird jedes Detail nach internationalen Normen geprüft.' : 'Bu yüzden üretim hattımızdan çıkan her bir rulo etiket, gelişmiş kalite kontrol süreçlerinden geçer. Kullanılan ham maddeden (ribon, kağıt, yapışkan) baskı netliğine kadar her detay, uluslararası normlara uygun olarak test edilir.'}
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                <h4 className="font-bold text-slate-900 mb-1">{isGerman ? 'Null-Fehler-Toleranz' : 'Sıfır Hata Toleransı'}</h4>
                                    <p className="text-sm text-slate-600">{isGerman ? 'Automatisierte Qualitätskontrollen minimieren Ausschuss.' : 'Fire oranını minimize eden otomasyon destekli kalite kontrol sistemleri.'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                <h4 className="font-bold text-slate-900 mb-1">{isGerman ? 'Garantieleistung' : 'Garanti Kapsamı'}</h4>
                                    <p className="text-sm text-slate-600">{isGerman ? 'Unsere zugesagten Standards für Beständigkeit und Haftung sind abgesichert.' : 'Söz verdiğimiz dayanıklılık ve yapışkanlık standartları garanti altındadır.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="bg-slate-100 rounded-3xl p-6 aspect-square flex flex-col justify-center items-center text-center shadow-inner">
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">100%</h3>
                                <p className="text-slate-500 font-medium">{isGerman ? 'Druckschärfe' : 'Baskı Netliği'}</p>
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
                                <p className="text-blue-100 font-medium">{isGerman ? 'Produktion nach ISO-Standards' : 'Standartlarında Üretim'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ISO certification */}
                <section className="mb-24 rounded-3xl border border-blue-100 bg-blue-50/50 p-8 md:p-12">
                    <div className="mx-auto mb-10 max-w-3xl text-center">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">ISO 9001:2015</p>
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">{copy.title}</h2>
                        <p className="leading-relaxed text-slate-600">{copy.description}</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2">
                        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <Image src="/certificates/rotabil-iso-9001-2015-tr.png" alt={copy.trLabel} width={595} height={842} className="h-auto w-full" />
                            <figcaption className="p-4 text-center text-sm font-semibold text-slate-700">{copy.trLabel}</figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <Image src="/certificates/rotabil-iso-9001-2015-en.png" alt={copy.enLabel} width={595} height={842} className="h-auto w-full" />
                            <figcaption className="p-4 text-center text-sm font-semibold text-slate-700">{copy.enLabel}</figcaption>
                        </figure>
                    </div>
                    <div className="mt-8 text-center">
                        <a href="/certificates/iso-certificates.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                            {copy.download}
                        </a>
                    </div>
                </section>

                {/* Test Processes */}
                <div className="bg-slate-50 rounded-3xl p-8 md:p-16 mb-24">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">{isGerman ? 'Unsere Etikettentests' : 'Etiket Test Aşamalarımız'}</h2>
                        <p className="text-slate-600">{isGerman ? 'Jeder Etikettentyp wird unter den für seinen Einsatz erforderlichen anspruchsvollen Bedingungen geprüft.' : 'Her etiket türü, kullanım alanının gerektirdiği zorlu koşullara göre test edilir.'}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: isGerman ? 'Haftungstest' : 'Yapışma Testi', desc: isGerman ? 'Leistungsprüfung auf Metall, Kunststoff, Holz und rauen Oberflächen.' : 'Farklı yüzeylerde (metal, plastik, ahşap, pürüzlü) yüksek performanslı tutunma testi.', icon: Zap },
                            { title: isGerman ? 'Temperatur- und Umgebungstest' : 'Isı ve Çevre Testi', desc: isGerman ? 'Erhalt der chemischen Integrität bei extremer Hitze, Kälte und Feuchtigkeit.' : 'Aşırı sıcak, dondurucu soğuk ve nemli ortamlarda etiketin kimyasal bütünlüğünün korunması.', icon: Microchip },
                            { title: isGerman ? 'Barcode-Lesbarkeit' : 'Barkod Okunabilirlik', desc: isGerman ? 'Hundertprozentige Prüfung mit Barcode-Scannern nach internationalen ANSI-Standards.' : 'Uluslararası ANSI standartlarında barkod okutma cihazlarıyla %100 doğrulama testi.', icon: CheckCircle2 }
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
