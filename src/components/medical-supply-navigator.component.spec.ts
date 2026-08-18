import '@angular/compiler';
import { MedicalSupplyNavigatorComponent } from './medical-supply-navigator.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';
import { StoreSourcingService } from '../services/store-sourcing.service';

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
      { provide: MedicalDecoderService, useValue: mockDecoder },
      StoreSourcingService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new MedicalSupplyNavigatorComponent();
    });
  });

  it('should initialize with supply list, botanical tinctures, and hospital network', () => {
    expect(component.supplies().length).toBeGreaterThanOrEqual(8);
    expect(component.selectedCategory()).toBe('all');
    expect(component.filteredSupplies().length).toBe(component.supplies().length);
  });

  it('should filter medical supplies by Botanical Tinctures category', () => {
    component.selectedCategory.set('Botanical Tinctures & Herbs');
    const herbalItems = component.filteredSupplies();
    expect(herbalItems.length).toBeGreaterThanOrEqual(2);
    expect(herbalItems.every(i => i.category === 'Botanical Tinctures & Herbs')).toBe(true);
  });

  it('should open and close tincture formulation drawer', () => {
    expect(component.activeTinctureFormula()).toBeNull();
    component.openTinctureDrawer('formula-shen-calm');
    expect(component.activeTinctureFormula()).not.toBeNull();
    expect(component.activeTinctureFormula()?.title).toContain('Shen');

    component.activeTinctureFormula.set(null);
    expect(component.activeTinctureFormula()).toBeNull();
  });
});
