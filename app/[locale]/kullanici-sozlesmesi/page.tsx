import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kullanıcı Sözleşmesi - Rotabil Etiket',
    description: 'Rotabil Etiket web sitesi kullanıcı sözleşmesi ve hizmet şartları.',
};

export default async function UserAgreementPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const agreementData = await getSiteSettings('user_agreement');

    const content = agreementData?.[locale] || agreementData?.['tr'] || '';

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {locale === 'en' ? 'User Agreement' :
                        locale === 'de' ? 'Nutzungsbedingungen' :
                            locale === 'fr' ? 'Conditions d\'utilisation' :
                                locale === 'ar' ? 'اتفاقية المستخدم' :
                                    'Kullanıcı Sözleşmesi'}
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
    );
}
