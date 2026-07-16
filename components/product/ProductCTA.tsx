'use client';

import React from 'react';
import { FileText, Phone, Send, Info } from 'lucide-react';

export function ProductCTA({ productName, locale = 'tr' }: { productName?: string; locale?: string }) {
    const copy = {
        tr: { title: 'Bu Ürün İçin Hemen Aksiyon Alın', quote: 'Teklif Al', sample: 'Numune İste', support: 'Teknik Destek', greeting: 'Merhaba' },
        en: { title: 'Take the Next Step for This Product', quote: 'Request a Quote', sample: 'Request a Sample', support: 'Technical Support', greeting: 'Hello' },
        de: { title: 'Nächsten Schritt für dieses Produkt gehen', quote: 'Angebot anfordern', sample: 'Muster anfordern', support: 'Technischer Support', greeting: 'Guten Tag' },
        fr: { title: 'Passez à l’étape suivante pour ce produit', quote: 'Demander un devis', sample: 'Demander un échantillon', support: 'Support technique', greeting: 'Bonjour' },
        ar: { title: 'اتخذ الخطوة التالية لهذا المنتج', quote: 'اطلب عرض سعر', sample: 'اطلب عينة', support: 'الدعم الفني', greeting: 'مرحباً' },
        es: { title: 'Dé el siguiente paso para este producto', quote: 'Solicitar presupuesto', sample: 'Solicitar muestra', support: 'Soporte técnico', greeting: 'Hola' },
        it: { title: 'Fai il prossimo passo per questo prodotto', quote: 'Richiedi un preventivo', sample: 'Richiedi un campione', support: 'Supporto tecnico', greeting: 'Buongiorno' },
    }[locale as 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'es' | 'it'] || {
        title: 'Take the Next Step for This Product', quote: 'Request a Quote', sample: 'Request a Sample', support: 'Technical Support', greeting: 'Hello'
    };

    const handleWhatsApp = () => {
        const text = productName ? `${copy.greeting}, I would like information and a quote for ${productName}.` : `${copy.greeting}, I would like information about your products.`;
        const phone = '+905559658918';
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleMail = () => {
        const subject = productName ? `${productName} request` : 'Product request';
        window.location.href = `mailto:info@rotabiletiket.com?subject=${encodeURIComponent(subject)}`;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{copy.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button 
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <Phone className="w-5 h-5" />
                    <span>WhatsApp</span>
                </button>
                
                <button 
                    onClick={handleMail}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <FileText className="w-5 h-5" />
                    <span>{copy.quote}</span>
                </button>

                <button 
                    onClick={handleMail}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <Send className="w-5 h-5" />
                    <span>{copy.sample}</span>
                </button>

                <button 
                    onClick={handleMail}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <Info className="w-5 h-5" />
                    <span>{copy.support}</span>
                </button>
            </div>
        </div>
    );
}
