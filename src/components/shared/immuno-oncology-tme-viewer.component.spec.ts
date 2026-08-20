import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ImmunoOncologyTmeViewerComponent } from './immuno-oncology-tme-viewer.component';

describe('ImmunoOncologyTmeViewerComponent', () => {
  let component: ImmunoOncologyTmeViewerComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [ImmunoOncologyTmeViewerComponent]
    });
    component = runInInjectionContext(injector, () => injector.get(ImmunoOncologyTmeViewerComponent));
  });

  it('should initialize with default TME biophysical parameters and grant catalog', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('3d-tme');
    expect(component.antiPd1Active()).toBe(false);
    expect(component.grantCatalog.length).toBeGreaterThanOrEqual(6);
  });

  it('should toggle anti-PD-1 checkpoint blockade and update cytotoxicity', () => {
    const baselineCytotoxicity = component.computedCytotoxicity();
    expect(baselineCytotoxicity).toBeLessThan(40); // Cloaked

    component.toggleAntiPd1();
    expect(component.antiPd1Active()).toBe(true);
    const activeCytotoxicity = component.computedCytotoxicity();
    expect(activeCytotoxicity).toBeGreaterThan(60); // Unmasked lysis
  });

  it('should compute Warburg microenvironment pH and lactate', () => {
    expect(component.computedPh()).toBeLessThan(7.4);
    expect(component.computedLactate()).toBeGreaterThan(5.0);
  });

  it('should filter grants by paradigm', () => {
    component.selectedGrantFilter.set('Ayurvedic');
    const ayushGrants = component.filteredGrants();
    expect(ayushGrants.every(g => g.paradigm === 'Ayurvedic')).toBe(true);

    component.selectedGrantFilter.set('Osteopathic');
    const aoaGrants = component.filteredGrants();
    expect(aoaGrants.every(g => g.paradigm === 'Osteopathic')).toBe(true);
  });
});
