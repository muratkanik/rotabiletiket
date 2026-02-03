'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';

export default function CookieBanner({ locale }: { locale: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const [consentText, setConsentText] = useState('');

    useEffect(() => {
        // Check local storage
        const accepted = localStorage.getItem('cookie_consent_accepted');
        if (!accepted) {
            // Fetch settings client-side or assume passed?
            // Since this is a client component inside Layout, we can fetch on mount.
            fetchConsentText();
        }
    }, [locale]);

    const fetchConsentText = async () => {
        const settings = await getSiteSettings('cookie_consent');
        if (settings) {
            setConsentText(settings[locale] || settings['tr'] || '');
            setIsVisible(true);
        }
    };

    const handleAccept = () => {
        localStorage.setItem('cookie_consent_accepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600 flex-1">
                    <p>{consentText}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleAccept}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        {locale === 'tr' ? 'Kabul Et' :
                            locale === 'de' ? 'Akzeptieren' :
                                locale === 'fr' ? 'Accepter' :
                                    locale === 'ar' ? 'قبول' : 'Accept'}
                    </button>
                    <button
                        onClick={() => setIsVisible(false)} // Close without explicit accept? Or maybe just X
                        className="p-2 text-slate-400 hover:text-slate-600 md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
