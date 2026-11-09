import { NextResponse } from 'next/server';
import { approveDraftByReviewToken } from '@/lib/article-review';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
    const { token } = await context.params;
    const result = await approveDraftByReviewToken(token, 'E-posta onayı');
    const url = new URL(`/tr/bilgi-bankasi/review/${token}`, request.url);
    url.searchParams.set(result.ok ? 'approved' : 'error', result.ok ? '1' : (result.reason || 'Onay işlemi başarısız oldu.'));
    return NextResponse.redirect(url, 303);
}
