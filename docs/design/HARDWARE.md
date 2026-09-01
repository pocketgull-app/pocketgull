# 🖊️ Pocket Gull — Recommended Hardware & Digitizer Partners

Pocket Gull incorporates high-precision W3C `PointerEvent` and **Wacom pressure-sensitive digitizer telemetry** (supporting up to 8,192 pressure levels and pen tilt/azimuth) for 3D body surface pain shading, FDI odontogram annotation, and biometric gesture authentication.

---

## 💻 Recommended Clinical Hardware & Stylus Digitizers

The following hardware devices are tested and optimized for Pocket Gull's 60fps WebGL rendering, Web Speech API bi-directional audio, and touch gestures:

| Recommended Device | Primary Clinical Use Case | Supported Hardware Telemetry | Partner Referral Link |
| :--- | :--- | :--- | :---: |
| **Wacom Intuos Pro (Medium)** | EMR Charting & Pressure Gesture Unlock | 8,192 Pressure Levels, Pen Tilt, Bluetooth | [View Product (Affiliate Link)](https://www.wacom.com/en-us/products/pen-tablets/intuos-pro) |
| **Wacom One 12 Display** | Pathology Shading & Anatomical Annotation | 4,096 Pressure Levels, Multi-Touch Screen | [View Product (Affiliate Link)](https://www.wacom.com/en-us/products/pen-displays/wacom-one) |
| **Pixel 9 Pro Tablet** | Mobile Ward Rounds & Patient Action Carousel | High-DPI Stylus, WebGL 2.0, Palm Rejection | [View Product (Affiliate Link)](https://store.google.com/) |
| **3M Littmann CORE Digital Stethoscope** | Acoustic Respiratory Spectrogram FFT | Bluetooth Audio Telemetry, 40x Amplification | [View Product (Affiliate Link)](https://www.littmann.com/) |

---

## 🎧 3M Littmann CORE Digital Stethoscope & Acoustic AI Integrations

Pocket Gull incorporates the 3M Littmann CORE digital stethoscope across 5 specialized clinical AI & WebAudio workflows:

1. **Adventitious Respiratory Sound Classifier (LOINC 9303-9)**:
   - Real-time FFT spectral decomposition in `AudioRespiratoryAnalyzerService` classifying:
     - **Expiratory Wheeze (850 Hz)**: Bronchoconstriction & Asthma/COPD exacerbation warning.
     - **Inspiratory Stridor (2,400 Hz)**: Upper airway obstruction alert (Severe grade).
     - **Nocturnal Cough Bursts (500 Hz)**: Frequency burst severity indexing.
     - **Fine Crackles / Rales (100–300 Hz)**: Interstitial fluid & Pulmonary edema detection.

2. **Cardiac Auscultation & PhysioNet PCG Model Integration**:
   - Phonocardiogram (PCG) heart sound filtering via PhysioNet 2022 ML Classifier (`pocketgull_api/services/physionet_2022.py`):
     - **S1 / S2 Valve Timing**: Precise detection of mitral and aortic valve closures.
     - **Pathological Murmur Identification**: Classifies Systolic vs. Diastolic murmurs (Grades 1–6) and flags S3/S4 gallop rhythms associated with heart failure.

3. **Web Bluetooth GATT Audio & Telemetry Streaming**:
   - Connects via Web Bluetooth API (`0x180D` Heart Rate / Custom Audio Service) directly to the stethoscope head piece for hands-free sterile ward operation.

4. **Solfeggio & Vagal Co-Regulation Audio Feedback**:
   - Converts heart rate variability (HRV) and respiratory cadence into real-time **528 Hz / 432 Hz Solfeggio acoustic tones** and Web Haptic feedback to guide patient parasympathetic vagal recovery.

5. **Automated EHR SBAR & FHIR R4 Observation Export**:
   - Serializes auscultation findings into official **HL7 FHIR R4 `Observation`** payloads (`gcp-healthcare.service.ts`) ready for 1-click export to Epic MyChart or Cerner EHRs.

---

## ⚖️ Commercial Disclosure & Affiliate Transparency

*Pocket Gull participates in affiliate partner referral programs (such as Wacom / Amazon Associates). Clicking referral links helps support open-source development, security auditing, and cloud hosting maintenance of Pocket Gull at no additional cost to you.*
