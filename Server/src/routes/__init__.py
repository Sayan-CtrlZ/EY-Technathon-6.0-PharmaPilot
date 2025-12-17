"""Routes - Chat and Health Blueprints"""
# Provide a small Windows-compatible fallback for missing Unix signals
import signal
if not hasattr(signal, "SIGHUP"):
    signal.SIGHUP = 1
if not hasattr(signal, "SIGCHLD"):
    signal.SIGCHLD = 17
if not hasattr(signal, "SIGALRM"):
    signal.SIGALRM = 14
if not hasattr(signal, "SIGTSTP"):
    signal.SIGTSTP = 18
if not hasattr(signal, "SIGCONT"):
    signal.SIGCONT = 19

import json
from flask import Blueprint, request, jsonify
from datetime import datetime
from crewai import Crew, Process, Task, LLM
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
from src.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TEMPERATURE
from src.utils import generate_pdf_report
from src.utils.chart_utils import generate_charts_from_data
from src.data import MockDataSources

# Chat blueprint
chat_bp = Blueprint('chat', __name__, url_prefix='/api/v1')

# Export both blueprints
__all__ = ['chat_bp', 'health_bp']

# Agent registry mapping agent names to their factory functions
AGENT_REGISTRY = {
    'market': {
        'name': 'IQVIA Market Analysis',
        'factory': create_iqvia_agent,
        'keywords': ['market', 'tam', 'cagr', 'revenue', 'sales', 'competitors', 'market share', 'pricing']
    },
    'patent': {
        'name': 'Patent Landscape',
        'factory': create_patent_agent,
        'keywords': ['patent', 'ip', 'intellectual property', 'fto', 'freedom to operate', 'expiry', 'loe', 'litigation']
    },
    'trials': {
        'name': 'Clinical Trials',
        'factory': create_clinical_trials_agent,
        'keywords': ['clinical', 'trials', 'pipeline', 'phase', 'fda', 'approval', 'endpoint', 'enrollment']
    },
    'trade': {
        'name': 'Trade & Supply Chain',
        'factory': create_exim_agent,
        'keywords': ['trade', 'import', 'export', 'supply chain', 'api', 'supplier', 'exim', 'sourcing']
    },
    'internal': {
        'name': 'Internal Knowledge',
        'factory': create_internal_knowledge_agent,
        'keywords': ['internal', 'strategy', 'portfolio', 'documents', 'company', 'proprietary']
    },
    'web': {
        'name': 'Web Intelligence',
        'factory': create_web_intelligence_agent,
        'keywords': ['web', 'news', 'regulatory', 'guidelines', 'publications', 'recent', 'external', 'search']
    }
}


def determine_required_agents(user_query: str, molecule: str) -> list:
    """
    Use keyword matching and LLM to determine which agents are needed.
    Returns a list of agent keys from AGENT_REGISTRY.
    """
    # First, try keyword matching for quick resolution
    query_lower = user_query.lower()
    matched_agents = []
    
    for agent_key, agent_info in AGENT_REGISTRY.items():
        for keyword in agent_info['keywords']:
            if keyword in query_lower:
                if agent_key not in matched_agents:
                    matched_agents.append(agent_key)
                break
    
    # If clear keyword matches found, use those
    if matched_agents:
        return matched_agents
    
    # Otherwise, use LLM to determine which agents are needed
    llm = LLM(
        model=f"gemini/{GEMINI_MODEL}",
        temperature=0.1,  # Low temperature for deterministic output
        api_key=GEMINI_API_KEY,
    )
    
    master = create_master_agent()
    
    routing_task = Task(
        description=f"""Analyze this user query and determine which research agents are needed.
        
User Query: "{user_query}"
Molecule: "{molecule}"

Available agents:
- market: For market analysis, TAM, CAGR, revenue, competitors, market share
- patent: For patent landscape, IP, FTO, expiry dates, litigation
- trials: For clinical trials, pipeline, phases, FDA approvals
- trade: For import/export data, supply chain, suppliers
- internal: For internal company documents and strategy
- web: For web search, news, regulatory updates, guidelines

Return ONLY a JSON array of agent keys needed. Example: ["market", "patent"]
If the query is general or comprehensive, return all agents: ["market", "patent", "trials", "trade", "internal", "web"]

Return ONLY the JSON array, nothing else.""",
        agent=master,
        expected_output="JSON array of agent keys"
    )
    
    try:
        routing_crew = Crew(
            agents=[master],
            tasks=[routing_task],
            process=Process.sequential,
            verbose=False
        )
        result = routing_crew.kickoff()
        
        # Parse the result to get agent list
        result_str = str(result).strip()
        if '[' in result_str and ']' in result_str:
            start = result_str.find('[')
            end = result_str.rfind(']') + 1
            agents_list = json.loads(result_str[start:end])
            valid_agents = [a for a in agents_list if a in AGENT_REGISTRY]
            if valid_agents:
                return valid_agents
    except Exception as e:
        print(f"Agent routing failed: {e}, using all agents")
    
    # Fallback: use all agents
    return list(AGENT_REGISTRY.keys())


def create_task_for_agent(agent_key: str, agent, molecule: str) -> Task:
    """Create a task for the specified agent type."""
    task_configs = {
        'market': {
            'description': f"""Conduct comprehensive market analysis for {molecule} using IQVIA data:
            1. Calculate Total Addressable Market (TAM) and CAGR (5-year) trajectory
            2. Identify top manufacturers by market share and competitive positioning
            3. Segment market by formulation type and dosage strength
            4. Normalize all revenue to USD""",
            'expected_output': """Market analysis including TAM, CAGR, top competitors, formulation segmentation"""
        },
        'patent': {
            'description': f"""Analyze patent landscape for {molecule}:
            1. Distinguish between patent types: Composition of Matter, Process, Formulation, Use
            2. Calculate expiry dates including extensions (SPC/PTE)
            3. Generate risk-flagged timeline: 🔴 High Risk, 🟡 Medium Risk, 🟢 Low Risk""",
            'expected_output': """Patent analysis with risk flags, expiry timeline, and FTO assessment"""
        },
        'trials': {
            'description': f"""Analyze clinical trials for {molecule}:
            1. Filter for trials currently "Recruiting" or "Active, not recruiting"
            2. Extract Primary Endpoints and trial design
            3. Group trials by Indication""",
            'expected_output': """Clinical trials summary with phase distribution and enrollment status"""
        },
        'trade': {
            'description': f"""Analyze import-export trends for {molecule}:
            1. Compare volumes against unit price to detect price erosion
            2. Identify major exporters and importers
            3. Flag supply chain risks""",
            'expected_output': """Trade analysis with volume/value trends and supply chain assessment"""
        },
        'internal': {
            'description': f"""Search internal documents for insights on {molecule}:
            1. Answer questions using RAG on internal PDFs
            2. Always cite source with filename and page number
            3. Assess strategic alignment""",
            'expected_output': """Internal insights with source citations and strategic assessment"""
        },
        'web': {
            'description': f"""Fetch external context for {molecule} from high-credibility sources:
            1. Search FDA.gov, EMA.europa.eu, NIH, medical journals
            2. Summarize clinical guidelines (first-line vs second-line treatments)
            3. Fetch regulatory approvals and safety alerts""",
            'expected_output': """Web intelligence with scientific publications and regulatory updates"""
        }
    }
    
    config = task_configs[agent_key]
    return Task(
        description=config['description'],
        agent=agent,
        expected_output=config['expected_output'],
        async_execution=True  # Run in parallel
    )


@chat_bp.route('/chat', methods=['POST'])
@chat_bp.route('/chat/generate', methods=['POST'])
def chat():
    """Main chat endpoint with dynamic agent selection"""
    print("\n" + "="*60)
    print("CHAT REQUEST RECEIVED!")
    print("="*60)
    try:
        data = request.get_json()
        print(f"Request data: {data}")
        user_query = data.get('query') or data.get('prompt', '')
        molecule = data.get('molecule', '')
        
        print(f"User query: {user_query}")
        print(f"Molecule: {molecule}")

        if not user_query:
            print("ERROR: No query provided")
            return jsonify({"error": "Query is required"}), 400

        # Step 1: Determine which agents are needed based on the query
        required_agent_keys = determine_required_agents(user_query, molecule)
        
        print(f"[AGENTS] Selected agents for query: {required_agent_keys}")

        # Step 2: Create only the required agents and their tasks
        agents = []
        tasks = []
        
        for agent_key in required_agent_keys:
            agent_info = AGENT_REGISTRY[agent_key]
            agent = agent_info['factory']()
            agents.append(agent)
            task = create_task_for_agent(agent_key, agent, molecule)
            tasks.append(task)

        # Step 3: Create report agent to synthesize results
        report_agent = create_report_generator_agent()
        agents.append(report_agent)
        
        # Create report task with context from all worker tasks
        report_task = Task(
            description=f"""Synthesize findings from the selected research agents into a professional report.
            
            User Query: {user_query}
            Molecule: {molecule}
            
            Create a focused report covering only the sections for which data was gathered.
            Structure the report with:
            1. Executive Summary
            2. Detailed findings from each agent
            3. Actionable recommendations
            
            Note: Only include sections for agents that were actually used.""",
            agent=report_agent,
            expected_output="""Professional report synthesizing findings from selected agents with actionable recommendations""",
            context=tasks,  # Wait for all worker tasks
            async_execution=False
        )
        tasks.append(report_task)

        # Step 4: Run the crew with selected agents
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,  # Async tasks run in parallel, report waits
            verbose=True
        )
        
        result = crew.kickoff()
        
        # Extract clean text
        final_answer = ""
        if hasattr(result, 'raw'):
            final_answer = result.raw
        else:
            final_answer = str(result)

        # Compile research data (only for requested agents)
        research_data = {
            'summary': final_answer,
            'agents_used': [AGENT_REGISTRY[k]['name'] for k in required_agent_keys],
            'timestamp': datetime.now().isoformat()
        }
        
        # Add data for each agent that was used
        if 'market' in required_agent_keys:
            research_data['market_data'] = MockDataSources.search_iqvia(molecule)
        if 'patent' in required_agent_keys:
            research_data['patent_data'] = MockDataSources.search_patents(molecule)
        if 'trials' in required_agent_keys:
            research_data['clinical_trials'] = MockDataSources.search_clinical_trials(molecule)
        if 'trade' in required_agent_keys:
            research_data['trade_data'] = MockDataSources.search_exim(molecule)

        # Insert chart placeholders into the final answer for professional layout
        enhanced_answer = final_answer
        
        # Add chart placeholders after relevant sections
        chart_insertions = [
            ('Market', '{{CHART:revenue_forecast}}'),
            ('Revenue', '{{CHART:revenue_forecast}}'),
            ('Competitive', '{{CHART:market_share}}'),
            ('Competitor', '{{CHART:market_share}}'),
            ('Clinical', '{{CHART:pipeline_summary}}'),
            ('Pipeline', '{{CHART:pipeline_summary}}'),
            ('Trade', '{{CHART:trade_trends}}'),
            ('Import', '{{CHART:trade_trends}}'),
            ('Export', '{{CHART:trade_trends}}'),
        ]
        
        # Smart insertion: add chart after first paragraph containing keyword
        for keyword, placeholder in chart_insertions:
            if keyword in enhanced_answer and placeholder not in enhanced_answer:
                idx = enhanced_answer.find(keyword)
                if idx != -1:
                    next_section = enhanced_answer.find('\n\n', idx)
                    if next_section != -1:
                        enhanced_answer = enhanced_answer[:next_section] + f'\n\n{placeholder}\n' + enhanced_answer[next_section:]

        # Generate PDF report
        pdf_base64 = generate_pdf_report(research_data, molecule)
        
        # Generate Charts for Frontend
        frontend_charts = generate_charts_from_data(research_data)

        return jsonify({
            'status': 'success',
            'response': enhanced_answer,  # With chart placeholders
            'content': enhanced_answer,
            'agents_used': [AGENT_REGISTRY[k]['name'] for k in required_agent_keys],
            'research_data': research_data,
            'report_pdf': pdf_base64,
            'molecule': molecule,
            'timestamp': datetime.now().isoformat(),
            'charts': frontend_charts
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
