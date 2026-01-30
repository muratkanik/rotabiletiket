import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('articles').select('*').eq('slug', slug).single();
    return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const article = await getArticle(resolvedParams.slug);
    if (!article) return {};

    return {
        title: article.seo_title || article.title,
        description: article.seo_description || article.excerpt,
        openGraph: {
            images: [article.image_url || '/logo.png']
        }
    }
}

export default async function ArticlePage({ params }: Props) {
    const resolvedParams = await params;
    const article = await getArticle(resolvedParams.slug);

    if (!article) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        image: article.image_url ? `https://rotabiletiket.com${article.image_url}` : undefined,
        datePublished: article.published_at,
        dateModified: article.updated_at,
        author: {
            '@type': 'Organization',
            name: 'Rotabil Etiket'
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <article className="pb-24">
                {/* Header */}
                <div className="bg-slate-900 py-16 text-white text-center">
                    <div className="container px-4 mx-auto max-w-4xl">
                        <Link href="/bilgi-bankasi" className="inline-flex items-center text-slate-400 hover:text-white mb-6 text-sm transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Bilgi Bankasına Dön
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{article.title}</h1>
                        <time className="text-slate-400 block">{new Date(article.published_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </div>
                </div>

                {/* Content */}
                <div className="container px-4 md:px-6 -mt-8 mx-auto max-w-3xl relative z-10">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden p-8 md:p-12">
                        {article.image_url && (
                            <div className="relative w-full h-64 md:h-80 mb-8 rounded-xl overflow-hidden">
                                <Image
                                    src={article.image_url}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div
                            className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: article.content_html }}
                        />
                    </div>
                </div>
            </article>

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Footer />
        </main>
    )
}
