import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrustedCommonsFederationCardComponent } from './trusted-commons-federation-card.component';
import { TrustedCommonsFederationService } from '../../services/trusted-commons-federation.service';

describe('TrustedCommonsFederationCardComponent', () => {
  let component: TrustedCommonsFederationCardComponent;
  let fixture: ComponentFixture<TrustedCommonsFederationCardComponent>;
  let fedService: TrustedCommonsFederationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustedCommonsFederationCardComponent],
      providers: [TrustedCommonsFederationService]
    }).compileComponents();

    fixture = TestBed.createComponent(TrustedCommonsFederationCardComponent);
    component = fixture.componentInstance;
    fedService = TestBed.inject(TrustedCommonsFederationService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Trusted Commons Federation mesh header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Trusted Commons Federation Mesh');
    expect(el.textContent).toContain('Peer Nodes');
  });

  it('2. Switches between peers, bundles, and identity tabs', () => {
    expect(component.activeTab()).toBe('peers');

    component.activeTab.set('bundles');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('bundles');

    component.activeTab.set('identity');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('identity');
  });

  it('3. Toggles air-gapped optical QR transfer code on bundles tab', () => {
    component.activeTab.set('bundles');
    fixture.detectChanges();

    expect(component.showAirGapQr()).toBe(false);

    component.toggleAirGapQr();
    fixture.detectChanges();

    expect(component.showAirGapQr()).toBe(true);
    expect(component.airGapQrPayload()).toContain('Cascadia Acute Dehydration');
    const qrEl = fixture.nativeElement.querySelector('app-branded-qr-code');
    expect(qrEl).toBeTruthy();

    component.toggleAirGapQr();
    fixture.detectChanges();
    expect(component.showAirGapQr()).toBe(false);
  });

  it('4. Shows individual bundle optical QR code when showBundleQr is invoked', () => {
    component.activeTab.set('bundles');
    fixture.detectChanges();

    const sampleBundle = {
      bundleId: 'bundle-test-123',
      bundleType: 'FHIR_CLINICAL_PROTOCOL',
      title: 'Pediatric Asthma Action Plan',
      originNodeName: 'Puget Sound Sovereign Clinic',
      cryptographicSignature: 'ed25519:sig:abc123xyz'
    };

    component.showBundleQr(sampleBundle);
    fixture.detectChanges();

    expect(component.showAirGapQr()).toBe(true);
    expect(component.airGapQrPayload()).toContain('bundle-test-123');
    expect(component.airGapQrPayload()).toContain('Pediatric Asthma Action Plan');
  });
});
