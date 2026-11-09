import { createAdminClient } from '@/utils/supabase/admin';
import { SolutionEditorModal } from './SolutionEditorModal';
import { SolutionList } from './SolutionList';

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
                <SolutionEditorModal solution={null} />
            </div>

            {selected && <SolutionEditorModal solution={selected} startOpen />}

            <SolutionList solutions={(solutions || []).map((solution: any) => ({
                id: solution.id,
                title: solution.title,
                slug: solution.slug,
                is_published: solution.is_published,
            }))} />
        </div>
    );
}
