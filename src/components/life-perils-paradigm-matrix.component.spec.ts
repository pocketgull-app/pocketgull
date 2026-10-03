import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LifePerilsParadigmMatrixComponent } from './life-perils-paradigm-matrix.component';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('LifePerilsParadigmMatrixComponent', () => {
  let component: LifePerilsParadigmMatrixComponent;
  let fixture: ComponentFixture<LifePerilsParadigmMatrixComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifePerilsParadigmMatrixComponent],
      providers: [
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LifePerilsParadigmMatrixComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders matrix header and default midlife stage', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Life-Stage Perils & Vulnerability Matrix');
    expect(el.textContent).toContain('Actuarial Longevity & Risk Engine');
    expect(component.selectedStageId()).toBe('midlife');
    expect(component.activeStage().stageName).toBe('Mid-Life Renewal');
  });

  it('2. Reflects active philosophy lens from PatientStateService', () => {
    patientState.activePhilosophy.set('western');
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Western Allopathic Lens');

    patientState.activePhilosophy.set('eastern');
    fixture.detectChanges();
    expect(el.textContent).toContain('Eastern TCM Lens');

    patientState.activePhilosophy.set('ayurvedic');
    fixture.detectChanges();
    expect(el.textContent).toContain('Ayurvedic Vedic Lens');
  });

  it('3. Switches life stage when user clicks a stage tab button', () => {
    component.selectedStageId.set('pediatric');
    fixture.detectChanges();
    expect(component.activeStage().id).toBe('pediatric');
    expect(component.activeStage().stageName).toBe('Pediatric & Infancy');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pediatric & Infancy Peril Risk Profile');
    expect(el.textContent).toContain('Immune priming');

    // Switch to geriatric
    component.selectedStageId.set('geriatric');
    fixture.detectChanges();
    expect(component.activeStage().id).toBe('geriatric');
    expect(component.activeStage().stageName).toBe('Geriatric Longevity');
    expect(el.textContent).toContain('Sarcopenia & frailty syndrome');
  });

  it('4. Provides multi-paradigm perils across Western, Eastern, and Ayurvedic systems', () => {
    const stage = component.activeStage();
    expect(stage.westernPerils.length).toBeGreaterThan(0);
    expect(stage.easternPerils.length).toBeGreaterThan(0);
    expect(stage.ayurvedicPerils.length).toBeGreaterThan(0);
    expect(stage.preventiveFocus.length).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Western Allopathic Perils');
    expect(el.textContent).toContain('Eastern TCM Perils');
    expect(el.textContent).toContain('Ayurvedic Vedic Perils');
  });

  it('5. Contains all 5 canonical life stage configurations', () => {
    expect(component.lifeStages.length).toBe(5);
    const ids = component.lifeStages.map(s => s.id);
    expect(ids).toEqual(['pediatric', 'young_adult', 'perinatal', 'midlife', 'geriatric']);
  });
});
