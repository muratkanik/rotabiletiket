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
    let emailSent = false;
    let emailError = "Mail gönderimi ayarlarda e-posta API anahtarı (RESEND_API_KEY) tanımlanmadığı için devre dışı.";

    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const response = await resend.emails.send({
                from: 'Rotabiletiket <info@rotabiletiket.com>', // User needs to verify domain on Resend
                to: email,
                subject: 'Rotabiletiket Admin Panel Hesabınız Oluşturuldu',
                html: `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #1e40af;">Hoş Geldiniz!</h2>
                        <p>Rotabiletiket sistemine yeni bir admin kullanıcısı olarak eklendiniz.</p>
                        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>🔑 Giriş Bilgileriniz:</strong></p>
                            <p style="margin: 5px 0;"><strong>E-posta:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Şifre:</strong> <span style="font-family: monospace; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">${password}</span></p>
                        </div>
                        <p>Aşağıdaki bağlantıyı kullanarak sisteme giriş yapabilirsiniz:</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rotabiletiket.com'}/admin/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 10px 0;">Yönetim Paneline Git</a>
                        <p style="color: #64748b; font-size: 13px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">Güvenliğiniz için ilk girişten sonra şifrenizi sağ üst menüden değiştirmeniz tavsiye edilir.</p>
                    </div>
                `
            });

            if (response.error) {
                console.error('Resend API error:', response.error);
                emailError = response.error.message;
            } else {
                emailSent = true;
                emailError = "";
            }
        } catch (mailError: any) {
            console.error('Mail sending failed:', mailError);
            emailError = mailError.message || "Bilinmeyen bir hata oluştu";
        }
    }

    revalidatePath('/admin/users');
    return { success: true, emailSent, emailError };
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
