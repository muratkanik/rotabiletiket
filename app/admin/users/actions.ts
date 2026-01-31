'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    try {
        const supabase = createAdminClient();

        if (!supabase) {
            return [];
        }

        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return users;
    } catch (error) {
        console.error('Unexpected error fetching users:', error);
        return [];
    }
}

export async function inviteUser(email: string) {
    const supabase = createAdminClient();
    if (!supabase) return { success: false, error: "Service Role Key missing" };

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    if (error) {
        console.error('Error inviting user:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function createUserWithPassword(email: string, password: string) {
    const supabase = createAdminClient();
    if (!supabase) return { success: false, error: "Service Role Key missing" };

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient();
    if (!supabase) return { success: false, error: "Service Role Key missing" };

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function sendPasswordReset(email: string) {
    const supabase = createAdminClient();
    if (!supabase) return { success: false, error: "Service Role Key missing" };

    const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
    });

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/update-password`,
    });

    if (resetError) {
        return { success: false, error: resetError.message };
    }

    return { success: true };
}
