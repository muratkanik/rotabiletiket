import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: 'Bilgi Bankası | Rotabil Etiket Blog',
    description: 'Barkod sistemleri, etiket türleri, yazıcı bakımı ve sektörel rehberler. Endüstriyel etiketleme hakkında her şey.'
}

async function getArticles() {
    const supabase = await createClient();
    const { data } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    return data || [];
}

export default async function KnowledgeBasePage() {
    const articles = await getArticles();

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Bilgi Bankası</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Barkod teknolojileri, endüstriyel etiketleme ve bakım ipuçları hakkında uzman rehberler.
                </p>
            </div>

            <div className="container px-4 md:px-6 py-16 pb-24 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article: any) => (
                        <Link href={`/bilgi-bankasi/${article.slug}`} key={article.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                            <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                                {article.image_url ? (
                                    <Image
                                        src={article.image_url}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        Görsel Yok
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {article.title}
                                </h2>
                                <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                                    {article.excerpt}
                                </p>
                                <div className="mt-auto flex items-center text-sm font-medium text-blue-600">
                                    Devamını Oku
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    )
}
