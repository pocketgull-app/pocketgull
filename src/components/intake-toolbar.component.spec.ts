import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { IntakeToolbarComponent } from './intake-toolbar.component';
import { FitbitService } from '../services/hardware/fitbit.service';

describe('IntakeToolbarComponent', () => {
  let component: IntakeToolbarComponent;
  let mockFitbit: any;

  beforeEach(() => {
    mockFitbit = {
      isConnected: signal(false),
      consentAccepted: signal(false),
      openConsentModal: vi.fn(),
      disconnectAndPurge: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: FitbitService, useValue: mockFitbit }
      ]
    });

    component = runInInjectionContext(injector, () => new IntakeToolbarComponent());
  });

  it('should initialize component instance and signals', () => {
    expect(component).toBeTruthy();
    expect(component.exportMenuOpen()).toBe(false);
    expect(component.connectMenuOpen()).toBe(false);
  });

  it('should expose output emitters for exports and integrations', () => {
    expect(component.exportPdf).toBeTruthy();
    expect(component.exportJson).toBeTruthy();
    expect(component.connectEpic).toBeTruthy();
    expect(component.finalizeRecord).toBeTruthy();
  });
});
