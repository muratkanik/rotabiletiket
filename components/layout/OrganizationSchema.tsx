import { getSiteSettings } from '@/lib/settings';

export async function OrganizationSchema({ locale = 'tr' }: { locale?: string }) {
    const contactInfo = await getSiteSettings('contact_info');
    const seoSettings = await getSiteSettings('global_seo');

    const schema = {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness', 'Manufacturer'],
        name: 'Rotabil Etiket',
        alternateName: 'Rotabil Endüstriyel Barkod ve Etiket',
        url: 'https://www.rotabiletiket.com',
        logo: 'https://www.rotabiletiket.com/logo.png',
        image: seoSettings?.og_image_url || 'https://www.rotabiletiket.com/logo.png',
        description: locale === 'de' ? 'Hochwertige Etiketten, Barcode-Drucker und Farbbänder für industrielle Anwendungen.' : seoSettings?.default_description || 'Yüksek kaliteli etiket üretimi, barkod yazıcılar ve ribon çözümleri. Endüstriyel ihtiyaçlarınız için profesyonel çözüm ortağınız.',
        telephone: contactInfo?.phone || '+90 212 000 00 00',
        email: contactInfo?.email || 'info@rotabiletiket.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: contactInfo?.address || 'İstanbul',
            addressLocality: 'İstanbul',
            addressCountry: 'TR'
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: contactInfo?.phone || '+90 212 000 00 00',
            contactType: 'customer service',
            availableLanguage: locale === 'de' ? ['German', 'English'] : ['Turkish', 'English']
        },
        sameAs: [
            contactInfo?.social_media?.instagram,
            contactInfo?.social_media?.facebook,
            contactInfo?.social_media?.linkedin
        ].filter(Boolean)
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
