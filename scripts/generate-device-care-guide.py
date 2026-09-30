import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from PIL import Image

# Output path
OUTPUT_PDF = "/Users/user/Desktop/web-app-it-services-freetown-main/public/downloads/bridgetech-device-care-guide.pdf"
WORKSPACE = "/Users/user/Desktop/web-app-it-services-freetown-main"

# Professional Color Palette
NAVY_DEEP = colors.HexColor("#060D24")
NAVY_PRIMARY = colors.HexColor("#0A194C")
NAVY_LIGHT = colors.HexColor("#1A2D6D")
CYAN_ACCENT = colors.HexColor("#00B4D8")
CYAN_BRIGHT = colors.HexColor("#38BDF8")
CYAN_BG = colors.HexColor("#E0F2FE")
RED_ACCENT = colors.HexColor("#DC2626")
RED_LIGHT = colors.HexColor("#FEE2E2")
GREEN_ACCENT = colors.HexColor("#059669")
GREEN_BG = colors.HexColor("#ECFDF5")
AMBER_ACCENT = colors.HexColor("#D97706")
AMBER_BG = colors.HexColor("#FFFBEB")
GRAY_DARK = colors.HexColor("#0F172A")
GRAY_BODY = colors.HexColor("#334155")
GRAY_MUTED = colors.HexColor("#64748B")
GRAY_LIGHT = colors.HexColor("#F8FAFC")
GRAY_BORDER = colors.HexColor("#CBD5E1")
WHITE = colors.HexColor("#FFFFFF")

PAGE_WIDTH, PAGE_HEIGHT = A4  # 595.276 x 841.890 pt

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print 'Page X of Y' and running headers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        page_num = self._pageNumber
        if page_num == 1:
            # Cover page - custom drawn in draw_cover
            return

        self.saveState()

        # Running Header (pages 2+)
        margin_x = 36
        header_y = PAGE_HEIGHT - 28
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(NAVY_PRIMARY)
        self.drawString(margin_x, header_y, "BRIDGETECH IT SERVICES")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(GRAY_MUTED)
        self.drawString(margin_x + 115, header_y, "•   Field Manual: Device Care, Triage & Remote Support Guide")

        # Header rule
        self.setStrokeColor(GRAY_BORDER)
        self.setLineWidth(0.75)
        self.line(margin_x, header_y - 6, PAGE_WIDTH - margin_x, header_y - 6)

        # Header accent dot
        self.setFillColor(CYAN_ACCENT)
        self.circle(PAGE_WIDTH - margin_x - 4, header_y + 1, 2.5, stroke=0, fill=1)

        # Running Footer (pages 2+)
        footer_y = 24
        self.setStrokeColor(GRAY_BORDER)
        self.setLineWidth(0.75)
        self.line(margin_x, footer_y + 14, PAGE_WIDTH - margin_x, footer_y + 14)

        self.setFont("Helvetica", 8)
        self.setFillColor(GRAY_MUTED)
        self.drawString(
            margin_x,
            footer_y,
            "#1 Regent Highway, Jui Junction, Freetown   |   Tel / WhatsApp: +232 33 399391   |   itservicesfreetown.com"
        )

        page_str = f"Page {page_num} of {total_pages}"
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(NAVY_PRIMARY)
        self.drawRightString(PAGE_WIDTH - margin_x, footer_y, page_str)

        self.restoreState()


def draw_cover(canvas_obj, doc):
    """Draws a premium, high-impact executive cover page."""
    c = canvas_obj
    c.saveState()

    w, h = PAGE_WIDTH, PAGE_HEIGHT

    # Deep midnight background
    c.setFillColor(NAVY_DEEP)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Decorative geometric dark navy accents
    c.setFillColor(NAVY_PRIMARY)
    p = c.beginPath()
    p.moveTo(0, h)
    p.lineTo(w, h)
    p.lineTo(w, h * 0.70)
    p.lineTo(0, h * 0.82)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # Subtle cyan accent line separating geometry
    c.setStrokeColor(CYAN_ACCENT)
    c.setLineWidth(2.5)
    c.line(0, h * 0.82, w, h * 0.70)

    # Sleek bottom corner accent
    c.setFillColor(NAVY_LIGHT)
    p2 = c.beginPath()
    p2.moveTo(0, 0)
    p2.lineTo(w * 0.45, 0)
    p2.lineTo(0, h * 0.16)
    p2.close()
    c.drawPath(p2, fill=1, stroke=0)

    # Crimson accent pin line at bottom
    c.setStrokeColor(RED_ACCENT)
    c.setLineWidth(3)
    c.line(0, h * 0.16, w * 0.45, 0)

    # Brand Logo & Tag at Top
    logo_path = os.path.join(WORKSPACE, "public/assets/social-media/bridgetech-avatar-shield-transparent-1080.png")
    if os.path.exists(logo_path):
        c.drawImage(logo_path, 40, h - 85, width=46, height=46, mask="auto")

    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(WHITE)
    c.drawString(98, h - 56, "BRIDGETECH IT SERVICES")

    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(CYAN_BRIGHT)
    c.drawString(98, h - 70, "ENGINEERING & COMPONENT-LEVEL REPAIR LABORATORY")

    # Edition Pill Badge
    pill_text = "OFFICIAL 2026/2027 TECHNICAL FIELD GUIDE"
    c.setFont("Helvetica-Bold", 7.5)
    badge_w = c.stringWidth(pill_text, "Helvetica-Bold", 7.5) + 16
    badge_x = w - 40 - badge_w
    badge_y = h - 68
    c.setFillColor(colors.HexColor("#0E2A72"))
    c.roundRect(badge_x, badge_y, badge_w, 20, 10, fill=1, stroke=0)
    c.setStrokeColor(CYAN_BRIGHT)
    c.setLineWidth(0.8)
    c.roundRect(badge_x, badge_y, badge_w, 20, 10, fill=0, stroke=1)
    c.setFillColor(WHITE)
    c.drawString(badge_x + 8, badge_y + 6, pill_text)

    # Main Title Block
    title_top = h - 130
    c.setFont("Helvetica-Bold", 27)
    c.setFillColor(WHITE)
    c.drawString(40, title_top, "THE COMPLETE DEVICE CARE")
    
    c.setFont("Helvetica-Bold", 27)
    c.setFillColor(CYAN_BRIGHT)
    c.drawString(40, title_top - 34, "& REMOTE SUPPORT HANDBOOK")

    c.setFont("Helvetica", 10.5)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(
        40,
        title_top - 62,
        "Practical Hardware Protection, Fast Diagnostics, Data Recovery, Liquid Triage & Secure Remote Desk"
    )

    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawString(
        40,
        title_top - 78,
        "Engineered specifically for computer and smartphone owners, businesses, and technicians in Sierra Leone."
    )

    # Center Image Frame (Bench Photo)
    bench_path = os.path.join(WORKSPACE, "public/assets/images/slider/slide-2-technician-repair-bench.jpg")
    img_card_x = 40
    img_card_y = h * 0.355
    img_card_w = w - 80
    img_card_h = 240

    if os.path.exists(bench_path):
        # Outer card container
        c.setFillColor(colors.HexColor("#0F172A"))
        c.roundRect(img_card_x - 3, img_card_y - 24, img_card_w + 6, img_card_h + 28, 8, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#334155"))
        c.setLineWidth(1)
        c.roundRect(img_card_x - 3, img_card_y - 24, img_card_w + 6, img_card_h + 28, 8, fill=0, stroke=1)

        # Draw the image
        c.drawImage(bench_path, img_card_x, img_card_y, width=img_card_w, height=img_card_h, preserveAspectRatio=True)

        # Image caption ribbon at bottom of card
        c.setFillColor(colors.HexColor("#070E22"))
        c.rect(img_card_x, img_card_y - 22, img_card_w, 22, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(CYAN_BRIGHT)
        c.drawString(img_card_x + 12, img_card_y - 14, "BRIDGETECH REPAIR LAB:")
        c.setFont("Helvetica", 8)
        c.setFillColor(WHITE)
        c.drawString(img_card_x + 130, img_card_y - 14, "Advanced Micro-Soldering Bench • Jui Junction, Freetown • Certified Diagnostic Suite")

    # 6 Topic Badges / Quick Highlights Grid
    pills_y = img_card_y - 60
    pills = [
        ("Power & Surge Protection", "EDSA & generator spike defense"),
        ("Screen & Battery Care", "OLED, ports & thermal health"),
        ("Laptop Speed & Recovery", "NVMe SSD upgrades & BSOD fix"),
        ("60-Minute Water Protocol", "Immediate liquid triage steps"),
        ("Data Rescue & Privacy", "Recovering dead storage drives"),
        ("AnyDesk Secure Remote", "Verified remote assistance desk"),
    ]

    col_w = (img_card_w - 16) / 3
    card_h = 42

    for i, (p_title, p_desc) in enumerate(pills):
        row = i // 3
        col = i % 3
        bx = img_card_x + col * (col_w + 8)
        by = pills_y - row * (card_h + 8)

        # Mini card
        c.setFillColor(colors.HexColor("#0B1944"))
        c.roundRect(bx, by, col_w, card_h, 5, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#1E3A8A"))
        c.setLineWidth(0.8)
        c.roundRect(bx, by, col_w, card_h, 5, fill=0, stroke=1)

        # Little accent dot
        c.setFillColor(CYAN_BRIGHT)
        c.circle(bx + 11, by + card_h - 13, 2.5, stroke=0, fill=1)

        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(WHITE)
        c.drawString(bx + 18, by + card_h - 16, p_title)

        c.setFont("Helvetica", 7.2)
        c.setFillColor(colors.HexColor("#CBD5E1"))
        c.drawString(bx + 18, by + card_h - 29, p_desc)

    # Bottom Contact & Verification Footer Card
    foot_y = 26
    foot_h = 70
    c.setFillColor(colors.HexColor("#0B1430"))
    c.roundRect(40, foot_y, w - 80, foot_h, 6, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor("#2563EB"))
    c.setLineWidth(1)
    c.roundRect(40, foot_y, w - 80, foot_h, 6, fill=0, stroke=1)

    # Left column: Physical Address
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(CYAN_BRIGHT)
    c.drawString(56, foot_y + foot_h - 18, "PHYSICAL WORKSHOP")
    c.setFont("Helvetica", 8)
    c.setFillColor(WHITE)
    c.drawString(56, foot_y + foot_h - 32, "#1 Regent Highway, Jui Junction")
    c.drawString(56, foot_y + foot_h - 45, "Freetown, Sierra Leone")
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(colors.HexColor("#10B981"))
    c.drawString(56, foot_y + foot_h - 58, "● Open Mon - Sat (8:30 AM - 6:30 PM)")

    # Middle column: Direct Hotline
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(CYAN_BRIGHT)
    c.drawString(225, foot_y + foot_h - 18, "DIRECT HOTLINE & WHATSAPP")
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(WHITE)
    c.drawString(225, foot_y + foot_h - 34, "+232 33 399391")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(225, foot_y + foot_h - 48, "Emergency triage & repair quotes")
    c.drawString(225, foot_y + foot_h - 58, "Email: itservicesfreetown@gmail.com")

    # Right column: Web & Warranty
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(CYAN_BRIGHT)
    c.drawString(410, foot_y + foot_h - 18, "ONLINE PORTAL & WARRANTY")
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(WHITE)
    c.drawString(410, foot_y + foot_h - 32, "itservicesfreetown.com")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(410, foot_y + foot_h - 45, "Remote: itservicesfreetown.com/remote-support")
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.drawString(410, foot_y + foot_h - 58, "★ 90-Day Repair Warranty Guarantee")

    c.restoreState()


def build_styles():
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        'ChapterBadge',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=RED_ACCENT,
        textTransform='uppercase',
        spaceAfter=3,
    ))

    styles.add(ParagraphStyle(
        'ChapterTitle',
        fontName='Helvetica-Bold',
        fontSize=19,
        leading=23,
        textColor=NAVY_DEEP,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        'ChapterSubtitle',
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13.5,
        textColor=GRAY_MUTED,
        spaceAfter=12,
    ))

    styles.add(ParagraphStyle(
        'SectionHeading',
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=NAVY_PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        'GuideBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.2,
        textColor=GRAY_BODY,
        spaceAfter=5,
    ))

    styles.add(ParagraphStyle(
        'GuideBodyBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12.2,
        textColor=GRAY_DARK,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        'BulletText',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.8,
        textColor=GRAY_BODY,
        leftIndent=12,
        spaceAfter=3,
    ))

    styles.add(ParagraphStyle(
        'TableHead',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=WHITE,
        alignment=0,
    ))

    styles.add(ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=GRAY_BODY,
    ))

    styles.add(ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=GRAY_DARK,
    ))

    return styles


def make_callout(title, text, bg_color=GRAY_LIGHT, border_color=GRAY_BORDER, title_color=NAVY_PRIMARY):
    """Creates a beautifully styled rounded callout card."""
    content = [
        Paragraph(f"<b><font color='{title_color.hexval()}'>{title}</font></b>", ParagraphStyle('CTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=title_color, spaceAfter=2)),
        Paragraph(text, ParagraphStyle('CText', fontName='Helvetica', fontSize=8.2, leading=11.5, textColor=GRAY_DARK))
    ]
    t = Table([[content]], colWidths=[PAGE_WIDTH - 72])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t


def make_warning_box(title, text):
    return make_callout(f"CRITICAL WARNING: {title}", text, bg_color=RED_LIGHT, border_color=RED_ACCENT, title_color=RED_ACCENT)


def make_tip_box(title, text):
    return make_callout(f"PRO TIP: {title}", text, bg_color=GREEN_BG, border_color=GREEN_ACCENT, title_color=GREEN_ACCENT)


def make_info_box(title, text):
    return make_callout(f"KEY TAKEAWAY: {title}", text, bg_color=CYAN_BG, border_color=CYAN_ACCENT, title_color=NAVY_PRIMARY)


def build_guide_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=38,
    )

    styles = build_styles()
    story = []

    # ==========================================
    # PAGE 1: COVER PAGE
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # ==========================================
    # PAGE 2: WELCOME, EXECUTIVE SUMMARY & TOC
    # ==========================================
    story.append(Paragraph("ABOUT THIS PUBLICATION", styles['ChapterBadge']))
    story.append(Paragraph("Welcome to the BridgeTech Engineering Handbook", styles['ChapterTitle']))
    story.append(Paragraph("Practical diagnostics, preventive care protocols, and remote assistance guidelines designed for Sierra Leone's digital ecosystem.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>The Reality of Device Maintenance in Freetown</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Modern laptops, smartphones, and workstations are essential tools for daily livelihood, education, corporate commerce, and family communication across Freetown and Sierra Leone. However, operating electronics locally presents serious environmental threats that Western manuals never address: unpredictable voltage surges from national grid switching, severe harmonic distortion from diesel generators, extreme coastal humidity, rust-accelerating sea salt air along the peninsula, and fine laterite dust during the dry harmattan season.",
        styles['GuideBody']
    ))
    story.append(Paragraph(
        "At <b>BridgeTech IT Services</b>, our component-level engineering laboratory at Jui Junction has diagnosed and revived thousands of damaged logic boards, shorted power circuits, crushed displays, and flooded motherboards. We authored this handbook to eliminate costly guesswork, debunk dangerous DIY myths, empower owners with actionable preventive measures, and establish clear standards for professional data recovery and remote support.",
        styles['GuideBody']
    ))

    story.append(Spacer(1, 4))
    story.append(make_info_box(
        "How to Use This Handbook",
        "Keep this PDF saved on your phone and cloud drive. Use <b>Chapter 1</b> to safeguard home/office power setups; refer to <b>Chapters 2-3</b> when experiencing sudden device slowdowns or charging failures; immediately follow <b>Chapter 4</b> if your device touches liquid; and use <b>Chapter 7</b> to get instant remote support without travelling across town."
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Handbook Contents & Reference Map</b>", styles['SectionHeading']))

    toc_data = [
        [
            Paragraph("<b>Section</b>", styles['TableHead']),
            Paragraph("<b>Topic & Engineering Focus</b>", styles['TableHead']),
            Paragraph("<b>Core Takeaway / Action</b>", styles['TableHead']),
            Paragraph("<b>Page</b>", styles['TableHead'])
        ],
        [
            Paragraph("<b>Chapter 1</b>", styles['TableCellBold']),
            Paragraph("<b>Protecting Devices in Freetown</b><br/>EDSA surges, generators, AVRs, dust & thermal airflow.", styles['TableCell']),
            Paragraph("Surge joule ratings, UPS selection, 3-2-1 backup habit.", styles['TableCell']),
            Paragraph("<b>Page 3</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 2</b>", styles['TableCellBold']),
            Paragraph("<b>Smartphone Hardware Essentials</b><br/>Screens, digitizers, charging ports & swollen batteries.", styles['TableCell']),
            Paragraph("Safe cable checks, dry-brush cleaning, 20-80% battery rule.", styles['TableCell']),
            Paragraph("<b>Page 4</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 3</b>", styles['TableCellBold']),
            Paragraph("<b>Laptop Diagnostics & Performance</b><br/>4 startup failure modes, SSD upgrades & thermal paste.", styles['TableCell']),
            Paragraph("HDD vs NVMe SSD speedups, thermal throttling triage.", styles['TableCell']),
            Paragraph("<b>Page 5</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 4</b>", styles['TableCellBold']),
            Paragraph("<b>Critical 60-Minute Liquid Protocol</b><br/>Rapid triage for flooded or spilled phones and laptops.", styles['TableCell']),
            Paragraph("Why rice destroys boards; ultrasonic chemical recovery.", styles['TableCell']),
            Paragraph("<b>Page 6</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 5</b>", styles['TableCellBold']),
            Paragraph("<b>Data Safety & Recovery Protocols</b><br/>Failing drives, clicking disks, SSD TRIM & data privacy.", styles['TableCell']),
            Paragraph("Logical vs physical recovery; strict NDA privacy terms.", styles['TableCell']),
            Paragraph("<b>Page 7</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 6</b>", styles['TableCellBold']),
            Paragraph("<b>Repair, Upgrade, or Replace Matrix</b><br/>The 50% rule, component micro-soldering vs new device.", styles['TableCell']),
            Paragraph("Cost-benefit calculation; OEM vs aftermarket parts.", styles['TableCell']),
            Paragraph("<b>Page 8</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 7</b>", styles['TableCellBold']),
            Paragraph("<b>Secure AnyDesk Remote IT Desk</b><br/>Instant remote fix for software, viruses, printers & Wi-Fi.", styles['TableCell']),
            Paragraph("Zero-Trust security; customer retains total mouse control.", styles['TableCell']),
            Paragraph("<b>Page 9</b>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Chapter 8</b>", styles['TableCellBold']),
            Paragraph("<b>Intake Checklist & Service Center</b><br/>Pre-repair preparation, workshop location & warranties.", styles['TableCell']),
            Paragraph("Directions to Jui Junction, 90-day repair guarantee.", styles['TableCell']),
            Paragraph("<b>Page 10</b>", styles['TableCell'])
        ],
    ]

    toc_table = Table(toc_data, colWidths=[65, 185, 225, 48])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GRAY_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (3,0), (3,-1), 'CENTER'),
    ]))
    story.append(toc_table)

    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Need Immediate Emergency Assistance?</b> Call or WhatsApp BridgeTech Direct Hotline at <b>+232 33 399391</b>. For national life-safety flood emergencies, contact the National Disaster Management Agency toll-free at <b>117</b>.",
        styles['GuideBody']
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 3: CHAPTER 1 - PROTECTING DEVICES IN FREETOWN
    # ==========================================
    story.append(Paragraph("CHAPTER 01   •   ENVIRONMENTAL & ELECTRICAL DEFENSE", styles['ChapterBadge']))
    story.append(Paragraph("Protecting Your Electronics in Freetown", styles['ChapterTitle']))
    story.append(Paragraph("Overcoming severe electrical voltage fluctuations, salt humidity, tropical heat, and harmful dust.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. Surviving the Local Power Grid & Generators</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Freetown's electrical landscape is dominated by grid switching between EDSA supply, diesel/petrol generators, and solar inverter systems. When grid power drops and restores, or when high-draw appliances (air conditioners, freezers, welding tools) cycle on generator lines, severe <b>voltage spikes (up to 400V) and brownouts (drops below 160V)</b> rip through building wiring.",
        styles['GuideBody']
    ))
    story.append(Paragraph(
        "Cheap multi-socket extension leads sold on the street offer <b>zero surge protection</b>—they are simply plastic splitters with thin copper foil that melt under load. To genuinely protect your computers, televisions, and charging docks:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Use an Automatic Voltage Regulator (AVR) or Line-Interactive UPS:</b> An AVR actively steps down over-voltage and boosts under-voltage without disconnecting power, shielding laptop power bricks and internal charging circuits from premature burnout.", styles['BulletText']))
    story.append(Paragraph("• <b>Verify Joule Rating:</b> If using a surge protector, ensure it has a minimum rating of <b>1,000 to 2,000 Joules</b> with an active MOV (Metal Oxide Varistor) indicator LED.", styles['BulletText']))
    story.append(Paragraph("• <b>Disconnect During Thunderstorms:</b> Lightning strikes frequently induce massive electromagnetic pulses along overhead telephone and power lines. Always unplug vital hardware during intense storms.", styles['BulletText']))

    story.append(make_warning_box(
        "Generator Startup Surges",
        "Never leave laptops, desktop computers, or smartphones plugged into wall outlets while starting up or shutting down a generator. The engine throttle takes several seconds to stabilize its RPM; the resulting harmonic distortion can instantly fry sensitive motherboard power rails."
    ))

    story.append(Paragraph("<b>2. Combatting Humidity, Salt Air Corrosion & Dust</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Freetown's coastal atmosphere carries microscopic salt vapor from the Atlantic ocean combined with relative humidity exceeding 85% during the rainy season. This moisture settles on PCB copper traces, initiating green copper carbonate corrosion. During the dry harmattan, airborne laterite dust coats internal cooling fans and heatsink fins.",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Never Operate Laptops on Beds, Sofas, or Blankets:</b> Soft fabrics block bottom intake vents, starving the cooling fan. The trapped heat turns dust into a hardened insulation blanket, triggering thermal throttling and GPU solder fatigue.", styles['BulletText']))
    story.append(Paragraph("• <b>Annual Preventive Internal Cleaning:</b> Schedule internal thermal servicing every 9 to 12 months. At BridgeTech, we disassemble the casing, blow out conductive dust with anti-static compressed air, clean oxidised heatsinks, and re-paste processors with high-performance non-conductive thermal compound.", styles['BulletText']))
    story.append(Paragraph("• <b>Silica Gel in Storage Bags:</b> Keep a pouch of moisture-absorbing silica gel inside your laptop backpack or equipment cabinet to prevent condensation when transitioning between air-conditioned rooms and humid outdoor air.", styles['BulletText']))

    story.append(Paragraph("<b>3. The Bandwidth-Smart 3-2-1 Backup Protocol</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Because unlimited high-speed broadband is not always accessible, relying 100% on automated cloud backup can fail when data subscriptions exhaust. We recommend the local 3-2-1 hybrid model:",
        styles['GuideBody']
    ))
    story.append(Paragraph("1. <b>3 Copies of Data:</b> One primary working copy on your computer, plus two separate backup copies.", styles['BulletText']))
    story.append(Paragraph("2. <b>2 Different Media Types:</b> One copy on an external USB 3.0 portable hard drive or high-speed SSD, and one copy on a secondary storage device or cloud.", styles['BulletText']))
    story.append(Paragraph("3. <b>1 Offsite / Cloud Copy:</b> Sync only your mission-critical folders (documents, bookkeeping, family photos, thesis) to Google Drive, OneDrive, or iCloud overnight during off-peak data hours.", styles['BulletText']))

    story.append(make_tip_box(
        "Test Your Backups Monthly",
        "A backup that has never been tested is not a real backup. Once a month, plug your external drive into a different computer and open three random documents. Confirm they load completely without corruption errors."
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 4: CHAPTER 2 - SMARTPHONE HARDWARE ESSENTIALS
    # ==========================================
    story.append(Paragraph("CHAPTER 02   •   SMARTPHONE TRIAGE & MAINTENANCE", styles['ChapterBadge']))
    story.append(Paragraph("Smartphone Care: Screens, Ports & Batteries", styles['ChapterTitle']))
    story.append(Paragraph("Preventing catastrophic display fractures, port contact burnout, and hazardous lithium battery swelling.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. Display Anatomy: Cracked Glass vs OLED Panel Failure</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Modern smartphones (iPhone, Samsung Galaxy, TECNO, Infinix, itel, Xiaomi) feature multi-layer display assemblies consisting of the outer protective glass, the digitizer layer (detects touch), and the display panel (AMOLED or IPS-LCD). Understanding your screen's condition prevents you from being overcharged:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Cosmetic Glass Fracture Only:</b> The glass has spiderweb cracks, but the picture is 100% crystal clear with no black ink spots or colored vertical lines, and touch responds smoothly everywhere. (Eligible for glass-only refurbishment or standard screen swap).", styles['BulletText']))
    story.append(Paragraph("• <b>Internal OLED/LCD Bleed:</b> Purple, blue, or black bleeding spots appear on the screen, or bright vertical green/pink lines flicker across the image. <b>Warning:</b> Internal OLED bleeding spreads rapidly; within 24 to 48 hours the entire screen will turn completely black. <b>Back up your device immediately!</b>", styles['BulletText']))
    story.append(Paragraph("• <b>Ghost Touches & Touch Dead-Zones:</b> If the phone opens apps on its own or certain keyboard letters do not respond, the digitizer grid is compromised. Continuing to use it risks locking you out if ghost inputs mistype your passcode 10 times.", styles['BulletText']))

    story.append(Paragraph("<b>2. Charging Port Failures: Cleaning vs Micro-Soldering</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Over 65% of phones brought to our workshop with 'dead charging ports' do not actually need a new port. Pocket lint, red dirt, and fabric fibers get packed into the bottom of USB-C and Lightning ports every time the cable is pushed in, eventually preventing the cable pins from seating fully.",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>THE NEEDLE MISTAKE:</b> Never insert sewing needles, safety pins, or metal staples into a charging port. Metal tools will short-circuit the live VBUS power pins (carrying 5V-9V) to ground, instantly destroying the internal Charging IC (Tristar/Hydra on iPhone or PMIC on Android).", styles['BulletText']))
    story.append(Paragraph("• <b>Safe Cleaning Technique:</b> Power off the phone. Use a non-conductive wooden toothpick or clean dry anti-static nylon brush. Gently tease out accumulated lint without touching the delicate center contact tongue.", styles['BulletText']))
    story.append(Paragraph("• <b>Wobbly Cables & Wiggling:</b> If you must bend the cable at an angle to charge, stop doing so immediately. Arcing electrical current from loose contact points melts the plastic casing and oxidises the copper solder pads on the sub-board.", styles['BulletText']))

    story.append(make_warning_box(
        "Swollen Lithium-Ion Batteries: Immediate Hazard",
        "If your phone's back glass is lifting, the screen is bulging out of its frame, or the device feels spongy when squeezed, the battery has off-gassed toxic, flammable gases due to internal membrane breakdown. <b>DO NOT press down, DO NOT puncture, and DO NOT connect to a fast charger.</b> Store the phone in a fire-safe ceramic plate or metal tin and bring it to BridgeTech immediately for safe extraction."
    ))

    story.append(Paragraph("<b>3. Lithium Battery Longevity: The 20% - 80% Rule</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Lithium-ion cells experience the greatest mechanical and chemical stress when fully depleted to 0% and when forced to hold 100% capacity under sustained heat. To double your battery's lifespan:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Maintain the Sweet Spot:</b> Recharge when your phone hits 20%, and unplug around 80% to 85% whenever convenient. This prevents high-voltage anode saturation.", styles['BulletText']))
    story.append(Paragraph("• <b>Never Charge Under Pillows or Mattresses:</b> Heat cannot dissipate when a phone is buried in bedding. Trapped heat accelerates electrolyte degradation and creates thermal runaway hazards.", styles['BulletText']))
    story.append(Paragraph("• <b>Avoid Cheap Uncertified Wall Adapters:</b> Generic chargers without surge suppressors feed dirty ripple voltage into your battery, causing severe battery degradation within 3 to 6 months.", styles['BulletText']))

    story.append(make_tip_box(
        "Before Bringing Your Phone for Service",
        "Whenever possible: (1) Ensure your WhatsApp chats and photos are backed up; (2) Know your Apple ID or Google Account password; (3) Remove your SIM card and memory card for safekeeping. BridgeTech technicians will test and record all functions prior to intake."
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 5: CHAPTER 3 - LAPTOP DIAGNOSTICS & UPGRADES
    # ==========================================
    story.append(Paragraph("CHAPTER 03   •   COMPUTER RECOVERY & HARDWARE UPGRADES", styles['ChapterBadge']))
    story.append(Paragraph("Laptop & Computer Diagnostics & Performance", styles['ChapterTitle']))
    story.append(Paragraph("Diagnosing the 4 main startup failure modes, stopping thermal throttling, and massive SSD speedups.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. The 4 Main Startup Failure Modes</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "When a computer fails to start, customers often assume the motherboard is permanently destroyed. In reality, symptoms fall into four specific technical categories with distinct solutions:",
        styles['GuideBody']
    ))

    failure_data = [
        [
            Paragraph("<b>Symptom</b>", styles['TableHead']),
            Paragraph("<b>Technical Root Cause</b>", styles['TableHead']),
            Paragraph("<b>Safe Diagnostic Action</b>", styles['TableHead'])
        ],
        [
            Paragraph("<b>1. Complete Blackout</b><br/>No LED lights, no fan, no charging light when plugged.", styles['TableCellBold']),
            Paragraph("Blown DC jack, shorted ceramic capacitor on 19V rail, dead power brick, or blown input MOSFET.", styles['TableCell']),
            Paragraph("Test with verified charger. Do not force-twist the jack. Component-level board repair usually solves this without whole board replacement.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Power On, No Display</b><br/>Power LED glows, fan spins, but screen remains pitch black.", styles['TableCellBold']),
            Paragraph("Corrupted BIOS firmware, oxidised RAM contact pins, faulty display cable, or failed display panel.", styles['TableCell']),
            Paragraph("Perform hard power drain: unplug, hold power for 30s. Connect external HDMI monitor to verify if GPU produces video.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Boot Loop / BSOD</b><br/>Windows blue screen or restarts repeatedly at manufacturer logo.", styles['TableCellBold']),
            Paragraph("Damaged operating system boot sector, failing hard drive bad sectors, or driver incompatibility.", styles['TableCell']),
            Paragraph("Do not run repeated automated repairs if you hear clicking sounds. Seek immediate data rescue before re-installing Windows.", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. BIOS / No Boot Device</b><br/>Screen shows 'Boot Device Not Found' or opens BIOS setup.", styles['TableCellBold']),
            Paragraph("Storage drive disconnected, cable loose, failed SSD controller, or dead mechanical HDD head.", styles['TableCell']),
            Paragraph("Power off immediately to prevent secondary platter scratches if mechanical drive is failing.", styles['TableCell'])
        ],
    ]

    fail_table = Table(failure_data, colWidths=[130, 190, 203])
    fail_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GRAY_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(fail_table)

    story.append(Paragraph("<b>2. The Game-Changer: Mechanical HDD vs Solid-State SSD</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "If your laptop takes 2 to 4 minutes to boot up, freezes when opening Microsoft Word, or sits at 100% Disk Usage in Task Manager, the culprit is almost certainly an outdated mechanical spinning hard drive (HDD). Upgrading to a Solid-State Drive (SSD) delivers an astonishing transformation:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Boot Time:</b> Drops from 2-3 minutes down to <b>10 to 15 seconds</b>.", styles['BulletText']))
    story.append(Paragraph("• <b>Read/Write Speeds:</b> Mechanical HDDs max out at 80-100 MB/s. SATA SSDs achieve <b>550 MB/s</b>, while modern NVMe M.2 SSDs reach <b>2,000 to 3,500+ MB/s</b>.", styles['BulletText']))
    story.append(Paragraph("• <b>Physical Durability:</b> HDDs have magnetic needles reading spinning glass platters; one table bump can cause permanent head crashes. SSDs contain zero moving parts and are immune to drop shocks.", styles['BulletText']))
    story.append(Paragraph("• <b>Battery Conservation:</b> SSDs consume up to 60% less electrical power than spinning motors, noticeably extending your laptop's battery runtime on a single charge.", styles['BulletText']))

    story.append(make_tip_box(
        "Seamless Drive Cloning at BridgeTech",
        "You do NOT have to lose your programs, personal files, or browser bookmarks when upgrading to an SSD. BridgeTech performs bit-by-bit cloning: your entire system is transferred to the new ultra-fast SSD and boots up instantly with all your files in their exact places."
    ))

    story.append(Paragraph("<b>3. Thermal Throttling & Fan Noise: Silence the Jet Engine</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "When your laptop fan whirs loudly like a jet engine, the computer's CPU is hitting 90°C–100°C and deliberately down-clocking its processing speed to prevent melting. Replacing dried factory thermal paste with high-grade carbon-based compound and clearing the radiator fins restores peak speed and quiet operation.",
        styles['GuideBody']
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 6: CHAPTER 4 - 60-MINUTE LIQUID PROTOCOL
    # ==========================================
    story.append(Paragraph("CHAPTER 04   •   EMERGENCY DISASTER RECOVERY", styles['ChapterBadge']))
    story.append(Paragraph("Water & Liquid Damage: The First 60 Minutes", styles['ChapterTitle']))
    story.append(Paragraph("Why liquid destroys circuits, the four fatal mistakes to avoid, and the step-by-step survival checklist.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. The Chemistry: What Actually Destroys a Wet Device?</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Contrary to popular belief, <b>pure water alone does not immediately destroy electronics</b>. The true destruction begins when electrical current passes through water containing dissolved minerals, chlorine, salt, or acids (coffee, soft drinks, tea). This causes two catastrophic reactions:",
        styles['GuideBody']
    ))
    story.append(Paragraph("1. <b>Instant Short Circuits:</b> Liquid bridges live power rails (e.g. 19V laptop charger rail or 4.2V battery rail) directly to low-voltage sensitive data lines (CPU, RAM, GPU running on 0.9V - 1.2V), instantly frying micro-chips.", styles['BulletText']))
    story.append(Paragraph("2. <b>Electrolytic Corrosion:</b> The electric current acts as a chemical catalyst, rapidly eating away tiny copper traces, solder balls under BGA chips, and SMD capacitor terminals. Within hours, vital circuit pathways dissolve into green powdery residue.", styles['BulletText']))

    story.append(make_warning_box(
        "THE 4 FATAL MISTAKES — DO NOT DO THESE!",
        "<b>1. NEVER PLUG IN THE CHARGER:</b> Over 70% of wet devices are permanently ruined because the owner plugged in the charger 'just to see if it turns on'. Adding electrical voltage accelerates galvanic corrosion a thousandfold.<br/>"
        "<b>2. NEVER USE A HAIR DRYER:</b> High heat melts laptop keycaps, warps battery pouches, and blows liquid deeper under shielded microprocessors.<br/>"
        "<b>3. DO NOT SHAKE THE DEVICE:</b> Shaking forces moisture into dry, sealed sections such as display backlight sheets and camera lenses.<br/>"
        "<b>4. STOP USING UNCOOKED RICE:</b> Rice does NOT extract moisture from inside sealed microchips. Worse, starchy white rice powder mixes with moisture to form a sticky conductive paste, while delaying proper ultrasonic decontamination."
    ))

    story.append(Paragraph("<b>2. The Golden 60-Minute Emergency Checklist</b>", styles['SectionHeading']))
    story.append(Paragraph("Follow these exact steps the moment a smartphone, tablet, or laptop experiences liquid exposure:", styles['GuideBody']))

    story.append(Paragraph("<b>STEP 1: Immediate Force Shutdown</b><br/>Do not attempt a standard graceful shutdown. On laptops, press and hold the power button for 10 full seconds until all lights extinguish. Immediately pull out the charging cable. If the battery is removable, eject it instantly.", styles['BulletText']))
    story.append(Paragraph("<b>STEP 2: Disconnect All Peripherals & Trays</b><br/>Unplug USB drives, mice, SD cards, SIM trays, and headphone jacks to allow natural moisture drainage.", styles['BulletText']))
    story.append(Paragraph("<b>STEP 3: Orient for Gravity Draining</b><br/>For laptops: Open the lid to a 90-degree angle and stand it upside down in a tent shape (keyboard facing down) on a clean, absorbent towel. This keeps liquid from dripping deeper into the motherboard.", styles['BulletText']))
    story.append(Paragraph("<b>STEP 4: Wrap in Dry Microfiber / Cotton & Transport Immediately</b><br/>Do not leave the device sitting on a shelf for three days hoping it dries out. Liquid sealed inside an enclosed chassis remains wet for over a week, silently corroding vital copper traces. Bring it to BridgeTech immediately.", styles['BulletText']))

    story.append(Paragraph("<b>3. How BridgeTech Rescues Liquid-Damaged Hardware</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "At our Jui Junction facility, we follow an uncompromising professional restoration standard:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Full Teardown & Shield Removal:</b> We disassemble the device completely and desolder EMI metal shielding cans covering the CPU, power ICs, and baseband chips.", styles['BulletText']))
    story.append(Paragraph("• <b>Ultrasonic Chemical Bath:</b> The logic board is placed in a heated ultrasonic cleaner filled with specialized anhydrous solvent and 99.9% electronic-grade isopropyl alcohol, vibrating at 40kHz to dissolve all mineral deposits from beneath microchips.", styles['BulletText']))
    story.append(Paragraph("• <b>Microscope Trace Reconstruction:</b> Under 45X stereo microscopes, our engineers inspect every solder pad, jumper corroded copper lines with insulated enamel wire, and replace destroyed capacitors before safe power is ever reintroduced.", styles['BulletText']))

    story.append(make_tip_box(
        "Freetown Flood Advisory",
        "If your equipment was submerged in muddy storm water or salt sea water during heavy Freetown rains, tell our intake technician immediately. Flood water contains conductive silt that requires specialized neutralisation washes."
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 7: CHAPTER 5 - DATA SAFETY & RECOVERY
    # ==========================================
    story.append(Paragraph("CHAPTER 05   •   STORAGE HEALTH & CONFIDENTIAL RESCUE", styles['ChapterBadge']))
    story.append(Paragraph("Data Safety, Storage Health & Recovery Protocols", styles['ChapterTitle']))
    story.append(Paragraph("Recognizing failing storage drives, solid-state TRIM risks, and our strict customer privacy guarantee.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. Recognizing Early Drive Failure Symptoms</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Storage drives (HDDs, SSDs, USB thumb drives, SD cards) rarely fail without early warning signals. Recognizing these signs allows you to rescue your files before the controller completely dies:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Clicking, Ticking, or Grinding Sounds:</b> Mechanical hard drives make a distinct rhythmic 'Click of Death' when the read/write actuator heads can no longer locate track zero on the magnetic platters. <b>Turn off the computer immediately.</b> Continuing to spin a clicking drive causes physical head crashes that scrape the magnetic media off the disks.", styles['BulletText']))
    story.append(Paragraph("• <b>Extreme Explorer Freezing:</b> Opening a folder causes File Explorer or Finder to hang indefinitely with a spinning wheel, or copying files drops to 0 KB/s.", styles['BulletText']))
    story.append(Paragraph("• <b>Disappearing Partitions or RAW File System:</b> The drive prompts: 'You need to format the disk before you can use it'. Never click format—the partition table is merely unmapped, and the underlying data is intact.", styles['BulletText']))
    story.append(Paragraph("• <b>S.M.A.R.T. Warning Prompts:</b> If the motherboard BIOS displays 'SMART Hard Drive Failure Imminent', the drive has exceeded its internal reallocation sector threshold.", styles['BulletText']))

    story.append(Paragraph("<b>2. Logical vs Physical Data Recovery: What is the Difference?</b>", styles['SectionHeading']))
    
    rec_data = [
        [
            Paragraph("<b>Recovery Tier</b>", styles['TableHead']),
            Paragraph("<b>Failure Mechanism</b>", styles['TableHead']),
            Paragraph("<b>BridgeTech Recovery Process</b>", styles['TableHead'])
        ],
        [
            Paragraph("<b>Logical Recovery</b><br/>(Drive is physically functional)", styles['TableCellBold']),
            Paragraph("Accidental file deletion, formatted drive, corrupted MBR/GPT partition, ransomware encryption, or OS crash.", styles['TableCell']),
            Paragraph("We create a read-only bit-stream clone to prevent write alterations, then reconstruct damaged file signatures using deep carving algorithms.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Physical Recovery</b><br/>(Drive hardware damaged)", styles['TableCellBold']),
            Paragraph("Burnt PCB controller, damaged motor spindle, seized bearings, broken SATA/USB connector, or head failure.", styles['TableCell']),
            Paragraph("Board repairs, donor board PCB firmware chip (ROM) swapping, head assembly transplant, or direct NAND chip-off extraction.", styles['TableCell'])
        ],
    ]
    rec_table = Table(rec_data, colWidths=[120, 195, 208])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GRAY_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(rec_table)

    story.append(Paragraph("<b>3. The Danger of SSD TRIM & Overwriting</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "On traditional spinning drives, deleting a file merely marks the directory index as free space while the magnetic data remains until overwritten. However, on modern SSDs and smartphones, operating systems execute the <b>TRIM command</b>, which actively instructs the SSD controller to erase NAND flash cells in the background for wear leveling.",
        styles['GuideBody']
    ))
    story.append(Paragraph(
        "<b>Action Required:</b> The moment you realize files have been accidentally deleted from an SSD or phone, <b>power off the system immediately</b> and do not install any 'free recovery programs' on that same drive. Installing software writes thousands of new temporary blocks, permanently overwriting the deleted data.",
        styles['GuideBody']
    ))

    story.append(make_info_box(
        "BridgeTech Customer Confidentiality & Data Privacy Guarantee",
        "We treat customer data with hospital-grade privacy standards. When your laptop, phone, or storage media enters our laboratory: (1) All diagnostics are conducted in a secure, monitored environment; (2) Technicians never browse personal photo albums, documents, or browser histories; (3) Recovered files are held in encrypted temporary storage for 7 days post-handover for customer verification, then permanently cryptographically purged; (4) We gladly sign corporate Non-Disclosure Agreements (NDAs) for business clients, legal practices, and medical facilities."
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 8: CHAPTER 6 - REPAIR, UPGRADE, OR REPLACE
    # ==========================================
    story.append(Paragraph("CHAPTER 06   •   COST-BENEFIT & INVESTMENT ANALYSIS", styles['ChapterBadge']))
    story.append(Paragraph("Repair, Upgrade, or Replace? The Honest Matrix", styles['ChapterTitle']))
    story.append(Paragraph("How to evaluate repair costs versus equipment lifespan, part quality tiers, and when to walk away.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. The 50% Rule for Consumer Electronics</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "One of the hardest decisions customers face is knowing whether to invest in repairing an older device or saving that money towards buying a new one. At BridgeTech, we advise all our clients to follow the proven <b>50% Rule</b>:",
        styles['GuideBody']
    ))
    story.append(Paragraph(
        "<i>'If the cost of repair exceeds 50% of the cost of buying an equivalent, dependable replacement in good working condition—and the device is over 4 to 5 years old—replacement is generally the smarter financial decision.'</i>",
        styles['GuideBody']
    ))
    story.append(Paragraph(
        "However, if the repair cost is under 30% to 40% of replacement value, professional repair preserves your investment, saves you the hassle of migrating software configurations, and eliminates electronic waste.",
        styles['GuideBody']
    ))

    story.append(Paragraph("<b>2. Decision Matrix: When Each Option Makes Sense</b>", styles['SectionHeading']))

    matrix_data = [
        [
            Paragraph("<b>Strategy</b>", styles['TableHead']),
            Paragraph("<b>When This is the Best Choice</b>", styles['TableHead']),
            Paragraph("<b>Expected Lifespan Extension</b>", styles['TableHead'])
        ],
        [
            Paragraph("<b>REPAIR</b><br/>(Targeted fix)", styles['TableCellBold']),
            Paragraph("• Screen replacement on a high-value phone or laptop.<br/>• Charging port solder repair, battery replacement, or hinge repair.<br/>• Power rail short circuit repair on a modern computer.<br/>• The rest of the device hardware is reliable and meets your workflow needs.", styles['TableCell']),
            Paragraph("<b>1 to 3+ Years</b><br/>Restores original device functionality at a fraction of replacement cost.", styles['TableCell'])
        ],
        [
            Paragraph("<b>UPGRADE</b><br/>(Hardware refresh)", styles['TableCellBold']),
            Paragraph("• Laptop is 2016-2023 with slow mechanical HDD → Upgrade to SSD.<br/>• Multi-tasking freezes with 4GB/8GB RAM → Upgrade to 16GB RAM.<br/>• Overheating processor → Clean heatsink & apply premium thermal paste.", styles['TableCell']),
            Paragraph("<b>3 to 5 Years</b><br/>Transforms daily operational speed; often feels faster than a brand-new budget laptop.", styles['TableCell'])
        ],
        [
            Paragraph("<b>REPLACE</b><br/>(New/Refurb purchase)", styles['TableCellBold']),
            Paragraph("• Repair cost approaches 60%+ of a newer model's market value.<br/>• Severely warped or burnt multi-layer motherboards with cracked PCBs.<br/>• Obsolete processors (Intel 2nd/3rd Gen) unable to run required modern apps.<br/>• Repeated recurring failures in multiple independent subsystems.", styles['TableCell']),
            Paragraph("<b>Fresh Cycle (4-6 Yrs)</b><br/>BridgeTech can transfer all your files, applications, and settings to your new device.", styles['TableCell'])
        ],
    ]

    mat_table = Table(matrix_data, colWidths=[105, 275, 143])
    mat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GRAY_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(mat_table)

    story.append(Paragraph("<b>3. Understanding Part Quality Tiers: Avoid Street Fakes</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Freetown markets are flooded with counterfeit phone screens and laptop batteries. Always insist on transparency regarding part grades:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Original Equipment / OEM Pull:</b> Genuine original display harvested from an original device or sourced directly from authorized assembly chains. Perfect color saturation, true 60Hz/120Hz refresh rates, true blacks on OLED, and full TrueTone / ambient light sensor support.", styles['BulletText']))
    story.append(Paragraph("• <b>Premium High-Tier Aftermarket (In-Cell / Hard OLED):</b> High quality third-party manufacturing. Provides excellent touch responsiveness and good color accuracy at 30% to 40% lower cost.", styles['BulletText']))
    story.append(Paragraph("• <b>Low-Grade Street Copies (TFT on OLED phones):</b> Cheap thick glass panels that drain your battery rapidly, generate excess heat, and shatter under the slightest tap. <b>BridgeTech rejects low-grade counterfeit parts.</b>", styles['BulletText']))

    story.append(make_tip_box(
        "The BridgeTech Written Quote Guarantee",
        "Before any work commences in our workshop, you receive a transparent estimate clearly separating: (1) Diagnostic fee; (2) Part cost & quality tier; (3) Labor fee; (4) Expected completion turnaround; and (5) Specific warranty coverage duration (up to 90 days)."
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 9: CHAPTER 7 - ANYDESK REMOTE SUPPORT
    # ==========================================
    story.append(Paragraph("CHAPTER 07   •   ZERO-COMMUTE TECHNICAL DESK", styles['ChapterBadge']))
    story.append(Paragraph("Remote Support: Secure Help from Anywhere", styles['ChapterTitle']))
    story.append(Paragraph("How verified AnyDesk remote sessions work, common solvable issues, and our Zero-Trust privacy rules.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. What Can Be Solved Remotely? (Save the Commute!)</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Navigating traffic across Freetown between the East End, Central Business District, Congo Cross, Wilberforce, and Aberdeen can consume hours of valuable productive time. With <b>BridgeTech Remote Support</b>, our senior systems engineers connect securely to your computer over the internet while you remain seated comfortably in your home or office.",
        styles['GuideBody']
    ))
    story.append(Paragraph(
        "<b>Remote Support is ideally suited for:</b>",
        styles['GuideBodyBold']
    ))
    story.append(Paragraph("• <b>Performance Optimization:</b> Removing background bloatware, cleaning system registry, fixing 100% disk usage, and disabling unwanted startup tasks.", styles['BulletText']))
    story.append(Paragraph("• <b>Virus & Malware Removal:</b> Eliminating stubborn browser hijackers, adware popups, Trojan infections, and configuring real-time security defenders.", styles['BulletText']))
    story.append(Paragraph("• <b>Software & Driver Installation:</b> Microsoft Office 365, Adobe Creative Cloud, accounting software (QuickBooks), graphic tools, and official display/audio drivers.", styles['BulletText']))
    story.append(Paragraph("• <b>Printer, Scanner & Wi-Fi Configuration:</b> Fixing 'Printer Offline' errors, network printer sharing, scanner drivers, and unstable office wireless connections.", styles['BulletText']))
    story.append(Paragraph("• <b>Email Client Setup:</b> Configuring Microsoft Outlook, Mozilla Thunderbird, or Google Workspace with secure IMAP/SMTP and SSL certificates.", styles['BulletText']))
    story.append(Paragraph("• <b>Cloud & Automated Backup Setup:</b> Configuring automated syncing to OneDrive, Google Drive, or local network-attached storage.", styles['BulletText']))

    story.append(Paragraph("<b>2. The 4-Step Secure AnyDesk Connection Walkthrough</b>", styles['SectionHeading']))

    remote_steps = [
        [
            Paragraph("<b>Connection Step</b>", styles['TableHead']),
            Paragraph("<b>Action Required & Security Safeguards</b>", styles['TableHead'])
        ],
        [
            Paragraph("<b>Step 1: Download AnyDesk</b>", styles['TableCellBold']),
            Paragraph("Visit official <b>anydesk.com</b> or our portal <b>itservicesfreetown.com/remote-support</b>. Download the free lightweight application for Windows or macOS.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Step 2: Launch & Locate Your ID</b>", styles['TableCellBold']),
            Paragraph("Run AnyDesk. On the main window, locate your unique <b>9-digit address</b> (e.g. <code>942 815 304</code>). Share this address ONLY with your verified BridgeTech specialist via WhatsApp.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Step 3: Approve Permission Prompt</b>", styles['TableCellBold']),
            Paragraph("Our technician sends a connection request. A green prompt appears on your screen. Click <b>'Accept'</b>. (On macOS, follow on-screen prompts to allow Screen Recording and Accessibility in System Settings).", styles['TableCell'])
        ],
        [
            Paragraph("<b>Step 4: Supervised Live Session</b>", styles['TableCellBold']),
            Paragraph("You watch everything the technician does live on your screen in real time. Your mouse cursor remains active; you can intervene or terminate the session at any moment by clicking the red 'Cancel' button.", styles['TableCell'])
        ],
    ]
    rem_table = Table(remote_steps, colWidths=[150, 373])
    rem_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GRAY_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(rem_table)

    story.append(Paragraph("<b>3. Zero-Trust Security & Privacy Rules</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "Remote support requires absolute trust. BridgeTech operates under strict professional protocols:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>Never Share Financial Credentials:</b> A BridgeTech technician will <b>NEVER</b> ask you for online banking passwords, credit card PINs, mobile money codes (Orange Money / Afrimoney), or SMS verification codes.", styles['BulletText']))
    story.append(Paragraph("• <b>Type Sensitive Credentials Yourself:</b> If software requires an administrative account login or email password, our technician will pause screen interaction and ask you to type the password privately.", styles['BulletText']))
    story.append(Paragraph("• <b>No Unattended Background Access:</b> Once you close the AnyDesk window, the session terminates completely. Nobody can reconnect to your computer without you actively clicking 'Accept' again.", styles['BulletText']))

    story.append(make_tip_box(
        "Schedule a Remote Session in 2 Minutes",
        "Visit <b>itservicesfreetown.com/remote-support</b> or send a WhatsApp message to <b>+232 33 399391</b> detailing your computer issue. We will schedule a priority session within 30 to 60 minutes."
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 10: CHAPTER 8 - INTAKE CHECKLIST & DIRECTORY
    # ==========================================
    story.append(Paragraph("CHAPTER 08   •   SERVICE PROTOCOL & CONTACT DIRECTORY", styles['ChapterBadge']))
    story.append(Paragraph("Service Intake Checklist & Workshop Center", styles['ChapterTitle']))
    story.append(Paragraph("Everything to prepare before your repair, complete workshop directions, and our service warranties.", styles['ChapterSubtitle']))

    story.append(Paragraph("<b>1. Pre-Repair Customer Intake Checklist</b>", styles['SectionHeading']))
    story.append(Paragraph("Completing these quick checks before bringing your device into the workshop speeds up your repair:", styles['GuideBody']))

    chk_data = [
        [Paragraph("✔", styles['TableCellBold']), Paragraph("<b>Secure Personal Data:</b> Ensure your important documents and media are backed up to a flash drive or cloud service whenever the device still boots.", styles['TableCell'])],
        [Paragraph("✔", styles['TableCellBold']), Paragraph("<b>Bring the Original Power Adapter:</b> For laptops, bringing your specific charger allows us to test voltage stability and rule out barrel plug / USB-C PD faults.", styles['TableCell'])],
        [Paragraph("✔", styles['TableCellBold']), Paragraph("<b>Document Failure History:</b> Note down when the issue began (e.g. after a power cut, software update, drop, or water spill). Honest history saves hours of diagnosis.", styles['TableCell'])],
        [Paragraph("✔", styles['TableCellBold']), Paragraph("<b>Remove Accessories & SIM Cards:</b> Take out SIM cards, SD cards, phone cases, and wireless USB dongles before handing over your device.", styles['TableCell'])],
        [Paragraph("✔", styles['TableCellBold']), Paragraph("<b>Prepare Screen Passcode or Test Account:</b> To test camera, audio, Wi-Fi, and touch after repair, provide a temporary PIN or configure a guest account.", styles['TableCell'])],
        [Paragraph("✔", styles['TableCellBold']), Paragraph("<b>Get an Official Intake Receipt:</b> Ensure you receive an official BridgeTech Job Card with registered serial number, intake condition, and diagnostic notes.", styles['TableCell'])],
    ]
    chk_table = Table(chk_data, colWidths=[20, 503])
    chk_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(chk_table)

    story.append(Paragraph("<b>2. BridgeTech IT Services Hub & Laboratory</b>", styles['SectionHeading']))

    hub_info = [
        [
            Paragraph("<b>Workshop Location</b><br/>#1 Regent Highway, Jui Junction<br/>Freetown, Sierra Leone<br/><i>(Easily accessible from Waterloo, Grafton, Hastings, Lumley & Central Freetown via Regent Highway)</i>", styles['TableCell']),
            Paragraph("<b>Hotline & WhatsApp</b><br/><b>+232 33 399391</b><br/>Email: itservicesfreetown@gmail.com<br/>Web: <b>itservicesfreetown.com</b><br/>Remote Desk: itservicesfreetown.com/remote-support", styles['TableCell']),
            Paragraph("<b>Operating Hours</b><br/>Monday – Friday: 8:30 AM – 6:30 PM<br/>Saturday: 9:00 AM – 5:00 PM<br/>Sunday: Emergency Intake by Call<br/><b>National Emergency Hotline: 117</b>", styles['TableCell'])
        ]
    ]
    hub_table = Table(hub_info, colWidths=[174, 174, 175])
    hub_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, GRAY_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(hub_table)

    story.append(Paragraph("<b>3. The BridgeTech Service Warranty Commitment</b>", styles['SectionHeading']))
    story.append(Paragraph(
        "We stand firmly behind the quality of our craftsmanship and replacement components:",
        styles['GuideBody']
    ))
    story.append(Paragraph("• <b>90-Day Warranty on Screen & Battery Replacements:</b> Covers touch sensitivity defects, ghosting, and battery charging anomalies under normal use.", styles['BulletText']))
    story.append(Paragraph("• <b>30-Day Warranty on Motherboard Micro-Soldering:</b> Covers repaired power rails, charging ICs, and component replacements.", styles['BulletText']))
    story.append(Paragraph("• <b>Free Re-Inspection:</b> If any device experiences recurrence of the reported fault within the warranty window, diagnostic assessment is completely free.", styles['BulletText']))

    story.append(make_info_box(
        "Legal Disclaimer & Safety Note",
        "This handbook provides educational maintenance and triage recommendations based on real-world engineering experience. It is not a substitute for professional laboratory diagnostics when equipment exhibits acute electrical faults, burning odors, lithium battery swelling, or severe liquid ingress. BridgeTech IT Services is an independent technology service enterprise operating in Sierra Leone."
    ))

    # Build PDF with custom NumberedCanvas and cover drawer
    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=draw_cover)
    print("PDF generation complete:", OUTPUT_PDF)


if __name__ == "__main__":
    build_guide_pdf()
