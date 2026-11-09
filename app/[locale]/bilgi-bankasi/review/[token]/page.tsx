import { notFound } from 'next/navigation';
import { getDraftByReviewToken } from '@/lib/article-review';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Clock3, FileText, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ArticleReviewPage({ params, searchParams }: { params: Promise<{ token: string; locale: string }>; searchParams: Promise<{ action?: string; approved?: string; error?: string }> }) {
    const { token, locale } = await params;
    const query = await searchParams;
    const draft = await getDraftByReviewToken(token);
    if (!draft) notFound();

    const approved = query.approved === '1' || (draft.review_status === 'approved' && draft.is_published);
    const approvalPrompt = query.action === 'approve' && !approved;

    return (
        <main className="min-h-screen bg-slate-50 py-10">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-6 rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
                    <div className="mb-3 flex items-center gap-2 text-orange-400"><FileText size={20} /><span className="text-xs font-bold uppercase tracking-[0.2em]">Rotabil Etiket · Taslak inceleme</span></div>
                    <h1 className="text-3xl font-bold leading-tight md:text-4xl">{draft.title}</h1>
                    <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><Clock3 size={16} /> SEO skoru: {draft.seo_score ?? '—'}/100</span><span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Admin girişi gerekmez</span></div>
                </div>

                {query.error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{query.error}</div>}
                {approved && <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800"><CheckCircle2 /> Taslak onaylandı ve yayınlandı.</div>}
                {approvalPrompt && <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-950"><h2 className="font-bold">Bu makaleyi yayınlamak üzeresiniz</h2><p className="mt-1 text-sm">Onayladığınızda makale tüm dillerde yayınlanır ve Bilgi Bankası’nda görünür.</p><form className="mt-4" action={`/api/articles/review/${token}`} method="post"><Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">Taslağı Onayla ve Yayınla</Button></form></div>}

                <article className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
                    <p className="mb-8 rounded-xl bg-orange-50 p-5 text-slate-700">{draft.summary}</p>
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: draft.content_html || '' }} />
                </article>
                <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="outline"><Link href={`/${locale}/bilgi-bankasi`}>Bilgi Bankası’na dön</Link></Button>{!approved && !approvalPrompt && <Button asChild className="bg-emerald-700 hover:bg-emerald-800"><Link href={`/${locale}/bilgi-bankasi/review/${token}?action=approve`}>Makaleyi Onaylama Ekranını Aç</Link></Button>}</div>
            </div>
        </main>
    );
}
