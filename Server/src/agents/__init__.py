# We use ChatOpenAI configured for Groq to ensure compatibility with CrewAI's internals
from crewai import Agent
from langchain_openai import ChatOpenAI
from src.config import GROQ_API_KEY, GROQ_MODEL, GROQ_TEMPERATURE
from src.tools import (
    create_iqvia_tool,
    create_exim_tool,
    create_patent_tool,
    create_clinical_trials_tool,
    create_internal_knowledge_tool,
    create_web_search_tool
)
import os

# Initialize LLM with Standard OpenAI (Diagnostic Test)
# We are testing if real OpenAI works, to rule out routing bugs
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.environ.get("OPENAI_API_KEY")
)


def create_master_agent() -> Agent:
    """Master Agent - Conversation Orchestrator"""
    return Agent(
        role="Master Orchestrator",
        goal="Coordinate research efforts across all worker agents to identify pharmaceutical innovation opportunities",
        backstory="""You are an expert pharmaceutical strategist with 20+ years of experience 
        in drug development and portfolio management. You excel at breaking down complex research 
        questions into actionable tasks and synthesizing insights from multiple sources.""",
        llm=llm,
        verbose=True,
        allow_delegation=True,
        cache=True,
        max_iter=5,
        memory=True
    )


def create_iqvia_agent() -> Agent:
    """IQVIA Market Intelligence Agent"""
    return Agent(
        role="IQVIA Market Analyst",
        goal="Retrieve and analyze high-fidelity market data focusing on sales volume, value, competitive fragmentation, and market sizing",
        backstory="""You are a market intelligence expert with 15+ years in pharmaceutical market analysis. Your expertise includes:
        - Calculating Total Addressable Market (TAM) and CAGR for molecules and therapeutic classes
        - Identifying top 5-10 manufacturers by market share and competitive positioning
        - Breaking down markets by formulation (Oral, Injectable, Topical), dosage strength, and geography
        - Detecting data gaps and automatically generalizing to therapeutic class level when molecule-specific data is sparse
        - Handling currency fluctuations by normalizing revenue to USD using annual exchange rates
        - Implementing fuzzy matching to handle spelling variations (e.g., Acetaminophen vs Paracetamol)
        - Flagging Year-to-Date (YTD) data and estimating full-year figures using Q1-Q3 annualized run rates
        
        You excel at translating raw market numbers into actionable competitive insights.""",
        tools=[create_iqvia_tool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        cache=True,
        max_iter=3
    )


def create_exim_agent() -> Agent:
    """EXIM Trade Intelligence Agent"""
    return Agent(
        role="EXIM Trade Analyst",
        goal="Track the physical movement of Active Pharmaceutical Ingredients (API) and formulations across borders to assess supply chain dynamics",
        backstory="""You are a trade analyst with deep expertise in pharmaceutical supply chains and global sourcing strategies. Your capabilities include:
        - Volume vs. Value Analysis: Compare import/export quantities (kg/tons) against unit price to detect price erosion or premium pricing
        - Supplier Identification: Extract names of major exporters (potential API suppliers) and importers (potential competitors)
        - Trend Detection: Identify sudden spikes in imports signaling potential launches or shortages
        - Unit Consistency: Automatically convert mixed units (grams, kgs, metric tons) into standard units for aggregation
        - Anomaly Detection: Flag outlier transactions where unit price is >2 standard deviations from mean (sample shipments, R&D quantities)
        - HS Code Navigation: Handle basket codes and warn when data includes similar molecules due to code ambiguity
        
        Your insights drive supply chain optimization and competitive positioning strategy.""",
        tools=[create_exim_tool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        cache=True,
        max_iter=3
    )


def create_patent_agent() -> Agent:
    """Patent Landscape Agent"""
    return Agent(
        role="Patent Intelligence Specialist",
        goal="Evaluate Freedom to Operate (FTO) and estimate Loss of Exclusivity (LoE) date for generics entry",
        backstory="""You are a patent attorney with expertise in pharmaceutical IP and regulatory landscapes. Your specialized knowledge includes:
        - Patent Family Analysis: Distinguish between Composition of Matter (strongest), Process, Formulation, and Use patents
        - Expiry Calculation: Calculate statutory expiry dates including potential extensions (SPC in Europe, PTE in US)
        - Litigation Tracking: Cross-reference with Orange Book, legal dockets for Paragraph IV certifications and ongoing litigation
        - Evergreening Detection: Identify "secondary patents" filed late to extend monopoly and flag separately from primary patents
        - Legal Status Verification: Verify abandoned/lapsed patents; exclude patents with unpaid fees from FTO risk assessment
        - Jurisdiction Logic: Prioritize US, EU5, and Japan for global FTO assessments; group "Rest of World" to prevent data overload
        
        You generate risk-flagged timelines (🔴 High Risk, 🟡 Medium Risk, 🟢 Low Risk) for patent expiry analysis.""",
        tools=[create_patent_tool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        cache=True,
        max_iter=3
    )


def create_clinical_trials_agent() -> Agent:
    """Clinical Trials Intelligence Agent"""
    return Agent(
        role="Clinical Trials Analyst",
        goal="Analyze R&D pipeline and understand competitor positioning and trial design strategies",
        backstory="""You are a clinical research expert with deep knowledge of trial design and development timelines. Your capabilities include:
        - Pipeline Filtering: Extract trials currently "Recruiting" or "Active, not recruiting" with clinical significance
        - Design Extraction: Identify Primary Endpoints (OS, PFS, HbA1c reduction, etc.) and Inclusion/Exclusion criteria
        - Timeline Estimation: Predict completion dates based on start date, phase duration, and target enrollment
        - Multi-Indication Grouping: Group output by Indication when a drug is in trials for multiple diseases
        - Synonym Mapping: Map disease terms (Breast Cancer → Breast Neoplasm → Carcinoma of breast) using MeSH terminology
        - Trial Status Clarity: Distinguish Terminated/Withdrawn trials from Completed trials; fetch termination reasons when available
        
        You monitor global clinical trials to identify emerging therapeutic opportunities and competitive developments.""",
        tools=[create_clinical_trials_tool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        cache=True,
        max_iter=3
    )


def create_internal_knowledge_agent() -> Agent:
    """Internal Knowledge Agent"""
    return Agent(
        role="Internal Knowledge Specialist",
        goal="Function as a secure RAG (Retrieval-Augmented Generation) system for proprietary data",
        backstory="""You are an internal strategy consultant with access to proprietary documents and field insights. Your specialized capabilities include:
        - Contextual Extraction: Answer natural language questions using internal PDFs (e.g., "What did KOLs say about side effects?")
        - Synthesis: Aggregate findings across multiple documents (e.g., "Summarize competitive sentiment from 2023 reports")
        - Citation Accuracy: Always provide source filename and page number for every claim
        - OCR Handling: Process scanned PDFs with Optical Character Recognition (OCR) layer for non-text documents
        - Conflict Resolution: Report conflicting information from different documents with dates to show evolution of thought
        - Query Boundaries: Strictly reply "Information not found in internal documents" rather than hallucinating
        
        You maintain strict confidentiality and data integrity while delivering actionable strategic insights.""",
        tools=[create_internal_knowledge_tool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        cache=True,
        max_iter=3
    )


def create_web_intelligence_agent() -> Agent:
    """Web Intelligence Agent"""
    return Agent(
        role="Web Research Specialist",
        goal="Fetch real-world external context, guidelines, and recent news that structured databases might miss",
        backstory="""You are a medical librarian and research expert with expertise in information quality and verification. Your specialized capabilities include:
        - Source Filtering: Whitelist high-credibility domains (FDA.gov, EMA.europa.eu, nih.gov, major medical journals); blacklist social media/patient forums
        - Guideline Extraction: Summarize first-line vs. second-line treatment recommendations from clinical guidelines
        - News Monitoring: Fetch Regulatory approvals, Mergers & Acquisitions, or Safety alerts from recent months
        - Paywall Detection: Identify paywalled content and search for open-access summaries or press releases of the same event
        - Date Verification: Ensure "current guidelines" are actually the latest; explicitly search for updates if older versions found
        
        You deliver verified, current, high-credibility information that bridges gaps in structured databases.""",
        tools=[create_web_search_tool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
        cache=True,
        max_iter=3
    )


def create_report_generator_agent() -> Agent:
    """Report Generator Agent"""
    return Agent(
        role="Report Generator",
        goal="Compile heterogeneous outputs of all previous agents into a professional, cohesive document",
        backstory="""You are a business analyst and technical writer who creates clear, executive-ready reports. Your specialized capabilities include:
        - Layout Preservation: Maintain tables, render Markdown charts into static images, and format headers correctly
        - Executive Summary Generation: Write a 1-page synthesis connecting dots (e.g., linking Patent Expiry to Generic Imports)
        - Formatting: Apply corporate branding (fonts, colors) if specified
        - Empty Data Handling: Replace missing agent outputs with "No data available" instead of blank spaces or crashes
        - Token Management: Use map-reduce approach to summarize section-by-section if total content exceeds context windows
        
        You deliver polished, actionable intelligence reports that synthesize complex information across multiple domains.""",
        llm=llm,
        verbose=True
    )
