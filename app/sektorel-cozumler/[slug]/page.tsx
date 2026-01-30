import { createClient } from '@/utils/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: sector } = await supabase
        .from('sectors')
        .select('*')
        .eq('slug', slug)
        .single();

    return {
        title: sector ? `${sector.title} | Rotabil Etiket` : 'Sektörel Çözüm',
        description: `${sector?.title} için özel etiketleme çözümleri.`
    }
}

export default async function SectorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: sector } = await supabase
        .from('sectors')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!sector) notFound();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[50vh] flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src={sector.image_url || '/placeholder-sector.jpg'}
                        alt={sector.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60" />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{sector.title}</h1>
                    <p className="text-xl text-slate-200">Endüstriyel Özel Çözümler</p>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg max-w-none text-slate-600 mb-12">
                        <div className="prose prose-lg max-w-none text-slate-600 mb-12">
                            {/* Clean up some legacy artifacts on the fly if needed, though CSS handles most */}
                            <div dangerouslySetInnerHTML={{
                                __html: sector.content_html
                                    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                                    .replace(/src="img\//g, 'src="https://rotabiletiket.com/img/') // Fix old relative paths if they exist strictly, or better:
                                // Since we don't have the old images hosted, we might need to handle this. 
                                // For now, let's assume they might be broken or we need to point to a legacy URL if available.
                                // Actually, better to hide broken images via CSS or just let them be for a moment.
                            }} />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Bu Sektör İçin Çözüm Mü Arıyorsunuz?</h2>
                        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                            Uzman ekibimizle sektörünüze özel ihtiyaçları belirleyip en doğru etiketleme çözümünü sunalım.
                        </p>
                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
                            <Link href="/iletisim">Hemen Teklif Alın</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
