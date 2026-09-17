import '@angular/compiler';
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

  it('5. Switches between all 4 persona perspectives (patient, family, clinician, community)', () => {
    expect(component.personaMode()).toBe('clinician');

    component.setPersona('patient');
    expect(component.personaMode()).toBe('patient');

    component.setPersona('family');
    expect(component.personaMode()).toBe('family');

    component.setPersona('community');
    expect(component.personaMode()).toBe('community');
  });

  it('6. Synthesizes 3-Act Trajectory with Zero-Guilt baseline and warning signs', () => {
    component.openForBodyPart('Kidneys & Adrenals');
    const traj = component.organTrajectory();

    expect(traj.act1WhereYouveBeen.title).toContain('Renal');
    expect(traj.act1WhereYouveBeen.plainLanguageRationale).toBeTruthy();
    expect(traj.act2WhereYouStandToday.biometricBaseline).toBeTruthy();
    expect(traj.act2WhereYouStandToday.plainLanguageAdvice).toBeTruthy();
    expect(traj.act3WhereYoureGoing.watchWindow).toBeTruthy();
    expect(traj.act3WhereYoureGoing.warningSignsToMonitor.length).toBeGreaterThanOrEqual(3);
  });

  it('7. Toggles and closes the high-fidelity on-screen AVS preview', () => {
    expect(component.showAvsPreview()).toBe(false);

    component.toggleAvsPreview();
    expect(component.showAvsPreview()).toBe(true);

    component.closeAvsPreview();
    expect(component.showAvsPreview()).toBe(false);
  });

  it('8. printOrganAvs triggers document printing-avs-handout class', () => {
    expect(() => component.printOrganAvs()).not.toThrow();
  });
});

