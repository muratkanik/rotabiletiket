import { getTranslations } from 'next-intl/server';
import locationsData from '@/data/locations.json';
import { Link } from '@/src/i18n/routing';

export async function ServiceAreasSEO() {
    const t = await getTranslations('Common');

    return (
        <section className="bg-slate-50 border-t border-slate-200 py-8 text-xs text-slate-500">
            <div className="container mx-auto px-4">
                <h3 className="font-semibold text-slate-700 mb-4 text-sm">{t('serviceAreas') || 'Hizmet Bölgelerimiz'}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {locationsData.map((loc) => {
                        const name = loc.district || loc.city;
                        return (
                            <Link 
                                key={loc.slug} 
                                href={`/${loc.slug}-etiket`} 
                                className="hover:text-orange-600 transition-colors whitespace-nowrap"
                                title={`${name} Etiket Üreticisi`}
                            >
                                {name} Etiket
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
