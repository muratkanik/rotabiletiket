import { createClient } from '@supabase/supabase-js';

// Use a static client for settings as they are public and needed for SSG
// This avoids using cookies()/headers() which would break static generation
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getSiteSettings(key: string) {
    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

    if (error) {
        console.error(`Error fetching settings for ${key}:`, error);
        return null;
    }

    return data?.value || null;
}
