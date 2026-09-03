import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResearchFrameComponent } from './research-frame.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { GseExplorerService } from '../services/gse-explorer.service';
import { ClinicalMoERouterService } from '../services/clinical-moe-router.service';
import { PhysicalGenomicsService } from '../services/physical-genomics.service';
import { OnDeviceEmbedderService } from '../services/ai/on-device-embedder.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

describe('ResearchFrameComponent Suite', () => {
  let component: ResearchFrameComponent;
  let fixture: ComponentFixture<ResearchFrameComponent>;
  let moeRouter: ClinicalMoERouterService;
  let gseService: GseExplorerService;
  let physicalGenomics: PhysicalGenomicsService;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchFrameComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PatientStateService,
        PatientManagementService,
        GseExplorerService,
        ClinicalMoERouterService,
        PhysicalGenomicsService,
        OnDeviceEmbedderService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical research intelligence'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchFrameComponent);
    component = fixture.componentInstance;
    moeRouter = TestBed.inject(ClinicalMoERouterService);
    gseService = TestBed.inject(GseExplorerService);
    physicalGenomics = TestBed.inject(PhysicalGenomicsService);
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes ResearchFrameComponent with active lens context', () => {
    expect(component).toBeTruthy();
    expect(component.activeLensName()).toBe('Summary Overview');
    expect(component.searchEngine()).toBeDefined();
  });

  it('2. Includes University of Virginia (UVA) in research institutions', () => {
    const institutions = component.researchInstitutions();
    const uva = institutions.find(i => i.name.includes('Virginia') || i.name.includes('UVA'));
    expect(uva).toBeDefined();
    expect(uva?.domain).toBe('virginia.edu');
    expect(uva?.description).toContain('Manning');
  });

  it('3. Generates contextually relevant smart context chips based on active lens', () => {
    // Switch to Physical Genomics Lens
    moeRouter.activeLens.set('Physical Genomics');
    fixture.detectChanges();

    const chips = component.smartContextChips();
    const gseChip = chips.find(c => c.label.includes('GSE131900'));
    expect(gseChip).toBeDefined();
    expect(gseChip?.label).toContain('UVA');
    expect(gseChip?.query).toContain('GSE131900');
  });

  it('4. Searches GSE catalog and ingests dataset parameters into Physical Genomics', () => {
    component.setSearchEngine('gse');
    component.searchText.set('Virginia');
    component.search();

    const results = component.gseResults();
    expect(results.length).toBeGreaterThanOrEqual(1);

    const targetGse = results[0];
    component.ingestGseToPhysicalGenomics(targetGse);

    expect(component.gseIngestFeedback()).toContain('Ingested');
    expect(physicalGenomics.activePriors().rationale).toContain(targetGse.accession);
  });

  it('5. Computes dynamic contextual relevance summary for active lens', () => {
    moeRouter.activeLens.set('Physical Genomics');
    expect(component.contextualRelevanceSummary()).toContain('GSE131900');

    moeRouter.activeLens.set('RSNA Knee Abnormality');
    expect(component.contextualRelevanceSummary()).toContain('Kellgren-Lawrence');
  });
});
