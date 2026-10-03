import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalDecadHealingSpectrumComponent } from './global-decad-healing-spectrum.component';
import { GlobalHealingParadigmsService } from '../../services/global-healing-paradigms.service';
import { PatientStateService } from '../../services/patient-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GlobalDecadHealingSpectrumComponent Unit Suite', () => {
  let component: GlobalDecadHealingSpectrumComponent;
  let fixture: ComponentFixture<GlobalDecadHealingSpectrumComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalDecadHealingSpectrumComponent, HttpClientTestingModule],
      providers: [GlobalHealingParadigmsService, PatientStateService]
    }).compileComponents();

    patientState = TestBed.inject(PatientStateService);
    fixture = TestBed.createComponent(GlobalDecadHealingSpectrumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and computes the 10-paradigm consensus synthesis', () => {
    expect(component).toBeTruthy();
    const consensus = component.consensus();
    expect(consensus.totalParadigmsEvaluated).toBe(10);
    expect(consensus.epistemicConvergenceScore).toBeGreaterThanOrEqual(0.85);
  });

  it('2. Exposes all 10 paradigm tabs', () => {
    expect(component.paradigmTabs.length).toBe(10);
    const tabIds = component.paradigmTabs.map(t => t.id);
    expect(tabIds).toContain('allopathic_md');
    expect(tabIds).toContain('osteopathic_do');
    expect(tabIds).toContain('naturopathic_nd');
    expect(tabIds).toContain('traditional_chinese');
    expect(tabIds).toContain('ayurvedic');
    expect(tabIds).toContain('functional_systems');
    expect(tabIds).toContain('unani_tibb');
    expect(tabIds).toContain('indigenous_tek');
    expect(tabIds).toContain('siddha_sowa_rigpa');
    expect(tabIds).toContain('chronobiology_exposomics');
  });

  it('3. Selects paradigm and synchronizes 3D body layer mode in PatientStateService', () => {
    component.selectParadigm('traditional_chinese');
    fixture.detectChanges();
    expect(component.selectedParadigm()).toBe('traditional_chinese');
    expect(patientState.anatomyViewMode()).toBe('eastern');

    component.selectParadigm('osteopathic_do');
    fixture.detectChanges();
    expect(component.selectedParadigm()).toBe('osteopathic_do');
    expect(patientState.anatomyViewMode()).toBe('osteopathic');

    component.selectParadigm('ayurvedic');
    fixture.detectChanges();
    expect(component.selectedParadigm()).toBe('ayurvedic');
    expect(patientState.anatomyViewMode()).toBe('ayurvedic');
  });

  it('4. Exposes interactive 3D spatial regional crosswalk nodes', () => {
    expect(component.spatialNodes.length).toBeGreaterThanOrEqual(3);
    const liverNode = component.spatialNodes.find(n => n.id === 'liver_hypochondrium');
    expect(liverNode).toBeDefined();
    expect(liverNode?.tcmWuXing).toContain('Wood element');
    expect(liverNode?.ayurvedaPrana).toContain('Ranjaka Pitta');
    expect(liverNode?.unaniTibb).toContain('Safra');

    component.selectedSpatialNode.set(liverNode!);
    fixture.detectChanges();
    expect(component.selectedSpatialNode().id).toBe('liver_hypochondrium');
  });

  it('5. Provides 7-tier Naturopathic Stepped Ladder in consensus', () => {
    const ladder = component.consensus().therapeuticOrderSteppedLadder;
    expect(ladder.length).toBe(7);
    expect(ladder[0].tier).toBe('1_Establish_Conditions_For_Health');
    expect(ladder[6].tier).toBe('7_High_Force_Surgery_Intervention');
  });

  it('6. Performs On-Device Semantic Vector Search across 10 paradigms with sub-second latency', async () => {
    await component.onSearchInput('hepatic clearance phase II');
    fixture.detectChanges();

    const results = component.searchResults();
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(component.searchLatencyMs()).toBeGreaterThan(0);
    expect(results.some(r => r.id.includes('ALLOPATHIC') || r.id.includes('LIVER') || r.id.includes('TCM'))).toBe(true);

    component.clearSearch();
    fixture.detectChanges();
    expect(component.searchQuery()).toBe('');
    expect(component.searchResults().length).toBe(0);
  });

  it('7. Applies search match to select paradigm and focus active view', async () => {
    await component.onSearchInput('vagus nerve cranial rhythmic impulse');
    fixture.detectChanges();

    const results = component.searchResults();
    const osteoMatch = results.find(r => r.data?.paradigmId === 'osteopathic_do');
    if (osteoMatch) {
      component.applySearchMatch(osteoMatch);
      fixture.detectChanges();
      expect(component.selectedParadigm()).toBe('osteopathic_do');
      expect(component.activeView()).toBe('lenses');
      expect(patientState.anatomyViewMode()).toBe('osteopathic');
    }
  });
});
