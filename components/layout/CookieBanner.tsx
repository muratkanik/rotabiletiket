'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';

export default function CookieBanner({ locale }: { locale: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const [consentText, setConsentText] = useState('');

    useEffect(() => {
        const fetchConsentText = async () => {
            const settings = await getSiteSettings('cookie_consent');
            if (settings) {
                setConsentText(settings[locale] || settings['tr'] || '');
                setIsVisible(true);
            }
        };

        const accepted = localStorage.getItem('cookie_consent_accepted');
        if (!accepted) {
            fetchConsentText();
        }
    }, [locale]);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent_accepted', 'true');
        setIsVisible(false);

        if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
            (window as any).gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto z-[100] md:max-w-[420px] bg-white rounded-2xl border border-slate-100 shadow-2xl p-5 md:p-6 animate-in slide-in-from-bottom duration-500 fade-in">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 text-slate-900">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                        <Cookie size={20} />
                    </div>
                    <h3 className="font-semibold text-lg">Çerez Politikası</h3>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
            
            <div className="text-sm text-slate-600 leading-relaxed mb-6">
                <p>{consentText}</p>
            </div>
            
            <div className="flex items-center gap-3 w-full">
                <button
                    onClick={handleAccept}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
                >
                    {locale === 'tr' ? 'Tümünü Kabul Et' :
                        locale === 'de' ? 'Alle Akzeptieren' :
                            locale === 'fr' ? 'Tout Accepter' :
                                locale === 'ar' ? 'قبول الكل' : 'Accept All'}
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                    {locale === 'tr' ? 'Reddet' :
                        locale === 'de' ? 'Ablehnen' :
                            locale === 'fr' ? 'Refuser' :
                                locale === 'ar' ? 'رفض' : 'Decline'}
                </button>
            </div>
        </div>
    );
}
