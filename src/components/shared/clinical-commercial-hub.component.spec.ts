import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ClinicalCommercialHubComponent } from './clinical-commercial-hub.component';

describe('ClinicalCommercialHubComponent Unit Suite', () => {
  let component: ClinicalCommercialHubComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalCommercialHubComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClinicalCommercialHubComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default onboarding tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('onboarding');
    expect(component.selectedOutreach()).toBe('clinic');
    expect(component.sowText.length).toBeGreaterThan(0);
  });

  it('2. Switches between hub tabs', () => {
    component.activeTab.set('tiers');
    expect(component.activeTab()).toBe('tiers');

    component.activeTab.set('rwe');
    expect(component.activeTab()).toBe('rwe');

    component.activeTab.set('outreach');
    expect(component.activeTab()).toBe('outreach');

    component.activeTab.set('sow');
    expect(component.activeTab()).toBe('sow');
  });

  it('3. Computes dynamic outreach subjects and bodies for various targets', () => {
    component.selectedOutreach.set('clinic');
    expect(component.currentSubject()).toContain('Eliminating 2 hours');
    expect(component.currentBody()).toContain('HIPAA Safe Harbor');

    component.selectedOutreach.set('digitalHealth');
    expect(component.currentSubject()).toContain('Accelerating FHIR R4');
    expect(component.currentBody()).toContain('LoRA adapter');

    component.selectedOutreach.set('academic');
    expect(component.currentSubject()).toContain('Open-Science');
    expect(component.currentBody()).toContain('CDISC SDTM');

    component.selectedOutreach.set('tribal');
    expect(component.currentSubject()).toContain('Tribal Health');
    expect(component.currentBody()).toContain('CARE Principles');
  });

  it('4. Copies outreach to clipboard', () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy
      }
    });

    component.onCopyOutreach();
    expect(clipboardSpy).toHaveBeenCalledWith(expect.stringContaining('Subject:'));
    expect(component.copiedOutreach()).toBe(true);
  });

  it('5. Handles SOW download without crashing', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    expect(() => component.onDownloadSow()).not.toThrow();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('6. Handles checkout initiation and manages loading state', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ url: 'https://checkout.stripe.com/test' })
    } as Response);

    // Prevent navigation in jsdom
    const originalHref = window.location.href;
    const checkoutPromise = component.onInitiateCheckout('pilot');
    expect(component.loadingTier()).toBe('pilot');

    await checkoutPromise;
    expect(fetchSpy).toHaveBeenCalledWith('/api/billing/checkout', expect.any(Object));
    expect(component.loadingTier()).toBeNull();
  });
});
