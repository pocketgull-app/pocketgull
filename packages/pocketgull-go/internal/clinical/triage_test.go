// SPDX-License-Identifier: Apache-2.0
package clinical_test

import (
	"strings"
	"testing"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/clinical"
)

func TestEvaluateRedFlags(t *testing.T) {
	t.Parallel()

	t.Run("intercepts BE-FAST stroke and ACS chest pain", func(t *testing.T) {
		t.Parallel()
		res := clinical.EvaluateRedFlags(clinical.TriageRequest{
			PatientID:    "p_stroke_01",
			Text:         "Patient presents with sudden facial droop, slurred speech, and crushing chest pain.",
			Jurisdiction: "UK",
		})
		if !res.Intercepted {
			t.Fatalf("expected deterministic interception for stroke/ACS")
		}
		if res.AcuityCategory != "STAT_RED_FLAG" {
			t.Errorf("expected STAT_RED_FLAG, got %s", res.AcuityCategory)
		}
		if res.EmergencyRouting.Jurisdiction != "UK" || !strings.Contains(res.EmergencyRouting.MedicalNumber, "999") {
			t.Errorf("expected UK 999 routing, got %+v", res.EmergencyRouting)
		}
		if len(res.Part11Sha256Seal) != 64 {
			t.Errorf("expected 64-char SHA-256 seal, got %s", res.Part11Sha256Seal)
		}
	})

	t.Run("intercepts hypoxia SpO2 < 90% and C-SSRS crisis", func(t *testing.T) {
		t.Parallel()
		res := clinical.EvaluateRedFlags(clinical.TriageRequest{
			PatientID:    "p_hypoxia_02",
			Text:         "Feeling hopeless, no reason to live",
			SpO2Percent:  86.5,
			Jurisdiction: "NZ",
		})
		if !res.Intercepted {
			t.Fatalf("expected deterministic interception")
		}
		if len(res.RedFlagTriggers) < 2 {
			t.Errorf("expected both CSSRS and HYPOXIA triggers, got %v", res.RedFlagTriggers)
		}
		if !strings.Contains(res.EmergencyRouting.CrisisLine, "1737") {
			t.Errorf("expected NZ 1737 crisis line, got %s", res.EmergencyRouting.CrisisLine)
		}
	})

	t.Run("passes routine low-acuity consultation", func(t *testing.T) {
		t.Parallel()
		res := clinical.EvaluateRedFlags(clinical.TriageRequest{
			PatientID:    "p_routine_03",
			Text:         "Mild seasonal knee stiffness after morning walk.",
			HeartRateBpm: 68,
			SpO2Percent:  98,
			SystolicBp:   118,
		})
		if res.Intercepted {
			t.Fatalf("expected routine non-intercepted result, got %v", res.RedFlagTriggers)
		}
		if res.AcuityCategory != "ROUTINE" {
			t.Errorf("expected ROUTINE acuity, got %s", res.AcuityCategory)
		}
	})
}
