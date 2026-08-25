import { ProviderTreatmentNetworkComponent } from './provider-treatment-network.component';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';

describe('ProviderTreatmentNetworkComponent', () => {
  const service = new ProviderTreatmentNetworkService();
  const component = new ProviderTreatmentNetworkComponent();

  it('1. Initializes with default peer clinician view', () => {
    expect(component.activeTab()).toBe('peers');
    expect(service.peers().length).toBe(3);
  });

  it('2. Supports switching active tab to treatment facilities', () => {
    component.activeTab.set('facilities');
    expect(component.activeTab()).toBe('facilities');
    expect(service.treatmentCenters().length).toBe(3);
  });
});
