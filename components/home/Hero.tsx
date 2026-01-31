import { Button } from '@/components/ui/button';
import { getSiteSettings } from '@/lib/settings';
import { HeroClient } from './HeroClient'; // We'll move the framer-motion client stuff here

export async function Hero() {
    const settings = await getSiteSettings('hero_section');

    if (!settings) return null;

    return (
        <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Dynamic Background Video */}
                {settings.video_url?.endsWith('.mp4') ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-40 grayscale-[20%]"
                    >
                        <source src={settings.video_url} type="video/mp4" />
                    </video>
                ) : (
                    // Fallback to static image if not a video
                    <div className="absolute inset-0">
                        <img 
                            src={settings.video_url || '/img/products/printers/zebra_industrial_generic.png'} 
                            alt="Hero Background" 
                            className="w-full h-full object-cover opacity-30 grayscale-[20%]"
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <HeroClient settings={settings} />
            </div>
        </div >
    );
}
