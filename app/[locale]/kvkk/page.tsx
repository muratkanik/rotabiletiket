import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return {
        title: 'KVKK Aydınlatma Metni | Rotabil Etiket',
        description: 'Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.'
    }
}

export default async function KVKKPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const kvkkData = await getSiteSettings('kvkk');

    // Fallback logic
    const content = kvkkData?.[locale] || kvkkData?.['tr'] || '';

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    KVKK Aydınlatma Metni
                </h1>
                <p className="text-slate-400">Kişisel Verilerin Korunması</p>
            </div>

            <div className="container px-4 md:px-6 py-16 max-w-4xl mx-auto">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                    {content ? (
                        <div
                            className="prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <div className="text-center text-slate-500 py-12">
                            <p className="mb-4">İçerik henüz eklenmemiş.</p>
                            <p className="text-sm">Admin panelinden içerik ekleyebilirsiniz.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
