import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Cyp3a4Heme3dLensComponent } from './cyp3a4-heme-3d-lens.component';

describe('Cyp3a4Heme3dLensComponent (Visual Model V10)', () => {
  let component: Cyp3a4Heme3dLensComponent;
  let fixture: ComponentFixture<Cyp3a4Heme3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cyp3a4Heme3dLensComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Cyp3a4Heme3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes and renders header, preset buttons, HUD, and 3D canvas container', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Hepatic Cytochrome P450 (CYP3A4 / Heme) Active-Site Slicer (Visual Model V10)');
    expect(el.textContent).toContain('Resting Fe(III)');
    expect(el.textContent).toContain('Compound I [Fe4+=O]');
    expect(el.textContent).toContain('Competitive Azole');
    expect(el.textContent).toContain('Suicide MBI');
    expect(el.textContent).toContain('Soret Band');
  });

  it('2. Initializes in resting Fe(III) hexacoordinate state', () => {
    expect(component.currentPreset()).toBe('resting_fe3');
    const tele = component.telemetry();
    expect(tele.ironValence).toContain('Fe(III)');
    expect(tele.soretPeakNm).toBe(418);
    expect(tele.hemeIntegrity).toBe(1.0);
  });

  it('3. Switches to Compound I Ferryl-Oxo active radical intermediate', () => {
    component.setPreset('compound_1_ferryl_oxo');
    fixture.detectChanges();

    const tele = component.telemetry();
    expect(tele.ironValence).toContain('[Fe(IV)=O]');
    expect(tele.soretPeakNm).toBe(450); // Canonical 450 nm peak
    expect(tele.ferrylOxoGlow).toBe(2.0);
    expect(tele.activePhenotype).toContain('Compound I');
  });

  it('4. Simulates competitive azole inhibitor binding (Ketoconazole)', () => {
    component.setPreset('competitive_azole');
    fixture.detectChanges();

    const tele = component.telemetry();
    expect(tele.ironValence).toContain('Azole');
    expect(tele.soretPeakNm).toBe(432); // Type II shift
    expect(tele.ferrylOxoGlow).toBeLessThan(0.1);
  });

  it('5. Simulates mechanism-based inactivation (Clarithromycin suicide substrate)', () => {
    component.setPreset('suicide_clarithromycin');
    fixture.detectChanges();

    const tele = component.telemetry();
    expect(tele.ironValence).toContain('Covalent Adduct');
    expect(tele.soretPeakNm).toBeLessThan(430); // P420 degradation
    expect(tele.hemeIntegrity).toBeLessThan(0.5);
    expect(tele.activePhenotype).toContain('P420 Inactivated');
  });

  it('6. Resets camera cleanly without throwing', () => {
    expect(() => component.resetCamera()).not.toThrow();
  });
});
