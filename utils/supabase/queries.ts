import { createClient } from './server';

export async function getLocalizedProduct(slug: string, locale: string) {
    const supabase = await createClient();

    let productId = null;
    // translationData removed as it was unused

    // 1. Try to find the product in the base table (Turkish/Default)
    const { data: baseProduct } = await supabase
        .from('products')
        .select('id, slug')
        .eq('slug', slug)
        .single();

    if (baseProduct) {
        productId = baseProduct.id;
    } else {
        // 2. If not found, try to find it in translations
        const { data: translationMatch } = await supabase
            .from('product_translations')
            .select('product_id, language_code')
            .eq('slug', slug)
            .single();

        if (translationMatch) {
            productId = translationMatch.product_id;
        }
    }

    if (!productId) {
        return null;
    }

    // 3. Now fetch the full product data with specific translation
    const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
        *,
        category:categories(*),
        images:product_images(*)
    `)
        .eq('id', productId)
        .single();

    if (productError || !product) {
        return null;
    }

    // If the requested locale is the default (tr), we might already have the correct data,
    // BUT we should double check if the user is visiting a localized slug while being in 'tr' locale (unlikely but possible).
    // Assuming 'tr' always uses base slugs.

    // 4. Fetch the translation for the CURRENT locale
    const { data: translation } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', productId)
        .eq('language_code', locale)
        .maybeSingle();

    if (locale === 'tr') {
        // For TR, we use base product fields, but we might have stored keywords in translations
        // If we didn't store keywords in base table, we need them from translation table
        return {
            ...product,
            keywords: translation?.keywords || ''
        };
    }

    if (translation) {
        // Override base fields with translation
        return {
            ...product,
            title: translation.title || product.title,
            description_html: translation.description_html || product.description_html,
            seo_title: translation.seo_title || product.seo_title,
            seo_description: translation.seo_description || product.seo_description,
            keywords: translation.keywords || '',
            // Keep other fields like images, category, etc. from base
            // Override slug to match what was probably requested or correct for this locale
            slug: translation.slug || product.slug
        };
    }

    return product;
}
