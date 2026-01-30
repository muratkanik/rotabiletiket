import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
    title: 'Gizlilik Politikası | Rotabil Etiket',
    description: 'Rotabil Etiket gizlilik politikası ve veri güvenliği ilkeleri.'
}

export default async function PrivacyPage() {
    const policy = await getSiteSettings('privacy_policy');
    const sections = policy?.sections || [];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{policy?.title || 'Gizlilik Politikası'}</h1>
            </div>

            <div className="container px-4 md:px-6 py-16 max-w-4xl mx-auto">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                    {sections.length > 0 ? (
                        <div className="space-y-8">
                            {sections.map((section: any, i: number) => (
                                <div key={i}>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">{section.heading}</h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">İçerik yükleniyor...</p>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    )
}
