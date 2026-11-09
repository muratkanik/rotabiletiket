'use client';

import { useActionState, useEffect, useRef } from 'react';
import { submitRfqForm } from '@/app/actions';
import { trackConversion } from '@/app/actions/analytics';

const initialState: { error?: string; success?: string } = {};

export function RfqForm({ locale, solutionSlug = '', requestType = 'technical_support' }: { locale: string; solutionSlug?: string; requestType?: string }) {
    const [state, formAction, pending] = useActionState(submitRfqForm, initialState);
    const trackedSuccess = useRef(false);
    const labels: Record<string, { name: string; company: string; phone: string; industry: string; technology: string; surface: string; temperature: string; chemical: string; quantity: string; application: string; requirements: string; placeholder: string; submit: string; sending: string; requestType: string; quote: string; sample: string; support: string }> = {
        tr: { name: 'Ad Soyad', company: 'Şirket', phone: 'Telefon', industry: 'Sektör', technology: 'Teknoloji', surface: 'Uygulama yüzeyi', temperature: 'Sıcaklık aralığı', chemical: 'Kimyasal maruziyet', quantity: 'Miktar', application: 'Uygulama', requirements: 'Teknik gereksinimler', placeholder: 'Uygulamanızı ve teknik gereksinimlerinizi açıklayın.', submit: 'Teknik talebi gönder', sending: 'Gönderiliyor…', requestType: 'Talep türü', quote: 'Teklif talebi', sample: 'Numune talebi', support: 'Teknik destek' },
        en: { name: 'Full name', company: 'Company', phone: 'Phone', industry: 'Industry', technology: 'Technology', surface: 'Application surface', temperature: 'Temperature range', chemical: 'Chemical exposure', quantity: 'Quantity', application: 'Application', requirements: 'Technical requirements', placeholder: 'Describe your application and technical requirements.', submit: 'Send technical request', sending: 'Sending…', requestType: 'Request type', quote: 'Quote request', sample: 'Sample request', support: 'Technical support' },
        de: { name: 'Name', company: 'Unternehmen', phone: 'Telefon', industry: 'Branche', technology: 'Technologie', surface: 'Anwendungsoberfläche', temperature: 'Temperaturbereich', chemical: 'Chemische Belastung', quantity: 'Menge', application: 'Anwendung', requirements: 'Technische Anforderungen', placeholder: 'Beschreiben Sie Ihre Anwendung und technischen Anforderungen.', submit: 'Technische Anfrage senden', sending: 'Wird gesendet…', requestType: 'Anfragetyp', quote: 'Angebotsanfrage', sample: 'Musteranfrage', support: 'Technischer Support' },
        fr: { name: 'Nom complet', company: 'Entreprise', phone: 'Téléphone', industry: 'Secteur', technology: 'Technologie', surface: 'Surface d’application', temperature: 'Plage de température', chemical: 'Exposition chimique', quantity: 'Quantité', application: 'Application', requirements: 'Besoins techniques', placeholder: 'Décrivez votre application et vos besoins techniques.', submit: 'Envoyer la demande technique', sending: 'Envoi…', requestType: 'Type de demande', quote: 'Demande de devis', sample: 'Demande d’échantillon', support: 'Support technique' },
        ar: { name: 'الاسم الكامل', company: 'الشركة', phone: 'الهاتف', industry: 'القطاع', technology: 'التقنية', surface: 'سطح التطبيق', temperature: 'نطاق الحرارة', chemical: 'التعرض الكيميائي', quantity: 'الكمية', application: 'التطبيق', requirements: 'المتطلبات الفنية', placeholder: 'اشرحوا تطبيقكم ومتطلباتكم الفنية.', submit: 'إرسال الطلب الفني', sending: 'جارٍ الإرسال…', requestType: 'نوع الطلب', quote: 'طلب عرض سعر', sample: 'طلب عينة', support: 'دعم فني' },
        es: { name: 'Nombre completo', company: 'Empresa', phone: 'Teléfono', industry: 'Sector', technology: 'Tecnología', surface: 'Superficie de aplicación', temperature: 'Rango de temperatura', chemical: 'Exposición química', quantity: 'Cantidad', application: 'Aplicación', requirements: 'Requisitos técnicos', placeholder: 'Describa su aplicación y sus requisitos técnicos.', submit: 'Enviar solicitud técnica', sending: 'Enviando…', requestType: 'Tipo de solicitud', quote: 'Solicitud de presupuesto', sample: 'Solicitud de muestra', support: 'Soporte técnico' },
        it: { name: 'Nome e cognome', company: 'Azienda', phone: 'Telefono', industry: 'Settore', technology: 'Tecnologia', surface: 'Superficie di applicazione', temperature: 'Intervallo di temperatura', chemical: 'Esposizione chimica', quantity: 'Quantità', application: 'Applicazione', requirements: 'Requisiti tecnici', placeholder: 'Descrivi la tua applicazione e i requisiti tecnici.', submit: 'Invia richiesta tecnica', sending: 'Invio…', requestType: 'Tipo di richiesta', quote: 'Richiesta preventivo', sample: 'Richiesta campione', support: 'Supporto tecnico' },
    };
    const text = labels[locale] || labels.en;

    useEffect(() => {
        if (state.success && !trackedSuccess.current) {
            trackedSuccess.current = true;
            void trackConversion('rfq_submit', window.location.pathname, locale, solutionSlug);
        }
    }, [locale, solutionSlug, state.success]);

    return (
        <form action={formAction} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <input type="hidden" name="country" value={locale.toUpperCase()} />
            <input type="hidden" name="solution_slug" value={solutionSlug} />
            <input type="hidden" name="locale" value={locale} />

            <div>
                <label htmlFor="request_type" className="mb-2 block text-sm font-medium text-slate-700">{text.requestType}</label>
                <select id="request_type" name="request_type" defaultValue={requestType} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                    <option value="technical_support">{text.support}</option>
                    <option value="quote">{text.quote}</option>
                    <option value="sample">{text.sample}</option>
                </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <Field name="full_name" label={text.name} required />
                <Field name="company_name" label={text.company} />
                <Field name="email" label="E-mail" type="email" required />
                <Field name="phone" label={text.phone} />
                <Field name="industry" label={text.industry} />
                <Field name="technology" label={text.technology} placeholder="Barcode / RFID / QR" />
                <Field name="surface" label={text.surface} />
                <Field name="temperature_range" label={text.temperature} placeholder="e.g. -40°C to 180°C" />
                <Field name="chemical_exposure" label={text.chemical} />
                <Field name="quantity" label={text.quantity} />
            </div>

            <Field name="application" label={text.application} />

            <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">
                    {text.requirements} <span className="text-orange-600">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder={text.placeholder}
                />
            </div>

            {state.error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>}
            {state.success && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{state.success}</p>}

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? text.sending : text.submit}
            </button>
        </form>
    );
}

function Field({
    name,
    label,
    type = 'text',
    placeholder,
    required = false,
}: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-orange-600">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
        </div>
    );
}
