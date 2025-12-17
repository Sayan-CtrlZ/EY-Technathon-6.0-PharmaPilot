
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg
import io
from typing import Dict, List, Any

def create_chart_image(chart_type: str, data: Dict[str, Any], title: str = "") -> io.BytesIO:
    """
    Generate PROFESSIONAL, publication-quality chart images for PDF reports.
    Enhanced with larger sizes, better fonts, and polished aesthetics.
    """
    labels = data.get('labels', [])
    values = data.get('values', [])
    
    if not labels or not values:
        return None

    # LARGER figures for better PDF quality
    if chart_type in ['doughnut', 'pie']:
        fig = Figure(figsize=(10, 10), dpi=150)  # LARGER: 10x10 inches for pie charts
    else:
        fig = Figure(figsize=(10, 6), dpi=150)  # Wider for better readability
        
    canvas = FigureCanvasAgg(fig)
    ax = fig.add_subplot(111)

    # Professional styling - clean borders
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#9CA3AF')  # Lighter gray
    ax.spines['bottom'].set_color('#9CA3AF')
    ax.spines['left'].set_linewidth(1.5)
    ax.spines['bottom'].set_linewidth(1.5)
    
    if chart_type == 'line':
        # Professional line chart with soft colors
        ax.plot(range(len(labels)), values, marker='o', markersize=9, linestyle='-', 
                color='#60A5FA', linewidth=3, zorder=3, 
                markerfacecolor='#60A5FA', markeredgecolor='white', markeredgewidth=2)
        ax.fill_between(range(len(labels)), values, color='#60A5FA', alpha=0.12, zorder=2)
        
        # Gray grid lines BEHIND the line - aligned with axis, not border
        ax.grid(True, linestyle='-', color='#D1D5DB', alpha=0.5, linewidth=0.8, zorder=0)
        ax.set_axisbelow(True)
        
        # Ensure grid aligns with axis area only (not outer border)
        ax.set_xlim(-0.5, len(labels) - 0.5)  # Grid stays within axis bounds
        
        # Clean value labels above points (no boxes)
        for i, (x, y) in enumerate(zip(labels, values)):
            ax.annotate(f'{y:.1f}', (i, y), textcoords="offset points", 
                       xytext=(0, 10), ha='center', fontsize=10, 
                       color='#374151', fontweight='bold')
        
        # Proper X and Y axes
        ax.set_xticks(range(len(labels)))
        ax.set_xticklabels(labels, fontsize=10, fontweight='500', color='#374151')
        ax.tick_params(axis='both', labelsize=10, colors='#6B7280', width=1.2)
        
        # Add border around the entire chart area
        for spine in ax.spines.values():
            spine.set_visible(True)
            spine.set_color('#9CA3AF')
            spine.set_linewidth(1.5)
        
        # Set proper margins to prevent text overlap
        ax.margins(y=0.15)  # Only vertical margin, x is controlled by xlim
        
    elif chart_type == 'bar':
        # Soft, professional color palette (not too bright)
        colors = ['#60A5FA', '#34D399', '#FB923C', '#F87171', '#A78BFA', '#F472B6']
        bar_colors = [colors[i % len(colors)] for i in range(len(labels))]
        
        # Clean bars WITHOUT thick borders
        bars = ax.bar(range(len(labels)), values, color=bar_colors, width=0.65, 
                      zorder=3, alpha=0.9, edgecolor='none')  # No borders on bars!
        
        # Gray grid lines BEHIND the bars - aligned with axis, not border
        ax.grid(axis='y', linestyle='-', color='#D1D5DB', alpha=0.5, linewidth=0.8, zorder=0)
        ax.set_axisbelow(True)  # Grid behind bars
        
        # Ensure grid aligns with axis area only (not outer border)
        ax.set_xlim(-0.5, len(labels) - 0.5)  # Grid stays within axis bounds
        
        # Clean value labels above bars (no boxes)
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + (max(values) * 0.02),
                    f'{int(height) if height == int(height) else f"{height:.1f}"}',
                    ha='center', va='bottom', fontsize=10, 
                    color='#374151', fontweight='bold')
        
        # Proper X and Y axes
        ax.set_xticks(range(len(labels)))
        ax.set_xticklabels(labels, fontsize=10, fontweight='500', color='#374151', rotation=0)
        ax.tick_params(axis='both', labelsize=10, colors='#6B7280', width=1.2)
        
        # Y-axis formatting with proper labels
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x)}' if x == int(x) else f'{x:.1f}'))
        
        # Add border around the entire chart area
        for spine in ax.spines.values():
            spine.set_visible(True)
            spine.set_color('#9CA3AF')
            spine.set_linewidth(1.5)
        
        # Set proper margins to prevent text overlap
        ax.margins(y=0.15)  # Only vertical margin, x is controlled by xlim

    elif chart_type == 'doughnut' or chart_type == 'pie':
        # Create pie chart that fits entirely within the figure
        
        # Softer, professional color palette for pie (matching frontend)
        pie_colors = [
            '#60A5FA',  # soft blue
            '#34D399',  # soft green  
            '#FB923C',  # soft orange
            '#F87171',  # soft red
            '#A78BFA',  # soft purple
            '#F472B6',  # soft pink
            '#38BDF8',  # soft sky
            '#FDBA74',  # soft amber
        ]
        
        # Position pie on the left side to make room for legend on right
        ax.set_position([0.1, 0.1, 0.5, 0.8])  # [left, bottom, width, height]
        ax.axis('equal')
        
        # Create clean pie with NO borders and NO gaps
        wedges, texts, autotexts = ax.pie(
            values, 
            labels=None,  # No labels on slices, use legend instead
            autopct='%1.1f%%', 
            startangle=90,
            colors=[pie_colors[i % len(pie_colors)] for i in range(len(values))],
            radius=1.0,
            pctdistance=0.75,
            textprops={'fontsize': 11, 'fontweight': 'bold', 'color': 'white'},
            wedgeprops=dict(width=0.4 if chart_type == 'doughnut' else 1, 
                           edgecolor='none', antialiased=True),  # NO borders!
            # NO explode - slices attached to each other
        )
        
        # Add legend INSIDE the figure on the right side
        legend = ax.legend(wedges, labels, 
                 title="Categories",
                 loc="center left",
                 bbox_to_anchor=(1.1, 0.5),  # Position to the right of pie
                 fontsize=9,
                 title_fontsize=10,
                 frameon=True,
                 fancybox=False,
                 shadow=False,
                 borderpad=0.8,
                 labelspacing=0.6)
        
        # Ensure legend is included in the figure
        legend.set_in_layout(True)
        
        # Enhanced percentage styling
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(11)
            
        # Add center circle for doughnut
        if chart_type == 'doughnut':
            from matplotlib.patches import Circle
            circle = Circle((0, 0), 0.60, fc='white', linewidth=0)
            ax.add_artist(circle)
    
    # Professional title
    if title:
        ax.set_title(title, pad=20, fontsize=14, fontweight='bold', 
                    color='#111827', loc='left')
    
    # Different layout handling for pie charts
    if chart_type in ['doughnut', 'pie']:
        # Don't use tight_layout for pie - we manually positioned everything
        pass
    else:
        fig.tight_layout(pad=1.5)
    
    # Export as high-quality PNG with tight bounding box
    img_buffer = io.BytesIO()
    # For pie charts, don't use bbox_inches='tight' as it might crop the legend
    # For pie charts, don't use bbox_inches='tight' as it might crop the legend
    if chart_type in ['doughnut', 'pie']:
        fig.savefig(img_buffer, format='png', dpi=150)  # Use full figure bounds
    else:
        fig.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')  # Auto-crop for other charts
    img_buffer.seek(0)
    
    return img_buffer


# Import matplotlib.pyplot for formatter
import matplotlib.pyplot as plt
