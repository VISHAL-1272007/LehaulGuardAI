"""
API Testing Script for Legal Metrology AI Backend
Demonstrates all endpoints with example usage
"""

import requests
import json
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
API_VERSION = "v1"

class LegalMetrologyClient:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.token = None
        
    def register(self, username, email, password, role="Client"):
        """Register a new user"""
        url = f"{self.base_url}/api/{API_VERSION}/auth/register"
        data = {
            "username": username,
            "email": email,
            "password": password,
            "role": role
        }
        
        response = requests.post(url, json=data)
        
        if response.status_code == 200:
            result = response.json()
            self.token = result['access_token']
            print(f"✅ Registered successfully!")
            print(f"   Token: {self.token[:50]}...")
            return result
        else:
            print(f"❌ Registration failed: {response.json().get('detail')}")
            return None
    
    def login(self, username, password):
        """Login and get access token"""
        url = f"{self.base_url}/api/{API_VERSION}/auth/login"
        data = {
            "username": username,
            "password": password
        }
        
        response = requests.post(url, json=data)
        
        if response.status_code == 200:
            result = response.json()
            self.token = result['access_token']
            print(f"✅ Login successful!")
            print(f"   Token: {self.token[:50]}...")
            return result
        else:
            print(f"❌ Login failed: {response.json().get('detail')}")
            return None
    
    def scan_image(self, image_path, tamil_support=False):
        """Scan a single image"""
        if not self.token:
            print("❌ Not authenticated. Please login first.")
            return None
        
        url = f"{self.base_url}/api/{API_VERSION}/scan"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        with open(image_path, 'rb') as f:
            files = {'file': (Path(image_path).name, f, 'image/jpeg')}
            data = {'tamil_support': tamil_support}
            
            response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Scan completed for {Path(image_path).name}")
            print(f"   Status: {result['compliance_status']}")
            print(f"   Confidence: {result['confidence_score']}%")
            print(f"   Found: {len(result['found_keywords'])} keywords")
            print(f"   Missing: {result['missing_keywords']}")
            print(f"   Quality: {result['image_quality']['quality']}")
            print(f"   Processing: {result['processing_time_ms']:.2f}ms")
            return result
        else:
            print(f"❌ Scan failed: {response.json().get('detail')}")
            return None
    
    def batch_scan(self, image_paths, tamil_support=False):
        """Scan multiple images"""
        if not self.token:
            print("❌ Not authenticated. Please login first.")
            return None
        
        url = f"{self.base_url}/api/{API_VERSION}/batch-scan"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        files = []
        for path in image_paths:
            files.append(('files', (Path(path).name, open(path, 'rb'), 'image/jpeg')))
        
        data = {'tamil_support': tamil_support}
        
        response = requests.post(url, headers=headers, files=files, data=data)
        
        # Close file handles
        for _, (_, f, _) in files:
            f.close()
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Batch scan completed")
            print(f"   Total: {result['total_images']} images")
            print(f"   Compliant: {result['compliant_count']}")
            print(f"   Non-Compliant: {result['non_compliant_count']}")
            print(f"   Processing: {result['processing_time_ms']:.2f}ms")
            return result
        else:
            print(f"❌ Batch scan failed: {response.json().get('detail')}")
            return None
    
    def get_audit_logs(self, limit=10):
        """Get audit logs (Admin/Auditor only)"""
        if not self.token:
            print("❌ Not authenticated. Please login first.")
            return None
        
        url = f"{self.base_url}/api/{API_VERSION}/audit-logs?limit={limit}"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Retrieved {result['total']} audit logs")
            for log in result['logs'][:3]:  # Show first 3
                print(f"   - {log['filename']}: {log['compliance_status']} ({log['confidence_score']}%)")
            return result
        else:
            print(f"❌ Failed to get logs: {response.json().get('detail')}")
            return None
    
    def get_statistics(self):
        """Get compliance statistics (Admin/Auditor only)"""
        if not self.token:
            print("❌ Not authenticated. Please login first.")
            return None
        
        url = f"{self.base_url}/api/{API_VERSION}/stats"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n📊 Statistics")
            print(f"   Total Scans: {result['total_scans']}")
            print(f"   Compliant: {result['compliant_count']}")
            print(f"   Non-Compliant: {result['non_compliant_count']}")
            print(f"   Compliance Rate: {result['compliance_rate']}%")
            print(f"   Avg Confidence: {result['average_confidence_score']}%")
            return result
        else:
            print(f"❌ Failed to get stats: {response.json().get('detail')}")
            return None


def test_complete_workflow():
    """Test the complete API workflow"""
    print("=" * 70)
    print("LEGAL METROLOGY AI - API TEST")
    print("=" * 70)
    
    # Initialize client
    client = LegalMetrologyClient()
    
    # Test 1: Register a new user
    print("\n[TEST 1] User Registration")
    print("-" * 70)
    client.register(
        username="testadmin",
        email="admin@test.com",
        password="admin123",
        role="Admin"
    )
    
    # Test 2: Login (if registration fails, try login)
    if not client.token:
        print("\n[TEST 2] User Login")
        print("-" * 70)
        client.login("testadmin", "admin123")
    
    # Test 3: Scan single image (if you have test images)
    # print("\n[TEST 3] Single Image Scan")
    # print("-" * 70)
    # client.scan_image("test_label.jpg")
    
    # Test 4: Get statistics
    print("\n[TEST 4] Get Statistics")
    print("-" * 70)
    client.get_statistics()
    
    # Test 5: Get audit logs
    print("\n[TEST 5] Get Audit Logs")
    print("-" * 70)
    client.get_audit_logs(limit=5)
    
    print("\n" + "=" * 70)
    print("✅ API Testing Complete!")
    print("=" * 70)


def example_usage():
    """Example of how to use the client"""
    
    # Create client
    client = LegalMetrologyClient()
    
    # Login
    client.login("testadmin", "admin123")
    
    # Scan an image
    # result = client.scan_image("product_label.jpg", tamil_support=False)
    
    # Batch scan
    # results = client.batch_scan([
    #     "label1.jpg",
    #     "label2.jpg",
    #     "label3.jpg"
    # ])
    
    # Get statistics
    stats = client.get_statistics()
    
    # Get logs
    logs = client.get_audit_logs(limit=10)


if __name__ == "__main__":
    # Run the complete test workflow
    test_complete_workflow()
    
    # Or use individual methods
    # example_usage()
