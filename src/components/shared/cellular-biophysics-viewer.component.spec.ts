import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { CellularBiophysicsViewerComponent } from './cellular-biophysics-viewer.component';
import { CellularBiophysicsService } from '../../services/cellular-biophysics.service';

describe('CellularBiophysicsViewerComponent', () => {
  let component: CellularBiophysicsViewerComponent;
  let service: CellularBiophysicsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        CellularBiophysicsService,
        CellularBiophysicsViewerComponent
      ]
    });
    service = injector.get(CellularBiophysicsService);
    component = runInInjectionContext(injector, () => injector.get(CellularBiophysicsViewerComponent));
  });

  it('should create the cellular biophysics viewer component', () => {
    expect(component).toBeTruthy();
    expect(component.focusTab()).toBe('3d-scene');
    expect(component.autoRotate()).toBe(true);
  });

  it('should select organelle and update service active organelle', () => {
    const nucleus = service.organelleCatalog.find(o => o.id === 'nucleus')!;
    component.selectOrganelle(nucleus);
    expect(service.activeOrganelle().id).toBe('nucleus');
  });

  it('should toggle auto-rotate and reset camera safely', () => {
    component.toggleAutoRotate();
    expect(component.autoRotate()).toBe(false);

    component.resetCamera();
    expect(component).toBeTruthy();
  });

  it('should update parameter signals via input events', () => {
    const event = { target: { value: '92' } } as unknown as Event;
    component.updateMitochondrialEfficiency(event);
    expect(service.mitochondrialEfficiency()).toBe(92);
  });
});
