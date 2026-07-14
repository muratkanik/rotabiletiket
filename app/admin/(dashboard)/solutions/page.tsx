import Link from 'next/link';
import { createAdminClient } from '@/utils/supabase/admin';
import { deleteSolutionAction } from './actions';
import { SolutionForm } from './SolutionForm';

export default async function AdminSolutionsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams;
    const supabase = createAdminClient();
    if (!supabase) {
        return <p className="rounded-lg bg-red-50 p-4 text-red-700">Supabase admin configuration is missing.</p>;
    }
    const { data: solutions } = await supabase
        .from('solution_pages')
        .select('*, solution_page_translations(*)')
        .order('display_order', { ascending: true })
        .order('title', { ascending: true });

    const selected = id ? solutions?.find((solution: any) => solution.id === id) : null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Teknik Çözüm Sayfaları</h1>
                    <p className="mt-2 text-slate-500">Almanya ve Avrupa B2B içeriklerini taslak veya yayın olarak yönetin.</p>
                </div>
                <Link href="/admin/solutions" className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700">
                    Yeni sayfa
                </Link>
            </div>

            <SolutionForm solution={selected} />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-6 py-4 font-semibold">Mevcut sayfalar</div>
                <div className="divide-y divide-slate-100">
                    {(solutions || []).map((solution: any) => (
                        <div key={solution.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="font-semibold text-slate-900">{solution.title}</div>
                                <div className="text-sm text-slate-500">/{solution.slug} · {solution.is_published ? 'Yayında' : 'Taslak'}</div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/admin/solutions?id=${solution.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Düzenle</Link>
                                <form action={deleteSolutionAction}>
                                    <input type="hidden" name="id" value={solution.id} />
                                    <button className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Sil</button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {(!solutions || solutions.length === 0) && <p className="px-6 py-8 text-slate-500">Henüz çözüm sayfası oluşturulmadı.</p>}
                </div>
            </div>
        </div>
    );
}
