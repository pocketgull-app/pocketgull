import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AmazonCreatorsApiService, FTC_AMAZON_DISCLOSURE, CLINICAL_CURATED_AMAZON_CATALOG } from './amazon-creators-api.service';

describe('AmazonCreatorsApiService Unit Suite', () => {
  let service: AmazonCreatorsApiService;
  let mockHttpClient: { get: (url: string, options?: unknown) => unknown };

  beforeEach(() => {
    mockHttpClient = {
      get: () => of({ items: [], totalResults: 0 })
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    service = runInInjectionContext(injector, () => new AmazonCreatorsApiService());
  });

  it('1. Initializes with official affiliate tag and ready state', () => {
    expect(service.affiliateTag()).toBe('pgdpo-20');
    expect(service.isSearching()).toBe(false);
    expect(service.lastError()).toBeNull();
  });

  it('2. Returns curated bibliotherapy items on offline fallback search', async () => {
    const res = await service.searchProducts('woodworking tools', { category: 'books_bibliotherapy' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.searchQuery).toBe('woodworking tools');
    expect(res.affiliateTag).toBe('pgdpo-20');
    expect(res.disclaimer).toBe(FTC_AMAZON_DISCLOSURE);
    expect(res.items[0].category).toBe('books_bibliotherapy');
  });

  it('3. Filters for HSA/FSA eligible items properly', async () => {
    const res = await service.searchProducts('blood pressure monitor', { hsaOnly: true });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(item.hsaFsaEligible).toBe(true);
    }
  });

  it('4. Retrieves specific item by ASIN from curated catalog', async () => {
    const item = await service.getItemByAsin('B07S2CV4N7');
    expect(item).not.toBeNull();
    expect(item?.title).toContain('Omron');
    expect(item?.hsaFsaEligible).toBe(true);
    expect(item?.evidenceScore).toContain('AHA Class I-A');
  });

  it('5. Generates valid affiliate URLs containing tag parameter', () => {
    const asinUrl = service.generateAffiliateUrl('B08F9Y85G6');
    expect(asinUrl).toBe('https://www.amazon.com/dp/B08F9Y85G6?tag=pgdpo-20');

    const searchUrl = service.generateSearchUrl('pulse oximeter');
    expect(searchUrl).toBe('https://www.amazon.com/s?k=pulse%20oximeter&tag=pgdpo-20');
  });

  it('6. Uses 1-hour cache for identical queries', async () => {
    const firstCall = await service.searchProducts('gardening kit');
    const secondCall = await service.searchProducts('gardening kit');
    expect(firstCall).toBe(secondCall);
  });
});
