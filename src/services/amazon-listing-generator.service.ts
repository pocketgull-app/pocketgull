import { Injectable, signal } from '@angular/core';

export interface IAmazonListingSku {
  sku: string;
  asin?: string;
  title: string;
  brand: 'PocketGull Fine Art' | 'PocketGull Studio';
  productCategory: 'Home & Kitchen > Wall Art > Posters & Prints';
  standardPrice: number;
  currency: 'USD';
  fulfillmentChannel: 'DEFAULT' | 'AMAZON_NA'; // Merchant Fulfilled (Print-on-Demand) or FBA
  bulletPoints: string[];
  productDescriptionHtml: string;
  backendSearchTerms: string[];
  targetAudience: string[];
  dimensions: {
    aspectRatio: '3:4';
    standardSizesInches: string[];
    orientation: 'Vertical / Portrait';
  };
  imageUrls: string[];
  spApiPayload: {
    productType: 'WALL_ART';
    requirements: 'LISTING_OFFER_ONLY' | 'LISTING';
    attributes: Record<string, any>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AmazonListingGeneratorService {
  readonly activeListings = signal<IAmazonListingSku[]>([]);

  /**
   * Catalog of ready-to-publish Amazon Marketplace listings for the Full-Bleed Cell Biology Wall Art Trilogy.
   */
  private readonly trilogyListings: IAmazonListingSku[] = [
    {
      sku: 'PG-ART-CELL-001-3X4',
      title: 'PocketGull Eukaryotic Cell Biology 3D Paper Quilling Wall Art Print - Full-Bleed Modern Science Poster for Doctors, Medical Clinics, Labs & Neuroscience Decor (18x24, 24x32)',
      brand: 'PocketGull Fine Art',
      productCategory: 'Home & Kitchen > Wall Art > Posters & Prints',
      standardPrice: 38.00,
      currency: 'USD',
      fulfillmentChannel: 'DEFAULT',
      bulletPoints: [
        'MUSEUM-GRADE FINE ART PRINT: Exquisite full-bleed, edge-to-edge macro capture of intricate handcrafted 3D paper quilling cell biology featuring glowing golden mitochondria, violet endoplasmic reticulum, turquoise Golgi apparatus, and indigo cytoplasm.',
        'ZERO BORDERS & FULL-BLEED DESIGN: Completely borderless, direct flat-lay top-down composition designed to fit standard 3:4 frames (9x12, 12x16, 18x24, 24x32, 30x40 inches) with no white margins.',
        'ARCHIVAL QUALITY 300+ DPI: Printed on heavy 300 gsm acid-free archival matte cotton rag paper with fade-resistant pigment inks guaranteeing 100+ years of vibrant color fidelity.',
        'PERFECT CLINICAL & ACADEMIC DECOR: Thoughtfully designed for medical offices, hospital executive suites, neurology departments, biology classrooms, university labs, and modern minimalist interiors.',
        'SUSTAINABLE & MADE ON DEMAND: Produced using eco-friendly non-toxic aqueous inks and FSC-certified paper stock. 100% satisfaction guarantee.'
      ],
      productDescriptionHtml: `
<p><strong>Transform Any Space into a Celebration of Cellular Biology and Fine Craftsmanship</strong></p>
<p>The <em>PocketGull Eukaryotic Cell Macro Print</em> brings the hidden microscopic elegance of human cellular life into breathtaking artistic focus. Featuring intricate 3D paper quilling techniques with tactile paper edges, warm glowing amber mitochondrial cristae, and swirling indigo cytoplasm, this print bridges advanced medical science with contemporary fine art.</p>
<p><strong>Product Details:</strong></p>
<ul>
  <li>Full-bleed edge-to-edge borderless vertical print</li>
  <li>Standard 3:4 aspect ratio (ideal for 18x24 in and 24x32 in frames)</li>
  <li>Printed on museum-grade 300 gsm archival matte fine art paper</li>
  <li>Shipped in heavy-duty protective cardboard tubes</li>
</ul>
      `.trim(),
      backendSearchTerms: [
        'medical wall art doctor office decor biology teacher gift cell biology print science poster',
        'mitochondria paper art neuroscience gifts lab decor anatomy art print histology medical student',
        'giclee fine art print full bleed poster 18x24 24x32 modern wall decor stem graduation gift'
      ],
      targetAudience: ['Physicians', 'Medical Students', 'Biology Teachers', 'Neuroscientists', 'Biotech Executives', 'Art Collectors'],
      dimensions: {
        aspectRatio: '3:4',
        standardSizesInches: ['12x16', '18x24', '24x32', '30x40'],
        orientation: 'Vertical / Portrait'
      },
      imageUrls: [
        'https://pocketgull.app/assets/art/cell_fullbleed_300dpi.jpg'
      ],
      spApiPayload: {
        productType: 'WALL_ART',
        requirements: 'LISTING',
        attributes: {
          item_name: [{ value: 'PocketGull Eukaryotic Cell Biology 3D Paper Quilling Wall Art Print - Full-Bleed Modern Science Poster (18x24, 24x32)', language_tag: 'en_US' }],
          brand: [{ value: 'PocketGull Fine Art', language_tag: 'en_US' }],
          color: [{ value: 'Multicolor Indigo Gold Violet', language_tag: 'en_US' }],
          material: [{ value: 'Archival Cotton Rag Paper', language_tag: 'en_US' }],
          item_type_keyword: [{ value: 'wall-art-prints' }],
          condition_type: [{ value: 'new_new' }],
          purchasable_offer: [{
            currency: 'USD',
            our_price: [{ schedule: [{ value_with_tax: 38.00 }] }]
          }]
        }
      }
    },
    {
      sku: 'PG-ART-SYNAPSE-002-3X4',
      title: 'PocketGull Neural Synapse & Neurotransmitter 3D Paper Quilling Wall Art Print - Full-Bleed Brain Chemistry Poster for Neurologists, Psychologists & Science Decor (18x24, 24x32)',
      brand: 'PocketGull Fine Art',
      productCategory: 'Home & Kitchen > Wall Art > Posters & Prints',
      standardPrice: 38.00,
      currency: 'USD',
      fulfillmentChannel: 'DEFAULT',
      bulletPoints: [
        'NEUROSCIENCE MASTERPIECE: Full-bleed, edge-to-edge 3D paper quilling depicting synaptic transmission—glowing amber vesicles releasing turquoise and cyan neurotransmitters into the deep indigo synaptic cleft.',
        'BORDERLESS FULL-BLEED PRINT: Completely flat, borderless format designed for seamless framing in any standard 3:4 frame (9x12, 12x16, 18x24, 24x32, 30x40 inches).',
        'ARCHIVAL GICLÉE QUALITY: Printed on heavy 300 gsm acid-free cotton rag fine art paper with 12-color archival pigment inks.',
        'DESIGNED FOR BRAIN & MIND HUBS: Ideal for neurology clinics, psychology practices, psychiatric offices, sleep labs, and university research facilities.',
        'ETHICALLY PRODUCED & FSC CERTIFIED: 100% eco-friendly aqueous inks and sustainably harvested paper stock.'
      ],
      productDescriptionHtml: `
<p><strong>Illuminate the Wonder of Human Thought and Neural Communication</strong></p>
<p>The <em>PocketGull Synaptic Transmission Print</em> captures the electrical and chemical dance of human consciousness. Crafted using layered paper quilling techniques with tactile depth and luminous contrast, this artwork depicts the miraculous moment neurotransmitters cross from presynaptic axon to postsynaptic dendrite.</p>
      `.trim(),
      backendSearchTerms: [
        'neuroscience wall art psychology office decor brain print neurology gift synapse poster',
        'neurotransmitter dopamine serotonin art psychiatrist gift mental health counselor therapist decor',
        'full bleed science poster medical student graduation cognitive science brain anatomy art'
      ],
      targetAudience: ['Neurologists', 'Psychologists', 'Psychiatrists', 'Therapists', 'Neuroscientists', 'Science Enthusiasts'],
      dimensions: {
        aspectRatio: '3:4',
        standardSizesInches: ['12x16', '18x24', '24x32', '30x40'],
        orientation: 'Vertical / Portrait'
      },
      imageUrls: [
        'https://pocketgull.app/assets/art/synapse_fullbleed_300dpi.jpg'
      ],
      spApiPayload: {
        productType: 'WALL_ART',
        requirements: 'LISTING',
        attributes: {
          item_name: [{ value: 'PocketGull Neural Synapse & Neurotransmitter 3D Paper Quilling Wall Art Print (18x24, 24x32)', language_tag: 'en_US' }],
          brand: [{ value: 'PocketGull Fine Art', language_tag: 'en_US' }],
          item_type_keyword: [{ value: 'wall-art-prints' }]
        }
      }
    },
    {
      sku: 'PG-ART-MITO-003-3X4',
      title: 'PocketGull Mitochondria Powerhouse of the Cell 3D Paper Quilling Wall Art Print - Full-Bleed Bio-Energetics & ATP Science Poster for Doctors, Labs & Longevity Enthusiasts (18x24, 24x32)',
      brand: 'PocketGull Fine Art',
      productCategory: 'Home & Kitchen > Wall Art > Posters & Prints',
      standardPrice: 38.00,
      currency: 'USD',
      fulfillmentChannel: 'DEFAULT',
      bulletPoints: [
        'THE CELLULAR POWERHOUSE IN GOLD: Full-bleed macro view of an illuminated biological mitochondrion featuring radiant golden and amber folded cristae surrounded by vibrant turquoise ATP streams and deep violet membranes.',
        '100% BORDERLESS FULL-BLEED FORMAT: Edge-to-edge fine art composition ready for direct framing in standard 3:4 frames (12x16, 18x24, 24x32, 30x40 inches).',
        'MUSEUM ARCHIVAL PAPER: Printed on 300 gsm 100% cotton smooth rag paper with archival longevity rating of 100+ years.',
        'THE ICONIC LONGEVITY & HEALTHSPAN GIFT: Celebrated by functional medicine practitioners, mitochondrial researchers, cellular biologists, and biohackers.',
        'ECO-CONSCIOUS PACKAGING: Delivered in rigid reinforced protective shipping tubes.'
      ],
      productDescriptionHtml: `
<p><strong>Celebrate the Engine of Human Vitality and Longevity</strong></p>
<p>The <em>PocketGull Mitochondria Bio-Energetic Core Print</em> honors the ancient, miraculous organelle that generates over 90% of our cellular energy. Rendered in glowing metallic gold and deep indigo paper quilling layers, this fine art print turns cellular biochemistry into a timeless work of art.</p>
      `.trim(),
      backendSearchTerms: [
        'mitochondria poster powerhouse of the cell wall art biology gift functional medicine clinic decor',
        'atp synthesis science art cellular biology longevity healthspan biohacking decor doctor office',
        'full bleed modern science print giclee 18x24 24x32 medical school graduation gift'
      ],
      targetAudience: ['Cellular Biologists', 'Functional Medicine Doctors', 'Biohackers', 'Longevity Researchers', 'Science Students'],
      dimensions: {
        aspectRatio: '3:4',
        standardSizesInches: ['12x16', '18x24', '24x32', '30x40'],
        orientation: 'Vertical / Portrait'
      },
      imageUrls: [
        'https://pocketgull.app/assets/art/mitochondria_fullbleed_300dpi.jpg'
      ],
      spApiPayload: {
        productType: 'WALL_ART',
        requirements: 'LISTING',
        attributes: {
          item_name: [{ value: 'PocketGull Mitochondria Powerhouse of the Cell 3D Paper Quilling Wall Art Print (18x24, 24x32)', language_tag: 'en_US' }],
          brand: [{ value: 'PocketGull Fine Art', language_tag: 'en_US' }],
          item_type_keyword: [{ value: 'wall-art-prints' }]
        }
      }
    }
  ];

  /**
   * Generates a complete, ready-to-publish Amazon SP-API / Seller Central Listing Package.
   */
  generateAmazonListings(selectedSku?: string): IAmazonListingSku[] {
    if (selectedSku) {
      const match = this.trilogyListings.filter(l => l.sku === selectedSku || l.sku.includes(selectedSku.toUpperCase()));
      if (match.length > 0) {
        this.activeListings.set(match);
        return match;
      }
    }
    this.activeListings.set(this.trilogyListings);
    return this.trilogyListings;
  }

  /**
   * Generates Amazon SP-API JSON Feeds payload for batch catalog ingestion via Listings Items API.
   */
  exportSpApiListingsFeed(): {
    header: {
      sellerId: string;
      version: string;
      issueLocale: string;
    };
    messages: Array<{
      messageId: number;
      sku: string;
      operationType: 'UPDATE';
      product: any;
    }>;
  } {
    return {
      header: {
        sellerId: 'POCKETGULL-SELLER-NA',
        version: '2021-08-01',
        issueLocale: 'en_US'
      },
      messages: this.trilogyListings.map((listing, idx) => ({
        messageId: idx + 1,
        sku: listing.sku,
        operationType: 'UPDATE',
        product: listing.spApiPayload
      }))
    };
  }
}
