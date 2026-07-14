'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function trackPageView(path: string) {
    try {
        const supabase = await createClient();
        const headersList = await headers();

        const userAgent = headersList.get('user-agent') || 'unknown';
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const referrer = headersList.get('referer') || null;
        const country = headersList.get('x-vercel-ip-country') || 'TR'; // Default to TR if not found locally

        // Hash IP for basic privacy
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

        await supabase.from('page_views').insert({
            path,
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
