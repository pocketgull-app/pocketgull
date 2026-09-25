// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderOknCaseStudyHtml } from './okn-case-study';

describe('NSF OKN, NIH & WHO Global Health Grounding Radar Case Study (#08)', () => {
  it('renders a valid HTML5 document with complete OpenGraph metadata and title', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>NSF OKN, NIH &amp; WHO Global Health Grounding Radar — PocketGull Case Study #08</title>');
    expect(html).toContain('https://pocketgull.com/case-studies/okn-grounding');
    expect(html).toContain('NSF OPEN KNOWLEDGE NETWORK');
    expect(html).toContain('WHO DUAL INTEGRATION');
  });

  it('renders HIPAA § 164.514 Safe Harbor and FDA 21 CFR Part 11 SHA-256 attestation ribbon', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('FDA 21 CFR Part 11 SHA-256');
    expect(html).toContain('NIST SP 800-90A CSPRNG');
    expect(html).toContain('k &ge; 8 Anonymity');
    expect(html).toContain('Laplace DP (&epsilon; = 1.0)');
    expect(html).toContain('Zero Cloud Egress');
    expect(html).toContain('Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('renders the 3-Act Trajectory (Agency Silos, Multi-Hop Graph Grounding, Salutogenic Convergence)', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('ACT I: WHERE MEDICINE HAS BEEN');
    expect(html).toContain('ACT II: WHERE WE STAND TODAY');
    expect(html).toContain('ACT III: WHERE WE\'RE GOING');
    expect(html).toContain('Disconnected Agency Silos &amp; Hallucinations');
    expect(html).toContain('Multi-Hop Federal Knowledge Graph Traversal');
    expect(html).toContain('Universal Salutogenesis &amp; Part 11 Seals');
  });

  it('renders the interactive Federal Knowledge Graph Traversal Simulator and controls', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('id="checkNsf"');
    expect(html).toContain('id="checkNih"');
    expect(html).toContain('id="checkUsgs"');
    expect(html).toContain('id="checkEpa"');
    expect(html).toContain('id="checkWho"');
    expect(html).toContain('id="hopsValue"');
    expect(html).toContain('id="bfValue"');
    expect(html).toContain('id="pValue"');
    expect(html).toContain('id="halValue"');
    expect(html).toContain('updateOknSimulation()');
  });

  it('renders the 3B Innovation Section (Breaking, Bending, Blending)', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('The 3B Innovation Architecture: Breaking, Bending &amp; Blending');
    expect(html).toContain('Dismantling Single-Agency Isolation');
    expect(html).toContain('Modulating Epistemic Confidence Curves');
    expect(html).toContain('Synthesizing Federal Graphs &amp; Global Health');
    expect(html).toContain('class="b3-pill breaking"');
    expect(html).toContain('class="b3-pill bending"');
    expect(html).toContain('class="b3-pill blending"');
  });

  it('renders the 5-Patient Empirical Cohort Proof Table with all patient archetypes', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('5-Patient Empirical Cohort Proof Table');
    expect(html).toContain('Charles Darwin');
    expect(html).toContain('SUBJ-DARWIN-1882');
    expect(html).toContain('Mara Santos');
    expect(html).toContain('SUBJ-MARA-MS');
    expect(html).toContain('Marie Curie');
    expect(html).toContain('SUBJ-CURIE-1934');
    expect(html).toContain('Frida Kahlo');
    expect(html).toContain('SUBJ-KAHLO-1954');
    expect(html).toContain('Srinivasa Ramanujan');
    expect(html).toContain('SUBJ-RAMANUJAN-1920');

    // Multi-hop agency verification
    expect(html).toContain('USGS Site 01427510');
    expect(html).toContain('EPA SRS-7440-14-4');
    expect(html).toContain('NIH MeSH D004415');
    expect(html).toContain('NIH MeSH D009103');
    expect(html).toContain('NIH MeSH D000741');
    expect(html).toContain('NIH MeSH D009437');
    expect(html).toContain('NIH MeSH D000562');
  });

  it('renders 4-Tier Stepped Care Recommendations with respectful pricing benchmarks', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('TIER 1: ZERO-COST FOUNDATION');
    expect(html).toContain('TIER 2: WHO ESSENTIAL MEDICINES');
    expect(html).toContain('TIER 3: TARGETED ORTHOMOLECULAR ADJUNCTS');
    expect(html).toContain('TIER 4: CLINICAL DEMARCATION &amp; RED FLAGS');

    // Respectful pricing benchmarks
    expect(html).toContain('Standard Retail Benchmark');
    expect(html).toContain('Estimated Out-of-Pocket');
  });

  it('renders 1-Click HL7 FHIR R4 Bundle Exporter', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('downloadOknFhirBundle()');
    expect(html).toContain('pocketgull-nsf-okn-who-nih-cohort-fhir-r4');
    expect(html).toContain('NSF-OKN-NIH-WHO-USGS-EPA');
  });

  it('strictly adheres to the Quiet Workshop voice with zero fatalistic or catastrophic vocabulary', () => {
    const html = renderOknCaseStudyHtml();
    expect(html.toLowerCase()).not.toContain('inevitable decline');
    expect(html.toLowerCase()).not.toContain('hopeless');
    expect(html.toLowerCase()).not.toContain('helplessness');
  });

  it('renders the Universal Legal Footer with statutory safe harbor and nominative trademark disclaimers', () => {
    const html = renderOknCaseStudyHtml();
    expect(html).toContain('Statutory Interoperability Safe Harbor');
    expect(html).toContain('FDA 21 CFR Part 11 &amp; Non-Device Demarcation');
    expect(html).toContain('Nominative Fair Use &amp; Third-Party Trademark Disclaimers');
    expect(html).toContain('21st Century Cures Act &amp; 45 CFR Part 171');
  });
});
