import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SEOScripts, SEOBodyScripts } from '@/components/layout/SEOScripts'
import { getSiteSettings } from '@/lib/settings'
import { Footer } from '@/components/layout/Footer'
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] })

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
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr">
            <head>
                <SEOScripts />
            </head>
            <body className={`${inter.className} antialiased`}>
                <SEOBodyScripts />
                <AnalyticsTracker />
                {children}
                <Footer />
                <Toaster />
            </body>
        </html>
    )
}
