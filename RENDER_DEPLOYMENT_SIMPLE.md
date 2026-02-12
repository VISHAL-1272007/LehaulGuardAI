# 🚀 **RENDER DEPLOYMENT - STEP BY STEP GUIDE**

## **IMPORTANT: You Need to Deploy Backend First**

Your frontend is already deployed, but it needs a backend to work.

---

## **✅ DEPLOYMENT IN 5 MINUTES**

### **STEP 1: Go to Render Dashboard**

1. Open: https://dashboard.render.com/
2. **Sign up or Login** (use GitHub if you have it)
3. Click **"New +"** (top right)
4. Select **"Web Service"**

---

### **STEP 2: Connect Your GitHub Repository**

1. Click **"Connect a repository"**
2. Search: **LehaulGuardAI**
3. Click **"Connect"**
4. Authorize Render to access your GitHub

---

### **STEP 3: Configure the Web Service**

Fill in these settings:

```
Name:                      legalguard-ai-backend
Environment:               Python 3
Region:                    Oregon (or closest to you)
Branch:                    main
Root Directory:            backend
Runtime:                   Python 3.11
Build Command:             pip install -r requirements.txt
Start Command:             uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
```

---

### **STEP 4: Add Environment Variables**

Click **"Advanced"** and add these:

```
SECRET_KEY = (click "Generate" for random key)
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ENVIRONMENT = production
DEBUG = False
DATABASE_URL = sqlite:///./legal_metrology.db
```

---

### **STEP 5: Select Plan & Deploy**

1. **Plan:** Starter (Free option)
2. Click **"Create Web Service"**
3. **Wait 5-10 minutes for deployment...**

---

## 🔗 **GET YOUR BACKEND URL**

After deployment completes:

1. You'll see a URL like: `https://legalguard-ai-backend-xxxxx.onrender.com`
2. **Copy this URL**
3. You'll need it for the next step

---

## ✅ **TEST YOUR BACKEND**

1. Open your backend URL in browser
2. Add `/api/v1/health`
3. **Expected:** `{"status": "healthy", "service": "LegalGuard AI"}`

**Example:**
```
https://legalguard-ai-backend-xxxxx.onrender.com/api/v1/health
```

---

## ⚙️ **CONNECT FRONTEND TO BACKEND**

Once you have your backend URL:

### **Step A: Add to Vercel Environment**

1. Go to: https://vercel.com/dashboard
2. Click: `vishal-eight-nu` project
3. Go to: Settings → Environment Variables
4. **Add:**
   ```
   Name:  VITE_API_URL
   Value: https://your-backend-url.onrender.com/api/v1
   ```
5. Click: **Save**

### **Step B: Redeploy Frontend**

1. Go to: **Deployments** tab
2. Click latest deployment
3. Click: **Redeploy**
4. Wait 2-3 minutes

---

## 🔐 **UPDATE BACKEND CORS**

Edit `backend/main.py` (around line 60):

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://vishal-eight-nu.vercel.app",  # ← ADD YOUR VERCEL URL
]
```

Push to GitHub:
```bash
git add backend/main.py
git commit -m "Add Vercel CORS"
git push origin main
```

Render auto-redeploys! ✅

---

## 🧪 **FINAL TEST**

1. Open: https://vishal-eight-nu.vercel.app
2. Click **"Register"**
3. Create test account
4. Click **"Login"**
5. Should work! ✅

---

## 📊 **YOUR FINAL URLS**

```
Frontend:  https://vishal-eight-nu.vercel.app
Backend:   https://legalguard-ai-backend-xxxxx.onrender.com
Health:    https://legalguard-ai-backend-xxxxx.onrender.com/api/v1/health
```

---

## ⏱️ **TIMELINE**

| Step | Time |
|------|------|
| Connect GitHub | 1 min |
| Configure settings | 2 min |
| Deploy on Render | 5-10 min |
| Test backend health | 1 min |
| Update Vercel environment | 2 min |
| Redeploy frontend | 2-3 min |
| Update CORS & push | 2 min |
| **TOTAL** | **~20 min** |

---

## 🆘 **TROUBLESHOOTING**

### **Backend shows error after deploy?**

1. Go to Render dashboard
2. Click your service
3. Check **"Logs"** tab for errors
4. If dependencies failed: make sure `requirements.txt` is correct
5. Click **"Manual Deploy"** to retry

### **Frontend still shows 404?**

1. Make sure `VITE_API_URL` is set in Vercel
2. Make sure Vercel is redeployed (not just saved)
3. Hard refresh browser: **Ctrl + Shift + Del**
4. Check console (F12) for actual error message

### **CORS error?**

Backend CORS not updated with your Vercel URL:

```python
ALLOWED_ORIGINS = [
    "https://vishal-eight-nu.vercel.app",  # Must match exactly!
]
```

Push and wait for auto-redeploy.

---

## ✅ **QUICK SUMMARY**

1. ✅ Frontend deployed on Vercel
2. → Deploy backend on Render (THIS STEP)
3. → Set Render URL in Vercel environment
4. → Redeploy frontend
5. → Update CORS in backend
6. → Test together

**Do Steps 2-5 now and your app works!** 🚀

