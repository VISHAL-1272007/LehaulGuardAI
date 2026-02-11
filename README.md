# 🛡️ LegalGuard AI - Complete Compliance System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.8-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://www.python.org/)

**AI-Powered Legal Metrology Compliance System with Smart Auditor, OCR, Mobile Scanner, and ESP32-S3 IoT Integration**

Complete enterprise-grade system for automated compliance checking of product labels using advanced AI, computer vision, and IoT edge devices.

---

## 🌟 **Features**

### 🖥️ **Desktop Scanner (High-Tech UI)**
- **Interactive Image Canvas** - SVG bounding boxes with coordinate overlay
- **Visual Compliance Tiles** - 6 status cards with green glow/red pulse animations
- **Terminal Feed** - Live hacker-style audit logs
- **Glassmorphism Theme** - Modern backdrop-blur design
- **Comparison View** - Toggle between raw and AI-processed images

### 📱 **Mobile Web Scanner**
- **Live Camera Feed** - Real-time webcam integration
- **Scanner Overlay** - Animated alignment guides
- **Auto-Capture** - 3-second countdown on image stability
- **Touch-Optimized** - Fullscreen mobile-responsive controls

### 🤖 **ESP32-S3 IoT Edge Scanner**
- **Factory Automation** - Assembly line integration
- **IR Sensor Detection** - Auto-triggers on product arrival
- **LED Status** - Green (pass), Red (fail), Yellow (processing)
- **Conveyor Control** - Relay stops belt for non-compliant products

### 🧠 **Smart AI Auditor**
- **Explainable AI** - Bounding box coordinates for every field
- **Fuzzy Matching** - Detects keyword variations (85% similarity)
- **PII Masking** - Auto-blurs phone numbers, emails, addresses
- **Forgery Detection** - ELA tampering detection

---

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- Tesseract OCR

### **Installation**

```bash
# Clone repository
git clone https://github.com/VISHAL-1272007/LehaulGuardAI.git
cd LehaulGuardAI

# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Run backend
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Access:**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

---

## 📱 **3 Scanning Modes**

| Mode | Device | Input | Use Case |
|------|--------|-------|----------|
| **Desktop** | PC/Laptop | File upload | Office analysis |
| **Mobile** | Smartphone | Live camera | Field inspections |
| **IoT** | ESP32-S3 | Auto-capture | Factory automation |

---

## 🗂️ **Project Structure**

```
legalguard-ai/
├── backend/                     # FastAPI Backend
│   ├── main.py                 # API endpoints
│   ├── smart_auditor.py        # AI features
│   ├── requirements.txt        # Dependencies
│   ├── Dockerfile              # Container config
│   └── .env.example            # Environment template
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ScannerAI.jsx  # Desktop scanner
│   │   │   └── MobileScanner.jsx # Mobile scanner
│   │   └── App.jsx            # Device routing
│   └── package.json
├── docs/                        # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SMART_AI_AUDITOR_GUIDE.md
│   ├── MOBILE_SCANNER_GUIDE.md
│   └── ESP32_IOT_GUIDE.md
└── render.yaml                  # Render deployment
```

---

## 🎨 **Smart AI Features**

### **Explainable AI**
Returns bounding boxes and cropped images for every detected field.

### **Fuzzy Matching**
Detects typos and OCR errors (e.g., "Best Bfore" matches "Best Before" at 88%).

### **PII Masking**
Auto-blurs phone numbers, emails, and addresses in images.

### **Forgery Detection**
ELA (Error Level Analysis) detects digitally edited labels.

---

## 🌐 **Deployment**

### **Render (One-Click)**

1. Push to GitHub
2. Go to [Render](https://render.com)
3. Click "New" → "Blueprint"
4. Select this repository
5. Click "Apply"

**Full Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### **Docker**

```bash
cd backend
docker build -t legalguard-ai .
docker run -p 8000:8000 legalguard-ai
```

---

## 📊 **Tech Stack**

**Backend:** FastAPI, Tesseract OCR, OpenCV, Scikit-Image, TheFuzz, SQLAlchemy, JWT

**Frontend:** React, Vite, Framer Motion, TailwindCSS, React Webcam

**IoT:** ESP32-S3, Arduino, OV2640/OV5640 Camera

---

## 📚 **Documentation**

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Complete deployment instructions |
| [SMART_AI_AUDITOR_GUIDE.md](SMART_AI_AUDITOR_GUIDE.md) | AI features deep dive |
| [MOBILE_SCANNER_GUIDE.md](MOBILE_SCANNER_GUIDE.md) | Mobile scanner details |
| [ESP32_IOT_GUIDE.md](ESP32_IOT_GUIDE.md) | IoT hardware guide |

---

## 🔐 **Security**

- ✅ JWT Authentication
- ✅ Environment variables protected (`.env` gitignored)
- ✅ CORS protection
- ✅ PII masking
- ✅ HTTPS in production

**Never commit `.env` file!** Use `.env.example` as template.

---

## 👨‍💻 **Author**

**Vishal**
- GitHub: [@VISHAL-1272007](https://github.com/VISHAL-1272007)

---

## 📧 **Support**

Questions or issues? Open an [Issue](https://github.com/VISHAL-1272007/legalguard-ai/issues)

---

**Made with ❤️ for Legal Metrology Compliance**

