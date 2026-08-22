import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JurisdictionMatrixCardComponent } from './jurisdiction-matrix-card.component';
import { GlobalJurisdictionMatrixService } from '../../services/global-jurisdiction-matrix.service';
import { JurisdictionGuardService } from '../../services/jurisdiction-guard.service';

describe('JurisdictionMatrixCardComponent Unit Suite', () => {
  let fixture: ComponentFixture<JurisdictionMatrixCardComponent>;
  let component: JurisdictionMatrixCardComponent;
  let matrixService: GlobalJurisdictionMatrixService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JurisdictionMatrixCardComponent],
      providers: [GlobalJurisdictionMatrixService, JurisdictionGuardService]
    }).compileComponents();

    fixture = TestBed.createComponent(JurisdictionMatrixCardComponent);
    component = fixture.componentInstance;
    matrixService = TestBed.inject(GlobalJurisdictionMatrixService);
    component.selectJurisdiction('US', 'CA');
    fixture.detectChanges();
  });

  it('1. Renders default California (US-CA) CMIA and 988 emergency dispatch', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Global & State Jurisdictional Compliance Studio');
    expect(compiled.textContent).toContain('California (CMIA/CalAIM)');
    expect(compiled.textContent).toContain('988');
  });

  it('2. Dynamically switches to European Union (EU) on tab click', () => {
    component.selectJurisdiction('EU');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('European Union');
    expect(compiled.textContent).toContain('GDPR');
    expect(compiled.textContent).toContain('112');
  });

  it('3. Dynamically switches to India (IN) displaying ABDM and AYUSH paradigms', () => {
    component.selectJurisdiction('IN');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('India');
    expect(compiled.textContent).toContain('DPDP Act');
    expect(compiled.textContent).toContain('Ayurveda (Ministry of AYUSH)');
  });
});
