# PharmaPilot

> **AI-Powered Pharmaceutical Research Platform** - Transforming drug discovery with intelligent insights

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat&logo=python)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)

---


## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

PharmaPilot is an intelligent research assistant designed for pharmaceutical professionals. It combines CrewAI's multi-agent architecture with advanced data visualization to provide comprehensive market analysis, clinical trial insights, and competitive intelligence.

## Tech Stack

### Backend
- **Framework**: Flask 2.2.5
- **AI/ML**: CrewAI, LangChain, OpenAI GPT-4
- **Authentication**: JWT (PyJWT 2.8.0)
- **PDF Generation**: ReportLab 4.0.0
- **Visualization**: Matplotlib 3.8.0
- **CORS**: Flask-CORS 4.0.0
- **Environment**: Python 3.8+

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.28
- **Charts**: Chart.js 4.4, React-Chartjs-2 5.2
- **Markdown**: React-Markdown 9.0
- **PDF Export**: jsPDF 2.5, html2canvas 1.4
- **HTTP Client**: Fetch API
- **Styling**: Tailwind CSS (via CDN)

### Development Tools
- **Version Control**: Git
- **Package Management**: npm (Frontend), pip (Backend)
- **Code Quality**: ESLint

## Features

- Multi-agent AI system for pharmaceutical research
- Real-time chat interface with streaming responses
- Interactive data visualization (Bar, Line, Pie charts)
- Professional PDF report generation with embedded charts
- User authentication and session management
- Project-based research organization
- Responsive dark/light mode UI
- Immediate response cancellation
- Comprehensive error handling

## Prerequisites

Before installation, ensure you have:

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- OpenAI API key (for AI functionality)
- Git (for version control)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Imposter-an/EY-Technathon-6.0-PharmaPilot.git
cd EY-Technathon-6.0-PharmaPilot
```

### 2. Backend Setup

```bash
cd Server
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd Client
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `Server` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-4o

# Flask Configuration
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5001

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Configuration (Optional)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

### Frontend Environment Variables

Create a `.env` file in the `Client` directory:

```env
VITE_API_URL=http://localhost:5001
```

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd Server
python main.py
```

The backend will run on `http://localhost:5001`

#### Start Frontend Development Server

```bash
cd Client
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd Client
npm run build
```

#### Deploy Backend

```bash
cd Server
gunicorn -w 4 -b 0.0.0.0:5001 "src.app_factory:create_app()"
```

## Project Structure

```
pharma/
├── Server/
│   ├── main.py                 # Application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (not committed)
│   └── src/
│       ├── app_factory.py      # Flask app factory
│       ├── config.py           # Configuration management
│       ├── agents/             # CrewAI agent definitions
│       ├── routes/             # API route handlers
│       ├── tools/              # Agent tool implementations
│       ├── data/               # Mock data sources
│       └── utils/              # Utility functions
│           ├── chart_generator.py  # Matplotlib chart generation
│           ├── chart_utils.py      # Chart data processing
│           └── pdf_generator.py    # PDF report creation
│
└── Client/
    ├── package.json            # Node dependencies
    ├── vite.config.js          # Vite configuration
    ├── index.html              # HTML entry point
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Root component
        ├── components/         # React components
        │   ├── ChatBox.jsx     # Main chat interface
        │   ├── Message.jsx     # Message rendering with charts
        │   └── Sidebar.jsx     # Navigation sidebar
        ├── pages/              # Page components
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── utils/              # Utility functions
        │   ├── authApi.js      # Authentication API
        │   └── responseGenerator.js  # AI response handler
        └── assets/             # Static assets
```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Chat Endpoints

- `POST /api/v1/chat/generate` - Generate AI research response
  - Request: `{ "query": "Analyze Semaglutide market" }`
  - Response: `{ "response": "...", "charts": [...], "pdf": "base64..." }`

### Project Endpoints

- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Health Check

- `GET /api/v1/health` - Server health status
- `GET /api/v1/` - API information

## Contributing

This project was developed for EY Techathon 6.0. For contributions or inquiries, please contact the PharmaPilot team.

## License

Copyright 2025 PharmaPilot Team. All rights reserved.

---

**Developed for EY Techathon 6.0**

**Team**: PharmaPilot

**Year**: 2025
