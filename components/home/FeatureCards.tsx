import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowRight, Tag, Printer, ScrollText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ICONS: Record<string, any> = {
    'Etiketler': Tag,
    'Ribonlar': ScrollText,
    'Barkod Yazıcılar': Printer,
    'Labels': Tag,
    'Ribbons': ScrollText,
    'Printers': Printer,
    'Etiketten': Tag,
    'Farbbänder': ScrollText,
    'Drucker': Printer,
    'Étiquettes': Tag,
    'Rubans': ScrollText,
    'Imprimantes': Printer,
    'ملصقات': Tag,
    'شرائط': ScrollText,
    'طابعات': Printer
};

// Helper to map English/German/etc titles to Icon keys if needed, 
// or just ensure ICONS has keys for translated titles.

export async function FeatureCards({ locale }: { locale: string }) {
    const supabase = await createClient();
    const t = await getTranslations('Common');

    // Fetch categories with translations
    const { data: categories } = await supabase
        .from('categories')
        .select(`
            *,
            category_translations (
                language_code,
                title,
                description
            )
        `)
        .order('created_at', { ascending: true })
        .limit(3);

    const localizedCategories = categories?.map((cat: any) => {
        const trans = cat.category_translations?.find((t: any) => t.language_code === locale)
            || cat.category_translations?.find((t: any) => t.language_code === 'tr')
            || {};

        return {
            ...cat,
            title: trans.title || cat.title,
            description: trans.description // potentially use this if available
        };
    }) || [];

    return (
        <section className="py-24 bg-slate-50">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {localizedCategories.map((category: any) => {
                        // Icon mapping might be tricky if title changes. 
                        // Maybe rely on the original Turkish title or ID for Icon mapping?
                        // Let's use the 'slug' or original 'title' if we can, but we mapped title.
                        // Actually, let's map based on known keywords in the translated title.
                        let Icon = Tag;
                        if (category.title.match(/ribon|ribbon|farbbänder|ruban|شرائط/i)) Icon = ScrollText;
                        else if (category.title.match(/yazıcı|printer|drucker|imprimante|طابعات/i)) Icon = Printer;

                        return (
                            <Link
                                key={category.id}
                                href={`/urunler/${category.slug}`}
                                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-orange-100/50 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                    <Icon size={120} />
                                </div>

                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                        <Icon size={28} />
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                                        {category.title}
                                    </h3>

                                    <p className="text-slate-600 mb-6 leading-relaxed">
                                        {/* Fallback description logic or just simple text */}
                                        {category.title}
                                    </p>

                                    <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-orange-600 transition-colors">
                                        {t('readMore')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
