import { getLocale, getTranslations } from 'next-intl/server';
import locationsData from '@/data/locations.json';
import { LocationSearch } from '@/components/locations/LocationSearch';
import { MapPin } from 'lucide-react';

export async function generateMetadata() {
    const t = await getTranslations('Common');
    return {
        title: `${t('serviceAreas') || 'Hizmet Bölgelerimiz'} | Rotabil Etiket`,
        description: 'Rotabil Etiket olarak Türkiye\'nin 81 iline ve ilçelerine profesyonel etiket üretim ve barkod yazıcı çözümleri sunuyoruz.',
        keywords: 'hizmet bölgelerimiz, etiket firmaları, türkiye etiket üreticileri, istanbul etiket, ankara etiket, izmir etiket',
    };
}

export default async function ServiceAreasPage() {
    const locale = await getLocale();
    const t = await getTranslations('Common');

    return (
        <main className="min-h-screen bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-6">
                        <MapPin size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        {t('serviceAreas') || 'Hizmet Bölgelerimiz'}
                    </h1>
                    <p className="text-lg text-slate-600">
                        Türkiye'nin dört bir yanındaki işletmelere her ölçü, tür ve adette profesyonel etiket çözümleri sunuyoruz. %100 üretici güvencesi ve hızlı teslimat ile yanınızdayız.
                    </p>
                </div>

                <LocationSearch locations={locationsData} locale={locale} />
            </div>
        </main>
    );
}
