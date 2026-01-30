import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const baseUrl = 'https://rotabiletiket.com';

    // Static Routes
    const routes = [
        '',
        '/hakkimizda',
        '/iletisim',
        '/sektorel-cozumler',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 1,
    }));

    // Dynamic: Products
    const { data: products } = await supabase.from('products').select('slug, updated_at, categories(slug)');
    const productRoutes = products?.map((product: any) => ({
        url: `${baseUrl}/urunler/${product.categories?.slug}/${product.slug}`,
        lastModified: product.updated_at || new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    })) || [];

    // Dynamic: Categories
    const { data: categories } = await supabase.from('categories').select('slug');
    const categoryRoutes = categories?.map((category: any) => ({
        url: `${baseUrl}/urunler/${category.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    })) || [];

    // Dynamic: Sectors
    const { data: sectors } = await supabase.from('sectors').select('slug');
    const sectorRoutes = sectors?.map((sector: any) => ({
        url: `${baseUrl}/sektorel-cozumler/${sector.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    })) || [];

    return [...routes, ...categoryRoutes, ...productRoutes, ...sectorRoutes];
}
