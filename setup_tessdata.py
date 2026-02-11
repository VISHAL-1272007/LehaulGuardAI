"""
Setup script for extracting and configuring Tesseract language data (tessdata)
This script helps set up Tamil language support for the OCR application.
"""

import os
import zipfile
import shutil
import sys

def setup_tessdata():
    """Extract and setup tessdata for Tamil language support"""
    
    # Paths
    project_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = r"d:\Admin\tessdata_best-main.zip"
    extract_path = project_dir
    
    print("=" * 60)
    print("TESSERACT LANGUAGE DATA SETUP")
    print("=" * 60)
    
    # Check if zip exists
    if not os.path.exists(zip_path):
        print(f"\n❌ Error: Tessdata zip file not found at: {zip_path}")
        print("\nAlternative solutions:")
        print("1. Download from: https://github.com/tesseract-ocr/tessdata_best")
        print("2. Place 'tam.traineddata' in your Tesseract tessdata folder")
        print("3. Or manually extract the zip to:", extract_path)
        return False
    
    print(f"\n✓ Found tessdata zip file: {zip_path}")
    print(f"  File size: {os.path.getsize(zip_path) / 1024 / 1024:.2f} MB")
    
    # Try to extract
    try:
        print(f"\n📦 Extracting to: {extract_path}")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Get list of files
            file_list = zip_ref.namelist()
            print(f"  Total files in archive: {len(file_list)}")
            
            # Extract all
            zip_ref.extractall(extract_path)
            
        print("✓ Extraction completed successfully!")
        
        # Look for Tamil language file
        for root, dirs, files in os.walk(extract_path):
            for file in files:
                if file == 'tam.traineddata':
                    tamil_path = os.path.join(root, file)
                    print(f"\n✓ Found Tamil language data: {tamil_path}")
                    
                    # Check the tessdata directory structure
                    parent_dir = os.path.basename(os.path.dirname(tamil_path))
                    print(f"  Parent directory: {parent_dir}")
                    
        print("\n" + "=" * 60)
        print("SETUP COMPLETE!")
        print("=" * 60)
        print("\n✓ Tamil language support is now configured")
        print("✓ You can now use the 'Enable Tamil Support' checkbox in the app")
        print("\nTo test: python app.py or streamlit run app.py")
        
        return True
        
    except zipfile.BadZipFile:
        print(f"\n❌ Error: {zip_path} is not a valid zip file or is corrupted")
        print("\nTroubleshooting:")
        print("1. Re-download the tessdata_best archive from GitHub")
        print("2. Check if the file downloaded completely")
        print("3. Try extracting manually with 7-Zip or WinRAR")
        return False
        
    except Exception as e:
        print(f"\n❌ Error during extraction: {e}")
        print(f"\nError type: {type(e).__name__}")
        return False

def check_tesseract():
    """Check if Tesseract is installed and accessible"""
    print("\n" + "=" * 60)
    print("CHECKING TESSERACT INSTALLATION")
    print("=" * 60)
    
    try:
        import pytesseract
        from PIL import Image
        
        # Try to get Tesseract version
        try:
            version = pytesseract.get_tesseract_version()
            print(f"\n✓ Tesseract is installed: v{version}")
        except:
            print("\n❌ Tesseract command not found")
            print("\nPlease install Tesseract OCR:")
            print("  Windows: https://github.com/UB-Mannheim/tesseract/wiki")
            print("  Or set the path in app.py:")
            print("    pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'")
            return False
            
        # Try to get available languages
        try:
            langs = pytesseract.get_languages()
            print(f"\n✓ Available languages: {', '.join(langs)}")
            
            if 'tam' in langs:
                print("  ✓ Tamil (tam) is available!")
            else:
                print("  ⚠ Tamil (tam) is NOT available yet")
                print("    Run this script to set it up")
                
        except Exception as e:
            print(f"\n⚠ Could not retrieve language list: {e}")
            
        return True
        
    except ImportError:
        print("\n❌ pytesseract module not installed")
        print("Run: pip install pytesseract")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting Tesseract Tamil Language Setup...\n")
    
    # First check if Tesseract is installed
    tesseract_ok = check_tesseract()
    
    # Then try to setup tessdata
    if tesseract_ok:
        success = setup_tessdata()
        
        if not success:
            print("\n" + "=" * 60)
            print("MANUAL SETUP INSTRUCTIONS")
            print("=" * 60)
            print("\nIf automatic setup failed, manually:")
            print("1. Extract 'd:\\Admin\\tessdata_best-main.zip'")
            print("2. Copy the extracted folder to: d:\\iot-group-project")
            print("3. Or copy 'tam.traineddata' to your Tesseract tessdata folder")
            print("4. Restart the Streamlit app")
    else:
        print("\n⚠ Please install Tesseract before setting up language data")
    
    print("\n")
