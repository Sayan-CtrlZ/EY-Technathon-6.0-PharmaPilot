"""Application Factory - Create and Configure Flask App"""
from flask import Flask
from flask_cors import CORS
from src.config import FLASK_DEBUG, ENABLE_CORS, ALLOWED_ORIGINS
from src.routes import health_bp, chat_bp
from src.routes.auth_flask import bp as auth_bp
from src.routes.projects_flask import bp as projects_bp
from src.routes.agents_flask import bp as agents_bp


def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)

    # Enable CORS if configured
    if ENABLE_CORS:
        # Use environment-configured origins or fallback to localhost for development
        allowed_origins = ALLOWED_ORIGINS if ALLOWED_ORIGINS else [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5173"
        ]
        
        CORS(app, 
             origins=allowed_origins,
             supports_credentials=True,
             allow_headers=["Content-Type", "Authorization"],
             methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(agents_bp)

    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {"detail": "Endpoint not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        print(f"\n{'='*60}")
        print(f"500 ERROR CAUGHT: {error}")
        print(f"{'='*60}\n")
        import traceback
        traceback.print_exc()
        return {"detail": f"Internal server error: {str(error)}"}, 500

    @app.errorhandler(400)
    def bad_request(error):
        return {"detail": "Bad request"}, 400

    return app
