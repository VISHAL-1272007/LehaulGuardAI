# Legal Metrology AI - FastAPI Backend

Enterprise-grade backend system for Legal Metrology compliance checking with OCR, authentication, and database logging.

## 🚀 Features

### Core Functionality
- ✅ **OCR Integration**: OpenCV + Tesseract for English and Tamil text extraction
- ✅ **Compliance Checking**: Automated verification of 5 mandatory Legal Metrology fields
- ✅ **Image Quality Analysis**: Laplacian variance blur detection
- ✅ **Expiry Date Extraction**: Regex-based date parsing with validation
- ✅ **Confidence Scoring**: Combined OCR accuracy and image quality metrics

### Security & Authentication
- 🔐 **JWT-based Authentication**: Secure token-based auth system
- 👥 **Role-based Access Control**: Admin, Auditor, and Client roles
- 🔒 **Password Hashing**: Bcrypt encryption for user passwords
- ⚡ **Token Expiration**: Configurable access token lifetime

### Database & Logging
- 💾 **SQLAlchemy ORM**: Support for SQLite and PostgreSQL
- 📊 **Audit Logging**: Complete tracking of all scans with metadata
- 📈 **Statistics API**: Real-time compliance rate and performance metrics
- 🗑️ **Data Management**: Admin controls for audit log management

### Advanced Features
- 🔄 **Batch Processing**: Handle up to 50 images per request
- ⚡ **Background Tasks**: Async processing for large batches
- 🌐 **CORS Support**: Cross-origin resource sharing enabled
- 📝 **API Documentation**: Auto-generated Swagger/OpenAPI docs

## 📋 Prerequisites

1. **Python 3.8+**
2. **Tesseract OCR** installed on your system
3. **Tamil language data** for bilingual support (optional)

## 🛠️ Installation

### 1. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and update:
- `SECRET_KEY` - Generate a secure key
- `DATABASE_URL` - Configure your database
- `TESSERACT_CMD` - Path to Tesseract (if needed)

### 3. Initialize Database

The database is automatically created on first run. Tables:
- `users` - User accounts with roles
- `audit_logs` - Complete scan history

## 🚀 Running the Server

### Development Mode

```powershell
# From backend directory
python main.py
```

or use uvicorn directly:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Server will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "securepassword123",
  "role": "Admin"
}
```

**Roles**: `Admin`, `Auditor`, `Client`

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Scanning

#### Single Image Scan
```http
POST /api/v1/scan
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
tamil_support: false
```

**Response**:
```json
{
  "extracted_text": "Product Label\nMRP: Rs. 100\n...",
  "compliance_status": "COMPLIANT",
  "confidence_score": 85.5,
  "missing_keywords": [],
  "found_keywords": ["MRP", "Net Quantity", "Manufacturing Date", "Customer Care", "Country of Origin"],
  "expiry_info": {
    "found": true,
    "date_string": "12/2026",
    "context": "Expiry: 12/2026"
  },
  "image_quality": {
    "variance": 342.5,
    "is_blurry": false,
    "quality": "Good"
  },
  "processing_time_ms": 1250.5
}
```

#### Batch Scan (Admin/Auditor only)
```http
POST /api/v1/batch-scan
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: <multiple_image_files>
tamil_support: false
```

**Response**:
```json
{
  "total_images": 10,
  "compliant_count": 8,
  "non_compliant_count": 2,
  "results": [
    {
      "filename": "label1.jpg",
      "status": "COMPLIANT",
      "missing_keywords": []
    },
    ...
  ],
  "processing_time_ms": 5430.2
}
```

### Audit & Statistics (Admin/Auditor only)

#### Get Audit Logs
```http
GET /api/v1/audit-logs?limit=100
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/v1/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "total_scans": 150,
  "compliant_count": 120,
  "non_compliant_count": 30,
  "compliance_rate": 80.0,
  "average_confidence_score": 82.5
}
```

#### Delete Audit Log (Admin only)
```http
DELETE /api/v1/audit-logs/{log_id}
Authorization: Bearer <token>
```

## 🔑 Role Permissions

| Endpoint | Admin | Auditor | Client |
|----------|-------|---------|--------|
| `/api/v1/scan` | ✅ | ✅ | ✅ |
| `/api/v1/batch-scan` | ✅ | ✅ | ❌ |
| `/api/v1/audit-logs` | ✅ | ✅ | ❌ |
| `/api/v1/stats` | ✅ | ✅ | ❌ |
| `DELETE /audit-logs` | ✅ | ❌ | ❌ |

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE,
    hashed_password VARCHAR,
    role VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    filename VARCHAR,
    user_id INTEGER,
    username VARCHAR,
    extracted_text TEXT,
    compliance_status VARCHAR,
    confidence_score FLOAT,
    missing_keywords VARCHAR,
    expiry_status VARCHAR,
    image_quality VARCHAR,
    blur_variance FLOAT,
    timestamp TIMESTAMP,
    processing_time_ms FLOAT
);
```

## 📊 Compliance Checking Logic

The system checks for 5 mandatory fields:

1. **MRP** (Maximum Retail Price)
   - Keywords: MRP, M.R.P, Retail Price, விலை
   
2. **Net Quantity**
   - Keywords: Net Wt, Net Weight, Quantity, எடை
   
3. **Manufacturing Date**
   - Keywords: Mfg Date, MFD, Manufacturing Date, தயாரிப்பு தேதி
   
4. **Customer Care**
   - Keywords: Customer Care, Contact, Helpline, வாடிக்கையாளர் சேவை
   
5. **Country of Origin**
   - Keywords: Made in, Country of Origin, தயாரிப்பு நாடு

## 🧪 Testing the API

### Using cURL

```bash
# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123","role":"Client"}'

# Login
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | jq -r '.access_token')

# Scan an image
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@label.jpg" \
  -F "tamil_support=false"
```

### Using Python

See `test_api.py` for complete examples.

### Using Postman

1. Import the API from: http://localhost:8000/openapi.json
2. Create an environment with `base_url` = `http://localhost:8000`
3. Test endpoints with the auto-generated collection

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./legal_metrology.db` |
| `SECRET_KEY` | JWT signing key | (required) |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `30` |
| `TESSERACT_CMD` | Path to Tesseract | System PATH |
| `TESSDATA_PREFIX` | Path to tessdata | Auto-detected |

### Database Migration (PostgreSQL)

For production with PostgreSQL:

```powershell
# Install psycopg2
pip install psycopg2-binary

# Update .env
DATABASE_URL=postgresql://user:password@localhost/legal_metrology_db

# Create database
createdb legal_metrology_db

# Tables auto-create on first run
python main.py
```

## 🚨 Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## 🔐 Security Best Practices

1. **Change the SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Configure CORS** properly for your frontend
4. **Use PostgreSQL** instead of SQLite in production
5. **Set strong password policies**
6. **Enable rate limiting** (add middleware)
7. **Regular security audits**

## 📈 Performance Optimization

- Background tasks for batch processing
- Image preprocessing optimizations
- Database indexing on frequently queried fields
- Connection pooling for database
- Caching for frequently accessed data

## 🐛 Troubleshooting

### Tesseract not found

```powershell
# Set in .env
TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
```

### Tamil OCR not working

Ensure Tamil traineddata is installed:
```powershell
# Download tam.traineddata
# Place in tessdata folder
```

### Database locked (SQLite)

Switch to PostgreSQL for production or use:
```python
connect_args={"check_same_thread": False, "timeout": 30}
```

## 📝 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@example.com

## 🎯 Roadmap

- [ ] Redis caching for performance
- [ ] WebSocket support for real-time updates
- [ ] Email notifications for compliance failures
- [ ] Export audit logs to CSV/Excel
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Hindi, Bengali, etc.)
- [ ] Docker containerization
- [ ] Kubernetes deployment configs
