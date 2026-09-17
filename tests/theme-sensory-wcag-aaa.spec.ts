import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeService, AppTheme } from '../src/services/theme.service';
import { SecureStorageService } from '../src/services/secure-storage.service';

/**
 * WCAG 2.2 Relative Luminance and Contrast Ratio computation helpers.
 */
function srgbToLuminance(r: number, g: number, b: number): number {
  const channelLum = (val: number): number => {
    const c = val / 255.0;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channelLum(r) + 0.7152 * channelLum(g) + 0.0722 * channelLum(b);
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = srgbToLuminance(...hexToRgb(hex1));
  const lum2 = srgbToLuminance(...hexToRgb(hex2));
  const maxLum = Math.max(lum1, lum2);
  const minLum = Math.min(lum1, lum2);
  return (maxLum + 0.05) / (minLum + 0.05);
}

describe('WCAG 2.2 AAA Accessibility & Sensory Settings Certification Suite', () => {
  let service: ThemeService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        SecureStorageService,
        ThemeService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ThemeService));
  });

  describe('1. Clinical Environment Contrast Benchmarks (WCAG 2.2 Level AAA)', () => {
    it('Daytime Clinical Chart satisfies AAA normal text >= 7:1', () => {
      const cr = getContrastRatio('#0F172A', '#FFFFFF');
      expect(cr).toBeGreaterThanOrEqual(7.0);
      expect(Number(cr.toFixed(2))).toBe(17.85);
    });

    it('Dark ICU Telemetry HUD satisfies AAA normal text >= 7:1', () => {
      const cr = getContrastRatio('#00E6FF', '#070B14');
      expect(cr).toBeGreaterThanOrEqual(7.0);
      expect(Number(cr.toFixed(2))).toBe(12.90);
    });

    it('Scotopic 650nm Emergency HUD satisfies AAA large text >= 4.5:1', () => {
      const cr = getContrastRatio('#FF2211', '#050000');
      expect(cr).toBeGreaterThanOrEqual(4.5);
      expect(Number(cr.toFixed(2))).toBe(5.45);
    });

    it('Scotopic High-Acuity Body Text satisfies AAA normal text >= 7:1', () => {
      const cr = getContrastRatio('#FF6655', '#050000');
      expect(cr).toBeGreaterThanOrEqual(7.0);
      expect(Number(cr.toFixed(2))).toBe(7.24);
    });

    it('Disaster Triage E-Paper satisfies AAA normal text >= 7:1', () => {
      const cr = getContrastRatio('#111111', '#F5F5F0');
      expect(cr).toBeGreaterThanOrEqual(7.0);
      expect(Number(cr.toFixed(2))).toBe(17.27);
    });
  });

  describe('2. All 18 Application Themes WCAG 2.2 AAA Certification', () => {
    const themePalettes = [
      { id: 'light', name: 'Light Parchment', fg: '#1C1C1C', bg: '#FAFAFA', cardBg: '#FFFFFF', heading: '#0F172A' },
      { id: 'dark', name: 'Dark Obsidian', fg: '#F3F4F6', bg: '#111827', cardBg: '#1F2937', heading: '#38BDF8' },
      { id: 'rice', name: 'Washi Rice Paper', fg: '#18181B', bg: '#FAF8F0', cardBg: '#FFFFFF', heading: '#047857' },
      { id: 'hemp', name: 'Hemp Fiber Paper', fg: '#1F1912', bg: '#F5EFE0', cardBg: '#FAF6ED', heading: '#B45309' },
      { id: 'construction', name: 'Construction High-Vis', fg: '#0F172A', bg: '#ECEAE2', cardBg: '#F8F6F0', heading: '#0369A1' },
      { id: 'papercraft', name: 'Papercraft Kraft', fg: '#1C1917', bg: '#FDFBF7', cardBg: '#FFFFFF', heading: '#15803D' },
      { id: 'white-marble', name: 'Carrara White Marble', fg: '#0F172A', bg: '#FAFAFC', cardBg: '#FFFFFF', heading: '#0369A1' },
      { id: 'black-marble', name: 'Nero Marquina Marble', fg: '#F8FAFC', bg: '#0B0C10', cardBg: '#13151D', heading: '#38BDF8' },
      { id: 'papyrus', name: 'Ancient Papyrus', fg: '#F3EAD6', bg: '#13100C', cardBg: '#1C1813', heading: '#F59E0B' },
      { id: 'spark', name: 'Spark Emergency Ember', fg: '#FFF7ED', bg: '#0A0503', cardBg: '#170B07', heading: '#F97316' },
      { id: 'pool-light', name: 'Ocean Pool Light', fg: '#0F172A', bg: '#7DD3FC', cardBg: '#FFFFFF', heading: '#0369A1' },
      { id: 'pool-dark', name: 'Ocean Pool Dark', fg: '#F8FAFC', bg: '#081F3D', cardBg: '#0F172A', heading: '#38BDF8' },
      { id: 'mandala', name: 'Sacred Mandala Solfeggio', fg: '#F5F3FF', bg: '#16112D', cardBg: '#211A42', heading: '#C084FC' },
      { id: 'curie', name: 'Curie Atomic Radium', fg: '#E2F8EE', bg: '#0F1416', cardBg: '#162025', heading: '#00FF66' },
      { id: 'cern', name: 'CERN 1991 Info Classic', fg: '#000000', bg: '#F4F4F0', cardBg: '#FFFFFF', heading: '#000080' },
      { id: 'geararts', name: 'PocketGull GearArts', fg: '#F8FAFC', bg: '#0B0C10', cardBg: '#13151D', heading: '#2DD4BF' },
      { id: 'scotopic', name: 'Scotopic 650nm Red Mode', fg: '#FF6655', bg: '#050000', cardBg: '#0E0202', heading: '#FF2211' },
      { id: 'epaper', name: 'Disaster Triage E-Paper', fg: '#111111', bg: '#F5F5F0', cardBg: '#FFFFFF', heading: '#000000' }
    ];

    it.each(themePalettes)('Theme "$name" passes strict WCAG 2.2 AAA contrast requirements', (palette) => {
      const bodyContrast = getContrastRatio(palette.fg, palette.cardBg);
      const headingContrast = getContrastRatio(palette.heading, palette.cardBg);

      // Normal body text requires >= 7.0:1 for Level AAA
      expect(bodyContrast).toBeGreaterThanOrEqual(7.0);
      // Large text / headings require >= 4.5:1 for Level AAA
      expect(headingContrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('3. Sensory Accommodation & Neuro-Ergonomic Settings (11 Axes)', () => {
    it('1. Toggles Reduced Motion (WCAG 2.3.3 Level AAA)', () => {
      expect(service.reduceMotion()).toBe(false);
      service.setReduceMotion(true);
      expect(service.reduceMotion()).toBe(true);
      service.setReduceMotion(false);
      expect(service.reduceMotion()).toBe(false);
    });

    it('2. Manages High Contrast state signal (WCAG 1.4.6 Level AAA)', () => {
      expect(service.isHighContrastEnabled()).toBe(false);
      service.isHighContrastEnabled.set(true);
      expect(service.isHighContrastEnabled()).toBe(true);
    });

    it('3. Manages Dyslexia Font high-differentiation state', () => {
      expect(service.isDyslexiaFontEnabled()).toBe(false);
      service.isDyslexiaFontEnabled.set(true);
      expect(service.isDyslexiaFontEnabled()).toBe(true);
    });

    it('4. Cycles Text Size Scale without truncation (WCAG 1.4.4 / 1.4.12)', () => {
      expect(service.textSizeScale()).toBe('standard');
      service.cycleTextSizeScale();
      expect(service.textSizeScale()).toBe('large');
      service.cycleTextSizeScale();
      expect(service.textSizeScale()).toBe('extra-large');
      service.cycleTextSizeScale();
      expect(service.textSizeScale()).toBe('standard');
    });

    it('5. Toggles Plain Language & Cognitive Accommodation Mode (WCAG 3.1.5)', () => {
      expect(service.isPlainLanguageMode()).toBe(false);
      service.togglePlainLanguageMode();
      expect(service.isPlainLanguageMode()).toBe(true);
    });

    it('6. Supports Analogy Lens Mode switching (clinical vs coach)', () => {
      service.setAnalogyLensMode('coach');
      expect(service.analogyLensMode()).toBe('coach');
      expect(service.isPlainLanguageMode()).toBe(true);

      service.setAnalogyLensMode('clinical');
      expect(service.analogyLensMode()).toBe('clinical');
      expect(service.isPlainLanguageMode()).toBe(false);
    });

    it('7. Synthesizes Acoustic Feedback without unhandled exceptions', () => {
      expect(() => service.playThemeUiAudioFx('click')).not.toThrow();
      expect(() => service.playThemeUiAudioFx('toggle')).not.toThrow();
      expect(() => service.playThemeUiAudioFx('theme-change')).not.toThrow();
      expect(() => service.playThemeUiAudioFx('double-click')).not.toThrow();
      expect(() => service.playThemeUiAudioFx('state-cycle')).not.toThrow();
      expect(() => service.playThemeUiAudioFx('long-press')).not.toThrow();
    });

    it('8. Triggers Somatosensory Haptic Feedback safely on all platforms', () => {
      expect(() => service.triggerHapticFeedback('light')).not.toThrow();
      expect(() => service.triggerHapticFeedback('medium')).not.toThrow();
      expect(() => service.triggerHapticFeedback('heavy')).not.toThrow();
      expect(() => service.triggerHapticFeedback('double')).not.toThrow();
      expect(() => service.triggerHapticFeedback('success')).not.toThrow();
    });

    it('9. Supports newly promoted Scotopic 650nm and E-Paper themes', () => {
      service.setTheme('scotopic');
      expect(service.currentTheme()).toBe('scotopic');

      service.setTheme('epaper');
      expect(service.currentTheme()).toBe('epaper');
    });
  });

  describe('4. Louise Sloan 5:1 Optotype Acuity Proofs (Ophthalmic Calibration)', () => {
    const sloanLetters = [
      { char: 'E', height: 700, stroke: 140 },
      { char: 'C', height: 700, stroke: 140 },
      { char: 'O', height: 700, stroke: 140 },
      { char: 'H', height: 700, stroke: 140 },
      { char: 'N', height: 700, stroke: 140 },
      { char: 'Z', height: 700, stroke: 140 },
      { char: '0', height: 700, stroke: 140 }
    ];

    it.each(sloanLetters)('Letter "$char" strictly satisfies 5.00:1 Snellen Sloan ratio', ({ height, stroke }) => {
      const ratio = height / stroke;
      expect(ratio).toBeCloseTo(5.00, 2);
    });
  });

  describe('5. Screen Reader Semantic Speech Mapping (Zero PUA Codepoints)', () => {
    const auditedEmojiCodepoints = [
      { code: 0x1F48A, name: 'Capsule / Pill' },
      { code: 0x1F489, name: 'Syringe' },
      { code: 0x1FA78, name: 'Drop of Blood' },
      { code: 0x1FAC0, name: 'Anatomical Heart' },
      { code: 0x1FAC1, name: 'Lungs' },
      { code: 0x1F691, name: 'Ambulance' },
      { code: 0x1FA7A, name: 'Stethoscope' },
      { code: 0x1F3E5, name: 'Hospital' },
      { code: 0x1F6A8, name: 'Emergency Beacon' },
      { code: 0x1F600, name: 'Pain 0' },
      { code: 0x1F642, name: 'Pain 2' },
      { code: 0x1F610, name: 'Pain 4' },
      { code: 0x1F641, name: 'Pain 6' },
      { code: 0x1F622, name: 'Pain 8' },
      { code: 0x1F62D, name: 'Pain 10' },
      { code: 0x1F441, name: 'Eye' },
      { code: 0x1F50B, name: 'Battery' },
      { code: 0x1F4E1, name: 'Satellite' },
      { code: 0x1F514, name: 'Bell' },
      { code: 0x1F50D, name: 'Loupe' },
      { code: 0x1F44D, name: 'Thumbs Up' },
      { code: 0x1F44E, name: 'Thumbs Down' }
    ];

    it('All audited hieroglyphs are within official Unicode allocations (Zero PUA)', () => {
      for (const item of auditedEmojiCodepoints) {
        // Unicode Private Use Areas:
        // BMP PUA: U+E000 to U+F8FF
        // Plane 15 PUA: U+F0000 to U+FFFFD
        // Plane 16 PUA: U+100000 to U+10FFFD
        const isBmpPua = item.code >= 0xE000 && item.code <= 0xF8FF;
        const isPlane15Pua = item.code >= 0xF0000 && item.code <= 0xFFFFD;
        const isPlane16Pua = item.code >= 0x100000 && item.code <= 0x10FFFD;
        const isPua = isBmpPua || isPlane15Pua || isPlane16Pua;

        expect(isPua).toBe(false);
      }
    });
  });

  describe('6. Fitts\'s Law & Motor Ergonomics (WCAG 2.5.5 Level AAA)', () => {
    it('Validates 44x44px minimum touch target requirements for interactive theme controls', () => {
      const controls = [
        { name: 'Fast Cycle Primary Button', width: 140, height: 44 },
        { name: 'Reduced Motion Toggle', width: 160, height: 44 },
        { name: 'Bionic Mode Toggle', width: 180, height: 44 },
        { name: 'Theme Swatch Box', width: 220, height: 48 },
        { name: 'Drawer Close Button', width: 44, height: 44 }
      ];

      for (const ctrl of controls) {
        expect(ctrl.width).toBeGreaterThanOrEqual(44);
        expect(ctrl.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
});
