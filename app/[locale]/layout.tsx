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

const localizedMeta: Record<string, { title: string; description: string }> = {
    tr: {
        title: 'Rotabil Etiket | Üreticiden Doğrudan Barkod ve Etiket Çözümleri',
        description: 'Yüksek kaliteli etiket üretimi, barkod yazıcılar ve ribon çözümleri. Endüstriyel ihtiyaçlarınız için profesyonel çözüm ortağınız.',
    },
    en: {
        title: 'Rotabil Etiket | Industrial Barcode and Label Solutions',
        description: 'High-quality labels, barcode printers and ribbon solutions for industrial applications.',
    },
    de: {
        title: 'Rotabil Etiket | Industrielle Etiketten- und Barcodelösungen',
        description: 'Hochwertige Etiketten, Barcode-Drucker und Farbbänder für industrielle Anwendungen.',
    },
    fr: {
        title: 'Rotabil Etiket | Solutions industrielles d’étiquetage et de codes-barres',
        description: 'Étiquettes, imprimantes de codes-barres et rubans de haute qualité pour les applications industrielles.',
    },
    ar: {
        title: 'روتابيل إتيكيت | حلول الملصقات والباركود الصناعية',
        description: 'ملصقات عالية الجودة وطابعات باركود وأشرطة نقل حراري للتطبيقات الصناعية.',
    },
    es: {
        title: 'Rotabil Etiket | Soluciones industriales de etiquetas y códigos de barras',
        description: 'Etiquetas, impresoras de códigos de barras y cintas de alta calidad para aplicaciones industriales.',
    },
    it: {
        title: 'Rotabil Etiket | Soluzioni industriali per etichette e codici a barre',
        description: 'Etichette, stampanti per codici a barre e nastri di alta qualità per applicazioni industriali.',
    },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const seo = await getSiteSettings('global_seo');
    const meta = localizedMeta[locale] || localizedMeta.en;
    return {
        metadataBase: new URL('https://rotabiletiket.com'),
        title: locale === 'tr' ? seo?.default_title || meta.title : meta.title,
        description: locale === 'tr' ? seo?.default_description || meta.description : meta.description,
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
                'ar': '/ar',
                'es': '/es',
                'it': '/it'
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
