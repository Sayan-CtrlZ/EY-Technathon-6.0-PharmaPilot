
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem, Image, PageBreak
from io import BytesIO
import re

def parse_markdown_to_flowables(markdown_text: str, styles: dict) -> list:
    """
    Parses Markdown text into ReportLab Flowables.
    Supports:
    - Headers (#, ##, ###)
    - Bold (**text**)
    - Lists (- item)
    - Paragraphs
    """
    flowables = []
    lines = markdown_text.split('\n')
    
    current_list_items = []
    
    for line in lines:
        line = line.strip()
        if not line:
            # End current list if any
            if current_list_items:
                flowables.append(ListFlowable(current_list_items, bulletType='bullet', start='circle'))
                current_list_items = []
            continue
            
        # Headers
        if line.startswith('#'):
            # End list if any
            if current_list_items:
                flowables.append(ListFlowable(current_list_items, bulletType='bullet', start='circle'))
                current_list_items = []
                
            level = len(line.split(' ')[0])
            text = line.lstrip('#').strip()
            style_name = 'Heading1' if level == 1 else 'Heading2' if level == 2 else 'Heading3'
            # Check if style exists, else fallback
            style = styles.get(style_name, styles['Normal'])
            flowables.append(Paragraph(text, style))
            flowables.append(Spacer(1, 0.1 * inch))
            
        # List Items
        elif line.startswith('- ') or line.startswith('* '):
            text = line[2:].strip()
            # Convert **bold** to <b>bold</b> for ReportLab
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            current_list_items.append(ListItem(Paragraph(text, styles['BodyText'])))
            
        # Normal Paragraphs
        else:
            # End list if any
            if current_list_items:
                flowables.append(ListFlowable(current_list_items, bulletType='bullet', start='circle'))
                current_list_items = []
                
            # Convert **bold** to <b>bold</b>
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
            flowables.append(Paragraph(text, styles['BodyText']))
            
    # Flush remaining list
    if current_list_items:
        flowables.append(ListFlowable(current_list_items, bulletType='bullet', start='circle'))
        
    return flowables

def create_pdf_from_markdown(markdown_content: str, title: str = "Report", images: list = None, chart_map: dict = None) -> bytes:
    """
    Generate PDF with charts interspersed in text using placeholders.
    chart_map: dict mapping chart IDs to image buffers
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                           topMargin=0.75*inch, bottomMargin=0.75*inch,
                           leftMargin=0.75*inch, rightMargin=0.75*inch)
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
    
    # Parse content and insert charts at placeholders
    if chart_map:
        # Split content by chart placeholders
        parts = re.split(r'\{\{CHART:(\w+)\}\}', markdown_content)
        
        for i, part in enumerate(parts):
            if i % 2 == 0:
                # Text content
                if part.strip():
                    story.extend(parse_markdown_to_flowables(part, styles))
            else:
                # Chart placeholder - insert chart here
                chart_id = part
                if chart_id in chart_map:
                    story.append(Spacer(1, 0.3 * inch))  # Space before chart
                    
                    # Insert chart with proper sizing (5.5x5.5 to fit in page)
                    # We need to read the BytesIO buffer and create a new one because ReportLab might close it?
                    # Actually ReportLab Image takes a file-like object.
                    chart_buffer = chart_map[chart_id]
                    chart_buffer.seek(0)
                    
                    try:
                        img = Image(chart_buffer, width=5.5*inch, height=5.5*inch)
                        # img._restrictSize(5.5*inch, 5.5*inch) # _restrictSize is internal, use width/height args
                        story.append(img)
                        story.append(Spacer(1, 0.4 * inch))  # Space after chart
                    except Exception as e:
                        print(f"Error adding chart image: {e}")
                    
    else:
        # Fallback: render content normally
        story.extend(parse_markdown_to_flowables(markdown_content, styles))
        
        # Append all images at end if no chart map
        if images:
            story.append(Spacer(1, 0.5 * inch))
            story.append(Paragraph("Visual Analysis", styles['Heading2']))
            story.append(Spacer(1, 0.3 * inch))
            
            for img_buffer in images:
                if img_buffer:
                    img_buffer.seek(0)
                    img = Image(img_buffer, width=5.5*inch, height=5.5*inch)
                    story.append(img)
                    story.append(Spacer(1, 0.4 * inch))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
