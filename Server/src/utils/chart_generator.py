
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg
import io
from typing import Dict, List, Any

def create_chart_image(chart_type: str, data: Dict[str, Any], title: str = "") -> io.BytesIO:
    """
    Generate a chart image using Matplotlib Object-Oriented API (Thread-Safe).
    """
    labels = data.get('labels', [])
    values = data.get('values', [])
    
    if not labels or not values:
        return None

    # Create Figure explicitly (Thread-Safe)
    # Use VERY large square figure for Pie/Doughnut to maximize visibility in PDF
    if chart_type in ['doughnut', 'pie']:
        fig = Figure(figsize=(10, 10))
    else:
        fig = Figure(figsize=(6, 4))
        
    canvas = FigureCanvasAgg(fig)
    ax = fig.add_subplot(111)

    # Aesthetic Improvements
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#6B7280') # Cool Gray 500
    ax.spines['bottom'].set_color('#6B7280')
    ax.tick_params(colors='#6B7280')
    
    if chart_type == 'line':
        ax.plot(labels, values, marker='o', markersize=8, linestyle='-', color='#4F46E5', linewidth=3, zorder=3)
        ax.fill_between(labels, values, color='#4F46E5', alpha=0.1, zorder=2)
        # Chart.js style grid: Solid, Light Gray
        ax.grid(True, linestyle='-', color='#E5E7EB', zorder=0) 
        
        # Add value labels
        for x, y in zip(labels, values):
            ax.annotate(f'{y:.1f}', (x, y), textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='#4F46E5', fontweight='bold')
            
    elif chart_type == 'bar':
        colors = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        bar_colors = [colors[i % len(colors)] for i in range(len(labels))]
        
        # Wider Bars (0.6) and Z-Order
        bars = ax.bar(labels, values, color=bar_colors, width=0.6, zorder=3, alpha=0.9)
        # Chart.js style grid: Solid, vertical only often? No, usually horizontal for bar.
        ax.grid(axis='y', linestyle='-', color='#D1D5DB', zorder=0) # Slightly darker for visibility implies "UI like"
        
        # Add value labels on top of bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height}',
                    ha='center', va='bottom', fontsize=9, color='#374151', fontweight='bold')

    elif chart_type == 'doughnut' or chart_type == 'pie':
        ax.axis('equal')
        wedges, texts, autotexts = ax.pie(values, labels=labels, autopct='%1.1f%%', startangle=90, 
                colors=['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                radius=1.5,  # Make pie chart 50% larger than default
                pctdistance=0.85 if chart_type == 'doughnut' else 0.6,
                textprops={'fontsize': 12})
        
        # Style text
        for text in texts:
            text.set_color('#374151')
            text.set_fontsize(9)
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            
        if chart_type == 'doughnut':
            from matplotlib.patches import Circle
            circle = Circle((0,0), 0.60, fc='white')
            ax.add_artist(circle)
            
    if title:
        ax.set_title(title, pad=15, fontsize=12, fontweight='bold')
        
    fig.tight_layout()
    
    img_buffer = io.BytesIO()
    canvas.print_png(img_buffer)
    img_buffer.seek(0)
    
    return img_buffer
