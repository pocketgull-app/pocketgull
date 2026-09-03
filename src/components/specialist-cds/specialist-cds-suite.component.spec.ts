import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecialistCdsSuiteComponent } from './specialist-cds-suite.component';

describe('SpecialistCdsSuiteComponent', () => {
  let component: SpecialistCdsSuiteComponent;
  let fixture: ComponentFixture<SpecialistCdsSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistCdsSuiteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistCdsSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the specialist CDS suite component with 10 tools', () => {
    expect(component).toBeTruthy();
    expect(component.specialistTools.length).toBe(10);
    expect(component.selectedDiscipline()).toBe('cardiology');
    expect(component.activeTool().name).toBe('Cardiology');
  });

  it('2. should compute Shock Index correctly in Emergency module', () => {
    component.selectedDiscipline.set('emergency');
    component.emHr.set(134);
    component.emSbp.set(78);
    fixture.detectChanges();

    // 134 / 78 ~= 1.7179...
    expect(component.shockIndex()).toBeGreaterThan(1.7);
    expect(component.shockIndex()).toBeLessThan(1.75);
  });

  it('3. should switch between sub-specialties reactively', () => {
    component.selectedDiscipline.set('oncology');
    expect(component.activeTool().name).toBe('Oncology');
    expect(component.activeTool().subspecialty).toBe('Molecular Tumor Board');

    component.selectedDiscipline.set('nephrology');
    expect(component.activeTool().name).toBe('Nephrology');
    expect(component.activeTool().guidelineBody).toContain('KDIGO');
  });

  it('4. should emit targeted search query when steerEvidence is clicked', () => {
    let emittedQuery = '';
    component.steeredQuery.subscribe((q: string) => {
      emittedQuery = q;
    });

    component.selectedDiscipline.set('neurology');
    component.steerEvidence();

    expect(emittedQuery).toContain('Tenecteplase');
    expect(emittedQuery).toContain('stroke');
  });
});
