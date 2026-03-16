import { createClient } from '@/utils/supabase/server';
import { ProductList } from '@/components/admin/products/ProductList';

export default async function AdminProductsPage() {
    const supabase = await createClient();
    
    // Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(id, title, slug)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    // Fetch all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, title, slug')
        .order('title', { ascending: true });

    return <ProductList initialProducts={products || []} categories={categories || []} />;
}
