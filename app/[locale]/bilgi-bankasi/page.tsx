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

export const revalidate = 3600;

export default async function KnowledgeBasePage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
    const locale = await getLocale();
    const t = await getTranslations('KnowledgeBase');
    const articles = await getArticles(locale);
    const { tag } = await searchParams;

    const filteredArticles = tag
        ? articles.filter(a => a.keywords && a.keywords.split(',').map(k => k.trim()).includes(tag))
        : articles;

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
                {tag && (
                    <div className="mb-8 flex items-center justify-between bg-orange-50 border border-orange-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-600">{locale === 'de' ? 'Gefiltert nach:' : 'Şu etikete göre filtrelendi:'}</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-orange-600 font-medium shadow-sm">
                                <span className="opacity-50 mr-1">#</span>{tag}
                            </span>
                        </div>
                        <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-900">
                            <Link href="/bilgi-bankasi">{locale === 'de' ? 'Filter löschen' : 'Filtreyi Temizle'}</Link>
                        </Button>
                    </div>
                )}

                {filteredArticles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('noContentTitle')}</h3>
                        <p className="text-slate-500">{tag ? (locale === 'de' ? 'Keine Artikel mit diesem Tag gefunden.' : 'Bu etikete ait makale bulunamadı.') : t('noContentDescription')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article) => (
                            <Card key={article.id} className="hover:shadow-lg transition-shadow border-slate-200 overflow-hidden flex flex-col">
                                <div className="relative h-48 w-full bg-slate-100 group-hover:scale-105 transition-transform duration-500">
                                    {article.image_url ? (
                                        <Image
                                            src={article.image_url.startsWith('http') || article.image_url.startsWith('/')
                                                ? article.image_url
                                                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${article.image_url}`}
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
                                <CardHeader className="pb-3">
                                    <CardTitle className="leading-tight text-xl line-clamp-2">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between text-slate-600">
                                    <p className="mb-4 line-clamp-3 text-sm">{article.summary}</p>
                                    
                                    {article.keywords && (
                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {article.keywords.split(',').slice(0, 3).map((keyword, idx) => {
                                                const cleanKeyword = keyword.trim();
                                                if (!cleanKeyword) return null;
                                                return (
                                                    <Link 
                                                        key={idx} 
                                                        href={`/bilgi-bankasi?tag=${encodeURIComponent(cleanKeyword)}`}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                                                    >
                                                        <span className="opacity-50 mr-0.5">#</span>
                                                        {cleanKeyword}
                                                    </Link>
                                                );
                                            })}
                                            {article.keywords.split(',').length > 3 && (
                                                <span className="text-xs text-slate-400 self-center">+{article.keywords.split(',').length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <Button variant="outline" className="w-full group/btn" asChild>
                                        <Link href={`/bilgi-bankasi/${article.slug}`}>
                                            {t('readMore')}
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
