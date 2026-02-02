import { getArticles } from '@/lib/articles';
import { Link } from '@/src/i18n/routing';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('KnowledgeBase');
    return {
        title: `${t('title')} - Rotabil Etiket`,
        description: t('description'),
    };
}

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
    const locale = await getLocale();
    const t = await getTranslations('KnowledgeBase');
    const articles = await getArticles(locale);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16">
                <div className="container px-4 md:px-6">
                    <div className="flex items-center gap-3 mb-4 text-orange-500">
                        <BookOpen size={32} />
                        <span className="font-bold tracking-wider uppercase">{t('headerSubtitle')}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
                    <p className="text-xl text-slate-300 max-w-2xl">
                        {t('headerDescription')}
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container px-4 md:px-6 py-16">
                {articles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('noContentTitle')}</h3>
                        <p className="text-slate-500">{t('noContentDescription')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Card key={article.id} className="hover:shadow-lg transition-shadow border-slate-200 overflow-hidden flex flex-col">
                                <div className="relative h-48 w-full bg-slate-100">
                                    {article.image_url ? (
                                        <Image
                                            src={article.image_url}
                                            alt={article.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300">
                                            <BookOpen size={48} />
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="leading-tight text-xl">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between text-slate-600">
                                    <p className="mb-6 line-clamp-3">{article.summary}</p>
                                    <Button variant="outline" className="w-full group" asChild>
                                        <Link href={`/bilgi-bankasi/${article.slug}`}>
                                            {t('readMore')}
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
