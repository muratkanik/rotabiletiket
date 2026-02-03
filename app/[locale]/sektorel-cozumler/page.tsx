import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const revalidate = 3600;
export const metadata = {
    title: 'Sektörel Çözümler | Rotabil Etiket',
    description: 'Farklı sektörlere özel endüstriyel etiketleme çözümlerimiz.'
}

export default async function SectorsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();
    const { data: sectors } = await supabase
        .from('sectors')
        .select(`
            *,
            sector_translations (
                language_code,
                title,
                description
            )
        `)
        .order('display_order', { ascending: true });

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">
                    {locale === 'en' ? 'Sectoral Solutions' :
                        locale === 'de' ? 'Branchenlösungen' :
                            locale === 'fr' ? 'Solutions Sectorielles' :
                                locale === 'tr' ? 'Sektörel Çözümler' : 'القطاعات'}
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto">
                    {locale === 'en' ? 'Custom solutions developed for the unique needs of every sector.' :
                        locale === 'de' ? 'Maßgeschneiderte Lösungen für die einzigartigen Bedürfnisse jeder Branche.' :
                            locale === 'fr' ? 'Des solutions personnalisées développées pour les besoins uniques de chaque secteur.' :
                                locale === 'tr' ? 'Her sektörün kendine has ihtiyaçları için geliştirdiğimiz özel çözümler.' : 'حلول مخصصة تم تطويرها لتلبية الاحتياجات الفريدة لكل قطاع.'}
                </p>
            </div>

            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sectors?.map((sector: any) => {
                        const trans = sector.sector_translations?.find((t: any) => t.language_code === locale)
                            || sector.sector_translations?.find((t: any) => t.language_code === 'tr')
                            || {};
                        const title = trans.title || sector.title;
                        const description = trans.description || '';

                        return (
                            <Link
                                key={sector.id}
                                href={`/sektorel-cozumler/${sector.slug}`}
                                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
                            >
                                <Image
                                    src={sector.image_url || '/placeholder-sector.jpg'}
                                    alt={title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="text-sm text-slate-300 line-clamp-2 mb-4 hidden group-hover:block transition-all">
                                            {description}
                                        </p>
                                    )}
                                    <div className="flex items-center text-white/80 text-sm font-medium mt-auto">
                                        {locale === 'tr' ? 'Çözümleri İncele' : 'View Solutions'} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
