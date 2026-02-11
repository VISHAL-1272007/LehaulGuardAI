#!/usr/bin/env python3
"""
Minimal OCR Compliance Checker (No Streamlit) - For testing without full installation
"""

from PIL import Image
import pytesseract
from pathlib import Path

MANDATORY_KEYWORDS = {
    "MRP": "Maximum Retail Price",
    "Net Quantity": "Net Quantity / Weight",
    "Month and Year of Manufacture": "Manufacturing Date",
    "Customer Care": "Customer Care / Contact Information",
    "Country of Origin": "Country of Origin"
}

def check_compliance(image_path):
    """Check if product label complies with Legal Metrology requirements."""
    
    print(f"\n📋 Checking compliance for: {image_path}")
    print("=" * 60)
    
    try:
        # Load image
        image = Image.open(image_path)
        print(f"✅ Image loaded: {image.size[0]}x{image.size[1]} px")
        
        # Extract text
        print("🔄 Extracting text using OCR...")
        extracted_text = pytesseract.image_to_string(image)
        
        if not extracted_text.strip():
            print("❌ No text detected in image!")
            return
        
        print(f"✅ Extracted {len(extracted_text)} characters")
        print("\n" + "=" * 60)
        print("COMPLIANCE REPORT")
        print("=" * 60)
        
        # Check keywords
        text_lower = extracted_text.lower()
        found_count = 0
        
        for keyword, description in MANDATORY_KEYWORDS.items():
            is_found = keyword.lower() in text_lower
            found_count += is_found
            
            status = "✅ FOUND" if is_found else "❌ MISSING"
            print(f"{status:12} | {keyword:30} | {description}")
        
        print("=" * 60)
        compliance_pct = (found_count / len(MANDATORY_KEYWORDS)) * 100
        overall = "✅ COMPLIANT" if found_count == len(MANDATORY_KEYWORDS) else "⚠️  NON-COMPLIANT"
        
        print(f"RESULT: {overall}")
        print(f"Score: {found_count}/{len(MANDATORY_KEYWORDS)} ({compliance_pct:.0f}%)")
        print("=" * 60)
        
        # Show extracted text
        print("\nFULL EXTRACTED TEXT:")
        print("-" * 60)
        print(extracted_text[:500] + ("..." if len(extracted_text) > 500 else ""))
        print("-" * 60)
        
    except FileNotFoundError:
        print(f"❌ Image not found: {image_path}")
    except Exception as e:
        print(f"❌ Error: {e}\nMake sure Tesseract-OCR is installed!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python compliance_checker_minimal.py <image_path>")
        print("Example: python compliance_checker_minimal.py label.jpg")
        sys.exit(1)
    
    check_compliance(sys.argv[1])
