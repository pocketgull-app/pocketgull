import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BystanderActionSuiteComponent } from './bystander-action-suite.component';
import { PatientStateService } from '../services/patient-state.service';

describe('BystanderActionSuiteComponent', () => {
  let component: BystanderActionSuiteComponent;
  let fixture: ComponentFixture<BystanderActionSuiteComponent>;
  let clinicalNotesSignal: ReturnType<typeof signal<Array<{ id: string; text: string; date: string; sourceLens?: string }>>>;
  let addClinicalNoteSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    clinicalNotesSignal = signal<Array<{ id: string; text: string; date: string; sourceLens?: string }>>([]);
    addClinicalNoteSpy = vi.fn().mockImplementation((note) => {
      clinicalNotesSignal.update(notes => [...notes, note]);
    });

    await TestBed.configureTestingModule({
      imports: [BystanderActionSuiteComponent],
      providers: [
        {
          provide: PatientStateService,
          useValue: {
            clinicalNotes: clinicalNotesSignal,
            addClinicalNote: addClinicalNoteSpy
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BystanderActionSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with 4 initial bystander tasks', () => {
    expect(component).toBeTruthy();
    expect(component.tasks().length).toBe(4);
    expect(component.tasks().every(t => !t.completed)).toBe(true);
    expect(component.showSupplyRadar()).toBe(false);
  });

  it('should render Call 911 banner, phone link, and speakerphone script', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('First Priority Protocol');
    expect(compiled.textContent).toContain('Step 1: Call 911 Immediately');
    expect(compiled.textContent).toContain('CALL 911 NOW');

    const telLink = Array.from(compiled.querySelectorAll('a')).find(a => a.textContent?.includes('CALL 911 NOW'));
    expect(telLink).toBeTruthy();
    expect(telLink?.getAttribute('href')).toContain('tel:911');

    expect(compiled.textContent).toContain('What to Tell 911 Dispatch:');
    expect(compiled.textContent).toContain('Unresponsive patient, CPR in progress');
  });

  it('should render all 4 bystander role cards in checklist', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bystander 1: 911 Caller');
    expect(compiled.textContent).toContain('Bystander 2: AED & First Aid');
    expect(compiled.textContent).toContain('Bystander 3: CPR Rescuer');
    expect(compiled.textContent).toContain('Bystander 4: Paramedic Guide');
  });

  it('should toggle task completion and record clinical note in PatientStateService', () => {
    component.toggleTask('task_cpr');
    fixture.detectChanges();

    const cprTask = component.tasks().find(t => t.id === 'task_cpr');
    expect(cprTask?.completed).toBe(true);
    expect(addClinicalNoteSpy).toHaveBeenCalled();
    expect(clinicalNotesSignal().some(n => n.text.includes('Bystander 3: CPR Rescuer'))).toBe(true);
  });

  it('should toggle emergency medical supply radar visibility', () => {
    expect(component.showSupplyRadar()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-emergency-supply-finder')).toBeNull();

    component.showSupplyRadar.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-emergency-supply-finder')).toBeTruthy();
  });

  it('should log bystander action timeline events and render history', () => {
    component.logEvent('AED Arrived & Shock Delivered');
    fixture.detectChanges();

    expect(addClinicalNoteSpy).toHaveBeenCalled();
    expect(clinicalNotesSignal().some(n => n.text.includes('AED Arrived & Shock Delivered'))).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('AED Arrived & Shock Delivered');
  });
});
