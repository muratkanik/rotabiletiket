import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { routing } from '@/src/i18n/routing';
import locationsData from '../data/locations.json';

const baseUrl = 'https://rotabiletiket.com';
const now = () => new Date().toISOString();

function localizedValue(items: any[] | null | undefined, locale: string, key: string, fallback: string) {
    return items?.find((item) => item.language_code === locale)?.[key]
        || items?.find((item) => item.language_code === 'tr')?.[key]
        || fallback;
}

function route(
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly',
    lastModified = now()
): MetadataRoute.Sitemap[number] {
    return {
        url: `${baseUrl}${path}`,
        lastModified,
        changeFrequency,
        priority,
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const locales = routing.locales;

    const staticPaths = [
        '',
        '/urunler',
        '/cozumler',
        '/hakkimizda',
        '/iletisim',
        '/sektorel-cozumler',
        '/bilgi-bankasi',
        '/kullanici-sozlesmesi',
        '/gizlilik',
        '/kvkk',
    ];
    const staticRoutes = locales.flatMap((locale) =>
        staticPaths.map((path) => route(`/${locale}${path}`, path === '' ? 1 : 0.5, 'weekly'))
    );

    const { data: products } = await supabase
        .from('products')
        .select(`
            slug,
            updated_at,
            categories(slug, category_translations(language_code, slug)),
            product_translations(language_code, slug)
        `)
        .not('category_id', 'is', null)
        .eq('is_published', true);

    const productRoutes = (products || []).flatMap((product: any) =>
        locales.flatMap((locale) => {
            const category = product.categories;
            const categorySlug = localizedValue(
                category?.category_translations,
                locale,
                'slug',
                category?.slug
            );
            const productSlug = localizedValue(
                product.product_translations,
                locale,
                'slug',
                product.slug
            );

            if (!categorySlug || !productSlug) return [];
            return [route(`/${locale}/urunler/${categorySlug}/${productSlug}`, 0.8, 'weekly', product.updated_at)];
        })
    );

    const { data: categories } = await supabase
        .from('categories')
        .select('slug, category_translations(language_code, slug)');
    const categoryRoutes = (categories || []).flatMap((category: any) =>
        locales.map((locale) => {
            const slug = localizedValue(category.category_translations, locale, 'slug', category.slug);
            return route(`/${locale}/urunler/${slug}`, 0.9, 'weekly');
        })
    );

    const { data: sectors } = await supabase
        .from('sectors')
        .select('slug, updated_at, sector_translations(language_code, slug)');
    const sectorRoutes = (sectors || []).flatMap((sector: any) =>
        locales.map((locale) => {
            const slug = localizedValue(sector.sector_translations, locale, 'slug', sector.slug);
            return route(`/${locale}/sektorel-cozumler/${slug}`, 0.7, 'monthly', sector.updated_at);
        })
    );

    const { data: articles } = await supabase
        .from('articles')
        .select('slug, updated_at, article_translations(language_code, slug)')
        .eq('is_published', true);
    const articleRoutes = (articles || []).flatMap((article: any) =>
        locales.map((locale) => {
            const slug = localizedValue(article.article_translations, locale, 'slug', article.slug);
            return route(`/${locale}/bilgi-bankasi/${slug}`, 0.8, 'monthly', article.updated_at);
        })
    );

    const { data: solutions } = await supabase
        .from('solution_pages')
        .select('slug, updated_at, solution_page_translations(language_code, slug)')
        .eq('is_published', true);
    const solutionRoutes = (solutions || []).flatMap((solution: any) =>
        locales.map((locale) => {
            const slug = localizedValue(solution.solution_page_translations, locale, 'slug', solution.slug);
            return route(`/${locale}/cozumler/${slug}`, 0.85, 'monthly', solution.updated_at);
        })
    );

    const locationRoutes = locales.flatMap((locale) =>
        locationsData.map((location: any) =>
            route(`/${locale}/${location.slug}-etiket`, 0.4, 'monthly')
        )
    );

    return [
        ...staticRoutes,
        ...categoryRoutes,
        ...productRoutes,
        ...sectorRoutes,
        ...articleRoutes,
        ...solutionRoutes,
        ...locationRoutes,
    ];
}
