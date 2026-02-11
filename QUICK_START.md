# ⚡ QUICK START GUIDE - AI Auditor System

## 🟢 Current System Status

```
✅ Backend FastAPI:  http://localhost:8000
   📝 API Docs:      http://localhost:8000/docs
   
✅ Frontend React:   http://localhost:3002
   🎨 UI Interface:  Ready to scan!
```

---

## 🚀 **START HERE** (Copy-Paste Commands)

### Terminal 1: Backend (FastAPI)
```powershell
cd d:\iot-group-project\backend
D:/iot-group-project/.venv/Scripts/python.exe main.py
```
✅ Wait for: `Uvicorn running on http://0.0.0.0:8000`

### Terminal 2: Frontend (React)
```powershell
cd d:\iot-group-project\frontend
npm run dev
```
✅ Wait for: `Local: http://localhost:3002`

---

## 🎮 **5-MINUTE DEMO**

### Step 1: Open Frontend
```
Browser → http://localhost:3002
```

### Step 2: Login
```
Email:    testadmin@example.com
Password: admin123
```

### Step 3: Go to Scanner
```
Click: "Scanner" in left sidebar
See:   "🤖 AI AUDIT SCANNER" header
```

### Step 4: Upload Image
```
Drag & Drop OR Click to browse:
├─ Product label image
├─ Any PNG, JPG, WEBP
└─ Max 10MB file size
```

### Step 5: Scan Image
```
Make Sure: "🟢 AI Auditor Mode" is ON
Click:     "🚀 Start AI Audit" button
Watch:     Terminal feed shows processing steps
```

### Step 6: See Results
```
You'll See:
├─ Interactive image canvas with animated boxes
├─ Compliance tiles (green/yellow/red status)
├─ Processing terminal (hacker-style logs)
├─ Confidence score & compliance status
└─ Option to toggle "Raw" vs "PII Masked" views
```

---

## 🎯 **WHAT TO EXPECT**

### During Scan (2-3 seconds)
```
Terminal shows:
> 🚀 Initializing neural network...
> 📊 Loading compliance database...
> Extracting text with OCR engine...
> Running fuzzy keyword matching...
> Detecting PII in image...
> Analyzing image tampering (ELA)...
> Generating visual analysis...
> ✅ Analysis complete!
```

### Results Display
```
IMAGE CANVAS:
- Original product label appears
- Green boxes drawn around detected text
- Each box shows confidence % (95%, 88%, etc.)
- Toggle button to see PII-masked version

COMPLIANCE TILES (6-panel grid):
MRP             │ NET QUANTITY    │ MFG DATE
✓ Found (100%)  │ ⚠ Missing (0%)  │ ✓ Found (95%)
[████████]      │ [          ]    │ [███████ ]

EXP DATE        │ BATCH NUMBER    │ PHONE (PII)
✓ Found (88%)   │ ✓ Found (92%)   │ 🔓 PII (100%)
[██████  ]      │ [███████  ]     │ [████████]

ALERTS (if applicable):
- 🚨 Tampering Detected (if ELA score > threshold)
- 🔐 PII Found (if phone/email detected)

SUMMARY:
✓ COMPLIANT | 92.5% Confidence | 2340ms processing
```

---

## ⚙️ **CONTROLS & TOGGLES**

### Upload Section
```
┌─────────────────────────────┐
│ AI Auditor Mode Toggle      │  ON (Blue) = Smart Scan enabled
│                             │  OFF = Standard scan
│ Tamil OCR Support Toggle    │  ON = Tamil text recognition
│                             │  OFF = English only
└─────────────────────────────┘
```

### Results Section
```
┌─────────────────────────────┐
│ 🔍 Raw + Boxes              │  View original with bounding boxes
│ 🔐 PII Masked               │  View with sensitive data blurred
└─────────────────────────────┘
```

---

## 🎨 **COLOR MEANINGS**

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 Green | Found / Success | MRP: ✓ Found (100%) |
| 🟡 Yellow | Missing / Warning | Batch No: ⚠ Missing (0%) |
| 🔴 Red | Danger / Tampering | 🚨 Image forgery detected |
| 🟦 Cyan | Active / UI accent | Buttons, toggles, highlights |

---

## 🧪 **TEST SCENARIOS**

### Test 1: Good Product Label
```
Upload: Clear product label image (JPG/PNG)
Expect:
├─ All 5 fields detected (100% compliant)
├─ Confidence score: 85-95%
├─ No PII detected (if no contact info visible)
└─ No tampering alert
```

### Test 2: Blurry Image
```
Upload: Out-of-focus product label
Expect:
├─ Lower confidence scores (60-75%)
├─ Some fields marked "Missing"
├─ Compliant: maybe, depends on critical fields
└─ Terminal shows processing completed
```

### Test 3: Image with Contact Info
```
Upload: Label showing phone/email
Expect:
├─ Red tile appears: "🔓 PHONE (PII) - 100%"
├─ Red tile appears: "🔓 EMAIL (PII) - 100%"
├─ Processed image shows blurred phone numbers
└─ Warning about sensitive data found
```

### Test 4: All Features
```
Contact: admin@legalguard.co
Phone:   +91-9876543210
Image:   Product label + contact info
Expect:
├─ Bounding boxes around all text
├─ Compliance fields marked appropriately
├─ PII detection tiles in red
├─ Processed image with blurred contact info
├─ Terminal logs all 8+ processing steps
└─ Confidence: 92-95%
```

---

## 🔗 **API ENDPOINTS** (Advanced)

### Smart Scan (with AI features)
```bash
POST /api/v1/smart-scan
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: multipart/form-data

Parameters:
├─ file: Binary image data (required)
└─ tamil_support: true|false (optional)

Response:
├─ extracted_text: String
├─ processed_image: Base64 PNG (PII masked)
├─ visual_analysis_image: Base64 PNG (with boxes)
├─ coordinates_data: {text, items:[{x,y,w,h,text,confidence}]}
├─ compliance_results: [{field, detected_text, confidence, status}]
├─ pii_detected: [phone, email, gstin, aadhaar]
├─ tamper_alert: Boolean
├─ tamper_score: Float (0-1+)
├─ compliance_status: "COMPLIANT" | "NON_COMPLIANT"
├─ confidence_score: Float (0-100)
└─ processing_time_ms: Float
```

### Test with cURL
```bash
curl -X POST http://localhost:8000/api/v1/smart-scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@product_label.jpg" \
  -F "tamil_support=false"
```

---

## 🐛 **TROUBLESHOOTING**

### Frontend blank / not loading
```
1. Check: http://localhost:3002 in browser
2. Open: Developer Console (F12)
3. Check: Network tab for API errors
4. Fix: npm install && npm run dev
```

### Backend API errors (500)
```
1. Check: http://localhost:8000/docs
2. See: Swagger API documentation
3. Verify: /api/v1/smart-scan endpoint listed
4. Check: Backend terminal for Python errors
```

### Images not uploading
```
1. Use: PNG, JPG, JPEG, or WEBP format
2. Check: File size under 10MB
3. Try: Refresh browser (Ctrl+R)
4. Ensure: Authentication token valid
```

### Slow processing (>5 sec)
```
Normal: 2-3 seconds for standard image
Slow: Might be:
├─ Pytesseract initializing (first run)
├─ Large image file (reduce size)
├─ System resources low
└─ Network latency (check backend logs)
```

---

## 📚 **DOCUMENTATION**

| Document | Purpose |
|----------|---------|
| `SMART_AI_AUDITOR_GUIDE.md` | Backend features & API details |
| `HIGH_TECH_FRONTEND_GUIDE.md` | Frontend UI & component details |
| `AI_AUDITOR_COMPLETE_GUIDE.md` | Full system architecture & flow |
| Backend docs | http://localhost:8000/docs |

---

## 🎉 **YOU'RE ALL SET!**

Both servers running? ✅
Demo ready? ✅
Features working? ✅

**Time to impress! 🚀**

Upload an image and watch the AI magic happen! 🤖✨

---

## 💡 **TIPS**

1. **Best Test Image**: Product label photo with clear text
2. **For Demos**: Use images with all 5 fields visible
3. **For PII Test**: Include phone/email in image
4. **For Tampering**: Heavily edited/doctored images
5. **Terminal Aesthetic**: Shows why this is "enterprise-grade" 😎

---

## 🔄 **QUICK RESTART**

If something breaks:
```powershell
# Kill old processes
taskkill /F /IM python.exe
taskkill /F /IM node.exe

# Restart Backend
cd d:\iot-group-project\backend
D:/iot-group-project/.venv/Scripts/python.exe main.py

# In new terminal: Restart Frontend
cd d:\iot-group-project\frontend
npm run dev

# Open browser
start http://localhost:3002
```

---

**Questions? Check the detailed guides! 📖**
**Need help? Check backend logs in terminal! 📋**

