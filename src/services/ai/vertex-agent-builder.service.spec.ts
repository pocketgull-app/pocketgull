import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { expect } from 'vitest';
import { VertexAgentBuilderService, IVertexSearchResponse } from './vertex-agent-builder.service';

describe('VertexAgentBuilderService', () => {
  let service: VertexAgentBuilderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VertexAgentBuilderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(VertexAgentBuilderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with default high grounding score and empty citations', () => {
    expect(service.groundingScore()).toBe(0.95);
    expect(service.isHighGrounding()).toBe(true);
    expect(service.citationCount()).toBe(0);
    expect(service.topEvidenceTier()).toBe('None');
    expect(service.isLoading()).toBe(false);
  });

  it('should handle empty query gracefully without sending HTTP request', () => {
    service.queryGroundedLiterature('').subscribe((res) => {
      expect(res.citations.length).toBe(0);
      expect(res.groundingScore).toBe(0);
    });
  });

  it('should dispatch POST request and update signals on success', () => {
    const mockResponse: IVertexSearchResponse = {
      query: 'Hypertension guideline',
      groundingScore: 0.96,
      summary: 'Target SBP < 120 mmHg',
      citations: [
        {
          title: 'SPRINT Trial',
          uri: 'https://doi.org/10.1056/NEJMoa1511939',
          snippet: 'Reduced cardiovascular events',
          relevanceScore: 0.98,
          evidenceTier: 'Tier A (RCT)',
        },
      ],
    };

    service.queryGroundedLiterature('Hypertension guideline').subscribe((res) => {
      expect(res.groundingScore).toBe(0.96);
      expect(service.groundingScore()).toBe(0.96);
      expect(service.isHighGrounding()).toBe(true);
      expect(service.citationCount()).toBe(1);
      expect(service.topEvidenceTier()).toBe('Tier A (RCT)');
      expect(service.summary()).toBe('Target SBP < 120 mmHg');
      expect(service.isLoading()).toBe(false);
    });

    const req = httpMock.expectOne('/api/v1/agent-builder/search');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ query: 'Hypertension guideline' });
    req.flush(mockResponse);
  });

  it('should fall back to local clinical citations on network failure', () => {
    service.queryGroundedLiterature('Diabetes lifestyle').subscribe((res) => {
      expect(res.isSimulated).toBe(true);
      expect(service.citationCount()).toBe(2);
      expect(service.topEvidenceTier()).toBe('Tier A (RCT)');
      expect(service.error()).toContain('Network error');
      expect(service.isLoading()).toBe(false);
    });

    const req = httpMock.expectOne('/api/v1/agent-builder/search');
    req.error(new ProgressEvent('Network error'));
  });

  it('should clear state properly on clearState()', () => {
    service.activeQuery.set('Test');
    service.summary.set('Test summary');
    service.clearState();

    expect(service.activeQuery()).toBe('');
    expect(service.summary()).toBe('');
    expect(service.citationCount()).toBe(0);
    expect(service.isLoading()).toBe(false);
  });
});
