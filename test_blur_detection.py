"""
Test script for image blur detection using Laplacian Variance
"""

import cv2
import numpy as np
from PIL import Image

def check_image_blur(image, threshold=100.0):
    """Check if an image is blurry using Laplacian variance."""
    # Convert PIL Image to numpy array
    img_array = np.array(image)
    
    # Convert to grayscale if needed
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_array
    
    # Calculate Laplacian variance
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

# Create test images with different blur levels
print("=" * 70)
print("IMAGE BLUR DETECTION TEST")
print("=" * 70)

# Test 1: Sharp synthetic image
print("\n--- Test 1: Sharp Image (Text Pattern) ---")
sharp_img = np.ones((300, 400), dtype=np.uint8) * 255
# Add some sharp text-like patterns
for i in range(5, 295, 30):
    cv2.rectangle(sharp_img, (50, i), (350, i+20), 0, -1)
sharp_pil = Image.fromarray(sharp_img)
result = check_image_blur(sharp_pil)
print(f"Variance: {result['variance']:.2f}")
print(f"Quality: {result['quality']}")
print(f"Is Blurry: {result['is_blurry']}")

# Test 2: Slightly blurred image
print("\n--- Test 2: Slightly Blurred Image ---")
blurred_img = cv2.GaussianBlur(sharp_img, (5, 5), 0)
blurred_pil = Image.fromarray(blurred_img)
result = check_image_blur(blurred_pil)
print(f"Variance: {result['variance']:.2f}")
print(f"Quality: {result['quality']}")
print(f"Is Blurry: {result['is_blurry']}")

# Test 3: Very blurred image
print("\n--- Test 3: Very Blurred Image ---")
very_blurred_img = cv2.GaussianBlur(sharp_img, (15, 15), 0)
very_blurred_pil = Image.fromarray(very_blurred_img)
result = check_image_blur(very_blurred_pil)
print(f"Variance: {result['variance']:.2f}")
print(f"Quality: {result['quality']}")
print(f"Is Blurry: {result['is_blurry']}")

# Test 4: Extremely blurred image
print("\n--- Test 4: Extremely Blurred Image ---")
extreme_blur_img = cv2.GaussianBlur(sharp_img, (31, 31), 0)
extreme_blur_pil = Image.fromarray(extreme_blur_img)
result = check_image_blur(extreme_blur_pil)
print(f"Variance: {result['variance']:.2f}")
print(f"Quality: {result['quality']}")
print(f"Is Blurry: {result['is_blurry']}")

# Test 5: Uniform image (worst case)
print("\n--- Test 5: Uniform Image (No Features) ---")
uniform_img = np.ones((300, 400), dtype=np.uint8) * 128
uniform_pil = Image.fromarray(uniform_img)
result = check_image_blur(uniform_pil)
print(f"Variance: {result['variance']:.2f}")
print(f"Quality: {result['quality']}")
print(f"Is Blurry: {result['is_blurry']}")

print("\n" + "=" * 70)
print("QUALITY THRESHOLDS:")
print("=" * 70)
print("Excellent: >= 500")
print("Good:      >= 200")
print("Fair:      >= 100")
print("Poor:      >= 50")
print("Very Poor: < 50")
print("\nBlur Threshold: < 100 (variance)")
print("=" * 70)
