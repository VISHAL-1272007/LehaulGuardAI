# 🤖 **ESP32-S3 IoT EDGE SCANNER - Complete Integration Guide**

## Overview

Extend your LegalGuard AI system to the **production line** with an **ESP32-S3 camera module** that:
- **Automatically captures** product labels during manufacturing
- **Sends images** to your backend via WiFi
- **Receives compliance results** in real-time
- **Triggers alerts** for non-compliant products (LED, buzzer, relay)
- **No human intervention** required (fully automated)

---

## 🔧 **HARDWARE REQUIREMENTS**

### **ESP32-S3 Camera Module**
```
Recommended: ESP32-S3-CAM (or AI-Thinker ESP32-CAM with S3)

Specifications:
├─ Chip: ESP32-S3 (Dual-core Xtensa 240MHz)
├─ RAM: 512KB SRAM + 8MB PSRAM
├─ Flash: 8MB or 16MB
├─ Camera: OV2640 (2MP, JPEG output)
├─ WiFi: 802.11 b/g/n
├─ GPIO: 20+ pins available
└─ Cost: $8-15 USD
```

### **Additional Components**
```
1. Power Supply:    5V 2A adapter
2. Relay Module:    1-channel relay (for production line stop)
3. LED Indicators:
   - Green LED:    Compliant product
   - Red LED:      Non-compliant product
   - Yellow LED:   Processing
4. Buzzer:         Active buzzer (for alerts)
5. IR Sensor:      For product detection on conveyor belt
6. Jumper Wires:   20x for connections
7. Breadboard:     For prototyping (optional)
```

---

## 📐 **WIRING DIAGRAM**

```
ESP32-S3-CAM Module
┌─────────────────────────────────┐
│                                 │
│  Camera:  OV2640 (built-in)     │
│                                 │
│  GPIO 14 ───> Green LED         │
│  GPIO 15 ───> Red LED           │
│  GPIO 13 ───> Yellow LED        │
│  GPIO 12 ───> Buzzer            │
│  GPIO 2  ───> Relay (NO)        │
│  GPIO 4  ───> IR Sensor (input) │
│                                 │
│  GND     ───> Common Ground     │
│  5V      ───> Power Supply      │
│                                 │
└─────────────────────────────────┘

IR Proximity Sensor (Product Detection)
┌─────────┐
│  VCC    │────> 5V
│  GND    │────> GND
│  OUT    │────> GPIO 4 (ESP32)
└─────────┘

Relay Module (Production Line Control)
┌─────────┐
│  VCC    │────> 5V
│  GND    │────> GND
│  IN     │────> GPIO 2 (ESP32)
│  COM    │────> Line 1 (conveyor belt)
│  NO     │────> Line 2 (conveyor belt)
└─────────┘
```

---

## 💻 **ESP32-S3 CODE (Arduino/PlatformIO)**

### **Main Firmware** (esp32_legalguard_scanner.ino)

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API Configuration
const char* backendURL = "http://192.168.1.100:8000/api/v1/smart-scan";
const char* jwtToken = "YOUR_JWT_TOKEN";  // Get from login

// GPIO Pin Definitions
#define GREEN_LED 14
#define RED_LED 15
#define YELLOW_LED 13
#define BUZZER 12
#define RELAY 2
#define IR_SENSOR 4

// Camera Pin Definitions (ESP32-S3-CAM)
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     40
#define SIOC_GPIO_NUM     39

#define Y9_GPIO_NUM       48
#define Y8_GPIO_NUM       11
#define Y7_GPIO_NUM       12
#define Y6_GPIO_NUM       14
#define Y5_GPIO_NUM       16
#define Y4_GPIO_NUM       18
#define Y3_GPIO_NUM       17
#define Y2_GPIO_NUM       15
#define VSYNC_GPIO_NUM    38
#define HREF_GPIO_NUM     47
#define PCLK_GPIO_NUM     13

// Settings
bool autoCaptureEnabled = true;
int captureDelay = 2000;  // 2 seconds after product detected

void setup() {
  Serial.begin(115200);
  Serial.println("LegalGuard AI - ESP32-S3 Scanner Starting...");
  
  // Initialize GPIO
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(RELAY, OUTPUT);
  pinMode(IR_SENSOR, INPUT);
  
  // Set initial states
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(BUZZER, LOW);
  digitalWrite(RELAY, LOW);  // Conveyor ON
  
  // Initialize Camera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;  // 1600x1200
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;  // Lower = better quality (0-63)
  config.fb_count = 1;
  
  // Camera initialization
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    blinkError();
    return;
  }
  Serial.println("✓ Camera initialized");
  
  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("✓ WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Startup complete
  flashLEDs();
  Serial.println("✅ ESP32-S3 Scanner READY");
}

void loop() {
  // Check for product on conveyor belt
  if (digitalRead(IR_SENSOR) == LOW) {  // Product detected
    Serial.println("📦 Product detected on conveyor belt");
    
    // Turn on yellow LED (processing)
    digitalWrite(YELLOW_LED, HIGH);
    
    // Wait for product to be in position
    delay(captureDelay);
    
    // Capture image
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Camera capture failed");
      blinkError();
      digitalWrite(YELLOW_LED, LOW);
      return;
    }
    
    Serial.printf("📸 Image captured: %d bytes\n", fb->len);
    
    // Send to backend for analysis
    String result = sendImageToBackend(fb->buf, fb->len);
    
    // Process result
    if (result.length() > 0) {
      processComplianceResult(result);
    } else {
      Serial.println("❌ Backend error");
      blinkError();
    }
    
    // Release frame buffer
    esp_camera_fb_return(fb);
    
    // Turn off yellow LED
    digitalWrite(YELLOW_LED, LOW);
    
    // Wait before next scan
    delay(3000);
  }
  
  delay(100);  // Small delay to prevent busy loop
}

// Send image to backend API
String sendImageToBackend(uint8_t* imageData, size_t imageSize) {
  HTTPClient http;
  
  http.begin(backendURL);
  http.addHeader("Authorization", String("Bearer ") + jwtToken);
  
  // Create multipart form data
  String boundary = "----ESP32Boundary";
  String contentType = "multipart/form-data; boundary=" + boundary;
  http.addHeader("Content-Type", contentType);
  
  // Build multipart body
  String head = "--" + boundary + "\r\n";
  head += "Content-Disposition: form-data; name=\"file\"; filename=\"esp32-scan.jpg\"\r\n";
  head += "Content-Type: image/jpeg\r\n\r\n";
  
  String tail = "\r\n--" + boundary + "--\r\n";
  
  size_t totalSize = head.length() + imageSize + tail.length();
  
  // Allocate buffer
  uint8_t* buffer = (uint8_t*)malloc(totalSize);
  if (!buffer) {
    Serial.println("Memory allocation failed");
    return "";
  }
  
  // Copy parts to buffer
  memcpy(buffer, head.c_str(), head.length());
  memcpy(buffer + head.length(), imageData, imageSize);
  memcpy(buffer + head.length() + imageSize, tail.c_str(), tail.length());
  
  // Send POST request
  int httpResponseCode = http.POST(buffer, totalSize);
  
  free(buffer);
  
  String response = "";
  
  if (httpResponseCode > 0) {
    Serial.printf("HTTP Response code: %d\n", httpResponseCode);
    response = http.getString();
  } else {
    Serial.printf("HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
  return response;
}

// Process compliance result from backend
void processComplianceResult(String jsonResponse) {
  // Parse JSON response
  StaticJsonDocument<2048> doc;
  DeserializationError error = deserializeJson(doc, jsonResponse);
  
  if (error) {
    Serial.println("JSON parse failed");
    blinkError();
    return;
  }
  
  // Extract compliance status
  String complianceStatus = doc["compliance_status"].as<String>();
  float confidenceScore = doc["confidence_score"].as<float>();
  bool tamperAlert = doc["tamper_alert"].as<bool>();
  
  Serial.println("=====================================");
  Serial.printf("Compliance: %s\n", complianceStatus.c_str());
  Serial.printf("Confidence: %.1f%%\n", confidenceScore);
  Serial.printf("Tampering: %s\n", tamperAlert ? "DETECTED" : "None");
  Serial.println("=====================================");
  
  // Decision logic
  if (complianceStatus == "COMPLIANT" && !tamperAlert && confidenceScore > 80.0) {
    // PASS: Product is compliant
    Serial.println("✅ PASS - Product COMPLIANT");
    
    // Green LED ON for 2 seconds
    digitalWrite(GREEN_LED, HIGH);
    delay(2000);
    digitalWrite(GREEN_LED, LOW);
    
    // Conveyor continues (relay OFF)
    digitalWrite(RELAY, LOW);
    
  } else {
    // FAIL: Product is non-compliant or tampered
    Serial.println("❌ FAIL - Product NON-COMPLIANT");
    
    // Red LED ON
    digitalWrite(RED_LED, HIGH);
    
    // Sound buzzer (3 beeps)
    for (int i = 0; i < 3; i++) {
      digitalWrite(BUZZER, HIGH);
      delay(200);
      digitalWrite(BUZZER, LOW);
      delay(200);
    }
    
    // STOP conveyor belt (activate relay)
    digitalWrite(RELAY, HIGH);
    
    Serial.println("⚠️  PRODUCTION LINE STOPPED");
    Serial.println("   → Manual inspection required");
    
    // Keep red LED on until manual reset
    // (In practice, you'd have a reset button)
    delay(5000);
    
    // Auto-resume after 5 seconds (demo mode)
    digitalWrite(RED_LED, LOW);
    digitalWrite(RELAY, LOW);
    Serial.println("✓ Production line resumed");
  }
}

// Error indicator (blink all LEDs)
void blinkError() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(YELLOW_LED, HIGH);
    delay(100);
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    delay(100);
  }
}

// Startup flash (all LEDs)
void flashLEDs() {
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(YELLOW_LED, HIGH);
  digitalWrite(RED_LED, HIGH);
  delay(500);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);
}
```

---

## 📊 **SYSTEM ARCHITECTURE**

```
FACTORY PRODUCTION LINE:

Conveyor Belt
───────────────────────────────────────────>
           │
           │  Product approaches
           ↓
    [IR Proximity Sensor]
           │
           │  Detects product
           ↓
    [ESP32-S3 Camera]
           │
           │  Captures image (2MP JPEG)
           ↓
    [WiFi Transmission]
           │
           │  HTTP POST to backend
           ↓
    [FastAPI Backend]
    ├─ Smart AI Auditor
    │  ├─ Explainable AI
    │  ├─ Fuzzy Matching
    │  ├─ PII Masking
    │  └─ Forgery Detection
    └─ Returns JSON response
           │
           │  Compliance result
           ↓
    [ESP32-S3 Decision Logic]
    ├─ COMPLIANT → Green LED
    └─ NON-COMPLIANT → Red LED + Buzzer + STOP
           │
           │  Relay activation
           ↓
    [Conveyor Belt Control]
    ├─ Relay OFF = Continue
    └─ Relay ON = STOP (manual inspection)
```

---

## ⚙️ **CONFIGURATION**

### **WiFi Settings** (Line 8-9)
```cpp
const char* ssid = "FactoryWiFi";
const char* password = "securePassword123";
```

### **Backend URL** (Line 12)
```cpp
// Local network (same subnet as ESP32)
const char* backendURL = "http://192.168.1.100:8000/api/v1/smart-scan";

// Public server (with HTTPS)
const char* backendURL = "https://api.legalguard.ai/api/v1/smart-scan";
```

### **JWT Token** (Line 13)
```cpp
// Get token via login:
// POST /api/v1/auth/login
// Response: { "access_token": "eyJ0eXAiOiJKV1..." }

const char* jwtToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...";
```

### **Capture Timing** (Line 20)
```cpp
// Delay after product detection (milliseconds)
int captureDelay = 2000;  // 2 seconds default

// Fast conveyor line
int captureDelay = 1000;  // 1 second

// Slow conveyor line
int captureDelay = 3000;  // 3 seconds
```

---

## 🔍 **TESTING & DEBUGGING**

### **Serial Monitor Output**
```
LegalGuard AI - ESP32-S3 Scanner Starting...
✓ Camera initialized
Connecting to WiFi...
✓ WiFi connected
IP address: 192.168.1.105
✅ ESP32-S3 Scanner READY

📦 Product detected on conveyor belt
📸 Image captured: 45820 bytes
HTTP Response code: 200
=====================================
Compliance: COMPLIANT
Confidence: 92.5%
Tampering: None
=====================================
✅ PASS - Product COMPLIANT

📦 Product detected on conveyor belt
📸 Image captured: 48200 bytes
HTTP Response code: 200
=====================================
Compliance: NON_COMPLIANT
Confidence: 68.0%
Tampering: None
=====================================
❌ FAIL - Product NON-COMPLIANT
⚠️  PRODUCTION LINE STOPPED
   → Manual inspection required
✓ Production line resumed
```

### **LED Status Indicators**
```
Yellow LED:  Processing (camera + upload)
Green LED:   COMPLIANT (product passed)
Red LED:     NON-COMPLIANT (product failed)
All LEDs:    System startup (flash once)
Red+Yellow:  Error (camera/WiFi/backend)
```

---

## 📈 **PERFORMANCE METRICS**

```
Image Capture Time:      ~100ms
WiFi Upload Time:        ~500ms (on 50Mbps WiFi)
Backend Processing:      2-3 seconds
Total Scan Cycle:        3-4 seconds

Conveyor Belt Speed:     0.5 m/s (typical)
Product Spacing:         minimum 2 meters
Throughput:              ~15 products/minute
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **JWT Token Management**
```cpp
// Option 1: Hardcode (development only)
const char* jwtToken = "your_token_here";

// Option 2: Periodic refresh (recommended)
void refreshJWTToken() {
  // Login endpoint every hour
  // Update jwtToken variable
}

// Option 3: Store in EEPROM
#include <EEPROM.h>
String getTokenFromEEPROM() {
  // Read from persistent storage
}
```

### **HTTPS Support**
```cpp
#include <WiFiClientSecure.h>

WiFiClientSecure client;
client.setInsecure();  // Skip certificate validation (dev)

// Production: Add root CA certificate
client.setCACert(root_ca);
```

---

## 🛠️ **TROUBLESHOOTING**

| Issue | Cause | Solution |
|-------|-------|----------|
| Camera init failed | Wiring error | Check pin definitions match board |
| WiFi won't connect | Wrong credentials | Verify SSID/password |
| HTTP 401 error | Invalid JWT | Re-login to get fresh token |
| HTTP 404 error | Wrong backend URL | Check IP address + port |
| Blurry images | Camera focus | Adjust lens focus ring |
| Slow upload | Weak WiFi | Move ESP32 closer to router |
| Random reboots | Power insufficient | Use 5V 2A power supply |

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Hardware Setup**
- [ ] ESP32-S3-CAM module powered (5V 2A)
- [ ] Camera lens focused correctly
- [ ] All LEDs connected to GPIOs
- [ ] Buzzer connected to GPIO 12
- [ ] Relay connected to GPIO 2 (production line control)
- [ ] IR sensor connected to GPIO 4
- [ ] WiFi antenna attached (if external)

### **Software Configuration**
- [ ] WiFi SSID/password configured
- [ ] Backend URL pointing to correct server
- [ ] JWT token obtained and configured
- [ ] Camera resolution set appropriately
- [ ] Capture delay tuned for conveyor speed
- [ ] Serial monitor verified output

### **Testing Phase**
- [ ] Camera captures clear images
- [ ] WiFi connection stable
- [ ] Backend API responds correctly
- [ ] Green LED illuminates for compliant products
- [ ] Red LED + buzzer activate for non-compliant
- [ ] Relay stops conveyor belt when needed
- [ ] IR sensor detects products reliably

### **Production Deployment**
- [ ] Mount camera 30-50cm above conveyor
- [ ] Aim camera perpendicular to product
- [ ] Test with 10+ products of varying quality
- [ ] Verify conveyor belt stop/start mechanism
- [ ] Set up manual reset button (optional)
- [ ] Configure production logging
- [ ] Add backup power (UPS)

---

## 📊 **INTEGRATION WITH BACKEND**

### **API Endpoint Used**
```
POST /api/v1/smart-scan
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data

Request Body:
├─ file: Binary image (JPEG)
└─ tamil_support: false (not needed for ESP32)

Response (JSON):
{
  "compliance_status": "COMPLIANT" | "NON_COMPLIANT",
  "confidence_score": 92.5,
  "tamper_alert": false,
  "pii_detected": [],
  ...
}
```

### **Decision Logic**
```cpp
// Backend returns compliance_status
// ESP32 acts on it:

IF compliance_status == "COMPLIANT" 
   AND tamper_alert == false 
   AND confidence_score > 80%:
   
   ✅ Green LED ON
   ✅ Conveyor continues (relay OFF)

ELSE:
   ❌ Red LED ON
   ❌ Buzzer beeps (3x)
   ❌ Conveyor STOPS (relay ON)
   ⚠️  Await manual inspection
```

---

## 🎯 **USE CASES**

### **1. Factory Quality Control**
```
Product Label Inspection during packaging
├─ Camera positioned above conveyor belt
├─ Every product scanned automatically
├─ Non-compliant items stopped for review
└─ Compliance rate logged to database
```

### **2. Counterfeit Detection**
```
Incoming Goods Inspection
├─ Vendors send products for checking
├─ ESP32 camera scans each package
├─ Forgery detection via ELA algorithm
├─ Suspicious packages flagged
└─ Alerts sent to warehouse manager
```

### **3. Audit Trail Creation**
```
Regulatory Compliance Documentation
├─ Every product gets timestamped photo
├─ Compliance status logged
├─ PDF reports generated weekly
└─ 100% traceability for audits
```

---

## 💡 **OPTIMIZATION TIPS**

### **Reduce Upload Time**
```cpp
// Lower image quality (faster upload)
config.jpeg_quality = 20;  // Default: 12 (higher = lower quality)

// Reduce resolution (smaller file size)
config.frame_size = FRAMESIZE_SVGA;  // 800x600 instead of 1600x1200
```

### **Improve Accuracy**
```cpp
// Better lighting
// Add LED ring light around camera lens

// Steady camera mount
// Use vibration-dampening mounts

// Higher resolution
config.frame_size = FRAMESIZE_QXGA;  // 2048x1536 (best quality)
```

### **Save Power**
```cpp
// Deep sleep between scans
esp_deep_sleep_start();

// Turn off LEDs when not in use
digitalWrite(ALL_LEDS, LOW);

// Reduce WiFi power
WiFi.setTxPower(WIFI_POWER_11dBm);
```

---

## 📚 **ADDITIONAL RESOURCES**

### **ESP32-S3 Documentation**
- Espressif ESP32-S3 Datasheet
- ESP32 Camera Library: https://github.com/espressif/esp32-camera
- Arduino HTTPClient: https://github.com/espressif/arduino-esp32

### **Hardware Suppliers**
- AliExpress: ESP32-S3-CAM modules (~$10)
- Amazon: IR sensors, relays, buzzers
- Adafruit: Quality components

### **Related Projects**
- ESP32-CAM Object Detection
- Factory Automation with ESP32
- Industrial IoT Scanner Systems

---

## ✅ **SUMMARY**

Your ESP32-S3 IoT Edge Scanner provides:
- ✅ **Automatic image capture** on production line
- ✅ **WiFi connectivity** to backend API
- ✅ **Real-time compliance checking** via Smart AI Auditor
- ✅ **Visual & audio feedback** (LEDs, buzzer)
- ✅ **Production line control** (relay integration)
- ✅ **Low-cost** (~$15 per unit)
- ✅ **Scalable** (deploy 10+ units on multiple lines)
- ✅ **Maintenance-free** (embedded system, no OS to manage)

**Perfect for:**
- Manufacturing quality control
- Packaging compliance verification
- Incoming goods inspection
- Pharmaceutical label validation
- Food safety compliance

**Now your LegalGuard AI works everywhere:** 🌍
- 🖥️ **Desktop** (ScannerAI - for office)
- 📱 **Mobile** (MobileScanner - for field)
- 🤖 **IoT Edge** (ESP32-S3 - for factory)

**Complete automation achieved!** ✨

