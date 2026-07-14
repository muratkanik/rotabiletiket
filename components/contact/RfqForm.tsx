'use client';

import { useActionState, useEffect, useRef } from 'react';
import { submitRfqForm } from '@/app/actions';
import { trackConversion } from '@/app/actions/analytics';

const initialState: { error?: string; success?: string } = {};

export function RfqForm({ locale, solutionSlug = '' }: { locale: string; solutionSlug?: string }) {
    const [state, formAction, pending] = useActionState(submitRfqForm, initialState);
    const trackedSuccess = useRef(false);
    const isGerman = locale === 'de';

    useEffect(() => {
        if (state.success && !trackedSuccess.current) {
            trackedSuccess.current = true;
            void trackConversion('rfq_submit', window.location.pathname, locale, solutionSlug);
        }
    }, [locale, solutionSlug, state.success]);

    const label = (de: string, en: string) => isGerman ? de : en;

    return (
        <form action={formAction} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <input type="hidden" name="country" value={isGerman ? 'DE' : ''} />
            <input type="hidden" name="solution_slug" value={solutionSlug} />

            <div className="grid gap-5 md:grid-cols-2">
                <Field name="full_name" label={label('Name', 'Name')} required />
                <Field name="company_name" label={label('Unternehmen', 'Company')} />
                <Field name="email" label="E-mail" type="email" required />
                <Field name="phone" label={label('Telefon', 'Phone')} />
                <Field name="industry" label={label('Branche', 'Industry')} />
                <Field name="technology" label={label('Technologie', 'Technology')} placeholder="Barcode / RFID / QR" />
                <Field name="surface" label={label('Anwendungsoberfläche', 'Application surface')} />
                <Field name="temperature_range" label={label('Temperaturbereich', 'Temperature range')} placeholder="e.g. -40°C to 180°C" />
                <Field name="chemical_exposure" label={label('Chemische Belastung', 'Chemical exposure')} />
                <Field name="quantity" label={label('Menge', 'Quantity')} />
            </div>

            <Field name="application" label={label('Anwendung', 'Application')} />

            <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">
                    {label('Technische Anforderungen', 'Technical requirements')} <span className="text-orange-600">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder={label('Bitte beschreiben Sie Ihre Anwendung und Anforderungen.', 'Please describe your application and requirements.')}
                />
            </div>

            {state.error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>}
            {state.success && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{state.success}</p>}

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? label('Wird gesendet…', 'Sending…') : label('Angebot anfordern', 'Request a quote')}
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
