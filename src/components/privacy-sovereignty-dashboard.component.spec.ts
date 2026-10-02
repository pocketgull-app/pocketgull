import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacySovereigntyDashboardComponent } from './privacy-sovereignty-dashboard.component';
import { PatientStateService } from '../services/patient-state.service';
import { OfflineEdgeAiService } from '../services/offline-edge-ai.service';
import { NetworkStateService } from '../services/network-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('PrivacySovereigntyDashboardComponent', () => {
  let component: PrivacySovereigntyDashboardComponent;
  let fixture: ComponentFixture<PrivacySovereigntyDashboardComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacySovereigntyDashboardComponent],
      providers: [
        PatientStateService,
        OfflineEdgeAiService,
        NetworkStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacySovereigntyDashboardComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and displays Privacy & Data Sovereignty Dashboard', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ephemeral Privacy & Data Sovereignty Dashboard');
    expect(el.textContent).toContain('Zero Passive Telemetry Egress');
    expect(el.textContent).toContain('WASM / ONNX Engine');
    expect(el.textContent).toContain('0 Active Beacons');
  });

  it('2. Toggles ephemeral privacy mode and updates action notice', () => {
    const initialMode = patientState.ephemeralPrivacyMode();
    component.togglePrivacyMode();
    fixture.detectChanges();

    expect(patientState.ephemeralPrivacyMode()).toBe(!initialMode);
    expect(component.lastActionNotice()).toContain('Ephemeral Privacy Mode updated');
  });

  it('3. Purges transient patient state and confirms in action notice', () => {
    const purgeSpy = vi.spyOn(patientState, 'purgeTransientPatientState').mockReturnValue({
      purgedItemsCount: 5,
      timestamp: new Date().toISOString()
    });

    component.purgeState();
    fixture.detectChanges();

    expect(purgeSpy).toHaveBeenCalled();
    expect(component.lastActionNotice()).toContain('Purged 5 transient items');
  });

  it('4. Toggles HIPAA Safe Harbor payload de-identification preview', () => {
    expect(component.showSanitizationPreview()).toBe(false);

    component.toggleSanitizationPreview();
    fixture.detectChanges();
    expect(component.showSanitizationPreview()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Raw Unsanitized Local State (PHI)');
    expect(el.textContent).toContain('Sanitized Anonymized Egress Payload (Safe Harbor)');

    // Toggle off
    component.toggleSanitizationPreview();
    fixture.detectChanges();
    expect(component.showSanitizationPreview()).toBe(false);
  });

  it('5. Computes active items count based on patient issues and history', () => {
    patientState.issues.set({ 'cervical-spine': { severity: 'moderate' } } as any);
    patientState.patientHistory.set([{ id: 'h1', text: 'Prior hypertension diagnosis', timestamp: new Date().toISOString() }] as any);
    fixture.detectChanges();

    expect(component.activeItemsCount()).toBe(2);
  });

  it('6. Produces valid JSON in raw and sanitized state previews', () => {
    const raw = JSON.parse(component.rawStatePreview());
    expect(raw).toHaveProperty('vitals');
    expect(raw).toHaveProperty('activeIssuesCount');

    const sanitized = JSON.parse(component.sanitizedStatePreview());
    expect(sanitized.hipaaScrubbed).toBe(true);
    expect(sanitized.demographicArchetype).toContain('Homo Sapiens');
  });
});
