import '@angular/compiler';
import { BiomarkerMatrixComponent } from './biomarker-matrix.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../services/theme.service';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('BiomarkerMatrixComponent - Apache ECharts & Orthomolecular Telemetry Suite', () => {
  let component: BiomarkerMatrixComponent;
  let mockThemeService: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockThemeService = {
      activeTheme: signal('dark'),
      setTheme: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: ThemeService, useValue: mockThemeService },
      { provide: PLATFORM_ID, useValue: 'browser' }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new BiomarkerMatrixComponent();
    });
  });

  it('instantiates with default radar web view mode', () => {
    expect(component).toBeTruthy();
    expect(component.viewMode()).toBe('radar');
    expect(component.selectedBiomarker()).toBeNull();
  });

  it('switches view mode between radar, spectrum, and 3D cards', () => {
    component.setViewMode('spectrum');
    expect(component.viewMode()).toBe('spectrum');

    component.setViewMode('cards');
    expect(component.viewMode()).toBe('cards');

    component.setViewMode('radar');
    expect(component.viewMode()).toBe('radar');
  });

  it('parses raw JSON biomarker array (Mara Santos clinical pattern)', () => {
    const rawReport = `
### Biochemical & Biomarker Matrix
Mara's orthomolecular profile is characteristic of active CNS autoimmune disease:
[
{ "name": "Vitamin D3", "level": "Deficient", "pathway": "Immune Modulation / T-reg / Neuro" },
{ "name": "Glutathione (GSH)", "level": "Low", "pathway": "Antioxidant / Oligodendrocyte Protection" },
{ "name": "CoQ10", "level": "Low", "pathway": "Mitochondrial Respiration / Axonal Energy" },
{ "name": "Vitamin B12", "level": "Low-normal", "pathway": "Myelin Synthesis / Methylation" },
{ "name": "Homocysteine", "level": "Elevated", "pathway": "Cardiovascular / Neurotoxicity" }
]
`;
    (component as any).reportText = signal(rawReport);

    const markers = component.biomarkers();
    expect(markers.length).toBe(5);
    expect(markers[0].name).toBe('Vitamin D3');
    expect(markers[0].level).toBe('Deficient');
    expect(markers[1].name).toBe('Glutathione (GSH)');
    expect(markers[1].level).toBe('Deficient'); // 'Low' maps to 'Deficient'
    expect(markers[3].name).toBe('Vitamin B12');
    expect(markers[3].level).toBe('Sub-optimal'); // 'Low-normal' maps to 'Sub-optimal'
    expect(markers[4].name).toBe('Homocysteine');
    expect(markers[4].level).toBe('High'); // 'Elevated' maps to 'High'
  });

  it('parses markdown code-fenced JSON biomarker array', () => {
    const fencedReport = `
### Biomarker Matrix
\`\`\`json
[
  { "name": "Zinc", "level": "Optimal", "pathway": "Immune / Blood-Brain Barrier" },
  { "name": "Magnesium", "level": "Sub-optimal", "pathway": "NMDA / Spasticity / Sleep" }
]
\`\`\`
`;
    (component as any).reportText = signal(fencedReport);

    const markers = component.biomarkers();
    expect(markers.length).toBe(2);
    expect(markers[0].name).toBe('Zinc');
    expect(markers[0].level).toBe('Optimal');
    expect(markers[1].name).toBe('Magnesium');
    expect(markers[1].level).toBe('Sub-optimal');
  });

  it('provides targeted Food-as-Medicine nutritional sourcing guides', () => {
    const d3Guide = component.getFoodSourcingGuide('Vitamin D3');
    expect(d3Guide).toContain('salmon');
    expect(d3Guide).toContain('sunlight');

    const gshGuide = component.getFoodSourcingGuide('Glutathione (GSH)');
    expect(gshGuide).toContain('Cruciferous');

    const unknownGuide = component.getFoodSourcingGuide('UnknownBiomarker');
    expect(unknownGuide).toContain('Whole food sources');
  });

  it('toggles 3D card flip states properly', () => {
    expect(component.isBiomarkerFlipped('Vitamin D3')).toBe(false);
    component.toggleBiomarkerFlip('Vitamin D3');
    expect(component.isBiomarkerFlipped('Vitamin D3')).toBe(true);
  });

  it('toggles global WHO/CDC guidelines', () => {
    expect(component.allGuidelinesExpanded()).toBe(false);
    component.toggleAllGuidelines();
    expect(component.allGuidelinesExpanded()).toBe(true);
    component.toggleAllGuidelines();
    expect(component.allGuidelinesExpanded()).toBe(false);
  });
});
