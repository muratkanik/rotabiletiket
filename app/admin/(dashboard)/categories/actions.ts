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

/**
 * Updates a category's display_order
 */
export async function updateCategoryOrder(id: string, newOrder: number) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const { error } = await supabase
            .from('categories')
            .update({ display_order: newOrder })
            .eq('id', id);

        if (error) {
            console.error('Error updating category order:', error);
            return { success: false, error: "Sıralama güncellenirken hata oluştu." };
        }

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error updating category order:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Splices a category before another target category, updating all sibling orders
 */
export async function reorderCategory(activeId: string, overId: string, position: 'before' | 'after') {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const { data: overCategory } = await supabase.from('categories').select('parent_id').eq('id', overId).single();
        if (!overCategory) return { success: false, error: 'Target category not found' };

        const parentId = overCategory.parent_id;

        let query = supabase.from('categories').select('id, display_order').order('display_order', { ascending: true }).order('created_at', { ascending: true });
        if (parentId) {
            query = query.eq('parent_id', parentId);
        } else {
            query = query.is('parent_id', null);
        }
        
        const { data: siblings } = await query;
        if (!siblings) return { success: false, error: 'Failed to fetch siblings' };

        let newSequence = siblings.filter((c: any) => c.id !== activeId);
        const overIndex = newSequence.findIndex((c: any) => c.id === overId);
        
        if (overIndex === -1) {
            newSequence.push({ id: activeId, display_order: 0 });
        } else {
            const insertIndex = position === 'before' ? overIndex : overIndex + 1;
            newSequence.splice(insertIndex, 0, { id: activeId, display_order: 0 });
        }

        // Bulk update sequences
        for (let i = 0; i < newSequence.length; i++) {
            await supabase.from('categories')
                .update({ display_order: i + 1, parent_id: parentId })
                .eq('id', newSequence[i].id);
        }

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Appends a category to the absolute end of the root list
 */
export async function reorderCategoryToLastRoot(activeId: string) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const { data: rootCats } = await supabase.from('categories')
            .select('id, display_order')
            .is('parent_id', null)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: true });
            
        let newSequence = (rootCats || []).filter((c: any) => c.id !== activeId);
        newSequence.push({ id: activeId, display_order: 0 });
        
        for (let i = 0; i < newSequence.length; i++) {
            await supabase.from('categories')
                .update({ display_order: i + 1, parent_id: null })
                .eq('id', newSequence[i].id);
        }
        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Quickly creates a basic category and returns its ID
 */
export async function quickCreateCategory(title: string) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const tempSlug = title
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const { data, error } = await supabase
            .from('categories')
            .insert({ title: title, slug: tempSlug + '-' + Math.floor(Math.random() * 1000) })
            .select('id, title, slug')
            .single();

        if (error || !data) {
            console.error('Error creating quick category:', error);
            return { success: false, error: "Kategori oluşturulurken hata oluştu." };
        }

        revalidatePath('/admin/categories');
        return { success: true, category: data };
    } catch (error: any) {
        console.error('Unexpected error creating quick category:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Updates multiple categories' parent (for bulk drag and drop hierarchy)
 */
export async function bulkUpdateCategoryParent(ids: string[], parentId: string | null) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        if (!ids || ids.length === 0) return { success: true };

        if (parentId && ids.includes(parentId)) {
            return { success: false, error: "Seçili kategorileri kendi altına ekleyemezsiniz." };
        }

        const { error } = await supabase
            .from('categories')
            .update({ parent_id: parentId })
            .in('id', ids);

        if (error) {
            console.error('Error bulk updating category parent:', error);
            return { success: false, error: "Hiyerarşi güncellenirken hata oluştu." };
        }

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error bulk updating category parent:', error);
        return { success: false, error: error.message };
    }
}

export async function updateCategoryImage(id: string, imageUrl: string) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const { error } = await supabase
            .from('categories')
            .update({ image_url: imageUrl })
            .eq('id', id);

        if (error) {
            console.error('Error updating category image:', error);
            return { success: false, error: "Görsel güncellenirken hata oluştu." };
        }

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error updating category image:', error);
        return { success: false, error: error.message };
    }
}
