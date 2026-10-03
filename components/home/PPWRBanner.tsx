import { Link } from '@/src/i18n/routing';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const copy: Record<string, { eyebrow: string; title: string; text: string; cta: string; slug: string }> = {
  tr: { eyebrow: 'Uyum ve teknik bilgi', title: 'PPWR 2025/40 için karton ambalaj yaklaşımımız', text: 'Geri dönüştürülebilir karton ambalaj, tedarikçi belgeleri ve izlenebilirlik sürecimizi inceleyin.', cta: 'Makaleyi incele', slug: 'ppwr-ab-2025-40-karton-ambalaj-uyum-yaklasimimiz' },
  en: { eyebrow: 'Compliance & technical information', title: 'Our carton packaging approach for PPWR 2025/40', text: 'Explore our recyclable carton packaging, supplier evidence and traceability process.', cta: 'Read the article', slug: 'ppwr-eu-2025-40-rotabil-carton-packaging-compliance' },
  de: { eyebrow: 'Compliance & technische Informationen', title: 'Unser Kartonverpackungs-Ansatz für PPWR 2025/40', text: 'Erfahren Sie mehr über recycelbare Kartonverpackungen, Lieferantennachweise und Rückverfolgbarkeit.', cta: 'Artikel lesen', slug: 'ppwr-eu-2025-40-rotabil-kartonverpackungs-konformitaet' },
  fr: { eyebrow: 'Conformité et informations techniques', title: 'Notre approche du carton pour le PPWR 2025/40', text: 'Découvrez nos emballages en carton recyclables, les preuves fournisseurs et la traçabilité.', cta: 'Lire l’article', slug: 'ppwr-ue-2025-40-conformite-emballage-carton-rotabil' },
  es: { eyebrow: 'Cumplimiento e información técnica', title: 'Nuestro enfoque del cartón para el PPWR 2025/40', text: 'Conozca nuestros envases de cartón reciclables, las evidencias de proveedores y la trazabilidad.', cta: 'Leer el artículo', slug: 'ppwr-ue-2025-40-enfoque-envases-carton-rotabil' },
  it: { eyebrow: 'Conformità e informazioni tecniche', title: 'Il nostro approccio al cartone per il PPWR 2025/40', text: 'Scoprite gli imballaggi in cartone riciclabili, le prove dei fornitori e la tracciabilità.', cta: 'Leggi l’articolo', slug: 'ppwr-ue-2025-40-approccio-imballaggi-cartone-rotabil' },
  ar: { eyebrow: 'الامتثال والمعلومات الفنية', title: 'نهجنا في عبوات الكرتون وفق PPWR 2025/40', text: 'اطلعوا على عبوات الكرتون القابلة لإعادة التدوير وأدلة الموردين ونظام التتبع لدينا.', cta: 'قراءة المقال', slug: 'ppwr-eu-2025-40-rotabil-carton-packaging-compliance-ar' },
};

export function PPWRBanner({ locale }: { locale: string }) {
  const item = copy[locale] ?? copy.en;
  return (
    <section className="container px-4 md:px-6 py-8" aria-label={item.title}>
      <div className="relative overflow-hidden rounded-2xl bg-[#092845] px-6 py-7 text-white shadow-lg md:px-10">
        <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border-[18px] border-orange-500/20" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-orange-300">
              <ShieldCheck className="h-4 w-4" /> {item.eyebrow}
            </div>
            <h2 className="text-2xl font-bold leading-tight md:text-3xl">{item.title}</h2>
            <p className="mt-2 text-slate-300">{item.text}</p>
          </div>
          <Link href={`/bilgi-bankasi/${item.slug}`} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-400">
            {item.cta}<ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
