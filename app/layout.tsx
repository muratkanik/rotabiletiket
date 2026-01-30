import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SEOScripts, SEOBodyScripts } from '@/components/layout/SEOScripts'
import { getSiteSettings } from '@/lib/settings'

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
            icon: '/logo.png',
            shortcut: '/logo.png',
            apple: '/logo.png',
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
            <body className={inter.className}>
                <SEOBodyScripts />
                {children}
            </body>
        </html>
    )
}
