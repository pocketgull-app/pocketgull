import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UniversalPivotPulseSynthesizerService } from './universal-pivot-pulse-synthesizer.service';
import { ClinicalSpecialtyRiskSuiteService } from './clinical-specialty-risk-suite.service';
import { SpatialLesionMarkupService } from './spatial-lesion-markup.service';
import { PatientStateService } from './patient-state.service';
import { OllamaProvider } from './ai/ollama.provider';

describe('UniversalPivotPulseSynthesizerService', () => {
  let service: UniversalPivotPulseSynthesizerService;
  let spatialLesions: SpatialLesionMarkupService;
  let patientState: PatientStateService;
  let mockOllama: any;

  beforeEach(() => {
    mockOllama = {
      isAvailable: vi.fn().mockReturnValue(false),
      generateText: vi.fn().mockResolvedValue({ text: 'Targeted remyelination and mitochondrial rescue protocol.' })
    };

    TestBed.configureTestingModule({
      providers: [
        UniversalPivotPulseSynthesizerService,
        ClinicalSpecialtyRiskSuiteService,
        SpatialLesionMarkupService,
        PatientStateService,
        { provide: OllamaProvider, useValue: mockOllama }
      ]
    });

    service = TestBed.inject(UniversalPivotPulseSynthesizerService);
    spatialLesions = TestBed.inject(SpatialLesionMarkupService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('1. Initializes with default signals and ready state', () => {
    expect(service.isSynthesizing()).toBe(false);
    expect(service.lastSynthesizedPlan()).toBeNull();
    expect(service.synthesisLog().length).toBe(0);
  });

  it('2. Correctly projects Marie Curie to sternal bone marrow and palmar 3D lesion beacons', () => {
    const lesions = service.projectPatientTo3DLesions('p_marie_curie');
    expect(lesions.length).toBe(3);

    const marrow = lesions.find(l => l.partId === 'chest');
    expect(marrow).toBeDefined();
    expect(marrow?.label).toContain('Bone Marrow');
    expect(marrow?.severity).toBe('critical');

    const hand = lesions.find(l => l.partId === 'r_hand');
    expect(hand).toBeDefined();
    expect(hand?.morphology).toBe('erythema');

    const oxidative = lesions.find(l => l.partId === 'liver');
    expect(oxidative).toBeDefined();
    expect(oxidative?.clinicalNotes).toContain('8-OHdG');
  });

  it('3. Correctly projects Ramanujan, Edwin Smith 3, Darwin, and Frida Kahlo to 3D anatomical hotzones', () => {
    // Ramanujan: Liver amoebic cicatrix and duodenal hyperpermeability
    const ramanujanLesions = service.projectPatientTo3DLesions('p_srinivasa_ramanujan');
    expect(ramanujanLesions.some(l => l.partId === 'liver' && l.label.includes('Amoebic'))).toBe(true);
    expect(ramanujanLesions.some(l => l.partId === 'abdomen' && l.clinicalNotes.includes('calprotectin'))).toBe(true);

    // Edwin Smith 3: Compound skull fracture and cervical nuchal rigidity
    const smithLesions = service.projectPatientTo3DLesions('p_edwin_smith_3');
    expect(smithLesions.some(l => l.partId === 'head' && l.morphology === 'laceration')).toBe(true);
    expect(smithLesions.some(l => l.partId === 'neck' && l.morphology === 'fibrosis')).toBe(true);

    // Darwin: Carotid baroreflex and solar plexus dysmotility
    const darwinLesions = service.projectPatientTo3DLesions('p_charles_darwin');
    expect(darwinLesions.some(l => l.partId === 'neck' && l.label.includes('Baroreflex'))).toBe(true);

    // Frida Kahlo: Lumbar crush, pelvic malunion, and neuropathic foot
    const kahloLesions = service.projectPatientTo3DLesions('p_frida_kahlo');
    expect(kahloLesions.length).toBe(3);
    expect(kahloLesions.some(l => l.partId === 'lumbar')).toBe(true);
    expect(kahloLesions.some(l => l.partId === 'pelvis')).toBe(true);
  });

  it('4. Projects MS cohort (Mara Santos, POMS, LOMS) into distinct CNS lesion seeds', () => {
    const mara = service.projectPatientTo3DLesions('p_mara_santos');
    expect(mara.some(l => l.label.includes('Optic Nerve'))).toBe(true);
    expect(mara.some(l => l.label.includes('Dawson Finger'))).toBe(true);
    expect(mara.some(l => l.label.includes('Cervical Spinal Cord'))).toBe(true);

    const poms = service.projectPatientTo3DLesions('p_poms_adolescent');
    expect(poms.some(l => l.label.includes('Centrum Semiovale'))).toBe(true);

    const loms = service.projectPatientTo3DLesions('p_loms_elder');
    expect(loms.some(l => l.label.includes('Cervical Spinal Cord Neuro-Axonal Atrophy'))).toBe(true);
  });

  it('5. Executes synthesizePrecisionPlan, populating 3D beacons and adopting Care Plan in PatientStateService', async () => {
    const adoptSpy = vi.spyOn(patientState, 'adoptCarePlanSuggestion');
    const plan = await service.synthesizePrecisionPlan('p_marie_curie');

    expect(plan.patientId).toBe('p_marie_curie');
    expect(plan.act1WhereYouveBeen).toContain('radium-226');
    expect(plan.continuousPulseChecklist.length).toBeGreaterThanOrEqual(4);
    expect(plan.precisionNutrients.some(n => n.compound.includes('Sulforaphane'))).toBe(true);

    // Verify 3D spatial lesion placement
    expect(spatialLesions.activeLesions().length).toBe(3);
    expect(spatialLesions.selectedLesionId()).not.toBeNull();

    // Verify adoption in PatientStateService
    expect(adoptSpy).toHaveBeenCalled();
    expect(service.lastSynthesizedPlan()).toEqual(plan);
    expect(service.lastSynthesisTimestamp()).not.toBeNull();
    expect(service.synthesisLog().some(l => l.includes('[SUCCESS]'))).toBe(true);
  });

  it('6. Enriches Act 3 trajectory using local Ollama Gemma 4 when available', async () => {
    mockOllama.isAvailable.mockReturnValue(true);
    mockOllama.generateText.mockResolvedValue({
      text: 'Prioritize Nrf2-driven cytoprotective gene expression and reverse-barrier hematology isolation.'
    });

    const plan = await service.synthesizePrecisionPlan('p_marie_curie');
    expect(plan.act3WhereYoureGoing).toContain('[Gemma 4 Edge Synthesis]:');
    expect(plan.act3WhereYoureGoing).toContain('Prioritize Nrf2-driven cytoprotective');
    expect(service.synthesisLog().some(l => l.includes('[LLM]'))).toBe(true);
  });

  it('7. Accurately projects distinct 3D anatomical lesions for clinical archetypes (p001 through p010)', () => {
    // p001 Metabolic: Abdomen & Carotid
    const p001Lesions = service.projectPatientTo3DLesions('p001');
    expect(p001Lesions.some(l => l.partId === 'abdomen')).toBe(true);
    expect(p001Lesions.some(l => l.partId === 'neck')).toBe(true);

    // p002 Asthma & Lumbar: Lumbar & Carina
    const p002Lesions = service.projectPatientTo3DLesions('p002');
    expect(p002Lesions.some(l => l.partId === 'lumbar')).toBe(true);
    expect(p002Lesions.some(l => l.partId === 'chest')).toBe(true);

    // p003 Geriatric Cardiac: LAD Coronary & Knee
    const p003Lesions = service.projectPatientTo3DLesions('p003');
    expect(p003Lesions.some(l => l.partId === 'chest' && l.label.includes('Coronary'))).toBe(true);
    expect(p003Lesions.some(l => l.partId === 'r_knee')).toBe(true);

    // p007 Maternal: Uterine & Leg
    const p007Lesions = service.projectPatientTo3DLesions('p007');
    expect(p007Lesions.some(l => l.partId === 'pelvis' && l.label.includes('Uterine'))).toBe(true);
    expect(p007Lesions.some(l => l.partId === 'r_leg')).toBe(true);

    // p008 Pauling: Aorta & Macula
    const p008Lesions = service.projectPatientTo3DLesions('p008');
    expect(p008Lesions.some(l => l.partId === 'chest' && l.label.includes('Aortic'))).toBe(true);
    expect(p008Lesions.some(l => l.partId === 'head' && l.label.includes('Macular'))).toBe(true);

    // p009 Oncology Cachexia: Pancreas, Celiac Plexus, Quadriceps
    const p009Lesions = service.projectPatientTo3DLesions('p009');
    expect(p009Lesions.length).toBe(3);
    expect(p009Lesions.some(l => l.partId === 'abdomen')).toBe(true);
    expect(p009Lesions.some(l => l.partId === 'r_thigh')).toBe(true);

    // p010 Dual Neuro: Substantia Nigra & Carotid Baroreflex
    const p010Lesions = service.projectPatientTo3DLesions('p010');
    expect(p010Lesions.some(l => l.partId === 'head' && l.label.includes('Substantia Nigra'))).toBe(true);
    expect(p010Lesions.some(l => l.partId === 'neck' && l.label.includes('Baroreflex'))).toBe(true);
  });

  it('8. Synthesizes precision plans with 6-Pillar structure for complex oncology and neuro cases', async () => {
    // p009 Pancreatic cachexia
    const p009Plan = await service.synthesizePrecisionPlan('p009');
    expect(p009Plan.act1WhereYouveBeen).toContain('PDAC');
    expect(p009Plan.act1WhereYouveBeen).toContain('cachexia');
    expect(p009Plan.act2WhereYouStandToday).toContain('catabolic');
    expect(p009Plan.precisionNutrients.some(n => n.compound.includes('PERT'))).toBe(true);
    expect(p009Plan.precisionNutrients.some(n => n.compound.includes('EPA'))).toBe(true);

    // p010 Dual neuro
    const p010Plan = await service.synthesizePrecisionPlan('p010');
    expect(p010Plan.act1WhereYouveBeen).toContain('Parkinson');
    expect(p010Plan.act1WhereYouveBeen).toContain('nOH');
    expect(p010Plan.act2WhereYouStandToday).toContain('presyncope');
    expect(p010Plan.precisionNutrients.some(n => n.compound.includes('Bacopa'))).toBe(true);
    expect(p010Plan.differentialSafetyDemarcation?.ruledOutMimics).toContain('Multiple System Atrophy (MSA-P)');
  });
});
