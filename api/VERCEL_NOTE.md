# 🚀 **VERCEL SERVERLESS FASTAPI DEPLOYMENT GUIDE**

## **⚠️ Important: Vercel vs Render**

Before proceeding, understand the differences:

| Feature | Vercel Serverless | Render | AWS Lambda |
|---------|-------------------|--------|-----------|
| **Best For** | Lightweight APIs | Full FastAPI apps | Scalable services |
| **Cold Starts** | 1-5 seconds | None (always on) | 1-10 seconds |
| **Max Execution** | 60 seconds | Unlimited | 15 minutes |
| **Database** | Needs separate DB | Can use SQLite ✓ | Needs separate DB |
| **OCR Support** | Limited | Full | Full |
| **Cost** | $0-20/month | $7+/month | $1+/month |

---

## **✅ RECOMMENDATION**

**For your LegalGuard AI FastAPI backend:**

### **Option 1: Use Render (RECOMMENDED)**
- ✅ Full FastAPI support
- ✅ No cold starts
- ✅ Built-in database support
- ✅ Perfect for OCR/AI workloads

**Status:** Already configured! Just deploy:
```bash
git push origin main
# Render auto-deploys from render.yaml
```

### **Option 2: Use Vercel Serverless**
- ✅ Lighter-weight API
- ✅ Faster first request (sometimes)
- ⚠️ 60-second execution timeout (problematic for OCR)
- ⚠️ Cold starts (1-5 seconds)

---

## **IF YOU WANT TO USE VERCEL: Complete Setup**

### **Step 1: Project Structure**

Your project is now configured for Vercel:

```
iot-group-project/
├── api/
│   ├── index.py          ← Vercel entry point
│   └── __init__.py       ← Package marker
├── backend/
│   ├── main.py           ← Keep for local dev
│   ├── smart_auditor.py
│   ├── pdf_report_generator.py
│   └── requirements.txt
├── frontend/
├── vercel.json           ← Vercel configuration
└── README.md
```

### **Step 2: Update requirements.txt**

Vercel needs a production-ready requirements.txt. Update `requirements.txt` in root:

```bash
cd d:\iot-group-project
copy backend\requirements.txt requirements.txt
```

Or create a minimal one with only Vercel-compatible packages:

```
fastapi==0.128.8
uvicorn==0.40.0
python-dotenv==1.2.1
@vercel/python compatible
```

### **Step 3: Deploy to Vercel**

```powershell
# Option 1: CLI (if you have Vercel CLI installed)
npm install -g vercel
vercel --prod

# Option 2: GitHub Integration (RECOMMENDED)
# 1. Go to https://vercel.com/new
# 2. Select LehaulGuardAI repository
# 3. Click "Deploy"
# 4. Set environment variables:
#    - DATABASE_URL (if using PostgreSQL)
#    - SECRET_KEY
```

### **Step 4: Environment Variables**

In Vercel dashboard, set:

```
SECRET_KEY=your-secure-key
DATABASE_URL=postgresql://...  (if using cloud DB)
CORS_ORIGINS=https://your-frontend.vercel.app
```

### **Step 5: Test Your Deployment**

```bash
curl https://your-app.vercel.app/api/v1/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "LegalGuard AI"
# }
```

---

## **⚠️ VERCEL SERVERLESS LIMITATIONS**

### **Problems You Might Face:**

1. **OCR Takes Too Long** ❌
   - Tesseract OCR can take 5-30 seconds
   - Vercel timeout: 60 seconds (production) / 300 seconds (enterprise)
   - **Solution:** Use Render instead

2. **Cold Starts** ❌
   - First request is 2-5x slower
   - Can timeout for heavy operations
   - **Solution:** Use Render (always warm)

3. **Database** ⚠️
   - SQLite not recommended (ephemeral storage)
   - Must use cloud PostgreSQL
   - **Solution:** Add PostgreSQL add-on or use Render's built-in

4. **Dependencies** ❌
   - Tesseract requires system packages
   - Scikit-image needs compilation
   - **Solution:** Custom docker builds (not free on Vercel)

---

## **✅ BETTER APPROACH: Keep Using Render**

Your backend is already **perfectly configured for Render**:

```bash
# 1. Render auto-deploys from your GitHub
git push origin main

# 2. Your render.yaml already handles everything:
#    - FastAPI with uvicorn
#    - PostgreSQL database
#    - Environment variables
#    - Auto-scaling
#    - No timeout limits

# 3. Your production backend URL:
#    https://your-app.onrender.com/api/v1
```

---

## **🎯 FINAL RECOMMENDATION**

### **Use This Setup:**

| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | Vercel | Best for React/Vite |
| **Backend** | Render | Best for FastAPI + OCR |
| **Database** | Render PostgreSQL | Included, free tier |

---

## **IF YOU STILL WANT VERCEL: Complete Checklist**

- [ ] Files created: `api/index.py`, `vercel.json`
- [ ] Dependencies updated: `requirements.txt`
- [ ] Environment variables set in Vercel dashboard
- [ ] GitHub repository synchronized
- [ ] Test endpoint responds: `/api/v1/health`
- [ ] Frontend CORS updated to Vercel URL
- [ ] Monitor cold starts and timeouts
- [ ] Consider upgrading to Pro if needed

---

## **Commands to Deploy**

```powershell
# Build and test locally
cd d:\iot-group-project
uvicorn api.index:app --reload  # Test the new entry point

# Push to GitHub (triggers Vercel if connected)
git add api/ vercel.json
git commit -m "Add Vercel serverless configuration"
git push origin main

# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

---

## **🚨 KNOWN ISSUES WITH VERCEL + FASTAPI**

1. **OCR Processing Timeout** - Vercel max is 60 seconds (production)
2. **Cold Starts** - Initial deploy can take 5+ seconds
3. **No Background Tasks** - Vercel doesn't support long-running tasks
4. **SQLite Not Available** - Must use cloud database

**All these issues are SOLVED by using Render instead!** ✅

---

## **RECOMMENDATION: STICK WITH RENDER**

Your current setup with **Render** is optimal:

✅ **Pros:**
- Full FastAPI support
- No execution time limits
- Built-in PostgreSQL
- Handles OCR beautifully
- No cold starts
- Background tasks work

✅ **Cost:**
- Starter plan: Free (limitations)
- Standard: $7/month (perfect for your use case)

---

**For your LegalGuard AI system, Render is the right choice!** 🚀

Deploy your backend with:
```bash
git push origin main
# Render auto-deploys in 5-10 minutes
```

