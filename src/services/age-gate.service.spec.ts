import { TestBed } from '@angular/core/testing';
import { AgeGateService, UserAgeTier } from './age-gate.service';
import { SecureStorageService } from './secure-storage.service';

describe('AgeGateService', () => {
  let service: AgeGateService;
  let mockStorage: any;
  let storageMap: Map<string, string>;

  beforeEach(() => {
    storageMap = new Map<string, string>();

    mockStorage = {
      isAvailable: true,
      getItem: vi.fn((key: string) => storageMap.get(key) || null),
      setItem: vi.fn((key: string, val: string) => storageMap.set(key, val)),
      removeItem: vi.fn((key: string) => storageMap.delete(key)),
    };

    TestBed.configureTestingModule({
      providers: [
        AgeGateService,
        { provide: SecureStorageService, useValue: mockStorage },
      ],
    });

    service = TestBed.inject(AgeGateService);
  });

  it('should initialize with no tier selected by default', () => {
    expect(service.userTier()).toBeNull();
    expect(service.hasSelectedTier()).toBe(false);
    expect(service.isPediatricMode()).toBe(false);
    expect(service.isClinicianMode()).toBe(false);
    expect(service.isYouthProtected()).toBe(false);
  });

  it('should select adult tier and persist to storage', () => {
    service.selectTier('adult');
    expect(service.userTier()).toBe('adult');
    expect(service.hasSelectedTier()).toBe(true);
    expect(service.isPediatricMode()).toBe(false);
    expect(service.isClinicianMode()).toBe(false);
    expect(mockStorage.setItem).toHaveBeenCalledWith('pg_age_tier_v1', 'adult');
    expect(service.getAiDirectivePrompt()).toContain('ADULT HOLISTIC CARE STRATEGY MODE');
  });

  it('should select parent tier and activate pediatric safety constraints', () => {
    service.selectTier('parent');
    expect(service.userTier()).toBe('parent');
    expect(service.isPediatricMode()).toBe(true);
    expect(service.isClinicianMode()).toBe(false);
    expect(service.getAiDirectivePrompt()).toContain('PEDIATRIC GUARDIAN SAFETY MODE');
    expect(service.getAiDirectivePrompt()).toContain('infant fever');
  });

  it('should select clinician tier and activate clinician expert mode', () => {
    service.selectTier('clinician');
    expect(service.userTier()).toBe('clinician');
    expect(service.isClinicianMode()).toBe(true);
    expect(service.isPediatricMode()).toBe(false);
    expect(service.getAiDirectivePrompt()).toContain('HEALTHCARE PRACTITIONER EXPERT MODE');
    expect(service.getAiDirectivePrompt()).toContain('LOINC');
  });

  it('should select minor tier and activate youth crisis safety mode', () => {
    service.selectTier('minor');
    expect(service.userTier()).toBe('minor');
    expect(service.isYouthProtected()).toBe(true);
    expect(service.isPediatricMode()).toBe(true);
    expect(service.getAiDirectivePrompt()).toContain('YOUTH EDUCATION & CRISIS SAFETY MODE');
    expect(service.getAiDirectivePrompt()).toContain('988');
  });

  it('should reset tier when resetTier is invoked', () => {
    service.selectTier('adult');
    expect(service.hasSelectedTier()).toBe(true);

    service.resetTier();
    expect(service.userTier()).toBeNull();
    expect(service.hasSelectedTier()).toBe(false);
    expect(mockStorage.removeItem).toHaveBeenCalledWith('pg_age_tier_v1');
  });

  it('should load stored tier on startup', () => {
    storageMap.set('pg_age_tier_v1', 'clinician');
    service.loadStoredTier();
    expect(service.userTier()).toBe('clinician');
    expect(service.isClinicianMode()).toBe(true);
  });
});
