import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['tr', 'en', 'de', 'fr', 'ar'],

    // Used when no locale matches
    defaultLocale: 'tr',

    // Custom pathnames for different languages (optional)
    // pathnames: {
    //   '/products': {
    //     tr: '/urunler',
    //     en: '/products',
    //     de: '/produkte',
    //     fr: '/produits',
    //     ar: '/products'
    //   }
    // }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation(routing);
