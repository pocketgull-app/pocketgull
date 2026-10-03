import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { OknKnowledgeGraphService } from './okn-knowledge-graph.service';

describe('OknKnowledgeGraphService', () => {
  let service: OknKnowledgeGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OknKnowledgeGraphService]
    });
    service = TestBed.inject(OknKnowledgeGraphService);
  });

  it('should initialize with curated seed nodes and edges across NIH, USGS, and EPA', () => {
    expect(service.totalNodes()).toBeGreaterThan(0);
    expect(service.totalEdges()).toBeGreaterThan(0);
  });

  it('should traverse multi-hop paths across agency silos for statin-ubiquinone depletion', async () => {
    const result = await service.queryCrossAgencyGraph('Atorvastatin');
    expect(result.connectedPaths.length).toBeGreaterThan(0);
    expect(result.hipaaSafeHarborAttested).toBe(true);
    expect(result.sha256AttestationSeal).toBeDefined();

    const path = result.connectedPaths[0];
    expect(path.participatingAgencies).toContain('NIH');
    expect(path.pathDescription).toContain('Atorvastatin');
    expect(path.pathDescription).toContain('HMG-CoA Reductase');
  });

  it('should traverse cross-agency paths connecting USGS groundwater to EPA PFAS and NIH liver steatosis', async () => {
    const result = await service.queryCrossAgencyGraph('Alluvial Groundwater');
    expect(result.connectedPaths.length).toBeGreaterThan(0);

    const crossAgencyPath = result.connectedPaths.find(p => p.participatingAgencies.includes('USGS') && p.participatingAgencies.includes('EPA'));
    expect(crossAgencyPath).toBeDefined();
    expect(crossAgencyPath?.participatingAgencies).toContain('USGS');
    expect(crossAgencyPath?.participatingAgencies).toContain('EPA');
  });

  it('should generate an NSF OKN verification badge with audit trail hash for clinical provenance', async () => {
    const badge = await service.verifyRecommendationProvenance('Photobiomodulation');
    expect(badge.isVerified).toBe(true);
    expect(badge.badgeLabel).toBe('[🏛️ NSF OKN Verified]');
    expect(badge.agencySources).toContain('NSF');
    expect(badge.auditTrailHash).toBeDefined();
  });

  it('should return unverified badge for disconnected arbitrary terms with null hypothesis intact', async () => {
    const badge = await service.verifyRecommendationProvenance('Unicorn Crystal Frequency Therapy');
    expect(badge.isVerified).toBe(false);
    expect(badge.badgeLabel).toBe('[⚠️ Unverified in OKN]');
    expect(badge.agencySources.length).toBe(0);
  });
});
