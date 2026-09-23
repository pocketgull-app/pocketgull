// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderBusinessSiteHtml, getPocketgullWordmarkSvg } from './business-site';

describe('Business Site Server-Side Rendering (pocketgull.com)', () => {
  it('renders a valid HTML5 document with complete metadata and schema', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>PocketGull — Ambient AI Clinical Assistant &amp; Documentation Co-Pilot</title>');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('PocketGull LLC');
    expect(html).toContain('Oregon Entity: <strong style="color: #ffffff;">258869891</strong>');
  });

  it('renders the Austrian 3-Act Living Trajectory alongside Legacy SOAP', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('The Austrian Way');
    expect(html).toContain('The 3-Act Living Trajectory &amp; Ambient Scribe');
    expect(html).toContain('modeTrajectoryBtn');
    expect(html).toContain('modeSoapBtn');
    expect(html).toContain("ACT I: WHERE YOU'VE BEEN");
    expect(html).toContain('ACT II: WHERE YOU STAND TODAY');
    expect(html).toContain("ACT III: WHERE YOU'RE GOING");
    expect(html).toContain('Austrian Salutogenesis');
    expect(html).toContain('Legacy SOAP Note');
  });

  it('renders explainable AI linked brushing affordances in the dialogue simulator', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('dialogue-token');
    expect(html).toContain('highlightDialogue');
    expect(html).toContain('clearDialogueHighlight');
    expect(html).toContain('token-loc');
    expect(html).toContain('token-stiff');
    expect(html).toContain('token-bp');
    expect(html).toContain('token-gums');
  });

  it('renders the interactive US GAAP FASB ASC 958 slider and allocation calculator', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('Statement of Functional Expenses (US GAAP ASC 958-205)');
    expect(html).toContain('id="gaapSlider"');
    expect(html).toContain('id="gaapSelectedAmount"');
    expect(html).toContain('id="gaapVal1"');
    expect(html).toContain('id="gaapVal2"');
    expect(html).toContain('id="gaapVal3"');
    expect(html).toContain('id="gaapVal4"');
    expect(html).toContain('id="gaapVal5"');
    expect(html).toContain('updateGaapCalculations');
  });

  it('enforces non-fatalistic, empowering clinical terminology in case study modules', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('Differential Clarity');
    expect(html).toContain('Uncovering Co-Infections');
    expect(html).toContain('autonomic vagal strain / low parasympathetic reserve');
    // Ensure catastrophic "trap" or "collapse" wording is eliminated from main headers
    expect(html).not.toContain('Diagnostic Trap</div>\n              <div style="font-size: 1.25rem; font-weight: 800; color: #f87171; margin-top: 0.25rem;">Missing Babesiosis');
    expect(html).not.toContain('autonomic vagal collapse (HRV RMSSD 18ms)');
  });

  it('renders the Circadian Reading Tone (Monastic Paper) switcher and CSS', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('html.paper');
    expect(html).toContain('--bg: #f7f4ec');
    expect(html).toContain('togglePaperMode');
    expect(html).toContain('themeToggleText');
  });

  it('renders the Common Clinical Condition & Dual-Thrift Explorer with patient tabs and FinOps controls', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('id="condition-thrift"');
    expect(html).toContain('id="condTab_metabolic"');
    expect(html).toContain('id="condTab_dysautonomia"');
    expect(html).toContain('id="condTab_neuro"');
    expect(html).toContain('id="condTab_vector"');
    expect(html).toContain('id="condTab_polytrauma"');
    expect(html).toContain('id="conditionDetailCard"');
    expect(html).toContain('selectConditionTab');
    expect(html).toContain('CONDITION_THRIFT_DATA');

    // Verify respectful pricing terminology
    expect(html).toContain('Standard Retail Benchmark:');
    expect(html).toContain('Estimated Out-of-Pocket Total:');
    expect(html).toContain('Net Household Savings:');
    expect(html).toContain('Project Inference Cost:');

    // Verify dual-sided FinOps architecture
    expect(html).toContain('Patient &amp; Practice Financial Shield');
    expect(html).toContain('Developer &amp; Project FinOps');
    expect(html).toContain('$0.00 Edge AI Inference');
    expect(html).toContain('Scale-to-Zero Cloud Run');
    expect(html).toContain('WHO Model List Generics');

    // Verify Doc Drill integration for thrift and stepped care
    expect(html).toContain("openDocDrill('Metabolic Syndrome &amp; Stepped Care')");
    expect(html).toContain('WHO Essential Medicines & Financial Toxicity');
    expect(html).toContain('Project FinOps & Scale-to-Zero Architecture');
  });

  it('renders the Asymmetric Advantage comparison table and Tri-Lens Strategic Architecture', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('id="comparison"');
    expect(html).toContain("Porter's Five Forces");
    expect(html).toContain('Why PocketGull? The Asymmetric Advantage');
    expect(html).toContain('Why We Charge $299 Once Instead of $8,000 Every Year');

    // Verify the Tri-Lens Architecture
    expect(html).toContain('Architecture Is Destiny: Three Lenses on Clinical AI');
    expect(html).toContain('The Taxpayer Lens');
    expect(html).toContain('Halting the $1.2T Diagnostic Cascade');
    expect(html).toContain('The Political &amp; Open Standards Lens');
    expect(html).toContain('Overcoming Data Silos &amp; Cartel Lock-In');
    expect(html).toContain('The Humanity Lens');

    // Verify Hyperscaler & Enterprise EHR Ecosystem Alignment
    expect(html).toContain('id="ecosystem"');
    expect(html).toContain('Collaborative Symbiosis: Aligning with Google, Microsoft &amp; Amazon');
    expect(html).toContain('Fast Loop • In The Exam Room');
    expect(html).toContain('Slow Loop • Enterprise Horizon');
    expect(html).toContain('The Chrome Built-in AI &amp; Green FinOps Flagship');
    expect(html).toContain('Windows Copilot+ NPU &amp; Azure Health Services');
    expect(html).toContain('Amazon Pharmacy RxPass &amp; One Medical Ethos');
    expect(html).toContain('Epic &amp; Enterprise EHRs');
    expect(html).toContain('The Ergonomic On-Device Sidecar &amp; Note Bloat Antidote');
    expect(html).toContain('href="#ecosystem"');

    // Verify Legal & Regulatory Safe Harbor Declarations
    expect(html).toContain('Statutory Interoperability Safe Harbor');
    expect(html).toContain('21st Century Cures Act');
    expect(html).toContain('45 CFR Part 171');
    expect(html).toContain('Nominative Fair Use &amp; Third-Party Trademark Disclaimers');
    expect(html).toContain('Epic Systems Corporation');
    expect(html).toContain('Health Level Seven International');
  });

  it('renders wordmark SVG cleanly', () => {
    const svg = getPocketgullWordmarkSvg();
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 263 80"');
    expect(svg).toContain('PocketGull Wordmark');
  });
});
