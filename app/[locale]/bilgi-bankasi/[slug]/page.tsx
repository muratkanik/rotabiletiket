import { getArticle, getArticles } from '@/lib/articles';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/src/i18n/routing';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Hash } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const revalidate = 3600;

type Props = {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;

    // Enable static rendering
    setRequestLocale(locale);

    try {
        const article = await getArticle(slug, locale);
        if (!article) return { title: 'Not Found' };

        return {
            title: `${article.title} - Rotabil Etiket`,
            description: article.summary,
            keywords: article.keywords || '',
        };
    } catch (error) {
        console.error('Metadata generation error:', error);
        return { title: 'Rotabil Etiket' };
    }
}

export async function generateStaticParams() {
    // Generate params for all locales
    return [];
}

export default async function ArticlePage({ params }: Props) {
    const { slug, locale } = await params;

    // Enable static rendering
    setRequestLocale(locale);

    const t = await getTranslations('KnowledgeBase');
    let article = null;

    try {
        article = await getArticle(slug, locale);
    } catch (error) {
        console.error('Error fetching article:', error);
        // If it's a 404, we want to let it propagate or handle it
        if ((error as any)?.digest === 'NEXT_NOT_FOUND' || (error as any)?.message === 'NEXT_NOT_FOUND') {
            notFound();
        }
    }

    if (!article) {
        notFound();
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.summary,
        image: article.image_url
            ? [article.image_url.startsWith('http') ? article.image_url : (article.image_url.startsWith('/') ? `https://rotabiletiket.com${article.image_url}` : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${article.image_url}`)]
            : [],
        datePublished: article.created_at,
        dateModified: article.updated_at || article.created_at,
        author: {
            '@type': 'Organization',
            name: 'Rotabil Etiket',
            url: 'https://rotabiletiket.com',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Rotabil Etiket',
            logo: {
                '@type': 'ImageObject',
                url: 'https://rotabiletiket.com/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://rotabiletiket.com/${locale}/bilgi-bankasi/${article.slug}`,
        },
    };

    return (
        <article className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header / Hero */}
            <div className="bg-slate-900 text-white py-12">
                <div className="container px-4 md:px-6">
                    <Button variant="ghost" asChild className="mb-8 text-slate-300 hover:text-white hover:bg-white/10 -ml-4">
                        <Link href="/bilgi-bankasi">
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            {t('backToKB')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl leading-tight">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-6 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(article.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>Rotabil Editör</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                {/* Main Content */}
                <div className="prose prose-lg max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-xl">
                    {/* Featured Image inside content view if needed, usually decorative in list */}
                    {article.image_url && (
                        <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg not-prose">
                            <Image
                                src={article.image_url.startsWith('http') || article.image_url.startsWith('/')
                                    ? article.image_url
                                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-images/${article.image_url}`}
                                alt={article.title}
                                fill
                                priority
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: article.content_html || '' }} />
                    
                    {/* Tags / Hashtags */}
                    {article.keywords && (
                        <div className="mt-12 pt-8 border-t border-slate-100 not-prose">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">İlgili Etiketler</h3>
                            <div className="flex flex-wrap gap-2">
                                {article.keywords.split(',').map((keyword, idx) => {
                                    const cleanKeyword = keyword.trim();
                                    if (!cleanKeyword) return null;
                                    return (
                                        <Link 
                                            key={idx} 
                                            href={`/bilgi-bankasi?tag=${encodeURIComponent(cleanKeyword)}`}
                                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                        >
                                            <Hash size={14} className="mr-1 opacity-50" />
                                            {cleanKeyword}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar (Optional: Related Links or Categories) */}
                <div className="space-y-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 text-slate-900">{t('relatedCategories')}</h3>
                        <ul className="space-y-2 text-slate-600">
                            <li><Link href="/urunler/etiket-cozumleri-ile-marka-bilinirliginizi-artirin" className="hover:text-orange-600 transition-colors">{t('labels')}</Link></li>
                            <li><Link href="/urunler/barkod-yazicilar" className="hover:text-orange-600 transition-colors">{t('printers')}</Link></li>
                            <li><Link href="/urunler/ribonlar" className="hover:text-orange-600 transition-colors">{t('ribbons')}</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </article>
    );
}
