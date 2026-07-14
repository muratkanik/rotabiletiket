'use client';

import React from 'react';
import { FileText, Phone, Send, Info } from 'lucide-react';

export function ProductCTA({ productName }: { productName?: string }) {

    const handleWhatsApp = () => {
        const text = productName 
            ? `Merhaba, ${productName} ürünü hakkında bilgi ve fiyat almak istiyorum.` 
            : `Merhaba, ürünleriniz hakkında bilgi almak istiyorum.`;
        const phone = '+905559658918';
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleMail = () => {
        const subject = productName ? `${productName} İsteği` : `Ürün Talebi`;
        window.location.href = `mailto:info@rotabiletiket.com?subject=${encodeURIComponent(subject)}`;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Bu Ürün İçin Hemen Aksiyon Alın</h3>
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
                    <span>Teklif Al</span>
                </button>

                <button 
                    onClick={handleMail}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <Send className="w-5 h-5" />
                    <span>Numune İste</span>
                </button>

                <button 
                    onClick={handleMail}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <Info className="w-5 h-5" />
                    <span>Teknik Destek</span>
                </button>
            </div>
        </div>
    );
}
