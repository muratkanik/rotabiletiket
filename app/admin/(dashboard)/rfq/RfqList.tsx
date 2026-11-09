'use client';

import { useState, useTransition } from 'react';
import { deleteRfq, updateRfqStatus } from './actions';

const statusLabels: Record<string, string> = {
    new: 'Yeni',
    in_progress: 'İşleniyor',
    quoted: 'Teklif verildi',
    closed: 'Kapalı',
};

export function RfqList({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const [selected, setSelected] = useState<any | null>(null);
    const [pending, startTransition] = useTransition();

    const changeStatus = (id: string, status: string) => {
        startTransition(async () => {
            const result = await updateRfqStatus(id, status);
            if (!result.error) {
                setRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
                if (selected?.id === id) setSelected((item: any) => ({ ...item, status }));
            }
        });
    };

    const remove = (id: string) => {
        if (!window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) return;
        startTransition(async () => {
            const result = await deleteRfq(id);
            if (!result.error) {
                setRequests((items) => items.filter((item) => item.id !== id));
                if (selected?.id === id) setSelected(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr><th className="px-5 py-4">Talep</th><th className="px-5 py-4">Firma</th><th className="px-5 py-4">Çözüm</th><th className="px-5 py-4">Durum</th><th className="px-5 py-4">Tarih</th><th className="px-5 py-4">İşlem</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4"><button onClick={() => setSelected(request)} className="text-left font-semibold text-slate-900 hover:text-orange-600">{request.full_name}<span className="block text-xs font-normal text-slate-500">{request.email}</span></button></td>
                                    <td className="px-5 py-4 text-slate-600">{request.company_name || '—'}</td>
                                    <td className="px-5 py-4 text-slate-600">{request.solution_slug || 'Genel talep'}</td>
                                    <td className="px-5 py-4"><select value={request.status} disabled={pending} onChange={(event) => changeStatus(request.id, event.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs"><option value="new">{statusLabels.new}</option><option value="in_progress">{statusLabels.in_progress}</option><option value="quoted">{statusLabels.quoted}</option><option value="closed">{statusLabels.closed}</option></select></td>
                                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">{new Date(request.created_at).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-5 py-4"><button onClick={() => remove(request.id)} disabled={pending} className="text-xs text-red-600 hover:underline">Sil</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {requests.length === 0 && <p className="px-5 py-10 text-center text-slate-500">Henüz teknik talep yok.</p>}
            </div>

            {selected && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{selected.full_name}</h2><p className="text-sm text-slate-500">{selected.email} · {selected.phone || 'Telefon yok'}</p></div><button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-900">Kapat</button></div>
                    <dl className="grid gap-4 text-sm md:grid-cols-2">
                        {['company_name', 'country', 'industry', 'application', 'surface', 'temperature_range', 'chemical_exposure', 'quantity', 'technology', 'request_type', 'solution_slug'].map((key) => <div key={key}><dt className="font-semibold text-slate-500">{key}</dt><dd className="mt-1 text-slate-900">{selected[key] || '—'}</dd></div>)}
                    </dl>
                    <div className="mt-5 border-t border-slate-100 pt-5"><h3 className="font-semibold text-slate-700">Teknik talep</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{selected.message}</p></div>
                </div>
            )}
        </div>
    );
}
