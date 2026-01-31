import { getArticle, getArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = await getArticle(params.slug);
    if (!article) return { title: 'Not Found' };

    return {
        title: `${article.title} - Bilgi Bankası`,
        description: article.summary,
    };
}

export async function generateStaticParams() {
    const articles = await getArticles();
    return articles.map((article) => ({
        slug: article.slug,
    }));
}

export default async function ArticlePage({ params }: Props) {
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.summary,
        image: article.image_url ? [article.image_url] : [],
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
            '@id': `https://rotabiletiket.com/bilgi-bankasi/${params.slug}`,
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
                            Bilgi Bankasına Dön
                        </Link>
                    </Button>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl leading-tight">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-6 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(article.created_at).toLocaleDateString('tr-TR')}</span>
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
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: article.content_html || '' }} />
                </div>

                {/* Sidebar (Optional: Related Links or Categories) */}
                <div className="space-y-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 text-slate-900">İlgili Kategoriler</h3>
                        <ul className="space-y-2 text-slate-600">
                            <li><Link href="/urunler/etiketler" className="hover:text-orange-600 transition-colors">Etiket Çeşitleri</Link></li>
                            <li><Link href="/urunler/barkod-yazicilar" className="hover:text-orange-600 transition-colors">Barkod Yazıcılar</Link></li>
                            <li><Link href="/urunler/ribonlar" className="hover:text-orange-600 transition-colors">Ribonlar</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </article>
    );
}
