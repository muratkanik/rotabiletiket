'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

function normalizePath(path: string) {
    if (!path) return '/';
    const withoutQuery = path.split('?')[0].split('#')[0];
    if (withoutQuery.length > 1) return withoutQuery.replace(/\/+$/, '');
    return withoutQuery || '/';
}

function normalizeReferrer(value: string | null | undefined) {
    if (!value?.trim()) return null;

    try {
        const url = new URL(value.trim());
        // Query strings may contain search terms or campaign data. The host and
        // path are enough for source reporting and keep the stored value stable.
        url.search = '';
        url.hash = '';
        url.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
        return url.toString().replace(/\/$/, '') || url.origin;
    } catch {
        return null;
    }
}

export async function trackPageView(path: string, clientReferrer?: string) {
    try {
        const supabase = await createClient();
        const headersList = await headers();

        const userAgent = headersList.get('user-agent') || 'unknown';
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        // The Server Action request's Referer is the current site page, not
        // necessarily the page that brought the visitor here. The browser's
        // document.referrer is the reliable source value.
        const referrer = normalizeReferrer(clientReferrer || null);
        const country = headersList.get('x-vercel-ip-country') || 'TR'; // Default to TR if not found locally

        // Hash IP for basic privacy
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

        await supabase.from('page_views').insert({
            path: normalizePath(path),
            user_agent: userAgent,
            ip_hash: ipHash,
            referrer,
            country
        });
    } catch (error) {
        console.error('Tracking error:', error);
        // Fail silently to not impact user experience
    }
}

export async function trackConversion(eventName: string, path: string, locale?: string, solutionSlug?: string) {
    const allowedEvents = ['rfq_submit', 'sample_request', 'quote_request', 'technical_support_request', 'datasheet_download'];
    if (!allowedEvents.includes(eventName)) return;

    try {
        const supabase = await createClient();
        await supabase.from('conversion_events').insert({
            event_name: eventName,
            path,
            locale: locale || null,
            solution_slug: solutionSlug || null,
        });
    } catch (error) {
        console.error('Conversion tracking error:', error);
    }
}
