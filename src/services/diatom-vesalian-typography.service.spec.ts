import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DiatomVesalianTypographyService } from './diatom-vesalian-typography.service';

describe('DiatomVesalianTypographyService', () => {
  let service: DiatomVesalianTypographyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiatomVesalianTypographyService]
    });
    service = TestBed.inject(DiatomVesalianTypographyService);
  });

  it('should be created with healthy default signals', () => {
    expect(service).toBeTruthy();
    expect(service.globalPoreRatio()).toBe(0.35);
    expect(service.globalDensityScore()).toBe(0.82);
    expect(service.globalPennationAngle()).toBe(45.0);
  });

  it('should generate valid Diatomaceous SVG pattern with Voronoi micro-pores', () => {
    const pattern = service.generateDiatomPorePatternId('test-diatom-pat', {
      poreRatio: 0.5,
      densityScore: 0.85,
      cellCount: 16
    });

    expect(pattern).toContain('<pattern id="test-diatom-pat"');
    expect(pattern).toContain('<circle cx=');
    expect(pattern).toContain('fill="#14b8a6"');
  });

  it('should generate valid Vesalian woodcut hatching pattern with pennation rotation', () => {
    const pattern = service.generateVesalianHatchPatternId('test-vesalius-pat', {
      pennationAngleDeg: 60,
      muscleTension: 0.8,
      inkColorHex: '#f59e0b'
    });

    expect(pattern).toContain('<pattern id="test-vesalius-pat"');
    expect(pattern).toContain('patternTransform="rotate(60 0 0)"');
    expect(pattern).toContain('stroke="#f59e0b"');
  });

  it('should generate a complete historiated drop-capital with classical woodcut frame and Roman glyph', () => {
    const dropCap = service.generateHistoriatedDropCap('G', 45, 0.9);

    expect(dropCap.letter).toBe('G');
    expect(dropCap.svgMarkup).toContain('class="historiated-drop-cap"');
    expect(dropCap.svgMarkup).toContain('aria-label="Historiated initial capital G"');
    expect(dropCap.svgMarkup).toContain('G');
    expect(dropCap.svgMarkup).toContain('#f59e0b');
  });

  it('should check for optical disambiguation candidates', () => {
    const check1 = service.enforceOpticalDisambiguation('Dose: 10 mg');
    expect(check1.hasSubstitutions).toBe(true);

    const check2 = service.enforceOpticalDisambiguation('Safe');
    expect(check2.hasSubstitutions).toBe(false);
  });
});
