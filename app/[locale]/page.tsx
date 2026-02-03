import { Hero } from '@/components/home/Hero';
import { FeatureCards } from '@/components/home/FeatureCards';
import { SectorsSection } from '@/components/home/SectorsSection';
import { Navbar } from '@/components/layout/Navbar';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <Hero locale={locale} />
            <FeatureCards locale={locale} />
            <SectorsSection locale={locale} />

            {/* Footer Placeholder (Using layout usually, but for now explicitly here or in layout) */}
        </main>
    );
}
