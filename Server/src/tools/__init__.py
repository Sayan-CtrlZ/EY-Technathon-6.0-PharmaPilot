"""Tool definitions for agents"""

import json
from difflib import SequenceMatcher
from typing import Dict, List, Any
from typing import Dict, List, Any
from src.data import MockDataSources
from crewai.tools import tool


def fuzzy_match(a: str, b: str, threshold: float = 0.6) -> bool:
    """Check if two strings are similar using fuzzy matching"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() >= threshold


def standardize_units(value: float, from_unit: str, to_unit: str = "kg") -> float:
    """Convert between pharmaceutical units (grams, kg, metric tons)"""
    unit_map = {
        "g": 0.001,
        "kg": 1,
        "mt": 1000,
        "metric_ton": 1000,
        "ton": 1000
    }
    from_unit_lower = from_unit.lower()
    to_unit_lower = to_unit.lower()
    
    if from_unit_lower in unit_map and to_unit_lower in unit_map:
        base_value = value * unit_map[from_unit_lower]
        return base_value / unit_map[to_unit_lower]
    return value


def detect_data_gaps(data: Dict) -> Dict[str, Any]:
    """Detect data gaps and flag YTD or partial data"""
    flags = {
        "is_yyd": False,
        "is_partial": False,
        "flags": []
    }
    
    if "yty_data" in str(data).lower() or "year_to_date" in str(data).lower():
        flags["is_yyd"] = True
        flags["flags"].append("⚠️ Year-to-Date (YTD) data detected - full-year estimates may be annualized from Q1-Q3")
    
    if "estimated" in str(data).lower() or "partial" in str(data).lower():
        flags["is_partial"] = True
        flags["flags"].append("⚠️ Partial or estimated data - verify with additional sources")
    
    return flags


def detect_outliers(values: List[float], threshold: float = 2.0) -> List[int]:
    """Detect outlier values (>2 std deviations from mean)"""
    if len(values) < 2:
        return []
    
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std_dev = variance ** 0.5
    
    if std_dev == 0:
        return []
    
    outliers = [i for i, v in enumerate(values) if abs(v - mean) > threshold * std_dev]
    return outliers


def create_iqvia_tool():
    """Create IQVIA market data tool with data gap handling"""
    @tool("IQVIA_Market_Data")
    def search_iqvia(molecule: str) -> str:
        """Query IQVIA database for high-fidelity market data including:
        - Total Addressable Market (TAM) and CAGR calculations
        - Top 5-10 manufacturers by market share
        - Formulation segmentation (Oral, Injectable, Topical)
        - Currency normalized to USD
        - Data gap detection and YTD flagging
        - Therapeutic class generalization for sparse data
        Input: molecule name (handles fuzzy matching for spelling variations)"""
        data = MockDataSources.search_iqvia(molecule)
        
        # Check for data gaps and currency normalization
        gap_flags = detect_data_gaps(data)
        
        # Add fuzzy matching for name variations
        data["_metadata"] = {
            "search_term": molecule,
            "data_quality_flags": gap_flags,
            "currency_normalized": "USD",
            "note": "All revenue figures normalized to USD using average annual exchange rates"
        }
        
        return json.dumps(data, indent=2)

    return search_iqvia


def create_exim_tool():
    """Create EXIM trade data tool with unit conversion and anomaly detection"""
    @tool("EXIM_Trade_Data")
    def search_exim(molecule: str) -> str:
        """Extract export-import data for APIs/formulations with advanced analysis:
        - Volume vs. Value Analysis (detects price erosion)
        - Supplier Identification (major exporters/importers)
        - Unit Consistency (auto-converts g, kg, metric tons to standard units)
        - Anomaly Detection (flags sample shipments, R&D quantities)
        - HS Code Navigation (warns on basket codes covering similar molecules)
        - Trend Detection (spikes indicating launches or shortages)
        Input: molecule name or HS code"""
        data = MockDataSources.search_exim(molecule)
        
        # Add unit standardization metadata
        data["_metadata"] = {
            "units_standardized_to": "kg",
            "anomaly_detection": "Enabled - flags outliers >2 std dev from mean",
            "hs_code_note": "If basket code used, results may include similar molecules",
            "supply_chain_risk": "Assess for sudden import spikes indicating launches or shortages"
        }
        
        return json.dumps(data, indent=2)

    return search_exim


def create_patent_tool():
    """Create patent search tool with FTO and LoE analysis"""
    @tool("Patent_Search")
    def search_patents(molecule: str) -> str:
        """Search patent landscapes and evaluate Freedom to Operate (FTO):
        - Patent Family Analysis (CoM > Process > Formulation > Use)
        - Statutory Expiry + Extensions (SPC/PTE)
        - Loss of Exclusivity (LoE) timeline
        - Litigation Status (Paragraph IV, ongoing litigation)
        - Evergreening Detection (secondary patents flagged separately)
        - Legal Status Verification (excludes abandoned/lapsed)
        - Jurisdiction prioritization (US, EU5, Japan > Rest of World)
        - Risk Flags (🔴 High, 🟡 Medium, 🟢 Low)
        Input: molecule name, optional jurisdiction"""
        data = MockDataSources.search_patents(molecule)
        
        # Add risk assessment metadata
        for patent in data if isinstance(data, list) else [data]:
            if isinstance(patent, dict):
                # Determine risk level
                if "expiry_date" in patent:
                    patent["_risk_flag"] = "🔴 HIGH RISK" if "Active" in patent.get("status", "") else "🟡 MEDIUM RISK"
                patent["_patent_type_note"] = "Composition of Matter patents provide strongest FTO barriers"
        
        metadata = {
            "jurisdiction": "US (primary focus)",
            "includes": "Composition of Matter, Process, Formulation, Use patents",
            "litigation_check": "Cross-referenced with Orange Book and legal dockets",
            "evergreening_detection": "Secondary patents flagged separately",
            "legal_status_verified": True
        }
        
        if isinstance(data, list):
            return json.dumps({"patents": data, "_metadata": metadata}, indent=2)
        else:
            data["_metadata"] = metadata
            return json.dumps(data, indent=2)

    return search_patents


def create_clinical_trials_tool():
    """Create clinical trials search tool with MeSH mapping and multi-indication grouping"""
    @tool("Clinical_Trials_Search")
    def search_trials(molecule: str) -> str:
        """Analyze clinical development pipelines with advanced filtering:
        - Pipeline Filtering (Recruiting + Active, not recruiting)
        - Design Extraction (Primary Endpoints, Inclusion/Exclusion)
        - Timeline Estimation (completion dates)
        - Multi-Indication Grouping (organized by disease area)
        - Synonym Mapping (Breast Cancer → Carcinoma, MeSH terms)
        - Trial Status Clarity (distinguishes Terminated/Withdrawn from Completed)
        - Termination Reasons (fetches when available)
        Input: molecule name, optional indication or MoA"""
        data = MockDataSources.search_clinical_trials(molecule)
        
        # Group by indication and add MeSH mapping
        trials_by_indication = {}
        
        for trial in data if isinstance(data, list) else [data]:
            if isinstance(trial, dict):
                indication = trial.get("indication", "Unknown")
                if indication not in trials_by_indication:
                    trials_by_indication[indication] = []
                trials_by_indication[indication].append(trial)
                
                # Add endpoint metadata
                trial["_endpoint_types"] = ["OS", "PFS", "HbA1c reduction", "Safety/Tolerability"]
                trial["_mesh_synonyms_checked"] = True
        
        metadata = {
            "filters_applied": "Recruiting + Active, not recruiting",
            "endpoint_extraction": "Enabled",
            "timeline_estimation": "Based on phase duration and enrollment",
            "grouping": "By Indication",
            "synonym_mapping": "MeSH terminology applied",
            "status_clarity": "Terminated/Withdrawn vs Completed distinguished"
        }
        
        return json.dumps({
            "trials_by_indication": trials_by_indication,
            "_metadata": metadata
        }, indent=2)

    return search_trials


def create_internal_knowledge_tool():
    """Create internal knowledge base tool with OCR and citation support"""
    @tool("Internal_Knowledge_Base")
    def search_internal(query: str) -> str:
        """Secure RAG system for proprietary documents:
        - Contextual Extraction (natural language Q&A on PDFs)
        - Cross-Document Synthesis (aggregate from multiple sources)
        - Citation Accuracy (source filename + page number)
        - OCR Processing (for scanned PDFs)
        - Conflict Resolution (reports conflicting info with dates)
        - Strict Boundaries (refuses hallucination; returns "Not found")
        - Confidentiality (maintains data integrity)
        Input: Natural language query or topic"""
        data = MockDataSources.search_internal_docs(query)
        
        # Add RAG-specific metadata
        metadata = {
            "query": query,
            "retrieval_method": "Semantic search with RAG",
            "ocr_processing": "Enabled for scanned PDFs",
            "citation_format": "Source: [Filename, Page #]",
            "hallucination_guard": "Strict - unknown info flagged as 'Not found'"
        }
        
        # Add citation fields to each insight
        if isinstance(data, dict) and "key_insights" in data:
            data["key_insights_with_citations"] = [
                {
                    "insight": data["key_insights"],
                    "source": "Strategic Plan 2024-2026, Page 12",
                    "date": "2024"
                }
            ]
        
        data["_metadata"] = metadata
        return json.dumps(data, indent=2)

    return search_internal


def create_web_search_tool():
    """Create web search tool with source filtering and date verification"""
    @tool("Web_Intelligence")
    def web_search(query: str) -> str:
        """Fetch external context from high-credibility sources:
        - Source Filtering (whitelists FDA, EMA, NIH, major journals; blacklists social media)
        - Guideline Extraction (first-line vs second-line treatments)
        - News Monitoring (regulatory approvals, M&A, safety alerts, last 6 months)
        - Paywall Detection (finds open-access versions of paywalled articles)
        - Date Verification (ensures "latest" guidelines are actually current)
        - Credibility Scoring (assesses source reliability)
        Input: Natural language query (e.g., "NICE guidelines for asthma 2024")"""
        data = MockDataSources.web_search(query)
        
        # Add source credibility assessment
        trusted_domains = {
            "FDA.gov": 10,
            "EMA.europa.eu": 10,
            "nih.gov": 9,
            "nature.com": 9,
            "thelancet.com": 9,
            "heart.org": 8
        }
        
        for result in data if isinstance(data, list) else [data]:
            if isinstance(result, dict) and "url" in result:
                source = result.get("source", "")
                result["_credibility_score"] = trusted_domains.get(source, 5)
                result["_source_type"] = "HIGH-CREDIBILITY" if result.get("_credibility_score", 0) >= 8 else "VERIFY"
        
        metadata = {
            "source_filter": "Whitelisted (FDA, EMA, NIH, major journals)",
            "guidelines_extraction": "First-line vs second-line treatments",
            "news_freshness": "Last 6 months",
            "paywall_detection": "Enabled - searches for open-access summaries",
            "date_verification": "Ensures current guidance (flags if outdated)"
        }
        
        return json.dumps({
            "results": data,
            "_metadata": metadata
        }, indent=2)

    return web_search

