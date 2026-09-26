// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { applyBionicText, renderReadingToolbarHtml, READING_TOOLBAR_SCRIPT, READING_TOOLBAR_CSS } from './bionic-reading';

describe('Bionic Reading & Tri-Mode Toolbar Engine', () => {
  it('correctly applies bionic fixation bolding to paragraph words', () => {
    const input = '<p>Hello world clinical evidence</p>';
    const output = applyBionicText(input);
    expect(output).toContain('<b>Hel</b>lo');
    expect(output).toContain('<b>wor</b>ld');
    expect(output).toContain('<b>clin</b>ical');
    expect(output).toContain('<b>evid</b>ence');
  });

  it('handles empty strings and HTML without paragraphs gracefully', () => {
    expect(applyBionicText('')).toBe('');
    expect(applyBionicText('<div>Just a div</div>')).toBe('<div>Just a div</div>');
  });

  it('renders the standardized Tri-Mode Reading Toolbar markup', () => {
    const toolbar = renderReadingToolbarHtml();
    expect(toolbar).toContain('class="reading-toolbar"');
    expect(toolbar).toContain('btn-level-standard');
    expect(toolbar).toContain('btn-level-grade6');
    expect(toolbar).toContain('btn-bionic');
    expect(toolbar).toContain('🎓 Standard');
    expect(toolbar).toContain('🌱 6th Grade');
    expect(toolbar).toContain('⚡ Bionic Fixation Mode');
    expect(toolbar).toContain('https://pocketgull.app');
  });

  it('provides valid client-side scripts and CSS rules', () => {
    const vm = require('node:vm');
    expect(() => new vm.Script(READING_TOOLBAR_SCRIPT)).not.toThrow();
    expect(READING_TOOLBAR_CSS).toContain('.reading-toolbar');
    expect(READING_TOOLBAR_CSS).toContain('.toggle-btn');
    expect(READING_TOOLBAR_CSS).toContain('.grade6-card');
  });
});
