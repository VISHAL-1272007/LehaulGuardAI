"""
Vercel-compatible FastAPI entry point for LegalGuard AI
Serverless Function Handler
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Import from backend modules
from backend.smart_auditor import (
    ExplainableAIExtractor,
    FuzzyKeywordMatcher,
    PIIMasker,
    ForgeryDetector,
    SmartAuditorResponse
)
from backend.pdf_report_generator import ComplianceReportGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===========================
# FastAPI Application Setup
# ===========================

app = FastAPI(
    title="LegalGuard AI - Vercel Serverless",
    description="Enterprise OCR compliance checker on Vercel",
    version="1.0.0"
)

# ===========================
# CORS Middleware
# ===========================

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:5173",
    "https://legalguard-ai-frontend.vercel.app",  # Your Vercel frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================
# Health Check Endpoint
# ===========================

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint for Vercel"""
    return {
        "status": "healthy",
        "service": "LegalGuard AI",
        "version": "1.0.0",
        "environment": "vercel-serverless"
    }

@app.get("/api/v1/stats")
async def get_stats():
    """Dashboard statistics"""
    return {
        "total_scans": 0,
        "compliant": 0,
        "non_compliant": 0,
        "pending_review": 0
    }

# ===========================
# Authentication Models
# ===========================

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str

# ===========================
# Mock Authentication (For Serverless)
# ===========================

@app.post("/api/v1/auth/login")
async def login(request: LoginRequest):
    """Mock login endpoint for serverless"""
    # In production, use proper JWT and database
    return {
        "access_token": "mock-token-vercel",
        "token_type": "bearer",
        "message": "Login successful"
    }

@app.post("/api/v1/auth/register")
async def register(request: RegisterRequest):
    """Mock registration endpoint"""
    return {
        "message": "Registration successful",
        "email": request.email
    }

# ===========================
# OCR Scanning Endpoints
# ===========================

class ScanResponse(BaseModel):
    scanned_text: str
    confidence: float
    is_compliant: bool
    fields: Dict[str, str]

@app.post("/api/v1/smart-scan")
async def smart_scan(file: UploadFile = File(...)):
    """
    Smart AI scan with all features:
    - Explainable AI (coordinates)
    - Fuzzy Matching
    - PII Masking
    - Forgery Detection
    """
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Mock response for serverless demo
        return {
            "status": "success",
            "message": "Smart scan completed",
            "explainable_ai": {
                "manufacturer": {
                    "text": "ABC Company Ltd.",
                    "coordinates": [120, 45, 340, 78]
                }
            },
            "fuzzy_matching": {
                "detected_keywords": ["MRP", "Best Before"]
            },
            "pii_masking": {
                "sensitive_data_found": False
            },
            "forgery_detection": {
                "is_tampered": False,
                "confidence": 0.95
            },
            "overall_compliance": True
        }
    except Exception as e:
        logger.error(f"Scan error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Scan failed: {str(e)}")

@app.post("/api/v1/batch-scan")
async def batch_scan(files: List[UploadFile] = File(...)):
    """Batch process multiple images"""
    results = []
    for file in files:
        contents = await file.read()
        results.append({
            "filename": file.filename,
            "status": "processed",
            "compliant": True
        })
    return {
        "total": len(results),
        "processed": len(results),
        "results": results
    }

# ===========================
# Reports Endpoint
# ===========================

@app.get("/api/v1/audit-logs")
async def get_audit_logs(limit: int = 10):
    """Get audit logs"""
    return {
        "logs": [
            {
                "timestamp": datetime.now().isoformat(),
                "event": "Image scanned",
                "status": "success"
            }
        ],
        "total": 1,
        "limit": limit
    }

# ===========================
# Root Endpoint
# ===========================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "LegalGuard AI - Vercel Serverless",
        "api_docs": "/docs",
        "health_check": "/api/v1/health"
    }

# ===========================
# 404 Handler
# ===========================

@app.get("/docs")
async def swagger_docs():
    """Swagger UI available at /docs"""
    return JSONResponse({"message": "Use /redoc or swagger at root"})

# Export for Vercel
# The handler function is automatically created by @vercel/python
