import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nutrigenomics3dLensComponent } from './nutrigenomics-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('Nutrigenomics3dLensComponent (Visual Model V11)', () => {
  let component: Nutrigenomics3dLensComponent;
  let fixture: ComponentFixture<Nutrigenomics3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nutrigenomics3dLensComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(Nutrigenomics3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders the 3D Nutrigenomics & Chromatin Epigenetic Lens header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Nutrigenomics & Chromatin Epigenetic Lens (Model V11)');
    expect(el.textContent).toContain('Keap1-Nrf2-ARE');
    expect(el.textContent).toContain('Histone Acetylation / Butyrate HDACi');
  });

  it('2. Defaults to Sulforaphane ligand with Nrf2 nuclear ratio 5.2 and Phase II induction', () => {
    expect(component.activeLigand()).toBe('sulforaphane');
    const tel = component.telemetry();
    expect(tel.ligandName).toContain('Sulforaphane');
    expect(tel.foodSource).toContain('Cruciferous Brassicas');
    expect(tel.nrf2NuclearRatio).toBe(5.2);
    expect(tel.phase2EnzymeOutputPct).toBe(340);
    expect(tel.chromatinState).toBe('euchromatin_permissive');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Keap1 Oxidation');
    expect(el.textContent).toContain('+340%');
  });

  it('3. Transitions to Butyrate and triggers histone hyperacetylation (HDAC inhibition)', () => {
    component.setLigand('butyrate');
    fixture.detectChanges();

    expect(component.activeLigand()).toBe('butyrate');
    const tel = component.telemetry();
    expect(tel.ligandName).toContain('Butyrate');
    expect(tel.histoneAcetylationPct).toBe(88);
    expect(tel.molecularTarget).toContain('HDAC Class I/II');
    expect(tel.chromatinState).toBe('euchromatin_permissive');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('88%');
    expect(el.textContent).toContain('Resistant Starch');
  });

  it('4. Transitions to Resveratrol and triggers PGC-1α mitochondrial biogenesis', () => {
    component.setLigand('resveratrol');
    fixture.detectChanges();

    expect(component.activeLigand()).toBe('resveratrol');
    const tel = component.telemetry();
    expect(tel.mitochondrialBiogenesisPct).toBe(82);
    expect(tel.molecularTarget).toContain('SIRT1');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('+82%');
    expect(el.textContent).toContain('Polygonum cuspidatum');
  });

  it('5. Transitions to 5-MTHF and confirms high DNA methylation stability', () => {
    component.setLigand('methyl_5mthf');
    fixture.detectChanges();

    expect(component.activeLigand()).toBe('methyl_5mthf');
    const tel = component.telemetry();
    expect(tel.dnaMethylationStabilityPct).toBe(98);
    expect(tel.molecularTarget).toContain('One-Carbon Cycle');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('98%');
    expect(el.textContent).toContain('SAMe Synthesis');
  });
});
