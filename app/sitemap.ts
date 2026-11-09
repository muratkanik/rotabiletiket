import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { routing } from '@/src/i18n/routing';
import locationsData from '../data/locations.json';

// The production site is canonical on www. Every sitemap URL must already be
// canonical; submitting the non-www host makes Google crawl an extra redirect.
const baseUrl = 'https://www.rotabiletiket.com';
const now = () => new Date().toISOString();

function localizedValue(items: any[] | null | undefined, locale: string, key: string, fallback: string) {
    return items?.find((item) => item.language_code === locale)?.[key]
        || items?.find((item) => item.language_code === 'tr')?.[key]
        || fallback;
}

// Product and category pages resolve their canonical slug as:
// locale translation -> English translation -> base (tr) slug, and for the tr
// locale always the base slug (see getLocalizedCategorySlug / getLocalizedProduct
// in utils/supabase/queries.ts). The sitemap has to follow the same order, or it
// lists URLs that the page 301-redirects to the canonical one, which Search
// Console reports as "Page with redirect" and which wastes crawl budget.
function canonicalSlug(items: any[] | null | undefined, locale: string, fallback: string) {
    if (locale === 'tr') return fallback;
    return items?.find((item) => item.language_code === locale)?.slug
        || items?.find((item) => item.language_code === 'en')?.slug
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
            const categorySlug = canonicalSlug(
                category?.category_translations,
                locale,
                category?.slug
            );
            const productSlug = canonicalSlug(
                product.product_translations,
                locale,
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
            const slug = canonicalSlug(category.category_translations, locale, category.slug);
            return route(`/${locale}/urunler/${slug}`, 0.9, 'weekly');
        })
    );

    const { data: sectors } = await supabase
        .from('sectors')
        .select('slug, updated_at, content_html, sector_translations(language_code, slug, content_html)')
        .eq('is_published', true);
    const sectorRoutes = (sectors || []).flatMap((sector: any) =>
        (sector.content_html?.replace(/<[^>]*>/g, '').trim() || sector.sector_translations?.some((translation: any) =>
            translation.content_html?.replace(/<[^>]*>/g, '').trim()
        ))
            ? locales.map((locale) => {
                const slug = localizedValue(sector.sector_translations, locale, 'slug', sector.slug);
                return route(`/${locale}/sektorel-cozumler/${slug}`, 0.7, 'monthly', sector.updated_at);
            })
            : []
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
