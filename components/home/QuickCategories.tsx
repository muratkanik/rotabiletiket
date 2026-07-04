import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Tag, Printer, ScrollText, ArrowRight } from 'lucide-react';

export async function QuickCategories({ locale }: { locale: string }) {
    const t = await getTranslations('Common');

    const categories = [
        {
            title: 'Etiketler',
            subtitle: 'Rulo, Kuşe, Lamine',
            slug: 'etiketler', 
            icon: Tag,
            color: 'bg-blue-600',
            hoverColor: 'group-hover:bg-blue-700',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Barkod Yazıcılar',
            subtitle: 'Endüstriyel & Masaüstü',
            slug: 'barkod-yazici-cozumleri-i-sletmenize-deger-katin',
            icon: Printer,
            color: 'bg-orange-500',
            hoverColor: 'group-hover:bg-orange-600',
            bgLight: 'bg-orange-50',
            textColor: 'text-orange-500'
        },
        {
            title: 'Ribonlar',
            subtitle: 'Wax, Resin, Wax-Resin',
            slug: 'ribon-fiyatlari-ve-cesitleri-ile-kaliteyi-yakalayin',
            icon: ScrollText,
            color: 'bg-teal-500',
            hoverColor: 'group-hover:bg-teal-600',
            bgLight: 'bg-teal-50',
            textColor: 'text-teal-500'
        }
    ];

    return (
        <section className="relative z-20 -mt-12 mb-12 px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                {categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                        <Link 
                            key={idx} 
                            href={`/${locale}/urunler/${cat.slug}`}
                            className="group flex items-center bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
                        >
                            <div className={`w-16 h-16 rounded-xl ${cat.bgLight} ${cat.textColor} flex items-center justify-center mr-5 transition-colors`}>
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {cat.subtitle}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${cat.color} ${cat.hoverColor} transition-colors opacity-80 group-hover:opacity-100`}>
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    );
}
