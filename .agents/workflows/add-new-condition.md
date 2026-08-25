# Workflow: Add New Medical Condition

This workflow guides you through the process of adding a new medical condition to the Pocket-Gull platform. Because Pocket-Gull is a multi-modal, full-stack application, adding a condition requires synchronized updates across several services.

## Prerequisites
- The name of the condition (e.g., "Migraine", "Fractured Femur").
- Associated symptoms and vitals that trigger this condition.
- A basic understanding of the 3D anatomy mapping for this condition.

## Step 1: Update Angular Patient State
The `PatientStateService` in the Angular frontend acts as the single source of truth for the active session.

1.  Open `src/app/services/patient-state.service.ts` (or the relevant state file).
2.  Add the new condition to the recognized conditions enum or type definition.
3.  Ensure that the Gemini AI prompt template (`ClinicalIntelligenceService` or similar) is updated to recognize and return this condition when applicable.

## Step 2: Add 3D Visual Marker (Three.js)
If the condition has a physical manifestation (e.g., a broken bone, a rash), it needs to be mapped to the 3D anatomy model.

1.  Open the main 3D anatomy component.
2.  Use the `threejs_anatomy` skill to map the new condition ID to a specific mesh or bone group.
3.  Add highlight colors or procedural textures to visually indicate the condition when it becomes active in the `PatientStateService`.

## Step 3: Update FastAPI ML Scoring Model
If the companion Python sidecar (`pocketgull_api`) is used to score severity or suggest treatments for this condition:

1.  Open the relevant Pydantic schemas in `pocketgull_api/src/models/` and add the condition.
2.  Update the ML scoring endpoint to handle the new condition's specific data points.
3.  Ensure the API still returns a valid FHIR R4 Bundle.

## Step 4: Sync Flutter App State
The mobile companion app must also recognize the new condition.

1.  Open `pocketgull_flutter/lib/models/` and update the Dart data classes to match the FHIR R4 payload.
2.  If the condition requires a specific mobile UI (e.g., a specialized symptom tracker widget), build it using Riverpod for state management.
3.  Test the mobile UI against mock JSON data for the new condition.

## Step 5: Verification
-   Run the Angular app (`npm run dev`) and test the Gemini chat flow to ensure the AI can diagnose the new condition.
-   Verify the 3D model highlights correctly.
-   Run `npm run build` to ensure no typing errors were introduced.
