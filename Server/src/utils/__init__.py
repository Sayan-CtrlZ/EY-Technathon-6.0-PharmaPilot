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
    Charts are interspersed with text using placeholders.
    """
    try:
        # 1. Generate Markdown Content with Chart Placeholders
        md_content = f"# Innovation Analysis: {molecule}\n"
        md_content += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        
        # Summary
        md_content += "## Executive Summary\n"
        md_content += f"{research_data.get('summary', 'No summary available.')}\n\n"
        
        # Structured Sections with Chart Placeholders
        sections = [
            ('Market Intelligence', research_data.get('market_data'), 'revenue_forecast'),
            ('Competitive Landscape', research_data.get('market_data'), 'market_share'),
            ('Clinical Trials', research_data.get('clinical_trials'), 'pipeline_summary'),
            ('Trade Insights', research_data.get('trade_data'), 'trade_trends'),
        ]
        
        for title, data, chart_id in sections:
            if data:
                md_content += f"## {title}\n"
                if isinstance(data, dict):
                    # Convert dict to bullet points
                    for key, val in data.items():
                        clean_key = key.replace('_', ' ').title()
                        if isinstance(val, (str, int, float)):
                             md_content += f"- **{clean_key}:** {val}\n"
                        elif isinstance(val, list):
                             md_content += f"- **{clean_key}:**\n"
                             for item in val[:5]:
                                 md_content += f"  * {str(item)}\n"
                else:
                    md_content += str(data) + "\n"
                
                # Insert chart placeholder after section content
                md_content += f"\n{{{{CHART:{chart_id}}}}}\n\n"

        # 2. Generate Chart Images
        chart_images = []
        chart_map = {}  # Map chart IDs to images
        try:
            chart_configs = generate_charts_from_data(research_data)
            
            for chart in chart_configs:
                img_buffer = create_chart_image(
                    chart_type=chart.get('type'),
                    data={'labels': chart.get('labels'), 'values': chart.get('values')},
                    title=chart.get('title')
                )
                if img_buffer:
                    chart_id = chart.get('id')
                    chart_map[chart_id] = img_buffer
                    chart_images.append(img_buffer)
                    
        except Exception as e:
            print(f"Error generating chart images for PDF: {e}")

        # 3. Generate PDF with Content + Images (charts interspersed)
        pdf_bytes = create_pdf_from_markdown(
            md_content, 
            title=f"Pharma Report: {molecule}", 
            images=chart_images,
            chart_map=chart_map  # Pass chart map for inline insertion
        )
        
        return base64.b64encode(pdf_bytes).decode('utf-8')
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return ""
