# 🚀 FastAPI Backend Setup - Quick Guide

## What We Built

I've created an **enterprise-grade FastAPI backend** with all the features you requested:

### ✅ Core Features
- **OCR Integration**: Your existing OpenCV + Tesseract logic for English and Tamil
- **REST API Endpoints**: `/api/v1/scan` and `/api/v1/batch-scan`
- **JWT Authentication**: Secure token-based auth with 3 user roles
- **Database Logging**: SQLAlchemy with SQLite/PostgreSQL support
- **Background Tasks**: Async batch processing

### 📁 Files Created

```
backend/
├── main.py                 # Main FastAPI application (675 lines)
├── requirements.txt        # Python dependencies
├── .env.example           # Environment configuration template
├── .gitignore             # Git ignore rules
├── README.md              # Complete documentation
├── test_api.py            # API testing script
└── start.ps1              # Quick start script
```

## 🎯 Quick Start (3 Steps)

### 1. Start the Backend Server

```powershell
cd backend
.\start.ps1
```

This will:
- Activate your virtual environment
- Install all dependencies
- Start the FastAPI server on http://localhost:8000

### 2. Access the API Documentation

Open your browser to:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Test the API

```powershell
# In a new terminal
cd backend
python test_api.py
```

## 🔑 API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Scanning
- `POST /api/v1/scan` - Scan single image (all roles)
- `POST /api/v1/batch-scan` - Batch scan (Admin/Auditor only)

### Audit & Stats
- `GET /api/v1/audit-logs` - Get scan history (Admin/Auditor)
- `GET /api/v1/stats` - Get statistics (Admin/Auditor)
- `DELETE /api/v1/audit-logs/{id}` - Delete log (Admin only)

## 👥 User Roles

1. **Admin** - Full access to all endpoints
2. **Auditor** - Can scan and view logs/stats
3. **Client** - Can only scan images

## 📊 Response Example

```json
{
  "extracted_text": "MRP Rs. 100\nNet Wt: 500g\nMfg: Jan 2025",
  "compliance_status": "COMPLIANT",
  "confidence_score": 85.5,
  "missing_keywords": [],
  "found_keywords": ["MRP", "Net Quantity", "Manufacturing Date", ...],
  "expiry_info": {...},
  "image_quality": {
    "variance": 342.5,
    "quality": "Good",
    "is_blurry": false
  },
  "processing_time_ms": 1250.5
}
```

## 🧪 Testing Workflow

### Using the Test Script

```python
from test_api import LegalMetrologyClient

# Create client
client = LegalMetrologyClient()

# Register and login
client.register("admin", "admin@test.com", "admin123", "Admin")

# Scan an image
result = client.scan_image("label.jpg", tamil_support=False)

# Get statistics
stats = client.get_statistics()
```

### Using cURL

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","role":"Admin"}'

# Login and save token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')

# Scan image
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@label.jpg"
```

## 🗄️ Database

The SQLite database `legal_metrology.db` is created automatically.

**Tables:**
- `users` - User accounts with authentication
- `audit_logs` - Complete history of all scans

View the database:
```powershell
# Install DB Browser for SQLite
# Or use command line
sqlite3 legal_metrology.db
.tables
.schema users
SELECT * FROM audit_logs;
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Token expiration (30 minutes default)
- ✅ CORS protection
- ✅ Input validation with Pydantic

## 🌐 Integration with Streamlit App

Your Streamlit frontend can now call this backend:

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"username": "admin", "password": "admin123"}
)
token = response.json()["access_token"]

# Scan image
files = {"file": open("label.jpg", "rb")}
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    "http://localhost:8000/api/v1/scan",
    headers=headers,
    files=files
)
result = response.json()
```

## 📈 Next Steps

1. **Test the API** using Swagger UI
2. **Create test users** with different roles
3. **Upload sample images** to test OCR
4. **Review audit logs** in the database
5. **Integrate with your Streamlit app**

## 🐛 Troubleshooting

**Port already in use:**
```powershell
# Change port in start.ps1 to 8001
--port 8001
```

**Database locked:**
```powershell
# Delete and recreate
Remove-Item legal_metrology.db
# Restart server
```

**Tesseract not found:**
```powershell
# Add to .env
TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
```

## 📚 Documentation

Full documentation is in `backend/README.md`

## 🎉 Success!

You now have a production-ready FastAPI backend with:
- ✅ Complete OCR integration
- ✅ JWT authentication
- ✅ Database logging
- ✅ Batch processing
- ✅ Role-based access
- ✅ Auto-generated API docs

**Start the server and visit http://localhost:8000/docs to explore!** 🚀
