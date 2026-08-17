# 🧬 PocketGull Health: Your Physiological Digital Twin
## Apple App Store & Google Play Store Official Listing Specification

---

### 🏷️ 1. App Identity & Store Metadata

| Field | Apple App Store (iOS / iPadOS) | Google Play Store (Android) |
| :--- | :--- | :--- |
| **App Title / Name** (Max 30 chars) | `PocketGull Health: Digital Twin` *(30 chars)* | `PocketGull: My Digital Twin` *(27 chars)* |
| **Subtitle / Short Description** | `3D Body Vitals & AI Care Plan` *(29 chars)* | `Your personal 3D digital twin, continuous vitals telemetry & AI wellness consults.` *(80 chars)* |
| **Primary Category** | `Health & Fitness` | `Health & Fitness` |
| **Secondary Category** | `Medical` | `Medical` |
| **Age / Content Rating** | `12+ (Infrequent/Mild Medical/Health Information)` | `Everyone` |
| **Bundle Identifier (iOS)** | `app.pocketgull.patient` | `app.pocketgull.patient` |
| **Package Name (Android)** | `app.pocketgull.patient` | `app.pocketgull.patient` |
| **SKU / Unique ID** | `PG-HEALTH-IOS-01` | `PG-HEALTH-AND-01` |
| **Price Tier** | Free with Optional Premium Telemetry ($9.99/mo) | Free with Optional Premium Telemetry ($9.99/mo) |

---

### 🔑 2. App Store Keywords Field (100 Characters Max)

```
digital-twin,health,vitals,careplan,gemini,symptoms,cgm,longevity,whoop,oura,applehealth,tri-paradigm
```
*(99 characters)*

---

### 📢 3. Promotional Text (170 Characters Max - Editable Without App Update)

```
See your health in 3D. Explore your personal physiological digital twin, get live voice consults powered by Google Gemini, track continuous vitals, and own your health data.
```
*(169 characters)*

---

### 📝 4. Full Store Description (4,000 Characters Max)

```markdown
Meet PocketGull Health — your real-time 3D Physiological Digital Twin and compassionate health navigation companion powered by Google Gemini AI. 

Whether you're managing complex chronic symptoms, optimizing metabolic longevity, or preparing for your next doctor's visit, PocketGull transforms overwhelming health data into an intuitive, interactive 3D model of your own body.

══════════════════════════════════════════════════════════════════════════════
🧍 EXPLORE YOUR 3D PHYSIOLOGICAL DIGITAL TWIN
══════════════════════════════════════════════════════════════════════════════
• 3D Interactive Anatomy: Rotate, zoom, and inspect your body systems with real-time biometric heatmaps.
• Symptom Ray-Casting: Tap directly on your 3D skeletal and surface model to log localized pain, joint stiffness, or dermatological sensations.
• 3D Jargon-Buster: Double-tap any complex medical term to instantly flip the card and reveal clear, empathetic plain-English analogies.
• 90-Day Health Storybook: Watch your projected health trajectory and vitality score improve as you adopt evidence-based nutrition and lifestyle protocols.

══════════════════════════════════════════════════════════════════════════════
🎙️ REAL-TIME VOICE CONSULTS WITH COMPASSIONATE AI
══════════════════════════════════════════════════════════════════════════════
• Have fluid, full-duplex spoken conversations about your symptoms, medications, and lab results with your AI health companion.
• Multi-Paradigm Insights: Discover how Western clinical science, Traditional Chinese Medicine (Acupressure & Meridian balance), and Ayurvedic lifestyle principles offer harmonized insights for your well-being.
• Socratic Evidence Literacy: Learn the difference between correlation and proven clinical trials so you can make informed choices with your physician.

══════════════════════════════════════════════════════════════════════════════
📊 WEARABLE & CGM BIOMETRIC INTEGRATION
══════════════════════════════════════════════════════════════════════════════
• Syncs seamlessly with Apple HealthKit, Google Health Connect, Oura, WHOOP, and Continuous Glucose Monitors (CGM).
• Real-Time Metrics: Time-in-Range (TIR 70–180 mg/dL), Heart Rate Variability (HRV), Sleep Stage Architecture, and Systemic Inflammatory Burden (SIBI).
• Actuarial Biological Age Differentials: Track how metabolic adjustments shave years off your biological trajectory.

══════════════════════════════════════════════════════════════════════════════
🔒 TOTAL PRIVACY & 1-CLICK DATA EXPORT
══════════════════════════════════════════════════════════════════════════════
• 100% Anti-Surveillance: Zero third-party ad pixels or background tracking.
• Local Edge Computing: Biophysical math runs directly on your device.
• 1-Click Doctor Sharing: Export a beautiful, clinician-ready FHIR R4 report or styled PDF to bring to your doctor's appointment.
• Ephemeral Data Purge: Wipe transient session data anytime with 1 click.

══════════════════════════════════════════════════════════════════════════════
⚠️ MEDICAL DISCLAIMER
══════════════════════════════════════════════════════════════════════════════
PocketGull Health is a personalized health management and educational platform. It does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified healthcare provider with any questions you may have regarding a medical condition. In an emergency, dial 911 immediately.

Support: support@pocketgull.app
Privacy Policy: https://pocketgull.app/privacy-policy.html
Terms of Service: https://pocketgull.app/terms-of-service.html
```

---

### 🔒 5. App Privacy & Nutrition Label Disclosure

| Data Category | Collected? | Linked to Identity? | Tracking? | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| **Health Data (Vitals / Symptoms)** | Local Device Storage | No | No | 3D Digital Twin & Care Plan Synthesis |
| **Microphone Audio** | Transient Stream Only | No | No | Real-Time Voice Consult (Zero remote storage) |
| **User ID** | Optional Sync Account | Yes | No | Cross-Device Backup & Subscription Validation |
| **Third-Party Trackers** | **NONE** | **NO** | **NO** | Zero Tracking Invariant |

---

### 💳 6. In-App Purchases (IAP) & Premium Subscriptions

1. **`pocketgull.health.monthly`**:
   - **Display Title**: PocketGull Health Plus (Monthly)
   - **Price**: $9.99 / month
   - **Features**: Unlimited Gemini Voice Consults, 3D Organelle Micro-Viewer, CGM Glucose Variability Insights, FHIR R4 Clinical PDF Export.
2. **`pocketgull.health.annual`**:
   - **Display Title**: PocketGull Health Plus (Annual - Save 33%)
   - **Price**: $79.99 / year ($6.66/mo)
   - **Features**: Full premium digital twin suite + family cohort profile management.
