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

  it('renders wordmark SVG cleanly', () => {
    const svg = getPocketgullWordmarkSvg();
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 263 80"');
    expect(svg).toContain('PocketGull Wordmark');
  });
});
