import { createClient } from '@/utils/supabase/server';
import { CategoryList } from '@/components/admin/categories/CategoryList';

export default async function AdminCategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*, parent:parent_id(title)')
        .order('title', { ascending: true });

    return <CategoryList initialCategories={categories || []} />;
}
