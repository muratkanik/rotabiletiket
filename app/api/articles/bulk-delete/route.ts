import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { articleIds } = await req.json();

        if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
            return NextResponse.json({ error: 'Makale ID listesi eksik.' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check if user is authenticated (admin)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
        }

        // Supabase will automatically delete related translations if foreign keys have ON DELETE CASCADE
        // Otherwise, we might need to delete translations first.
        // Let's assume there is ON DELETE CASCADE, but just in case, let's delete translations first.
        
        // Delete translations
        await supabase
            .from('article_translations')
            .delete()
            .in('article_id', articleIds);

        // Delete articles
        const { error: deleteError } = await supabase
            .from('articles')
            .delete()
            .in('id', articleIds);

        if (deleteError) {
            console.error('Bulk delete error:', deleteError);
            throw new Error(deleteError.message);
        }

        return NextResponse.json({ success: true, message: `${articleIds.length} makale başarıyla silindi.` });

    } catch (error: any) {
        console.error('Bulk delete API error:', error);
        return NextResponse.json({ error: error.message || 'Silme işlemi başarısız oldu.' }, { status: 500 });
    }
}
