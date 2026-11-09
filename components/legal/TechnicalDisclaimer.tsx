import { AlertTriangle } from 'lucide-react';

type SupportedLocale = 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'es' | 'it';

const copy: Record<SupportedLocale, { title: string; body: string }> = {
    tr: {
        title: 'Bilgilendirme ve sorumluluk notu',
        body: 'Bu sayfadaki teknik bilgiler yalnızca genel bilgilendirme amacıyla sunulmuştur; hukuki, mevzuata ilişkin veya uygulamaya özel profesyonel danışmanlık niteliği taşımaz. Performans ve uygunluk; malzeme, yüzey, sıcaklık, kimyasal maruziyet, baskı yöntemi ve gerçek kullanım koşullarına göre değişebilir. Sipariş, üretim veya uygulama öncesinde güncel teknik föylerin, uygunluk belgelerinin ve uygulama test sonuçlarının yetkin kişilerce doğrulanması gerekir. Yürürlükteki emredici mevzuat ve sözleşmeden doğan haklar saklıdır.',
    },
    en: {
        title: 'Information and responsibility notice',
        body: 'The technical information on this page is provided for general guidance only and does not constitute legal, regulatory or application-specific professional advice. Performance and suitability may vary depending on the material, surface, temperature, chemical exposure, printing method and actual conditions of use. Before ordering, production or application, current technical data sheets, compliance documents and application test results should be verified by qualified persons. Mandatory applicable law and contractual rights remain unaffected.',
    },
    de: {
        title: 'Hinweis zu Informationen und Verantwortung',
        body: 'Die technischen Angaben auf dieser Seite dienen ausschließlich der allgemeinen Orientierung und stellen keine Rechts-, Konformitäts- oder anwendungsspezifische Fachberatung dar. Leistung und Eignung können je nach Material, Oberfläche, Temperatur, Chemikalieneinwirkung, Druckverfahren und tatsächlichen Einsatzbedingungen variieren. Vor Bestellung, Produktion oder Anwendung sind aktuelle technische Datenblätter, Konformitätsunterlagen und Prüfergebnisse unter realen Bedingungen durch qualifizierte Personen zu überprüfen. Zwingende gesetzliche Vorschriften und vertragliche Rechte bleiben unberührt.',
    },
    fr: {
        title: 'Avis d’information et de responsabilité',
        body: 'Les informations techniques présentées sur cette page sont fournies à titre indicatif uniquement et ne constituent pas un conseil juridique, réglementaire ou professionnel spécifique à une application. Les performances et l’aptitude peuvent varier selon le matériau, la surface, la température, l’exposition aux produits chimiques, le procédé d’impression et les conditions réelles d’utilisation. Avant toute commande, production ou application, les fiches techniques, documents de conformité et résultats d’essais dans les conditions réelles doivent être vérifiés par des personnes qualifiées. Les dispositions légales impératives et les droits contractuels restent applicables.',
    },
    ar: {
        title: 'إشعار المعلومات والمسؤولية',
        body: 'تُقدَّم المعلومات الفنية الواردة في هذه الصفحة لأغراض إرشادية عامة فقط، ولا تُعد استشارة قانونية أو تنظيمية أو مهنية خاصة بالتطبيق. قد يختلف الأداء والملاءمة بحسب المادة والسطح ودرجة الحرارة والتعرض للمواد الكيميائية وطريقة الطباعة وظروف الاستخدام الفعلية. قبل الطلب أو الإنتاج أو التطبيق، يجب التحقق من أحدث النشرات الفنية ووثائق المطابقة ونتائج الاختبارات في ظروف الاستخدام الفعلية من قبل أشخاص مؤهلين. تظل الأحكام القانونية الإلزامية والحقوق التعاقدية سارية.',
    },
    es: {
        title: 'Aviso de información y responsabilidad',
        body: 'La información técnica de esta página se proporciona únicamente como orientación general y no constituye asesoramiento jurídico, normativo ni profesional específico para una aplicación. El rendimiento y la idoneidad pueden variar según el material, la superficie, la temperatura, la exposición química, el método de impresión y las condiciones reales de uso. Antes de realizar un pedido, producir o aplicar el producto, personas cualificadas deben verificar las fichas técnicas vigentes, los documentos de conformidad y los resultados de las pruebas en condiciones reales. Las disposiciones legales imperativas y los derechos contractuales permanecen intactos.',
    },
    it: {
        title: 'Avviso informativo e di responsabilità',
        body: 'Le informazioni tecniche riportate in questa pagina sono fornite esclusivamente a titolo di orientamento generale e non costituiscono consulenza legale, normativa o professionale specifica per un’applicazione. Le prestazioni e l’idoneità possono variare in base al materiale, alla superficie, alla temperatura, all’esposizione chimica, al metodo di stampa e alle condizioni effettive d’uso. Prima dell’ordine, della produzione o dell’applicazione, persone qualificate devono verificare le schede tecniche aggiornate, i documenti di conformità e i risultati delle prove in condizioni reali. Restano impregiudicate le disposizioni di legge imperative e i diritti contrattuali.',
    },
};

export function TechnicalDisclaimer({ locale = 'tr' }: { locale?: string }) {
    const content = copy[(locale in copy ? locale : 'tr') as SupportedLocale];

    return (
        <aside role="note" className="not-prose my-8 rounded-xl border-2 border-red-200 border-l-4 border-l-red-600 bg-red-50 p-4 text-red-950 shadow-sm">
            <div className="flex gap-3">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                    <h2 className="font-bold text-red-800">{content.title}</h2>
                    <p className="mt-2 text-sm leading-6">{content.body}</p>
                </div>
            </div>
        </aside>
    );
}
