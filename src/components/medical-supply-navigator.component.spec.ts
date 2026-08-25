import '@angular/compiler';
import { MedicalSupplyNavigatorComponent } from './medical-supply-navigator.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';

describe('MedicalSupplyNavigatorComponent', () => {
  let component: MedicalSupplyNavigatorComponent;
  let mockNetworkService: any;
  let mockPatientState: any;
  let mockDecoder: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockNetworkService = {
      treatmentCenters: signal([
        { id: '1', facilityName: 'Androscoggin Hospital', distanceMiles: 1.2, isEmergency247: true, cityState: 'Lewiston, ME', phone: '(207) 555-0199' }
      ])
    };

    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    mockDecoder = {
      readingLevel: signal('patient')
    };

    injector = createEnvironmentInjector([
      { provide: ProviderTreatmentNetworkService, useValue: mockNetworkService },
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: MedicalDecoderService, useValue: mockDecoder }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new MedicalSupplyNavigatorComponent();
    });
  });

  it('should initialize with supply list and hospital network', () => {
    expect(component.supplies().length).toBeGreaterThanOrEqual(5);
    expect(component.selectedCategory()).toBe('all');
    expect(component.filteredSupplies().length).toBe(component.supplies().length);
  });

  it('should filter medical supplies by category', () => {
    component.selectedCategory.set('Diagnostic Vitals');
    const vitalsItems = component.filteredSupplies();
    expect(vitalsItems.every(i => i.category === 'Diagnostic Vitals')).toBe(true);
  });
});
