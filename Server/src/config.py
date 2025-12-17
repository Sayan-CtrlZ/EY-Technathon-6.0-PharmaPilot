"""Application Configuration"""
import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI Configuration (Optional - using Gemini as primary LLM)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

# Debug: Log API key status (without exposing the full key)
if OPENAI_API_KEY:
    print(f"[OK] OPENAI_API_KEY loaded: {OPENAI_API_KEY[:7]}...{OPENAI_API_KEY[-4:]}")
else:
    print("[INFO] OPENAI_API_KEY is not set (using Gemini as primary LLM)")


# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.7"))

# Google Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    print(f"[OK] GEMINI_API_KEY loaded: {GEMINI_API_KEY[:7]}...{GEMINI_API_KEY[-4:]}")
else:
    print("[X] WARNING: GEMINI_API_KEY is not set!")

# Gemini Configuration (primary)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))

# Vertex AI Configuration
VERTEX_PROJECT_ID = os.getenv("VERTEX_PROJECT_ID")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
VERTEX_MODEL = os.getenv("VERTEX_MODEL", "gemini-1.5-pro")
VERTEX_TEMPERATURE = float(os.getenv("VERTEX_TEMPERATURE", "0.2"))

# Flask Configuration
FLASK_DEBUG = os.getenv("FLASK_DEBUG", True)
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5001"))

# Application Settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
ENABLE_CORS = os.getenv("ENABLE_CORS", True)

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Email Configuration
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []
