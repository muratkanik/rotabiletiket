import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export async function SectorsSection() {
    const supabase = createClient();
    const { data: sectors } = await supabase
        .from('sectors')
        .select('*')
        .limit(4);

    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-orange-600 font-semibold tracking-wider text-sm uppercase">Sektörel Çözümler</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Her Sektör İçin Özel Üretim</h2>
                    </div>
                    <Link href="/sektorel-cozumler" className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                        Tüm Sektörleri Gör <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sectors?.map((sector) => (
                        <Link
                            key={sector.id}
                            href={`/sektorel-cozumler/${sector.slug}`}
                            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                        >
                            {/* Image Background */}
                            <Image
                                src={sector.image_url || '/placeholder-sector.jpg'} // Fallback needed if no image
                                alt={sector.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                    {sector.title}
                                </h3>
                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                    <span className="text-white/80 text-sm inline-flex items-center">
                                        Detaylı Bilgi <ArrowRight className="ml-2 w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/sektorel-cozumler" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                        Tüm Sektörleri Gör <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
