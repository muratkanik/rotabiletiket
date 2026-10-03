-- Forward-only technical data foundation.
-- Supplier data is deliberately review-gated and is never public by default.

DO $$ BEGIN
    CREATE TYPE public.supplier_material_status AS ENUM (
        'DRAFT', 'AUTO_DISCOVERED', 'REVIEW_REQUIRED', 'VERIFIED',
        'REJECTED', 'OUTDATED', 'ARCHIVED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.technical_document_type AS ENUM (
        'TECHNICAL_DATASHEET', 'DECLARATION', 'COMPLIANCE', 'SUSTAINABILITY',
        'CERTIFICATE', 'APPLICATION_GUIDE', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    website TEXT,
    country TEXT,
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    supplier_product_name TEXT NOT NULL,
    supplier_product_code TEXT,
    construction_code TEXT,
    face_material_name TEXT,
    face_material_type TEXT,
    face_material_code TEXT,
    adhesive_name TEXT,
    adhesive_code TEXT,
    adhesive_type TEXT,
    liner_name TEXT,
    liner_code TEXT,
    source_url TEXT,
    datasheet_url TEXT,
    source_document_title TEXT,
    source_document_date DATE,
    source_document_version TEXT,
    source_language TEXT,
    source_accessed_at TIMESTAMPTZ,
    source_last_checked_at TIMESTAMPTZ,
    status public.supplier_material_status NOT NULL DEFAULT 'DRAFT',
    confidence_score NUMERIC(5,2) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)),
    requires_manual_review BOOLEAN NOT NULL DEFAULT TRUE,
    review_notes TEXT,
    internal_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (supplier_id, supplier_product_code)
);

CREATE TABLE IF NOT EXISTS public.supplier_material_technical_data (
    supplier_material_id UUID PRIMARY KEY REFERENCES public.supplier_materials(id) ON DELETE CASCADE,
    basis_weight NUMERIC,
    basis_weight_unit TEXT,
    caliper NUMERIC,
    caliper_unit TEXT,
    opacity NUMERIC,
    brightness NUMERIC,
    gloss NUMERIC,
    roughness NUMERIC,
    tensile_strength_md NUMERIC,
    tensile_strength_cd NUMERIC,
    tensile_strength_unit TEXT,
    face_stock_description TEXT,
    print_methods TEXT,
    adhesive_technology TEXT,
    adhesive_permanence TEXT,
    minimum_application_temperature NUMERIC,
    minimum_application_temperature_unit TEXT,
    service_temperature_min NUMERIC,
    service_temperature_max NUMERIC,
    service_temperature_unit TEXT,
    initial_tack NUMERIC,
    initial_tack_unit TEXT,
    low_energy_surface_suitability BOOLEAN,
    curved_surface_suitability BOOLEAN,
    moisture_resistance BOOLEAN,
    water_resistance BOOLEAN,
    oil_resistance BOOLEAN,
    chemical_resistance BOOLEAN,
    uv_resistance BOOLEAN,
    freezer_suitability BOOLEAN,
    food_contact_suitability BOOLEAN,
    pharmaceutical_suitability BOOLEAN,
    direct_food_contact TEXT,
    sustainability_claims TEXT,
    certifications TEXT,
    recycling_information TEXT,
    storage_conditions TEXT,
    shelf_life TEXT,
    printability TEXT,
    approvals TEXT,
    regulatory_information TEXT,
    raw_extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
    disclaimer TEXT,
    last_verified_at TIMESTAMPTZ,
    reviewed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_material_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_material_id UUID NOT NULL REFERENCES public.supplier_materials(id) ON DELETE RESTRICT,
    variant_name TEXT NOT NULL,
    use_case TEXT,
    notes TEXT,
    width_mm NUMERIC,
    height_mm NUMERIC,
    core_mm NUMERIC,
    winding TEXT,
    print_technology TEXT,
    color TEXT,
    minimum_order_quantity TEXT,
    lead_time TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    status public.supplier_material_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.technical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    supplier_material_id UUID REFERENCES public.supplier_materials(id) ON DELETE CASCADE,
    document_type public.technical_document_type NOT NULL DEFAULT 'OTHER',
    title TEXT NOT NULL,
    original_url TEXT,
    storage_path TEXT,
    language_code TEXT,
    version TEXT,
    document_date DATE,
    checksum TEXT,
    status public.supplier_material_status NOT NULL DEFAULT 'REVIEW_REQUIRED',
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (supplier_id IS NOT NULL OR supplier_material_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.technical_data_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    previous_data JSONB,
    new_data JSONB,
    source TEXT,
    performed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS supplier_materials_status_idx ON public.supplier_materials(status);
CREATE INDEX IF NOT EXISTS supplier_materials_supplier_idx ON public.supplier_materials(supplier_id);
CREATE INDEX IF NOT EXISTS technical_documents_material_idx ON public.technical_documents(supplier_material_id);
CREATE INDEX IF NOT EXISTS product_material_variants_product_idx ON public.product_material_variants(product_id);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_material_technical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_material_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_data_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads verified supplier materials" ON public.supplier_materials
    FOR SELECT USING (is_active AND status = 'VERIFIED');
CREATE POLICY "Public reads verified technical data" ON public.supplier_material_technical_data
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.supplier_materials sm
        WHERE sm.id = supplier_material_id AND sm.is_active AND sm.status = 'VERIFIED'
    ));
CREATE POLICY "Public reads active suppliers" ON public.suppliers
    FOR SELECT USING (is_active AND EXISTS (
        SELECT 1 FROM public.supplier_materials sm
        WHERE sm.supplier_id = suppliers.id AND sm.is_active AND sm.status = 'VERIFIED'
    ));
CREATE POLICY "Public reads verified variants" ON public.product_material_variants
    FOR SELECT USING (status = 'VERIFIED' AND EXISTS (
        SELECT 1 FROM public.supplier_materials sm
        WHERE sm.id = supplier_material_id AND sm.is_active AND sm.status = 'VERIFIED'
    ));
CREATE POLICY "Public reads verified documents" ON public.technical_documents
    FOR SELECT USING (status = 'VERIFIED' AND EXISTS (
        SELECT 1 FROM public.supplier_materials sm
        WHERE sm.id = supplier_material_id AND sm.is_active AND sm.status = 'VERIFIED'
    ));

CREATE POLICY "Authenticated technical data access" ON public.suppliers
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated material access" ON public.supplier_materials
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated technical values access" ON public.supplier_material_technical_data
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated variant access" ON public.product_material_variants
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated document access" ON public.technical_documents
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated audit access" ON public.technical_data_audit_logs
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

INSERT INTO public.suppliers (name, slug, website, country, description)
VALUES (
    'UPM Raflatac',
    'upm-raflatac',
    'https://www.upmraflatac.com',
    'Finland',
    'Rotabil teknik veri kataloğunda kaynak olarak kullanılan üretici bilgileri. Bu kayıt distribütörlük, yetkili satıcılık veya resmî partnerlik iddiası oluşturmaz.'
)
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

WITH supplier AS (SELECT id FROM public.suppliers WHERE slug = 'upm-raflatac')
INSERT INTO public.supplier_materials (
    supplier_id, supplier_product_name, supplier_product_code, construction_code,
    face_material_name, face_material_type, adhesive_name, adhesive_code,
    adhesive_type, liner_name, liner_code, source_url, datasheet_url,
    source_document_title, source_document_date, source_document_version,
    source_language, source_accessed_at, source_last_checked_at, status,
    confidence_score, requires_manual_review, review_notes, internal_notes
)
SELECT supplier.id, v.product_name, v.product_code, v.product_code,
       v.face_name, v.face_type, v.adhesive_name, v.adhesive_code,
       v.adhesive_type, v.liner_name, v.liner_code,
       'https://tools.upmraflatac.com/PRT/s/?language=en_US',
       'https://tools.upmraflatac.com/PRT/s/?language=en_US',
       v.document_title, v.document_date::date, v.document_version, 'en', NOW(), NOW(),
       'REVIEW_REQUIRED', 85, TRUE,
       'Yerel TIS belgesinden çıkarıldı; yayın öncesi teknik ekip ve güncel resmi kaynak karşılaştırması gerekir.',
       'Kaynak PDF proje docs klasöründedir; PDF kamuya otomatik açılmaz.'
FROM supplier
CROSS JOIN (VALUES
    ('PHARMATIGHT', 'DCX', 'PHARMATIGHT', 'paper', NULL, NULL, NULL, 'HONEY GLASSINE 65', '03', 'TIS - PHARMATIGHT - DCX - English - SI', '2022-02-20', '20-02-2022 EN SI'),
    ('RP31 PURUS', 'R31P', NULL, NULL, 'RP31 PURUS', 'R31P', 'permanent', NULL, NULL, 'TIS - RP31 PURUS - R31P - English - SI', '2024-11-25', '25-11-2024 EN SI'),
    ('HONEY GLASSINE 65', '03', NULL, 'glassine backing paper', NULL, NULL, NULL, 'HONEY GLASSINE 65', '03', 'TIS - HONEY GLASSINE 65 - 03 - English - SI', '2024-06-03', '03-06-2024 EN SI')
) AS v(product_name, product_code, face_name, face_type, adhesive_name, adhesive_code, adhesive_type, liner_name, liner_code, document_title, document_date, document_version)
ON CONFLICT (supplier_id, supplier_product_code) DO UPDATE SET
    source_document_title = EXCLUDED.source_document_title,
    source_document_date = EXCLUDED.source_document_date,
    source_document_version = EXCLUDED.source_document_version,
    source_last_checked_at = NOW(),
    updated_at = NOW();

INSERT INTO public.supplier_material_technical_data (supplier_material_id, basis_weight, basis_weight_unit, caliper, caliper_unit, brightness, roughness, opacity, gloss, face_stock_description, printability, pharmaceutical_suitability, raw_extracted_data, source_references, disclaimer)
SELECT id, 45, 'g/m²', 39, 'µm', 90, 1.5, 86, 27, 'White, wood-free, machine-coated matt paper.', 'Flexography and offset; thermal transfer is possible with selected ribbons.', TRUE, '{"source":"local TIS","standards":["ISO 536","ISO 534","ISO 2470/1","ISO 8791","ISO 2471"]}', '[{"title":"TIS - PHARMATIGHT - DCX - English - SI","date":"2022-02-20"}]', 'Tipik değerlerdir; gerçek uygulama testi ve güncel teknik onay gerekir.' FROM public.supplier_materials WHERE supplier_product_name = 'PHARMATIGHT';
INSERT INTO public.supplier_material_technical_data (supplier_material_id, adhesive_permanence, minimum_application_temperature, minimum_application_temperature_unit, service_temperature_min, service_temperature_max, service_temperature_unit, initial_tack, initial_tack_unit, pharmaceutical_suitability, direct_food_contact, approvals, regulatory_information, raw_extracted_data, source_references, disclaimer)
SELECT id, 'Permanent', 10, '°C', -40, 121, '°C', 12, 'N', TRUE, 'Kaynak TIS kapsamı ve istisnalarıyla kuru/ıslak yağsız gıda teması.', 'Kaynak TIS laboratuvar ve kan torbası migrasyon testlerini belirtir.', 'FDA 21 CFR 175.105; DMF 25392 type III kaynak TIS’te belirtilmiştir.', '{"source":"local TIS","test_method":"FTM 9"}', '[{"title":"TIS - RP31 PURUS - R31P - English - SI","date":"2024-11-25"}]', 'Tipik değerlerdir; gerçek uygulama testi ve güncel mevzuat doğrulaması gerekir.' FROM public.supplier_materials WHERE supplier_product_name = 'RP31 PURUS';
INSERT INTO public.supplier_material_technical_data (supplier_material_id, basis_weight, basis_weight_unit, caliper, caliper_unit, tensile_strength_md, tensile_strength_cd, tensile_strength_unit, face_stock_description, printability, raw_extracted_data, source_references, disclaimer)
SELECT id, 54, 'g/m²', 47, 'µm', 5.4, 2.2, 'kN/m', 'Yellow transparent glassine backing paper.', 'Reelstock applications; suitable for automatic dispensing.', '{"source":"local TIS","transparency":49,"transparency_unit":"%","standards":["ISO 536","ISO 534","ISO 1924","DIN 53147"]}', '[{"title":"TIS - HONEY GLASSINE 65 - 03 - English - SI","date":"2024-06-03"}]', 'Tipik değerlerdir; gerçek uygulama testi ve güncel teknik onay gerekir.' FROM public.supplier_materials WHERE supplier_product_name = 'HONEY GLASSINE 65';

WITH supplier AS (SELECT id FROM public.suppliers WHERE slug = 'upm-raflatac')
INSERT INTO public.technical_documents (supplier_id, supplier_material_id, document_type, title, original_url, language_code, version, document_date, status)
SELECT supplier.id, sm.id, 'TECHNICAL_DATASHEET', sm.source_document_title,
       'https://tools.upmraflatac.com/PRT/s/?language=en_US', sm.source_language,
       sm.source_document_version, sm.source_document_date, 'REVIEW_REQUIRED'
FROM supplier
JOIN public.supplier_materials sm ON sm.supplier_id = supplier.id
WHERE sm.source_document_title IN (
    'TIS - PHARMATIGHT - DCX - English - SI',
    'TIS - RP31 PURUS - R31P - English - SI',
    'TIS - HONEY GLASSINE 65 - 03 - English - SI'
)
AND NOT EXISTS (
    SELECT 1 FROM public.technical_documents td
    WHERE td.supplier_material_id = sm.id AND td.title = sm.source_document_title
);

/*
WITH supplier AS (SELECT id FROM public.suppliers WHERE slug = 'upm-raflatac')
INSERT INTO public.supplier_material_technical_data (
    supplier_material_id, basis_weight, basis_weight_unit, caliper, caliper_unit,
    brightness, roughness, opacity, gloss, tensile_strength_md, tensile_strength_cd,
    tensile_strength_unit, minimum_application_temperature, minimum_application_temperature_unit,
    service_temperature_min, service_temperature_max, service_temperature_unit,
    initial_tack, initial_tack_unit, face_stock_description, printability,
    pharmaceutical_suitability, direct_food_contact, approvals, regulatory_information,
    raw_extracted_data, source_references, disclaimer
)
SELECT sm.id, d.basis_weight, d.basis_weight_unit, d.caliper, d.caliper_unit,
       d.brightness, d.roughness, d.opacity, d.gloss, d.tensile_md, d.tensile_cd,
       d.tensile_unit, d.min_apply, d.temp_unit, d.temp_min, d.temp_max, d.temp_unit,
       d.tack, d.tack_unit, d.description, d.printability, d.pharma, d.food_contact,
       d.approvals, d.regulatory, d.raw_data::jsonb, d.source_refs::jsonb,
       'Bu veriler kaynak TIS belgesindeki tipik değerlerdir. Gerçek uygulamada uygunluk testi yapılmalı; Rotabil, tedarikçi veya belge sahibi adına ürün uygunluğu garantisi vermez.'
FROM supplier
JOIN public.supplier_materials sm ON sm.supplier_id = supplier.id
JOIN (VALUES
    ('PHARMATIGHT', 45::numeric, 'g/m²', 39::numeric, 'µm', 90::numeric, 1.5::numeric, 86::numeric, 27::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::text, 'White, wood-free, machine-coated matt paper.', 'Flexography and offset; thermal transfer with selected ribbons.', TRUE, NULL::text, 'Luminescent level: minimum 8 on the Laetus scale.', NULL::text, '{"source":"local TIS","standards":["ISO 536","ISO 534","ISO 2470/1","ISO 8791","ISO 2471"]}', '[{"title":"TIS - PHARMATIGHT - DCX - English - SI","date":"2022-02-20"}]'),
    ('RP31 PURUS', NULL::numeric, NULL, NULL::numeric, NULL, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, 10::numeric, '°C', -40::numeric, 121::numeric, '°C', 12::numeric, 'N', NULL::text, NULL::text, TRUE, 'Dry and moist non-fatty food contact under stated exceptions; verify current requirements.', 'European laboratory approval and blood-bag migration testing stated in source TIS.', 'FDA 21 CFR 175.105; DMF 25392 type III stated in source TIS.', '{"source":"local TIS","test_method":"FTM 9","service_temperature_unit":"°C"}', '[{"title":"TIS - RP31 PURUS - R31P - English - SI","date":"2024-11-25"}]'),
    ('HONEY GLASSINE 65', 54::numeric, 'g/m²', 47::numeric, 'µm', NULL::numeric, NULL::numeric, NULL::numeric, NULL::numeric, 5.4::numeric, 2.2::numeric, 'kN/m'::text, NULL::numeric, NULL, NULL::numeric, NULL::numeric, NULL, NULL::numeric, NULL, 'Yellow transparent glassine backing paper.', 'Designed for reelstock applications; suitable for automatic dispensing.', NULL, NULL, NULL, NULL, '{"source":"local TIS","transparency":49,"transparency_unit":"%","standards":["ISO 536","ISO 534","ISO 1924","DIN 53147"]}', '[{"title":"TIS - HONEY GLASSINE 65 - 03 - English - SI","date":"2024-06-03"}]')
) AS d(name, basis_weight, basis_weight_unit, caliper, caliper_unit, brightness, roughness, opacity, gloss, tensile_md, tensile_cd, tensile_unit, min_apply, temp_unit, temp_min, temp_max, temp_unit_2, tack, tack_unit, description, printability, pharma, food_contact, approvals, regulatory, raw_data, source_refs)
ON sm.supplier_product_name = d.name
ON CONFLICT (supplier_material_id) DO UPDATE SET
    raw_extracted_data = EXCLUDED.raw_extracted_data,
    source_references = EXCLUDED.source_references,
    updated_at = NOW();
*/
