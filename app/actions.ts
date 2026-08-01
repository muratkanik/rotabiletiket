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
    const locale = String(formData.get('locale') || 'en').trim();
    const requestedType = String(formData.get('request_type') || 'technical_support').trim();
    const requestType = ['quote', 'sample', 'technical_support'].includes(requestedType)
        ? requestedType
        : 'technical_support';

    if (!fullName || !email || !message) {
        return { error: locale === 'tr' ? 'Lütfen ad, e-posta ve talep detaylarını doldurun.' : 'Please complete your name, email and request details.' };
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
        request_type: requestType,
    });

    if (error) {
        console.error('RFQ form error:', error);
        return { error: locale === 'tr' ? 'Talebiniz gönderilemedi. Lütfen tekrar deneyin.' : 'We could not submit your request. Please try again.' };
    }

    return { success: locale === 'tr' ? 'Teşekkürler. Teknik ekibimiz kısa süre içinde sizinle iletişime geçecek.' : 'Thank you. Our technical team will contact you shortly.' };
}
