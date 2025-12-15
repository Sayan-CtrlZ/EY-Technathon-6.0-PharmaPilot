from typing import Dict, List, Any

def generate_charts_from_data(research_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Convert raw research data into structured JSON for Chart.js frontend.
    Returns a list of chart configuration objects.
    """
    charts = []
    
    # 1. Revenue Forecast (Line Chart)
    try:
        market_data = research_data.get('market_data', {})
        history = market_data.get('historical_data', [])
        if history:
            # Sort by year just in case
            history = sorted(history, key=lambda x: x.get('year', 0))
            labels = [str(h.get('year')) for h in history]
            values = [h.get('revenue_usd_million') for h in history]
            
            charts.append({
                "id": "revenue_forecast",
                "title": f"Revenue Forecast: {market_data.get('molecule', 'Molecule')}",
                "type": "line",
                "labels": labels,
                "values": values,
                "datasets": [{
                    "label": "Revenue (USD $M)",
                    "data": values,
                    "borderColor": "#4F46E5", # Indigo-600
                    "backgroundColor": "rgba(79, 70, 229, 0.2)",
                    "fill": True
                }]
            })
    except Exception as e:
        print(f"Error generating revenue chart: {e}")

    # 2. Competitor Market Share (Doughnut Chart)
    try:
        comp_landscape = research_data.get('market_data', {}).get('competitive_landscape', {})
        competitors = comp_landscape.get('top_10_manufacturers', [])
        if competitors:
            # Take top 5 for cleaner chart
            top_5 = sorted(competitors, key=lambda x: x.get('market_share_percent', 0), reverse=True)[:5]
            labels = [c.get('manufacturer') for c in top_5]
            values = [c.get('market_share_percent') for c in top_5]
            
            charts.append({
                "id": "market_share",
                "title": "Top 5 Competitors by Market Share",
                "type": "pie",
                "labels": labels,
                "values": values,
                "datasets": [{
                    "label": "Market Share (%)",
                    "data": values,
                    "backgroundColor": [
                        "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"
                    ]
                }]
            })
    except Exception as e:
        print(f"Error generating particular share chart: {e}")

    # 3. Clinical Pipeline Summary (Bar Chart)
    try:
        pipeline = research_data.get('clinical_trials', {}).get('pipeline_summary', {})
        if pipeline:
            labels = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"]
            values = [
                pipeline.get("phase_1_count", 0),
                pipeline.get("phase_2_count", 0),
                pipeline.get("phase_3_count", 0),
                pipeline.get("phase_4_count", 0)
            ]
            
            charts.append({
                "id": "pipeline_summary",
                "title": "Clinical Pipeline by Phase",
                "type": "bar",
                "labels": labels,
                "values": values,
                "datasets": [{
                    "label": "Number of Trials",
                    "data": values,
                    "backgroundColor": "#0EA5E9" # Sky-500
                }]
            })
    except Exception as e:
        print(f"Error generating pipeline chart: {e}")

    # 4. Import/Export Trends (Bar Chart)
    try:
        trade = research_data.get('trade_data', {}).get('quarterly_trends', [])
        if trade:
            labels = [t.get('quarter') for t in trade]
            imports = [t.get('import_volume_kg') for t in trade]
            exports = [t.get('export_volume_kg') for t in trade]
            
            charts.append({
                "id": "trade_trends",
                "title": "Quarterly Import/Export Volume",
                "type": "line",
                "labels": labels,
                "values": imports,
                "datasets": [
                    {
                        "label": "Imports (kg)",
                        "data": imports,
                        "backgroundColor": "#10B981" # Emerald-500
                    },
                    {
                        "label": "Exports (kg)",
                        "data": exports,
                        "backgroundColor": "#F43F5E" # Rose-500
                    }
                ]
            })
    except Exception as e:
        print(f"Error generating trade chart: {e}")

    return charts
