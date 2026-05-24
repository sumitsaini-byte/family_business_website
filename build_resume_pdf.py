from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT_PATH = "/Users/sumit/Desktop/heeee copy 6/Sumit_Saini_Resume_Updated.pdf"
PHOTO_PATH = "/private/tmp/pages_resume_extract/Data/pasted-movie-enhanced-42.png"


styles = getSampleStyleSheet()
base = ParagraphStyle(
    "Base",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=10.2,
    leading=12,
    spaceAfter=0,
)
name_style = ParagraphStyle(
    "Name",
    parent=base,
    fontName="Times-Bold",
    fontSize=19,
    leading=21,
    spaceAfter=2,
)
contact_style = ParagraphStyle(
    "Contact",
    parent=base,
    fontSize=10.1,
    leading=11.3,
)
section_style = ParagraphStyle(
    "Section",
    parent=base,
    fontName="Times-Bold",
    fontSize=13,
    leading=14,
    spaceBefore=6,
    spaceAfter=3,
)
body_style = ParagraphStyle(
    "Body",
    parent=base,
    alignment=0,
)
italic_style = ParagraphStyle(
    "Italic",
    parent=base,
    fontName="Times-Italic",
)
bullet_style = ParagraphStyle(
    "Bullet",
    parent=base,
    leftIndent=14,
    firstLineIndent=-8,
    bulletIndent=0,
)


def section_heading(text):
    return Table(
        [[Paragraph(text, section_style)]],
        colWidths=[7.22 * inch],
        style=TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, -1), 1, colors.black),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        ),
    )


def bullet_para(text):
    return Paragraph(f"• {text}", bullet_style)


doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=letter,
    leftMargin=0.62 * inch,
    rightMargin=0.62 * inch,
    topMargin=0.46 * inch,
    bottomMargin=0.42 * inch,
)

story = []

header_left = [
    Paragraph("SUMIT SAINI", name_style),
    Paragraph(
        "<u>sumitsaini-byte · GitHub</u> &nbsp;&nbsp;&nbsp; <u>linkedin.com/in/sumit-saini-25a340317</u>",
        contact_style,
    ),
    Paragraph(
        "<u>sumit.sainisahb@gmail.com</u> &nbsp;&nbsp;&nbsp; 9654007110 &nbsp;&nbsp;&nbsp; Delhi Rohini, India.",
        contact_style,
    ),
]

header = Table(
    [
        [
            header_left,
            Image(PHOTO_PATH, width=0.98 * inch, height=1.15 * inch),
        ]
    ],
    colWidths=[6.0 * inch, 1.05 * inch],
    style=TableStyle(
        [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ]
    ),
)
story.append(header)
story.append(Spacer(1, 0.06 * inch))

story.append(section_heading("Profile"))
story.append(
    Paragraph(
        "Motivated MCA student with strong skills in full-stack web development and real-world project experience. "
        "Passionate about applying technology in practical scenarios, especially in the finance domain. "
        "Quick learner, team-oriented, and open to international opportunities.",
        body_style,
    )
)

story.append(section_heading("Education"))
story.extend(
    [
        Paragraph("<b>Master of Computer Applications (MCA)</b> <font size='10'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2024 - 2026</font>", body_style),
        Paragraph("Jagan Institute of Management Studies (JIMS), Rohini, Delhi", italic_style),
        Spacer(1, 0.02 * inch),
        Paragraph("<b>Bachelor of Computer Applications (BCA), Web Development</b> <font size='10'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2021 - 2024</font>", body_style),
        Paragraph("Sirifort Institute of Management Studies, IP University, Sector 25, Rohini, Delhi", italic_style),
        Paragraph("Percentage: 75%", body_style),
        Spacer(1, 0.02 * inch),
        Paragraph("<b>Senior Secondary (XII), Commerce, DAV Public School, Delhi</b> <font size='10'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2020 - 2021</font>", body_style),
        Paragraph("CGPA: 7.25/10", body_style),
    ]
)

story.append(section_heading("Technical Skills"))
skill_lines = [
    "<b>Languages:</b> Java, C, JavaScript, Python, C++, PHP",
    "<b>Web Development:</b> HTML5, CSS, React.js, Angular, Bootstrap",
    "<b>Backend:</b> Node.js, Express.js, Spring Boot, REST APIs",
    "<b>Database:</b> MySQL, MongoDB, SQL Server",
    "<b>Cloud Basics:</b> Git, Docker",
    "<b>Tools:</b> Postman, VS Code, IntelliJ, GitHub",
    "<b>Concepts:</b> DSA, OOP",
]
story.extend(
    [
        *[bullet_para(line) for line in skill_lines]
    ]
)

story.append(section_heading("Projects"))
project_1 = KeepTogether(
    [
        Paragraph("<b>Hotel Management Website (Mar 2024 - May 2024)</b>", body_style),
        Paragraph("A full-stack hotel management system for customer bookings and admin control.", body_style),
        bullet_para("Built user login/register, room filtering, booking/cancellation system, and admin dashboard using PHP and MySQL."),
        bullet_para("Designed a mobile-responsive UI using Bootstrap, focusing on usability and smooth session handling."),
    ]
)
project_2 = KeepTogether(
    [
        Paragraph("<b>MERN E-commerce Website for Father's Business (Jul 2025 - Sep 2025)</b>", body_style),
        Paragraph("Designed and developed a responsive e-commerce website for my father's men's fashion business.", body_style),
        bullet_para("Built product catalog, customer authentication, cart, and order flow using MongoDB, Express.js, React.js, and Node.js."),
        bullet_para("Implemented both frontend and backend modules with a mobile-friendly UI and business-focused usability for daily operations."),
    ]
)
story.extend([project_1, Spacer(1, 0.02 * inch), project_2])

story.append(section_heading("Certifications"))
story.append(bullet_para("<u>Alpha DSA with Java : Apna College (Shadha Khapra)</u>"))
story.append(bullet_para("<b><u>The Complete Web Developer Course 3.0 : Udemy (31 hours, Rob Percival, Lodestars)</u></b>"))

doc.build(story)
print(OUTPUT_PATH)
