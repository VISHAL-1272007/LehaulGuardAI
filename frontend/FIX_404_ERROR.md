# 🔧 **FRONTEND 404 ERROR - TROUBLESHOOTING & FIX**

## ❌ **What's Wrong**

Your frontend deployed to Vercel is getting `404: Request failed with status code 404`

**Root Cause:** The frontend is looking for the backend API, but can't find it.

```
Frontend at:  https://vishal-eight-nu.vercel.app ✅ (Working)
Backend at:   ??? (Missing/Not configured)
```

---

## ✅ **SOLUTION - 3 STEPS**

### **Step 1: Deploy Backend to Render (If Not Done)**

**Option A: Render Blueprint (AUTOMATIC)**

```bash
1. Go to: https://render.com/dashboard
2. Click "New" → "Blueprint"
3. Select: LehaulGuardAI repository
4. Click "Deploy"
5. Wait 5-10 minutes

Your backend URL will be:
https://your-app-name.onrender.com
```

**Option B: Manual Render Deployment**

```bash
1. Go to: https://render.com/
2. Click "New Web Service"
3. Connect GitHub repository
4. Configure:
   - Name: legalguard-ai-backend
   - Environment: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
5. Deploy

Your backend URL will be:
https://legalguard-ai-backend.onrender.com
```

**Check if Backend is Running:**
```bash
Open in browser:
https://your-backend.onrender.com/api/v1/health

You should see:
{
  "status": "healthy",
  "service": "LegalGuard AI"
}
```

---

### **Step 2: Set Backend URL in Vercel**

Once you have your backend URL:

1. **Go to Vercel Dashboard:**
   https://vercel.com/dashboard

2. **Select Your Project:**
   `vishal-eight-nu` (or your frontend project)

3. **Go to Settings → Environment Variables**

4. **Add New Variable:**
   ```
   Name:  VITE_API_URL
   Value: https://your-backend.onrender.com/api/v1
   ```

5. **Click Save**

6. **Redeploy Frontend:**
   - Go to **Deployments**
   - Click the latest deployment
   - Click **Redeploy**

---

### **Step 3: Update Backend CORS**

Add your Vercel frontend URL to backend CORS:

**Edit `backend/main.py`:**

```python
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://vishal-eight-nu.vercel.app",  # ← ADD YOUR VERCEL URL HERE
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then push to GitHub:
```bash
git add backend/main.py
git commit -m "Add Vercel frontend URL to CORS"
git push origin main
```

---

## 🧪 **TEST YOUR SETUP**

### **Step 1: Backend Health Check**

```bash
curl https://your-backend.onrender.com/api/v1/health
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "LegalGuard AI",
  "version": "1.0.0"
}
```

### **Step 2: Frontend Health Check**

1. Open https://vishal-eight-nu.vercel.app
2. Open DevTools (F12 → Console)
3. Look for: `🔌 API Base URL: https://your-backend.onrender.com/api/v1`
4. No errors? ✅

### **Step 3: Test Login**

1. Click "Register"
2. Create account:
   ```
   Email: test@test.com
   Password: Test123!
   Full Name: Test User
   ```
3. Should see: **"Registration successful"** ✅

---

## 📊 **QUICK CHECKLIST**

- [ ] Backend deployed on Render
- [ ] Get backend URL: `https://your-app.onrender.com`
- [ ] Verify health endpoint works
- [ ] Set `VITE_API_URL` in Vercel environment
- [ ] Redeploy frontend
- [ ] Backend CORS includes Vercel URL
- [ ] Test: Open Vercel URL, check console logs
- [ ] Test: Try login/register

---

## 🚀 **DEPLOYMENT URLS**

After fix:

| Component | URL |
|-----------|-----|
| **Frontend** | https://vishal-eight-nu.vercel.app |
| **Backend** | https://your-app.onrender.com |
| **Backend Health** | https://your-app.onrender.com/api/v1/health |
| **API Docs** | https://your-app.onrender.com/docs |

---

## 🆘 **STILL GETTING 404?**

### **Problem: Backend Not Running**

**Solution:**
```bash
1. Go to Render dashboard
2. Check if your service shows "Deployed"
3. Check logs for errors
4. Make sure render.yaml exists
5. Redeploy: Click "Manual Deploy"
```

### **Problem: Environment Variable Not Set**

**Solution:**
```bash
1. Go to Vercel project dashboard
2. Settings → Environment Variables
3. Add: VITE_API_URL = https://your-backend.onrender.com/api/v1
4. Redeploy frontend
```

### **Problem: CORS Error (Different Error Though)**

**Solution:**
```python
# backend/main.py
origins = [
    "https://vishal-eight-nu.vercel.app",  # Add your Vercel URL
]
```

### **Problem: Still seeing `/api/v1`**

**Solution:**
```bash
1. Rebuild locally: npm run build
2. Push changes: git push
3. Redeploy on Vercel
4. Clear browser cache (Ctrl+Shift+Del)
5. Hard refresh (Ctrl+F5)
```

---

## 📝 **FILES UPDATED**

- ✅ `frontend/src/services/api.js` - Smart API URL detection
- ✅ `frontend/.env.production` - Production environment template

---

## 🎯 **BOTTOM LINE**

Your frontend needs a working backend to connect to.

**What you need:**

1. ✅ Backend URL (from Render deployment)
2. ✅ Add it to Vercel environment variable
3. ✅ Backend URL in CORS settings
4. ✅ Redeploy frontend

**Then:** Login and register should work! ✅

---

**👉 Do you have a backend running on Render?**
- If YES: Just set the environment variable in Vercel
- If NO: Deploy to Render first (5-10 minutes)

