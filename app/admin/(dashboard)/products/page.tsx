import { createClient } from '@/utils/supabase/server';
import { ProductList } from '@/components/admin/products/ProductList';

export default async function AdminProductsPage() {
    const supabase = await createClient();
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(title, slug)')
        .order('created_at', { ascending: false });

    return <ProductList initialProducts={products || []} />;
}
