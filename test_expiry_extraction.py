"""
Test script for expiry date extraction feature
"""

import re
from datetime import datetime, timedelta

def parse_date(date_string):
    """Parse a date string in various formats."""
    date_formats = [
        '%d/%m/%Y',
        '%d-%m-%Y',
        '%d.%m.%Y',
        '%d/%m/%y',
        '%d-%m-%y',
        '%d.%m.%y',
        '%m/%Y',
        '%m-%Y',
        '%m.%Y',
        '%Y-%m-%d',
        '%Y/%m/%d',
        '%d %b %Y',
        '%d %B %Y',
        '%b %Y',
        '%B %Y',
    ]
    
    for date_format in date_formats:
        try:
            parsed = datetime.strptime(date_string.strip(), date_format)
            if date_format in ['%m/%Y', '%m-%Y', '%m.%Y', '%b %Y', '%B %Y']:
                if parsed.month == 12:
                    last_day = datetime(parsed.year, 12, 31)
                else:
                    last_day = datetime(parsed.year, parsed.month + 1, 1) - timedelta(days=1)
                return last_day
            return parsed
        except ValueError:
            continue
    
    return None

# Test cases
test_texts = [
    "Product Label\nMRP: Rs. 100\nExpiry Date: 15/03/2025\nNet Wt: 500g",
    "Best Before: Dec 2024\nMfg Date: Jan 2023",
    "Exp: 31-12-2026\nBatch No: 12345",
    "Use By 01/06/2023\nLot: XYZ",
    "விலை: ₹50\nகாலாவதி: 28/02/2027",
    "Valid Until: March 2026\nMade in India",
]

print("=" * 70)
print("EXPIRY DATE EXTRACTION TEST")
print("=" * 70)

for i, text in enumerate(test_texts, 1):
    print(f"\n--- Test Case {i} ---")
    print(f"Text: {text[:50]}...")
    
    # Simple date extraction
    date_patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}[/-]\d{4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})',
        r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})',
    ]
    
    found = False
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_string = match.group(1)
            parsed = parse_date(date_string)
            if parsed:
                today = datetime.now()
                is_expired = parsed < today
                days = (parsed - today).days
                
                print(f"✓ Found: {date_string}")
                print(f"  Parsed: {parsed.strftime('%d %B %Y')}")
                print(f"  Status: {'EXPIRED' if is_expired else 'VALID'}")
                if is_expired:
                    print(f"  Expired: {abs(days)} days ago")
                else:
                    print(f"  Expires: in {days} days")
                found = True
                break
    
    if not found:
        print("✗ No date found")

print("\n" + "=" * 70)
print("Test completed!")
print("=" * 70)
