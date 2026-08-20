// Package fhir provides high-speed validation and HIPAA de-identification checks for FHIR R4 Bundles.
package fhir

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

// ErrInvalidResourceType indicates a resource is missing or has an incorrect resourceType.
var ErrInvalidResourceType = errors.New("invalid or missing resourceType")

// ErrInvalidBundleType indicates the Bundle is missing an accepted type (e.g. collection, transaction, document).
var ErrInvalidBundleType = errors.New("invalid bundle type")

// ErrInvalidSequenceType indicates a MolecularSequence has an invalid type.
var ErrInvalidSequenceType = errors.New("invalid molecular sequence type: must be dna, rna, or aa")

// ErrHIPAAIdentifierFound indicates a forbidden direct patient identifier was detected.
var ErrHIPAAIdentifierFound = errors.New("forbidden direct HIPAA identifier detected in de-identified payload")

// Bundle represents a FHIR R4 Bundle container.
type Bundle struct {
	ResourceType string        `json:"resourceType"`
	Type         string        `json:"type"`
	Total        int           `json:"total,omitempty"`
	Entry        []BundleEntry `json:"entry,omitempty"`
}

// BundleEntry represents an individual entry inside a FHIR R4 Bundle.
type BundleEntry struct {
	FullURL  string          `json:"fullUrl,omitempty"`
	Resource json.RawMessage `json:"resource"`
}

// BaseResource captures the resource type and basic ID for introspection.
type BaseResource struct {
	ResourceType string `json:"resourceType"`
	ID           string `json:"id,omitempty"`
}

// MolecularSequence captures FHIR R4 genomic sequence structure.
type MolecularSequence struct {
	ResourceType     string `json:"resourceType"`
	ID               string `json:"id,omitempty"`
	Type             string `json:"type"`
	CoordinateSystem int    `json:"coordinateSystem"`
}

// ValidateBundle validates that the JSON payload is a valid FHIR R4 Bundle.
func ValidateBundle(data []byte) (*Bundle, error) {
	if len(data) == 0 {
		return nil, errors.New("empty payload")
	}

	var bundle Bundle
	if err := json.Unmarshal(data, &bundle); err != nil {
		return nil, fmt.Errorf("failed to parse FHIR bundle: %w", err)
	}

	if bundle.ResourceType != "Bundle" {
		return nil, fmt.Errorf("%w: expected 'Bundle', got '%s'", ErrInvalidResourceType, bundle.ResourceType)
	}

	if bundle.Type == "" {
		return nil, ErrInvalidBundleType
	}

	// Validate each entry has a valid resourceType
	for i, entry := range bundle.Entry {
		if len(entry.Resource) == 0 {
			return nil, fmt.Errorf("entry[%d] missing resource payload", i)
		}
		var base BaseResource
		if err := json.Unmarshal(entry.Resource, &base); err != nil {
			return nil, fmt.Errorf("entry[%d] invalid resource JSON: %w", i, err)
		}
		if base.ResourceType == "" {
			return nil, fmt.Errorf("entry[%d]: %w", i, ErrInvalidResourceType)
		}

		if base.ResourceType == "MolecularSequence" {
			if err := ValidateMolecularSequence(entry.Resource); err != nil {
				return nil, fmt.Errorf("entry[%d] %w", i, err)
			}
		}
	}

	return &bundle, nil
}

// ValidateMolecularSequence validates standard FHIR R4 MolecularSequence attributes.
func ValidateMolecularSequence(data []byte) error {
	var seq MolecularSequence
	if err := json.Unmarshal(data, &seq); err != nil {
		return fmt.Errorf("failed to parse MolecularSequence: %w", err)
	}

	t := strings.ToLower(seq.Type)
	if t != "dna" && t != "rna" && t != "aa" {
		return ErrInvalidSequenceType
	}

	return nil
}

// CheckHIPAASafeHarbor performs lexical checks to ensure direct identifiers are de-identified.
func CheckHIPAASafeHarbor(data []byte) error {
	payloadLower := strings.ToLower(string(data))

	forbiddenKeywords := []string{
		`"ssn"`,
		`"socialsecurity"`,
		`"mrn"`,
		`"medicalrecordnumber"`,
		`"telephone"`,
		`"phonenumber"`,
		`"emailaddress"`,
	}

	for _, kw := range forbiddenKeywords {
		if strings.Contains(payloadLower, kw) {
			return fmt.Errorf("%w: found %s", ErrHIPAAIdentifierFound, kw)
		}
	}

	return nil
}
