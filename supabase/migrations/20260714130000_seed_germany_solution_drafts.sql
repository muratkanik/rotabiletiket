-- Initial Germany-oriented solution drafts.
-- These remain unpublished until technical claims and supporting documents are verified.
INSERT INTO public.solution_pages (
    slug, page_kind, title, excerpt, content_html, technical_specs, proof_points,
    seo_title, seo_description, keywords, is_published, display_order
)
VALUES
(
    'yuksek-sicaklik-barkod-etiketleri',
    'solution',
    'Yüksek Sıcaklık Barkod Etiketleri',
    'Çelik, döküm ve metal işleme uygulamaları için uygulamaya özel yüksek sıcaklık etiket çözümleri.',
    '<h2>Uygulamaya özel yüksek sıcaklık etiketleri</h2><p>Bu çözüm sayfası, sıcaklık, yüzey, yağ, nem ve aşınma koşulları doğrulanarak hazırlanmalıdır. Etiket yapısı ve okunabilirlik her uygulama için ayrı test edilmelidir.</p>',
    '{"temperature_note":"Uygulamaya ve konstrüksiyona göre doğrulanmalıdır","applications":"Çelik, döküm, metal işleme","printing":"Termal transfer seçenekleri"}'::jsonb,
    '["Uygulamaya özel malzeme ve yapışkan seçimi","Barkod okunabilirliği için test planı","Teknik doğrulama olmadan yüksek sıcaklık garantisi verilmez"]'::jsonb,
    'High Temperature Barcode Labels | Rotabil Etiket',
    'Application-specific high temperature barcode labeling solutions for steel and metal processing.',
    'high temperature barcode labels, steel labels, industrial identification',
    false,
    10
),
(
    'kimyasala-dayanikli-fass-ve-ibc-etiketleri',
    'solution',
    'Kimyasala Dayanıklı Fıçı ve IBC Etiketleri',
    'Kimyasal fıçıları, IBC tankları ve zorlu dış ortamlar için yüzey ve kimyasal maruziyete göre seçilen etiket çözümleri.',
    '<h2>Kimyasal kaplar için dayanıklı etiketleme</h2><p>Kimyasal adı, maruziyet süresi, kap yüzeyi ve dış ortam koşulları doğrulanmadan bir dayanım standardı veya sertifika iddiası yayınlanmamalıdır.</p>',
    '{"applications":"Fıçı ve IBC tankları","surfaces":"HDPE, metal ve kaplamalı yüzeyler","compliance_note":"GHS ve BS 5609 kapsamı uygulamaya göre ayrıca doğrulanmalıdır"}'::jsonb,
    '["Yüzeye göre yapışkan seçimi","Değişken veri ve barkod baskısı","GHS/BS 5609 ifadeleri test ve belge kontrolü sonrasında kullanılmalıdır"]'::jsonb,
    'Chemical Drum and IBC Labels | Rotabil Etiket',
    'Chemical-resistant drum and IBC labeling solutions selected for the application surface and exposure conditions.',
    'chemical drum labels, IBC labels, chemical resistant labels, GHS labels',
    false,
    20
),
(
    'rfid-etiket-ve-kimliklendirme-cozumleri',
    'solution',
    'RFID Etiket ve Kimliklendirme Çözümleri',
    'Depo, varlık takibi ve endüstriyel izlenebilirlik uygulamaları için barkod ve RFID seçeneklerini birlikte değerlendiren çözümler.',
    '<h2>Barkod ve RFID seçeneklerini birlikte değerlendirin</h2><p>RFID etiketi seçimi; frekans, yüzey, okuma mesafesi, veri yapısı, encoding süreci ve okuyucu altyapısına göre yapılmalıdır.</p>',
    '{"technology":"UHF/RFID ve barkod seçenekleri","applications":"Depo, varlık ve endüstriyel izlenebilirlik","data_note":"Encoding ve veri modeli müşteri sistemine göre doğrulanmalıdır"}'::jsonb,
    '["Barkod ve RFID karşılaştırması","Yüzeye göre tag seçimi","Encoding ve entegrasyon kapsamı teklif öncesi netleştirilir"]'::jsonb,
    'RFID Label Solutions for Industrial Tracking | Rotabil Etiket',
    'Application-focused RFID and barcode identification solutions for warehouses and industrial traceability.',
    'RFID labels, UHF RFID, asset tracking labels, warehouse RFID',
    false,
    30
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.solution_page_translations (
    solution_page_id, language_code, slug, title, excerpt, content_html,
    seo_title, seo_description, keywords
)
SELECT id, 'de', 'hochtemperatur-barcode-etiketten',
    'Hochtemperatur-Barcode-Etiketten',
    'Anwendungsspezifische Etikettenlösungen für Stahl, Gießereien und die Metallverarbeitung.',
    '<h2>Hochtemperatur-Etiketten für industrielle Anwendungen</h2><p>Temperatur, Oberfläche, Öl, Feuchtigkeit und Abrieb müssen vor der Auswahl der Etikettenkonstruktion geprüft werden. Jede Anwendung benötigt eine technische Validierung.</p>',
    'Hochtemperatur-Barcode-Etiketten für die Stahlindustrie | Rotabil Etiket',
    'Anwendungsspezifische Hochtemperatur-Barcode-Etiketten für Stahl- und Metallverarbeitung.',
    'Hochtemperatur-Etiketten, Stahlindustrie, Barcode-Etiketten'
FROM public.solution_pages WHERE slug = 'yuksek-sicaklik-barkod-etiketleri'
ON CONFLICT (solution_page_id, language_code) DO NOTHING;

INSERT INTO public.solution_page_translations (
    solution_page_id, language_code, slug, title, excerpt, content_html,
    seo_title, seo_description, keywords
)
SELECT id, 'en', 'high-temperature-barcode-labels',
    'High Temperature Barcode Labels',
    'Application-specific labeling solutions for steel, foundries and metal processing.',
    '<h2>High temperature labeling for industrial applications</h2><p>Temperature, surface, oil, moisture and abrasion must be reviewed before selecting the label construction. Each application requires technical validation.</p>',
    'High Temperature Barcode Labels for Steel Industry | Rotabil Etiket',
    'Application-specific high temperature barcode labels for steel and metal processing.',
    'high temperature labels, steel industry labels, barcode labels'
FROM public.solution_pages WHERE slug = 'yuksek-sicaklik-barkod-etiketleri'
ON CONFLICT (solution_page_id, language_code) DO NOTHING;

INSERT INTO public.solution_page_translations (
    solution_page_id, language_code, slug, title, excerpt, content_html,
    seo_title, seo_description, keywords
)
SELECT id, 'de', 'chemikalienbestaendige-fass-ibc-etiketten',
    'Chemikalienbeständige Fass- und IBC-Etiketten',
    'Etikettenlösungen für Chemiefässer, IBC-Behälter und anspruchsvolle Außenbedingungen.',
    '<h2>Etiketten für chemische Behälter</h2><p>Chemikalie, Einwirkungsdauer, Behälteroberfläche und Außenbedingungen müssen vor jeder Beständigkeitsaussage geprüft werden.</p>',
    'Chemikalienbeständige Fass- und IBC-Etiketten | Rotabil Etiket',
    'Chemikalienbeständige Etikettenlösungen für Fässer und IBC-Behälter.',
    'Chemikalienbeständige Etiketten, Fass-Etiketten, IBC-Etiketten, GHS'
FROM public.solution_pages WHERE slug = 'kimyasala-dayanikli-fass-ve-ibc-etiketleri'
ON CONFLICT (solution_page_id, language_code) DO NOTHING;

INSERT INTO public.solution_page_translations (
    solution_page_id, language_code, slug, title, excerpt, content_html,
    seo_title, seo_description, keywords
)
SELECT id, 'en', 'chemical-drum-ibc-labels',
    'Chemical Drum and IBC Labels',
    'Labeling solutions for chemical drums, IBC tanks and demanding outdoor conditions.',
    '<h2>Labeling for chemical containers</h2><p>Chemical exposure, duration, container surface and outdoor conditions must be reviewed before making a durability or compliance claim.</p>',
    'Chemical Drum and IBC Labels | Rotabil Etiket',
    'Chemical-resistant labeling solutions for drums and IBC tanks.',
    'chemical drum labels, IBC labels, chemical resistant labels, GHS'
FROM public.solution_pages WHERE slug = 'kimyasala-dayanikli-fass-ve-ibc-etiketleri'
ON CONFLICT (solution_page_id, language_code) DO NOTHING;

INSERT INTO public.solution_page_translations (
    solution_page_id, language_code, slug, title, excerpt, content_html,
    seo_title, seo_description, keywords
)
SELECT id, 'de', 'rfid-etiketten-und-identifikationsloesungen',
    'RFID-Etiketten und Identifikationslösungen',
    'RFID- und Barcode-Lösungen für Lager, Anlagen und industrielle Rückverfolgbarkeit.',
    '<h2>Barcode und RFID gemeinsam bewerten</h2><p>Frequenz, Oberfläche, Lesereichweite, Datenstruktur, Encoding und Lesegeräte müssen vor der Auswahl geprüft werden.</p>',
    'RFID-Etiketten für industrielle Rückverfolgbarkeit | Rotabil Etiket',
    'Anwendungsspezifische RFID- und Barcode-Lösungen für Lager und industrielle Rückverfolgbarkeit.',
    'RFID-Etiketten, UHF RFID, Asset Tracking, Lager RFID'
FROM public.solution_pages WHERE slug = 'rfid-etiket-ve-kimliklendirme-cozumleri'
ON CONFLICT (solution_page_id, language_code) DO NOTHING;

INSERT INTO public.solution_page_translations (
    solution_page_id, language_code, slug, title, excerpt, content_html,
    seo_title, seo_description, keywords
)
SELECT id, 'en', 'rfid-label-identification-solutions',
    'RFID Label and Identification Solutions',
    'RFID and barcode options for warehouse, asset tracking and industrial traceability applications.',
    '<h2>Evaluate barcode and RFID together</h2><p>Frequency, surface, read range, data structure, encoding and reader infrastructure must be reviewed before selecting the tag.</p>',
    'RFID Label Solutions for Industrial Tracking | Rotabil Etiket',
    'Application-focused RFID and barcode identification solutions for warehouses and industrial traceability.',
    'RFID labels, UHF RFID, asset tracking labels, warehouse RFID'
FROM public.solution_pages WHERE slug = 'rfid-etiket-ve-kimliklendirme-cozumleri'
ON CONFLICT (solution_page_id, language_code) DO NOTHING;
