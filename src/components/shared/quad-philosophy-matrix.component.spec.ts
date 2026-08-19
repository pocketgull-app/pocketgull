import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { QuadPhilosophyMatrixComponent } from './quad-philosophy-matrix.component';

describe('QuadPhilosophyMatrixComponent', () => {
  let component: QuadPhilosophyMatrixComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [QuadPhilosophyMatrixComponent]
    });
    component = runInInjectionContext(injector, () => injector.get(QuadPhilosophyMatrixComponent));
  });

  it('should initialize with default heart organ and 4-way focus mode', () => {
    expect(component.focusMode()).toBe('all');
    expect(component.activeOrgan().id).toBe('heart');
    expect(component.organCatalog.length).toBeGreaterThanOrEqual(4);
  });

  it('should update active organ when selected', () => {
    const liver = component.organCatalog.find(o => o.id === 'liver')!;
    component.selectOrgan(liver);
    expect(component.activeOrgan().id).toBe('liver');
    expect(component.activeOrgan().ayurvedic.sanskritName).toContain('यकृत्');
    expect(component.activeOrgan().tcm.hanziName).toContain('肝');
    expect(component.activeOrgan().allopathic.latinName).toContain('HEPAR');
    expect(component.activeOrgan().osteopathic.somaticSegment).toContain('T6–T9');
  });

  it('should allow filtering focus mode across specific healing paradigms', () => {
    component.focusMode.set('ayurvedic');
    expect(component.focusMode()).toBe('ayurvedic');

    component.focusMode.set('tcm');
    expect(component.focusMode()).toBe('tcm');

    component.focusMode.set('osteopathic');
    expect(component.focusMode()).toBe('osteopathic');

    component.focusMode.set('allopathic');
    expect(component.focusMode()).toBe('allopathic');
  });
});
