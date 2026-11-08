// SPDX-License-Identifier: Apache-2.0
// Package clinical implements deterministic clinical red-flag interception
// (BE-FAST Stroke, ACS Chest Pain, SpO2 < 90% Hypoxia, C-SSRS Crisis)
// and statutory Five Eyes (FVEY) emergency routing in pure Go.
//
// Deterministic interception MUST execute prior to any LLM or generative call.
package clinical

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// TriageRequest models a patient symptom and vital sign payload for deterministic red-flag screening.
type TriageRequest struct {
	PatientID    string  `json:"patientId,omitempty"`
	Text         string  `json:"text"`
	Jurisdiction string  `json:"jurisdiction,omitempty"` // US, UK, CA, AU, NZ
	HeartRateBpm float64 `json:"heartRateBpm,omitempty"`
	SpO2Percent  float64 `json:"spO2Percent,omitempty"`
	SystolicBp   float64 `json:"systolicBp,omitempty"`
}

// EmergencyContacts maps Five Eyes (FVEY) statutory jurisdictions to emergency & crisis numbers.
type EmergencyContacts struct {
	Jurisdiction   string `json:"jurisdiction"`
	MedicalNumber  string `json:"medicalNumber"`
	CrisisLine     string `json:"crisisLine"`
	StatutoryFrame string `json:"statutoryFrame"`
}

// TriageResult returns deterministic red-flag interception status and Part 11 SHA-256 attestation.
type TriageResult struct {
	Intercepted       bool              `json:"intercepted"`
	AcuityCategory    string            `json:"acuityCategory"` // STAT_RED_FLAG, URGENT, ROUTINE
	RedFlagTriggers   []string          `json:"redFlagTriggers"`
	ClinicalDirective string            `json:"clinicalDirective"`
	EmergencyRouting  EmergencyContacts `json:"emergencyRouting"`
	Part11Sha256Seal  string            `json:"part11Sha256Seal"`
	EvaluatedAtUTC    string            `json:"evaluatedAtUtc"`
}

var fveyDirectory = map[string]EmergencyContacts{
	"US": {
		Jurisdiction:   "US",
		MedicalNumber:  "911",
		CrisisLine:     "988 (Suicide & Crisis Lifeline)",
		StatutoryFrame: "HIPAA §164.514 Safe Harbor / FDA Non-Device CDS",
	},
	"UK": {
		Jurisdiction:   "UK",
		MedicalNumber:  "999 / 111",
		CrisisLine:     "111 (NHS Mental Health Option) / 116 123 (Samaritans)",
		StatutoryFrame: "NHS DTAC / UK GDPR",
	},
	"CA": {
		Jurisdiction:   "CA",
		MedicalNumber:  "911",
		CrisisLine:     "988 (Suicide Crisis Helpline)",
		StatutoryFrame: "PIPEDA / PHIPA",
	},
	"AU": {
		Jurisdiction:   "AU",
		MedicalNumber:  "000",
		CrisisLine:     "13 11 14 (Lifeline Australia)",
		StatutoryFrame: "Australian Privacy Principles (APPs) / TGA",
	},
	"NZ": {
		Jurisdiction:   "NZ",
		MedicalNumber:  "111",
		CrisisLine:     "1737 (Need to Talk?)",
		StatutoryFrame: "NZ Health Information Privacy Code (HIPC)",
	},
}

// ResolveJurisdiction returns FVEY statutory emergency contacts, defaulting to US.
func ResolveJurisdiction(code string) EmergencyContacts {
	upper := strings.ToUpper(strings.TrimSpace(code))
	if c, ok := fveyDirectory[upper]; ok {
		return c
	}
	return fveyDirectory["US"]
}

// EvaluateRedFlags performs deterministic zero-latency red-flag screening before any LLM call.
func EvaluateRedFlags(req TriageRequest) TriageResult {
	lower := strings.ToLower(req.Text)
	var triggers []string

	// 1. BE-FAST Stroke Interception
	strokeKeywords := []string{
		"facial droop", "face drooping", "arm weakness", "slurred speech",
		"sudden numbness", "sudden confusion", "loss of balance", "thunderclap headache",
	}
	for _, kw := range strokeKeywords {
		if strings.Contains(lower, kw) {
			triggers = append(triggers, fmt.Sprintf("BE-FAST_STROKE:%s", kw))
			break
		}
	}

	// 2. Acute Coronary Syndrome (ACS) Interception
	acsKeywords := []string{
		"crushing chest pain", "chest pressure", "radiating to left arm",
		"radiating to jaw", "diaphoresis", "shortness of breath with chest pain",
	}
	for _, kw := range acsKeywords {
		if strings.Contains(lower, kw) {
			triggers = append(triggers, fmt.Sprintf("ACS_CARDIAC:%s", kw))
			break
		}
	}

	// 3. C-SSRS Suicidal Ideation / Self-Harm Crisis Interception
	cssrsKeywords := []string{
		"want to die", "end my life", "suicidal", "kill myself",
		"self-harm", "overdose on purpose", "no reason to live",
	}
	for _, kw := range cssrsKeywords {
		if strings.Contains(lower, kw) {
			triggers = append(triggers, fmt.Sprintf("CSSRS_CRISIS:%s", kw))
			break
		}
	}

	// 4. Deterministic Physiological Vital Thresholds (SpO2 < 90%, HR > 150 or < 40, SBP > 180)
	if req.SpO2Percent > 0 && req.SpO2Percent < 90.0 {
		triggers = append(triggers, fmt.Sprintf("HYPOXIA_SPO2:%.1f%%", req.SpO2Percent))
	}
	if req.HeartRateBpm >= 150.0 || (req.HeartRateBpm > 0 && req.HeartRateBpm < 40.0) {
		triggers = append(triggers, fmt.Sprintf("CRITICAL_HR:%.0fbpm", req.HeartRateBpm))
	}
	if req.SystolicBp >= 180.0 {
		triggers = append(triggers, fmt.Sprintf("HYPERTENSIVE_CRISIS_SBP:%.0fmmHg", req.SystolicBp))
	}

	contacts := ResolveJurisdiction(req.Jurisdiction)
	now := time.Now().UTC().Format(time.RFC3339)
	intercepted := len(triggers) > 0

	acuity := "ROUTINE"
	directive := "No immediate deterministic STAT red flags detected. Proceed with clinician-in-the-loop CDS evaluation."
	if intercepted {
		acuity = "STAT_RED_FLAG"
		directive = fmt.Sprintf(
			"STAT DETERMINISTIC INTERCEPTION: Bypass generative AI synthesis. Initiate immediate emergency escalation (%s / Crisis: %s).",
			contacts.MedicalNumber,
			contacts.CrisisLine,
		)
	}

	sealPayload := fmt.Sprintf("%s|%s|%v|%s", req.PatientID, acuity, triggers, now)
	digest := sha256.Sum256([]byte(sealPayload))

	return TriageResult{
		Intercepted:       intercepted,
		AcuityCategory:    acuity,
		RedFlagTriggers:   triggers,
		ClinicalDirective: directive,
		EmergencyRouting:  contacts,
		Part11Sha256Seal:  hex.EncodeToString(digest[:]),
		EvaluatedAtUTC:    now,
	}
}
