import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { VertexSearchComponent, IVertexSearchResult } from './vertex-search.component';

describe('VertexSearchComponent', () => {
  let component: VertexSearchComponent;
  let mockHttp: any;
  let mockSanitizer: any;

  beforeEach(() => {
    mockHttp = {
      post: vi.fn()
    };
    mockSanitizer = {
      bypassSecurityTrustHtml: vi.fn((val: string) => val)
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    });

    component = runInInjectionContext(injector, () => new VertexSearchComponent());
  });

  it('should initialize component signals with defaults', () => {
    expect(component).toBeTruthy();
    expect(component.searchQuery()).toBe('');
    expect(component.isLoading()).toBe(false);
    expect(component.hasSearched()).toBe(false);
    expect(component.results().length).toBe(0);
    expect(component.error()).toBeNull();
  });

  it('should perform search and populate results on success', async () => {
    const mockResults: IVertexSearchResult[] = [
      {
        document: {
          id: 'doc-001',
          name: 'projects/123/locations/global/collections/default/dataStores/ds/branches/0/documents/doc-001',
          derivedStructData: {
            title: 'Hypertension Clinical Protocol',
            link: 'https://example.com/protocol.pdf',
            extractive_answers: [{ content: 'First-line therapy includes ACE inhibitors.' }]
          }
        }
      }
    ];

    mockHttp.post.mockReturnValue(of({ results: mockResults }));

    component.searchQuery.set('hypertension management');
    await component.performSearch();

    expect(mockHttp.post).toHaveBeenCalledWith('/api/ai/vertex-search', { query: 'hypertension management' });
    expect(component.results()).toEqual(mockResults);
    expect(component.isLoading()).toBe(false);
    expect(component.hasSearched()).toBe(true);
    expect(component.error()).toBeNull();
  });

  it('should handle search error gracefully', async () => {
    mockHttp.post.mockReturnValue(throwError(() => ({ error: { error: 'Quota exceeded' } })));

    component.searchQuery.set('rare cardiac condition');
    await component.performSearch();

    expect(component.results()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toContain('Quota exceeded');
  });

  it('should extract title, link, and snippet correctly', () => {
    const mockResult: IVertexSearchResult = {
      document: {
        id: 'doc-002',
        name: 'doc-002',
        derivedStructData: {
          title: 'Sepsis Guidelines 2026',
          link: 'https://example.com/sepsis',
          snippets: [{ snippet: 'Administer broad-spectrum antibiotics within 1 hour.' }]
        }
      }
    };

    expect(component.getTitle(mockResult)).toBe('Sepsis Guidelines 2026');
    expect(component.getLink(mockResult)).toBe('https://example.com/sepsis');
  });
});
