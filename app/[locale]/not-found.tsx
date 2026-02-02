'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/src/i18n/routing';

export default function NotFound() {
    // If this component is rendered inside the [locale] layout, 
    // it can use useTranslations context provided by the layout.
    // However, purely safely, we might fallback if context is missing,
    // but standard Next.js behavior with next-intl setup puts it inside.
    const t = useTranslations('Common');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-lg text-slate-600 mb-8">Sayfa bulunamadı / Page not found</p>
            <Button asChild>
                <Link href="/">{t('home') || 'Home'}</Link>
            </Button>
        </div>
    );
}
