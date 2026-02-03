import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/settings";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Common' });
    return {
        title: `Gizlilik Politikası | Rotabil Etiket`, // Should ideally be localized too
        description: 'Rotabil Etiket gizlilik politikası ve veri güvenliği ilkeleri.'
    };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const policyData = await getSiteSettings('privacy_policy');

    // Fallback to 'tr' if current locale is empty, or empty string
    const content = policyData?.[locale] || policyData?.['tr'] || '';

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {locale === 'en' ? 'Privacy Policy' :
                        locale === 'de' ? 'Datenschutzrichtlinie' :
                            locale === 'fr' ? 'Politique de Confidentialité' :
                                locale === 'ar' ? 'سياسة الخصوصية' :
                                    'Gizlilik Politikası'}
                </h1>
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
