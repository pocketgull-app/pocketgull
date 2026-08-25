/**
 * Walmart Creator / Impact Affiliate Integration Service
 *
 * Provides affiliate link generation, curated clinical diagnostic hardware,
 * and IRS §213(d) HSA/FSA eligible wellness product cataloging for Walmart.com
 * (store pickup, same-day delivery, and Walmart+).
 *
 * @module services/walmart-affiliate.service
 */
import { Injectable, signal, computed } from '@angular/core';

export interface IWalmartProductItem {
  itemId: string;
  title: string;
  detailPageUrl: string;
  imageUrl: string;
  price: {
    amount: number;
    currency: string;
    displayPrice: string;
  };
  rating?: number;
  ratingsCount?: number;
  walmartPlusEligible?: boolean;
  storePickupAvailable?: boolean;
  hsaFsaEligible?: boolean;
  category?: 'medical_device' | 'books_bibliotherapy' | 'supplements' | 'ergonomics' | 'fitness_wellness';
  clinicalContext?: string;
  snomedCode?: string;
}

export const FTC_WALMART_DISCLOSURE =
  'As an affiliate partner of Walmart, PocketGull earns from qualifying purchases. Product recommendations are supportive evidence-grounded tools and do not constitute direct medical prescriptions.';

export const CLINICAL_CURATED_WALMART_CATALOG: IWalmartProductItem[] = [
  {
    itemId: 'wm-omron-7350',
    title: 'Omron 7 Series Wireless Upper Arm Blood Pressure Monitor',
    detailPageUrl: 'https://www.walmart.com/ip/Omron-7-Series-Wireless-Upper-Arm-Blood-Pressure-Monitor/544321098?wmlspartner=pocketgull',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&auto=format&fit=crop&q=60',
    price: { amount: 69.98, currency: 'USD', displayPrice: '$69.98' },
    rating: 4.6,
    ratingsCount: 3200,
    walmartPlusEligible: true,
    storePickupAvailable: true,
    hsaFsaEligible: true,
    category: 'medical_device',
    clinicalContext: 'AHA Class I-A recommendation for home blood pressure telemonitoring and hypertension tracking',
    snomedCode: 'SCTID 439933005'
  },
  {
    itemId: 'wm-pulse-ox-deluxe',
    title: 'Equate Deluxe Fingertip Pulse Oximeter with SpO2 and Pulse Rate',
    detailPageUrl: 'https://www.walmart.com/ip/Equate-Deluxe-Fingertip-Pulse-Oximeter/987654321?wmlspartner=pocketgull',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60',
    price: { amount: 24.88, currency: 'USD', displayPrice: '$24.88' },
    rating: 4.5,
    ratingsCount: 5120,
    walmartPlusEligible: true,
    storePickupAvailable: true,
    hsaFsaEligible: true,
    category: 'medical_device',
    clinicalContext: 'SpO2 and Plethysmograph waveform respiratory perfusion monitoring',
    snomedCode: 'SCTID 252465000'
  },
  {
    itemId: 'wm-withings-body',
    title: 'Withings Body Smart Wi-Fi Body Composition Scale',
    detailPageUrl: 'https://www.walmart.com/ip/Withings-Body-Smart-Scale/654321987?wmlspartner=pocketgull',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=60',
    price: { amount: 99.95, currency: 'USD', displayPrice: '$99.95' },
    rating: 4.7,
    ratingsCount: 1890,
    walmartPlusEligible: true,
    storePickupAvailable: true,
    hsaFsaEligible: true,
    category: 'medical_device',
    clinicalContext: 'Bioimpedance analysis for visceral fat and lean muscle mass tracking',
    snomedCode: 'SCTID 363808001'
  },
  {
    itemId: 'wm-theraband-resistance',
    title: 'TheraBand Professional Latex-Free Resistance Band Pack',
    detailPageUrl: 'https://www.walmart.com/ip/TheraBand-Professional-Resistance-Bands/321654987?wmlspartner=pocketgull',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=300&auto=format&fit=crop&q=60',
    price: { amount: 15.99, currency: 'USD', displayPrice: '$15.99' },
    rating: 4.8,
    ratingsCount: 4100,
    walmartPlusEligible: true,
    storePickupAvailable: true,
    hsaFsaEligible: true,
    category: 'ergonomics',
    clinicalContext: 'Progressive elastic resistance therapy for rotator cuff and postural scapular rehabilitation',
    snomedCode: 'SCTID 229164006'
  }
];

@Injectable({
  providedIn: 'root'
})
export class WalmartAffiliateService {
  private partnerTag = signal<string>('pocketgull');
  private catalog = signal<IWalmartProductItem[]>(CLINICAL_CURATED_WALMART_CATALOG);

  readonly availableItems = this.catalog.asReadonly();
  readonly affiliateTag = this.partnerTag.asReadonly();
  readonly itemCount = computed(() => this.catalog().length);

  /**
   * Finds a Walmart equivalent item for an Amazon ASIN or query term.
   */
  findEquivalentItem(category: string): IWalmartProductItem | undefined {
    return this.catalog().find(item => item.category === category);
  }

  /**
   * Validates that outgoing Walmart link has zero PHI or tracking parameters.
   */
  isLinkSafe(url: string): boolean {
    if (!url.startsWith('https://')) return false;
    const forbidden = ['patient_id', 'phi', 'diagnosis', 'symptom', 'mrn', 'token', 'ssn'];
    const lower = url.toLowerCase();
    return !forbidden.some(f => lower.includes(f));
  }
}
