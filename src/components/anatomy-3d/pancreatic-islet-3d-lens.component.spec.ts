import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PancreaticIslet3dLensComponent } from './pancreatic-islet-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('PancreaticIslet3dLensComponent (Visual Model V9)', () => {
  let component: PancreaticIslet3dLensComponent;
  let fixture: ComponentFixture<PancreaticIslet3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PancreaticIslet3dLensComponent],
      providers: [
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PancreaticIslet3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes and renders header, preset buttons, HUD, and 3D canvas container', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Pancreatic Islet & β-Cell Granule Exocytosis Lens (Visual Model V9)');
    expect(el.textContent).toContain('Fasting Homeostasis');
    expect(el.textContent).toContain('GSIS Postprandial Spike');
    expect(el.textContent).toContain('Sulfonylurea SUR1 Agonism');
    expect(el.textContent).toContain('Glucolipotoxicity & ER Stress');
    expect(el.textContent).toContain('IAPP Amyloid Fibrils');
    expect(el.textContent).toContain('T1D Autoimmune Insulitis');
    expect(el.textContent).toContain('Extracellular Glucose');
    expect(el.textContent).toContain('ATP / ADP Energy Ratio');
  });

  it('2. Initializes in fasting homeostasis with resting hyperpolarized potential and low exocytosis', () => {
    expect(component.currentPreset()).toBe('healthy_gsis');
    const tele = component.telemetry();
    expect(tele.glucoseMm).toBe(5.5);
    expect(tele.membranePotentialMv).toBeLessThan(-55.0);
    expect(tele.atpAdpRatio).toBeLessThan(4.5);
    expect(tele.exocytosisRateHz).toBeLessThan(3.0);
  });

  it('3. Simulates GSIS postprandial spike with high ATP/ADP, membrane depolarization, and burst exocytosis', () => {
    component.setPreset('postprandial_spike');
    fixture.detectChanges();

    const tele = component.telemetry();
    expect(tele.glucoseMm).toBe(15.0);
    expect(tele.membranePotentialMv).toBeGreaterThan(-45.0);
    expect(tele.atpAdpRatio).toBeGreaterThan(5.0);
    expect(tele.calciumInfluxUm).toBeGreaterThan(1.0);
    expect(tele.exocytosisRateHz).toBeGreaterThan(5.0);
  });

  it('4. Simulates sulfonylurea (SUR1) drug agonism with depolarization even at low glucose', () => {
    component.setPreset('sulfonylurea_sur1');
    fixture.detectChanges();

    const tele = component.telemetry();
    expect(tele.glucoseMm).toBe(4.2);
    expect(tele.membranePotentialMv).toBeGreaterThan(-45.0);
    expect(tele.exocytosisRateHz).toBeGreaterThan(4.0);
    expect(tele.clinicalNote).toContain('severe hypoglycemia hazard');
  });

  it('5. Simulates IAPP amyloidosis and autoimmune insulitis pathological states', () => {
    component.setPreset('iapp_amyloidosis');
    fixture.detectChanges();
    expect(component.telemetry().activePhenotype).toContain('IAPP Amyloid');

    component.setPreset('type_1_insulitis');
    fixture.detectChanges();
    expect(component.telemetry().activePhenotype).toContain('T1D Autoimmune Insulitis');
  });
});
