'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitContactForm(formData: FormData) {
    const supabase = await createClient();

    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!firstName || !lastName || !email || !message) {
        return { error: 'Lütfen tüm alanları doldurunuz.' };
    }

    const { error } = await supabase.from('contact_messages').insert({
        first_name: firstName,
        last_name: lastName,
        email,
        message,
    });

    if (error) {
        console.error('Contact form error:', error);
        return { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.' };
    }

    revalidatePath('/admin/messages'); // If we have an admin messages page
    return { success: 'Mesajınız başarıyla gönderildi.' };
}
