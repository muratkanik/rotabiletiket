import { createHash, randomBytes } from 'crypto';
import { Resend } from 'resend';
import { createAdminClient } from '@/utils/supabase/admin';

export const ARTICLE_REVIEW_RECIPIENTS = ['serkan@rota1etiket.com', 'mkanik@gmail.com'];

export function createReviewToken() {
    const token = randomBytes(32).toString('hex');
    return { token, hash: hashReviewToken(token) };
}

export function hashReviewToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function getDraftByReviewToken(token: string) {
    const supabase = createAdminClient();
    if (!supabase || !token || !/^[a-f0-9]{64}$/i.test(token)) return null;
    const { data } = await supabase
        .from('articles')
        .select('id,title,slug,summary,content_html,seo_description,seo_score,seo_score_details,review_status,is_published,created_at,review_token_expires_at,reviewed_at,reviewed_by')
        .eq('review_token_hash', hashReviewToken(token))
        .maybeSingle();
    if (!data) return null;
    if (data.review_token_expires_at && new Date(data.review_token_expires_at).getTime() < Date.now()) return null;
    return data;
}

export async function approveDraftByReviewToken(token: string, reviewer: string) {
    const supabase = createAdminClient();
    const draft = await getDraftByReviewToken(token);
    if (!supabase || !draft) return { ok: false as const, reason: 'Taslak bulunamadı veya onay bağlantısının süresi doldu.' };
    if (draft.review_status === 'approved' && draft.is_published) return { ok: true as const, alreadyApproved: true };

    const { error } = await supabase.from('articles').update({
        is_published: true,
        published_at: new Date().toISOString(),
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer,
    }).eq('id', draft.id);
    if (error) return { ok: false as const, reason: error.message };
    return { ok: true as const, alreadyApproved: false };
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] || char));
}

export async function sendDraftReviewEmail(input: { token: string; title: string; summary?: string | null; seoScore?: number | null }) {
    if (!process.env.RESEND_API_KEY) {
        return { sent: false, error: 'RESEND_API_KEY tanımlı değil.' };
    }
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rotabiletiket.com').replace(/\/$/, '');
    const reviewUrl = `${siteUrl}/tr/bilgi-bankasi/review/${input.token}`;
    const title = escapeHtml(input.title);
    const summary = escapeHtml(input.summary || 'Yeni taslak makale inceleme için hazırlandı.');
    const score = input.seoScore == null ? 'Hesaplanmadı' : `${input.seoScore}/100`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
        from: process.env.REVIEW_EMAIL_FROM || 'Rotabil Etiket <info@rotabiletiket.com>',
        to: ARTICLE_REVIEW_RECIPIENTS,
        subject: `Yeni makale taslağı incelemede: ${input.title}`,
        html: `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:640px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0"><div style="background:#08233f;padding:28px 32px;color:#fff"><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#fb923c">Rotabil Etiket içerik sistemi</div><h1 style="margin:12px 0 0;font-size:25px">Yeni makale taslağı hazır</h1></div><div style="padding:32px"><h2 style="margin:0 0 12px">${title}</h2><p style="color:#475569;line-height:1.6">${summary}</p><p style="color:#475569"><strong>SEO skoru:</strong> ${score}</p><div style="margin:28px 0"><a href="${reviewUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;padding:13px 18px;margin-right:8px;font-weight:bold">Makaleyi Görüntüle</a><a href="${reviewUrl}?action=approve" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:bold">Onaylama Ekranını Aç</a></div><p style="font-size:12px;color:#64748b;line-height:1.5">Bu bağlantı taslağı admin paneline girmeden incelemek ve onaylamak içindir. Bağlantı 7 gün geçerlidir.</p></div></div></body></html>`,
    });
    return error ? { sent: false, error: error.message } : { sent: true, error: null };
}
