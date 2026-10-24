import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_resume(output_path="Siddhant_Salunkhe_Resume.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=23,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1E1B4B')
    )

    contact_style = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4B5563')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=colors.HexColor('#312E81'),
        spaceAfter=2,
        spaceBefore=5
    )

    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1F2937')
    )

    bold_body = ParagraphStyle(
        'ResumeBoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'ResumeBullet',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2
    )

    story = []

    # Header: Name & Contact
    story.append(Paragraph("Siddhant Salunkhe", name_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Email: siddhant.salunkhe@gmail.com  |  Phone: +91 98765 43210  |  LinkedIn: linkedin.com/in/siddhant-salunkhe", contact_style))
    story.append(Paragraph("GitHub: github.com/siddhant-salunkhe  |  Portfolio: siddhant-dev.io  |  Location: Pune, India", contact_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#4338CA'), spaceBefore=1, spaceAfter=5))

    # Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=1, spaceAfter=4))
    story.append(Paragraph(
        "Results-driven Full-Stack Software & Web Developer with expertise in building responsive React applications, "
        "scalable Node.js/Python microservices, and high-performance RESTful APIs. Experienced in state management, "
        "real-time WebSockets, Redis caching, and relational/NoSQL database design. Passionate about writing clean, maintainable "
        "code and creating intuitive user experiences.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Technical Skills
    story.append(Paragraph("TECHNICAL SKILLS", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=1, spaceAfter=4))
    
    skills_data = [
        [Paragraph("<b>Frontend:</b>", bold_body), Paragraph("React.js, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Redux Toolkit", body_style)],
        [Paragraph("<b>Backend:</b>", bold_body), Paragraph("Node.js, Express.js, Python, FastAPI, RESTful APIs, WebSockets, JWT Authentication, Microservices", body_style)],
        [Paragraph("<b>Databases:</b>", bold_body), Paragraph("PostgreSQL, MongoDB, Redis (Caching & Session Store), MySQL", body_style)],
        [Paragraph("<b>DevOps & Tools:</b>", bold_body), Paragraph("Git, GitHub, Docker, Postman, Linux / Bash, CI/CD Actions, Vite", body_style)],
    ]
    
    skills_table = Table(skills_data, colWidths=[95, 445])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 4))

    # Professional Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=1, spaceAfter=4))

    story.append(Paragraph("<b>Full-Stack Web Developer</b> — <i>TechNova Solutions</i> &nbsp;&nbsp;|&nbsp;&nbsp; 2023 – Present", bold_body))
    story.append(Paragraph("• Architected responsive client-facing web applications using React 18, Tailwind CSS, and Node.js.", bullet_style))
    story.append(Paragraph("• Engineered secure RESTful APIs with Express and PostgreSQL, processing 25,000+ daily requests with sub-100ms response times.", bullet_style))
    story.append(Paragraph("• Implemented Redis caching layers for catalog data, reducing primary database load by 42%.", bullet_style))
    story.append(Paragraph("• Configured automated CI/CD deployment pipelines using GitHub Actions and containerized services using Docker.", bullet_style))
    story.append(Spacer(1, 3))

    story.append(Paragraph("<b>Software Developer Intern</b> — <i>Apex Digital Labs</i> &nbsp;&nbsp;|&nbsp;&nbsp; 2022 – 2023", bold_body))
    story.append(Paragraph("• Developed modular React UI component libraries with accessible keyboard navigation and state management.", bullet_style))
    story.append(Paragraph("• Migrated legacy endpoints into modern Python FastAPI asynchronous microservices, improving throughput by 30%.", bullet_style))
    story.append(Paragraph("• Authored unit and automated integration tests using Jest and Pytest, boosting overall test coverage to 85%.", bullet_style))
    story.append(Spacer(1, 4))

    # Featured Projects
    story.append(Paragraph("FEATURED PROJECTS", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=1, spaceAfter=4))

    story.append(Paragraph("<b>CloudSync — Real-Time Collaborative Workspace</b> (React, Node.js, Socket.io, PostgreSQL)", bold_body))
    story.append(Paragraph("• Developed a collaborative document platform supporting multi-user concurrent edits with conflict-free replication.", bullet_style))
    story.append(Paragraph("• Integrated WebSockets for sub-50ms sync and implemented JWT authentication with role-based access control.", bullet_style))
    story.append(Spacer(1, 3))

    story.append(Paragraph("<b>ShopSphere — Distributed E-Commerce Backend</b> (Python, FastAPI, Redis, Docker, MongoDB)", bold_body))
    story.append(Paragraph("• Designed high-throughput ordering service with Redis distributed locking to prevent inventory race conditions during flash sales.", bullet_style))
    story.append(Paragraph("• Implemented automated OpenAPI documentation and containerized the multi-service setup with Docker Compose.", bullet_style))
    story.append(Spacer(1, 4))

    # Education
    story.append(Paragraph("EDUCATION", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=1, spaceAfter=4))
    story.append(Paragraph("<b>Bachelor of Technology (B.Tech) in Computer Science & Engineering</b>", bold_body))
    story.append(Paragraph("Savitribai Phule Pune University (SPPU)  |  CGPA: 8.8 / 10.0  |  Graduated 2024", body_style))

    # Build PDF
    doc.build(story)
    print(f"Successfully generated single-page resume PDF at: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    generate_resume()
