# PocketGull AVS — Official App Store & Google Play Store Submission Metadata

## 🤖 1. Google Play Console (Android) Metadata

### Basic Listing Details
- **App Name** (max 30 chars): `PocketGull AVS: Clinical Care`
- **Short Description** (max 80 chars): `Real-time Health Connect vitals, vagal breathing pacer & clinical care plans.`
- **Default Language**: English (United States) — `en-US`
- **Category**: Medical
- **Tags**: Health & Fitness, Medical, Heart Rate Monitor, Mindfulness, Vagus Nerve

### Full Description (max 4,000 chars)
```text
PocketGull AVS is an evidence-grounded clinical health companion that connects continuous biometric telemetry from Android Health Connect with intelligent clinical Care Plans.

KEY CLINICAL CAPABILITIES:
• Continuous Biometric Sync: Live background synchronization of resting heart rate, RMSSD heart rate variability (HRV), SpO2, and daily step counts directly from your connected smartwatch or ring.
• Vagal Tone Breathing Pacer: Interactive 4-7-8 and coherent breathing pacing guides designed to enhance parasympathetic recovery and heart rate variability.
• Green Rx Nature Quests: Micro-milestones and walking duration logs that translate physical activity into actionable clinical trajectory points.
• 60-Second Clinician Handoff Briefs: Generate optotypically clean, high-density health summaries featuring NIST SP 800-90A CSPRNG SHA-256 cryptographic verification seals for your doctor appointments.
• Zero-Surveillance Privacy: Built strictly upon HIPAA Safe Harbor §164.514 standards. Your biometric data is encrypted on-device with zero advertising tracking and 1-click ephemeral data purging.

NON-DEVICE WELLNESS NOTICE:
PocketGull is a supportive clinical intelligence and wellness tracking tool complying with FDA Clinical Decision Support (CDSR) guidelines. It does not provide definitive medical diagnoses or replace direct consultation with a licensed healthcare practitioner.
```

### Google Play Data Safety Questionnaire Answers
- **Data Collected**:
  - *Health & Fitness*: Health info, fitness info (Heart rate, HRV, SpO2, steps).
  - *App Info & Performance*: Crash logs, performance diagnostics.
- **Data Sharing**: `No` — Data is never shared with third parties or data brokers.
- **Security Practices**:
  - Data is encrypted in transit (TLS 1.3).
  - Data is encrypted at rest (AES-256 / Google Tink AEAD).
  - 1-Click user account and ephemeral health data deletion supported.
- **Health Connect Declaration**:
  - Permissions used: `READ_HEART_RATE`, `READ_RESTING_HEART_RATE`, `READ_HEART_RATE_VARIABILITY`, `READ_STEPS`, `READ_OXYGEN_SATURATION`.
  - Justification: "Continuous biometric data is read to compute parasympathetic recovery scores and display daily trend graphs in the patient's personal care plan."

---

## 🍏 2. Apple App Store (iOS) Metadata

### App Store Product Page
- **App Name** (max 30 chars): `PocketGull AVS: Health Vitals`
- **Subtitle** (max 30 chars): `Vagal Pacer & Clinical Plan`
- **Primary Category**: Medical
- **Secondary Category**: Health & Fitness
- **Age Rating**: 17+ (Medical/Informational content)
- **Copyright**: `© 2026 PocketGull LLC. All rights reserved.`

### Keywords (max 100 chars, comma-separated)
```text
hrv,vitals,healthkit,care plan,heart rate,spo2,vagus nerve,breathing,fhir,clinical,wellness,telemetry
```

### URLs
- **Support URL**: `https://pocketgull.app`
- **Marketing URL**: `https://pocketgull.app`
- **Privacy Policy URL**: `https://pocketgull.app/privacy-policy.html`

### Promotional Text (max 170 chars)
```text
Synchronize continuous Apple Health vitals, practice vagal breathing pacing, and generate cryptographic clinical Care Plan handoff briefs for your physician.
```

### Apple App Privacy Nutrition Label
- **Data Linked to You**:
  - Health & Fitness (Health records, vitals telemetry) — Used for App Functionality.
- **Data Used to Track You**: `None` (Zero tracking identifiers / IDFA).
- **Data Not Collected**: Financial info, browsing history, location, contacts, user content.

### App Store Review Notes
```text
Test Account Credentials:
- Mode: Demo / Direct Guest Access (Tap "Enter Workspace as Guest" or "Demo Mode").
- HealthKit Testing: When prompted, grant read permissions for Heart Rate, HRV, Steps, and Oxygen Saturation. The app populates simulated or live HealthKit data instantly into the dashboard.
- Regulatory Demarcation: The application includes standard FDA CDSR non-device wellness notices on the intake and export screens.
```
