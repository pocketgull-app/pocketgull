import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AriaScoreHudComponent } from './aria-score-hud.component';
import { AriaScoringService } from '../../services/aria-scoring.service';

describe('AriaScoreHudComponent', () => {
  let component: AriaScoreHudComponent;
  let fixture: ComponentFixture<AriaScoreHudComponent>;
  let service: AriaScoringService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AriaScoreHudComponent],
      providers: [AriaScoringService]
    }).compileComponents();

    service = TestBed.inject(AriaScoringService);
    fixture = TestBed.createComponent(AriaScoreHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the ARIA HUD component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should render Neuropathology ARIA by default with FDA directive banner', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ARIA Evaluation Suite');
    expect(compiled.textContent).toContain('FLAIR Edema Max Dimension');
    expect(compiled.textContent).toContain('Brain MRI & Biomarker Inputs');
    expect(compiled.textContent).toContain('CONTINUE WITH SURVEILLANCE');
  });

  it('3. should switch to Surgical Anatomy lens and render corridor mechanics', () => {
    component.activeLens.set('SURGICAL_ANATOMY');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Corridor Trajectory & Mechanics');
    expect(compiled.textContent).toContain('Angle of Attack Trajectory');
    expect(compiled.textContent).toContain('Composite Corridor Acuity');
  });

  it('4. should switch to Accessibility lens and display WAI-ARIA compliance indicators', () => {
    component.activeLens.set('ACCESSIBILITY');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('WAI-ARIA & Clinical Ergonomics Compliance');
    expect(compiled.textContent).toContain('ARIA Descriptors');
    expect(compiled.textContent).toContain('Touch Target Hitboxes');
  });

  it('5. should export FHIR R4 observation JSON upon button trigger', () => {
    expect(component.exportedJsonPayload()).toBeNull();
    component.exportFhir('NEUROPATHOLOGY');
    fixture.detectChanges();

    expect(component.exportedJsonPayload()).toBeTruthy();
    expect(component.exportedJsonPayload()).toContain('Observation');
    expect(component.exportedJsonPayload()).toContain('ARIA-E / ARIA-H Composite Rating');
  });
});
