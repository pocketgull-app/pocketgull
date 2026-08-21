import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InstantBodyCarePlanSheetComponent } from './instant-body-care-plan-sheet.component';

describe('InstantBodyCarePlanSheetComponent Unit Suite', () => {
  let component: InstantBodyCarePlanSheetComponent;

  beforeEach(() => {
    component = new InstantBodyCarePlanSheetComponent();
  });

  it('1. Initializes closed and opens cleanly for a selected body part', () => {
    expect(component.isOpen()).toBe(false);
    component.openForBodyPart('Gut & Epigastrium');
    expect(component.isOpen()).toBe(true);
    expect(component.selectedBodyPart()).toBe('Gut & Epigastrium');
    expect(component.quickChips().length).toBeGreaterThanOrEqual(3);
  });

  it('2. Appends quick symptom chips to active description', () => {
    component.openForBodyPart('Head & Cranium');
    component.addChipText('💥 Throbbing Ache');
    expect(component.activeDescription()).toBe('💥 Throbbing Ache');

    component.addChipText('☁️ Brain Fog');
    expect(component.activeDescription()).toBe('💥 Throbbing Ache, ☁️ Brain Fog');
  });

  it('3. Generates 4-lens Quad-Philosophy care plan instantaneously', async () => {
    vi.useFakeTimers();
    component.openForBodyPart('Head & Cranium');
    component.activeDescription.set('Throbbing frontal headache');

    component.generateCarePlan();
    expect(component.isGenerating()).toBe(true);

    vi.advanceTimersByTime(500);

    const plan = component.carePlan();
    expect(plan).not.toBeNull();
    expect(plan?.allopathic.icd10).toBeTruthy();
    expect(plan?.tcm.meridian).toBeTruthy();
    expect(plan?.ayurvedic.dosha).toBeTruthy();
    expect(plan?.osteopathic.omtTechnique).toBeTruthy();
    expect(component.isGenerating()).toBe(false);

    vi.useRealTimers();
  });

  it('4. Switches between all 4 healing philosophies cleanly', () => {
    component.activeLens.set('tcm');
    expect(component.activeLens()).toBe('tcm');

    component.activeLens.set('ayurvedic');
    expect(component.activeLens()).toBe('ayurvedic');

    component.activeLens.set('osteopathic');
    expect(component.activeLens()).toBe('osteopathic');

    component.activeLens.set('allopathic');
    expect(component.activeLens()).toBe('allopathic');
  });
});
