'use client';

import { useState } from 'react';
import { SolutionForm } from './SolutionForm';

export function SolutionEditorModal({ solution, startOpen = false }: { solution: any; startOpen?: boolean }) {
    const [open, setOpen] = useState(startOpen);
    return <>
        {!startOpen && <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700">Yeni sayfa</button>}
        {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-slate-100 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <h2 className="text-xl font-bold text-slate-900">{solution ? 'Çözüm sayfasını düzenle' : 'Yeni çözüm sayfası'}</h2>
                    <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">Kapat</button>
                </div>
                <div className="p-4 sm:p-6"><SolutionForm solution={solution} /></div>
            </div>
        </div>}
    </>;
}
