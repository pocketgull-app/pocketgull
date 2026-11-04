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

func TestGlyph3DAndClinicalTriageEndpoints(t *testing.T) {
	handler := main.SetupRoutes("v1.0.0-test")

	t.Run("POST /api/v1/glyph3d/compile extrudes 1000 UPM [heart] mesh", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/glyph3d/compile", bytes.NewBufferString(`{"symbol":"[heart]","depth":0.25}`))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 OK, got %d: %s", rec.Code, rec.Body.String())
		}
		if !strings.Contains(rec.Body.String(), `"partId":101`) {
			t.Errorf("expected partId 101 in response, got %s", rec.Body.String())
		}
	})

	t.Run("POST /api/v1/clinical/triage intercepts BE-FAST stroke & attaches Observatory 125 headers", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/clinical/triage", bytes.NewBufferString(`{"patientId":"p1","text":"sudden facial droop and slurred speech","jurisdiction":"US"}`))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 OK, got %d", rec.Code)
		}
		if !strings.Contains(rec.Body.String(), `"intercepted":true`) {
			t.Errorf("expected deterministic interception, got %s", rec.Body.String())
		}
		if rec.Header().Get("Cross-Origin-Opener-Policy") != "same-origin" {
			t.Errorf("expected Observatory 125 COOP header")
		}
	})

	t.Run("OFAC sanctioned country returns HTTP 451 and scanner probe returns HTTP 403", func(t *testing.T) {
		reqOFAC := httptest.NewRequest(http.MethodGet, "/healthz", nil)
		reqOFAC.Header.Set("X-Country-Code", "IR")
		recOFAC := httptest.NewRecorder()
		handler.ServeHTTP(recOFAC, reqOFAC)
		if recOFAC.Code != http.StatusUnavailableForLegalReasons {
			t.Errorf("expected HTTP 451 for IR, got %d", recOFAC.Code)
		}

		reqProbe := httptest.NewRequest(http.MethodGet, "/.git/config", nil)
		reqProbe.RemoteAddr = "203.0.113.99:12345"
		recProbe := httptest.NewRecorder()
		handler.ServeHTTP(recProbe, reqProbe)
		if recProbe.Code != http.StatusForbidden {
			t.Errorf("expected HTTP 403 for /.git/config probe, got %d", recProbe.Code)
		}
	})
}
