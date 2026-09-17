import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  UsaBanner,
  UsaHeader,
  UsaStepIndicator,
  VaNexusOpinionCard,
  UsaSummaryBox,
  UsaAlert,
  UsaFhirMatrix,
  FederalWorkstation,
} from '../src/index.js';

describe('USWDS React CDS Companion Suite', () => {
  it('should render UsaBanner in community-partner mode with 18 U.S.C. § 701 demarcation', () => {
    const html = renderToString(React.createElement(UsaBanner, { mode: 'community-partner' }));
    expect(html).toContain('Independent Healthcare Practice');
    expect(html).toContain('18 U.S.C. § 701 Demarcation');
    expect(html).toContain('usa-banner');
  });

  it('should render UsaBanner in official-gov mode with .gov authority text', () => {
    const html = renderToString(React.createElement(UsaBanner, { mode: 'official-gov' }));
    expect(html).toContain('official website of the United States government');
    expect(html).toContain("Here’s how you know");
  });

  it('should render UsaHeader with 988 Veterans Crisis Line reminder', () => {
    const html = renderToString(React.createElement(UsaHeader, { title: 'VA Boston CDS' }));
    expect(html).toContain('VA Boston CDS');
    expect(html).toContain('988 Lifeline');
    expect(html).toContain('US Domestic Geofence');
  });

  it('should render UsaStepIndicator with ARIA current step attribute', () => {
    const steps = [
      { id: 1, label: 'Chief Complaint', status: 'complete' as const },
      { id: 2, label: 'Onset Date', status: 'current' as const },
      { id: 3, label: 'Attestation', status: 'incomplete' as const },
    ];
    const html = renderToString(
      React.createElement(UsaStepIndicator, { currentStep: 2, totalSteps: 3, steps })
    );
    expect(html).toContain('Step 2 of 3');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('usa-step-indicator');
  });

  it('should render VaNexusOpinionCard with 38 CFR § 4.87 evidentiary standard', () => {
    const opinion = {
      condition: 'Constrictive Bronchiolitis',
      serviceConnectionLikelihood: 'At least as likely as not (>= 50% probability)',
      statutoryStandard: '38 CFR § 4.87',
      objectiveEvidence: ['HRCT showing air trapping', 'DD-214 burn pit perimeter'],
      rationale: 'Etiologically linked to toxic inhalation.',
      sha256Attestation: 'a1b2c3d4e5f6',
    };
    const html = renderToString(React.createElement(VaNexusOpinionCard, { opinion }));
    expect(html).toContain('38 CFR § 4.87');
    expect(html).toContain('At least as likely as not');
    expect(html).toContain('HRCT showing air trapping');
    expect(html).toContain('SHA256:a1b2c3d4e5f6');
  });

  it('should render UsaAlert with accessibility role', () => {
    const html = renderToString(
      React.createElement(UsaAlert, { type: 'error', heading: 'ISMP Prescribing Warning' }, 'Dosage check')
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain('ISMP Prescribing Warning');
  });

  it('should render UsaFhirMatrix with US Core profiles and structured data', () => {
    const rows = [
      {
        resourceType: 'Patient',
        profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
        element: 'identifier[mrn]',
        value: 'VA-77042',
        codingSystem: 'urn:oid:2.16.840.1.113883.4.349',
        code: 'MRN',
      },
    ];
    const html = renderToString(React.createElement(UsaFhirMatrix, { rows }));
    expect(html).toContain('FHIR US Core R4 Interoperability Matrix');
    expect(html).toContain('us-core-patient');
    expect(html).toContain('VA-77042');
  });

  it('should render FederalWorkstation master view with print-isolated stationery and 3-Act arc', () => {
    const html = renderToString(React.createElement(FederalWorkstation, { initialMode: 'community-partner' }));
    expect(html).toContain('print-clinical-letterhead');
    expect(html).toContain('VA Community Care Network');
    expect(html).toContain('Act 1: Past Hurdles');
    expect(html).toContain("Act 2: Today's Baseline");
    expect(html).toContain('Act 3: 90-Day Vitality Roadmap');
    expect(html).toContain('Attending Clinician Signature');
    expect(html).toContain('Lisinopril 10 mg daily');
  });
});
