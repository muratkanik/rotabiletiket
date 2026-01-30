import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowRight, Tag, Printer, ScrollText } from 'lucide-react';

const ICONS: Record<string, any> = {
    'Etiketler': Tag,
    'Ribonlar': ScrollText,
    'Barkod Yazıcılar': Printer
};

export async function FeatureCards() {
    const supabase = createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true }) // Or add a separate 'order' column later
        .limit(3);

    return (
        <section className="py-24 bg-slate-50">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories?.map((category) => {
                        const Icon = ICONS[category.title] || Tag;

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
                                        Endüstriyel ihtiyaçlarınıza uygun yüksek kaliteli {category.title.toLowerCase()} çözümleri.
                                    </p>

                                    <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-orange-600 transition-colors">
                                        Ürünleri İncele <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
