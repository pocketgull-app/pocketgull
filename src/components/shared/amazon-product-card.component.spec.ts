import '@angular/compiler';
import { expect, describe, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { AmazonProductCardComponent } from './amazon-product-card.component';
import { IAmazonProductItem } from '../../services/amazon-creators-api.service';

describe('AmazonProductCardComponent', () => {
  const mockProduct: IAmazonProductItem = {
    asin: 'B07S2CV4N7',
    title: 'Omron Complete Wireless Upper Arm Blood Pressure + EKG Monitor',
    detailPageUrl: 'https://www.amazon.com/dp/B07S2CV4N7?tag=pgdpo-20',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300',
    price: { amount: 169.99, currency: 'USD', displayPrice: '$169.99' },
    rating: 4.6,
    ratingsCount: 4720,
    primeEligible: true,
    hsaFsaEligible: true,
    category: 'medical_device',
    clinicalContext: 'FDA Cleared Lead-I EKG + Oscillometric Blood Pressure telemonitoring',
    evidenceScore: 'AHA Class I-A'
  };

  const createComponent = (product: IAmazonProductItem = mockProduct) => {
    const injector = Injector.create({ providers: [] });
    const comp = runInInjectionContext(injector, () => new AmazonProductCardComponent());
    (comp as any).product = () => product;
    return comp;
  };

  it('1. Computes correct category label for medical device', () => {
    const comp = createComponent(mockProduct);
    expect(comp.categoryLabel()).toBe('Medical Device');
  });

  it('2. Computes correct category label for bibliotherapy book', () => {
    const comp = createComponent({ ...mockProduct, category: 'books_bibliotherapy' });
    expect(comp.categoryLabel()).toBe('Bibliotherapy Book');
  });

  it('3. Computes correct category label for supplements and ergonomics', () => {
    const suppComp = createComponent({ ...mockProduct, category: 'supplements' });
    expect(suppComp.categoryLabel()).toBe('Dietary / Orthomolecular');

    const ergoComp = createComponent({ ...mockProduct, category: 'ergonomics' });
    expect(ergoComp.categoryLabel()).toBe('Physical Ergonomics');
  });

  it('4. Computes effective Walmart search URL and related clinical article guide', () => {
    const comp = createComponent(mockProduct);
    expect(comp.effectiveWalmartUrl()).toContain('walmart.com/search?q=');
    expect(comp.effectiveWalmartUrl()).toContain('wmlspartner=pocketgull');
    expect(comp.relatedArticleSlug()).toBe('home-blood-pressure-ecg-monitors-guide');
    expect(comp.relatedArticleTitle()).toContain('FDA 510(k)');
  });
});
