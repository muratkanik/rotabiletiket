import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zninvhkeicgkixhigufo.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Matches any path that ends with .php (e.g., /wax-ribbon.php, /a/b.php)
        source: '/:path(.*\\.php)',
        destination: '/',
        permanent: true,
      },
      {
        // Catch-all for any straggling URLs starting with /index.php/ (e.g., /index.php/barkod-yazicilar/bilgi-bankasi.php) 
        // that might not be caught if there are query strings or weird structures.
        source: '/index.php/:path*',
        destination: '/',
        permanent: true,
      }
    ];
  },
};

export default withNextIntl(nextConfig);
