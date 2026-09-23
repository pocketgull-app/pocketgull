// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderCardiometabolicCaseStudyHtml } from './cardiometabolic-case-study';

describe('Cardiometabolic & Glycemic Radar Case Study (#03)', () => {
  it('renders a valid HTML5 document with complete OpenGraph metadata and title', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Cardiometabolic &amp; Glycemic Radar — PocketGull Case Study #03</title>');
    expect(html).toContain('https://pocketgull.com/case-studies/cardiometabolic-radar');
    expect(html).toContain('COHORT ARCHETYPE SUBJ-7A2F');
  });

  it('renders the 3-Act Trajectory (Past Trail, Active Telemetry, 30-Day Milestone)', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html).toContain('ACT I: WHERE YOU\'VE BEEN');
    expect(html).toContain('ACT II: WHERE YOU STAND TODAY');
    expect(html).toContain('ACT III: WHERE YOU\'RE GOING');
    expect(html).toContain('Creeping Postprandial Somnolence');
    expect(html).toContain('Excursion Velocity &amp; Vascular Tone');
    expect(html).toContain('Sub-140 mg/dL Excursion &amp; Energy Stability');
  });

  it('renders the interactive Glycemic Radar with simulation controls', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html).toContain('id="peakValue"');
    expect(html).toContain('id="recoveryValue"');
    expect(html).toContain('id="vascularValue"');
    expect(html).toContain('id="clearanceValue"');
    expect(html).toContain('id="toggleSoleus"');
    expect(html).toContain('id="toggleChronobiology"');
    expect(html).toContain('id="toggleAmpk"');
    expect(html).toContain('updateMetabolicSimulation()');
  });

  it('renders the 3B Innovation Section (Breaking, Bending, Blending)', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html).toContain('The 3B Innovation Architecture: Breaking, Bending &amp; Blending');
    expect(html).toContain('Dismantling the Escalation Spiral');
    expect(html).toContain('Modulating Excursion Curves');
    expect(html).toContain('Chronobiology + WHO Generics');
    expect(html).toContain('Breaks the Insulin Ladder');
    expect(html).toContain('Bends the Recovery Slope');
  });

  it('renders 4-Tier Stepped Care Recommendations with respectful pricing benchmarks', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html).toContain('TIER 1: ZERO-COST FOUNDATION');
    expect(html).toContain('TIER 2: WHO ESSENTIAL MEDICINES');
    expect(html).toContain('TIER 3: TARGETED ORTHOMOLECULAR ADJUNCTS');
    expect(html).toContain('TIER 4: CLINICAL DEMARCATION &amp; RED FLAGS');

    // Respectful pricing benchmarks
    expect(html).toContain('Standard Retail Benchmark');
    expect(html).toContain('Estimated Out-of-Pocket');
  });

  it('renders 1-Click HL7 FHIR R4 Bundle Exporter', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html).toContain('downloadCardiometabolicFhirBundle()');
    expect(html).toContain('pocketgull-cardiometabolic-radar-careplan');
    expect(html).toContain('cgm-peak-excursion');
  });

  it('strictly enforces the Quiet Workshop voice with zero fatalistic or catastrophic vocabulary', () => {
    const html = renderCardiometabolicCaseStudyHtml();
    expect(html.toLowerCase()).not.toContain('axonal death');
    expect(html.toLowerCase()).not.toContain('inevitable decline');
    expect(html.toLowerCase()).not.toContain('hopeless');
    expect(html.toLowerCase()).not.toContain('helplessness');
    expect(html.toLowerCase()).not.toContain('inevitable wheelchair');
  });
});
