"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
    phoneNumber: string;
}

export function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show button after a short delay for better UX
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible || !phoneNumber) return null;

    // Clean phone number for WhatsApp API (remove spaces, plus sign is optional but let's keep it safe by just formatting it)
    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
    
    // Construct WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanedNumber}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 group"
            aria-label="WhatsApp İletişim"
        >
            <MessageCircle size={28} className="fill-current" />
            
            {/* Tooltip on hover */}
            <span className="absolute right-16 px-3 py-1.5 bg-white text-slate-800 text-sm font-medium rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700">
                Bize Ulaşın
            </span>
        </a>
    );
}
