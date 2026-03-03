import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware'
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const isAdmin = request.nextUrl.pathname.startsWith('/admin');

    // 1. Admin Routes: Strictly handle authentication and session timeout logic.
    // Do not run internationalization on the admin panel.
    if (isAdmin) {
        // updateSession returns a redirect response to /admin/login if the session is expired.
        return await updateSession(request);
    }

    // 2. Public Routes: Handle internationalization
    const response = intlMiddleware(request);

    // Ensure session cookies are refreshed in the background for public routes if needed
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
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};

