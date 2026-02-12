"""
Enterprise-grade FastAPI Backend for Legal Metrology AI
Integrates OCR logic with authentication, database logging, and batch processing
"""

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import re
import os
from pdf_report_generator import ComplianceReportGenerator
from smart_auditor import (
    ExplainableAIExtractor,
    FuzzyKeywordMatcher,
    PIIMasker,
    ForgeryDetector,
    SmartAuditorResponse
)
import base64


# ==========================
# Configuration
# ==========================

SECRET_KEY = "your-secret-key-change-this-in-production-use-openssl-rand-hex-32"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database setup (SQLite for development, PostgreSQL for production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./legal_metrology.db")
# For PostgreSQL: postgresql://user:password@localhost/dbname

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# ==========================
# Database Models
# ==========================

class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # Admin, Auditor, Client
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    """Audit log model for tracking all scans"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    user_id = Column(Integer)
    username = Column(String)
    extracted_text = Column(Text)
    compliance_status = Column(String)  # COMPLIANT, NON_COMPLIANT
    confidence_score = Column(Float)
    missing_keywords = Column(String)  # JSON string
    expiry_status = Column(String, nullable=True)
    image_quality = Column(String, nullable=True)
    blur_variance = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    processing_time_ms = Column(Float, nullable=True)


# Create tables
Base.metadata.create_all(bind=engine)

# ==========================
# Pydantic Schemas
# ==========================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str  # Admin, Auditor, Client


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class ScanResult(BaseModel):
    extracted_text: str
    compliance_status: str
    confidence_score: float
    missing_keywords: List[str]
    found_keywords: List[str]
    needs_manual_review: bool  # Phase 3: Enhanced feature
    expiry_info: Optional[dict] = None
    image_quality: Optional[dict] = None
    processing_time_ms: float


class BatchScanResult(BaseModel):
    total_images: int
    compliant_count: int
    non_compliant_count: int
    results: List[dict]
    processing_time_ms: float


# Smart AI Auditor Response Models
class ComplianceResultItem(BaseModel):
    field: str
    detected_text: Optional[str] = None
    confidence: int
    status: str  # FOUND or MISSING


class CoordinateItem(BaseModel):
    text: str
    confidence: int
    x: int
    y: int
    w: int
    h: int


class AuditorDetails(BaseModel):
    explainable_ai: bool
    fuzzy_matching_enabled: bool
    pii_masking_applied: bool
    forgery_detection_enabled: bool


class SmartAuditResponse(BaseModel):
    """Smart AI Auditor response with explainability, fuzzy matching, PII masking, forgery detection"""
    extracted_text: str
    processed_image: str  # Base64 encoded processed image
    visual_analysis_image: str  # Base64 with bounding boxes
    compliance_results: List[ComplianceResultItem]
    pii_detected: List[str]
    tamper_alert: bool
    tamper_score: float
    tamper_reason: str
    compliance_status: str
    confidence_score: float
    auditor_details: AuditorDetails
    coordinates_data: Optional[Dict[str, Any]] = None
    processing_time_ms: float


# ==========================
# FastAPI App
# ==========================

app = FastAPI(
    title="Legal Metrology AI API",
    description="Enterprise-grade OCR and Compliance Checking System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://vishal-eight-nu.vercel.app",
        "https://lehaulguardai-1.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Database Dependency
# ==========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================
# Authentication & Authorization
# ==========================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


def require_role(allowed_roles: List[str]):
    """Dependency to check if user has required role"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


# ==========================
# OCR & Compliance Logic (Integrated from app.py)
# ==========================

# Mandatory keywords for compliance
MANDATORY_KEYWORDS = {
    "MRP": {
        "description": "Maximum Retail Price",
        "keywords": ["MRP", "Maximum Retail Price", "Max Retail Price", "M.R.P", "M.R.P.", "Retail Price", "விலை", "அதிகபட்ச விலை"]
    },
    "Net Quantity": {
        "description": "Net Quantity / Weight",
        "keywords": ["Net Quantity", "Net Qty", "Net Wt", "Net Weight", "Net Wt.", "Net Content", "Nett Qty", "Weight", "Quantity", "எடை", "நிகர அளவு", "நிகர எடை"]
    },
    "Month and Year of Manufacture": {
        "description": "Manufacturing Date",
        "keywords": ["Month and Year of Manufacture", "Mfg Date", "Mfg.", "Manufacturing Date", "Manufactured", "Date of Manufacture", "MFD", "Manuf. Date", "தயாரிப்பு தேதி", "உற்பத்தி தேதி"]
    },
    "Customer Care": {
        "description": "Customer Care / Contact Information",
        "keywords": ["Customer Care", "Customer Service", "Consumer Care", "Contact", "Helpline", "Contact Us", "Customer Support", "Call Us", "வாடிக்கையாளர் சேவை", "தொடர்பு"]
    },
    "Country of Origin": {
        "description": "Country of Origin",
        "keywords": ["Country of Origin", "Made in", "Manufactured in", "Product of", "Origin", "Imported by", "Mfg. Country", "தயாரிப்பு நாடு", "உற்பத்தி நாடு"]
    }
}


def preprocess_image(image_array):
    """Pre-process image using OpenCV for better OCR accuracy"""
    # Convert to grayscale
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Apply denoising
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    return denoised


def check_image_blur(image_array, threshold=100.0):
    """Check image quality using Laplacian variance"""
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = laplacian.var()
    
    is_blurry = variance < threshold
    
    if variance >= 500:
        quality = 'Excellent'
    elif variance >= 200:
        quality = 'Good'
    elif variance >= 100:
        quality = 'Fair'
    elif variance >= 50:
        quality = 'Poor'
    else:
        quality = 'Very Poor'
    
    return {
        'variance': variance,
        'is_blurry': is_blurry,
        'quality': quality
    }


def extract_text_from_image(image_array, lang_config='eng'):
    """Extract text using Tesseract OCR"""
    try:
        processed_image = preprocess_image(image_array)
        extracted_text = pytesseract.image_to_string(processed_image, lang=lang_config)
        return extracted_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Error: {str(e)}")


def check_compliance(extracted_text):
    """Check compliance against mandatory keywords"""
    results = {}
    
    if not extracted_text:
        return {field: {"found": False, "matched_keyword": ""} for field in MANDATORY_KEYWORDS}
    
    text_lower = extracted_text.lower()
    
    for field, field_data in MANDATORY_KEYWORDS.items():
        keywords = field_data["keywords"]
        is_found = False
        matched_keyword = ""
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in text_lower:
                is_found = True
                matched_keyword = keyword
                break
        
        results[field] = {
            "found": is_found,
            "matched_keyword": matched_keyword
        }
    
    return results


def extract_expiry_date(text):
    """Extract expiry date from text using regex"""
    if not text:
        return None
    
    expiry_keywords = [
        r'expiry\s*date?',
        r'exp\.?\s*date?',
        r'best\s*before',
        r'use\s*by',
        r'valid\s*until',
        r'expires?',
    ]
    
    date_patterns = [
        r'(\d{1,2}[/-.]\d{1,2}[/-.]\d{2,4})',
        r'(\d{1,2}[/-.]\d{4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})',
    ]
    
    text_lower = text.lower()
    
    for keyword_pattern in expiry_keywords:
        keyword_matches = re.finditer(keyword_pattern, text_lower, re.IGNORECASE)
        
        for keyword_match in keyword_matches:
            keyword_pos = keyword_match.end()
            search_region = text[keyword_pos:keyword_pos + 50]
            
            for date_pattern in date_patterns:
                date_match = re.search(date_pattern, search_region, re.IGNORECASE)
                
                if date_match:
                    return {
                        'found': True,
                        'date_string': date_match.group(1),
                        'context': text[max(0, keyword_match.start() - 10):keyword_pos + date_match.end() + 10].strip()
                    }
    
    return None


def calculate_confidence_score(compliance_results, image_quality):
    """
    Phase 3: Enhanced Confidence Scoring
    Combines compliance rate with image quality
    Returns score 0-100 with manual review flag if < 70
    """
    # Compliance score (60%)
    found_count = sum(1 for r in compliance_results.values() if r["found"])
    total_count = len(compliance_results)
    compliance_score = (found_count / total_count) * 60 if total_count > 0 else 0
    
    # Image quality score (40%)
    quality_scores = {
        'Excellent': 40,
        'Good': 32,
        'Fair': 24,
        'Poor': 16,
        'Very Poor': 8
    }
    quality_score = quality_scores.get(image_quality['quality'], 20)
    
    final_score = round(compliance_score + quality_score, 2)
    
    # Determine if manual review needed (Phase 3 Feature)
    is_blurry = image_quality.get('quality') in ['Poor', 'Very Poor']
    missing_count = sum(1 for r in compliance_results.values() if not r["found"])
    
    needs_manual_review = (
        final_score < 70 or  # Low confidence
        is_blurry or  # Blurry image
        missing_count >= 2  # 2+ missing mandatory fields
    )
    
    return {
        "score": final_score,
        "needs_manual_review": needs_manual_review
    }


# ==========================
# API Endpoints
# ==========================

@app.get("/")
def root():
    return {
        "message": "Legal Metrology AI API",
        "version": "1.0.0",
        "status": "online"
    }


@app.post("/api/v1/auth/register", response_model=LoginResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user.role not in ["Admin", "Auditor", "Client"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be Admin, Auditor, or Client")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username, "role": new_user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role,
            "is_active": new_user.is_active
        }
    }


@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    db_user = db.query(User).filter(User.username == user.username).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "role": db_user.role,
            "is_active": db_user.is_active
        }
    }


@app.post("/api/v1/scan", response_model=ScanResult)
async def scan_image(
    file: UploadFile = File(...),
    tamil_support: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scan a single product label image for compliance
    Requires authentication (any role)
    """
    start_time = datetime.utcnow()
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image_array = np.array(image)
    
    # Check image quality
    image_quality = check_image_blur(image_array)
    
    # Extract text
    lang_config = 'eng+tam' if tamil_support else 'eng'
    extracted_text = extract_text_from_image(image_array, lang_config)
    
    # Check compliance
    compliance_results = check_compliance(extracted_text)
    
    # Get compliance status
    found_keywords = [field for field, result in compliance_results.items() if result["found"]]
    missing_keywords = [field for field, result in compliance_results.items() if not result["found"]]
    compliance_status = "COMPLIANT" if len(missing_keywords) == 0 else "NON_COMPLIANT"
    
    # Calculate confidence score (Phase 3 Enhanced)
    confidence_data = calculate_confidence_score(compliance_results, image_quality)
    confidence_score = confidence_data["score"]
    needs_manual_review = confidence_data["needs_manual_review"]
    
    # Extract expiry info
    expiry_info = extract_expiry_date(extracted_text)
    
    # Calculate processing time
    processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
    
    # Update compliance status based on manual review flag
    if needs_manual_review:
        compliance_status = "MANUAL_REVIEW"
    
    # Log audit
    audit_log = AuditLog(
        filename=file.filename,
        user_id=current_user.id,
        username=current_user.username,
        extracted_text=extracted_text,
        compliance_status=compliance_status,
        confidence_score=confidence_score,
        missing_keywords=",".join(missing_keywords),
        expiry_status=str(expiry_info) if expiry_info else None,
        image_quality=image_quality['quality'],
        blur_variance=image_quality['variance'],
        processing_time_ms=processing_time
    )
    db.add(audit_log)
    db.commit()
    
    return ScanResult(
        extracted_text=extracted_text,
        compliance_status=compliance_status,
        confidence_score=confidence_score,
        missing_keywords=missing_keywords,
        found_keywords=found_keywords,
        needs_manual_review=needs_manual_review,
        expiry_info=expiry_info,
        image_quality=image_quality,
        processing_time_ms=processing_time
    )


def process_batch_image(
    file_data: bytes,
    filename: str,
    tamil_support: bool,
    user_id: int,
    username: str,
    db: Session
):
    """Background task to process a single image in batch"""
    try:
        start_time = datetime.utcnow()
        
        image = Image.open(io.BytesIO(file_data))
        image_array = np.array(image)
        
        image_quality = check_image_blur(image_array)
        
        lang_config = 'eng+tam' if tamil_support else 'eng'
        extracted_text = extract_text_from_image(image_array, lang_config)
        
        compliance_results = check_compliance(extracted_text)
        
        missing_keywords = [field for field, result in compliance_results.items() if not result["found"]]
        compliance_status = "COMPLIANT" if len(missing_keywords) == 0 else "NON_COMPLIANT"
        
        confidence_score = calculate_confidence_score(compliance_results, image_quality)
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Log audit
        audit_log = AuditLog(
            filename=filename,
            user_id=user_id,
            username=username,
            extracted_text=extracted_text,
            compliance_status=compliance_status,
            confidence_score=confidence_score,
            missing_keywords=",".join(missing_keywords),
            image_quality=image_quality['quality'],
            blur_variance=image_quality['variance'],
            processing_time_ms=processing_time
        )
        db.add(audit_log)
        db.commit()
        
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")


# ==========================
# Smart AI Auditor Endpoint
# ==========================

@app.post("/api/v1/smart-scan", response_model=SmartAuditResponse)
async def smart_scan_image(
    file: UploadFile = File(...),
    tamil_support: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Smart AI Auditor Scan with:
    - Explainable AI (coordinates extraction)
    - Fuzzy Matching (intelligent keyword detection)
    - PII Masking (blur sensitive information)
    - Forgery Detection (tampering analysis)
    
    Returns enhanced response with all auditor insights
    """
    start_time = datetime.utcnow()
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        original_image = image_array.copy()
        
        # 1. Explainable AI: Extract text with coordinates
        coordinate_data = ExplainableAIExtractor.extract_with_coordinates(
            image_array,
            lang='eng+tam' if tamil_support else 'eng'
        )
        extracted_text = coordinate_data['text']
        
        # 2. Extract basic OCR text
        lang_config = 'eng+tam' if tamil_support else 'eng'
        basic_text = extract_text_from_image(image_array, lang_config)
        
        # 3. Fuzzy Matching: Intelligent keyword matching
        fuzzy_matches = FuzzyKeywordMatcher.match_keywords(extracted_text)
        
        # 4. PII Masking: Detect and blur sensitive information
        masked_image, pii_detected = PIIMasker.detect_and_mask_pii(image_array, extracted_text)
        
        # 5. Forgery Detection: ELA analysis
        is_forged, tamper_score, tamper_reason = ForgeryDetector.detect_tamper(image_array)
        
        # Check image quality
        image_quality = check_image_blur(image_array)
        
        # Standard compliance check
        compliance_results = check_compliance(basic_text)
        found_keywords = [field for field, result in compliance_results.items() if result["found"]]
        missing_keywords = [field for field, result in compliance_results.items() if not result["found"]]
        
        # Determine compliance status
        compliance_status = "COMPLIANT" if len(missing_keywords) == 0 else "NON_COMPLIANT"
        
        # Calculate confidence score
        confidence_data = calculate_confidence_score(compliance_results, image_quality)
        confidence_score = confidence_data["score"]
        needs_manual_review = confidence_data["needs_manual_review"]
        
        if needs_manual_review or is_forged:
            compliance_status = "MANUAL_REVIEW"
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Log audit
        audit_log = AuditLog(
            filename=file.filename,
            user_id=current_user.id,
            username=current_user.username,
            extracted_text=extracted_text,
            compliance_status=compliance_status,
            confidence_score=confidence_score,
            missing_keywords=",".join(missing_keywords),
            expiry_status='Smart Auditor Scan',
            image_quality=image_quality['quality'],
            blur_variance=image_quality['variance'],
            processing_time_ms=processing_time
        )
        db.add(audit_log)
        db.commit()
        
        # Build Smart Auditor response
        response = SmartAuditorResponse(
            extracted_text=extracted_text,
            processed_image="",  # Will be filled by SmartAuditorResponse builder
            visual_analysis_image="",  # Will be filled by SmartAuditorResponse builder
            compliance_results=[],  # Will be filled below
            pii_detected=pii_detected,
            tamper_alert=is_forged,
            tamper_score=tamper_score,
            tamper_reason=tamper_reason,
            compliance_status=compliance_status,
            confidence_score=confidence_score,
            auditor_details=AuditorDetails(
                explainable_ai=True,
                fuzzy_matching_enabled=True,
                pii_masking_applied=len(pii_detected) > 0,
                forgery_detection_enabled=True
            ),
            coordinates_data=coordinate_data,
            processing_time_ms=processing_time
        )
        
        # Build compliance results from fuzzy matches
        for field, match in fuzzy_matches.items():
            if match:
                response.compliance_results.append(
                    ComplianceResultItem(
                        field=field,
                        detected_text=match[0],
                        confidence=match[1],
                        status="FOUND"
                    )
                )
            else:
                response.compliance_results.append(
                    ComplianceResultItem(
                        field=field,
                        detected_text=None,
                        confidence=0,
                        status="MISSING"
                    )
                )
        
        # Encode images to base64
        _, buffer = cv2.imencode('.png', masked_image)
        response.processed_image = __import__('base64').b64encode(buffer).decode('utf-8')
        
        # Create visual with bounding boxes
        visual_image = original_image.copy()
        for item in coordinate_data.get('items', []):
            x, y, w, h = item['x'], item['y'], item['w'], item['h']
            cv2.rectangle(visual_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(visual_image, f"{item['text']}({item['confidence']}%)", 
                       (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
        
        _, buffer = cv2.imencode('.png', visual_image)
        response.visual_analysis_image = __import__('base64').b64encode(buffer).decode('utf-8')
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart auditor scan failed: {str(e)}")


@app.post("/api/v1/batch-scan", response_model=BatchScanResult)
async def batch_scan(
    files: List[UploadFile] = File(...),
    tamil_support: bool = False,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(require_role(["Admin", "Auditor"])),
    db: Session = Depends(get_db)
):
    """
    Batch scan multiple product label images
    Requires Admin or Auditor role
    Uses background tasks for processing
    """
    start_time = datetime.utcnow()
    
    if len(files) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 images per batch")
    
    results = []
    compliant_count = 0
    non_compliant_count = 0
    
    for file in files:
        if not file.content_type.startswith('image/'):
            continue
        
        contents = await file.read()
        
        # Add to background tasks
        background_tasks.add_task(
            process_batch_image,
            contents,
            file.filename,
            tamil_support,
            current_user.id,
            current_user.username,
            db
        )
        
        # For immediate response, do quick processing
        try:
            image = Image.open(io.BytesIO(contents))
            image_array = np.array(image)
            
            lang_config = 'eng+tam' if tamil_support else 'eng'
            extracted_text = extract_text_from_image(image_array, lang_config)
            
            compliance_results = check_compliance(extracted_text)
            missing_keywords = [field for field, result in compliance_results.items() if not result["found"]]
            compliance_status = "COMPLIANT" if len(missing_keywords) == 0 else "NON_COMPLIANT"
            
            if compliance_status == "COMPLIANT":
                compliant_count += 1
            else:
                non_compliant_count += 1
            
            results.append({
                "filename": file.filename,
                "status": compliance_status,
                "missing_keywords": missing_keywords
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "ERROR",
                "error": str(e)
            })
    
    processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
    
    return BatchScanResult(
        total_images=len(files),
        compliant_count=compliant_count,
        non_compliant_count=non_compliant_count,
        results=results,
        processing_time_ms=processing_time
    )


@app.get("/api/v1/audit-logs")
def get_audit_logs(
    limit: int = 100,
    current_user: User = Depends(require_role(["Admin", "Auditor"])),
    db: Session = Depends(get_db)
):
    """
    Get audit logs (Admin and Auditor only)
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    return {
        "total": len(logs),
        "logs": [
            {
                "id": log.id,
                "filename": log.filename,
                "username": log.username,
                "compliance_status": log.compliance_status,
                "confidence_score": log.confidence_score,
                "missing_keywords": log.missing_keywords,
                "image_quality": log.image_quality,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]
    }


@app.get("/api/v1/stats")
def get_statistics(
    current_user: User = Depends(require_role(["Admin", "Auditor"])),
    db: Session = Depends(get_db)
):
    """
    Get compliance statistics (Admin and Auditor only)
    """
    total_scans = db.query(AuditLog).count()
    compliant_scans = db.query(AuditLog).filter(AuditLog.compliance_status == "COMPLIANT").count()
    non_compliant_scans = db.query(AuditLog).filter(AuditLog.compliance_status == "NON_COMPLIANT").count()
    
    avg_confidence = db.query(AuditLog).with_entities(
        AuditLog.confidence_score
    ).all()
    
    avg_score = sum(score[0] for score in avg_confidence if score[0]) / len(avg_confidence) if avg_confidence else 0
    
    return {
        "total_scans": total_scans,
        "compliant_count": compliant_scans,
        "non_compliant_count": non_compliant_scans,
        "compliance_rate": round((compliant_scans / total_scans * 100), 2) if total_scans > 0 else 0,
        "average_confidence_score": round(avg_score, 2)
    }


# ==========================
# Phase 3: PDF Report Generation
# ==========================

@app.get("/api/v1/report/{audit_id}")
async def generate_audit_report(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and download PDF audit report for a scan (Phase 3)"""
    
    # Fetch audit log from database
    audit_log = db.query(AuditLog).filter(AuditLog.id == audit_id).first()
    if not audit_log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    
    # Check authorization - users can only download their own reports unless Admin
    if current_user.role != "Admin" and audit_log.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
    
    # Prepare scan data for PDF
    scan_data = {
        "filename": audit_log.filename,
        "timestamp": audit_log.timestamp.isoformat() if audit_log.timestamp else "",
        "compliance_status": audit_log.compliance_status,
        "confidence_score": audit_log.confidence_score,
        "extracted_text": audit_log.extracted_text,
        "found_keywords": audit_log.missing_keywords.split(",") if audit_log.missing_keywords else [],
        "missing_keywords": [kw.strip() for kw in audit_log.missing_keywords.split(",") if kw.strip()] if audit_log.missing_keywords else [],
        "image_quality": {
            "variance": audit_log.blur_variance or 0,
            "quality": audit_log.image_quality or "Unknown",
            "is_blurry": (audit_log.blur_variance or 0) < 100
        },
        "needs_manual_review": audit_log.compliance_status == "MANUAL_REVIEW",
        "user": current_user.username,
        "role": current_user.role,
        "processing_time_ms": audit_log.processing_time_ms or 0
    }
    
    # Generate PDF
    try:
        report_generator = ComplianceReportGenerator()
        pdf_bytes = report_generator.generate_compliance_report(
            scan_data,
            filename=audit_log.filename.replace('.jpg', '.pdf').replace('.png', '.pdf')
        )
        
        # Return PDF as download
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=compliance_report_{audit_id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


@app.delete("/api/v1/audit-logs/{log_id}")
def delete_audit_log(
    log_id: int,
    current_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    """
    Delete an audit log (Admin only)
    """
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    
    db.delete(log)
    db.commit()
    
    return {"message": "Audit log deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
