package main_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	main "github.com/pocketgull-app/pocketgull/packages/pocketgull-go/cmd/server"
)

func TestHealthzEndpoint(t *testing.T) {
	handler := main.SetupRoutes("v1.0.0-test")

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	if !strings.Contains(rec.Body.String(), "healthy") {
		t.Errorf("expected response to contain 'healthy', got %s", rec.Body.String())
	}
}

func TestFhirValidateEndpoint(t *testing.T) {
	handler := main.SetupRoutes("v1.0.0-test")

	tests := []struct {
		name       string
		payload    string
		wantStatus int
		wantValid  bool
	}{
		{
			name: "valid bundle",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"resource": {
							"resourceType": "Patient",
							"id": "p1"
						}
					}
				]
			}`,
			wantStatus: http.StatusOK,
			wantValid:  true,
		},
		{
			name:       "hipaa identifier present",
			payload:    `{"resourceType": "Patient", "ssn": "123-45-6789"}`,
			wantStatus: http.StatusUnprocessableEntity,
			wantValid:  false,
		},
		{
			name:       "invalid bundle structure",
			payload:    `{"resourceType": "Observation"}`,
			wantStatus: http.StatusBadRequest,
			wantValid:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/fhir/validate", bytes.NewBufferString(tt.payload))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			handler.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("expected status %d, got %d. Body: %s", tt.wantStatus, rec.Code, rec.Body.String())
			}
		})
	}
}

func TestTelemetryEvaluateEndpoint(t *testing.T) {
	handler := main.SetupRoutes("v1.0.0-test")

	tests := []struct {
		name       string
		payload    string
		wantStatus int
	}{
		{
			name: "valid telemetry request",
			payload: `{
				"samples": [70.0, 72.0, 71.5, 69.0],
				"populationMean": 70.0,
				"alpha": 0.05
			}`,
			wantStatus: http.StatusOK,
		},
		{
			name: "default alpha telemetry request",
			payload: `{
				"samples": [70.0, 72.0],
				"populationMean": 70.0
			}`,
			wantStatus: http.StatusOK,
		},
		{
			name:       "empty samples error",
			payload:    `{"samples": [], "populationMean": 70.0}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "malformed json",
			payload:    `{not valid json`,
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/telemetry/evaluate", bytes.NewBufferString(tt.payload))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			handler.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("expected status %d, got %d. Body: %s", tt.wantStatus, rec.Code, rec.Body.String())
			}
		})
	}
}
