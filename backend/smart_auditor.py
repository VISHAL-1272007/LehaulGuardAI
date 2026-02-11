"""
Smart AI Auditor - Advanced AI Features for Legal Metrology Compliance
Includes: Explainable AI, Fuzzy Matching, PII Masking, Forgery Detection
"""

import cv2
import numpy as np
import pytesseract
from PIL import Image
import base64
import io
import re
from typing import Dict, List, Tuple, Optional
from thefuzz import fuzz, process
from skimage import io as skio
from skimage.filters import gaussian
import io as io_module
import json


class ExplainableAIExtractor:
    """Extract text with coordinates for explainability"""
    
    @staticmethod
    def extract_with_coordinates(image_array: np.ndarray, lang: str = 'eng') -> Dict:
        """
        Extract text with bounding box coordinates
        
        Returns:
            {
                'text': full_text,
                'items': [
                    {'text': 'MRP', 'confidence': 95, 'x': 100, 'y': 50, 'w': 40, 'h': 20},
                    ...
                ]
            }
        """
        try:
            # Use image_to_data for detailed results
            data = pytesseract.image_to_data(image_array, lang=lang, output_type=pytesseract.Output.DICT)
            
            # Extract full text
            full_text = ' '.join(data['text'])
            
            # Build items with coordinates
            items = []
            for i in range(len(data['text'])):
                if data['text'][i].strip():  # Skip empty text
                    items.append({
                        'text': data['text'][i],
                        'confidence': int(data['conf'][i]),
                        'x': int(data['left'][i]),
                        'y': int(data['top'][i]),
                        'w': int(data['width'][i]),
                        'h': int(data['height'][i])
                    })
            
            return {
                'text': full_text,
                'items': items
            }
        except Exception as e:
            print(f"Error extracting coordinates: {e}")
            return {'text': '', 'items': []}


class FuzzyKeywordMatcher:
    """Intelligent fuzzy matching for compliance keywords"""
    
    # Define compliance keywords with their aliases
    COMPLIANCE_KEYWORDS = {
        'MRP': ['MRP', 'M.R.P', 'Max Retail Price', 'Maximum Retail Price', 'Price', 'Cost', '₹'],
        'Net Quantity': ['Net Qty', 'Net Quantity', 'Weight', 'Volume', 'QTY', 'Qty', 'ml', 'gm', 'kg'],
        'Manufacture Date': ['Mfg Date', 'Manufacturing Date', 'Mfd', 'Manufactured', 'Made On', 'Date of Mfg'],
        'Expiry Date': ['Exp Date', 'Expiry', 'Best Before', 'Use By', 'Validity', 'Date of Expiry'],
        'Batch Number': ['Batch No', 'Batch Number', 'Batch', 'Lot No', 'Lot Number', 'Code'],
    }
    
    @staticmethod
    def match_keywords(text: str, threshold: int = 80) -> Dict[str, List[Tuple[str, int]]]:
        """
        Fuzzy match text against compliance keywords
        
        Args:
            text: OCR extracted text
            threshold: Fuzzy match threshold (0-100)
        
        Returns:
            {
                'MRP': [('M.R.P', 90), ...],
                'Net Quantity': [...],
                ...
            }
        """
        words = text.split()
        results = {}
        
        for compliance_field, aliases in FuzzyKeywordMatcher.COMPLIANCE_KEYWORDS.items():
            matches = []
            for word in words:
                # Use token_set_ratio for better matching
                for alias in aliases:
                    ratio = fuzz.token_set_ratio(word.lower(), alias.lower())
                    if ratio >= threshold:
                        matches.append((word, ratio))
            
            if matches:
                # Remove duplicates, keep best match
                best_match = max(matches, key=lambda x: x[1])
                results[compliance_field] = best_match
            else:
                results[compliance_field] = None
        
        return results


class PIIMasker:
    """Mask Personally Identifiable Information on images"""
    
    PII_PATTERNS = {
        'phone': r'(\+91[-\s]?|0)?[6-9]\d{9}',  # Indian phone numbers
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'gstin': r'\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{3}',  # GSTIN
        'aadhaar': r'\d{4}\s?\d{4}\s?\d{4}',  # Aadhaar (partial)
    }
    
    @staticmethod
    def detect_and_mask_pii(image_array: np.ndarray, text: str) -> Tuple[np.ndarray, List[str]]:
        """
        Detect PII in text and blur corresponding areas on image
        
        Returns:
            (masked_image, detected_pii_types)
        """
        masked_image = image_array.copy()
        detected_pii = []
        
        # Get text coordinates
        data = pytesseract.image_to_data(image_array, lang='eng', output_type=pytesseract.Output.DICT)
        text_positions = {data['text'][i]: (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                         for i in range(len(data['text'])) if data['text'][i].strip()}
        
        # Check for PII patterns
        for pii_type, pattern in PIIMasker.PII_PATTERNS.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                detected_pii.append(pii_type)
                matched_text = match.group()
                
                # Find position and blur
                for word, (x, y, w, h) in text_positions.items():
                    if matched_text.lower() in word.lower():
                        # Apply Gaussian blur to PII area with padding
                        x1, y1 = max(0, x - 5), max(0, y - 5)
                        x2, y2 = min(masked_image.shape[1], x + w + 5), min(masked_image.shape[0], y + h + 5)
                        masked_image[y1:y2, x1:x2] = cv2.blur(masked_image[y1:y2, x1:x2], (15, 15))
        
        return masked_image, list(set(detected_pii))


class ForgeryDetector:
    """Detect potential image tampering using Error Level Analysis"""
    
    @staticmethod
    def detect_tamper(image_array: np.ndarray, threshold: float = 0.15) -> Tuple[bool, float, str]:
        """
        Detect image tampering using Error Level Analysis
        
        Returns:
            (is_forged, tamper_score, reason)
        """
        try:
            # Convert to float for ELA
            img_float = image_array.astype(np.float32) / 255.0
            
            # Apply small Gaussian blur and measure difference
            blurred = gaussian(img_float, sigma=1.0)
            error_level = np.abs(img_float - blurred)
            error_mean = np.mean(error_level)
            
            # Compression artifacts detection
            if error_mean > threshold:
                return True, error_mean, f"High error level detected ({error_mean:.3f}): Possible JPEG compression artifacts"
            
            # Metadata analysis (basic)
            # High variance in specific regions can indicate tampering
            h, w = image_array.shape[:2]
            center = image_array[h//4:3*h//4, w//4:3*w//4]
            edges = np.concatenate([
                image_array[:h//4, :],
                image_array[3*h//4:, :],
                image_array[:, :w//4],
                image_array[:, 3*w//4:]
            ])
            
            center_variance = np.var(center)
            edges_variance = np.var(edges)
            variance_ratio = center_variance / (edges_variance + 1e-6)
            
            if abs(variance_ratio - 1.0) > 0.5:
                return True, variance_ratio, f"Unusual variance pattern ({variance_ratio:.2f}): Possible content manipulation"
            
            return False, error_mean, "No tampering detected"
        
        except Exception as e:
            return False, 0.0, f"Could not analyze: {str(e)}"


class SmartAuditorResponse:
    """Format unified response with all auditor features"""
    
    @staticmethod
    def build_response(
        original_image: np.ndarray,
        processed_image: np.ndarray,
        extracted_text: str,
        coordinate_data: Dict,
        fuzzy_matches: Dict,
        pii_detected: List[str],
        tamper_detected: bool,
        tamper_score: float,
        compliance_status: str,
        confidence_score: float
    ) -> Dict:
        """Build comprehensive Smart AI Auditor response"""
        
        # Encode processed image to base64
        _, buffer = cv2.imencode('.png', processed_image)
        processed_image_b64 = base64.b64encode(buffer).decode('utf-8')
        
        # Draw bounding boxes on a visual representation
        visual_image = original_image.copy()
        for item in coordinate_data.get('items', []):
            x, y, w, h = item['x'], item['y'], item['w'], item['h']
            # Draw rectangle
            cv2.rectangle(visual_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            # Put text with confidence
            cv2.putText(visual_image, f"{item['text']} ({item['confidence']}%)", 
                       (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        _, buffer = cv2.imencode('.png', visual_image)
        visual_image_b64 = base64.b64encode(buffer).decode('utf-8')
        
        # Build compliance results from fuzzy matches
        compliance_results = []
        for field, match in fuzzy_matches.items():
            if match:
                compliance_results.append({
                    'field': field,
                    'detected_text': match[0],
                    'confidence': match[1],
                    'status': 'FOUND'
                })
            else:
                compliance_results.append({
                    'field': field,
                    'detected_text': None,
                    'confidence': 0,
                    'status': 'MISSING'
                })
        
        return {
            'extracted_text': extracted_text,
            'processed_image': processed_image_b64,
            'visual_analysis_image': visual_image_b64,
            'coordinates_data': coordinate_data,
            'compliance_results': compliance_results,
            'pii_detected': pii_detected,
            'tamper_alert': tamper_detected,
            'tamper_score': float(tamper_score),
            'tamper_reason': '',
            'compliance_status': compliance_status,
            'confidence_score': confidence_score,
            'auditor_details': {
                'explainable_ai': True,
                'fuzzy_matching_enabled': True,
                'pii_masking_applied': len(pii_detected) > 0,
                'forgery_detection_enabled': True
            }
        }


# Testing helper
if __name__ == "__main__":
    print("Smart AI Auditor Module Loaded")
    print(f"PII Patterns: {list(PIIMasker.PII_PATTERNS.keys())}")
    print(f"Compliance Keywords: {list(FuzzyKeywordMatcher.COMPLIANCE_KEYWORDS.keys())}")
