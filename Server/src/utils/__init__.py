"""PDF Report Generation Utility"""
from io import BytesIO
from datetime import datetime
from typing import Dict
import base64
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors


from .pdf_generator import create_pdf_from_markdown
from .chart_utils import generate_charts_from_data
from .chart_generator import create_chart_image

def generate_pdf_report(research_data: Dict, molecule: str) -> str:
    """
    Generate PDF report using Markdown parser for better formatting.
    Includes visual charts generated from the data.
    """
    try:
        # 1. Generate Markdown Content
        md_content = f"# Innovation Analysis: {molecule}\n"
        md_content += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        
        # Summary
        md_content += "## Executive Summary\n"
        md_content += f"{research_data.get('summary', 'No summary available.')}\n\n"
        
        # Structured Sections (if available)
        sections = [
            ('Market Intelligence', research_data.get('market_data')),
            ('Patent Landscape', research_data.get('patent_data')),
            ('Clinical Trials', research_data.get('clinical_trials')),
            ('Trade Insights', research_data.get('trade_data')),
        ]
        
        for title, data in sections:
            if data:
                md_content += f"## {title}\n"
                if isinstance(data, dict):
                    # Convert dict to bullet points if it's not too complex
                    for key, val in data.items():
                        # Format key cleanly (replace _ with space, title case)
                        clean_key = key.replace('_', ' ').title()
                        if isinstance(val, (str, int, float)):
                             md_content += f"- **{clean_key}:** {val}\n"
                        elif isinstance(val, list):
                             md_content += f"- **{clean_key}:**\n"
                             for item in val[:5]: # Limit list items
                                 md_content += f"  * {str(item)}\n"
                else:
                    md_content += str(data) + "\n"
                md_content += "\n"

        # 2. Generate Chart Images
        chart_images = []
        try:
            # Get chart configs (same logic as frontend)
            chart_configs = generate_charts_from_data(research_data)
            
            for chart in chart_configs:
                # Create Matplotlib image for this chart
                img_buffer = create_chart_image(
                    chart_type=chart.get('type'),
                    data={'labels': chart.get('labels'), 'values': chart.get('values')},
                    title=chart.get('title')
                )
                if img_buffer:
                    chart_images.append(img_buffer)
                    
        except Exception as e:
            print(f"Error generating chart images for PDF: {e}")

        # 3. Generate PDF with Content + Images
        pdf_bytes = create_pdf_from_markdown(md_content, title=f"Pharma Report: {molecule}", images=chart_images)
        
        return base64.b64encode(pdf_bytes).decode('utf-8')
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return ""
