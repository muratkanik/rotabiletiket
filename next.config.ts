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
        source: '/:locale(tr|en|de|ar|fr)/urunler/etiketler',
        destination: '/:locale/urunler/etiket-cozumleri-ile-marka-bilinirliginizi-artirin',
        permanent: true,
      },
      {
        source: '/urunler/etiketler',
        destination: '/urunler/etiket-cozumleri-ile-marka-bilinirliginizi-artirin',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|de|ar|fr)/urunler/ribonlar',
        destination: '/:locale/urunler/ribon-fiyatlari-ve-cesitleri-ile-kaliteyi-yakalayin',
        permanent: true,
      },
      {
        source: '/urunler/ribonlar',
        destination: '/urunler/ribon-fiyatlari-ve-cesitleri-ile-kaliteyi-yakalayin',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|de|ar|fr)/urunler/barkod-yazicilar',
        destination: '/:locale/urunler/barkod-yazici-cozumleri-i-sletmenize-deger-katin',
        permanent: true,
      },
      {
        source: '/urunler/barkod-yazicilar',
        destination: '/urunler/barkod-yazici-cozumleri-i-sletmenize-deger-katin',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|de|ar|fr)/urunler/yedek-parca',
        destination: '/:locale/urunler/yedek-parca-kalite-ve-guvenilirlik-saglayin',
        permanent: true,
      },
      {
        source: '/urunler/yedek-parca',
        destination: '/urunler/yedek-parca-kalite-ve-guvenilirlik-saglayin',
        permanent: true,
      },
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
