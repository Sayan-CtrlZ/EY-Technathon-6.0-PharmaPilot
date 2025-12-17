"""Diagnostic script - writes to file instead of terminal"""
import sys
from datetime import datetime

# Write to file so we can see output even if terminal is broken
with open('diagnostic.log', 'w', encoding='utf-8') as f:
    f.write(f"=== DIAGNOSTIC START: {datetime.now()} ===\n")
    f.write(f"Python version: {sys.version}\n")
    f.write(f"Python executable: {sys.executable}\n")
    f.write("Attempting to import Flask...\n")
    
    try:
        from flask import Flask
        f.write("[OK] Flask imported successfully\n")
        
        app = Flask(__name__)
        f.write("[OK] Flask app created\n")
        
        @app.route('/api/v1/chat/generate', methods=['POST'])
        def test():
            with open('request.log', 'a', encoding='utf-8') as rf:
                rf.write(f"REQUEST RECEIVED at {datetime.now()}\n")
            return {'test': 'ok'}
        
        f.write("[OK] Route registered\n")
        f.write("Starting Flask server on port 5001...\n")
        f.flush()
        
        app.run(host='0.0.0.0', port=5001, debug=False)
        
    except Exception as e:
        f.write(f"[ERROR] {e}\n")
        import traceback
        f.write(traceback.format_exc())

print("Check diagnostic.log file for output")
