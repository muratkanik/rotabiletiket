import { createClient } from '@supabase/supabase-js';
import { HeroClient } from './HeroClient';

// Static client for public data to avoid DYNAMIC_SERVER_USAGE
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function Hero({ locale }: { locale: string }) {
    // Fetch slides and translations
    const { data: slides, error } = await supabase
        .from('hero_slides')
        .select(`
            *,
            hero_slide_translations (
                language_code,
                title,
                subtitle,
                badge_text,
                cta_primary_text,
                cta_primary_link,
                cta_secondary_text,
                cta_secondary_link
            )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error || !slides || slides.length === 0) {
        console.error('Hero slides fetch error:', error);
        return null;
    }

    // Process slides to inject correct translation
    const localizedSlides = slides.map((slide: any) => {
        const translation = slide.hero_slide_translations.find((t: any) => t.language_code === locale)
            || slide.hero_slide_translations.find((t: any) => t.language_code === 'tr') // Fallback to TR
            || slide.hero_slide_translations[0]; // Fallback to any

        return {
            ...slide,
            ...translation // Flatten translation fields into the slide object
        };
    });

    return (
        <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
            <HeroClient slides={localizedSlides} />
        </div >
    );
}
