import type { Metadata } from 'next';
import '../globals.css';
import { SEOScripts, SEOBodyScripts } from '@/components/layout/SEOScripts';
import { OrganizationSchema } from '@/components/layout/OrganizationSchema';
import { getSiteSettings } from '@/lib/settings';
import { Footer } from '@/components/layout/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import CookieBanner from '@/components/layout/CookieBanner';
import { Navbar } from '@/components/layout/Navbar';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const seo = await getSiteSettings('global_seo');
    const isGerman = locale === 'de';
    return {
        metadataBase: new URL('https://rotabiletiket.com'),
        title: isGerman ? 'Rotabil Etiket | Industrielle Etiketten- und Barcodelösungen' : seo?.default_title || 'Rotabil Etiket | Endüstriyel Barkod ve Etiket Çözümleri',
        description: isGerman ? 'Hochwertige Etiketten, Barcode-Drucker und Farbbänder für industrielle Anwendungen.' : seo?.default_description || 'Yüksek kaliteli etiket üretimi, barkod yazıcılar ve ribon çözümleri. Endüstriyel ihtiyaçlarınız için profesyonel çözüm ortağınız.',
        openGraph: {
            images: [seo?.og_image_url || '/logo.png']
        },
        alternates: {
            languages: {
                'x-default': '/',
                'tr': '/tr',
                'en': '/en',
                'de': '/de',
                'fr': '/fr',
                'ar': '/ar'
            }
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

    // Fetch contact info for WhatsApp
    const contactInfo = await getSiteSettings('contact_info');
    const whatsappNumber = contactInfo?.whatsapp || '+90 555 965 89 18';

    return (
        <html lang={locale}>
            <head>
                <OrganizationSchema locale={locale} />
                <SEOScripts />
            </head>
            <body className="font-sans antialiased overflow-x-hidden">
                <SEOBodyScripts />
                <NextIntlClientProvider messages={messages}>
                    <AnalyticsTracker />
                    <Navbar />
                    {children}
                    <Footer locale={locale} />
                    <CookieBanner locale={locale} />
                    <WhatsAppButton phoneNumber={whatsappNumber} locale={locale} />
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
