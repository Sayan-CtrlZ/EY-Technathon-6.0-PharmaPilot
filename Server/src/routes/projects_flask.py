"""Flask Projects Routes - In-memory implementation"""
from flask import Blueprint, request, jsonify, g
from src.routes.auth_flask import require_auth
from datetime import datetime

bp = Blueprint('projects', __name__, url_prefix='/api/v1/projects')

# In-memory mock database
# Structure: { int(project_id): { ...project_data... } }
projects_db = {}
next_project_id = 1

@bp.route('', methods=['GET'])
@require_auth
def get_projects():
    """Get all projects for the current user"""
    try:
        current_user_email = g.current_user.get('email')
        
        # Filter projects by user_email
        user_projects = [
            p for p in projects_db.values() 
            if p.get('user_email') == current_user_email
        ]
        
        # Sort by updated_at desc
        user_projects.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
        
        return jsonify(user_projects), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/<int:project_id>', methods=['GET'])
@require_auth
def get_project(project_id):
    """Get a specific project by ID"""
    try:
        current_user_email = g.current_user.get('email')
        project = projects_db.get(project_id)
        
        if not project:
            return jsonify({"detail": "Project not found"}), 404
            
        if project.get('user_email') != current_user_email:
            return jsonify({"detail": "Access denied"}), 403
            
        return jsonify(project), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('', methods=['POST'])
@require_auth
def create_project():
    """Create a new project"""
    global next_project_id
    try:
        data = request.get_json()
        current_user_email = g.current_user.get('email')
        
        name = data.get('name')
        if not name:
            return jsonify({"detail": "Project name is required"}), 400
            
        project = {
            "id": next_project_id,
            "user_email": current_user_email,
            "name": name,
            "molecule_name": data.get('molecule_name', ''),
            "description": data.get('description', ''),
            "status": "Active",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        projects_db[next_project_id] = project
        next_project_id += 1
        
        return jsonify(project), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/<int:project_id>', methods=['PUT'])
@require_auth
def update_project(project_id):
    """Update an existing project"""
    try:
        data = request.get_json()
        current_user_email = g.current_user.get('email')
        
        project = projects_db.get(project_id)
        if not project:
            return jsonify({"detail": "Project not found"}), 404
            
        if project.get('user_email') != current_user_email:
            return jsonify({"detail": "Access denied"}), 403
            
        # Update fields
        if 'name' in data:
            project['name'] = data['name']
        if 'molecule_name' in data:
            project['molecule_name'] = data['molecule_name']
        if 'description' in data:
            project['description'] = data['description']
        if 'status' in data:
            project['status'] = data['status']
            
        project['updated_at'] = datetime.utcnow().isoformat()
        
        projects_db[project_id] = project
        return jsonify(project), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/<int:project_id>', methods=['DELETE'])
@require_auth
def delete_project(project_id):
    """Delete a project"""
    try:
        current_user_email = g.current_user.get('email')
        
        project = projects_db.get(project_id)
        if not project:
            return jsonify({"detail": "Project not found"}), 404
            
        if project.get('user_email') != current_user_email:
            return jsonify({"detail": "Access denied"}), 403
            
        del projects_db[project_id]
        return jsonify({"detail": "Project deleted successfully"}), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

