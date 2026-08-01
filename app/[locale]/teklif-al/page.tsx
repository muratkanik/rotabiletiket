import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { RfqForm } from '@/components/contact/RfqForm';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return locale === 'de'
        ? { title: 'Technische Angebotsanfrage | Rotabil Etiket', description: 'Senden Sie Ihre Anforderungen an industrielle Etiketten, Barcodes oder RFID an das technische Team von Rotabil Etiket.' }
        : { title: 'Technical Quote Request | Rotabil Etiket', description: 'Send your industrial labeling, barcode or RFID requirements to Rotabil Etiket technical sales team.' };
}

export default async function RfqPage({ searchParams }: { searchParams: Promise<{ solution?: string; requestType?: string }> }) {
    const locale = await getLocale();
    const { solution = '', requestType = 'technical_support' } = await searchParams;
    const copy: Record<string, { eyebrow: string; title: string; description: string }> = {
        tr: { eyebrow: 'Teknik talep', title: 'Teknik talebinizi bize iletin', description: 'Uygulamanızı ve teknik ihtiyaçlarınızı paylaşın. Ekibimiz yüzey, sıcaklık, kimyasal maruziyet ve tanımlama gereksinimlerini değerlendirerek size dönüş yapsın.' },
        en: { eyebrow: 'Technical request', title: 'Send us your technical request', description: 'Tell us about your application and requirements. Our team will review the surface, temperature, chemical exposure and identification needs.' },
        de: { eyebrow: 'Technische Anfrage', title: 'Senden Sie uns Ihre technische Anfrage', description: 'Teilen Sie uns Ihre Anwendung und Anforderungen mit. Unser Team prüft Oberfläche, Temperatur, Chemikalien und Kennzeichnungstechnologie.' },
        fr: { eyebrow: 'Demande technique', title: 'Envoyez-nous votre demande technique', description: 'Décrivez votre application et vos besoins. Notre équipe étudiera la surface, la température, les produits chimiques et l’identification.' },
        ar: { eyebrow: 'طلب فني', title: 'أرسلوا طلبكم الفني إلينا', description: 'شاركوا تطبيقكم واحتياجاتكم الفنية. سيراجع فريقنا السطح ودرجة الحرارة والتعرض الكيميائي ومتطلبات التعريف.' },
        es: { eyebrow: 'Solicitud técnica', title: 'Envíenos su solicitud técnica', description: 'Comparta su aplicación y sus requisitos. Nuestro equipo revisará la superficie, la temperatura, la exposición química y la identificación.' },
        it: { eyebrow: 'Richiesta tecnica', title: 'Inviaci la tua richiesta tecnica', description: 'Descrivi la tua applicazione e le tue esigenze. Il nostro team valuterà superficie, temperatura, esposizione chimica e identificazione.' },
    };
    const text = copy[locale] || copy.en;

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-900 py-16 text-white">
                <div className="container px-4 md:px-6">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                        {text.eyebrow}
                    </p>
                    <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">
                        {text.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg text-slate-300">
                        {text.description}
                    </p>
                </div>
            </section>

            <div className="container max-w-5xl px-4 py-12 md:px-6 md:py-16">
                <RfqForm locale={locale} solutionSlug={solution} requestType={requestType} />
            </div>
        </main>
    );
}
