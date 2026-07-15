'use client';

import { useActionState, useRef, useState } from 'react';
import { saveSolution } from './actions';

export function SolutionForm({ solution }: { solution: any }) {
    const [state, formAction, pending] = useActionState(saveSolution, null);
    const [aiKeywords, setAiKeywords] = useState(solution?.title || '');
    const [aiPending, setAiPending] = useState(false);
    const [aiError, setAiError] = useState('');
    const formRef = useRef<HTMLFormElement>(null);
    const translation = (language: string) => solution?.solution_page_translations?.find((item: any) => item.language_code === language) || {};
    const de = translation('de');
    const en = translation('en');
    const specs = Object.entries(solution?.technical_specs || {}).map(([key, value]) => `${key}: ${value}`).join('\n');
    const proofPoints = (solution?.proof_points || []).join('\n');

    async function generateWithAI() {
        setAiPending(true); setAiError('');
        try {
            const response = await fetch('/api/ai/generate-solution', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keywords: aiKeywords }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'AI önerisi oluşturulamadı.');
            const values: Record<string, any> = { ...result.base, de: result.de, en: result.en };
            const setField = (name: string, value: any) => { const field = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null; if (field) field.value = value == null ? '' : String(value); };
            Object.entries(result.base || {}).forEach(([key, value]) => setField(key, key === 'technical_specs' ? Object.entries((value || {}) as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join('\n') : key === 'proof_points' ? (Array.isArray(value) ? value : []).join('\n') : value));
            for (const language of ['de', 'en']) Object.entries(values[language] || {}).forEach(([key, value]) => setField(`${language}_${key}`, value));
        } catch (error: any) { setAiError(error.message || 'AI önerisi oluşturulamadı.'); }
        finally { setAiPending(false); }
    }

    return (
        <form ref={formRef} action={formAction} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
            <input type="hidden" name="id" value={solution?.id || ''} />
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <div className="mb-3"><p className="font-semibold text-orange-950">SERP + yapay zekâ içerik önerisi</p><p className="text-sm text-orange-900/80">Rakip sonuçlarını konu analizi için tarar, özgün bir taslak üretir ve aşağıdaki alanları doldurur.</p></div>
                <div className="flex flex-col gap-3 sm:flex-row"><input value={aiKeywords} onChange={(event) => setAiKeywords(event.target.value)} placeholder="Örn. gıda uyumlu termal etiket çözümleri" className="min-w-0 flex-1 rounded-lg border border-orange-300 bg-white px-3 py-2 text-slate-900" /><button type="button" onClick={generateWithAI} disabled={aiPending} className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{aiPending ? 'Analiz ediliyor…' : 'Öneri oluştur'}</button></div>
                {aiError && <p className="mt-2 text-sm text-red-700">{aiError}</p>}
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><input type="checkbox" name="auto_translate" defaultChecked className="mt-1" /><span><strong>Kaydederken tüm dillere otomatik çevir</strong><br /><span className="text-blue-900/75">Türkçe temel içerik; İngilizce, Almanca, Fransızca, Arapça, İspanyolca ve İtalyancaya AI ile çevrilir.</span></span></label>
            <div className="grid gap-5 md:grid-cols-3">
                <Input name="title" label="Temel başlık" defaultValue={solution?.title} required />
                <Input name="slug" label="Temel slug" defaultValue={solution?.slug} required />
                <Input name="page_kind" label="Tür" defaultValue={solution?.page_kind || 'solution'} />
            </div>
            <Input name="excerpt" label="Temel özet" defaultValue={solution?.excerpt} />
            <Textarea name="content_html" label="Temel içerik HTML" defaultValue={solution?.content_html} rows={8} />
            <div className="grid gap-5 md:grid-cols-2">
                <Textarea name="technical_specs" label="Teknik özellikler (satır başına Key: Value)" defaultValue={specs} />
                <Textarea name="proof_points" label="Kanıt/madde listesi (satır başına bir madde)" defaultValue={proofPoints} />
            </div>

            <div className="grid gap-5 border-t border-slate-200 pt-6 md:grid-cols-2">
                <fieldset className="space-y-4 rounded-lg bg-slate-50 p-4">
                    <legend className="font-semibold">Deutsch</legend>
                    <Input name="de_title" label="Titel" defaultValue={de.title} />
                    <Input name="de_slug" label="Slug" defaultValue={de.slug} />
                    <Input name="de_excerpt" label="Kurzbeschreibung" defaultValue={de.excerpt} />
                    <Textarea name="de_content_html" label="Inhalt HTML" defaultValue={de.content_html} rows={6} />
                    <Input name="de_seo_title" label="SEO-Titel" defaultValue={de.seo_title} />
                    <Input name="de_seo_description" label="SEO-Beschreibung" defaultValue={de.seo_description} />
                    <Input name="de_keywords" label="Keywords" defaultValue={de.keywords} />
                </fieldset>
                <fieldset className="space-y-4 rounded-lg bg-slate-50 p-4">
                    <legend className="font-semibold">English</legend>
                    <Input name="en_title" label="Title" defaultValue={en.title} />
                    <Input name="en_slug" label="Slug" defaultValue={en.slug} />
                    <Input name="en_excerpt" label="Excerpt" defaultValue={en.excerpt} />
                    <Textarea name="en_content_html" label="Content HTML" defaultValue={en.content_html} rows={6} />
                    <Input name="en_seo_title" label="SEO title" defaultValue={en.seo_title} />
                    <Input name="en_seo_description" label="SEO description" defaultValue={en.seo_description} />
                    <Input name="en_keywords" label="Keywords" defaultValue={en.keywords} />
                </fieldset>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <Input name="seo_title" label="Temel SEO başlığı" defaultValue={solution?.seo_title} />
                <Input name="seo_description" label="Temel SEO açıklaması" defaultValue={solution?.seo_description} />
                <Input name="keywords" label="Temel keywords" defaultValue={solution?.keywords} />
            </div>
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="is_published" defaultChecked={solution?.is_published} /> Yayınla</label>
                <Input name="display_order" label="Sıra" defaultValue={solution?.display_order || 0} />
            </div>

            {state?.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
            <button disabled={pending} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                {pending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
        </form>
    );
}

function Input({ name, label, defaultValue, required = false }: { name: string; label: string; defaultValue?: string | number | null; required?: boolean }) {
    return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} required={required} defaultValue={defaultValue || ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-slate-900" /></label>;
}

function Textarea({ name, label, defaultValue, rows = 4 }: { name: string; label: string; defaultValue?: string | null; rows?: number }) {
    return <label className="block text-sm font-medium text-slate-700">{label}<textarea name={name} defaultValue={defaultValue || ''} rows={rows} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-slate-900" /></label>;
}
