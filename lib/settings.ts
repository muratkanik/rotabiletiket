import { createClient } from '@/utils/supabase/server';

export async function getSiteSettings(key: string) {
    const supabase = createClient();
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
