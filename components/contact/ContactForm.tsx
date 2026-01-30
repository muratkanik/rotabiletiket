'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitContactForm } from '@/app/actions';

export function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const result = await submitContactForm(formData);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result.success) {
            setMessage({ type: 'success', text: result.success });
            // Reset form
            const form = document.getElementById('contact-form') as HTMLFormElement;
            if (form) form.reset();
        }

        setLoading(false);
    }

    return (
        <form id="contact-form" action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Adınız</label>
                    <input name="first_name" required className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Soyadınız</label>
                    <input name="last_name" required className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">E-posta</label>
                <input name="email" type="email" required className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Mesajınız</label>
                <textarea name="message" required className="w-full border rounded-lg px-4 py-3 h-32 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none" />
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12">
                {loading ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
        </form>
    );
}
