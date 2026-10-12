import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ClinicalAbacusComponent } from './clinical-abacus.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ClinicalAbacusComponent', () => {
  let component: ClinicalAbacusComponent;
  let fixture: ComponentFixture<ClinicalAbacusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalAbacusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalAbacusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes in posology_dosing mode with 4 rods', () => {
    expect(component).toBeTruthy();
    expect(component.mode()).toBe('posology_dosing');
    expect(component.activeRods().length).toBe(4);
    expect(component.activeRods()[0].id).toBe('tens');
    expect(component.activeRods()[1].id).toBe('units');
    expect(component.activeRods()[2].id).toBe('tenths');
    expect(component.activeRods()[3].id).toBe('hundredths');
  });

  it('2. Correctly calculates posology values with Soroban bead movements', () => {
    // Set Tens rod = 2 (20), Units rod = 5 (5), Tenths = 3 (0.3), Hundredths = 4 (0.04) -> 25.34
    // Rod 0: Tens -> set 2 earth beads
    component.setEarthBeads(0, 1); // 2 earth beads
    // Rod 1: Units -> toggle heaven bead (5)
    component.toggleHeavenBead(1);
    // Rod 2: Tenths -> set 3 earth beads
    component.setEarthBeads(2, 2); // 3 earth beads
    // Rod 3: Hundredths -> set 4 earth beads
    component.setEarthBeads(3, 3); // 4 earth beads

    fixture.detectChanges();

    expect(component.rodValues()).toEqual([2, 5, 3, 4]);
    expect(component.calculatedValue()).toBe(25.34);
    expect(component.formattedValue()).toBe('25.34');
  });

  it('3. Renders bi-conical rhomboid SVG bead points conforming to zero-pill geometry', () => {
    const points = component.getBeadPolygonPoints(100, 50, 44, 22);
    // cx=100, cy=50, halfW=22, halfH=11 -> Left: 78,50 Top: 100,39 Right: 122,50 Bottom: 100,61
    expect(points).toBe('78,50 100,39 122,50 100,61');
  });

  it('4. Handles GCS triage mode with correct acuity classifications', () => {
    component.mode.set('gcs_triage');
    fixture.detectChanges();

    expect(component.activeRods().length).toBe(3);
    // Default GCS = 4 + 5 + 6 = 15
    expect(component.gcsScore()).toBe(15);
    expect(component.gcsTier()).toContain('Mild / Intact');

    // Simulate severe coma: Eye 1, Verbal 1, Motor 1 = 3
    component.rodValues.set([1, 1, 1]);
    fixture.detectChanges();

    expect(component.gcsScore()).toBe(3);
    expect(component.gcsTier()).toContain('Severe Traumatic Injury');
  });

  it('5. Switches native numeral systems correctly', () => {
    component.rodValues.set([1, 2, 3, 4]);

    // Eastern Arabic
    component.setScriptSystem('eastern_arabic');
    fixture.detectChanges();
    expect(component.getRodDisplayDigit(0)).toBe('١');
    expect(component.getRodDisplayDigit(1)).toBe('٢');

    // Devanagari
    component.setScriptSystem('devanagari');
    fixture.detectChanges();
    expect(component.getRodDisplayDigit(0)).toBe('१');
    expect(component.getRodDisplayDigit(1)).toBe('२');

    // Inuktitut Kaktovik
    component.setScriptSystem('kaktovik');
    fixture.detectChanges();
    expect(component.getRodDisplayDigit(0)).toBe('𝋁');
    expect(component.getRodDisplayDigit(1)).toBe('𝋂');

    // Suanpan
    component.setScriptSystem('suanpan');
    fixture.detectChanges();
    expect(component.getRodDisplayDigit(0)).toBe('一');
    expect(component.getRodDisplayDigit(1)).toBe('二');
  });

  it('6. Resets abacus rods with zero ka-chink action', () => {
    component.rodValues.set([5, 5, 5, 5]);
    component.resetAbacus();
    fixture.detectChanges();

    expect(component.rodValues()).toEqual([0, 0, 0, 0]);
    expect(component.calculatedValue()).toBe(0);
  });
});
