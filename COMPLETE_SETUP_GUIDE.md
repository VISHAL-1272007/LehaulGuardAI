# 🚀 LegalGuard AI - Complete Project Setup Guide

## ✅ What Has Been Built

You now have a **full-stack enterprise-grade Legal Metrology AI system**:

### 🎯 Backend (FastAPI)
- ✅ JWT Authentication with 3 roles (Admin, Auditor, Client)
- ✅ OCR Integration (OpenCV + Tesseract)
- ✅ Tamil + English language support
- ✅ SQLite/PostgreSQL database
- ✅ Audit logging system
- ✅ Single & batch scan endpoints
- ✅ Statistics and compliance tracking
- ✅ Auto-generated API docs

### 🎨 Frontend (React + Vite)
- ✅ Glassmorphism design with dark/light themes
- ✅ Responsive sidebar navigation
- ✅ Real-time analytics dashboard
- ✅ Drag-and-drop image scanner
- ✅ Batch audit processor
- ✅ Compliance logs viewer
- ✅ Data visualization (Recharts)
- ✅ Framer Motion animations
- ✅ JWT authentication flow

---

## 📁 Project Structure

```
d:\iot-group-project\
├── backend/                    # FastAPI Backend
│   ├── main.py                 # Main API application (675 lines)
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   ├── test_api.py             # API testing client
│   ├── start.ps1               # Quick start script
│   ├── legal_metrology.db      # SQLite database (auto-created)
│   └── README.md               # Backend documentation
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── contexts/           # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx       # Auth page
│   │   │   ├── Dashboard.jsx   # Analytics
│   │   │   ├── Scanner.jsx     # Single scan
│   │   │   ├── BatchAudit.jsx  # Batch processing
│   │   │   ├── ComplianceLogs.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── lib/
│   │   │   └── utils.js        # Utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── tessdata/                   # Tesseract language data
│   ├── eng.traineddata
│   └── tam.traineddata
│
├── app.py                      # Streamlit app (original)
├── requirements.txt            # Main dependencies
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started - Quick Launch

### Step 1: Start Backend API

```powershell
cd d:\iot-group-project\backend
.\start.ps1
```

✅ **Backend running at:** http://localhost:8000  
✅ **API Docs:** http://localhost:8000/docs

### Step 2: Start Frontend App

```powershell
cd d:\iot-group-project\frontend
.\start.ps1
```

✅ **Frontend running at:** http://localhost:3000

> **Note:** Both servers are currently running! 🎉

---

## 📊 Current Status

### ✅ Running Services

| Service | Port | Status | URL |
|---------|------|--------|-----|
| FastAPI Backend | 8000 | 🟢 Running | http://localhost:8000 |
| React Frontend | 3000 | 🟢 Running | http://localhost:3000 |
| API Documentation | 8000 | 🟢 Available | http://localhost:8000/docs |

### ✅ Database
- **Type:** SQLite
- **Location:** `backend/legal_metrology.db`
- **Status:** Created and initialized
- **Tables:** `users`, `audit_logs`

### ✅ Test User
- **Username:** testadmin
- **Password:** admin123
- **Role:** Admin

---

## 🎯 How to Use the System

### 1️⃣ Login to Frontend

1. Open http://localhost:3000
2. You'll see the glassmorphism login page
3. **Register new user** or use:
   - Username: `testadmin`
   - Password: `admin123`
   - Role: Admin

### 2️⃣ Dashboard Overview

After login, you'll see:
- **4 KPI Cards:** Total Scans, Compliant, Non-Compliant, Compliance Rate
- **Weekly Trend Chart:** Line graph showing compliance trend
- **Distribution Chart:** Pie chart of compliant vs non-compliant
- **Recent Scans Table:** Latest scan history

### 3️⃣ Scan a Product Label

**Go to Scanner page:**
1. Drag & drop a product label image
2. Toggle "Tamil OCR Support" if needed
3. Click **"Scan for Compliance"**
4. Watch the neural network animation
5. View results:
   - ✓ Compliance status
   - Confidence score with progress bar
   - Found keywords (green)
   - Missing keywords (red)
   - Image quality metrics
   - Full OCR extracted text

### 4️⃣ Batch Process Multiple Images

**Go to Batch Audit page:**
1. Upload up to 50 images
2. Enable Tamil support if needed
3. Click **"Process Batch"**
4. View summary:
   - Total images processed
   - Compliant vs non-compliant count
   - Individual results for each image

### 5️⃣ View Audit History

**Go to Compliance Logs:**
- Search by filename
- Filter by compliance status
- View detailed scan history
- Export to CSV
- Delete logs (Admin only)

---

## 🎨 UI Features Showcase

### ✨ Glassmorphism Design
- Backdrop blur effects
- Transparent overlays
- Gradient borders
- Smooth transitions

### 🌙 Dark/Light Theme
- Click the sun/moon icon in header
- Automatic theme persistence
- Smooth color transitions

### 🎭 Animations
- Page transitions with Framer Motion
- Loading animations during scans
- Hover effects on cards
- Floating gradient orbs
- Pulse animations

### 📱 Responsive Layout
- Sidebar navigation
- Mobile-friendly (responsive grid)
- Touch-friendly controls

---

## 🔐 Authentication Flow

### Register New User

```javascript
POST /api/v1/auth/register
{
  "username": "yourname",
  "email": "your@email.com",
  "password": "password123",
  "role": "Client" | "Auditor" | "Admin"
}
```

### Login

```javascript
POST /api/v1/auth/login
{
  "username": "yourname",
  "password": "password123"
}

Response: {
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": { ... }
}
```

### Role Permissions

| Feature | Client | Auditor | Admin |
|---------|--------|---------|-------|
| Single Scan | ✅ | ✅ | ✅ |
| Batch Scan | ❌ | ✅ | ✅ |
| View Logs | ❌ | ✅ | ✅ |
| View Stats | ❌ | ✅ | ✅ |
| Delete Logs | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ |

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT

### Scanning
- `POST /api/v1/scan` - Scan single image
- `POST /api/v1/batch-scan` - Batch process images

### Audit & Stats
- `GET /api/v1/audit-logs` - Get scan history
- `GET /api/v1/stats` - Get statistics
- `DELETE /api/v1/audit-logs/{id}` - Delete log (Admin)

---

## 🧪 Testing the System

### Test with Sample Image

1. **Create or download** a product label image
2. Must contain text like:
   - "MRP Rs. 100"
   - "Net Wt: 500g"
   - "Mfg Date: 01/2025"
   - "License No: 12345"
   - "Manufacturer: ABC Foods"

3. Upload to Scanner or Batch Audit
4. View compliance results

### API Testing (Backend)

```powershell
cd backend
python test_api.py
```

Expected output:
```
✅ Login successful!
✅ Statistics retrieved
✅ Audit logs retrieved
```

---

## 🔧 Configuration

### Backend Environment (.env)

Create `backend/.env`:

```env
# Database
DATABASE_URL=sqlite:///./legal_metrology.db
# For PostgreSQL: postgresql://user:pass@localhost/dbname

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Tesseract (if not in PATH)
TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
```

### Frontend Environment (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=LegalGuard AI
```

---

## 📦 Dependencies

### Backend (Python)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
opencv-python
pytesseract
Pillow
numpy
```

### Frontend (Node.js)
```
react@18.3.1
vite@5.1.4
tailwindcss@3.4.1
framer-motion@11.0.3
@tanstack/react-query@5.20.5
axios@1.6.7
react-dropzone@14.2.3
recharts@2.12.0
lucide-react@0.344.0
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```powershell
# Kill existing process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Tesseract not found:**
```powershell
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Install and add to PATH
```

**Database error:**
```powershell
# Delete and recreate
Remove-Item backend\legal_metrology.db
# Restart backend
```

### Frontend Issues

**CORS Error:**
- Ensure backend CORS is configured
- Check Vite proxy in `vite.config.js`

**Authentication failed:**
```javascript
// Clear browser storage
localStorage.clear()
// Refresh page and login again
```

**Images not uploading:**
- Max size: 10MB
- Formats: PNG, JPG, JPEG, WEBP
- Check network tab for errors

---

## 🎓 Next Steps

### Enhancements to Consider

1. **Add Email Notifications**
   - Send alerts for non-compliant scans
   - Weekly compliance reports

2. **PDF Report Generation**
   - Export scan results as PDF
   - Include images and compliance data

3. **Advanced Analytics**
   - Monthly/yearly trends
   - Keyword frequency analysis
   - Manufacturer compliance ratings

4. **User Management UI**
   - Add/edit/delete users
   - Role assignment
   - Activity monitoring

5. **Real-time Notifications**
   - WebSocket integration
   - Live scan updates
   - Batch processing progress

6. **Mobile App**
   - React Native version
   - On-device scanning
   - Offline support

---

## 📝 Maintenance

### Update Dependencies

**Backend:**
```powershell
cd backend
pip install --upgrade -r requirements.txt
```

**Frontend:**
```powershell
cd frontend
npm update
```

### Backup Database

```powershell
# Copy database file
Copy-Item backend\legal_metrology.db -Destination backup\legal_metrology_backup_$(Get-Date -Format 'yyyyMMdd').db
```

### View Logs

**Backend logs:** Terminal output when running
**Frontend logs:** Browser console (F12)

---

## 🌟 Features Highlight

### Backend Excellence
- ✅ RESTful API design
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Background task processing
- ✅ Database ORM (SQLAlchemy)
- ✅ Input validation (Pydantic)
- ✅ Auto-generated docs (Swagger)
- ✅ CORS configuration

### Frontend Excellence
- ✅ Modern React 18 + Hooks
- ✅ Client-side routing
- ✅ Global state management
- ✅ Optimistic updates
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Accessibility features

---

## 📞 Support

For issues or questions:
1. Check this README
2. View API docs: http://localhost:8000/docs
3. Check browser console (F12)
4. Review terminal logs

---

## 🎉 Success!

You now have a **production-ready enterprise system** with:

✅ **Full-stack architecture**  
✅ **Modern tech stack**  
✅ **Beautiful UI/UX**  
✅ **Secure authentication**  
✅ **Complete API**  
✅ **Database integration**  
✅ **Real-time analytics**  
✅ **Batch processing**  

**Both servers are running and ready to use!** 🚀

---

**Developed with ❤️ for Legal Metrology Compliance**
