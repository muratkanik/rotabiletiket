import { getSiteSettings } from '@/lib/settings';
import Script from 'next/script';

export async function SEOScripts() {
    const settings = await getSiteSettings('seo_scripts');

    if (!settings) return null;

    return (
        <>
            {/* Google Search Console Verification Meta */}
            {settings.google_search_console_verification && (
                <meta name="google-site-verification" content={settings.google_search_console_verification} />
            )}

            {/* Google Analytics (GA4) */}
            {settings.google_analytics_id && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_analytics_id}');
            `}
                    </Script>
                </>
            )}

            {/* Google Tag Manager (Head) */}
            {settings.google_tag_manager_id && (
                <Script id="gtm-head" strategy="afterInteractive">
                    {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
          `}
                </Script>
            )}

            {/* Custom Head Scripts (Caution: Raw HTML) */}
            {settings.custom_head_scripts && (
                <div dangerouslySetInnerHTML={{ __html: settings.custom_head_scripts }} />
            )}
        </>
    );
}

export async function SEOBodyScripts() {
    const settings = await getSiteSettings('seo_scripts');
    if (!settings?.google_tag_manager_id && !settings?.custom_body_scripts) return null;

    return (
        <>
            {/* Google Tag Manager (Body) */}
            {settings.google_tag_manager_id && (
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${settings.google_tag_manager_id}`}
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
            )}
            {/* Custom Body Scripts */}
            {settings.custom_body_scripts && (
                <div dangerouslySetInnerHTML={{ __html: settings.custom_body_scripts }} />
            )}
        </>
    )
}
