import React from 'react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return {
        title: locale === 'en' ? 'References | Rotabil Etiket' : 'Referanslarımız | Rotabil Etiket',
        description: locale === 'en' ? 'Our corporate references and partners.' : 'Kurumsal referanslarımız ve iş ortaklarımız.',
    };
}

const references: { name: string; domain: string; logo?: string }[] = [
    { name: 'Kardemir Demir Çelik', domain: 'kardemir.com' },
    { name: 'Coca Cola', domain: 'coca-colacompany.com' },
    { name: 'Pepsi Cola', domain: 'pepsi.com', logo: 'https://digitalassets.pepsico.com/transform/47a5ae69-928c-44bd-b3cf-eab35bdc943e/pepsi-logo-fullcolor-RGB?q=75&w=3840' },
    { name: 'A101', domain: 'a101.com.tr' },
    { name: "Levi's", domain: 'levi.com' },
    { name: 'Kenton Gıda', domain: 'kenton.com.tr' },
    { name: 'Diler Demir Çelik', domain: 'dilerhld.com' }
];

export default async function ReferencesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const title = locale === 'en' ? 'Our References' : 'Referanslarımız';
    const subtitle = locale === 'en' ? 'Trusted by industry leaders' : 'Sektörün öncü firmaları bize güveniyor';

    return (
        <main className="min-h-screen bg-slate-50 py-24">
            <div className="container px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
                    <p className="text-lg text-slate-600">{subtitle}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {references.map((ref, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center border border-slate-100 hover:shadow-md transition-shadow">
                            <img
                                src={ref.logo || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(ref.domain)}&sz=128`}
                                alt={`${ref.name} Logo`}
                                className="max-h-16 object-contain grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
                            />
                            <div className="mt-3 font-semibold text-slate-700 text-center">{ref.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
