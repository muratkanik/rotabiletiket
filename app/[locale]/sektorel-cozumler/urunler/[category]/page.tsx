import { createClient } from '@/utils/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { Navbar } from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: { category: string } }) {
    const supabase = await createClient();
    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.category)
        .single();

    return {
        title: category ? `${category.title} | Rotabil Etiket` : 'Ürünler',
        description: `En kaliteli ${category?.title || 'etiket ve barkod'} çeşitleri.`
    }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
    const supabase = await createClient();

    // 1. Fetch Category
    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.category)
        .single();

    if (!category) {
        notFound();
    }

    // 2. Fetch Products
    const { data: products } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header */}
            <div className="bg-slate-900 py-16 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
                <p className="text-slate-400 max-w-xl mx-auto">
                    Endüstriyel standartlarda, yüksek kaliteli {category.title.toLowerCase()} çözümlerimiz.
                </p>
            </div>

            {/* Grid */}
            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products?.map((product: any) => (
                        <ProductCard key={product.id} product={product} categorySlug={params.category} />
                    ))}
                    {products?.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            Bu kategoride henüz ürün bulunmuyor.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
