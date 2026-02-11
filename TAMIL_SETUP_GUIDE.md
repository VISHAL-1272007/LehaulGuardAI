# Tamil Language Support Setup Guide

## Overview
This guide will help you set up Tamil (தமிழ்) language support for the Product Label OCR Compliance Checker.

## Prerequisites

### 1. Install Tesseract OCR

**Windows:**
1. Download Tesseract installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer (tesseract-ocr-w64-setup-v5.x.x.exe)
3. **IMPORTANT:** During installation, select "Additional language data" and check **Tamil**
4. Default installation path: `C:\Program Files\Tesseract-OCR\`

**Verify Installation:**
```powershell
tesseract --version
tesseract --list-langs
```

If Tamil (tam) is listed, you're good to go!

## Setup Methods

### Method 1: Install Tamil During Tesseract Installation (Easiest)
- When installing Tesseract, select "Additional language data (download)" option
- Check the box for **Tamil** language
- The installer will download and install `tam.traineddata` automatically

### Method 2: Manual Tamil Language Data Installation

#### Option A: Using tessdata_best (Highest Accuracy)

1. **Extract the tessdata_best-main.zip file:**
   ```powershell
   # Navigate to project directory
   cd d:\iot-group-project
   
   # Extract the zip using Windows Explorer or:
   Expand-Archive -Path "d:\Admin\tessdata_best-main.zip" -DestinationPath "d:\iot-group-project"
   ```

2. **If extraction fails (corrupted zip):**
   - Re-download from: https://github.com/tesseract-ocr/tessdata_best
   - Click "Code" → "Download ZIP"
   - Extract using 7-Zip or WinRAR if Windows extraction fails

3. **Copy Tamil language data:**
   ```powershell
   # Find tam.traineddata in the extracted folder
   # Copy it to Tesseract's tessdata folder
   Copy-Item "tessdata_best-main\tam.traineddata" -Destination "C:\Program Files\Tesseract-OCR\tessdata\"
   ```

#### Option B: Download Individual Tamil File

1. Visit: https://github.com/tesseract-ocr/tessdata_best/blob/main/tam.traineddata
2. Click "Download" button
3. Copy `tam.traineddata` to: `C:\Program Files\Tesseract-OCR\tessdata\`

### Method 3: Use Custom Tessdata in Project

1. **Create tessdata folder in project:**
   ```powershell
   mkdir d:\iot-group-project\tessdata
   ```

2. **Download and place tam.traineddata:**
   ```powershell
   # Download from GitHub
   curl -L "https://github.com/tesseract-ocr/tessdata_best/raw/main/tam.traineddata" -o "d:\iot-group-project\tessdata\tam.traineddata"
   
   # Also need English data
   curl -L "https://github.com/tesseract-ocr/tessdata_best/raw/main/eng.traineddata" -o "d:\iot-group-project\tessdata\eng.traineddata"
   ```

3. **The app will automatically detect this folder** (already configured in app.py)

## Configuration

### If Tesseract is Not in PATH

Edit `app.py` and uncomment/set these lines (around line 20):

```python
# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
os.environ['TESSDATA_PREFIX'] = r'C:\Program Files\Tesseract-OCR\tessdata'
```

### If Using Custom Tessdata Location

```python
os.environ['TESSDATA_PREFIX'] = r'd:\iot-group-project\tessdata'
```

## Verification

### Test Tesseract with Tamil

1. **Check available languages:**
   ```powershell
   tesseract --list-langs
   ```
   
   You should see:
   ```
   List of available languages (2):
   eng
   tam
   ```

2. **Test OCR with a Tamil image:**
   ```powershell
   tesseract test_image.jpg output -l eng+tam
   ```

3. **Run the Python setup script:**
   ```powershell
   python setup_tessdata.py
   ```

## Troubleshooting

### Issue: Zip file is corrupted
**Solution:** 
- Re-download from GitHub
- Use 7-Zip or WinRAR to extract
- Or download individual `tam.traineddata` file directly

### Issue: "Tesseract command not found"
**Solution:**
- Add Tesseract to PATH: `C:\Program Files\Tesseract-OCR\`
- Or set path in app.py (see Configuration above)

### Issue: "Tamil language not available despite installation"
**Solution:**
- Check if `tam.traineddata` exists in `C:\Program Files\Tesseract-OCR\tessdata\`
- Verify TESSDATA_PREFIX environment variable
- Restart the application

### Issue: Tamil characters show as boxes (□□□)
**Solution:**
- Your terminal/editor may not support Tamil Unicode
- The app uses UTF-8 encoding and should display Tamil correctly in Streamlit
- Try viewing in a browser (when running Streamlit app)

## Using the App

Once setup is complete:

1. **Start the application:**
   ```powershell
   streamlit run app.py
   ```

2. **Enable Tamil Support:**
   - In the sidebar, check "Enable Tamil Support (தமிழ்)"
   - Upload a bilingual label image
   - The app will search for both English and Tamil keywords

3. **Tamil Keywords Supported:**
   - விலை (Price/MRP)
   - எடை (Weight/Net Quantity)
   - தயாரிப்பு தேதி (Manufacturing Date)
   - வாடிக்கையாளர் சேவை (Customer Care)
   - தயாரிப்பு நாடு (Country of Origin)

## Quick Fix for Your Current Zip File Issue

Since `tessdata_best-main.zip` appears corrupted:

```powershell
# Option 1: Try extracting with 7-Zip (install from https://www.7-zip.org/)
& "C:\Program Files\7-Zip\7z.exe" x "d:\Admin\tessdata_best-main.zip" -o"d:\iot-group-project"

# Option 2: Download just the Tamil file
New-Item -Path "d:\iot-group-project\tessdata" -ItemType Directory -Force
Invoke-WebRequest -Uri "https://github.com/tesseract-ocr/tessdata_best/raw/main/tam.traineddata" -OutFile "d:\iot-group-project\tessdata\tam.traineddata"
Invoke-WebRequest -Uri "https://github.com/tesseract-ocr/tessdata_best/raw/main/eng.traineddata" -OutFile "d:\iot-group-project\tessdata\eng.traineddata"
```

## Resources

- **Tesseract OCR:** https://github.com/tesseract-ocr/tesseract
- **Language Data:** https://github.com/tesseract-ocr/tessdata_best
- **Tamil Unicode:** https://unicode.org/charts/PDF/U0B80.pdf
- **Pytesseract:** https://pypi.org/project/pytesseract/

## Support

If you continue to have issues, ensure:
- ✅ Tesseract is installed
- ✅ Tamil language data (`tam.traineddata`) is in tessdata folder
- ✅ Tesseract path is configured if not in system PATH
- ✅ App is restarted after configuration changes
