// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderDarwinCaseStudyHtml } from './darwin-case-study';

describe('Charles Darwin & The Vagal Enigma Case Study (#05)', () => {
  it('renders a valid HTML5 document with complete OpenGraph metadata and title', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Charles Darwin &amp; The Vagal Enigma — PocketGull Case Study #05</title>');
    expect(html).toContain('https://pocketgull.com/case-studies/darwin-vagal-radar');
    expect(html).toContain('COHORT ARCHETYPE SUBJ-DARWIN-1882');
  });

  it('renders the 3-Act Trajectory (HMS Beagle Baseline, Autonomic Mapping, Down House Resolution)', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html).toContain('ACT I: WHERE YOU\'VE BEEN');
    expect(html).toContain('ACT II: WHERE YOU STAND TODAY');
    expect(html).toContain('ACT III: WHERE YOU\'RE GOING');
    expect(html).toContain('Beagle Sickness &amp; Mendoza Exposure');
    expect(html).toContain('Postural Dysautonomia &amp; Baroreflex Decay');
    expect(html).toContain('The Sandwalk &amp; Down House Sanctuary');
  });

  it('renders the interactive Autonomic Tone & Vagal Baroreflex Radar', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html).toContain('id="orthoValue"');
    expect(html).toContain('id="vagalValue"');
    expect(html).toContain('id="gastricValue"');
    expect(html).toContain('id="reserveValue"');
    expect(html).toContain('id="toggleHydro"');
    expect(html).toContain('id="toggleSandwalk"');
    expect(html).toContain('updateDarwinSimulation()');
  });

  it('renders the 3B Innovation Section (Breaking, Bending, Blending)', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html).toContain('The 3B Innovation Architecture: Breaking, Bending &amp; Blending');
    expect(html).toContain('Dismantling the Psychogenic Stigma');
    expect(html).toContain('Modulating Autonomic Setpoints');
    expect(html).toContain('Victorian Hydropathy + Neuro-Immunology');
    expect(html).toContain('Breaks the "Hypochondriac" Label');
    expect(html).toContain('Bends the Orthostatic Reflex');
  });

  it('renders 4-Tier Stepped Care Recommendations with respectful pricing benchmarks', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html).toContain('TIER 1: ZERO-COST FOUNDATION');
    expect(html).toContain('TIER 2: WHO ESSENTIAL MEDICINES');
    expect(html).toContain('TIER 3: TARGETED ORTHOMOLECULAR ADJUNCTS');
    expect(html).toContain('TIER 4: CLINICAL DEMARCATION &amp; RED FLAGS');

    // Respectful pricing benchmarks
    expect(html).toContain('Standard Retail Benchmark');
    expect(html).toContain('Estimated Out-of-Pocket');
  });

  it('renders 1-Click HL7 FHIR R4 Bundle Exporter', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html).toContain('downloadDarwinFhirBundle()');
    expect(html).toContain('pocketgull-darwin-vagal-careplan');
    expect(html).toContain('autonomic-dysregulation-condition');
  });

  it('strictly enforces the Quiet Workshop voice with zero fatalistic or catastrophic vocabulary', () => {
    const html = renderDarwinCaseStudyHtml();
    expect(html.toLowerCase()).not.toContain('axonal death');
    expect(html.toLowerCase()).not.toContain('inevitable decline');
    expect(html.toLowerCase()).not.toContain('hopeless');
    expect(html.toLowerCase()).not.toContain('helplessness');
    expect(html.toLowerCase()).not.toContain('inevitable wheelchair');
  });
});
