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

import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY); // Moved to inside function to avoid build error if key missing

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

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'Rotabil Etiket <noreply@rotabiletiket.com>', // User needs to verify domain or use onboard address
                to: email,
                subject: 'Rotabil Admin Hesabınız Oluşturuldu',
                html: `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Hoş Geldiniz!</h2>
                        <p>Rotabil Etiket admin panel erişiminiz oluşturulmuştur.</p>
                        <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Giriş Bilgileriniz:</strong></p>
                            <p style="margin: 5px 0;">E-posta: ${email}</p>
                            <p style="margin: 5px 0;">Şifre: <strong>${password}</strong></p>
                        </div>
                        <p>Aşağıdaki bağlantıdan giriş yapabilirsiniz:</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" style="background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Admin Paneline Git</a>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">Güvenliğiniz için giriş yaptıktan sonra şifrenizi değiştirmenizi öneririz.</p>
                    </div>
                `
            });
        } catch (mailError) {
            console.error('Mail sending failed:', mailError);
            // Don't fail the whole request if mail fails, but maybe warn?
            // For now silent fail logging is okay, UI will show success for user creation.
        }
    } else {
        console.warn('RESEND_API_KEY is missing, welcome email not sent.');
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
