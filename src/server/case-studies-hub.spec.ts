// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderCaseStudiesHubHtml } from './case-studies-hub';

describe('Universal Clinical Case Studies Hub (/case-studies)', () => {
  it('renders a valid HTML5 document with complete OpenGraph metadata and title', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Clinical Case Studies &amp; Research Directory — PocketGull</title>');
    expect(html).toContain('https://pocketgull.com/case-studies');
    expect(html).toContain('3B INNOVATION ARCHITECTURE');
  });

  it('renders HIPAA § 164.514 Safe Harbor de-identification and differential privacy ribbons', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html).toContain('HIPAA §164.514 SAFE HARBOR');
    expect(html).toContain('18 PHI Elements Stripped');
    expect(html).toContain('k &ge; 8 Anonymity');
    expect(html).toContain('Laplace DP Noise (&epsilon; = 1.0)');
    expect(html).toContain('Age-Capped 90+');
    expect(html).toContain('Zero Cloud Egress');
  });

  it('renders interactive category filters and all 7 case study cards', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html).toContain("filterCases('all', this)");
    expect(html).toContain("filterCases('neurology', this)");
    expect(html).toContain("filterCases('cardiometabolic', this)");
    expect(html).toContain("filterCases('autonomic', this)");
    expect(html).toContain("filterCases('infectious', this)");
    expect(html).toContain("filterCases('luminaries', this)");

    // Cases
    expect(html).toContain('Nantucket Island Tick-Borne Co-Infection Radar');
    expect(html).toContain('MS Neuro-Axonal Sanctuary &amp; Biophysical Radar');
    expect(html).toContain('Cardiometabolic &amp; Glycemic Excursion Radar');
    expect(html).toContain('Charles Darwin &amp; The Post-Beagle Vagal Enigma');
    expect(html).toContain('Marie Curie: Radium Exposure &amp; Marrow Hypoplasia');
    expect(html).toContain('Post-Viral Autonomic Fatigue &amp; PEM Boundary Radar');
    expect(html).toContain('Frida Kahlo: Severe Pelvic Trauma &amp; Central Sensitization');
  });

  it('renders the 3B Innovation tags (BREAKING, BENDING, BLENDING) on case cards', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html).toContain('class="b3-tag breaking"');
    expect(html).toContain('class="b3-tag bending"');
    expect(html).toContain('class="b3-tag blending"');
    expect(html).toContain('BREAKING');
    expect(html).toContain('BENDING');
    expect(html).toContain('BLENDING');
  });

  it('renders the 1-Click Master FHIR R4 Cohort Exporter and single case exporters', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html).toContain('downloadMasterFhirCohort()');
    expect(html).toContain('exportSingleCaseFhir');
    expect(html).toContain('pocketgull-master-deidentified-cohort-fhir-r4');
  });

  it('strictly enforces the Quiet Workshop voice with zero fatalistic or catastrophic vocabulary', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html.toLowerCase()).not.toContain('axonal death');
    expect(html.toLowerCase()).not.toContain('inevitable decline');
    expect(html.toLowerCase()).not.toContain('hopeless');
    expect(html.toLowerCase()).not.toContain('helplessness');
    expect(html.toLowerCase()).not.toContain('inevitable wheelchair');
  });

  it('renders the 21st Century Cures Act Safe Harbor and Nominative Trademark Disclaimers in the footer', () => {
    const html = renderCaseStudiesHubHtml();
    expect(html).toContain('Statutory Interoperability Safe Harbor (21st Century Cures Act');
    expect(html).toContain('45 CFR Part 171');
    expect(html).toContain('Nominative Fair Use &amp; Trademark Disclaimers');
    expect(html).toContain('Epic Systems Corporation');
    expect(html).toContain('Microsoft Corporation');
    expect(html).toContain('Google LLC');
    expect(html).toContain('Amazon.com, Inc');
    expect(html).toContain('Health Level Seven International');
  });
});

