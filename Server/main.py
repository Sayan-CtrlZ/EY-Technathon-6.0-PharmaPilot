"""Main Entry Point - Flask Application"""
from src.app_factory import create_app

# Create app instance at module level for Gunicorn
app = create_app()

# Add logging middleware to see ALL requests
class LoggingMiddleware:
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        print(f"\n{'='*60}")
        print(f"REQUEST: {environ['REQUEST_METHOD']} {environ['PATH_INFO']}")
        print(f"{'='*60}\n")
        return self.app(environ, start_response)

app.wsgi_app = LoggingMiddleware(app.wsgi_app)

if __name__ == '__main__':
    # Only used for local development (python main.py)
    # In production, Gunicorn will import 'app' directly
    from src.config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, ENABLE_CORS
    
    print(f"""
===========================================================
    PharmaPilot Backend Server
    Running on: http://{FLASK_HOST}:{FLASK_PORT}
    Debug Mode: {FLASK_DEBUG}
    CORS Enabled: {ENABLE_CORS}
===========================================================
    """)
    
    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG
    )
