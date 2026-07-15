import React from 'react';
import { Download, ChevronDown, Shield, Droplets, ThermometerSun } from 'lucide-react';

export function ProductDurability({ durability, locale = 'tr' }: { durability: any; locale?: string }) {
    if (!durability || Object.keys(durability).length === 0) return null;

    const renderBar = (label: string, icon: React.ReactNode, value: number, colorClass: string) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    {icon} {label}
                </span>
                <span className="text-xs font-bold text-slate-500">{value}/10</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${value * 10}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5">{locale === 'de' ? 'Beständigkeit und Testergebnisse' : 'Dayanıklılık & Test Sonuçları'}</h3>
            {durability.heat && renderBar(locale === 'de' ? 'Temperaturbeständigkeit' : 'Isı Dayanımı', <ThermometerSun className="w-4 h-4 text-orange-500" />, durability.heat, 'bg-orange-500')}
            {durability.chemical && renderBar(locale === 'de' ? 'Chemikalienbeständigkeit' : 'Kimyasal Dayanım', <Droplets className="w-4 h-4 text-purple-500" />, durability.chemical, 'bg-purple-500')}
            {durability.physical && renderBar(locale === 'de' ? 'Beständigkeit gegen physische Abnutzung' : 'Fiziksel Yıpranma', <Shield className="w-4 h-4 text-blue-500" />, durability.physical, 'bg-blue-500')}
        </div>
    );
}

export function ProductDocuments({ documents, locale = 'tr' }: { documents: any[]; locale?: string }) {
    if (!documents || documents.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">{locale === 'de' ? 'Technische Dokumente und Zertifikate' : 'Teknik Dökümanlar & Sertifikalar'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                    <a 
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-800 text-sm group-hover:text-blue-700">{doc.title}</p>
                            <p className="text-xs text-slate-500">{doc.type || 'PDF Document'}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

export function ProductFAQ({ faqs, locale = 'tr' }: { faqs: any[]; locale?: string }) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="font-bold text-slate-900 text-xl mb-6">{locale === 'de' ? 'Häufig gestellte Fragen' : 'Sık Sorulan Sorular'}</h3>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <details key={idx} className="group bg-white border border-slate-200 rounded-xl [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-5 text-slate-900 font-medium">
                            <h4 className="text-base">{faq.question}</h4>
                            <span className="shrink-0 rounded-full bg-slate-50 p-1.5 text-slate-900 sm:p-3 group-open:-rotate-180 transition-transform">
                                <ChevronDown className="w-4 h-4" />
                            </span>
                        </summary>
                        <p className="px-5 pb-5 leading-relaxed text-slate-600 text-sm mt-2 border-t border-slate-100 pt-4">
                            {faq.answer}
                        </p>
                    </details>
                ))}
            </div>
        </div>
    );
}
