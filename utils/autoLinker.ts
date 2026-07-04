import { createClient } from '@/utils/supabase/server';

export async function enhanceHtmlWithInternalLinks(html: string, currentSlug: string, locale: string): Promise<string> {
    const supabase = await createClient();
    
    // Fetch all articles
    const { data: articles } = await supabase
        .from('articles')
        .select('slug, title')
        .neq('slug', currentSlug)
        .eq('is_published', true);

    // Fetch all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, title');

    let enhancedHtml = html;

    if (articles) {
        for (const article of articles) {
            // Very basic matching, ensuring we don't replace inside existing a tags or img attributes
            const regex = new RegExp(`(?<!<[^>]*>)\\b(${article.title})\\b(?![^<]*>|[^<>]*<\/a>)`, 'gi');
            enhancedHtml = enhancedHtml.replace(regex, `<a href="/${locale}/bilgi-bankasi/${article.slug}" class="text-blue-600 hover:underline font-medium" title="${article.title}">$1</a>`);
        }
    }

    if (categories) {
        for (const category of categories) {
            const regex = new RegExp(`(?<!<[^>]*>)\\b(${category.title})\\b(?![^<]*>|[^<>]*<\/a>)`, 'gi');
            enhancedHtml = enhancedHtml.replace(regex, `<a href="/${locale}/urunler/${category.slug}" class="text-blue-600 hover:underline font-medium" title="${category.title}">$1</a>`);
        }
    }

    // specific highly-valuable keywords could also be mapped here
    const exactKeywords = [
        { term: 'Kuşe Etiket', link: `/${locale}/urunler/ku-e-eti-ket` },
        { term: 'Lamine Termal Etiket', link: `/${locale}/urunler/lami-ne-termal-eti-ket` },
        { term: 'Eco Termal Etiket', link: `/${locale}/urunler/eco-termal-eti-ket` },
        { term: 'Silvermat Etiket', link: `/${locale}/urunler/si-lvermat-eti-ket` },
        { term: 'Barkod Yazıcı', link: `/${locale}/urunler/barkod-yazicilar` },
        { term: 'Ribon', link: `/${locale}/urunler/ribonlar` },
        { term: 'Zebra', link: `/${locale}/urunler/barkod-yazicilar` },
        { term: 'Honeywell', link: `/${locale}/urunler/barkod-yazicilar` }
    ];

    for (const kw of exactKeywords) {
        const regex = new RegExp(`(?<!<[^>]*>)\\b(${kw.term})\\b(?![^<]*>|[^<>]*<\/a>)`, 'gi');
        // Only replace the FIRST occurrence to avoid spamming the article
        let replaced = false;
        enhancedHtml = enhancedHtml.replace(regex, (match) => {
            if (!replaced) {
                replaced = true;
                return `<a href="${kw.link}" class="text-blue-600 hover:underline font-medium" title="${kw.term} Ürünleri">$1</a>`;
            }
            return match;
        });
    }

    return enhancedHtml;
}
