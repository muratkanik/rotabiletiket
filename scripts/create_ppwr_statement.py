from pathlib import Path
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/docs/ppwr-karton-ambalaj-uygunluk-beyani.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont("ArialUnicode", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"))
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleRotabil", parent=styles["Title"], fontName="ArialUnicode", fontSize=19, leading=25, alignment=TA_CENTER, textColor=colors.HexColor("#0b2748"), spaceAfter=10))
styles.add(ParagraphStyle(name="SubRotabil", parent=styles["Normal"], fontName="ArialUnicode", fontSize=9, leading=13, alignment=TA_CENTER, textColor=colors.HexColor("#64748b"), spaceAfter=16))
styles.add(ParagraphStyle(name="H2Rotabil", parent=styles["Heading2"], fontName="ArialUnicode", fontSize=12, leading=16, textColor=colors.HexColor("#0b2748"), spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyRotabil", parent=styles["BodyText"], fontName="ArialUnicode", fontSize=9.2, leading=14, textColor=colors.HexColor("#334155"), spaceAfter=7))
styles.add(ParagraphStyle(name="SmallRotabil", parent=styles["BodyText"], fontName="ArialUnicode", fontSize=7.5, leading=10, textColor=colors.HexColor("#64748b"), spaceAfter=5))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas.line(18*mm, 15*mm, 192*mm, 15*mm)
    canvas.setFont("ArialUnicode", 7.5)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(18*mm, 10*mm, "Rotabil Etiket • PPWR Karton Ambalaj Uygunluk Beyanı")
    canvas.drawRightString(192*mm, 10*mm, f"Sayfa {doc.page}")
    canvas.restoreState()

P = Paragraph
story = [
    P("PPWR (AB) 2025/40", styles["TitleRotabil"]),
    P("Karton Ambalaj Uygunluk ve Bilgilendirme Beyanı", styles["TitleRotabil"]),
    P("Rotabil Etiket • Son güncelleme: 16 Temmuz 2026", styles["SubRotabil"]),
    Table([[P("KAPSAM", styles["BodyRotabil"]), P("Bu beyan, Rotabil ürünlerinin sevkiyatında ve ambalajlanmasında kullanılan geri dönüştürülebilir karton ambalajlara ilişkin mevcut tedarikçi belgeleri ve teknik kayıtlar temelinde hazırlanmıştır.", styles["BodyRotabil"])]], colWidths=[30*mm, 144*mm], style=TableStyle([("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#fff7ed")), ("BOX", (0,0), (-1,-1), 0.7, colors.HexColor("#f97316")), ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 8), ("RIGHTPADDING", (0,0), (-1,-1), 8), ("TOPPADDING", (0,0), (-1,-1), 8)])),
    Spacer(1, 7*mm),
    P("1. Düzenleme ve tarih", styles["H2Rotabil"]),
    P("Avrupa Birliği Ambalaj ve Ambalaj Atıkları Yönetmeliği (AB) 2025/40 (PPWR) 11 Şubat 2025 tarihinde yürürlüğe girmiştir. Yönetmeliğin genel uygulama tarihi 12 Ağustos 2026'dır.", styles["BodyRotabil"]),
    P("2. Malzeme yaklaşımı", styles["H2Rotabil"]),
    P("Rotabil ambalaj tarafında karton esaslı ve geri dönüşüm akışlarına uygun ambalaj kullanır. Malzeme seçimleri, tedarikçi teknik bilgi formları, uygunluk beyanları ve gerektiğinde analiz raporları ile değerlendirilir. Bu belge, tüm Rotabil ürünlerinin veya tüm kullanım senaryolarının koşulsuz mevzuat uygunluğu anlamına gelmez.", styles["BodyRotabil"]),
    P("3. Ağır metaller", styles["H2Rotabil"]),
    P("PPWR Madde 5 kapsamında ambalaj bileşeni başına kurşun, kadmiyum, cıva ve hekzavalent krom toplam konsantrasyonu 100 mg/kg sınırını aşmamalıdır. Bu gereklilik güncel tedarikçi belgeleri ve malzeme izlenebilirliği ile takip edilir.", styles["BodyRotabil"]),
    P("4. PFAS ve gıda ile temas", styles["H2Rotabil"]),
    P("PFAS eşikleri gıda ile temas eden ambalajlara özgü hükümlerdir: tekil PFAS için 25 ppb, uygulanabildiği durumda hedeflenen PFAS toplamı için 250 ppb ve polimerik PFAS'lar dahil toplam PFAS için 50 ppm. Bu beyan, gıda ile temas uygunluk sertifikası değildir; böyle bir kullanım için ilgili mevzuat ve tedarikçi kanıtları ayrıca doğrulanmalıdır.", styles["BodyRotabil"]),
    P("5. Belge geçerliliği ve izlenebilirlik", styles["H2Rotabil"]),
    P("Tedarikçi beyanları ve analiz raporları yıllık olarak gözden geçirilir. İç kayıtlar, kullanılan ambalajı tedarikçi, ürün kodu ve lot/parti bilgileriyle eşleştirecek şekilde tutulur. Malzeme veya tedarikçi değişiklikleri yeni bir belge incelemesini tetikler.", styles["BodyRotabil"]),
    P("6. EPR ve müşteri bilgi talepleri", styles["H2Rotabil"]),
    P("Genişletilmiş Üretici Sorumluluğu (EPR) yükümlülükleri pazara, tarafların rolüne ve yerel kurallara göre değişir. Mevcut kayıtlarımızdaki ambalaj türü ve ağırlık verileri, talep halinde müşterilerin uyum süreçlerini desteklemek amacıyla paylaşılabilir. Sorumlulukların hangi tarafta olduğu ülke bazında değerlendirilmelidir.", styles["BodyRotabil"]),
    P("İletişim", styles["H2Rotabil"]),
    P("PPWR yaklaşımımız ve tedarikçi belgeleri hakkında sorularınız için info@rotabiletiket.com adresine yazabilirsiniz.", styles["BodyRotabil"]),
    Spacer(1, 4*mm),
    P("Bu belge genel bilgilendirme amacı taşır; hukuki veya profesyonel danışmanlık değildir. Nihai uygunluk değerlendirmesi, ürünün ve kullanımın tüm koşulları ile güncel mevzuat ve teknik belgelere göre yapılmalıdır.", styles["SmallRotabil"]),
    P("Kaynaklar: EUR-Lex, Regulation (EU) 2025/40; European Commission, Packaging waste.", styles["SmallRotabil"]),
]
doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=18*mm, bottomMargin=22*mm)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
