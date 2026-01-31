'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    const supabase = createAdminClient();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return users;
}

export async function inviteUser(email: string) {
    const supabase = createAdminClient();
    // Use inviteUserByEmail to send an invite link, or createUser to manually set it.
    // For admin panels, often createUser + password reset is easier if SMTP isn't perfect, 
    // but sending an invite is standard.
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
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function sendPasswordReset(email: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
    });
    // Note: generateLink returns the link. resetPasswordForEmail sends the email. 
    // If we want to send the email:
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/update-password`,
    });

    if (resetError) {
        return { success: false, error: resetError.message };
    }

    return { success: true };
}
