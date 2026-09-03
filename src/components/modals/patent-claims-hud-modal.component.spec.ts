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

  it('should default to inventions tab with 16 clusters', () => {
    expect(component.activeTab()).toBe('inventions');
    expect(component.filteredClusters().length).toBe(16);
  });

  it('should filter clusters based on search query', () => {
    component.searchQuery.set('WebGPU');
    expect(component.filteredClusters().length).toBe(1);
    expect(component.filteredClusters()[0].id).toBe('cluster-2-webgpu-bio-signals');
  });

  it('should switch tabs to clauses and filter statutory clauses', () => {
    component.activeTab.set('clauses');
    expect(component.filteredClauses().length).toBe(7);

    component.searchQuery.set('Amazon');
    expect(component.filteredClauses().length).toBe(1);
    expect(component.filteredClauses()[0].id).toBe('clause-ftc-affiliate-governance');
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
});

