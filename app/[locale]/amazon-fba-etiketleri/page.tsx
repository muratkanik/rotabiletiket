import React from 'react';
import { PackageSearch, Printer, CheckCircle2, AlertTriangle, ArrowRight, Table2 } from 'lucide-react';
import Image from 'next/image';
import { ProductCTA } from '@/components/product/ProductCTA';

export const metadata = {
    title: 'Amazon FBA Barkod Etiketleri (FNSKU) Üretimi | Rotabil Etiket',
    description: 'Amazon FBA ve FBM satıcıları için uluslararası standartlara uygun FNSKU, koli ve kargo etiketleri. Solmaz, yapışkanı kuvvetli ve %100 okunabilir Amazon etiketleri.',
};

export default function AmazonFBAPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* GEO Optimized Header (TL;DR) */}
            <div className="bg-slate-900 text-white py-16">
                <div className="container px-4">
                    <div className="flex items-center gap-2 text-orange-500 font-bold mb-4">
                        <PackageSearch className="w-5 h-5" />
                        <span>E-İhracat Özel Çözümü</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Amazon FBA & Koli Etiketleri Üretimi</h1>
                    
                    {/* Generative Engine Optimization (GEO) - TL;DR Section */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-3xl shadow-lg backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Hızlı Özet (TL;DR)
                        </h2>
                        <ul className="space-y-2 text-slate-200">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong>Amaç:</strong> Amazon depolarına (FBA) gönderilen ürünlerin Amazon kurallarına (FNSKU, UPC, EAN) tam uyumlu şekilde etiketlenmesi.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong>Risk:</strong> Kalitesiz etiketler yolda silinir veya düşerse, Amazon ürünleri depoya kabul etmez, envanteriniz kaybolur ve ekstra etiketleme maliyeti çıkar.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong>Çözüm:</strong> Rotabil Etiket'in ısıya, neme ve sürtünmeye dayanıklı "Amazon Standart" Termal ve Kuşe etiketleri ile 100% okuma garantisi.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
                    
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Amazon FNSKU ve Koli Etiketi Standartları Nelerdir?</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                        Amazon FBA (Fulfillment by Amazon) iş modeliyle global pazaryerlerinde satış yapan Türk ihracatçıların en sık karşılaştığı operasyonel sorun <strong>etiket reddidir</strong>. Depoya ulaşan koliler üzerindeki barkodlar okunmadığında, Amazon "Planlanmamış Hizmet Ücreti" (Unplanned Service Fee) keser.
                    </p>

                    {/* GEO Optimized Table */}
                    <div className="mb-12">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Table2 className="w-6 h-6 text-blue-600" /> Amazon Etiket Çözümleri Karşılaştırma Tablosu
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 text-slate-700">
                                    <tr>
                                        <th className="p-4 font-bold">Etiket Türü</th>
                                        <th className="p-4 font-bold">Kullanım Alanı</th>
                                        <th className="p-4 font-bold">Önerilen Hammadde</th>
                                        <th className="p-4 font-bold">Rotabil Çözümü</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">FNSKU (Ürün Barkodu)</td>
                                        <td className="p-4 text-slate-600">Her bir ürünün veya kutunun üzeri</td>
                                        <td className="p-4 text-slate-600">Lamine Termal veya Kuşe</td>
                                        <td className="p-4 text-blue-600 font-medium">Leke Tutmaz Termal Etiket</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">Koli (Box) Etiketi</td>
                                        <td className="p-4 text-slate-600">Dış taşıma kolisinin üzeri</td>
                                        <td className="p-4 text-slate-600">Kuşe + Wax/Resin Ribon</td>
                                        <td className="p-4 text-blue-600 font-medium">Yırtılmaz Vellum / Kuşe</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">Palet Etiketi</td>
                                        <td className="p-4 text-slate-600">Paletin 4 tarafı (streç üzeri)</td>
                                        <td className="p-4 text-slate-600">Plastik Bazlı (PP)</td>
                                        <td className="p-4 text-blue-600 font-medium">Opak PP (Hava şartlarına tam dayanım)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-blue-50 p-6 rounded-2xl">
                            <Printer className="w-8 h-8 text-blue-600 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Ribonlu Baskı (Kuşe)</h3>
                            <p className="text-slate-600 text-sm">
                                Özellikle Amerika ve Avrupa depolarına deniz yoluyla aylarca süren sevkiyatlarda, güneş ışığına ve neme maruz kalan koli etiketleri için ribonlu termal transfer (Kuşe + Ribon) baskı öneriyoruz. Kesinlikle silinmez.
                            </p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-2xl">
                            <Printer className="w-8 h-8 text-orange-600 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Direkt Termal Baskı</h3>
                            <p className="text-slate-600 text-sm">
                                Uçak kargo ile hızlı gönderim yapılan küçük paket ve FNSKU barkodlarında Lamine Termal etiketlerimiz maliyet avantajı sağlar. Amazon'un istediği 300 DPI netliği fazlasıyla karşılar.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <ProductCTA productName="Amazon FBA Etiketleri" />
                    </div>

                </div>
            </div>
        </main>
    );
}
