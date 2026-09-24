import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FederalUswdsPortalComponent } from './federal-uswds-portal.component';

describe('FederalUswdsPortalComponent Suite', () => {
  let component: FederalUswdsPortalComponent;
  let fixture: ComponentFixture<FederalUswdsPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FederalUswdsPortalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FederalUswdsPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with Veteran Care Plan tab active and USWDS compliance', () => {
    expect(component).toBeTruthy();
    expect(component.currentTab()).toBe('care-plan');
    expect(component.intakeStep()).toBe(1);
    expect(component.accordionState().allopathic).toBe(true);
  });

  it('2. Switches tabs cleanly across all 4 federal workstation views', () => {
    component.selectTab('intake');
    expect(component.currentTab()).toBe('intake');

    component.selectTab('fhir');
    expect(component.currentTab()).toBe('fhir');

    component.selectTab('audit');
    expect(component.currentTab()).toBe('audit');

    component.selectTab('care-plan');
    expect(component.currentTab()).toBe('care-plan');
  });

  it('3. Toggles accordion sections for clinical protocols', () => {
    expect(component.accordionState().somatic).toBe(false);
    component.toggleAccordion('somatic');
    expect(component.accordionState().somatic).toBe(true);

    component.toggleAccordion('allopathic');
    expect(component.accordionState().allopathic).toBe(false);
  });

  it('4. Advances and steps back through the 4-step USWDS clinical intake engine', () => {
    expect(component.intakeStep()).toBe(1);
    component.nextStep();
    expect(component.intakeStep()).toBe(2);
    component.nextStep();
    expect(component.intakeStep()).toBe(3);
    component.nextStep();
    expect(component.intakeStep()).toBe(4);
    
    // Bounds check
    component.nextStep();
    expect(component.intakeStep()).toBe(4);

    component.prevStep();
    expect(component.intakeStep()).toBe(3);
  });

  it('5. Computes character count remaining with Section 508 compliance', () => {
    component.chiefComplaint = 'Short symptom';
    expect(component.remainingChars()).toBe(400 - 'Short symptom'.length);
  });

  it('6. Generates valid FHIR US Core R4 Bundle JSON with US Core profiles', () => {
    const jsonStr = component.fhirBundleJson();
    expect(jsonStr).toBeTruthy();
    const parsed = JSON.parse(jsonStr);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.meta.profile[0]).toContain('us-core-bundle');
    expect(parsed.entry.length).toBe(5);
  });

  it('7. Handles Section 508 accessibility simulator and ARIA announcements', () => {
    expect(component.announcementLog()).toBe('');
    component.simulateScreenReaderAnnouncement('Test ARIA message');
    expect(component.announcementLog()).toBe('Test ARIA message');

    expect(component.isSimulatedHighContrast()).toBe(false);
    component.toggleHighContrastSimulation();
    expect(component.isSimulatedHighContrast()).toBe(true);
  });

  it('8. Emits closeModal event when exit is requested', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });
    component.closeModal.emit();
    expect(closed).toBe(true);
  });

  it('9. Calls window.print when printPlan() is invoked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    component.printPlan();
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('10. Renders clinical print letterhead with VA Community Care Network branding by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('VA Community Care Network (CCN) — Private Clinical Provider');
    expect(compiled.textContent).toContain('Private Practice Care Plan & Medical Nexus Statement (VA MISSION Act P.L. 115-182)');
  });

  it('11. Defaults to community-partner mode (18 U.S.C. § 701 safe harbor) and switches cleanly to official-gov', () => {
    // Verified non-governmental default
    expect(component.entityMode()).toBe('community-partner');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Beacon Hill Community Health');

    // Switch to official-gov
    component.setEntityMode('official-gov');
    expect(component.entityMode()).toBe('official-gov');
    expect(component.announcementLog()).toContain('Official Federal Host');

    fixture.detectChanges();
    expect(compiled.textContent).toContain('Veteran Clinical Decision Support — VA Claims & DBQ Format');

    // Switch back to community-partner
    component.setEntityMode('community-partner');
    expect(component.entityMode()).toBe('community-partner');
    expect(component.announcementLog()).toContain('Private Practice');
  });

  it('12. Copies VA Disability DBQ Medical Nexus Statement for claims adjudication', () => {
    expect(component.nexusCopied()).toBe('');
    component.copyNexusStatement();
    expect(component.nexusCopied()).toContain('Nexus Statement');
  });

  it('13. Enforces non-breaking tokens on clinical dosages, metrics, and citations for print line-break hygiene', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const noWrapElements = compiled.querySelectorAll('.whitespace-nowrap');
    expect(noWrapElements.length).toBeGreaterThan(0);

    const texts = Array.from(noWrapElements).map(el => el.textContent?.trim());
    expect(texts.some(t => t?.includes('10 mg'))).toBe(true);
    expect(texts.some(t => t?.includes('130 mmHg'))).toBe(true);
    expect(texts.some(t => t?.includes('38 CFR § 4.87'))).toBe(true);
  });

  it('14. Renders US Domestic Geofence badges and statutory theater sovereignty cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('US Domestic Geofence (CONUS)');

    component.selectTab('audit');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('US Domestic Data Geofence');
    expect(compiled.textContent).toContain('PACT Act Theater Geocoding');
  });
});

