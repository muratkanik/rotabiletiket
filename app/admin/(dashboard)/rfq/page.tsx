import { createAdminClient } from '@/utils/supabase/admin';
import { RfqList } from './RfqList';

export default async function AdminRfqPage() {
    const supabase = createAdminClient();
    if (!supabase) return <p className="rounded-lg bg-red-50 p-4 text-red-700">Supabase admin configuration is missing.</p>;

    const { data, error } = await supabase.from('rfq_requests').select('*').order('created_at', { ascending: false });
    if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">RFQ talepleri alınamadı: {error.message}</p>;

    return <div className="space-y-6"><div><h1 className="text-3xl font-bold text-slate-900">Teknik Talepler</h1><p className="mt-2 text-slate-500">Teklif, numune ve teknik destek taleplerini yönetin.</p></div><RfqList initialRequests={data || []} /></div>;
}
