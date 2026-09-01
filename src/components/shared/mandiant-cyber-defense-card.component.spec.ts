import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MandiantCyberDefenseCardComponent } from './mandiant-cyber-defense-card.component';
import { MandiantClinicalDefenseService } from '../../services/mandiant-clinical-defense.service';

describe('MandiantCyberDefenseCardComponent Unit Suite', () => {
  let fixture: ComponentFixture<MandiantCyberDefenseCardComponent>;
  let component: MandiantCyberDefenseCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MandiantCyberDefenseCardComponent],
      providers: [MandiantClinicalDefenseService]
    }).compileComponents();

    fixture = TestBed.createComponent(MandiantCyberDefenseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Renders Zero-Trust Security & Compliance safeguards banner with active controls', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Zero-Trust Security & Compliance Safeguards');
    expect(compiled.textContent).toContain('HICP-SEC-01');
    expect(compiled.textContent).toContain('HIPAA §164.312');
  });

  it('2. Switches to MITRE ATLAS tab and displays clinical AI countermeasures', () => {
    component.activeTab.set('MITRE_ATLAS');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('AML.T0043');
    expect(compiled.textContent).toContain('Direct & Indirect Prompt Injection');
    expect(compiled.textContent).toContain('ACTIVE_GUARDED');
  });

  it('3. Triggers emergency containment lockdown and switches to DFIR locker', () => {
    component.triggerEmergencyLockdown();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('DFIR_LOCKER');
    expect(component.service.isContainmentModeActive()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Immutable Forensic Audit Ledger');
    expect(compiled.textContent).toContain('Containment Active — Reset Defenses');
  });
});
