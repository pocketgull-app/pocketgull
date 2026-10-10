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

  it('should initialize with all 20 patent claim clusters', () => {
    expect(service.totalClusters()).toBe(20);
  });

  it('should sum exactly 400 total staked patent claims', () => {
    expect(service.totalClaims()).toBe(400);
  });

  it('should load all 9 core statutory copyright, invention, and open pledge clauses', () => {
    expect(service.totalClauses()).toBe(9);
  });

  it('should return complete patent summary with charter document link', () => {
    const summary = service.getPatentSummary();
    expect(summary.totalClaimClusters).toBe(20);
    expect(summary.totalClaimsCount).toBe(400);
    expect(summary.lastUpdated).toBe('2026-10-09');
    expect(summary.charterDocumentPath).toBe('docs/research/POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md');
    expect(summary.clausesDocumentPath).toBe('docs/legal/INVENTION_ASSIGNMENT_AND_COPYRIGHT_CLAUSES.md');
    expect(summary.pledgeDocumentPath).toBe('docs/patents/OPEN_PATENT_PLEDGE_AND_RESEARCH_COVENANT.md');
    expect(summary.clusters.length).toBe(20);
    expect(summary.statutoryClauses.length).toBe(9);
  });

  it('should retrieve specific cluster by ID', () => {
    const cluster = service.getClusterById('cluster-1-popperian-verifier');
    expect(cluster).toBeDefined();
    expect(cluster?.clusterNumber).toBe(1);
    expect(cluster?.claimRange).toBe('Claims 1 – 20');
    expect(cluster?.filingTier).toBe('Provisional Ready');
  });

  it('should retrieve cluster 17 tri-paradigm conformal sepsis', () => {
    const cluster = service.getClusterById('cluster-17-tri-paradigm-conformal-sepsis');
    expect(cluster).toBeDefined();
    expect(cluster?.clusterNumber).toBe(17);
    expect(cluster?.claimRange).toBe('Claims 321 – 340');
    expect(cluster?.title).toContain('Tri-Paradigm Consilience');
  });

  it('should retrieve cluster 18 TIPPSS circular IoMT', () => {
    const cluster = service.getClusterById('cluster-18-tippss-circular-iomt');
    expect(cluster).toBeDefined();
    expect(cluster?.clusterNumber).toBe(18);
    expect(cluster?.claimRange).toBe('Claims 341 – 360');
    expect(cluster?.title).toContain('TIPPSS Trust Ingestion Guard');
  });

  it('should retrieve cluster 19 watershed exposome lineage', () => {
    const cluster = service.getClusterById('cluster-19-watershed-exposome-lineage');
    expect(cluster).toBeDefined();
    expect(cluster?.clusterNumber).toBe(19);
    expect(cluster?.claimRange).toBe('Claims 361 – 380');
    expect(cluster?.title).toContain('Watershed Lineage');
  });

  it('should retrieve cluster 20 transgenerational epigenetics', () => {
    const cluster = service.getClusterById('cluster-20-transgenerational-epigenetics');
    expect(cluster).toBeDefined();
    expect(cluster?.clusterNumber).toBe(20);
    expect(cluster?.claimRange).toBe('Claims 381 – 400');
    expect(cluster?.title).toContain('Transgenerational Epigenetics');
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

  it('should generate complete USPTO provisional patent binder with 20 formal claims and 4 figures', () => {
    const binder = service.getUsptoProvisionalBinder();
    expect(binder.docketNumber).toBe('PG-PAT-2026-CONF-001');
    expect(binder.title).toContain('Tri-Paradigm Consilience');
    expect(binder.claims.length).toBe(20);
    expect(binder.figures.length).toBe(4);
    expect(binder.claims[0].claimType).toBe('System');
    expect(binder.claims[0].isIndependent).toBe(true);
    expect(binder.claims[10].claimType).toBe('Method');
    expect(binder.claims[10].isIndependent).toBe(true);
    expect(binder.claims[18].claimType).toBe('CRM');
    expect(binder.claims[18].isIndependent).toBe(true);

    const markdown = service.exportUsptoProvisionalMarkdown();
    expect(markdown).toContain('PG-PAT-2026-CONF-001');
    expect(markdown).toContain('Claim 1 (System, Independent)');
    expect(markdown).toContain('FIG. 1: System Architecture & Ingestion Pipeline');
  });

  it('should retrieve open patent research pledge and prior art bar clauses', () => {
    const pledgeClause = service.getClauseById('clause-open-patent-pledge-covenant');
    expect(pledgeClause).toBeDefined();
    expect(pledgeClause?.article).toBe('Article VII');
    expect(pledgeClause?.section).toBe('Section 7.01');
    expect(pledgeClause?.title).toContain('Open Patent Research Pledge');
    expect(pledgeClause?.fullText).toContain('Defensive Termination Condition');

    const priorArtClause = service.getClauseById('clause-prior-art-bar');
    expect(priorArtClause).toBeDefined();
    expect(priorArtClause?.article).toBe('Article VII');
    expect(priorArtClause?.section).toBe('Section 7.02');
    expect(priorArtClause?.title).toContain('Statutory Prior Art Bar');
    expect(priorArtClause?.fullText).toContain('35 U.S.C. § 102(a)(1)');
  });

  it('should export open patent pledge markdown with defensive termination and prior art bar', () => {
    const pledgeMd = service.exportOpenPatentPledgeMarkdown();
    expect(pledgeMd).toContain('POCKETGULL OPEN PATENT PLEDGE & ACADEMIC RESEARCH COVENANT');
    expect(pledgeMd).toContain('Defensive Termination Condition');
    expect(pledgeMd).toContain('35 U.S.C. § 102(a)(1)');
    expect(pledgeMd).toContain('Phil Gear');
    expect(pledgeMd).toContain('all 20 Invention Clusters, Claims 1–400');
  });
});
