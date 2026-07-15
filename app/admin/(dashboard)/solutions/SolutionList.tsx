'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { Check, Eye, FilePenLine, RotateCcw, Trash2 } from 'lucide-react';
import { bulkUpdateSolutions, deleteSolutionAction } from './actions';

type Solution = {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
};

type Filter = 'all' | 'draft' | 'published';

export function SolutionList({ solutions }: { solutions: Solution[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const visibleSolutions = useMemo(() => {
        if (filter === 'draft') return solutions.filter((solution) => !solution.is_published);
        if (filter === 'published') return solutions.filter((solution) => solution.is_published);
        return solutions;
    }, [filter, solutions]);

    const visibleIds = visibleSolutions.map((solution) => solution.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    const selectedDraftCount = solutions.filter((solution) => selectedIds.includes(solution.id) && !solution.is_published).length;
    const selectedPublishedCount = solutions.filter((solution) => selectedIds.includes(solution.id) && solution.is_published).length;

    function toggleAll() {
        setSelectedIds((current) => allVisibleSelected
            ? current.filter((id) => !visibleIds.includes(id))
            : Array.from(new Set([...current, ...visibleIds]))
        );
    }

    function toggleOne(id: string) {
        setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    }

    function updateSelected(isPublished: boolean) {
        if (selectedIds.length === 0) return;
        setMessage(null);
        startTransition(async () => {
            const result = await bulkUpdateSolutions(selectedIds, isPublished);
            if (result.error) {
                setMessage(result.error);
                return;
            }
            setMessage(`${result.count} sayfa ${isPublished ? 'onaylandı ve yayınlandı' : 'taslağa alındı'}.`);
            setSelectedIds([]);
            window.location.reload();
        });
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="font-semibold">Mevcut sayfalar</div>
                    <div className="mt-1 text-sm text-slate-500">Taslakları seçip tek işlemle onaylayabilirsiniz.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {(['all', 'draft', 'published'] as Filter[]).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={`rounded-lg px-3 py-2 text-sm ${filter === item ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {item === 'all' ? `Tümü (${solutions.length})` : item === 'draft' ? `Taslak (${solutions.filter((solution) => !solution.is_published).length})` : `Yayında (${solutions.filter((solution) => solution.is_published).length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-orange-600" />
                    Görünenleri seç
                </label>
                <span className="text-sm text-slate-500">{selectedIds.length} seçili</span>
                <button type="button" disabled={isPending || selectedDraftCount === 0} onClick={() => updateSelected(true)} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Check size={16} /> Seçilen taslakları onayla ({selectedDraftCount})
                </button>
                <button type="button" disabled={isPending || selectedPublishedCount === 0} onClick={() => updateSelected(false)} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 enabled:hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50">
                    <RotateCcw size={16} /> Yayından kaldır ({selectedPublishedCount})
                </button>
                {message && <span className="text-sm font-medium text-slate-600">{message}</span>}
            </div>

            <div className="divide-y divide-slate-100">
                {visibleSolutions.map((solution) => (
                    <div key={solution.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <input aria-label={`${solution.title} seç`} type="checkbox" checked={selectedIds.includes(solution.id)} onChange={() => toggleOne(solution.id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600" />
                            <div>
                                <div className="font-semibold text-slate-900">{solution.title}</div>
                                <div className="text-sm text-slate-500">/{solution.slug} · {solution.is_published ? 'Yayında' : 'Taslak'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 pl-7 sm:pl-0">
                            <Link href={`/admin/solutions?id=${solution.id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"><FilePenLine size={15} /> Düzenle</Link>
                            {solution.is_published && <Link href={`/tr/cozumler/${solution.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"><Eye size={15} /> Görüntüle</Link>}
                            <form action={deleteSolutionAction}>
                                <input type="hidden" name="id" value={solution.id} />
                                <button className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={15} /> Sil</button>
                            </form>
                        </div>
                    </div>
                ))}
                {visibleSolutions.length === 0 && <p className="px-6 py-8 text-slate-500">Bu filtrede sayfa bulunamadı.</p>}
            </div>
        </div>
    );
}
