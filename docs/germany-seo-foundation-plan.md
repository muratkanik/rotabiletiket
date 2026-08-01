# Almanya Odaklı Teknik SEO ve B2B Dönüşüm Planı

Bu plan, Rotabil Etiket’i Almanya ve Avrupa’daki endüstriyel satın almacılara
ulaştırmak için hazırlanmıştır. Uygulama mevcut Next.js, next-intl ve Supabase
yapısını koruyarak küçük, doğrulanabilir adımlarla yapılacaktır.

## Çalışma ilkeleri

- Geliştirmeler yalnızca `codex/germany-seo-foundation` ve devam branch’lerinde yapılır.
- `main` üzerinde doğrudan geliştirme yapılmaz.
- Gerçek üretim kabiliyeti, test sonucu veya sertifika ile desteklenemeyen iddia yayınlanmaz.
- Almanca metinler makine çevirisi olarak değil, teknik satın almacı terminolojisiyle hazırlanır.
- Kullanıcı onayı olmadan stable promotion veya milestone oluşturulmaz.
- Uygulanmış Supabase migration dosyaları değiştirilmez; yeni değişiklikler yeni migration olarak eklenir.

## Faz 0 — Kanıt ve kapsam doğrulaması

- [ ] Gerçek üretim kabiliyetleri ve ihracat kapsamı listelenir.
- [ ] Yüksek sıcaklık, kimyasal dayanım ve RFID iddiaları için teknik kanıt matrisi hazırlanır.
- [ ] UL, BS 5609, GHS, GS1 ve DPP ifadelerinin kullanılabilirlik sınırları doğrulanır.
- [ ] Almanca teknik terim sözlüğü ve sayfa başına hedef arama amacı belirlenir.
- [ ] Her sayfa için sorumlu ürün, teknik kaynak ve son kontrol tarihi atanır.

## Faz 1 — Teknik içerik veri modeli

- [ ] Çözüm sayfalarının ürünlerden ve sektörlerden ayrışan içerik tipleri tanımlanır.
- [ ] Teknik alanlar standartlaştırılır: uygulama yüzeyi, sıcaklık, kimyasal maruziyet,
  baskı yöntemi, ribon, RFID/barkod, MOQ, teslim süresi ve dokümanlar.
- [ ] Almanca ve İngilizce içeriklerin locale, slug, canonical ve yayın durumları belirlenir.
- [ ] Teknik föy, test raporu ve sertifika dosyaları için güvenli Storage yapısı belirlenir.
- [ ] Admin panelinde teknik alanların yönetimi için minimum form kapsamı çıkarılır.

## Faz 2 — İlk ticari sayfa seti

İlk dalga 12 sayfadan oluşur; her sayfa gerçek teknik bilgi ve teklif CTA’sı taşır.

### Ana çözüm sayfaları

- [ ] Industrial Barcode Labels
- [ ] High Temperature Labels
- [ ] Chemical Resistant Labels
- [ ] RFID Label Solutions
- [ ] Asset Tracking Labels
- [ ] Custom Industrial Label Manufacturing

### Sektör sayfaları

- [ ] Steel Industry Labels
- [ ] Foundry and Metal Processing Labels
- [ ] Chemical Drum and IBC Labels
- [ ] Automotive Component Labels
- [ ] Warehouse and Logistics Labels
- [ ] Cold Storage and Freezer Labels

Her sayfada şu bölümler bulunur: problem, uygulama alanı, teknik seçim kriterleri,
malzeme/yapışkan seçenekleri, baskı ve kodlama yöntemi, sınırlamalar, dokümanlar,
ilgili ürünler, SSS ve teklif/numune CTA’sı.

## Faz 3 — Almanca B2B dönüşüm altyapısı

- [ ] Almanca teknik teklif formu hazırlanır.
- [ ] Numune talebi ayrı bir dönüşüm olarak desteklenir.
- [ ] Firma, ülke, sektör, yüzey, sıcaklık, kimyasal, miktar ve dosya yükleme alanları eklenir.
- [ ] Talepler Supabase’e kaydedilir ve admin tarafında filtrelenebilir hale getirilir.
- [ ] Form, e-posta, telefon, numune ve teknik föy indirme olayları ölçülür.
- [ ] Almanya sayfalarında “Angebot anfordern” ve “Muster anfordern” CTA’ları kullanılır.

## Faz 4 — Teknik SEO ve keşfedilebilirlik

- [ ] Locale bazlı canonical ve hreflang üretimi düzeltilir.
- [ ] Sitemap; Almanca çözüm, sektör, ürün ve makale URL’lerini doğru üretir.
- [ ] `Organization`, `Product`/`Service`, `BreadcrumbList` ve gerçek SSS yapılandırılmış verileri eklenir.
- [ ] Sayfa başlıkları, açıklamalar, Open Graph ve Twitter metadata’ları locale bazlı yapılır.
- [ ] Benzer veya kanıtsız sayfalar yayınlanmaz; gerekiyorsa birleştirilir.
- [ ] Almanya Search Console ve dönüşüm raporları tanımlanır.

## Faz 5 — Teknik otorite ve içerik kütüphanesi

- [ ] RFID vs Barcode: Which Technology Is Right for Your Operation?
- [ ] How to Select High Temperature Labels
- [ ] Chemical Drum Label Selection Guide
- [ ] Steel Traceability and Identification Guide
- [ ] RFID in Warehouse Automation
- [ ] Digital Product Passport Data Carriers
- [ ] On-Metal RFID: Material and Readability Considerations
- [ ] Thermal Transfer Ribbon Selection for Industrial Labels
- [ ] Automotive Component Identification Labels
- [ ] Cold Storage Label Durability Guide

## Faz 6 — Kanıt, vaka ve ölçekleme

- [ ] Gerçek müşteri izni olan vaka çalışmaları yayınlanır.
- [ ] Üretim, test ve paketleme süreçlerinden görsel kanıtlar eklenir.
- [ ] Teknik föy indirme ve numune taleplerinden gelen içerik boşlukları raporlanır.
- [ ] Sadece gerçek talep ve Search Console verisiyle 50+ sayfaya çıkılır.
- [ ] Zayıf, yinelenen veya dönüşüm üretmeyen sayfalar birleştirilir veya kaldırılır.

## İlk uygulama sırası

1. Teknik içerik modelini ve kanıt matrisini netleştir.
2. Almanca çözüm sayfası route ve metadata altyapısını ekle.
3. İlk üç çözüm sayfasını yayınlanabilir veriyle oluştur: yüksek sıcaklık,
   kimyasal dayanım ve RFID.
4. Almanca RFQ/numune talebi akışını ekle.
5. Sitemap, hreflang, structured data ve ölçümlemeyi doğrula.
6. Typecheck, lint, build ve smoke testleri çalıştır.

## Her adımın tamamlanma ölçütü

- İlgili sayfalar doğru locale URL’sinde açılır.
- Almanca sayfa Türkçe fallback’e sessizce düşmez; eksik içerik açıkça raporlanır.
- Teknik iddialar kanıt veya sınırlama ile birlikte gösterilir.
- CTA gerçek bir talep oluşturur ve admin tarafından izlenebilir.
- Canonical, hreflang, sitemap ve structured data birbirleriyle tutarlıdır.
- `git diff --check`, typecheck, lint ve production build başarılıdır.
