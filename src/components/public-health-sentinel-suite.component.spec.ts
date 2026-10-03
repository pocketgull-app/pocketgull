import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicHealthSentinelSuiteComponent } from './public-health-sentinel-suite.component';
import { SentinelSurveillanceService } from '../services/sentinel-surveillance.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { GlobalHealthInitiativesService } from '../services/global-health-initiatives.service';
import { PythonBridgeService } from '../services/python-bridge.service';
import { OfflineEdgeAiService } from '../services/offline-edge-ai.service';
import { NetworkStateService } from '../services/network-state.service';

import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('PublicHealthSentinelSuiteComponent', () => {
  let component: PublicHealthSentinelSuiteComponent;
  let fixture: ComponentFixture<PublicHealthSentinelSuiteComponent>;
  let surveillanceService: SentinelSurveillanceService;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHealthSentinelSuiteComponent],
      providers: [
        SentinelSurveillanceService,
        PatientStateService,
        PatientManagementService,
        GlobalHealthInitiativesService,
        PythonBridgeService,
        OfflineEdgeAiService,
        NetworkStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicHealthSentinelSuiteComponent);
    component = fixture.componentInstance;
    surveillanceService = TestBed.inject(SentinelSurveillanceService);
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes with WHO & CDC Public Health Sentinel Suite header and 4 missions', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('WHO & CDC Public Health Sentinel Suite');
    expect(el.textContent).toContain('WHO EWARS / CDC NWSS SYNC');
    expect(el.textContent).toContain('Mission 1: EWARS & CDC Wastewater Outbreak Radar');
    expect(el.textContent).toContain('Mission 2: CDC Travel Medicine & Vector Shield');
    expect(el.textContent).toContain('Mission 3: WHO GLASS Antimicrobial Stewardship');
    expect(el.textContent).toContain('Mission 4: CDC Environmental Health Shield');
  });

  it('2. Evaluates riskBadgeClass for various epidemiological risk tiers', () => {
    expect(component.riskBadgeClass('Critical')).toContain('bg-red-500/10');
    expect(component.riskBadgeClass('Critical')).toContain('text-red-400');

    expect(component.riskBadgeClass('High')).toContain('bg-red-500/10');
    expect(component.riskBadgeClass('High')).toContain('text-red-400');

    expect(component.riskBadgeClass('Moderate')).toContain('bg-amber-500/10');
    expect(component.riskBadgeClass('Moderate')).toContain('text-amber-300');

    expect(component.riskBadgeClass('Low')).toContain('bg-emerald-500/10');
    expect(component.riskBadgeClass('Low')).toContain('text-emerald-300');
  });

  it('3. Evaluates awareCategoryBadgeClass for WHO AWaRe tiers', () => {
    expect(component.awareCategoryBadgeClass('Reserve')).toBe('bg-rose-600 text-white');
    expect(component.awareCategoryBadgeClass('Watch')).toContain('bg-amber-500/20');
    expect(component.awareCategoryBadgeClass('Access')).toContain('bg-emerald-500/20');
  });

  it('4. Renders EWARS wastewater outbreak alerts from SentinelSurveillanceService', () => {
    patientState.ewarsAlerts.set([
      {
        id: 'ewars-sars2',
        pathogen: 'SARS-CoV-2 (JN.1 / KP.3)',
        surgeStatus: 'Active Surge',
        riskToPatient: 'High',
        viralCopyCount: '1,420,000 copies/L',
        whoBulletin: 'WHO Disease Outbreak News #2026-04'
      }
    ]);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SARS-CoV-2 (JN.1 / KP.3)');
    expect(el.textContent).toContain('1,420,000 copies/L');
    expect(el.textContent).toContain('High RISK');
  });

  it('5. Renders travel medicine profile, AWaRe stewardship, and environmental sensor index', () => {
    // Set travel profile
    patientState.travelProfile.set({
      destination: 'Nairobi, Kenya',
      departureDate: '2026.11.15',
      cdcNoticeLevel: 'Level 2 - Alert',
      requiredVaccines: ['Yellow Fever', 'Meningococcal ACWY'],
      vectorRisks: ['Malaria (Plasmodium falciparum)', 'Dengue Virus'],
      prophylacticProtocol: ['Atovaquone-proguanil daily']
    });

    // Set AWaRe stewardship
    patientState.awareStewardship.set([
      {
        medication: 'Amoxicillin-Clavulanate',
        category: 'Access',
        stewardshipNote: 'First-line narrow spectrum per WHO AWaRe guideline.',
        resistanceRisk: 'Low'
      }
    ]);

    // Set Environmental index
    patientState.environmentalIndex.set({
      aqi: 42,
      pm25: '8.4 µg/m³',
      ozone: '0.032 ppm',
      pollenDensity: 'Moderate',
      heatIndex: '72°F',
      vulnerabilityWarning: 'No acute respiratory hazard detected for this zone.'
    });

    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nairobi, Kenya');
    expect(el.textContent).toContain('Yellow Fever');
    expect(el.textContent).toContain('Amoxicillin-Clavulanate');
    expect(el.textContent).toContain('Access TIER');
    expect(el.textContent).toContain('42');
  });
});
