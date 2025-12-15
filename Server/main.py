"""Main Entry Point - Run Flask Application"""
import sys
import signal

# Fix for CrewAI on Windows (missing signals)
if sys.platform.startswith('win'):
    # Define missing signals as aliases to SIGTERM or 0
    missing_signals = [
        'SIGHUP', 'SIGQUIT', 'SIGTSTP', 'SIGCONT', 
        'SIGUSR1', 'SIGUSR2', 'SIGPIPE', 'SIGALRM'
    ]
    for sig in missing_signals:
        if not hasattr(signal, sig):
            setattr(signal, sig, signal.SIGTERM)

from src.app_factory import create_app
from src.config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG

if __name__ == '__main__':
    app = create_app()
    # Diagnostic Checks
    try:
        from src.config import GROQ_API_KEY
        key_status = "✅ Found" if GROQ_API_KEY else "❌ Missing"
    except:
        key_status = "❌ Config Error"

    try:
        import langchain_groq
        lib_status = "✅ Installed"
    except:
        lib_status = "❌ Missing (Run: pip install langchain-groq)"

    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║     Pharma Innovation AI - Flask Backend Server          ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Server running on: http://localhost:{FLASK_PORT:<5} (Accessible)   ║
    ║  API Base URL:      http://localhost:{FLASK_PORT}/api/v1          ║
    ║  Debug Mode:        {str(FLASK_DEBUG):<5}                               ║
    ╠══════════════════════════════════════════════════════════╣
    ║  DIAGNOSTICS:                                            ║
    ║  • Groq API Key:    {key_status:<36} ║
    ║  • Groq Library:    {lib_status:<36} ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG
    )
