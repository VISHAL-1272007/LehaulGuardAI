"""
Phase 3: PDF Report Generation for Legal Metrology AI
Advanced enterprise-grade PDF audit reports with compliance data
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, 
    Image, PageBreak, KeepTogether
)
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from datetime import datetime
from io import BytesIO
import base64

class AuditReportGenerator:
    """Generate professional PDF audit reports for compliance scans"""
    
    def __init__(self, title="Legal Metrology Compliance Audit Report"):
        self.title = title
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the report"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0ea5e9'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CompliancePass',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#10b981'),
            fontSize=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='ComplianceFail',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#ef4444'),
            fontSize=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#64748b'),
            alignment=TA_CENTER,
            spaceAfter=12
        ))
    
    def generate_report(self, scan_result, image_base64=None, filename="audit_report.pdf"):
        """
        Generate a complete PDF audit report
        
        Args:
            scan_result: Dictionary with scan results from API
            image_base64: Base64 encoded image of the product label
            filename: Output PDF filename
        
        Returns:
            BytesIO object with PDF content
        """
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
        story = []
        
        # ================== HEADER ==================
        story.append(Paragraph(self.title, self.styles['CustomTitle']))
        story.append(Paragraph(
            f"Report Generated: {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}",
            self.styles['Subtitle']
        ))
        story.append(Spacer(1, 0.3 * inch))
        
        # ================== COMPLIANCE STATUS ==================
        status_color = colors.HexColor('#10b981') if scan_result['compliance_status'] == 'COMPLIANT' else colors.HexColor('#ef4444')
        status_style = self.styles['CompliancePass'] if scan_result['compliance_status'] == 'COMPLIANT' else self.styles['ComplianceFail']
        
        status_data = [
            ['COMPLIANCE STATUS', scan_result['compliance_status']],
            ['CONFIDENCE SCORE', f"{scan_result['confidence_score']:.1f}%"],
            ['SCAN TIMESTAMP', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ]
        
        status_table = Table(status_data, colWidths=[2.5*inch, 2.5*inch])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#f0fdf4') if scan_result['compliance_status'] == 'COMPLIANT' else colors.HexColor('#fef2f2')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
            ('TEXTCOLOR', (1, 0), (1, -1), status_color),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ]))
        
        story.append(status_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # ================== PRODUCT IMAGE ==================
        if image_base64:
            story.append(Paragraph("Scanned Product Label", self.styles['Heading2']))
            try:
                # Decode base64 image
                image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
                image_file = BytesIO(image_data)
                image = Image(image_file, width=3*inch, height=2*inch)
                story.append(image)
                story.append(Spacer(1, 0.2 * inch))
            except Exception as e:
                story.append(Paragraph(f"Error displaying image: {str(e)}", self.styles['Normal']))
        
        # ================== EXTRACTED TEXT ==================
        story.append(Paragraph("Extracted Text (OCR)", self.styles['Heading2']))
        extracted_text = scan_result.get('extracted_text', 'No text extracted')[:500]  # Limit to 500 chars
        story.append(Paragraph(extracted_text.replace('\n', '<br/>'), self.styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
        
        # ================== COMPLIANCE DETAILS ==================
        story.append(Paragraph("Compliance Details", self.styles['Heading2']))
        
        # Found Keywords
        found_keywords = scan_result.get('found_keywords', [])
        missing_keywords = scan_result.get('missing_keywords', [])
        
        if found_keywords:
            found_text = ', '.join([f"✓ {kw}" for kw in found_keywords])
            story.append(Paragraph(f"<b>Found Keywords:</b> {found_text}", 
                                 ParagraphStyle('Found', parent=self.styles['Normal'], textColor=colors.HexColor('#10b981'))))
        
        if missing_keywords:
            missing_text = ', '.join([f"✗ {kw}" for kw in missing_keywords])
            story.append(Paragraph(f"<b>Missing Keywords:</b> {missing_text}", 
                                 ParagraphStyle('Missing', parent=self.styles['Normal'], textColor=colors.HexColor('#ef4444'))))
        
        story.append(Spacer(1, 0.2 * inch))
        
        # ================== IMAGE QUALITY ==================
        story.append(Paragraph("Image Quality Analysis", self.styles['Heading2']))
        
        image_quality = scan_result.get('image_quality', {})
        quality_data = [
            ['Quality Level', image_quality.get('quality', 'Unknown')],
            ['Variance Score', f"{image_quality.get('variance', 0):.2f}"],
            ['Blur Status', 'Blurry ⚠️' if image_quality.get('is_blurry') else 'Clear ✓'],
        ]
        
        quality_table = Table(quality_data, colWidths=[2.5*inch, 2.5*inch])
        quality_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ]))
        
        story.append(quality_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # ================== FOOTER ==================
        footer_text = f"""
        <b>Report Disclaimer:</b> This report is generated automatically by the Legal Metrology AI system. 
        For critical compliance decisions, manual verification is recommended. Confidence scores below 70% 
        should be manually reviewed by an authorized auditor.
        <br/><br/>
        <b>Processing Time:</b> {scan_result.get('processing_time_ms', 0):.0f}ms
        <br/>
        Generated by: Legal Metrology AI v1.0
        """
        story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=self.styles['Normal'], fontSize=9, textColor=colors.HexColor('#94a3b8'))))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer
    
    def save_report(self, scan_result, output_path, image_base64=None):
        """Save PDF report to file"""
        pdf_buffer = self.generate_report(scan_result, image_base64)
        with open(output_path, 'wb') as f:
            f.write(pdf_buffer.getvalue())
        return output_path


# ==================== ENHANCED CONFIDENCE SCORING ====================

def calculate_advanced_confidence_score(compliance_results, image_quality, tesseract_confidence=85.0):
    """
    Advanced confidence score calculation with manual review flag
    
    Phase 3 Feature: Enhanced scoring with multiple factors
    
    Factors:
    - Compliance match rate (40%)
    - Image quality (30%)
    - Tesseract OCR confidence (20%)
    - Keyword completeness (10%)
    
    Returns:
    {
        'confidence_score': float (0-100),
        'requires_manual_review': bool,
        'risk_level': str ('LOW', 'MEDIUM', 'HIGH'),
        'factors': dict with breakdown
    }
    """
    
    # Calculate individual factors
    found_count = len(compliance_results.get('found_keywords', []))
    total_keywords = 5  # Total mandatory keywords
    compliance_rate = (found_count / total_keywords) * 100
    
    # Image quality score (0-100)
    variance = image_quality.get('variance', 0)
    if variance >= 500:
        quality_score = 100
    elif variance >= 200:
        quality_score = 85
    elif variance >= 100:
        quality_score = 70
    elif variance >= 50:
        quality_score = 50
    else:
        quality_score = 30
    
    # Reduce quality score if blurry
    if image_quality.get('is_blurry', False):
        quality_score = max(0, quality_score - 20)
    
    # Calculate weighted score
    confidence = (
        (compliance_rate * 0.40) +
        (quality_score * 0.30) +
        (tesseract_confidence * 0.20) +
        ((found_count / total_keywords) * 100 * 0.10)  # Keyword completeness
    )
    
    confidence = min(100, max(0, confidence))  # Clamp between 0-100
    
    # Determine risk level and manual review flag
    requires_manual_review = False
    if confidence < 70:
        risk_level = 'HIGH'
        requires_manual_review = True
    elif confidence < 85:
        risk_level = 'MEDIUM'
        requires_manual_review = True
    else:
        risk_level = 'LOW'
    
    # Also flag for manual review if image is very blurry
    if image_quality.get('variance', 0) < 50:
        requires_manual_review = True
        if risk_level == 'LOW':
            risk_level = 'MEDIUM'
    
    return {
        'confidence_score': round(confidence, 2),
        'requires_manual_review': requires_manual_review,
        'risk_level': risk_level,
        'factors': {
            'compliance_rate': round(compliance_rate, 2),
            'image_quality_score': round(quality_score, 2),
            'tesseract_confidence': tesseract_confidence,
            'keyword_completeness': round((found_count / total_keywords) * 100, 2),
        }
    }


# Phase 3: Alias for compatibility
ComplianceReportGenerator = AuditReportGenerator
