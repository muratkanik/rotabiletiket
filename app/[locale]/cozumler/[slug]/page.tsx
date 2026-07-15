import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { getSolution, getSolutionLocaleSlugs } from '@/lib/solutions';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };
const detailCopy: Record<string, { notFound: string; all: string; preparing: string; specs: string; features: string; quote: string; titleSuffix: string }> = {
    tr: { notFound: 'Çözüm bulunamadı', all: 'Tüm çözümler', preparing: 'Teknik içerik hazırlanıyor.', specs: 'Teknik veriler', features: 'Öne çıkan özellikler', quote: 'Teklif iste' , titleSuffix: 'Rotabil Etiket Teknik Çözümleri' },
    en: { notFound: 'Solution not found', all: 'All solutions', preparing: 'Technical content is currently being prepared.', specs: 'Technical data', features: 'Key features', quote: 'Request a quote', titleSuffix: 'Rotabil Etiket Technical Solutions' },
    de: { notFound: 'Lösung nicht gefunden', all: 'Alle Lösungen', preparing: 'Technische Inhalte werden derzeit vorbereitet.', specs: 'Technische Daten', features: 'Wichtige Merkmale', quote: 'Angebot anfordern', titleSuffix: 'Technische Lösungen von Rotabil Etiket' },
    fr: { notFound: 'Solution introuvable', all: 'Toutes les solutions', preparing: 'Le contenu technique est en préparation.', specs: 'Données techniques', features: 'Caractéristiques principales', quote: 'Demander un devis', titleSuffix: 'Solutions techniques Rotabil Etiket' },
    ar: { notFound: 'الحل غير موجود', all: 'جميع الحلول', preparing: 'يتم إعداد المحتوى التقني حالياً.', specs: 'البيانات التقنية', features: 'الميزات الرئيسية', quote: 'اطلب عرضاً', titleSuffix: 'حلول روتابيل إتيكيت التقنية' },
    es: { notFound: 'Solución no encontrada', all: 'Todas las soluciones', preparing: 'El contenido técnico está en preparación.', specs: 'Datos técnicos', features: 'Características principales', quote: 'Solicitar presupuesto', titleSuffix: 'Soluciones técnicas de Rotabil Etiket' },
    it: { notFound: 'Soluzione non trovata', all: 'Tutte le soluzioni', preparing: 'Il contenuto tecnico è in preparazione.', specs: 'Dati tecnici', features: 'Caratteristiche principali', quote: 'Richiedi un preventivo', titleSuffix: 'Soluzioni tecniche Rotabil Etiket' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const solution = await getSolution(slug, locale);
    const copy = detailCopy[locale] || detailCopy.tr;

    if (!solution) return { title: `${copy.notFound} | Rotabil Etiket` };

    const localeSlugs = await getSolutionLocaleSlugs(slug, locale);
    const languages = Object.fromEntries(
        Object.entries(localeSlugs).map(([language, localizedSlug]) => [
            language,
            `https://rotabiletiket.com/${language}/cozumler/${localizedSlug}`,
        ])
    );

    return {
        title: solution.seo_title || `${solution.title} | ${copy.titleSuffix}`,
        description: solution.seo_description || solution.excerpt || solution.title,
        keywords: solution.keywords || undefined,
        alternates: {
            canonical: `https://rotabiletiket.com/${locale}/cozumler/${solution.slug}`,
            languages,
        },
    };
}

export default async function SolutionDetailPage({ params }: Props) {
    const { slug } = await params;
    const locale = await getLocale();
    const copy = detailCopy[locale] || detailCopy.tr;
    const solution = await getSolution(slug, locale);

    if (!solution) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: solution.title,
        description: solution.seo_description || solution.excerpt || solution.title,
        provider: {
            '@type': 'Organization',
            name: 'Rotabil Etiket',
            url: 'https://rotabiletiket.com',
        },
        areaServed: ['Germany', 'Europe'],
        url: `https://rotabiletiket.com/${locale}/cozumler/${solution.slug}`,
    };

    return (
        <main className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <section className="bg-slate-900 py-14 text-white">
                <div className="container px-4 md:px-6">
                    <Link href={`/${locale}/cozumler`} className="mb-8 inline-flex items-center text-sm text-slate-300 hover:text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {copy.all}
                    </Link>
                    <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{solution.title}</h1>
                    {solution.excerpt && <p className="mt-5 max-w-3xl text-lg text-slate-300">{solution.excerpt}</p>}
                </div>
            </section>

            <div className="container grid gap-12 px-4 py-12 md:px-6 lg:grid-cols-[1fr_320px] lg:py-16">
                <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-orange-600">
                    {solution.content_html ? (
                        <div dangerouslySetInnerHTML={{ __html: solution.content_html }} />
                    ) : (
                        <p>{copy.preparing}</p>
                    )}
                </article>

                <aside className="space-y-6">
                    {Object.keys(solution.technical_specs || {}).length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">
                                {copy.specs}
                            </h2>
                            <dl className="space-y-3">
                                {Object.entries(solution.technical_specs).map(([key, value]) => (
                                    <div key={key} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</dt>
                                        <dd className="mt-1 text-sm text-slate-700">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {solution.proof_points?.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">
                                {copy.features}
                            </h2>
                            <ul className="space-y-3 text-sm text-slate-700">
                                {solution.proof_points.map((point) => (
                                    <li key={point} className="flex gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Link href={`/${locale}/teklif-al?solution=${encodeURIComponent(solution.slug)}`} className="block rounded-2xl bg-orange-600 p-6 text-center font-bold text-white transition hover:bg-orange-700">
                        {copy.quote}
                    </Link>
                </aside>
            </div>
        </main>
    );
}
