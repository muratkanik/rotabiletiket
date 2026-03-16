'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateProductsOrder(updates: { id: string; display_order: number }[]) {
    try {
        const supabase = createAdminClient();
        if (!supabase) return { success: false, error: "Service Role Key missing" };

        const { error } = await supabase.rpc('update_products_order', {
            order_updates: updates
        });

        // If RPC isn't available, we can loop, since we are doing this from admin panel, 
        // a simple Promise.all is also fine for a reasonable number of products.
        if (error && error.code === '42883') {
            console.log("RPC update_products_order not found. Falling back to individual updates.");
            const promises = updates.map(update => 
                supabase.from('products').update({ display_order: update.display_order }).eq('id', update.id)
            );
            await Promise.all(promises);
        } else if (error) {
           console.error('Error in bulk update:', error);
           return { success: false, error: error.message };
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
