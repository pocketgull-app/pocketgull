import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { MonkSkinToneEquityCardComponent } from './monk-skin-tone-equity-card.component';
import { MonkSkinToneEquityService } from '../../services/monk-skin-tone-equity.service';

describe('MonkSkinToneEquityCardComponent', () => {
  let component: MonkSkinToneEquityCardComponent;
  let fixture: ComponentFixture<MonkSkinToneEquityCardComponent>;
  let service: MonkSkinToneEquityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonkSkinToneEquityCardComponent],
      providers: [MonkSkinToneEquityService]
    }).compileComponents();

    fixture = TestBed.createComponent(MonkSkinToneEquityCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MonkSkinToneEquityService);
    fixture.detectChanges();
  });

  it('1. Instantiates successfully with 10 Monk Skin Tone swatches', () => {
    expect(component).toBeTruthy();
    expect(component.equityService.monkSkinTones.length).toBe(10);
  });

  it('2. Renders initial default state (MST 06)', () => {
    expect(component.equityService.selectedMstShade()).toBe(6);
    expect(component.equityService.activeMonkSkinTone().code).toBe('MST 06');
    expect(component.equityService.activeMonkSkinTone().hex).toBe('#a07e56');
  });

  it('3. Applies clinical preset for Occult Hypoxemia (MST 08, SpO2 91%, PI 0.4%)', () => {
    component.applyPreset(8, 91, 0.4);
    fixture.detectChanges();

    expect(component.equityService.selectedMstShade()).toBe(8);
    expect(component.equityService.observedSpO2()).toBe(91);
    expect(component.equityService.perfusionIndex()).toBe(0.4);

    const assessment = component.equityService.occultHypoxemiaAssessment();
    expect(assessment.abgCoTestRecommended).toBe(true);
    expect(['HIGH_ALERT', 'CRITICAL_STAT']).toContain(assessment.riskTier);
    expect(assessment.calibratedSaO2EstimatePct).toBeLessThan(88);
  });

  it('4. Updates rPPG adaptive weights dynamically when skin tone is changed', () => {
    // Fair skin
    component.equityService.setMstShade(1);
    const lightWeights = component.equityService.adaptiveRppgWeights();

    // Melanin-rich skin
    component.equityService.setMstShade(9);
    const darkWeights = component.equityService.adaptiveRppgWeights();

    expect(darkWeights.wRed).toBeGreaterThan(lightWeights.wRed);
    expect(darkWeights.snrBoostDb).toBeGreaterThan(lightWeights.snrBoostDb);
  });
});
