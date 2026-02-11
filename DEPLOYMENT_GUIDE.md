# 🚀 **DEPLOYMENT GUIDE - LegalGuard AI**

Complete guide to deploy your FastAPI backend to Render and GitHub.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

✅ All files organized:
- ✅ `backend/requirements.txt` - All dependencies listed
- ✅ `backend/Dockerfile` - Container configuration
- ✅ `backend/.dockerignore` - Optimized builds
- ✅ `backend/.gitignore` - Protects sensitive files
- ✅ `backend/.env.example` - Template for environment variables
- ✅ `render.yaml` - Render blueprint configuration

---

## 🔧 **STEP 1: PREPARE FOR GITHUB**

### **1.1 Initialize Git Repository**

```powershell
# Navigate to project root
cd d:\iot-group-project

# Initialize git (if not already done)
git init

# Add all files
git add .

# Review what will be committed (ensure .env is NOT listed)
git status

# Commit
git commit -m "Initial commit: LegalGuard AI with Smart Auditor, Mobile Scanner, and IoT integration"
```

### **1.2 Verify .env is Protected**

```powershell
# This should return NOTHING (empty)
git ls-files | Select-String "\.env$"

# If .env appears, run:
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
```

### **1.3 Create GitHub Repository**

1. Go to https://github.com/new
2. Repository name: `legalguard-ai` (or your choice)
3. Description: "AI-powered Legal Metrology compliance system with Smart Auditor, OCR, Mobile Scanner, and ESP32-S3 IoT integration"
4. **DO NOT** initialize with README (you already have one)
5. Click "Create repository"

### **1.4 Push to GitHub**

```powershell
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/legalguard-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## ☁️ **STEP 2: DEPLOY TO RENDER**

### **Option A: Deploy with Blueprint (Recommended)**

**Advantages:**
- Automatic database creation
- Pre-configured environment variables
- One-click deployment

**Steps:**

1. **Go to Render Dashboard**
   - Visit https://render.com/
   - Sign up or log in
   - Connect your GitHub account

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Select your `legalguard-ai` repository
   - Render will detect `render.yaml`
   - Click "Apply"

3. **Wait for Deployment**
   - Backend service: ~5-10 minutes
   - PostgreSQL database: ~2-3 minutes
   - You'll get a URL like: `https://legalguard-ai-backend.onrender.com`

4. **Set Additional Environment Variables** (Optional)
   - Go to Dashboard → legalguard-ai-backend → Environment
   - Add any custom variables from `.env.example`
   - Click "Save Changes"

5. **Test Deployment**
   ```
   https://YOUR-APP.onrender.com/docs
   ```
   You should see the FastAPI Swagger UI.

---

### **Option B: Manual Web Service Deployment**

If you prefer manual setup:

1. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect repository: `legalguard-ai`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Region: `Oregon` (or closest to you)
   - Branch: `main`
   - Build Command:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - Start Command:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
     ```

2. **Add Environment Variables**

   Click "Advanced" → "Add Environment Variable":

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | (Click "Generate" for secure random key) |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
   | `ENVIRONMENT` | `production` |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | (See database setup below) |
   | `TESSDATA_PREFIX` | `/usr/share/tesseract-ocr/4.00/tessdata` |

3. **Create PostgreSQL Database**
   - Dashboard → "New" → "PostgreSQL"
   - Name: `legalguard-postgres`
   - Region: Same as web service
   - Plan: `Starter` (free for 90 days)
   - Click "Create Database"

4. **Link Database to Web Service**
   - Copy the "Internal Database URL" from PostgreSQL dashboard
   - Go to Web Service → Environment
   - Update `DATABASE_URL` with the connection string
   - Format: `postgresql://user:password@host:port/database`

5. **Deploy**
   - Click "Create Web Service"
   - Wait ~10 minutes for first build

---

## 🗄️ **STEP 3: DATABASE SETUP**

### **Automatic Migration (On First Start)**

Your FastAPI app creates tables automatically:

```python
# This runs in main.py on startup
Base.metadata.create_all(bind=engine)
```

### **Create Admin User (Via API)**

Once deployed, create your first admin user:

```bash
curl -X POST "https://YOUR-APP.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legalguard.ai",
    "password": "ChangeThisPassword123!",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

**Or use the Swagger UI:**
1. Go to `https://YOUR-APP.onrender.com/docs`
2. POST `/api/v1/auth/register`
3. Fill in the request body
4. Click "Execute"

---

## 🧪 **STEP 4: TEST YOUR DEPLOYMENT**

### **4.1 Health Check**

```bash
curl https://YOUR-APP.onrender.com/api/v1/stats
```

Expected response:
```json
{
  "total_scans": 0,
  "compliant": 0,
  "non_compliant": 0,
  "pending_review": 0
}
```

### **4.2 Test Authentication**

```bash
# Register
curl -X POST "https://YOUR-APP.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","full_name":"Test User"}'

# Login
curl -X POST "https://YOUR-APP.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"Test123!"}'
```

### **4.3 Test OCR Scan**

1. Go to `https://YOUR-APP.onrender.com/docs`
2. Click `/api/v1/smart-scan` → "Try it out"
3. Upload a product label image
4. Click "Execute"
5. Check the response for OCR results

---

## 🔗 **STEP 5: CONNECT FRONTEND**

Update your React frontend to use the Render backend URL.

### **5.1 Update Frontend API URL**

Edit `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://YOUR-APP.onrender.com/api/v1'
    : 'http://localhost:8000/api/v1'
  );
```

### **5.2 Create Frontend .env**

Create `frontend/.env.production`:

```env
VITE_API_URL=https://YOUR-APP.onrender.com/api/v1
```

### **5.3 Deploy Frontend**

**Option 1: Vercel (Recommended for React)**

```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**

```bash
cd frontend
npm run build
# Drag and drop 'dist' folder to netlify.com
```

**Option 3: Render Static Site**

```yaml
# Add to render.yaml
- type: web
  name: legalguard-frontend
  env: static
  buildCommand: npm install && npm run build
  staticPublishPath: ./dist
  routes:
    - type: rewrite
      source: /*
      destination: /index.html
```

---

## 🔐 **SECURITY BEST PRACTICES**

### **✅ DO:**

1. **Use Strong Secret Keys**
   ```python
   # Generate with:
   import secrets
   print(secrets.token_hex(32))
   ```

2. **Enable HTTPS Only**
   - Render provides free SSL
   - Set `ENVIRONMENT=production`

3. **Limit CORS Origins**
   ```python
   origins = [
       "https://your-frontend.vercel.app",
       "https://your-frontend.netlify.app"
   ]
   ```

4. **Use PostgreSQL in Production**
   - SQLite is for development only
   - PostgreSQL handles concurrent users better

5. **Set DEBUG=False**
   - Never run production with DEBUG=True
   - Prevents sensitive error leaks

### **❌ DON'T:**

1. ❌ Commit `.env` file to Git
2. ❌ Use default SECRET_KEY in production
3. ❌ Allow CORS from `*` (all origins)
4. ❌ Expose database credentials in code
5. ❌ Skip database backups

---

## 📊 **MONITORING & LOGS**

### **View Logs in Render**

1. Dashboard → Service → "Logs" tab
2. Real-time log streaming
3. Filter by severity (INFO, ERROR, WARNING)

### **Set Up Error Alerts**

1. Dashboard → Service → "Settings"
2. Notifications → "Add Notification"
3. Choose: Slack, Discord, Email, or Webhook
4. Configure alert conditions (e.g., deploy failures, service crashes)

### **Database Backups**

Render automatically backs up PostgreSQL:
- Starter plan: Daily backups (7-day retention)
- Standard plan: Daily backups (30-day retention)
- Manual backup: Dashboard → Database → "Backups" → "Create Backup"

---

## 🐛 **TROUBLESHOOTING**

### **Problem: Deployment Failed**

**Solution:**
1. Check logs in Render dashboard
2. Common issues:
   - Missing dependency in `requirements.txt`
   - Syntax error in Python code
   - Wrong build/start command

```bash
# Test locally first:
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### **Problem: Database Connection Error**

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check PostgreSQL is running in Render dashboard
3. Ensure connection string format:
   ```
   postgresql://user:pass@host:port/db
   ```

### **Problem: Tesseract Not Found**

**Solution:**
Dockerfile installs Tesseract automatically. If error persists:

1. Check `TESSDATA_PREFIX` environment variable
2. Verify Dockerfile includes:
   ```dockerfile
   RUN apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-tam
   ```

### **Problem: 502 Bad Gateway**

**Solution:**
1. Service is still starting (wait ~2 minutes)
2. Check Health Check path matches your route
3. Verify port binding: `--port $PORT`

### **Problem: CORS Error in Frontend**

**Solution:**
1. Check backend CORS settings in `main.py`:
   ```python
   origins = [
       "http://localhost:3000",
       "https://your-frontend.vercel.app"
   ]
   app.add_middleware(CORSMiddleware, allow_origins=origins, ...)
   ```

2. Update with your actual frontend URL

---

## 🎯 **PRODUCTION CHECKLIST**

Before going live, verify:

- [ ] `.env` file is gitignored (not in GitHub)
- [ ] Strong SECRET_KEY generated (not default)
- [ ] DEBUG=False in production
- [ ] PostgreSQL database configured (not SQLite)
- [ ] CORS limited to your frontend domains
- [ ] HTTPS enabled (automatic on Render)
- [ ] Database backups enabled
- [ ] Error monitoring/alerts configured
- [ ] Admin user created
- [ ] API endpoints tested with real data
- [ ] Frontend connected to production backend
- [ ] Health check endpoint responding
- [ ] Documentation updated with production URLs

---

## 📚 **USEFUL RENDER COMMANDS**

```bash
# View logs (requires Render CLI)
render logs <service-name>

# Restart service
render restart <service-name>

# Execute command in service
render shell <service-name>

# List all services
render services list
```

**Install Render CLI:**
```bash
npm install -g @renderinc/cli
render login
```

---

## 🆘 **SUPPORT & RESOURCES**

- **Render Docs**: https://render.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **PostgreSQL on Render**: https://render.com/docs/databases
- **Render Community**: https://community.render.com/

---

## 🎉 **SUCCESS!**

Your LegalGuard AI system is now live! 🚀

**Next Steps:**
1. Monitor logs for first 24 hours
2. Test all features in production
3. Set up custom domain (optional)
4. Configure backups and monitoring
5. Share with stakeholders

**Production URLs:**
- Backend API: `https://YOUR-APP.onrender.com`
- API Docs: `https://YOUR-APP.onrender.com/docs`
- Frontend: `https://YOUR-FRONTEND.vercel.app` (or your deployment)

**Default Credentials:**
- Email: (your registered admin email)
- Password: (secure password you set)

---

**🔒 Remember: Keep your `.env` file secure and never commit it to Git!**

