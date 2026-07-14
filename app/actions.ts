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

export async function submitRfqForm(_previousState: unknown, formData: FormData) {
    const supabase = await createClient();

    const fullName = String(formData.get('full_name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!fullName || !email || !message) {
        return { error: 'Please complete your name, email and request details.' };
    }

    const { error } = await supabase.from('rfq_requests').insert({
        full_name: fullName,
        company_name: String(formData.get('company_name') || '').trim() || null,
        email,
        phone: String(formData.get('phone') || '').trim() || null,
        country: String(formData.get('country') || 'DE').trim(),
        industry: String(formData.get('industry') || '').trim() || null,
        application: String(formData.get('application') || '').trim() || null,
        surface: String(formData.get('surface') || '').trim() || null,
        temperature_range: String(formData.get('temperature_range') || '').trim() || null,
        chemical_exposure: String(formData.get('chemical_exposure') || '').trim() || null,
        quantity: String(formData.get('quantity') || '').trim() || null,
        technology: String(formData.get('technology') || '').trim() || null,
        solution_slug: String(formData.get('solution_slug') || '').trim() || null,
        message,
        request_type: String(formData.get('request_type') || 'quote').trim(),
    });

    if (error) {
        console.error('RFQ form error:', error);
        return { error: 'We could not submit your request. Please try again.' };
    }

    return { success: 'Thank you. Our technical team will contact you shortly.' };
}
