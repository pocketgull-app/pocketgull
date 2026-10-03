import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { MensHealthLensTabComponent } from './mens-health-lens-tab.component';
import { MensHealthAndrologyService } from '../../services/mens-health-andrology.service';
import { SovereigntyHealthModelsService } from '../../services/sovereignty-health-models.service';

describe('MensHealthLensTabComponent Unit Suite', () => {
  let component: MensHealthLensTabComponent;
  let mensService: MensHealthAndrologyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensHealthLensTabComponent],
      providers: [
        MensHealthAndrologyService,
        SovereigntyHealthModelsService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MensHealthLensTabComponent);
    component = fixture.componentInstance;
    mensService = TestBed.inject(MensHealthAndrologyService);
  });

  it('1. Instantiates successfully with default princeton tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('princeton');
    expect(component.ipssQuestionLabels.length).toBe(7);
    expect(component.adamQuestionLabels.length).toBe(10);
    expect(component.exportSuccessMessage()).toBeNull();
  });

  it('2. Reflects Princeton III, IPSS, PSA, and ADAM telemetry', () => {
    expect(mensService.princetonEvaluation()).toBeDefined();
    expect(mensService.ipssScore()).toBeDefined();
    expect(mensService.psaInterpretation()).toBeDefined();
    expect(mensService.adamResult()).toBeDefined();
  });

  it('3. Switches between princeton, ipss, and adam tabs', () => {
    component.activeTab.set('ipss');
    expect(component.activeTab()).toBe('ipss');

    component.activeTab.set('adam');
    expect(component.activeTab()).toBe('adam');

    component.activeTab.set('princeton');
    expect(component.activeTab()).toBe('princeton');
  });

  it('4. Returns appropriate styling classes for Princeton risk tiers', () => {
    expect(component.getPrincetonBadgeClass('Low Risk')).toBe('text-emerald-400');
    expect(component.getPrincetonBadgeClass('Intermediate Risk')).toBe('text-amber-400');
    expect(component.getPrincetonBadgeClass('High Risk')).toBe('text-rose-400');
  });

  it('5. Exports Men\'s Health FHIR R4 Bundle and displays confirmation message', () => {
    component.exportMensHealthBundle();
    expect(component.exportSuccessMessage()).toContain('Men\'s Health FHIR R4 Bundle');
  });
});
