// SPDX-License-Identifier: Apache-2.0
// Package discovery implements the Agentic Discovery, WebMCP Tool Registry,
// HL7 CDS Hooks, SMART on FHIR STU2, and Tallinn Manual Rule 131 Digital Emblem
// manifests for the Pocket-Gull Go server.
package discovery

import (
	"fmt"
	"math"
	"strings"
	"time"
)

// ToolDefinition describes a canonical WebMCP or server-side clinical tool.
type ToolDefinition struct {
	Name             string         `json:"name"`
	Category         string         `json:"category"`
	Description      string         `json:"description"`
	InputSchema      map[string]any `json:"inputSchema"`
	ExecutionTimeout int            `json:"executionTimeout"`
}

// CapabilitiesProbeRequest models POST /v1/discovery/capabilities/probe.
type CapabilitiesProbeRequest struct {
	RequiredActions []string `json:"required_actions"`
}

// CapabilitiesProbeResponse models the probe evaluation response.
type CapabilitiesProbeResponse struct {
	Supported            bool     `json:"supported"`
	MissingPrerequisites []string `json:"missing_prerequisites"`
	AvailableActions     []string `json:"available_actions"`
	EstimatedLatencyMs   int      `json:"estimated_latency_ms"`
}

// CDSServiceDefinition models an HL7 SMART-on-FHIR CDS Hooks service entry.
type CDSServiceDefinition struct {
	ID          string            `json:"id"`
	Hook        string            `json:"hook"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Prefetch    map[string]string `json:"prefetch,omitempty"`
}

// BuildToolRegistry returns the canonical WebMCP + server clinical tool definitions.
func BuildToolRegistry() []ToolDefinition {
	return []ToolDefinition{
		{
			Name:             "generate_medical_summary",
			Category:         "clinical_intelligence",
			Description:      "Generates a medical summary for the current patient based on clinical notes and current patient data.",
			InputSchema:      map[string]any{"type": "object", "properties": map[string]any{}},
			ExecutionTimeout: 30000,
		},
		{
			Name:        "translate_clinical_text",
			Category:    "clinical_intelligence",
			Description: "Translates clinical text to a specific reading level (simplified, child, dyslexia).",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"text":        map[string]any{"type": "string", "description": "The clinical text to translate."},
					"targetLevel": map[string]any{"type": "string", "enum": []string{"simplified", "child", "dyslexia"}},
				},
				"required": []string{"text", "targetLevel"},
			},
			ExecutionTimeout: 15000,
		},
		{
			Name:             "get_current_patient_data",
			Category:         "patient_state",
			Description:      "Retrieves the current patient data context being viewed in the application.",
			InputSchema:      map[string]any{"type": "object", "properties": map[string]any{}},
			ExecutionTimeout: 1000,
		},
		{
			Name:        "navigate_to_body_part",
			Category:    "ui_navigation",
			Description: "Navigates the UI to focus on a specific body part and opens the analysis tab.",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"partId": map[string]any{"type": "string", "description": "The ID of the body part (e.g., head, right_knee)."},
				},
				"required": []string{"partId"},
			},
			ExecutionTimeout: 2000,
		},
		{
			Name:        "inject_clinical_note",
			Category:    "clinical_intelligence",
			Description: "Injects structured clinical data (a note) for a specific body part.",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"partId":      map[string]any{"type": "string"},
					"painLevel":   map[string]any{"type": "number"},
					"description": map[string]any{"type": "string"},
				},
				"required": []string{"partId", "painLevel", "description"},
			},
			ExecutionTimeout: 2000,
		},
		{
			Name:             "export_patient_csv_telemetry",
			Category:         "export",
			Description:      "Exports active patient vital signs, biometric sensors, and clinical assessment scores as RFC 4180 CSV.",
			InputSchema:      map[string]any{"type": "object", "properties": map[string]any{}},
			ExecutionTimeout: 3000,
		},
		{
			Name:             "compile_glyph_3d",
			Category:         "anatomy_3d",
			Description:      "Compiles 1000 UPM direct-curves medical ligatures into flat-array WebGL2/Three.js 3D meshes.",
			InputSchema:      map[string]any{"type": "object", "properties": map[string]any{"symbol": map[string]any{"type": "string"}}},
			ExecutionTimeout: 1000,
		},
		{
			Name:             "evaluate_clinical_triage",
			Category:         "clinical_safety",
			Description:      "Executes deterministic BE-FAST, ACS, SpO2 < 90%, and C-SSRS red-flag interception with Five Eyes statutory routing.",
			InputSchema:      map[string]any{"type": "object", "properties": map[string]any{"text": map[string]any{"type": "string"}}},
			ExecutionTimeout: 500,
		},
	}
}

// ProbeCapabilities evaluates whether all requested agentic actions are supported by the registry.
func ProbeCapabilities(required []string) CapabilitiesProbeResponse {
	registry := BuildToolRegistry()
	byName := make(map[string]ToolDefinition, len(registry))
	for _, t := range registry {
		byName[t.Name] = t
	}

	available := make([]string, 0, len(required))
	missing := make([]string, 0)
	latencySum := 0.0

	for _, action := range required {
		trimmed := strings.TrimSpace(action)
		if trimmed == "" {
			continue
		}
		if tool, ok := byName[trimmed]; ok {
			available = append(available, trimmed)
			timeout := tool.ExecutionTimeout
			if timeout <= 0 {
				timeout = 5000
			}
			latencySum += float64(timeout) / 2.0
		} else {
			missing = append(missing, trimmed)
		}
	}

	return CapabilitiesProbeResponse{
		Supported:            len(missing) == 0,
		MissingPrerequisites: missing,
		AvailableActions:     available,
		EstimatedLatencyMs:   int(math.Round(latencySum)),
	}
}

// BuildDigitalEmblemManifest returns the Geneva Conventions / Tallinn Manual Rule 131 Red Crystal manifest.
func BuildDigitalEmblemManifest() map[string]any {
	return map[string]any{
		"@context":           "https://schema.org",
		"@type":              "MedicalOrganization",
		"emblem":             "Red Crystal (Protocol III Additional to the Geneva Conventions)",
		"tallinnManualRule":  "Rule 131 — Medical Units and Transports in Cyberspace",
		"protectionStatus":   "Protected Medical Sanctuary — Do Not Attack or Disrupt",
		"verificationHeader": "X-Digital-Emblem: Red Crystal (Tallinn Manual Rule 131 Medical Sanctuary)",
		"steward":            "dpo@pocketgull.app",
		"issuedAt":           time.Now().UTC().Format(time.RFC3339),
	}
}

// BuildCDSServices returns the 5 canonical HL7 CDS Hooks services.
func BuildCDSServices() []CDSServiceDefinition {
	return []CDSServiceDefinition{
		{
			ID:          "pocketgull-rx-phenoconversion",
			Hook:        "medication-prescribe",
			Title:       "Pocket-Gull In Vivo Drug-Botanical Phenoconversion & Posology Guard",
			Description: "Evaluates dynamic CYP enzyme blockade and phenotypic conversion caused by concurrent botanicals (Goldenseal, Berberine) and pharmaceuticals.",
			Prefetch: map[string]string{
				"patient":     "Patient/{{context.patientId}}",
				"medications": "MedicationRequest?patient={{context.patientId}}&status=active",
			},
		},
		{
			ID:          "pocketgull-anticholinergic-delirium",
			Hook:        "medication-prescribe",
			Title:       "Pocket-Gull Anticholinergic Cognitive Burden & Delirium Risk",
			Description: "Enforces AGS Beers Criteria for elder patients (65+y), quantifying 90-day fall and delirium surge under cumulative anticholinergic burden.",
			Prefetch: map[string]string{
				"patient": "Patient/{{context.patientId}}",
			},
		},
		{
			ID:          "pocketgull-pivot-alert",
			Hook:        "patient-view",
			Title:       "Pocket-Gull Active Pivot & Living Telemetry Monitor",
			Description: "Screens continuous vital trends for acute biophysical breaches (hypoglycemia nadir, Uhthoff thermal conduction block, gut-oral endotoxemia).",
			Prefetch: map[string]string{
				"patient": "Patient/{{context.patientId}}",
			},
		},
		{
			ID:          "pocketgull-cardiometabolic-radar",
			Hook:        "patient-view",
			Title:       "Pocket-Gull Cardiometabolic Glycemic Velocity (dG/dt) & Pacing Radar",
			Description: "Monitors real-time interstitial glucose velocity (LOINC 99504-3) to preempt acute excursions via non-insulin GLUT4 soleus activation.",
			Prefetch: map[string]string{
				"patient":      "Patient/{{context.patientId}}",
				"observations": "Observation?patient={{context.patientId}}&code=99504-3&_sort=-date&_count=5",
				"medications":  "MedicationRequest?patient={{context.patientId}}&status=active",
			},
		},
		{
			ID:          "pocketgull-chrono-nutrition-guard",
			Hook:        "order-select",
			Title:       "Pocket-Gull Chrono-Nutrition & Drug-Nutrient Interceptor Guard",
			Description: "Intercepts acute food-drug and salt-substitute interactions during CPOE order entry (CYP3A4 grapefruit surge and ACEi hyperkalemia).",
			Prefetch: map[string]string{
				"patient":     "Patient/{{context.patientId}}",
				"medications": "MedicationRequest?patient={{context.patientId}}&status=active",
				"draftOrders": "MedicationRequest?status=draft",
			},
		},
	}
}

// BuildSmartConfiguration returns the SMART on FHIR STU2 /.well-known/smart-configuration payload.
func BuildSmartConfiguration(baseURL string) map[string]any {
	if baseURL == "" {
		baseURL = "https://pocketgull.app"
	}
	return map[string]any{
		"authorization_endpoint":                fmt.Sprintf("%s/api/fitbit/auth", baseURL),
		"token_endpoint":                        fmt.Sprintf("%s/api/fitbit/callback", baseURL),
		"token_endpoint_auth_methods_supported": []string{"client_secret_basic", "client_secret_post", "private_key_jwt"},
		"registration_endpoint":                 fmt.Sprintf("%s/api/smart/register", baseURL),
		"scopes_supported": []string{
			"openid", "profile", "fhirUser", "launch", "launch/patient",
			"patient/*.read", "patient/*.rs", "user/*.read", "offline_access",
		},
		"response_types_supported":         []string{"code"},
		"management_endpoint":              fmt.Sprintf("%s/api/smart/manage", baseURL),
		"introspection_endpoint":           fmt.Sprintf("%s/api/smart/introspect", baseURL),
		"revocation_endpoint":              fmt.Sprintf("%s/api/fitbit/revoke", baseURL),
		"code_challenge_methods_supported": []string{"S256"},
		"capabilities": []string{
			"launch-ehr", "launch-standalone", "client-public",
			"client-confidential-symmetric", "client-confidential-asymmetric",
			"context-ehr-patient", "context-standalone-patient",
			"permission-offline", "permission-patient", "permission-user",
		},
	}
}
