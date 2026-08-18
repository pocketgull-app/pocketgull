import { TestBed } from '@angular/core/testing';
import { ClinicalContextModeService, ClinicalPersonaMode } from './clinical-context-mode.service';

describe('ClinicalContextModeService (Role & Complexity Level Gating)', () => {
  let service: ClinicalContextModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalContextModeService]
    });
    service = TestBed.inject(ClinicalContextModeService);
  });

  it('1. should initialize with open_science as the default persona mode and Level 2 complexity', () => {
    expect(service.activeMode()).toBe('open_science');
    expect(service.complexityLevel()).toBe(2);
    expect(service.currentConfig().label).toBe('Open Science & Research');
    expect(service.currentConfig().icon).toBe('🔬');
    expect(service.visibleViews()).toContain('arxiv_labs');
  });

  it('2. should switch modes and update currentConfig reactively', () => {
    service.setMode('clinical_scribe');
    expect(service.activeMode()).toBe('clinical_scribe');
    expect(service.currentConfig().label).toContain('Clinical Scribe');
    expect(service.currentConfig().accentColor).toBe('indigo');

    service.setMode('maternal_doula');
    expect(service.activeMode()).toBe('maternal_doula');
    expect(service.currentConfig().label).toContain('Maternal');

    service.setMode('patient_family');
    expect(service.activeMode()).toBe('patient_family');
    expect(service.currentConfig().label).toContain('Sanctuary');
  });

  it('3. should gate visible views accurately by complexity level', () => {
    service.setMode('open_science');
    
    // Level 1: Minimalist
    service.setComplexityLevel(1);
    expect(service.visibleViews()).toEqual(['arxiv_labs', 'preprints_hub']);
    expect(service.isViewVisible('arxiv_labs')).toBe(true);
    expect(service.isViewVisible('socratic_validator')).toBe(false);

    // Level 2: Pro Diagnostic
    service.setComplexityLevel(2);
    expect(service.visibleViews()).toContain('local_gemma_studio');
    expect(service.isViewVisible('local_gemma_studio')).toBe(true);
    expect(service.isViewVisible('graphql_explorer')).toBe(false);

    // Level 3: Deep Enterprise
    service.setComplexityLevel(3);
    expect(service.visibleViews()).toContain('socratic_validator');
    expect(service.visibleViews()).toContain('graphql_explorer');
    expect(service.isViewVisible('graphql_explorer')).toBe(true);
  });

  it('4. should infer persona mode accurately from natural language directives', () => {
    expect(service.inferModeFromSpeech('Search arXiv for AlphaGenome genomic variants')).toBe('open_science');
    expect(service.inferModeFromSpeech('Record ambient doctor consultation and generate SOAP note')).toBe('clinical_scribe');
    expect(service.inferModeFromSpeech('Check postpartum preeclampsia and EPDS score')).toBe('maternal_doula');
    expect(service.inferModeFromSpeech('Please show the substitute teacher emergency card')).toBe('school_safety');
    expect(service.inferModeFromSpeech('Pull up the FDA 520o steering committee audit')).toBe('executive_governance');
    expect(service.inferModeFromSpeech('Take me back to the calm sanctuary')).toBe('patient_family');
  });

  it('5. should generate shareable deep-linked URLs with role and level params', () => {
    const url = service.getShareableRoleUrl('maternal_doula', 1);
    expect(url).toContain('role=maternal_doula');
    expect(url).toContain('level=1');
  });
});
