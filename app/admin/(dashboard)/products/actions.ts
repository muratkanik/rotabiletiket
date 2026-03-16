'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateProductsOrder(updates: { id: string; display_order: number }[]) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const promises = updates.map(update => 
            supabase.from('products').update({ display_order: update.display_order }).eq('id', update.id)
        );
        const results = await Promise.all(promises);
        
        const errors = results.filter(r => r.error).map(r => r.error);
        if (errors.length > 0) {
            console.error('Error in bulk update:', errors);
            return { success: false, error: errors[0]?.message || 'Unknown error during bulk update' };
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
        // You might need to revalidate other public routes as well
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error updating product order:', error);
        return { success: false, error: error.message };
    }
}
