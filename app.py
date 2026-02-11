import streamlit as st
from PIL import Image
import pytesseract
import io
import os
import re
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import cv2
import numpy as np

# Configure Streamlit page
st.set_page_config(
    page_title="Product Label OCR Compliance Checker",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Configure Tesseract (optional custom paths)
# Uncomment and set these if Tesseract is not in your system PATH:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# os.environ['TESSDATA_PREFIX'] = r'C:\Program Files\Tesseract-OCR\tessdata'

# Or use a custom tessdata directory in your project:
if os.path.exists(os.path.join(os.getcwd(), 'tessdata_best-main')):
    os.environ['TESSDATA_PREFIX'] = os.path.join(os.getcwd(), 'tessdata_best-main')
elif os.path.exists(os.path.join(os.getcwd(), 'tessdata')):
    os.environ['TESSDATA_PREFIX'] = os.path.join(os.getcwd(), 'tessdata')

# Define mandatory keywords for Legal Metrology compliance
# Each field has multiple synonyms/keywords to improve detection accuracy
# Includes Tamil (தமிழ்) equivalents for bilingual label support
MANDATORY_KEYWORDS = {
    "MRP": {
        "description": "Maximum Retail Price",
        "keywords": ["MRP", "Maximum Retail Price", "Max Retail Price", "M.R.P", "M.R.P.", "Retail Price", "விலை", "அதிகபட்ச விலை"]
    },
    "Net Quantity": {
        "description": "Net Quantity / Weight",
        "keywords": ["Net Quantity", "Net Qty", "Net Wt", "Net Weight", "Net Wt.", "Net Content", "Nett Qty", "Weight", "Quantity", "எடை", "நிகர அளவு", "நிகர எடை"]
    },
    "Month and Year of Manufacture": {
        "description": "Manufacturing Date",
        "keywords": ["Month and Year of Manufacture", "Mfg Date", "Mfg.", "Manufacturing Date", "Manufactured", "Date of Manufacture", "MFD", "Manuf. Date", "தயாரிப்பு தேதி", "உற்பத்தி தேதி"]
    },
    "Customer Care": {
        "description": "Customer Care / Contact Information",
        "keywords": ["Customer Care", "Customer Service", "Consumer Care", "Contact", "Helpline", "Contact Us", "Customer Support", "Call Us", "வாடிக்கையாளர் சேவை", "தொடர்பு"]
    },
    "Country of Origin": {
        "description": "Country of Origin",
        "keywords": ["Country of Origin", "Made in", "Manufactured in", "Product of", "Origin", "Imported by", "Mfg. Country", "தயாரிப்பு நாடு", "உற்பத்தி நாடு"]
    }
}


def preprocess_image(image):
    """
    Pre-process image using OpenCV to improve OCR accuracy.
    Converts to grayscale and applies adaptive thresholding for low-light images.
    
    Args:
        image (PIL.Image): The input image
        
    Returns:
        PIL.Image: Pre-processed image
    """
    # Convert PIL Image to numpy array
    img_array = np.array(image)
    
    # Convert to grayscale
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_array
    
    # Apply adaptive thresholding to handle low-light conditions
    # This creates a binary image with better contrast
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Optional: Apply denoising to reduce noise
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    # Convert back to PIL Image
    processed_image = Image.fromarray(denoised)
    
    return processed_image


def check_image_blur(image, threshold=100.0):
    """
    Check if an image is blurry using Laplacian variance.
    A low variance indicates a blurry image.
    
    Args:
        image (PIL.Image): The input image
        threshold (float): Variance threshold below which image is considered blurry (default: 100.0)
        
    Returns:
        dict: {
            'variance': float,
            'is_blurry': bool,
            'quality': str ('Excellent', 'Good', 'Fair', 'Poor', 'Very Poor')
        }
    """
    # Convert PIL Image to numpy array
    img_array = np.array(image)
    
    # Convert to grayscale if needed
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_array
    
    # Calculate Laplacian variance
    # The Laplacian operator highlights regions of rapid intensity change
    # A blurry image will have low variance
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = laplacian.var()
    
    # Determine if image is blurry
    is_blurry = variance < threshold
    
    # Categorize image quality
    if variance >= 500:
        quality = 'Excellent'
    elif variance >= 200:
        quality = 'Good'
    elif variance >= 100:
        quality = 'Fair'
    elif variance >= 50:
        quality = 'Poor'
    else:
        quality = 'Very Poor'
    
    return {
        'variance': variance,
        'is_blurry': is_blurry,
        'quality': quality
    }


def extract_text_from_image(image, lang_config='eng'):
    """
    Extract text from an image using Pytesseract OCR.
    Applies pre-processing with OpenCV for improved accuracy.
    
    Args:
        image (PIL.Image): The image to extract text from
        lang_config (str): Tesseract language configuration (e.g., 'eng', 'eng+tam')
        
    Returns:
        str: Extracted text from the image (preserves Unicode for Tamil script)
    """
    try:
        # Pre-process the image for better OCR accuracy
        processed_image = preprocess_image(image)
        
        # Extract text using Tesseract with specified language configuration
        # The config parameter enables multi-language support including Tamil (தமிழ்)
        extracted_text = pytesseract.image_to_string(processed_image, lang=lang_config)
        return extracted_text
    except Exception as e:
        st.error(f"❌ OCR Error: {str(e)}\n\nMake sure Tesseract-OCR is installed with the required language packs.")
        return None


def check_compliance(extracted_text):
    """
    Check if extracted text contains all mandatory keywords.
    Searches for multiple synonyms/keywords for each field.
    Performs case-insensitive search.
    
    Args:
        extracted_text (str): The text extracted from image
        
    Returns:
        dict: Compliance results for each keyword
    """
    results = {}
    
    if not extracted_text:
        return {field: {"found": False, "snippet": "", "matched_keyword": ""} for field in MANDATORY_KEYWORDS}
    
    # Convert text to lowercase for case-insensitive search
    text_lower = extracted_text.lower()
    
    for field, field_data in MANDATORY_KEYWORDS.items():
        description = field_data["description"]
        keywords = field_data["keywords"]
        
        is_found = False
        snippet = ""
        matched_keyword = ""
        
        # Search for any of the synonyms/keywords
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in text_lower:
                is_found = True
                matched_keyword = keyword
                
                # Find snippet of text containing the matched keyword
                idx = text_lower.find(keyword_lower)
                start = max(0, idx - 20)
                end = min(len(extracted_text), idx + len(keyword) + 20)
                snippet = extracted_text[start:end].strip()
                break  # Stop after finding the first match
        
        results[field] = {
            "found": is_found,
            "description": description,
            "matched_keyword": matched_keyword,
            "snippet": snippet
        }
    
    return results


def get_compliance_status(results):
    """
    Determine overall compliance status.
    
    Args:
        results (dict): Compliance check results
        
    Returns:
        tuple: (is_compliant: bool, missing_count: int)
    """
    missing = sum(1 for r in results.values() if not r["found"])
    return missing == 0, missing


def extract_expiry_date(text):
    """
    Extract expiry date from text using regex patterns.
    Looks for dates following keywords like 'Expiry', 'Exp', 'Best Before', 'Use By', 'MFD', etc.
    
    Args:
        text (str): The extracted text to search
        
    Returns:
        dict: {
            'found': bool,
            'date_string': str,
            'parsed_date': datetime or None,
            'is_expired': bool,
            'days_until_expiry': int or None,
            'context': str
        }
    """
    if not text:
        return {
            'found': False,
            'date_string': '',
            'parsed_date': None,
            'is_expired': False,
            'days_until_expiry': None,
            'context': ''
        }
    
    # Keywords that typically precede expiry dates
    expiry_keywords = [
        r'expiry\s*date?',
        r'exp\.?\s*date?',
        r'best\s*before',
        r'use\s*by',
        r'valid\s*until',
        r'expires?',
        r'காலாவதி'  # Tamil for expiry
    ]
    
    # Date patterns to match various formats
    date_patterns = [
        # DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
        r'(\d{1,2}[/-.]\d{1,2}[/-.]\d{2,4})',
        # MM/YYYY, MM-YYYY, MM.YYYY
        r'(\d{1,2}[/-.]\d{4})',
        # Month YYYY (e.g., Jan 2026, January 2026)
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})',
        # YYYY-MM-DD (ISO format)
        r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
        # DD Month YYYY (e.g., 15 Jan 2026)
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})',
    ]
    
    text_lower = text.lower()
    
    # Search for expiry dates
    for keyword_pattern in expiry_keywords:
        keyword_matches = re.finditer(keyword_pattern, text_lower, re.IGNORECASE)
        
        for keyword_match in keyword_matches:
            keyword_pos = keyword_match.end()
            # Look for a date within 50 characters after the keyword
            search_region = text[keyword_pos:keyword_pos + 50]
            
            for date_pattern in date_patterns:
                date_match = re.search(date_pattern, search_region, re.IGNORECASE)
                
                if date_match:
                    date_string = date_match.group(1)
                    parsed_date = parse_date(date_string)
                    
                    if parsed_date:
                        # Calculate expiry status
                        today = datetime.now()
                        is_expired = parsed_date < today
                        days_until_expiry = (parsed_date - today).days
                        
                        # Get context
                        context_start = max(0, keyword_match.start() - 10)
                        context_end = min(len(text), keyword_pos + date_match.end() + 10)
                        context = text[context_start:context_end].strip()
                        
                        return {
                            'found': True,
                            'date_string': date_string,
                            'parsed_date': parsed_date,
                            'is_expired': is_expired,
                            'days_until_expiry': days_until_expiry,
                            'context': context
                        }
    
    # If no expiry date found, return default
    return {
        'found': False,
        'date_string': '',
        'parsed_date': None,
        'is_expired': False,
        'days_until_expiry': None,
        'context': ''
    }


def parse_date(date_string):
    """
    Parse a date string in various formats.
    
    Args:
        date_string (str): The date string to parse
        
    Returns:
        datetime: Parsed datetime object, or None if parsing fails
    """
    # List of date formats to try
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
            # If only month/year is provided, set to last day of that month
            if date_format in ['%m/%Y', '%m-%Y', '%m.%Y', '%b %Y', '%B %Y']:
                # Get last day of the month
                if parsed.month == 12:
                    last_day = datetime(parsed.year, 12, 31)
                else:
                    last_day = datetime(parsed.year, parsed.month + 1, 1) - timedelta(days=1)
                return last_day
            return parsed
        except ValueError:
            continue
    
    return None


def generate_pdf_report(compliance_results, extracted_text, filename="compliance_report.pdf"):
    """
    Generate a PDF report of the compliance check.
    
    Args:
        compliance_results (dict): Results from compliance check
        extracted_text (str): Full extracted text from image
        filename (str): Output filename
        
    Returns:
        bytes: PDF file content
    """
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1f77b4'),
        spaceAfter=12,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=10,
        spaceBefore=10
    )
    
    # Title
    story.append(Paragraph("Product Label Compliance Report", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Report metadata
    metadata = f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    story.append(Paragraph(metadata, styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Compliance summary
    is_compliant, missing_count = get_compliance_status(compliance_results)
    status = "✓ COMPLIANT" if is_compliant else f"✗ NON-COMPLIANT ({missing_count} keyword(s) missing)"
    status_color = colors.HexColor('#28a745') if is_compliant else colors.HexColor('#dc3545')
    
    summary_style = ParagraphStyle(
        'Summary',
        parent=styles['Normal'],
        fontSize=12,
        textColor=status_color,
        alignment=1
    )
    story.append(Paragraph(f"<b>Status: {status}</b>", summary_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Compliance details table
    story.append(Paragraph("Compliance Check Details", heading_style))
    
    table_data = [["Keyword", "Description", "Status", "Found Text"]]
    for keyword, result in compliance_results.items():
        status_text = "✓ Found" if result["found"] else "✗ Missing"
        snippet_text = result["snippet"][:50] + "..." if len(result["snippet"]) > 50 else result["snippet"]
        table_data.append([
            keyword,
            result["description"],
            status_text,
            snippet_text
        ])
    
    table = Table(table_data, colWidths=[1.5*inch, 1.5*inch, 1*inch, 2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f77b4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
    ]))
    story.append(table)
    story.append(Spacer(1, 0.3*inch))
    
    # Extracted text section
    story.append(PageBreak())
    story.append(Paragraph("Extracted Text", heading_style))
    story.append(Paragraph(extracted_text.replace('\n', '<br/>'), styles['Normal']))
    
    # Build PDF
    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()


# Main app layout
st.title("📋 Product Label OCR Compliance Checker")

st.markdown("""
This application helps verify if product labels comply with **Legal Metrology** requirements 
by checking for the presence of mandatory keywords:
- **MRP** (Maximum Retail Price)
- **Net Quantity**
- **Month and Year of Manufacture**
- **Customer Care** Information
- **Country of Origin**
""")

st.divider()

# Initialize session state for KPI tracking
if 'total_scans' not in st.session_state:
    st.session_state.total_scans = 0
if 'compliant_count' not in st.session_state:
    st.session_state.compliant_count = 0
if 'non_compliant_count' not in st.session_state:
    st.session_state.non_compliant_count = 0

# KPI Cards Section
st.subheader("📊 Session Statistics")

kpi1, kpi2, kpi3 = st.columns(3)

with kpi1:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 20px; 
                border-radius: 10px; 
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="color: white; margin: 0; font-size: 1.2em;">📊 Total Scans</h3>
        <h1 style="color: white; margin: 10px 0; font-size: 3em;">{}</h1>
    </div>
    """.format(st.session_state.total_scans), unsafe_allow_html=True)

with kpi2:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); 
                padding: 20px; 
                border-radius: 10px; 
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="color: #1a472a; margin: 0; font-size: 1.2em;">✅ Compliant</h3>
        <h1 style="color: #1a472a; margin: 10px 0; font-size: 3em;">{}</h1>
    </div>
    """.format(st.session_state.compliant_count), unsafe_allow_html=True)

with kpi3:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); 
                padding: 20px; 
                border-radius: 10px; 
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="color: #8b0000; margin: 0; font-size: 1.2em;">⚠️ Non-Compliant</h3>
        <h1 style="color: #8b0000; margin: 10px 0; font-size: 3em;">{}</h1>
    </div>
    """.format(st.session_state.non_compliant_count), unsafe_allow_html=True)

st.divider()

# Sidebar
with st.sidebar:
    st.header("ℹ️ Instructions")
    st.markdown("""
    1. **Upload** a product label image (JPG, PNG, JPEG)
    2. The app will automatically **extract text** using OCR
    3. Check against mandatory **compliance keywords**
    4. Review the **compliance report** with visual alerts
    5. **Download** the PDF report if needed
    
    **Tip:** Ensure the image is clear and has good lighting for best OCR results.
    """)
    
    st.divider()
    
    # Session Controls
    st.header("🎯 Session Controls")
    if st.button("🔄 Reset Statistics", use_container_width=True):
        st.session_state.total_scans = 0
        st.session_state.compliant_count = 0
        st.session_state.non_compliant_count = 0
        st.rerun()
    
    # Display compliance rate if scans exist
    if st.session_state.total_scans > 0:
        compliance_rate = (st.session_state.compliant_count / st.session_state.total_scans) * 100
        st.metric("Compliance Rate", f"{compliance_rate:.1f}%")
    
    st.divider()
    
    # Language Support Section
    st.header("🌐 Language Settings")
    enable_tamil = st.checkbox(
        "Enable Tamil Support (தமிழ்)",
        value=False,
        help="Enable Tamil language OCR for bilingual labels. Requires Tesseract Tamil language pack."
    )
    
    if enable_tamil:
        st.success("Tamil OCR enabled")
        st.info("Will search for both English and Tamil keywords")
    else:
        st.info("English-only OCR")
        
    # Tessdata configuration section
    with st.expander("⚙️ Advanced: Custom Tessdata Path"):
        st.markdown("""
        If you have a custom tessdata folder (e.g., `tessdata_best-main`):
        1. Extract it to this project folder: `d:\\iot-group-project`
        2. The app will automatically detect it
        
        **Or** set these in app.py:
        ```python
        pytesseract.pytesseract.tesseract_cmd = r'C:\\path\\to\\tesseract.exe'
        os.environ['TESSDATA_PREFIX'] = r'C:\\path\\to\\tessdata'
        ```
        
        **Download Tamil data:**
        - Get `tam.traineddata` from: https://github.com/tesseract-ocr/tessdata_best
        - Place it in your tessdata folder
        """)

# File upload
col1, col2 = st.columns([2, 1])

with col1:
    uploaded_file = st.file_uploader(
        "📷 Upload Product Label Image",
        type=["jpg", "jpeg", "png"],
        help="Upload a clear image of the product label"
    )

with col2:
    st.info("Supported formats: JPG, PNG, JPEG")

# Processing logic
if uploaded_file is not None:
    # Load and display image
    image = Image.open(uploaded_file)
    
    st.subheader("Image Preview")
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.image(image, use_column_width=True, caption="Uploaded Label Image")
    
    with col2:
        st.info(f"Image size: {image.size[0]}x{image.size[1]} px\nFormat: {image.format}")
    
    st.divider()
    
    # Check image quality for blur
    st.subheader("🔍 Image Quality Check")
    
    with st.spinner("Analyzing image sharpness..."):
        blur_info = check_image_blur(image, threshold=100.0)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Laplacian Variance", f"{blur_info['variance']:.2f}")
    
    with col2:
        quality_color = {
            'Excellent': '🟢',
            'Good': '🟢', 
            'Fair': '🟡',
            'Poor': '🟠',
            'Very Poor': '🔴'
        }
        st.metric("Image Quality", f"{quality_color.get(blur_info['quality'], '⚪')} {blur_info['quality']}")
    
    with col3:
        if blur_info['is_blurry']:
            st.metric("Sharpness", "⚠️ Blurry")
        else:
            st.metric("Sharpness", "✅ Sharp")
    
    # Show warning if image is too blurry
    if blur_info['is_blurry']:
        st.error("⚠️ **Image too blurry for accurate compliance check**")
        st.warning("""
        The image appears to be out of focus or low quality. This may result in:
        - Incomplete text extraction
        - Missed keywords
        - Inaccurate compliance results
        
        **Recommendations:**
        - Use a camera with autofocus
        - Ensure good lighting
        - Hold the camera steady
        - Increase image resolution
        - Re-capture the image with better focus
        """)
    elif blur_info['quality'] in ['Fair', 'Poor']:
        st.warning(f"⚠️ Image quality is {blur_info['quality'].lower()}. OCR accuracy may be reduced.")
    else:
        st.success(f"✅ Image quality is {blur_info['quality'].lower()}. Proceeding with OCR...")
    
    st.divider()
    
    # Extract text with processing indicator
    st.subheader("Processing Label...")
    
    # Determine language configuration based on Tamil support toggle
    lang_config = 'eng+tam' if enable_tamil else 'eng'
    
    with st.spinner("🔄 Extracting text using OCR..."):
        extracted_text = extract_text_from_image(image, lang_config=lang_config)
        
        # Show language detection info
        if enable_tamil and extracted_text:
            tamil_chars = sum(1 for char in extracted_text if '\u0B80' <= char <= '\u0BFF')
            if tamil_chars > 0:
                st.info(f"✅ Detected {tamil_chars} Tamil characters in extracted text")
            else:
                st.warning("⚠️ No Tamil characters detected. Ensure Tamil traineddata is installed.")
    
    if extracted_text:
        st.success("✅ Text extraction completed!")
        
        # Check compliance
        with st.spinner("🔍 Checking compliance..."):
            compliance_results = check_compliance(extracted_text)
            is_compliant, missing_count = get_compliance_status(compliance_results)
        
        # Update session state KPIs
        st.session_state.total_scans += 1
        if is_compliant:
            st.session_state.compliant_count += 1
        else:
            st.session_state.non_compliant_count += 1
        
        # Extract and check expiry date
        expiry_info = extract_expiry_date(extracted_text)
        
        st.divider()
        
        # Display compliance report
        st.subheader("📊 Compliance Report")
        
        # Overall status with expiry warning
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if is_compliant:
                st.metric(
                    "Overall Status",
                    "✅ COMPLIANT",
                    delta="All mandatory keywords found"
                )
            else:
                st.metric(
                    "Overall Status",
                    "⚠️ NON-COMPLIANT",
                    delta=f"{missing_count} keyword(s) missing"
                )
        
        with col2:
            keywords_found = sum(1 for r in compliance_results.values() if r["found"])
            total_keywords = len(compliance_results)
            st.metric("Keywords Found", f"{keywords_found}/{total_keywords}")
        
        with col3:
            compliance_percentage = (keywords_found / total_keywords) * 100
            st.metric("Compliance Score", f"{compliance_percentage:.0f}%")
        
        st.divider()
        
        # Expiry Date Check Section
        st.subheader("📅 Expiry Date Analysis")
        
        if expiry_info['found']:
            col1, col2 = st.columns(2)
            
            with col1:
                if expiry_info['is_expired']:
                    st.error(f"🔴 **EXPIRED PRODUCT**")
                    st.markdown(f"**Expiry Date:** :red[{expiry_info['date_string']}]")
                    st.markdown(f"**Status:** :red[Expired {abs(expiry_info['days_until_expiry'])} days ago]")
                elif expiry_info['days_until_expiry'] <= 30:
                    st.warning(f"⚠️ **EXPIRING SOON**")
                    st.markdown(f"**Expiry Date:** {expiry_info['date_string']}")
                    st.markdown(f"**Status:** Expires in {expiry_info['days_until_expiry']} days")
                else:
                    st.success(f"✅ **VALID PRODUCT**")
                    st.markdown(f"**Expiry Date:** {expiry_info['date_string']}")
                    st.markdown(f"**Status:** Expires in {expiry_info['days_until_expiry']} days")
            
            with col2:
                st.info(f"**Found in text:**\n{expiry_info['context']}")
                st.caption(f"Parsed as: {expiry_info['parsed_date'].strftime('%d %B %Y')}")
        else:
            st.warning("⚠️ No expiry date found in the label")
            st.info("Looked for keywords: Expiry, Exp, Best Before, Use By, MFD")
        
        st.divider()
        
        # Detailed keyword checks with expandable sections
        st.subheader("🔍 Detailed Keyword Analysis")
        
        col1, col2 = st.columns(2)
        
        for i, (field, field_data) in enumerate(MANDATORY_KEYWORDS.items()):
            result = compliance_results[field]
            col = col1 if i % 2 == 0 else col2
            
            with col:
                with st.expander(
                    f"{'✅' if result['found'] else '❌'} {field}",
                    expanded=result['found'] is False
                ):
                    st.write(f"**Description:** {result['description']}")
                    
                    if result['found']:
                        st.success(f"✅ Found in label (matched: '{result['matched_keyword']}')")
                        with st.expander("View extracted text snippet"):
                            st.code(result['snippet'], language="text")
                    else:
                        st.error("❌ Not found in label")
                        st.info(f"Looking for: {', '.join(field_data['keywords'])}")
                        st.warning("This is a mandatory field and must be present on the label.")
        
        st.divider()
        
        # Raw OCR text output (preserves Unicode for Tamil script)
        with st.expander("📄 View Full Extracted Text"):
            # Using st.text_area with key parameter ensures Unicode characters (Tamil) are displayed correctly
            st.text_area(
                "Raw OCR Output (Tamil script supported: தமிழ்)",
                extracted_text,
                height=300,
                disabled=True,
                key="extracted_text_display"
            )
        
        st.divider()
        
        # PDF Report download
        st.subheader("📥 Download Report")
        
        pdf_data = generate_pdf_report(compliance_results, extracted_text)
        
        st.download_button(
            label="📥 Download Compliance Report (PDF)",
            data=pdf_data,
            file_name=f"compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            mime="application/pdf",
            use_container_width=True
        )
    
    else:
        st.error("Failed to extract text from the image. Please ensure Tesseract-OCR is installed.")

else:
    st.info("👈 Please upload an image to get started!")
    st.markdown("""
    ### How this works:
    1. **Upload** a clear image of a product label
    2. **OCR Engine** extracts text using Pytesseract
    3. **Compliance Checker** searches for 5 mandatory keywords
    4. **Report** shows which keywords are present (Green ✅) or missing (Red ❌)
    5. **Export** results as a PDF report
    """)
