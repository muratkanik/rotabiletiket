import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Factory, FlaskConical, Radio, ScanLine } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { getSolutions } from '@/lib/solutions';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Industrial Label Solutions | Rotabil Etiket',
        description: 'Technical labeling, RFID and industrial identification solutions for demanding applications.',
    };
}

const icons = [Factory, FlaskConical, Radio, ScanLine];

export default async function SolutionsPage() {
    const locale = await getLocale();
    const solutions = await getSolutions(locale);
    const isGerman = locale === 'de';

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="bg-slate-900 py-16 text-white">
                <div className="container px-4 md:px-6">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                        {isGerman ? 'Technische Lösungen' : 'Technical Solutions'}
                    </p>
                    <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">
                        {isGerman
                            ? 'Industrielle Kennzeichnung für anspruchsvolle Anwendungen'
                            : 'Industrial identification for demanding applications'}
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
                        {isGerman
                            ? 'Technische Etiketten, Barcode- und RFID-Lösungen für industrielle Prozesse.'
                            : 'Technical labels, barcode and RFID solutions for industrial processes.'}
                    </p>
                </div>
            </section>

            <section className="container px-4 py-12 md:px-6 md:py-16">
                {solutions.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                        {isGerman
                            ? 'Technische Lösungsseiten werden derzeit vorbereitet.'
                            : 'Technical solution pages are currently being prepared.'}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {solutions.map((solution, index) => {
                            const Icon = icons[index % icons.length];
                            return (
                                <Link
                                    key={solution.id}
                                    href={`/${locale}/cozumler/${solution.slug}`}
                                    className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                                >
                                    <Icon className="mb-6 h-9 w-9 text-orange-600" />
                                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-orange-600">
                                        {solution.title}
                                    </h2>
                                    {solution.excerpt && (
                                        <p className="mt-3 line-clamp-3 text-slate-600">{solution.excerpt}</p>
                                    )}
                                    <span className="mt-6 inline-flex items-center text-sm font-semibold text-blue-700">
                                        {isGerman ? 'Lösung ansehen' : 'View solution'}
                                        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
