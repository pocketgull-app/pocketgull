import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpigeneticLongevityLensTabComponent } from './epigenetic-longevity-lens-tab.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalBiologicalAgeTwinService } from '../../services/clinical-biological-age-twin.service';

describe('EpigeneticLongevityLensTabComponent', () => {
  let component: EpigeneticLongevityLensTabComponent;
  let fixture: ComponentFixture<EpigeneticLongevityLensTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpigeneticLongevityLensTabComponent],
      providers: [PatientStateService, ClinicalBiologicalAgeTwinService]
    }).compileComponents();

    fixture = TestBed.createComponent(EpigeneticLongevityLensTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Should instantiate EpigeneticLongevityLensTabComponent', () => {
    expect(component).toBeTruthy();
  });

  it('2. Should render baseline epigenetic metrics (methylation, telomeres, mitochondria)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Epigenetic Longevity & Transgenerational Epigenetics');
    expect(compiled.textContent).toContain('DNA Methylation Pace');
    expect(compiled.textContent).toContain('Telomere Buffer');
    expect(compiled.textContent).toContain('Mitochondrial Coupling');
  });

  it('3. Should host embedded Living Biological Clock & Waterfall HUD', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hud = compiled.querySelector('app-biological-age-waterfall-hud');
    expect(hud).toBeTruthy();
    expect(compiled.textContent).toContain('Living Biological Clock & Waterfall HUD');
    expect(compiled.textContent).toContain('Levine PhenoAge (2018)');
  });
});
