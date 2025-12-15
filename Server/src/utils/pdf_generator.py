
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem, Image
from io import BytesIO
import re

def create_pdf_from_markdown(markdown_content: str, title: str = "Report", images: list = None) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    if 'BodyText' not in styles:
        styles.add(ParagraphStyle(name='BodyText', parent=styles['Normal'], spaceAfter=6))
    else:
        styles['BodyText'].spaceAfter = 6
    
    # Generate Story
    story = []
    
    # Title Page/Header
    story.append(Paragraph(title, styles['Title']))
    story.append(Spacer(1, 0.5 * inch))
    
    # Content
    story.extend(parse_markdown_to_flowables(markdown_content, styles))
    
    # Append Images if provided
    if images:
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph("Visual Analysis", styles['Heading2']))
        story.append(Spacer(1, 0.2 * inch))
        
        for img_buffer in images:
            if img_buffer:
                # Add image with proper sizing - 5x5 inches is large but balanced
                img = Image(img_buffer, width=5*inch, height=5*inch)
                img._restrictSize(5*inch, 5*inch)  # Maintain aspect ratio within bounds
                story.append(img)
                story.append(Spacer(1, 0.3 * inch))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
