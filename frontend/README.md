# LegalGuard AI - Enterprise Frontend

🚀 **Mission-Critical Enterprise Dashboard** built with React.js, Tailwind CSS, and Framer Motion.

## 🎨 Features

### ✨ Visual Architecture
- **Glassmorphism Design System** with backdrop-blur and transparency effects
- **Dynamic Theming** - Dark/Light mode support with smooth transitions
- **High-end Typography** - Inter font family for industrial tech feel
- **Cyber Grid Background** with animated orbs and gradients

### 🧭 Core Components
- **Responsive Sidebar** with Lucide React icons
- **Real-time Dashboard** with KPI cards and analytics
- **AI Scanner** with drag-and-drop image uploader
- **Batch Audit** for multiple image processing
- **Compliance Logs** with filtering and search
- **User Management** (RBAC support)
- **Settings Panel** for configuration

### 🔥 Advanced Features
- **Drag & Drop** image upload with React Dropzone
- **Cyber-Grid Loading Animation** during scans
- **Side-by-Side Comparison** - Original image vs Results
- **Data Visualization** with Recharts (Line, Bar, Pie charts)
- **JWT Authentication** with Axios interceptors
- **React Query** for efficient data fetching and caching
- **Framer Motion** animations throughout

## 📦 Tech Stack

- **React 18.3** - UI framework
- **Vite 5.1** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS
- **Framer Motion 11** - Animation library
- **React Router 6** - Client-side routing
- **TanStack Query 5** - Data fetching
- **Axios** - HTTP client with interceptors
- **React Dropzone** - File upload
- **Recharts 2** - Chart library
- **Lucide React** - Icon library

## 🚀 Quick Start

### Install Dependencies

```powershell
cd frontend
npm install
```

### Start Development Server

```powershell
npm run dev
```

The app will open at **http://localhost:3000**

> **Note:** Make sure the FastAPI backend is running on port 8000!

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Scanner.jsx
│   │   ├── BatchAudit.jsx
│   │   ├── ComplianceLogs.jsx
│   │   ├── UserManagement.jsx
│   │   └── Settings.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── lib/             # Utility functions
│   │   └── utils.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Usage

### 1. Login / Register

Navigate to the login page and create an account with one of three roles:
- **Client** - Can scan images
- **Auditor** - Can scan and view logs/stats
- **Admin** - Full access including user management

### 2. Single Image Scan

1. Go to **Scanner** page
2. Drag & drop or click to upload an image
3. Toggle Tamil support if needed
4. Click **"Scan for Compliance"**
5. View results with:
   - Compliance status (✓ Compliant / ✗ Non-Compliant)
   - Confidence score with progress bar
   - Found/Missing keywords
   - Image quality metrics
   - Extracted OCR text

### 3. Batch Processing

1. Go to **Batch Audit** page
2. Upload multiple images (max 50)
3. Enable Tamil support if needed
4. Click **"Process Batch"**
5. View summary and individual results

### 4. View Analytics

- **Dashboard** shows:
  - KPI cards (Total Scans, Compliant, Non-Compliant, Rate)
  - Weekly trend line chart
  - Compliance distribution pie chart
  - Recent scans table

### 5. Audit Logs

- View all scan history
- Search by filename
- Filter by compliance status
- Export to CSV (Admin only)
- Delete logs (Admin only)

## 🔐 Authentication

The app uses **JWT tokens** stored in localStorage:

```javascript
// Login
const response = await authAPI.login({ username, password });
// Token automatically stored

// Authenticated requests
// Axios interceptor adds: Authorization: Bearer <token>

// Logout
authAPI.logout();
```

## 🎨 Theme Customization

Toggle between light and dark modes using the header button.

Custom colors in `tailwind.config.js`:
- Primary: Blue scale (#0ea5e9)
- Accent: Purple scale (#d946ef)
- Glassmorphism utilities: `.glass`, `.glass-dark`

## 📊 API Integration

All API calls are in `src/services/api.js`:

```javascript
// Scan image
const result = await scanAPI.scanImage(file, tamilSupport);

// Batch scan
const results = await scanAPI.batchScan(files, tamilSupport);

// Get audit logs
const logs = await auditAPI.getAuditLogs({ limit: 100 });

// Get statistics
const stats = await auditAPI.getStatistics();
```

## 🧪 Build for Production

```powershell
npm run build
```

Output folder: `dist/`

Preview production build:
```powershell
npm run preview
```

## 🔧 Configuration

### Vite Proxy (Development)

API requests are proxied to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=LegalGuard AI
```

## 🎭 Animation Examples

### Glassmorphism Card
```jsx
<div className="glass glass-dark rounded-xl p-6 border border-white/10">
  Content
</div>
```

### Animated Button
```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Click Me
</motion.button>
```

### Gradient Text
```jsx
<h1 className="gradient-text">LegalGuard AI</h1>
```

## 📱 Responsive Design

- **Desktop**: Full sidebar + content area
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation (planned)

## 🐛 Troubleshooting

**CORS Error:**
- Ensure backend is running on port 8000
- Check CORS middleware in backend

**Images not uploading:**
- Max file size: 10MB
- Supported formats: PNG, JPG, JPEG, WEBP

**Authentication issues:**
- Clear localStorage and re-login
- Check JWT token expiry (30 min default)

## 📄 License

© 2026 LegalGuard AI. Enterprise-grade compliance platform.

---

**Need help?** Check the backend API documentation at `http://localhost:8000/docs`
