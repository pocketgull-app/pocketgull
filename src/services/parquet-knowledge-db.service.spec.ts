import { TestBed } from '@angular/core/testing';
import { ParquetKnowledgeDbService } from './parquet-knowledge-db.service';

describe('ParquetKnowledgeDbService', () => {
  let service: ParquetKnowledgeDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParquetKnowledgeDbService]
    });
    service = TestBed.inject(ParquetKnowledgeDbService);
  });

  it('should initialize columnar vectors and dictionary encoding', () => {
    expect(service).toBeTruthy();
    expect(service.isInitialized()).toBe(true);
    expect(service.recordCount()).toBeGreaterThanOrEqual(10);
  });

  it('should query dynamic context chips for Louise Sloan optotypes', () => {
    const chips = service.queryContextChips('sloan', 'clinician');
    expect(chips.length).toBeGreaterThan(0);

    const hasDeepDive = chips.some(c => c.type === 'deepDive');
    expect(hasDeepDive).toBe(true);

    const labels = chips.map(c => c.label);
    expect(labels.some(l => l.includes('5 arcminutes'))).toBe(true);
  });

  it('should prioritize plain language chips in patient persona', () => {
    const patientChips = service.queryContextChips('sloan', 'patient');
    expect(patientChips.length).toBeGreaterThan(0);

    // Patient score for plainLanguage is boosted to 1.05
    const topChip = patientChips[0];
    expect(topChip.type).toBe('plainLanguage');
    expect(topChip.icon).toBe('💡');
  });

  it('should prune chips that were already asked in recent conversation', () => {
    const initialChips = service.queryContextChips('ismp', 'clinician');
    const firstQuery = initialChips[0].query;

    const followUpChips = service.queryContextChips('ismp', 'clinician', [firstQuery]);
    expect(followUpChips.some(c => c.query === firstQuery)).toBe(false);
  });

  it('should perform 1-hop CSR graph traversal to related nodes', () => {
    // Bouma lateral crowding connects to Sloan and ISMP
    const chips = service.queryContextChips('bouma', 'clinician');
    const hasGraphHop = chips.some(c => c.icon === '🔗');
    expect(hasGraphHop).toBe(true);
  });

  it('should support PEMDA+ order of operations chips', () => {
    const pemdaChips = service.queryContextChips('pemda-e', 'clinician');
    expect(pemdaChips.some(c => c.type === 'pemda')).toBe(true);
    expect(pemdaChips.some(c => c.pillar === 'Empirical Optics')).toBe(true);
  });

  it('should export columnar binary buffer with PAR1 magic header', () => {
    const buffer = service.exportColumnarBuffer();
    expect(buffer).toBeTruthy();
    expect(buffer.byteLength).toBeGreaterThan(16);

    const magic = new Uint8Array(buffer, 0, 4);
    // 'PAR1' in ASCII: 0x50, 0x41, 0x52, 0x31
    expect(magic[0]).toBe(0x50);
    expect(magic[1]).toBe(0x41);
    expect(magic[2]).toBe(0x52);
    expect(magic[3]).toBe(0x31);
  });
});
