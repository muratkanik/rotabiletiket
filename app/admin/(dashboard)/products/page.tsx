import { createClient } from '@/utils/supabase/server';
import { ProductList } from '@/components/admin/products/ProductList';

export default async function AdminProductsPage() {
    const supabase = await createClient();
    
    // Fetch products and their translations to get the keywords for the primary language
    const { data: rawProducts } = await supabase
        .from('products')
        .select(`
            *, 
            categories(id, title, slug),
            product_translations(language_code, keywords)
        `)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    // Fetch all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, title, slug')
        .order('title', { ascending: true });

    const products = (rawProducts || []).map((p: any) => {
        const trTranslation = p.product_translations?.find((t: any) => t.language_code === 'tr');
        return {
            ...p,
            keywords: trTranslation?.keywords || null
        };
    });

    return <ProductList initialProducts={products} categories={categories || []} />;
}
