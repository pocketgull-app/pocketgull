import { TestBed } from '@angular/core/testing';
import { IpPatentRegistryService } from './ip-patent-registry.service';

describe('IpPatentRegistryService', () => {
  let service: IpPatentRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IpPatentRegistryService]
    });
    service = TestBed.inject(IpPatentRegistryService);
  });

  it('should initialize with all 10 patent claim clusters', () => {
    expect(service.totalClusters()).toBe(10);
  });

  it('should sum exactly 200 total staked patent claims', () => {
    expect(service.totalClaims()).toBe(200);
  });

  it('should load all 7 core statutory copyright and invention clauses', () => {
    expect(service.totalClauses()).toBe(7);
  });

  it('should return complete patent summary with charter document link', () => {
    const summary = service.getPatentSummary();
    expect(summary.totalClaimClusters).toBe(10);
    expect(summary.totalClaimsCount).toBe(200);
    expect(summary.charterDocumentPath).toBe('docs/research/POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md');
    expect(summary.clausesDocumentPath).toBe('docs/legal/INVENTION_ASSIGNMENT_AND_COPYRIGHT_CLAUSES.md');
    expect(summary.clusters.length).toBe(10);
    expect(summary.statutoryClauses.length).toBe(7);
  });

  it('should retrieve specific cluster by ID', () => {
    const cluster = service.getClusterById('cluster-1-popperian-verifier');
    expect(cluster).toBeDefined();
    expect(cluster?.clusterNumber).toBe(1);
    expect(cluster?.claimRange).toBe('Claims 1 – 20');
    expect(cluster?.filingTier).toBe('Provisional Ready');
  });

  it('should retrieve specific cluster by cluster number', () => {
    const cluster = service.getClusterByNumber(2);
    expect(cluster).toBeDefined();
    expect(cluster?.id).toBe('cluster-2-webgpu-bio-signals');
    expect(cluster?.totalClaims).toBe(20);
    expect(cluster?.primaryServicePath).toContain('webgpu-bio-signal.service.ts');
  });

  it('should retrieve specific statutory clause by ID', () => {
    const clause = service.getClauseById('clause-marker-font-governance');
    expect(clause).toBeDefined();
    expect(clause?.article).toBe('Article I');
    expect(clause?.section).toBe('Section 1.02');
    expect(clause?.fullText).toContain('Brand Lettering');
  });
});
