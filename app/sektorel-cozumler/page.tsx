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

export default async function SectorsPage() {
    const supabase = createClient();
    const { data: sectors } = await supabase.from('sectors').select('*');

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">Sektörel Çözümler</h1>
                <p className="text-slate-400 max-w-xl mx-auto">
                    Her sektörün kendine has ihtiyaçları için geliştirdiğimiz özel çözümler.
                </p>
            </div>

            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sectors?.map((sector) => (
                        <Link
                            key={sector.id}
                            href={`/sektorel-cozumler/${sector.slug}`}
                            className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
                        >
                            <Image
                                src={sector.image_url || '/placeholder-sector.jpg'}
                                alt={sector.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                    {sector.title}
                                </h3>
                                <div className="flex items-center text-white/80 text-sm font-medium mt-4">
                                    Çözümleri İncele <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
