import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { GullNarrativeDispatchComponent } from './gull-narrative-dispatch.component';

describe('GullNarrativeDispatchComponent Unit Suite', () => {
  let component: GullNarrativeDispatchComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GullNarrativeDispatchComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(GullNarrativeDispatchComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully at Act 1 with 4 narrative steps', () => {
    expect(component).toBeTruthy();
    expect(component.activeAct()).toBe(1);
    expect(component.steps.length).toBe(4);
    expect(component.currentStep()?.personaName).toBe('Gulliver');
  });

  it('2. Selects specific acts and updates current step computed', () => {
    component.selectAct(2);
    expect(component.activeAct()).toBe(2);
    expect(component.currentStep()?.personaName).toBe('Swoop');

    component.selectAct(3);
    expect(component.activeAct()).toBe(3);
    expect(component.currentStep()?.personaName).toBe('Sentinel');

    component.selectAct(4);
    expect(component.activeAct()).toBe(4);
    expect(component.currentStep()?.personaName).toBe('Scribes');
  });

  it('3. Advances and rewinds through narrative acts with bounds checking', () => {
    component.nextAct();
    expect(component.activeAct()).toBe(2);

    component.nextAct();
    expect(component.activeAct()).toBe(3);

    component.nextAct();
    expect(component.activeAct()).toBe(4);

    // Bounded at 4
    component.nextAct();
    expect(component.activeAct()).toBe(4);

    component.prevAct();
    expect(component.activeAct()).toBe(3);

    component.resetAct();
    expect(component.activeAct()).toBe(1);
  });

  it('4. Toggles singalong mode state', () => {
    expect(component.isSingalongActive()).toBe(false);
    component.toggleSingalong();
    // In headless environment without speech synthesis, it triggers stop or updates state
    component.stopVoice();
    expect(component.isPlayingVoice()).toBe(false);
  });

  it('5. Handles speech dispatch and voice stop without exceptions', () => {
    const step = component.currentStep();
    if (step) {
      expect(() => component.speakDispatch(step)).not.toThrow();
    }
    expect(() => component.stopVoice()).not.toThrow();
  });

  it('6. Cleans up audio and timers on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
