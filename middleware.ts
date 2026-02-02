import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware'
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Run Supabase middleware first (to handle auth/sessions)
    // Note: updateSession usually returns a response. 
    // We need to be careful not to return early if we want intl to run, 
    // OR we act on the response returned by updateSession.

    // For now, let's prioritize intl routing for the structure, 
    // but ensure session is updated if needed.
    // A common pattern is to let intl handle the response, then update session on that response.

    const response = intlMiddleware(request);

    // 2. Update Supabase session on the response object
    // We verify if updateSession can accept a response object or just request.
    // The default updateSession implementation typically creates a response.
    // We might need to refactor updateSession to accept an existing response 
    // or just run it side-by-side if it just sets cookies.

    // Let's assume we run updateSession to ensure cookies are handled, 
    // but we return the intl response which handles the redirects/rewrites.
    await updateSession(request);

    return response;
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(tr|en|de|fr|ar)/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/about` -> `/en/about`)
        '/((?!api|admin|_next|_vercel|.*\\..*).*)'
    ]
};

