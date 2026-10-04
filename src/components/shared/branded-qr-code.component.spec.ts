import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrandedQrCodeComponent } from './branded-qr-code.component';
import { BrandedQrCodeService } from '../../services/branded-qr-code.service';

describe('BrandedQrCodeComponent', () => {
  let component: BrandedQrCodeComponent;
  let fixture: ComponentFixture<BrandedQrCodeComponent>;
  let qrService: BrandedQrCodeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandedQrCodeComponent],
      providers: [BrandedQrCodeService]
    }).compileComponents();

    fixture = TestBed.createComponent(BrandedQrCodeComponent);
    component = fixture.componentInstance;
    qrService = TestBed.inject(BrandedQrCodeService);
    fixture.detectChanges();
  });

  it('1. Initializes with default inputs', () => {
    expect(component).toBeTruthy();
    expect(component.size()).toBe(180);
    expect(component.variant()).toBe('teal');
    expect(component.showLogo()).toBe(true);
    expect(component.showCard()).toBe(false);
    expect(component.enableCopy()).toBe(false);
    expect(component.enableDownload()).toBe(false);
    expect(component.correctionLevel()).toBe('H');
  });

  it('2. Renders canvas and calls BrandedQrCodeService on renderQrCode', () => {
    const renderSpy = vi.spyOn(qrService, 'renderToCanvas');
    component.data.set('https://pocketgull.app/verify/fhir-passport?id=p_001');
    component.size.set(220);
    component.variant.set('teal');
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();

    component.renderQrCode(canvas);

    expect(renderSpy).toHaveBeenCalledWith(
      canvas,
      'https://pocketgull.app/verify/fhir-passport?id=p_001',
      expect.objectContaining({
        size: 220,
        variant: 'teal',
        showLogo: true
      })
    );
  });

  it('3. Renders full card layout when showCard is true with title and subtitle', () => {
    component.data.set('https://pocketgull.app/careplan?id=p_001');
    component.showCard.set(true);
    component.title.set('Verified FHIR Care Plan');
    component.subtitle.set('Scan to access full interactive care plan');
    component.variant.set('emerald');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Verified FHIR Care Plan');
    expect(compiled.textContent).toContain('Scan to access full interactive care plan');
    expect(component.variantBadgeText()).toBe('TCM / Frontline');
    expect(component.containerClasses()).toContain('bg-emerald-50/60');
  });

  it('4. Handles variants correctly (amber, obsidian, emerald, teal)', () => {
    component.variant.set('amber');
    fixture.detectChanges();
    expect(component.variantBadgeText()).toBe('Ayurvedic / Amber');
    expect(component.badgeClasses()).toContain('bg-amber-500/20');

    component.variant.set('obsidian');
    fixture.detectChanges();
    expect(component.variantBadgeText()).toBe('Clinical Obsidian');

    component.variant.set('teal');
    fixture.detectChanges();
    expect(component.variantBadgeText()).toBe('PocketGull Teal');

    component.variant.set('emerald');
    fixture.detectChanges();
    expect(component.variantBadgeText()).toBe('TCM / Frontline');
  });

  it('5. Copies payload to clipboard when copyPayload is called', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    component.data.set('https://pocketgull.app/specialist/handoff');
    component.showCard.set(true);
    component.enableCopy.set(true);
    fixture.detectChanges();

    const result = await component.copyPayload();
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('https://pocketgull.app/specialist/handoff');
    expect(component.copied()).toBe(true);
  });

  it('6. Triggers downloadQrImage when download button is clicked', () => {
    const downloadSpy = vi.spyOn(qrService, 'downloadQrImage').mockImplementation(() => {});

    component.data.set('https://pocketgull.app/export/chw-triage');
    component.downloadFilename.set('chw-triage.png');
    component.showCard.set(true);
    component.enableDownload.set(true);
    fixture.detectChanges();

    component.downloadImage();
    expect(downloadSpy).toHaveBeenCalledWith(
      'https://pocketgull.app/export/chw-triage',
      'chw-triage.png',
      expect.objectContaining({
        showLogo: true
      })
    );
  });

  it('7. Handles empty data gracefully without throwing', () => {
    component.data.set('');
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(() => component.downloadImage()).not.toThrow();
    expect(() => component.renderQrCode()).not.toThrow();
  });

  it('8. Enforces IEEE Anti-Quishing: destination summary extraction', () => {
    component.data.set('https://pocketgull.app/verify/fhir-passport?id=p_001&auth=true');
    fixture.detectChanges();
    expect(component.effectiveDestinationSummary()).toBe('https://pocketgull.app/verify/fhir-passport');

    component.data.set('{"protocol":"POCKETGULL_CHW_HANDOFF_V1"}');
    fixture.detectChanges();
    expect(component.effectiveDestinationSummary()).toBe('Offline Mesh: POCKETGULL_CHW_HANDOFF');
  });

  it('9. Enforces HIPAA Safe Harbor validation and FDA 21 CFR Part 11 integrity digests in service', async () => {
    // HIPAA Safe Harbor validation: rejects raw SSN
    const unsafeSsnResult = qrService.validateSafeHarbor('Patient SSN: 000-12-3456');
    expect(unsafeSsnResult.isCompliant).toBe(false);
    expect(unsafeSsnResult.warnings.length).toBeGreaterThan(0);

    // Rejects raw 16-digit payment card
    const unsafeCardResult = qrService.validateSafeHarbor('Payment Card: 4111-2222-3333-4444');
    expect(unsafeCardResult.isCompliant).toBe(false);

    // Rejects executable script URI scheme
    const unsafeSchemeResult = qrService.validateSafeHarbor('javascript:alert(document.cookie)');
    expect(unsafeSchemeResult.isCompliant).toBe(false);

    // Passes clean sanitized URL
    const safeResult = qrService.validateSafeHarbor('https://pocketgull.app/verify/p_123');
    expect(safeResult.isCompliant).toBe(true);

    // FDA 21 CFR Part 11: computes SHA-256 seal
    const seal = await qrService.computeIntegrityDigest('https://pocketgull.app/verify/p_123');
    expect(seal).toBeTruthy();
    expect(seal.length).toBe(64);
  });
});
