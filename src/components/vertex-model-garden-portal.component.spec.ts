import '@angular/compiler';
import { VertexModelGardenPortalComponent } from './vertex-model-garden-portal.component';

describe('VertexModelGardenPortalComponent', () => {
  it('1. Initializes with full specialty model registry', () => {
    const comp = new VertexModelGardenPortalComponent();
    expect(comp.models.length).toBeGreaterThanOrEqual(5);
    expect(comp.selectedModel().tier).toBe('PLATINUM_CLINICAL_GRADE');
  });

  it('2. Filters models by category correctly', () => {
    const comp = new VertexModelGardenPortalComponent();
    comp.selectedCategory.set('Critical Care');
    const filtered = comp.filteredModels();
    expect(filtered.every(m => m.category === 'Critical Care')).toBe(true);
  });

  it('3. Computes calibrated simulated risk and handles selection', () => {
    const comp = new VertexModelGardenPortalComponent();
    expect(comp.simulatedRisk()).toBeGreaterThan(0);
    expect(comp.simulatedRisk()).toBeLessThanOrEqual(1.0);

    const cypModel = comp.models.find(m => m.id === 'cyp450-synergy-v1');
    if (cypModel) {
      comp.selectModel(cypModel);
      expect(comp.selectedModel().id).toBe('cyp450-synergy-v1');
    }
  });

  it('4. Generates multi-language code snippets and model cards', () => {
    const comp = new VertexModelGardenPortalComponent();
    const pySnippet = comp.getSnippet('python', comp.selectedModel());
    expect(pySnippet).toContain('google.cloud');
    expect(pySnippet).toContain('aiplatform');

    const cardJson = comp.getModelCardJson(comp.selectedModel());
    expect(cardJson).toContain('PLATINUM_CLINICAL_GRADE');
    expect(cardJson).toContain('TRIPOD+AI');
  });
});
