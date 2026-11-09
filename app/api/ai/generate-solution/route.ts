import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { generateSolutionContent } from '@/lib/ai/solution-generator';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = createAdminClient();
        if (!supabase) return NextResponse.json({ error: 'Supabase admin yapılandırması eksik.' }, { status: 500 });
        const { data: settings } = await supabase.from('meta_settings').select('openai_api_key, serper_api_key, gemini_api_key, xai_api_key').single();
        const result = await generateSolutionContent(String(body.keywords || ''), settings || {});
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'AI önerisi oluşturulamadı.' }, { status: 500 });
    }
}
