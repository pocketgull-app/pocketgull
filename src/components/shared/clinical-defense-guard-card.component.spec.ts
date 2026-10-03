import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalDefenseGuardCardComponent } from './clinical-defense-guard-card.component';
import { ClinicalDefenseGuardService } from '../../services/clinical-defense-guard.service';

describe('ClinicalDefenseGuardCardComponent', () => {
  let component: ClinicalDefenseGuardCardComponent;
  let fixture: ComponentFixture<ClinicalDefenseGuardCardComponent>;
  let service: ClinicalDefenseGuardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalDefenseGuardCardComponent],
      providers: [ClinicalDefenseGuardService]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalDefenseGuardCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ClinicalDefenseGuardService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Zero-Trust Security & Compliance header and score', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Zero-Trust Security & Compliance Safeguards');
    expect(el.textContent).toContain('NIST SP 800-207 & HHS 405(d)');
    expect(el.textContent).toContain(`${service.defensePosture().systemIntegrityScore}%`);
  });

  it('2. Defaults to SECURITY_CONTROLS tab and renders compliance controls', () => {
    expect(component.activeTab()).toBe('SECURITY_CONTROLS');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Compliance Controls');
    expect(component.controls().length).toBeGreaterThan(0);
    const firstCtrl = component.controls()[0];
    expect(el.textContent).toContain(firstCtrl.controlId);
    expect(el.textContent).toContain(firstCtrl.name);
  });

  it('3. Switches to MITRE_ATLAS tab and renders AI safeguards', () => {
    component.activeTab.set('MITRE_ATLAS');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('OWASP & ATLAS AI Safeguards');
    expect(component.atlasTactics().length).toBeGreaterThan(0);
    const firstTactic = component.atlasTactics()[0];
    expect(el.textContent).toContain(firstTactic.mitreAtlasId);
    expect(el.textContent).toContain(firstTactic.tacticName);
  });

  it('4. Switches to DFIR_LOCKER tab and renders cryptographic audit trail snapshots', () => {
    component.activeTab.set('DFIR_LOCKER');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aligned: HICP Section');
    expect(component.forensicSnapshots().length).toBeGreaterThan(0);
    const firstSnap = component.forensicSnapshots()[0];
    expect(el.textContent).toContain(firstSnap.snapshotId);
    expect(el.textContent).toContain(firstSnap.evidencePayloadHash);
  });

  it('5. Renders dual custody threshold indicator badge', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dual-Custody Active');
    expect(el.textContent).toContain(`$${service.dualCustodyThresholdUsd()}`);
  });
});
