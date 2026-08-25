import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalCdsDisclaimerBannerComponent } from './clinical-cds-disclaimer-banner.component';

describe('ClinicalCdsDisclaimerBannerComponent', () => {
  let fixture: ComponentFixture<ClinicalCdsDisclaimerBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalCdsDisclaimerBannerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalCdsDisclaimerBannerComponent);
    fixture.detectChanges();
  });

  it('1. Renders the customer-facing FDA CDS and HIPAA notice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('FDA CDS Guidance');
    expect(compiled.textContent).toContain('HIPAA Security Rule Notice');
    expect(compiled.textContent).toContain('NIST AI RMF 1.0');
    expect(compiled.textContent).toContain('SPDX 2.3 SBOM');
  });
});
