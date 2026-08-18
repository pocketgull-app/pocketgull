import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ComponentDrilldownUnitComponent } from './component-drilldown-unit.component';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { StorageService } from '../services/storage.service';
import { GamificationService } from '../services/gamification.service';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';
import { StoreSourcingService } from '../services/store-sourcing.service';

describe('ComponentDrilldownUnitComponent', () => {
  let component: ComponentDrilldownUnitComponent;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentDrilldownUnitComponent],
      providers: [
        ThemeService,
        StorageService,
        GamificationService,
        ActuarialLongevityService,
        PatientStateService,
        ProviderTreatmentNetworkService,
        MedicalDecoderService,
        StoreSourcingService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ComponentDrilldownUnitComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
  });

  it('1. Starts closed with null targetComponent', () => {
    expect(component.targetComponent()).toBeNull();
  });

  it('2. Opens drilldown target and supports Tri-Lens toggle', () => {
    component.open('biomarkers');
    expect(component.targetComponent()).toBe('biomarkers');
    expect(component.title()).toContain('Biomarker');

    component.activeLens.set('biophysics');
    expect(component.lensDescription()).toContain('Biophysics');

    component.close();
    expect(component.targetComponent()).toBeNull();
  });

  it('3. Supports opening new Kaggle, Network, and Supplies targets', () => {
    component.open('kaggle');
    expect(component.title()).toContain('Kaggle');

    component.open('network');
    expect(component.title()).toContain('Clinician Peer');

    component.open('supplies');
    expect(component.title()).toContain('Medical Supply');
  });
});
