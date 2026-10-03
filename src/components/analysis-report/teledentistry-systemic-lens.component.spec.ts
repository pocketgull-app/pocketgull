import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { TeledentistrySystemicLensComponent } from './teledentistry-systemic-lens.component';
import { TeledentistryService } from '../../services/teledentistry.service';

describe('TeledentistrySystemicLensComponent', () => {
  let component: TeledentistrySystemicLensComponent;
  let fixture: ComponentFixture<TeledentistrySystemicLensComponent>;
  let dentalService: TeledentistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeledentistrySystemicLensComponent],
      providers: [TeledentistryService]
    }).compileComponents();

    dentalService = TestBed.inject(TeledentistryService);
    fixture = TestBed.createComponent(TeledentistrySystemicLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with 32 FDI teeth loaded', () => {
    expect(component).toBeTruthy();
    expect(component.dental.teeth().length).toBe(32);
    expect(component.surfaces).toEqual(['M', 'O', 'D', 'F', 'L']);
    expect(component.twiGrades).toEqual([0, 1, 2, 3, 4]);
    expect(component.selectedTooth()).toBeNull();
  });

  it('should render header with SIBI score, CV risk multiplier, and HbA1c elevation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Teledentistry & Systemic Health Cross-Talk');
    expect(compiled.textContent).toContain('SIBI Score');
    expect(compiled.textContent).toContain('/ 100');
    expect(compiled.textContent).toContain('CV Risk');
    expect(compiled.textContent).toContain('x');
    expect(compiled.textContent).toContain('HbA1c Δ');
    expect(compiled.textContent).toContain('%');
  });

  it('should render telemetry breakdown bar with clinical markers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Deep Pockets (PPD ≥ 4mm):');
    expect(compiled.textContent).toContain('Bleeding on Probing (%BOP):');
    expect(compiled.textContent).toContain('hs-CRP Marker:');
    expect(compiled.textContent).toContain('Pathogen bacteremia:');
    expect(compiled.textContent).toContain('P. gingivalis +');
  });

  it('should render FDI 32-Tooth Odontogram Grid for Maxillary and Mandibular arches', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('FDI 32-Tooth Odontogram Grid (Teeth 11–48)');
    expect(compiled.textContent).toContain('Maxillary Arch (Upper Jaw)');
    expect(compiled.textContent).toContain('Mandibular Arch (Lower Jaw)');
    expect(compiled.textContent).toContain('#11');
    expect(compiled.textContent).toContain('#21');
    expect(compiled.textContent).toContain('#31');
    expect(compiled.textContent).toContain('#41');
  });

  it('should select tooth and open Tooth Inspector panel', () => {
    const tooth16 = component.dental.teeth().find(t => t.fdiNumber === 16);
    expect(tooth16).toBeTruthy();
    component.selectedTooth.set(tooth16!);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tooth #16 Inspector');
    expect(compiled.textContent).toContain('Surface Caries & Restorations:');
    expect(compiled.textContent).toContain('Smith & Knight TWI Grade:');
    expect(compiled.textContent).toContain('Probing Depth & BOP:');

    // Close inspector
    component.selectedTooth.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Tooth #16 Inspector');
  });

  it('should toggle surface caries on the selected tooth', () => {
    const tooth16 = component.dental.teeth().find(t => t.fdiNumber === 16)!;
    component.selectedTooth.set(tooth16);

    const initialSurfacesCount = tooth16.cariesSurfaces.length;
    component.dental.toggleSurface(16, 'O');

    const updatedTooth = component.dental.teeth().find(t => t.fdiNumber === 16)!;
    if (tooth16.cariesSurfaces.includes('O')) {
      expect(updatedTooth.cariesSurfaces.includes('O')).toBe(false);
    } else {
      expect(updatedTooth.cariesSurfaces.includes('O')).toBe(true);
    }
  });

  it('should update probing depth and TWI grade on tooth', () => {
    component.dental.setProbingDepth(16, 5);
    const updated = component.dental.teeth().find(t => t.fdiNumber === 16);
    expect(updated?.probingDepthMm).toBe(5);

    component.dental.setTWIGrade(16, 3);
    const updatedTwi = component.dental.teeth().find(t => t.fdiNumber === 16);
    expect(updatedTwi?.twiGrade).toBe(3);

    const initialBop = component.dental.teeth().find(t => t.fdiNumber === 16)?.hasBleedingOnProbing;
    component.dental.toggleBOP(16);
    const updatedBop = component.dental.teeth().find(t => t.fdiNumber === 16);
    expect(updatedBop?.hasBleedingOnProbing).toBe(!initialBop);
  });
});
