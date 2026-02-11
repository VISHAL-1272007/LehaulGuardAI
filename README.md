# Product Label OCR Compliance Checker

A Streamlit web application that performs Optical Character Recognition (OCR) on product label images to verify compliance with Legal Metrology requirements.

## Features

✅ **Image Upload & Preview** - Upload product label images in JPG, PNG, or JPEG format
✅ **OCR Text Extraction** - Extract text from images using Pytesseract
✅ **Legal Metrology Compliance Check** - Validates presence of 5 mandatory keywords:
  - MRP (Maximum Retail Price)
  - Net Quantity
  - Month and Year of Manufacture
  - Customer Care Information
  - Country of Origin

✅ **Visual Compliance Report** - Color-coded alerts with expandable details
✅ **PDF Report Export** - Download compliance results as a professional PDF
✅ **Detailed Analysis** - View extracted text snippets and full OCR output

## Prerequisites

- Python 3.8 or higher
- **Tesseract-OCR** (system-level installation required)
- pip (Python package manager)

## Installation

### Step 1: Install Tesseract-OCR (Windows)

1. Download the Windows installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Download: `tesseract-ocr-w64-setup-v5.x.x.exe` (latest version)
3. Run the installer and choose the default installation path: `C:\Program Files\Tesseract-OCR`
4. Complete the installation

### Step 2: Clone/Set up the Project

```bash
cd d:\iot-group-project
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Tesseract Path (if needed)

If Tesseract is installed in a non-standard location, you can set the path in your environment:

**Windows (PowerShell):**
```powershell
$env:TESSDATA_PREFIX="C:\Program Files\Tesseract-OCR\tessdata"
```

**Windows (Command Prompt):**
```cmd
set TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
```

Or add this to the beginning of `app.py`:
```python
import pytesseract
pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Usage

### Running the Application

```bash
streamlit run app.py
```

The application will start in your default web browser at `http://localhost:8501`

### Using the App

1. **Upload an Image**
   - Click on "📷 Upload Product Label Image"
   - Select a JPG, PNG, or JPEG image of a product label
   
2. **Automatic Processing**
   - The app automatically extracts text using OCR
   - Text is checked against mandatory keywords
   - Compliance results are displayed instantly

3. **Review Results**
   - **Overall Status**: Shows COMPLIANT (✅) or NON-COMPLIANT (❌)
   - **Compliance Score**: Percentage of mandatory keywords found
   - **Detailed Analysis**: Expandable sections for each keyword showing:
     - Status (Found ✅ or Missing ❌)
     - Text snippet where keyword was found
     - Description of the requirement

4. **View Extracted Text**
   - Click "📄 View Full Extracted Text" to see all text extracted by OCR
   - Useful for debugging or manual verification

5. **Download Report**
   - Click "📥 Download Compliance Report (PDF)" to save results
   - PDF includes summary, detailed analysis, and full extracted text

## Requirements

See `requirements.txt` for all dependencies:

- **streamlit** - Web application framework
- **pillow** - Image processing
- **pytesseract** - Python wrapper for Tesseract OCR
- **opencv-python** - Computer vision library
- **reportlab** - PDF generation
- **python-dotenv** - Environment variable management

## Project Structure

```
d:\iot-group-project\
├── app.py                 # Main Streamlit application
├── requirements.txt       # Python dependencies
└── README.md             # Documentation (this file)
```

## How It Works

### 1. Image Processing
- Upload image is loaded and displayed for preview
- Image dimensions and format are shown

### 2. OCR Extraction
- Pytesseract processes the image
- Text is extracted using Tesseract-OCR engine
- Handles various image qualities and angles

### 3. Compliance Checking
- Extracted text is searched for 5 mandatory keywords
- Search is case-insensitive
- For each keyword found, a text snippet is captured

### 4. Report Generation
- Compliance status is calculated (all keywords = compliant)
- Three metrics displayed:
  - **Overall Status**: COMPLIANT or NON-COMPLIANT
  - **Keywords Found**: Count out of total (e.g., 4/5)
  - **Compliance Score**: Percentage (e.g., 80%)
- Expandable detail sections allow investigation of each keyword
- PDF report can be generated with full details

## Troubleshooting

### Error: "No module named 'pytesseract'"
```bash
pip install pytesseract
```

### Error: "tesseract is not installed" or "TesseractNotFoundError"
- Tesseract-OCR is not installed system-wide
- Download and install from: https://github.com/UB-Mannheim/tesseract/wiki
- Verify installation: `where tesseract` (Windows) or `which tesseract` (Mac/Linux)

### Poor OCR Results
- Ensure image is clear and well-lit
- Use high-resolution images (minimum 300 DPI recommended)
- Avoid blurry or tilted label images
- Crop image to show only the label area

### PDF Download Not Working
- Check browser popup blockers
- Ensure reportlab is installed: `pip install reportlab`

## Tips for Best Results

✏️ **Image Quality**
- Use clear, well-lit photos
- Avoid shadows and glare
- Ensure label text is readable to human eye
- Use minimum 300 DPI resolution when possible

✏️ **Label Coverage**
- Capture entire product label in frame
- Include all text sections
- Avoid partial text at image edges

✏️ **Image Orientation**
- Label should be upright and straight
- Avoid tilted or rotated images
- Consistent text orientation improves OCR accuracy

## Performance Notes

- OCR processing time varies based on image size and complexity
- Typical processing: 2-5 seconds per image
- PDF generation: < 1 second
- Works offline - no cloud API calls required

## License

This project is provided as-is for compliance checking purposes.

## Support

For issues with:
- **Tesseract Installation**: Visit https://github.com/UB-Mannheim/tesseract/wiki
- **Streamlit Help**: Visit https://docs.streamlit.io
- **Pytesseract Issues**: Visit https://github.com/madmaze/pytesseract

---

**Version:** 1.0.0
**Last Updated:** February 2026
