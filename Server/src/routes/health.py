"""Health Check Routes"""
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__, url_prefix='/api/v1')


@health_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Pharma Innovation AI Agent'})


@health_bp.route('/', methods=['GET'])
def index():
    """API information endpoint"""
    return jsonify({
        'service': 'Pharmaceutical Innovation Discovery - Agentic AI System',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': {
                'register': 'POST /api/v1/auth/register',
                'login': 'POST /api/v1/auth/login',
                'me': 'GET /api/v1/auth/me',
                'refresh': 'POST /api/v1/auth/refresh',
                'logout': 'POST /api/v1/auth/logout',
                'forgot_password': 'POST /api/v1/auth/forgot-password',
                'reset_password': 'POST /api/v1/auth/reset-password'
            },
            'chat': {
                'chat': 'POST /api/v1/chat',
                'generate': 'POST /api/v1/chat/generate'
            },
            'health': 'GET /api/v1/health'
        },
        'example_request': {
            'query': 'Find innovation opportunities for Metformin in cardiovascular disease',
            'molecule': 'Metformin'
        }
    })
