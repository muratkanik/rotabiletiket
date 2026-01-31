'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/app/actions/analytics';

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname && !pathname.startsWith('/admin')) {
            trackPageView(pathname);
        }
    }, [pathname]);

    return null;
}
