"""Routes - Chat and Health Blueprints"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from crewai import Crew, Process, Task
from .health import health_bp
from src.agents import (
    create_master_agent,
    create_iqvia_agent,
    create_exim_agent,
    create_patent_agent,
    create_clinical_trials_agent,
    create_internal_knowledge_agent,
    create_web_intelligence_agent,
    create_report_generator_agent
)
from src.utils.chart_utils import generate_charts_from_data
from src.utils import generate_pdf_report
from src.data import MockDataSources

# Chat blueprint with /api/v1 prefix
chat_bp = Blueprint('chat', __name__, url_prefix='/api/v1')

# Export both blueprints
__all__ = ['chat_bp', 'health_bp']


@chat_bp.route('/chat', methods=['POST'])
@chat_bp.route('/chat/generate', methods=['POST'])
def chat():
    """Main chat endpoint for Agentic AI system"""
    try:
        data = request.get_json()
        # Support both formats: 'query'/'molecule' and 'prompt'
        user_query = data.get('query') or data.get('prompt', '')
        molecule = data.get('molecule', '')
        
        # If only prompt is provided, use it as the query
        if not user_query:
            return jsonify({"error": "Query or prompt is required", "detail": "Query or prompt is required"}), 400
        
        # If molecule is not provided, try to extract from query or use a default
        if not molecule and user_query:
            # For now, use the query as molecule if not specified
            # In production, you might want to extract molecule name from query
            molecule = user_query.split()[0] if user_query else ''

        # Create all agents
        master = create_master_agent()
        iqvia_agent = create_iqvia_agent()
        exim_agent = create_exim_agent()
        patent_agent = create_patent_agent()
        trials_agent = create_clinical_trials_agent()
        internal_agent = create_internal_knowledge_agent()
        web_agent = create_web_intelligence_agent()
        report_agent = create_report_generator_agent()

        # Create tasks
        tasks = []

        # Task 1: Market Analysis with IQVIA Data
        market_task = Task(
            description=f"""Conduct comprehensive market analysis for {molecule} using IQVIA data:
            
            1. Calculate Total Addressable Market (TAM) and CAGR (5-year) trajectory
            2. Identify top 5-10 manufacturers by market share and competitive positioning
            3. Segment market by formulation type (Oral, Injectable, Topical) and dosage strength
            4. Flag any Year-to-Date (YTD) data and estimate full-year figures using Q1-Q3 annualized run rates
            5. Normalize all revenue to USD using average annual exchange rates
            6. Apply fuzzy matching for spelling variations (e.g., Acetaminophen vs Paracetamol)
            7. If molecule-specific data is sparse, automatically broaden search to therapeutic class level with clear flagging
            
            Provide structured tables with Year, Revenue ($M), Units Sold, Growth %.
            Include graphs showing growth trends and market share distribution.""",
            agent=iqvia_agent,
            expected_output="""Detailed market analysis including:
            - TAM and CAGR projections with confidence levels
            - Top 10 competitors with market share percentages
            - Formulation segmentation by revenue and volume
            - Historical 5-year revenue trends
            - Data quality flags (YTD status, currency normalization notes, fuzzy matching applied)
            - Therapeutic class generalization (if applicable)"""
        )
        tasks.append(market_task)

        # Task 2: Patent Landscape Analysis
        patent_task = Task(
            description=f"""Analyze patent landscape for {molecule} with Freedom to Operate (FTO) and Loss of Exclusivity (LoE) assessment:
            
            1. Distinguish between patent types: Composition of Matter (strongest), Process, Formulation, and Use patents
            2. Calculate statutory expiry dates including potential extensions (SPC in Europe, PTE in US)
            3. Cross-reference with Orange Book and legal dockets for Paragraph IV certifications and ongoing litigation
            4. Identify "secondary patents" filed late to extend monopoly; flag separately from primary patents (evergreening detection)
            5. Verify legal status (exclude abandoned/lapsed patents with unpaid fees)
            6. Prioritize US, EU5, and Japan for global analysis; group "Rest of World" to avoid data overload
            7. Generate risk-flagged timeline: 🔴 High Risk (Active CoM), 🟡 Medium Risk (Process Patent), 🟢 Low Risk (Expired)
            
            Provide Gantt chart showing patent lifespans vs. current date.""",
            agent=patent_agent,
            expected_output="""Patent landscape analysis including:
            - Risk flags (🔴 High, 🟡 Medium, 🟢 Low) with justification
            - Patent family breakdown by type and jurisdiction
            - Loss of Exclusivity (LoE) timeline and estimated generic entry date
            - Litigation status and Paragraph IV challenges
            - Evergreening strategy assessment (secondary patents)
            - Recommended patent management actions"""
        )
        tasks.append(patent_task)

        # Task 3: Clinical Trials Pipeline Analysis
        trials_task = Task(
            description=f"""Analyze R&D pipeline and competitor clinical trials for {molecule}:
            
            1. Filter for trials currently "Recruiting" or "Active, not recruiting" (exclude Terminated/Completed)
            2. Extract Primary Endpoints (e.g., OS, PFS, HbA1c reduction) and Inclusion/Exclusion criteria
            3. Predict completion dates based on start date, phase duration, and target enrollment
            4. Group trials by Indication (if drug in trials for multiple diseases, organize by disease area)
            5. Apply MeSH terminology for disease synonyms (e.g., Breast Cancer → Breast Neoplasm → Carcinoma)
            6. Clearly distinguish Terminated/Withdrawn trials from Completed; fetch termination reasons when available
            7. Estimate timelines for each phase transition and likely approval pathway
            
            Provide enrollment graphs (target vs. actual), phase distribution, and indication breakdown.""",
            agent=trials_agent,
            expected_output="""Clinical trials summary including:
            - Active trial count by phase and indication
            - Summary table with NCT ID, Drug Name, Phase, Sponsor, Est. Completion Date, Status
            - Primary endpoints and trial design summary per indication
            - Enrollment graphs and recruitment status
            - Emerging indications and competitive positioning
            - Estimated timelines to key milestones (Phase 3 completion, NDA filing)
            - Terminated/Withdrawn trial analysis with reasons (if available)"""
        )
        tasks.append(trials_task)

        # Task 4: Trade & Supply Chain Analysis
        trade_task = Task(
            description=f"""Analyze import-export trends and supply chain dynamics for {molecule}:
            
            1. Compare Import/Export quantities (kg/tons) against unit price to detect price erosion or premium pricing
            2. Extract major exporters (potential API suppliers) and importers (potential competitors)
            3. Identify sudden import spikes signaling potential launches or shortages
            4. Standardize mixed units (grams, kgs, metric tons) into kg for consistent aggregation
            5. Flag outlier transactions where unit price is >2 standard deviations from mean (sample shipments, R&D quantities)
            6. Handle HS Code ambiguity: fetch "Basket Codes" if specific molecule code unavailable; warn user
            7. Assess supply chain fragility and sourcing concentration risks
            
            Provide trade tables with Date, Supplier, Buyer, Quantity, Unit Price, Port of Entry.""",
            agent=exim_agent,
            expected_output="""Trade analysis including:
            - Import/Export volume and value trends (last 3 years)
            - Top 5 exporters and importers with unit pricing
            - Unit conversion confirmation (all in kg)
            - Price erosion analysis by geography
            - Supply chain risk assessment (concentration, volatility)
            - Anomaly detection report (outlier transactions flagged)
            - HS Code usage note and data limitations
            - Insights on supply chain resilience and sourcing opportunities"""
        )
        tasks.append(trade_task)

        # Task 5: Internal Knowledge & Strategy Alignment
        internal_task = Task(
            description=f"""Search internal documents and strategic plans for insights on {molecule}:
            
            1. Answer natural language questions using RAG (Retrieval-Augmented Generation) on internal PDFs
            2. Aggregate findings across multiple documents (e.g., "Summarize competitive sentiment from 2023 reports")
            3. Process scanned PDFs with OCR (Optical Character Recognition) layer for non-text documents
            4. Always cite source: provide filename and page number for every claim
            5. Report conflicting information from different documents with dates to show evolution of thought
            6. Maintain strict boundaries: reply "Information not found in internal documents" rather than hallucinate
            7. Assess alignment with company portfolio, capabilities, and strategic priorities
            
            Cross-reference market findings with internal strategic positioning.""",
            agent=internal_agent,
            expected_output="""Internal insights including:
            - Relevant internal documents with relevance scores and page references
            - Key takeaways with precise source citations [Filename, Page #]
            - Strategic alignment assessment (portfolio fit, capability gaps)
            - Field feedback and KOL sentiment (with source dates)
            - Conflicting perspectives from different documents (if applicable)
            - Recommendations based on internal strategic priorities
            - Confidential insights on company positioning"""
        )
        tasks.append(internal_task)

        # Task 6: Web Intelligence & External Context
        web_task = Task(
            description=f"""Fetch real-world external context for {molecule} from high-credibility sources:
            
            1. Whitelist high-credibility domains: FDA.gov, EMA.europa.eu, nih.gov, major medical journals
            2. Blacklist social media and patient forums to avoid anecdotal noise
            3. Summarize first-line vs. second-line treatment recommendations from clinical guidelines
            4. Fetch Regulatory approvals, M&A activity, and Safety alerts from last 6 months
            5. Detect paywalled content; search for open-access summaries or press releases of same event
            6. Verify "current guidelines" are actually latest; explicitly search for updates if older versions found
            7. Assess emerging trends and unmet medical needs in the indication area
            
            Provide concise summaries with embedded hyperlinks to verified sources.""",
            agent=web_agent,
            expected_output="""Web intelligence including:
            - Summary of latest scientific publications (with credibility scores)
            - Current clinical guidelines (first-line vs. second-line recommendations)
            - Recent regulatory approvals and safety alerts (last 6 months)
            - M&A activity and partnerships in the space
            - Guidelines verification note (date confirmed as latest)
            - Open-access article alternatives (for paywalled content)
            - Emerging trends and competitive landscape shifts
            - Data source credibility assessment"""
        )
        tasks.append(web_task)

        # Task 7: Comprehensive Innovation Report
        report_task = Task(
            description=f"""Synthesize all research findings from Agents 1-6 into a professional, cohesive innovation report:
            
            STRUCTURE (Executive-ready format):
            1. **Executive Summary** (1 page): Synthesis connecting dots across all domains
               - Link Patent Expiry (Agent 3) to Generic Import Timelines (Agent 2)
               - Connect Clinical Pipeline (Agent 4) to Market Opportunity (Agent 1)
               - Highlight Strategic Fit (Agent 5) and External Trends (Agent 6)
            
            2. **Market Opportunity**: IQVIA data with TAM, CAGR, competitive positioning
            3. **Patent Strategy**: FTO assessment, LoE timeline, IP risks and opportunities
            4. **Clinical Development**: Pipeline status, emerging indications, timelines
            5. **Supply Chain Considerations**: Trade insights, sourcing opportunities, risks
            6. **Strategic Recommendations**: Actionable next steps aligned with company priorities
            
            FORMATTING:
            - Maintain tables and charts from original outputs
            - Render Markdown charts into static images
            - Apply corporate branding (fonts, colors) if specified
            - Replace missing agent outputs with "No data available" (never blank/crash)
            
            EDGE CASE HANDLING:
            - If total content exceeds context window, use map-reduce approach
            - Summarize section-by-section before final compilation
            - Ensure all sources and citations are preserved
            
            Based on user query: {user_query}""",
            agent=report_agent,
            expected_output="""Comprehensive innovation opportunity report including:
            - Professional executive summary (1-2 pages)
            - Structured sections: Market, Patents, Clinical, Supply Chain, Strategy
            - All tables and visualizations formatted for professional presentation
            - Source citations and data quality notes throughout
            - Actionable recommendations with implementation roadmap
            - Appendix with detailed data tables and methodology notes
            - Report ready for C-suite presentation""",
            context=tasks
        )
        tasks.append(report_task)

        # Create and run crew
        crew = Crew(
            agents=[master, iqvia_agent, exim_agent, patent_agent, trials_agent,
                   internal_agent, web_agent, report_agent],
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )

        # Execute the crew
        result = crew.kickoff()
        
        # Extract clean text
        final_answer = ""
        if hasattr(result, 'raw'):
            final_answer = result.raw
        else:
            final_answer = str(result)

        # Compile research data
        research_data = {
            'summary': final_answer,
            'market_data': MockDataSources.search_iqvia(molecule),
            'patent_data': MockDataSources.search_patents(molecule),
            'clinical_trials': MockDataSources.search_clinical_trials(molecule),
            'trade_data': MockDataSources.search_exim(molecule),
            'timestamp': datetime.now().isoformat()
        }



        # Generate PDF report
        pdf_base64 = generate_pdf_report(research_data, molecule)
        
        # Generate Charts for Frontend
        frontend_charts = generate_charts_from_data(research_data)

        # Return response in format expected by frontend
        response_data = {
            'status': 'success',
            'response': final_answer,
            'content': final_answer,  # Frontend expects 'content' field
            'research_data': research_data,
            'report_pdf': pdf_base64,
            'molecule': molecule,
            'timestamp': datetime.now().isoformat(),
            'charts': frontend_charts  # Populated with Chart.js data
        }
        return jsonify(response_data)

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Chat error: {str(e)}")
        print(error_trace)
        
        # Write to log file for agent debugging
        try:
            with open("error.log", "a", encoding="utf-8") as f:
                f.write(f"\n[{datetime.now()}] ERROR IN CHAT:\n{error_trace}\n{'-'*50}\n")
        except:
            pass
            
        return jsonify({
            'status': 'error',
            'error': str(e),
            'detail': str(e)
        }), 500
