"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
    phoneNumber: string;
    locale?: string;
}

export function WhatsAppButton({ phoneNumber, locale = 'tr' }: WhatsAppButtonProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show button after a short delay for better UX
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible || !phoneNumber) return null;

    // Clean phone number for WhatsApp API
    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanedNumber}`;

    // Turkey Time Zone (GMT+3) check for off-hours
    const isOffHours = () => {
        try {
            const now = new Date();
            const utcHour = now.getUTCHours();
            const gmt3Hour = (utcHour + 3) % 24;
            
            // Off hours: Before 09:00 or after 17:59 (18:00+)
            return gmt3Hour < 9 || gmt3Hour >= 18;
        } catch {
            return false;
        }
    };

    const offHours = isOffHours();

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 group"
            onClick={() => {
                // We let them click to WhatsApp anyway, but this is just for UI tooltip check
            }}
            aria-label={locale === 'de' ? 'WhatsApp-Kontakt' : 'WhatsApp İletişim'}
        >
            <MessageCircle size={28} className="fill-current" />
            
            {/* Tooltip on hover */}
            <span className="absolute right-16 px-4 py-2 bg-white text-slate-800 text-sm font-medium rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700">
                {offHours ? (
                    <span className="flex flex-col gap-1 items-end text-right">
                        <span className="font-semibold text-orange-500">{locale === 'de' ? 'Außerhalb der Geschäftszeiten' : 'Mesai Saatleri Dışındayız'}</span>
                        <span className="text-xs text-slate-500 font-normal">{locale === 'de' ? 'Ihre Nachricht wurde empfangen. Geschäftszeiten (09:00–18:00)' : 'Mesajınız alınmıştır. Mesai saatleri (09:00-18:00)'}</span>
                        <span className="text-xs text-slate-500 font-normal">{locale === 'de' ? 'Wir antworten innerhalb dieser Zeiten.' : 'içinde dönüş yapılacaktır.'}</span>
                    </span>
                ) : (
                    locale === 'de' ? 'Kontakt aufnehmen' : 'Bize Ulaşın'
                )}
            </span>
        </a>
    );
}
