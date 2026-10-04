import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PatentClaimsHudModalComponent } from './patent-claims-hud-modal.component';
import { IpPatentRegistryService } from '../../services/ip-patent-registry.service';

describe('PatentClaimsHudModalComponent', () => {
  let component: PatentClaimsHudModalComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        IpPatentRegistryService,
        PatentClaimsHudModalComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(PatentClaimsHudModalComponent));
  });

  it('should create the modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to inventions tab with 17 clusters', () => {
    expect(component.activeTab()).toBe('inventions');
    expect(component.filteredClusters().length).toBe(17);
  });

  it('should filter clusters based on search query', () => {
    component.searchQuery.set('WebGPU');
    expect(component.filteredClusters().length).toBe(1);
    expect(component.filteredClusters()[0].id).toBe('cluster-2-webgpu-bio-signals');
  });

  it('should switch tabs to clauses and filter statutory clauses', () => {
    component.activeTab.set('clauses');
    expect(component.filteredClauses().length).toBe(9);

    component.searchQuery.set('Amazon');
    expect(component.filteredClauses().length).toBe(1);
    expect(component.filteredClauses()[0].id).toBe('clause-ftc-affiliate-governance');
  });

  it('should switch tabs to provisional and access provisional binder with 20 claims and 4 figures', () => {
    component.activeTab.set('provisional');
    expect(component.activeTab()).toBe('provisional');
    expect(component.provisionalBinder.docketNumber).toBe('PG-PAT-2026-CONF-001');
    expect(component.provisionalBinder.claims.length).toBe(20);
    expect(component.provisionalBinder.figures.length).toBe(4);
    expect(component.currentFigure().figureNumber).toBe(1);

    component.selectedProvisionalFig.set(2);
    expect(component.currentFigure().figureNumber).toBe(2);
    expect(component.currentFigure().title).toContain('FIG. 2');
  });

  it('should switch tabs to pledge and access open patent pledge details', () => {
    component.activeTab.set('pledge');
    expect(component.activeTab()).toBe('pledge');
    expect(component.academicBibtex).toContain('pocketgull2026conformal');
    expect(component.academicBibtex).toContain('PG-PAT-2026-CONF-001');
    expect(component.academicBibtex).toContain('35 U.S.C. § 102');

    const writeTextSpy = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy }
    });

    component.copyOpenPatentPledge();
    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('should copy text to clipboard when copyText is called', () => {
    const writeTextSpy = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy }
    });

    component.copyText('Test Patent Claim');
    expect(writeTextSpy).toHaveBeenCalledWith('Test Patent Claim');
    expect(component.copiedText()).toBe(true);
  });

  it('should copy all 20 provisional claims and full spec', () => {
    const writeTextSpy = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy }
    });

    component.copyAllProvisionalClaims();
    expect(writeTextSpy).toHaveBeenCalled();

    component.copyFullProvisionalSpec();
    expect(writeTextSpy).toHaveBeenCalledWith(component.provisionalBinder.fullSpecificationMarkdown);
  });
});

