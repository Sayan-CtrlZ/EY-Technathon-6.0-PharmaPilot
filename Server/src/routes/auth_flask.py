"""Flask Authentication Routes"""
from flask import Blueprint, request, jsonify, g
from functools import wraps
import jwt
import hashlib
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from src.config import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

load_dotenv()

# In-memory user storage (replace with database in production)
users_db = {}
reset_tokens_db = {}  # token -> email mapping

bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access"):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_token_from_header():
    """Extract token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    try:
        token = auth_header.split(" ")[1]  # "Bearer <token>"
        return token
    except IndexError:
        return None


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"detail": "Not authenticated"}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({"detail": "Invalid or expired token"}), 401
        
        g.current_user = payload
        return f(*args, **kwargs)
    return decorated_function


def hash_password(password: str) -> str:
    """Hash password using SHA256 (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        full_name = data.get('full_name', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'researcher')

        # Validation
        if not email or not full_name or not password:
            return jsonify({"detail": "Email, full_name, and password are required"}), 400
        
        if len(password) < 8:
            return jsonify({"detail": "Password must be at least 8 characters long"}), 400
        
        if email in users_db:
            return jsonify({"detail": "Email already registered"}), 400

        # Create user
        user_id = len(users_db) + 1
        user = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "password_hash": hash_password(password),
            "role": role,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        users_db[email] = user

        # Return user data (without password)
        user_response = {k: v for k, v in user.items() if k != "password_hash"}
        return jsonify(user_response), 201

    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """Login user and return tokens"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({"detail": "Email and password are required"}), 400

        # Check user exists
        user = users_db.get(email)
        if not user:
            return jsonify({"detail": "Invalid email or password"}), 401

        # Verify password
        if not verify_password(password, user["password_hash"]):
            return jsonify({"detail": "Invalid email or password"}), 401

        if not user.get("is_active", True):
            return jsonify({"detail": "User account is inactive"}), 401

        # Create tokens
        token_data = {
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }), 200

    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current authenticated user"""
    try:
        user_id = g.current_user.get("sub")
        email = g.current_user.get("email")

        # Find user by email
        user = users_db.get(email)
        if not user:
            return jsonify({"detail": "User not found"}), 404

        # Return user data (without password)
        user_response = {k: v for k, v in user.items() if k != "password_hash"}
        return jsonify(user_response), 200

    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')

        # If no refresh token in body, try to get from Authorization header
        if not refresh_token:
            auth_header = request.headers.get("Authorization")
            if auth_header:
                try:
                    refresh_token = auth_header.split(" ")[1]
                except IndexError:
                    pass

        if not refresh_token:
            return jsonify({"detail": "Refresh token is required"}), 400

        # Verify refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        if not payload:
            return jsonify({"detail": "Invalid or expired refresh token"}), 401

        # Create new access token
        token_data = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role")
        }
        access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        return jsonify({
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }), 200

    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (client-side token removal)"""
    # In a stateless JWT system, logout is handled client-side
    # In production, you might want to maintain a token blacklist
    return jsonify({"detail": "Logged out successfully"}), 200


@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()

        if not email:
            return jsonify({"detail": "Email is required"}), 400

        # Check if user exists (don't reveal if they don't for security)
        user = users_db.get(email)
        if user:
            # Generate reset token (in production, send via email)
            import secrets
            reset_token = secrets.token_urlsafe(32)
            reset_tokens_db[reset_token] = {
                "email": email,
                "expires_at": datetime.utcnow() + timedelta(hours=1)
            }
            # In production, send email with reset link
            # For now, just return success
            print(f"Password reset token for {email}: {reset_token}")  # Keep for debugging
            
            # Send email
            from src.utils.email_utils import send_reset_email
            email_sent = send_reset_email(email, reset_token)
            
            if not email_sent:
                print("Failed to send reset email (check SMTP config)")

        # Always return success to prevent email enumeration
        return jsonify({
            "detail": "If the email exists, a password reset link has been sent"
        }), 200

    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using reset token"""
    try:
        data = request.get_json()
        token = data.get('token', '').strip()
        new_password = data.get('new_password', '').strip()

        if not token or not new_password:
            return jsonify({"detail": "Token and new_password are required"}), 400

        if len(new_password) < 8:
            return jsonify({"detail": "Password must be at least 8 characters long"}), 400

        # Verify reset token
        reset_data = reset_tokens_db.get(token)
        if not reset_data:
            return jsonify({"detail": "Invalid or expired reset token"}), 400

        if datetime.utcnow() > reset_data["expires_at"]:
            del reset_tokens_db[token]
            return jsonify({"detail": "Reset token has expired"}), 400

        email = reset_data["email"]
        user = users_db.get(email)
        if not user:
            return jsonify({"detail": "User not found"}), 404

        # Update password
        user["password_hash"] = hash_password(new_password)
        user["updated_at"] = datetime.utcnow().isoformat()

        # Remove used token
        del reset_tokens_db[token]

        return jsonify({"detail": "Password reset successfully"}), 200

    except Exception as e:
        return jsonify({"detail": str(e)}), 500

