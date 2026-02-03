import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { SEOScripts, SEOBodyScripts } from '@/components/layout/SEOScripts';
import { getSiteSettings } from '@/lib/settings';
import { Footer } from '@/components/layout/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getSiteSettings('global_seo');
    return {
        title: seo?.default_title || 'Rotabil Etiket | Endüstriyel Barkod ve Etiket Çözümleri',
        description: seo?.default_description || 'Yüksek kaliteli etiket üretimi, barkod yazıcılar ve ribon çözümleri. Endüstriyel ihtiyaçlarınız için profesyonel çözüm ortağınız.',
        openGraph: {
            images: [seo?.og_image_url || '/logo.png']
        },
        icons: {
            icon: '/icon.png',
            shortcut: '/icon.png',
            apple: '/icon.png',
        }
    };
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                <SEOScripts />
            </head>
            <body className={`${inter.className} antialiased`}>
                <SEOBodyScripts />
                <NextIntlClientProvider messages={messages}>
                    <AnalyticsTracker />
                    {children}
                    <Footer locale={locale} />
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
