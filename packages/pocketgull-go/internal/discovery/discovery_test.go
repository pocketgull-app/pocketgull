// SPDX-License-Identifier: Apache-2.0
package discovery_test

import (
	"testing"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/discovery"
)

func TestBuildToolRegistryAndProbeCapabilities(t *testing.T) {
	tools := discovery.BuildToolRegistry()
	if len(tools) < 6 {
		t.Fatalf("expected at least 6 canonical tools, got %d", len(tools))
	}

	probeSupported := discovery.ProbeCapabilities([]string{"generate_medical_summary", "compile_glyph_3d"})
	if !probeSupported.Supported || len(probeSupported.MissingPrerequisites) != 0 {
		t.Errorf("expected probe to be supported, got %+v", probeSupported)
	}
	if probeSupported.EstimatedLatencyMs <= 0 {
		t.Errorf("expected positive estimated latency, got %d", probeSupported.EstimatedLatencyMs)
	}

	probeMissing := discovery.ProbeCapabilities([]string{"generate_medical_summary", "non_existent_quantum_scanner"})
	if probeMissing.Supported || len(probeMissing.MissingPrerequisites) != 1 {
		t.Errorf("expected missing prerequisite detection, got %+v", probeMissing)
	}
}

func TestBuildCDSServicesAndDigitalEmblem(t *testing.T) {
	services := discovery.BuildCDSServices()
	if len(services) != 5 {
		t.Errorf("expected 5 HL7 CDS Hooks services, got %d", len(services))
	}

	emblem := discovery.BuildDigitalEmblemManifest()
	if emblem["tallinnManualRule"] == nil {
		t.Errorf("expected tallinnManualRule in digital emblem manifest")
	}

	smart := discovery.BuildSmartConfiguration("https://pocketgull.app")
	if smart["authorization_endpoint"] != "https://pocketgull.app/api/fitbit/auth" {
		t.Errorf("unexpected authorization_endpoint: %v", smart["authorization_endpoint"])
	}
}
