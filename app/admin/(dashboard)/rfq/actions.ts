'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';

export async function updateRfqStatus(id: string, status: string) {
    const allowed = ['new', 'in_progress', 'quoted', 'closed'];
    if (!allowed.includes(status)) return { error: 'Invalid RFQ status.' };

    const supabase = createAdminClient();
    if (!supabase) return { error: 'Supabase admin configuration is missing.' };

    const { error } = await supabase.from('rfq_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/admin/rfq');
    return { success: true };
}

export async function deleteRfq(id: string) {
    const supabase = createAdminClient();
    if (!supabase) return { error: 'Supabase admin configuration is missing.' };
    const { error } = await supabase.from('rfq_requests').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/rfq');
    return { success: true };
}
