'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/src/i18n/routing';
import { ArrowRight, FileText, ShieldAlert, X } from 'lucide-react';

const ANNOUNCEMENT_VERSION = 'ppwr-supplier-announcement-2026-07-23';

type AnnouncementCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  effectiveDate: string;
  limitsTitle: string;
  limits: string[];
  action: string;
  pastDeadline: string;
  note: string;
  articleCta: string;
  documentsCta: string;
  close: string;
  dontShowAgain: string;
  articleSlug: string;
};

const copy: Record<string, AnnouncementCopy> = {
  tr: {
    eyebrow: 'Tedarikçi uyumluluk duyurusu',
    title: 'PPWR (AB) 2025/40 hakkında önemli bilgilendirme',
    intro: 'Ambalaj ve Ambalaj Atıklarına ilişkin PPWR, Avrupa Birliği genelinde 12 Ağustos 2026 tarihinde uygulanmaya başlayacaktır. Karton ambalaj ve etiket malzemelerinin seçimi, belgelenmesi ve izlenebilirliği bu sürecin önemli parçalarıdır.',
    effectiveDate: 'Uygulama tarihi: 12 Ağustos 2026',
    limitsTitle: 'Öne çıkan Madde 5 başlıkları',
    limits: ['Ambalaj bileşeni başına kurşun, kadmiyum, cıva ve hekzavalent krom toplamı 100 mg/kg sınırını aşmamalıdır.', 'Gıda ile temas eden ambalajlarda PFAS limitleri ve uygunluk değerlendirmeleri dikkate alınmalıdır.'],
    action: 'Güncel yazılı uyumluluk beyanınız veya uygunluk belgeniz bulunmuyorsa lütfen info@rotabiletiket.com adresinden bizimle iletişime geçin.',
    pastDeadline: 'Tedarikçi yazısında yer alan 20 Temmuz 2026 belge iletim tarihi geçmiştir; bu tarih Rotabil tarafından belirlenmiş yeni bir son tarih değildir.',
    note: 'Bu içerik genel bilgilendirme amacı taşır; hukuki danışmanlık veya tek başına uygunluk belgesi değildir. Nihai değerlendirme, güncel mevzuat, ürün bileşimi ve kullanım koşullarına göre yapılmalıdır.',
    articleCta: 'PPWR makalesini incele',
    documentsCta: 'Çevrilmiş teknik içerikleri oku',
    close: 'Duyuruyu kapat',
    dontShowAgain: 'Bir daha gösterme',
    articleSlug: 'ppwr-ab-2025-40-karton-ambalaj-uyum-yaklasimimiz',
  },
  en: {
    eyebrow: 'Supplier compliance announcement',
    title: 'Important information about PPWR (EU) 2025/40',
    intro: 'The Packaging and Packaging Waste Regulation (PPWR) will apply across the European Union from 12 August 2026. The selection, documentation and traceability of carton packaging and label materials are important parts of this process.',
    effectiveDate: 'Application date: 12 August 2026',
    limitsTitle: 'Key Article 5 topics',
    limits: ['The combined concentration of lead, cadmium, mercury and hexavalent chromium must not exceed 100 mg/kg per packaging component.', 'PFAS limits and conformity assessments must be considered for food-contact packaging.'],
    action: 'If you do not have a current written compliance statement or certificate, please contact us at info@rotabiletiket.com.',
    pastDeadline: 'The 20 July 2026 document date stated in the supplier letter has passed; it is not a new deadline set by Rotabil.',
    note: 'This content is for general information only; it is not legal advice or a standalone certificate of compliance. Final assessment depends on current legislation, product composition and conditions of use.',
    articleCta: 'Read the PPWR article',
    documentsCta: 'Read the translated technical content',
    close: 'Close announcement',
    dontShowAgain: 'Do not show again',
    articleSlug: 'ppwr-eu-2025-40-rotabil-carton-packaging-compliance',
  },
  de: {
    eyebrow: 'Lieferanten-Compliance-Mitteilung',
    title: 'Wichtige Informationen zur PPWR (EU) 2025/40',
    intro: 'Die Verordnung über Verpackungen und Verpackungsabfälle (PPWR) gilt ab dem 12. August 2026 in der gesamten Europäischen Union. Auswahl, Dokumentation und Rückverfolgbarkeit von Kartonverpackungen und Etikettenmaterialien sind wichtige Bestandteile dieses Prozesses.',
    effectiveDate: 'Anwendungsdatum: 12. August 2026',
    limitsTitle: 'Wichtige Themen aus Artikel 5',
    limits: ['Die Summe aus Blei, Cadmium, Quecksilber und sechswertigem Chrom darf je Verpackungskomponente 100 mg/kg nicht überschreiten.', 'Für Lebensmittelkontaktverpackungen sind PFAS-Grenzwerte und Konformitätsbewertungen zu berücksichtigen.'],
    action: 'Wenn keine aktuelle schriftliche Konformitätserklärung oder Bescheinigung vorliegt, kontaktieren Sie uns bitte unter info@rotabiletiket.com.',
    pastDeadline: 'Das im Lieferantenschreiben genannte Datum 20. Juli 2026 ist verstrichen; es handelt sich nicht um eine von Rotabil gesetzte neue Frist.',
    note: 'Diese Informationen dienen ausschließlich der allgemeinen Orientierung und sind keine Rechtsberatung oder eigenständige Konformitätsbescheinigung. Die abschließende Bewertung hängt von aktueller Gesetzgebung, Produktzusammensetzung und Verwendungsbedingungen ab.',
    articleCta: 'PPWR-Artikel lesen',
    documentsCta: 'Übersetzte technische Inhalte lesen',
    close: 'Mitteilung schließen',
    dontShowAgain: 'Nicht mehr anzeigen',
    articleSlug: 'ppwr-eu-2025-40-rotabil-kartonverpackungs-konformitaet',
  },
  fr: {
    eyebrow: 'Avis de conformité fournisseurs',
    title: 'Informations importantes sur le PPWR (UE) 2025/40',
    intro: 'Le règlement relatif aux emballages et aux déchets d’emballages (PPWR) s’appliquera dans toute l’Union européenne à partir du 12 août 2026. Le choix, la documentation et la traçabilité des emballages carton et des matériaux d’étiquettes sont des éléments importants de cette démarche.',
    effectiveDate: 'Date d’application : 12 août 2026',
    limitsTitle: 'Points clés de l’article 5',
    limits: ['La somme du plomb, du cadmium, du mercure et du chrome hexavalent ne doit pas dépasser 100 mg/kg par composant d’emballage.', 'Les limites PFAS et les évaluations de conformité doivent être prises en compte pour les emballages au contact des denrées alimentaires.'],
    action: 'Si vous ne disposez pas d’une déclaration ou d’un certificat de conformité écrit et à jour, contactez-nous à info@rotabiletiket.com.',
    pastDeadline: 'La date du 20 juillet 2026 indiquée dans la lettre fournisseur est dépassée ; il ne s’agit pas d’une nouvelle échéance fixée par Rotabil.',
    note: 'Ces informations sont générales et ne constituent ni un conseil juridique ni un certificat de conformité autonome. L’évaluation finale dépend de la législation en vigueur, de la composition du produit et des conditions d’utilisation.',
    articleCta: 'Lire l’article PPWR',
    documentsCta: 'Lire le contenu technique traduit',
    close: 'Fermer l’avis',
    dontShowAgain: 'Ne plus afficher',
    articleSlug: 'ppwr-ue-2025-40-conformite-emballage-carton-rotabil',
  },
  es: {
    eyebrow: 'Aviso de cumplimiento para proveedores',
    title: 'Información importante sobre el PPWR (UE) 2025/40',
    intro: 'El Reglamento sobre envases y residuos de envases (PPWR) se aplicará en toda la Unión Europea a partir del 12 de agosto de 2026. La selección, documentación y trazabilidad de los envases de cartón y materiales de etiquetas son partes importantes de este proceso.',
    effectiveDate: 'Fecha de aplicación: 12 de agosto de 2026',
    limitsTitle: 'Temas destacados del artículo 5',
    limits: ['La concentración total de plomo, cadmio, mercurio y cromo hexavalente no debe superar 100 mg/kg por componente del envase.', 'En los envases destinados al contacto alimentario deben considerarse los límites de PFAS y las evaluaciones de conformidad.'],
    action: 'Si no dispone de una declaración o certificado de conformidad escrito y vigente, póngase en contacto con nosotros en info@rotabiletiket.com.',
    pastDeadline: 'La fecha del 20 de julio de 2026 indicada en la carta del proveedor ya ha pasado; no es un nuevo plazo establecido por Rotabil.',
    note: 'Este contenido es meramente informativo; no constituye asesoramiento jurídico ni un certificado de conformidad independiente. La evaluación final depende de la legislación vigente, la composición del producto y las condiciones de uso.',
    articleCta: 'Leer el artículo PPWR',
    documentsCta: 'Leer el contenido técnico traducido',
    close: 'Cerrar aviso',
    dontShowAgain: 'No volver a mostrar',
    articleSlug: 'ppwr-ue-2025-40-enfoque-envases-carton-rotabil',
  },
  it: {
    eyebrow: 'Avviso di conformità per i fornitori',
    title: 'Informazioni importanti sul PPWR (UE) 2025/40',
    intro: 'Il regolamento sugli imballaggi e sui rifiuti di imballaggio (PPWR) si applicherà in tutta l’Unione europea dal 12 agosto 2026. La selezione, la documentazione e la tracciabilità degli imballaggi in cartone e dei materiali per etichette sono parti importanti di questo processo.',
    effectiveDate: 'Data di applicazione: 12 agosto 2026',
    limitsTitle: 'Temi principali dell’articolo 5',
    limits: ['La concentrazione complessiva di piombo, cadmio, mercurio e cromo esavalente non deve superare 100 mg/kg per componente dell’imballaggio.', 'Per gli imballaggi a contatto con alimenti devono essere considerati i limiti PFAS e le valutazioni di conformità.'],
    action: 'Se non disponete di una dichiarazione o di un certificato di conformità scritto e aggiornato, contattateci all’indirizzo info@rotabiletiket.com.',
    pastDeadline: 'La data del 20 luglio 2026 indicata nella lettera del fornitore è trascorsa; non è una nuova scadenza stabilita da Rotabil.',
    note: 'Queste informazioni sono di carattere generale e non costituiscono consulenza legale né un certificato di conformità autonomo. La valutazione finale dipende dalla normativa vigente, dalla composizione del prodotto e dalle condizioni d’uso.',
    articleCta: 'Leggi l’articolo PPWR',
    documentsCta: 'Leggi i contenuti tecnici tradotti',
    close: 'Chiudi avviso',
    dontShowAgain: 'Non mostrare più',
    articleSlug: 'ppwr-ue-2025-40-approccio-imballaggi-cartone-rotabil',
  },
  ar: {
    eyebrow: 'إشعار امتثال للموردين',
    title: 'معلومات مهمة حول اللائحة PPWR (الاتحاد الأوروبي) 2025/40',
    intro: 'سيبدأ تطبيق لائحة التغليف ونفايات التغليف (PPWR) في جميع أنحاء الاتحاد الأوروبي اعتباراً من 12 أغسطس 2026. ويُعد اختيار وتوثيق وتتبع عبوات الكرتون ومواد الملصقات جزءاً مهماً من هذه العملية.',
    effectiveDate: 'تاريخ التطبيق: 12 أغسطس 2026',
    limitsTitle: 'أبرز موضوعات المادة 5',
    limits: ['يجب ألا يتجاوز مجموع الرصاص والكادميوم والزئبق والكروم سداسي التكافؤ 100 ملغم/كغم لكل مكوّن من مكونات التغليف.', 'يجب مراعاة حدود PFAS وتقييمات المطابقة في عبوات ملامسة الأغذية.'],
    action: 'إذا لم تتوفر لديكم إقرار أو شهادة مطابقة مكتوبة وسارية، يرجى التواصل معنا عبر info@rotabiletiket.com.',
    pastDeadline: 'لقد انقضى تاريخ 20 يوليو 2026 المذكور في خطاب المورد؛ وهو ليس موعداً نهائياً جديداً تحدده روتابيل.',
    note: 'هذه المعلومات عامة وليست استشارة قانونية أو شهادة مطابقة مستقلة. يعتمد التقييم النهائي على التشريعات السارية وتركيبة المنتج وشروط الاستخدام.',
    articleCta: 'قراءة مقال PPWR',
    documentsCta: 'قراءة المحتوى الفني المترجم',
    close: 'إغلاق الإشعار',
    dontShowAgain: 'عدم العرض مرة أخرى',
    articleSlug: 'ppwr-eu-2025-40-rotabil-carton-packaging-compliance-ar',
  },
};

export default function PPWRAnnouncement({ locale, enabled = false }: { locale: string; enabled?: boolean }) {
  const item = copy[locale] ?? copy.en;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      return;
    }
    try {
      setOpen(window.localStorage.getItem(ANNOUNCEMENT_VERSION) !== 'dismissed');
    } catch {
      setOpen(true);
    }
  }, [enabled]);

  if (!enabled || !open) return null;

  const dismiss = (remember = false) => {
    if (remember) {
      try {
        window.localStorage.setItem(ANNOUNCEMENT_VERSION, 'dismissed');
      } catch {
        // The announcement can still be dismissed for the current render.
      }
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 p-4" role="dialog" aria-modal="true" aria-labelledby="ppwr-announcement-title" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl md:p-8">
        <button type="button" onClick={() => dismiss()} aria-label={item.close} className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 rtl:left-4 rtl:right-auto">
          <X className="h-5 w-5" />
        </button>
        <div className="pr-8 rtl:pl-8 rtl:pr-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-orange-700">
            <ShieldAlert className="h-4 w-4" /> {item.eyebrow}
          </div>
          <h2 id="ppwr-announcement-title" className="text-2xl font-bold leading-tight text-[#092845] md:text-3xl">{item.title}</h2>
          <p className="mt-4 leading-7 text-slate-600">{item.intro}</p>
          <p className="mt-4 rounded-lg bg-[#092845] px-4 py-3 font-semibold text-white">{item.effectiveDate}</p>
          <h3 className="mt-6 text-lg font-bold text-[#092845]">{item.limitsTitle}</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 rtl:pr-5 rtl:pl-0">
            {item.limits.map((limit) => <li key={limit}>{limit}</li>)}
          </ul>
          <p className="mt-5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-950">{item.action}</p>
          <p className="mt-4 text-sm leading-6 text-slate-500">{item.pastDeadline}</p>
          <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">{item.note}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/bilgi-bankasi/${item.articleSlug}`} className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">
              {item.articleCta}<ArrowRight className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0" />
            </Link>
            <Link href={`/bilgi-bankasi/${item.articleSlug}#translated-source-documents`} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-[#092845] transition hover:bg-slate-50">
              <FileText className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />{item.documentsCta}
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="button" onClick={() => dismiss()} className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-[#092845]">{item.close}</button>
            <button type="button" onClick={() => dismiss(true)} className="text-sm font-semibold text-[#092845] underline underline-offset-4 hover:text-orange-600">{item.dontShowAgain}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
