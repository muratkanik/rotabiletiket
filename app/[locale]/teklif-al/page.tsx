import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { RfqForm } from '@/components/contact/RfqForm';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return locale === 'de'
        ? { title: 'Technische Angebotsanfrage | Rotabil Etiket', description: 'Senden Sie Ihre Anforderungen an industrielle Etiketten, Barcodes oder RFID an das technische Team von Rotabil Etiket.' }
        : { title: 'Technical Quote Request | Rotabil Etiket', description: 'Send your industrial labeling, barcode or RFID requirements to Rotabil Etiket technical sales team.' };
}

export default async function RfqPage({ searchParams }: { searchParams: Promise<{ solution?: string }> }) {
    const locale = await getLocale();
    const { solution = '' } = await searchParams;
    const isGerman = locale === 'de';

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-900 py-16 text-white">
                <div className="container px-4 md:px-6">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                        {isGerman ? 'Technische Anfrage' : 'Technical enquiry'}
                    </p>
                    <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">
                        {isGerman ? 'Fordern Sie ein technisches Angebot an' : 'Request a technical quote'}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg text-slate-300">
                        {isGerman
                            ? 'Teilen Sie uns Ihre Anwendung mit. Unser Team prüft Oberfläche, Temperatur, Chemikalien und Kennzeichnungstechnologie.'
                            : 'Tell us about your application. Our team will review the surface, temperature, chemical and identification requirements.'}
                    </p>
                </div>
            </section>

            <div className="container max-w-5xl px-4 py-12 md:px-6 md:py-16">
                <RfqForm locale={locale} solutionSlug={solution} />
            </div>
        </main>
    );
}
