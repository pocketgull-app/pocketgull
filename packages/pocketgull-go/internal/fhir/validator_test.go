package fhir_test

import (
	"errors"
	"testing"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/fhir"
)

func TestValidateBundle(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		payload   string
		wantErr   bool
		targetErr error
	}{
		{
			name: "valid collection bundle",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"fullUrl": "urn:uuid:patient-1",
						"resource": {
							"resourceType": "Patient",
							"id": "p1"
						}
					}
				]
			}`,
			wantErr: false,
		},
		{
			name: "valid genomic bundle with molecular sequence",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"fullUrl": "urn:uuid:seq-1",
						"resource": {
							"resourceType": "MolecularSequence",
							"id": "seq-1",
							"type": "dna"
						}
					}
				]
			}`,
			wantErr: false,
		},
		{
			name: "invalid molecular sequence type",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"fullUrl": "urn:uuid:seq-invalid",
						"resource": {
							"resourceType": "MolecularSequence",
							"id": "seq-1",
							"type": "protein_invalid"
						}
					}
				]
			}`,
			wantErr:   true,
			targetErr: fhir.ErrInvalidSequenceType,
		},
		{
			name:      "empty payload slice",
			payload:   "",
			wantErr:   true,
			targetErr: nil,
		},
		{
			name:      "malformed bundle json",
			payload:   `{invalid json`,
			wantErr:   true,
			targetErr: nil,
		},
		{
			name: "missing resourceType",
			payload: `{
				"type": "collection"
			}`,
			wantErr:   true,
			targetErr: fhir.ErrInvalidResourceType,
		},
		{
			name: "wrong resourceType",
			payload: `{
				"resourceType": "Observation",
				"type": "collection"
			}`,
			wantErr:   true,
			targetErr: fhir.ErrInvalidResourceType,
		},
		{
			name: "missing bundle type",
			payload: `{
				"resourceType": "Bundle"
			}`,
			wantErr:   true,
			targetErr: fhir.ErrInvalidBundleType,
		},
		{
			name: "entry missing resource payload",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"fullUrl": "urn:uuid:null-1"
					}
				]
			}`,
			wantErr:   true,
			targetErr: nil,
		},
		{
			name: "entry with malformed resource JSON",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"fullUrl": "urn:uuid:malformed-1",
						"resource": 12345
					}
				]
			}`,
			wantErr:   true,
			targetErr: nil,
		},
		{
			name: "entry missing resourceType",
			payload: `{
				"resourceType": "Bundle",
				"type": "collection",
				"entry": [
					{
						"fullUrl": "urn:uuid:empty-1",
						"resource": {
							"id": "missing-type"
						}
					}
				]
			}`,
			wantErr:   true,
			targetErr: fhir.ErrInvalidResourceType,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			bundle, err := fhir.ValidateBundle([]byte(tt.payload))
			if (err != nil) != tt.wantErr {
				t.Fatalf("ValidateBundle() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.targetErr != nil && !errors.Is(err, tt.targetErr) {
				t.Errorf("ValidateBundle() error = %v, expected target error %v", err, tt.targetErr)
			}
			if !tt.wantErr && bundle == nil {
				t.Error("expected non-nil bundle on success")
			}
		})
	}
}

func TestValidateMolecularSequence(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		payload   string
		wantErr   bool
		targetErr error
	}{
		{
			name:    "valid rna sequence",
			payload: `{"resourceType": "MolecularSequence", "type": "rna"}`,
			wantErr: false,
		},
		{
			name:    "valid aa sequence",
			payload: `{"resourceType": "MolecularSequence", "type": "aa"}`,
			wantErr: false,
		},
		{
			name:      "malformed json",
			payload:   `{invalid`,
			wantErr:   true,
			targetErr: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := fhir.ValidateMolecularSequence([]byte(tt.payload))
			if (err != nil) != tt.wantErr {
				t.Fatalf("ValidateMolecularSequence() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestCheckHIPAASafeHarbor(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		payload string
		wantErr bool
	}{
		{
			name:    "de-identified patient bundle",
			payload: `{"resourceType": "Patient", "gender": "female", "birthDate": "1990"}`,
			wantErr: false,
		},
		{
			name:    "contains ssn field",
			payload: `{"resourceType": "Patient", "ssn": "123-45-6789"}`,
			wantErr: true,
		},
		{
			name:    "contains socialsecurity field",
			payload: `{"resourceType": "Patient", "socialsecurity": "1234"}`,
			wantErr: true,
		},
		{
			name:    "contains mrn field",
			payload: `{"resourceType": "Patient", "mrn": "MRN-987"}`,
			wantErr: true,
		},
		{
			name:    "contains medicalrecordnumber field",
			payload: `{"resourceType": "Patient", "medicalrecordnumber": "12345"}`,
			wantErr: true,
		},
		{
			name:    "contains telephone field",
			payload: `{"resourceType": "Patient", "telephone": "555-1234"}`,
			wantErr: true,
		},
		{
			name:    "contains phonenumber field",
			payload: `{"resourceType": "Patient", "phonenumber": "555-4321"}`,
			wantErr: true,
		},
		{
			name:    "contains emailaddress field",
			payload: `{"resourceType": "Patient", "emailaddress": "patient@example.com"}`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := fhir.CheckHIPAASafeHarbor([]byte(tt.payload))
			if (err != nil) != tt.wantErr {
				t.Fatalf("CheckHIPAASafeHarbor() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
