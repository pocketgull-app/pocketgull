import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartFhirLauncherComponent } from './smart-fhir-launcher.component';
import { SmartOnFhirLauncherService } from '../services/fhir/smart-on-fhir-launcher.service';
import { EhrAppOrchardPackagerService } from '../services/fhir/ehr-app-orchard-packager.service';

describe('SmartFhirLauncherComponent', () => {
  let component: SmartFhirLauncherComponent;
  let fixture: ComponentFixture<SmartFhirLauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartFhirLauncherComponent],
      providers: [
        SmartOnFhirLauncherService,
        EhrAppOrchardPackagerService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartFhirLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should render SMART vendor cards in Connect tab', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.bg-zinc-900\\/80').length).toBeGreaterThanOrEqual(4);
  });

  it('3. should switch to Manifests tab and display Epic & Cerner descriptors', () => {
    component.activeTab.set('manifests');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Epic Showroom (Connection Hub)');
    expect(compiled.textContent).toContain('Oracle Cerner Code Console');
    expect(compiled.textContent).toContain(component.epicManifest.client_id);
    expect(compiled.textContent).toContain(component.cernerManifest.app_id);
  });

  it('4. should switch to CARIN Alliance tab and display trust seal and pillars', () => {
    component.activeTab.set('carin');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('CARIN Alliance Code of Conduct Attestation');
    expect(compiled.textContent).toContain('myhealthapplication.com');
    expect(compiled.textContent).toContain('Individual Consent & Transparency');
    expect(compiled.textContent).toContain('Data Use & Non-Commercialization');
    expect(compiled.textContent).toContain('Technical Security & Cryptography');
    expect(compiled.textContent).toContain('User Control & Sovereignty (IAS)');
  });

  it('5. should switch to Audit tab and display 12/12 certification checks', () => {
    component.activeTab.set('audit');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('12/12');
    expect(compiled.textContent).toContain('100%');
    expect(compiled.textContent).toContain('CERTIFIED_READY_FOR_MARKETPLACE');
    expect(component.auditReport().checks.length).toBe(12);
  });

  it('6. should run interactive SMART v2 launch conformance check', () => {
    component.runConformanceCheck('epic');
    fixture.detectChanges();

    const res = component.validationResult();
    expect(res).toBeTruthy();
    expect(res?.isValid).toBe(true);
    expect(res?.vendorId).toBe('epic');
    expect(res?.pkceChallengeS256.length).toBeGreaterThanOrEqual(43);
  });

  it('7. should switch to Sandbox tab and display CPOE Order Entry and EHR selector', () => {
    component.activeTab.set('sandbox');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EHR CDS Hooks & SMART on FHIR Embedded Sandbox');
    expect(compiled.textContent).toContain('CPOE Order Entry');
    expect(compiled.textContent).toContain('order-select');
    expect(compiled.textContent).toContain('Evaluate CDS Hook');
  });

  it('8. should trigger CDS Hook for Atorvastatin and render Grapefruit Warning card with SMART launch button', () => {
    component.activeTab.set('sandbox');
    component.sandboxMedication.set('Atorvastatin 40mg PO QHS');
    component.triggerSandboxCdsHook();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Furanocoumarin Surge Risk');
    expect(compiled.textContent).toContain('+330%');
    expect(compiled.textContent).toContain('Citrus Sinensis');
    expect(compiled.textContent).toContain('Open PocketGull Chrono-Nutrition Plate Plan (SMART on FHIR)');
  });

  it('9. should accept CDS suggestion action and show confirmation alert', () => {
    component.activeTab.set('sandbox');
    component.sandboxMedication.set('Atorvastatin 40mg PO QHS');
    component.triggerSandboxCdsHook();
    fixture.detectChanges();

    component.acceptSuggestion('Prescribe Citrus Sinensis (Sweet Orange)');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Accepted CPOE Action: Prescribe Citrus Sinensis (Sweet Orange)');
  });

  it('10. should launch embedded SMART app and push certified signed NutritionOrder & CarePlan bundle', () => {
    component.activeTab.set('sandbox');
    component.sandboxMedication.set('Atorvastatin 40mg PO QHS');
    component.launchEmbeddedSmart('Atorvastatin 40mg PO QHS');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EHR Embedded Iframe');
    expect(compiled.textContent).toContain('Individualized Mediterranean Chrono-Nutrition Plan');

    component.pushSignedBundleToEhr();
    fixture.detectChanges();

    expect(component.launcher.lastSignedBundle()).toBeTruthy();
    expect(component.launcher.lastSignedBundle()?.status).toBe('SIGNED_AND_CERTIFIED');
    expect(component.launcher.lastSignedBundle()?.resourceCount).toBe(3);
    expect(compiled.textContent).toContain('Committed (SHA-256:');
    expect(component.signedBundleJson()).toContain('NutritionOrder');
    expect(component.signedBundleJson()).toContain('CarePlan');
    expect(component.signedBundleJson()).toContain('Provenance');
  });
});
