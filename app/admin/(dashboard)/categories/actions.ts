'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Ensures products belonging to the category are unassigned before deleting the category
 */
export async function deleteCategory(id: string) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        // 1. Unassign products first (update category_id to null)
        const { error: updateError } = await supabase
            .from('products')
            .update({ category_id: null })
            .eq('category_id', id);

        if (updateError) {
            console.error('Error unassigning products for category:', updateError);
            return { success: false, error: "Ürünlerin kategorisi sıfırlanırken hata oluştu: " + updateError.message };
        }

        // 2. Delete the category
        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting category:', deleteError);
            return { success: false, error: "Kategori silinirken hata oluştu: " + deleteError.message };
        }

        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error deleting category:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Safely deletes multiple selected categories and unassigns their products
 */
export async function bulkDeleteCategories(ids: string[]) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        if (!ids || ids.length === 0) return { success: true };

        // 1. Unassign products for all selected categories
        const { error: updateError } = await supabase
            .from('products')
            .update({ category_id: null })
            .in('category_id', ids);

        if (updateError) {
            console.error('Error unassigning products in bulk:', updateError);
            return { success: false, error: "Ürünlerin kategorisi sıfırlanırken hata oluştu." };
        }

        // 2. Delete the categories
        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error('Error bulk deleting categories:', deleteError);
            return { success: false, error: "Kategoriler silinirken hata oluştu." };
        }

        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true, count: ids.length, error: undefined };
    } catch (error: any) {
        console.error('Unexpected error bulk deleting categories:', error);
        return { success: false, count: 0, error: error.message };
    }
}

/**
 * Finds categories with no products and deletes them 
 * Note: Sub-categories will also be deleted if they meet the criteria, so cascading may fail 
 * if we don't handle parent_id relations. Typically empty categories can just be deleted.
 */
export async function deleteEmptyCategories() {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        // Get all categories with product counts
        const { data: categories, error: fetchError } = await supabase
            .from('categories')
            .select(`
                id,
                products(count)
            `);

        if (fetchError || !categories) {
            console.error('Error fetching categories for empty deletion:', fetchError);
            return { success: false, error: "Kategoriler getirilirken hata oluştu." };
        }

        // Filter and find IDs where product count is exactly 0
        const emptyIds = categories
            .filter(c => !c.products || (Array.isArray(c.products) ? c.products[0]?.count === 0 : (c.products as any).count === 0))
            .map(c => c.id);

        if (emptyIds.length === 0) {
            return { success: true, count: 0, message: "Silinecek boş kategori bulunamadı." as string | undefined, error: undefined as string | undefined };
        }

        const bulkResult = await bulkDeleteCategories(emptyIds);
        if (bulkResult.success) {
            return { success: true, count: bulkResult.count, message: undefined, error: undefined };
        }
        return { success: false, count: 0, message: undefined, error: bulkResult.error };
    } catch (error: any) {
        console.error('Unexpected error deleting empty categories:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Updates a category's parent (for drag and drop hierarchy)
 * Setting parentId to null makes it a root category.
 */
export async function updateCategoryParent(id: string, parentId: string | null) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        // Ensure we don't set a category as its own parent
        if (id === parentId) {
            return { success: false, error: "Bir kategoriyi kendi altına ekleyemezsiniz." };
        }

        const { error } = await supabase
            .from('categories')
            .update({ parent_id: parentId })
            .eq('id', id);

        if (error) {
            console.error('Error updating category parent:', error);
            return { success: false, error: "Kategori hiyerarisi gncellenirken hata olutu." };
        }

        revalidatePath('/admin/categories');
        revalidatePath('/'); // Revalidate menus/sidebar
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error updating category parent:', error);
        return { success: false, error: error.message };
    }
}
