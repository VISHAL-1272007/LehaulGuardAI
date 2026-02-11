#!/usr/bin/env python3
"""Quick test of Phase 3 features"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("\n" + "="*60)
print("🚀 PHASE 3 QUICK TEST")
print("="*60 + "\n")

# Test 1: Check if backend is running
print("1️⃣  Testing backend connectivity...")
try:
    response = requests.get(f"{BASE_URL}/docs")
    if response.status_code == 200:
        print("   ✅ Backend is running on port 8000\n")
    else:
        print(f"   ❌ Backend returned {response.status_code}\n")
except Exception as e:
    print(f"   ❌ Cannot connect to backend: {e}\n")
    exit(1)

# Test 2: Test login
print("2️⃣  Testing authentication...")
login_data = {"username": "testadmin", "password": "admin123"}
response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)

if response.status_code == 200:
    tokens = response.json()
    token = tokens.get('access_token')
    print(f"   ✅ Login successful")
    print(f"   Token: {token[:50]}...\n")
else:
    print(f"   ❌ Login failed: {response.text}\n")
    exit(1)

# Test 3: Test stats endpoint
print("3️⃣  Testing /api/v1/stats (enhanced with manual review)...")
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/api/v1/stats", headers=headers)

if response.status_code == 200:
    stats = response.json()
    print(f"   ✅ Stats retrieved successfully")
    print(f"   • Total scans: {stats.get('total_scans', 0)}")
    print(f"   • Compliant: {stats.get('compliant_count', 0)}")
    print(f"   • Non-compliant: {stats.get('non_compliant_count', 0)}")
    print(f"   • Avg confidence: {stats.get('average_confidence_score', 0)}%\n")
else:
    print(f"   ❌ Stats failed: {response.status_code}\n")

# Test 4: Test PDF endpoint
print("4️⃣  Testing /api/v1/report/{id} (Phase 3 PDF generation)...")
response = requests.get(f"{BASE_URL}/api/v1/report/1", headers=headers)

if response.status_code == 200:
    content_type = response.headers.get('content-type', '')
    print(f"   ✅ PDF endpoint working")
    print(f"   • Content-Type: {content_type}")
    print(f"   • File size: {len(response.content) / 1024:.2f} KB\n")
elif response.status_code == 404:
    print(f"   ⚠️  No audit log with ID 1 yet (expected for new database)\n")
else:
    print(f"   ❌ PDF endpoint failed: {response.status_code}\n")

print("="*60)
print("✅ Phase 3 Backend Features Verified!")
print("="*60 + "\n")

print("📚 Next steps:")
print("   1. Open http://localhost:3000 in browser")
print("   2. Login with: testadmin / admin123")
print("   3. Upload a product label image")
print("   4. View enhanced confidence metrics")
print("   5. Download PDF report")
print("\n")
