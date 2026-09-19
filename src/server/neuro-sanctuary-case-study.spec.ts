// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderNeuroSanctuaryCaseStudyHtml } from './neuro-sanctuary-case-study';

describe('Multiple Sclerosis Neuro-Axonal Sanctuary Case Study (#02)', () => {
  it('renders a valid HTML5 document with complete clinical metadata and OpenGraph tags', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>MS Neuro-Axonal Sanctuary &amp; Biophysical Radar — PocketGull Case Study #02</title>');
    expect(html).toContain('https://pocketgull.com/case-studies/neuro-sanctuary');
    expect(html).toContain('POCKETGULL CLINICAL CASE STUDY #02');
    expect(html).toContain('Neuro-Axonal Sanctuary');
  });

  it('renders the interactive Uhthoff Conduction & Cooling Reserve Radar', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain('id="tempSlider"');
    expect(html).toContain('id="tempDeltaDisplay"');
    expect(html).toContain('id="safetyFactorValue"');
    expect(html).toContain('id="conductionVelocityValue"');
    expect(html).toContain('id="axonalStatusText"');
    expect(html).toContain('updateUhthoffRadar');
    expect(html).toContain('+0.40°C (Uhthoff Threshold)');
  });

  it('renders the 6 Dual-Perspective 3D Flip Cards with Biophysics and Sanctuary sides', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain("this.classList.toggle('flipped')");
    expect(html).toContain('card-3d-inner');
    expect(html).toContain('card-face card-front');
    expect(html).toContain('card-face card-back');
    expect(html).toContain('Microglial Remodeling &amp; Central Fatigue');
    expect(html).toContain('The Scenic Mountain Detour');
    expect(html).toContain('Temperature-Dependent Depolarization (Uhthoff)');
    expect(html).toContain('The Overheated Smartphone');
    expect(html).toContain('Serum Neurofilament Light Chain (sNfL)');
    expect(html).toContain('The Gentle Oil Dipstick');
    expect(html).toContain('Mitochondrial ATP Synthesis');
    expect(html).toContain('Fresh Sparkplugs for the Hill');
    expect(html).toContain('CD20+ B-Cells &amp; Molecular Mimicry');
    expect(html).toContain('The Loyal, Overprotective Guard Dog');
    expect(html).toContain('Cholinergic Anti-Inflammatory Pathway');
    expect(html).toContain('The Evening Forest Sanctuary');
  });

  it('renders the 360° Neuro-Axis Interactive Checkpoint with all 5 pathways', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain("selectPathway('optic')");
    expect(html).toContain("selectPathway('cervical')");
    expect(html).toContain("selectPathway('motor')");
    expect(html).toContain("selectPathway('balance')");
    expect(html).toContain("selectPathway('autonomic')");
    expect(html).toContain('id="pathwayCard"');
    expect(html).toContain('PATHWAYS');
  });

  it('renders the Austrian 3-Act Salutogenic Trajectory', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain("ACT I: WHERE YOU'VE BEEN");
    expect(html).toContain('(The Trail Traversed)');
    expect(html).toContain('ACT II: WHERE YOU STAND TODAY');
    expect(html).toContain('(The Living Foothold)');
    expect(html).toContain("ACT III: WHERE YOU'RE GOING");
    expect(html).toContain('(The Horizon of Action)');
    expect(html).toContain('30-Day Vitality Horizon');
    expect(html).toContain('Daily Restoration Rituals');
  });

  it('renders the 3-Step "Am I Safe?" Triage Flowchart distinguishing Uhthoff from relapses', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain('Step 01 &bull; Temperature Check');
    expect(html).toContain('Step 02 &bull; Background Check');
    expect(html).toContain('Step 03 &bull; The 24-Hour Rule');
    expect(html).toContain('"Am I Safe?" 3-Step Reassuring Triage');
    expect(html).toContain('Uhthoff thermal block');
  });

  it('renders the 1-Click HL7 FHIR R4 Bundle Exporter and printable Care Card', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    expect(html).toContain('downloadFhirBundle()');
    expect(html).toContain('pocketgull-ms-neuro-sanctuary-careplan');
    expect(html).toContain('window.print()');
    expect(html).toContain('PocketGull Neuro-Axonal Sanctuary Care Card');
    expect(html).toContain('id="fhirDownloadNotice"');
  });

  it('strictly enforces the Quiet Workshop voice with zero fatalistic or catastrophic vocabulary', () => {
    const html = renderNeuroSanctuaryCaseStudyHtml();
    // Verify absence of despair-inducing phrasing
    expect(html.toLowerCase()).not.toContain('axonal death');
    expect(html.toLowerCase()).not.toContain('inevitable decline');
    expect(html.toLowerCase()).not.toContain('hopeless');
    expect(html.toLowerCase()).not.toContain('helplessness');
    expect(html.toLowerCase()).not.toContain('inevitable wheelchair');
    // Verify presence of salutogenic, empowering framing
    expect(html).toContain('Salutogenic');
    expect(html).toContain('Conduction Reserve');
    expect(html).toContain('Neuroplastic Detours');
    expect(html).toContain('Zero Fatalism');
  });
});
