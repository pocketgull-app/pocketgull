import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmazonListingGeneratorService, IAmazonListingSku } from '../services/amazon-listing-generator.service';

export interface IArtProduct {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  description: string;
  imageFileName: string;
  colorPalette: string[];
  basePriceUsd: number;
  amazonAffiliateQuery: string;
  scientificConcept: string;
}

@Component({
  selector: 'app-fine-art-storefront',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen bg-[#09090b] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-black">
      
      <!-- Top Header & Navigation -->
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header Banner -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-300 mb-2">
              <span>🎨</span> POCKETGULL FINE ART COLLECTION · 300+ DPI ARCHIVAL GICLÉE
            </div>
            <h1 class="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Cellular Landscapes in 3D Paper Quilling
            </h1>
            <p class="text-sm text-zinc-400 mt-1 max-w-2xl">
              Museum-grade full-bleed printable wall art bridging molecular biology, cognitive neuroscience, and tactile handcrafted paper sculpture.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Zero-Border Full-Bleed</span>
            </span>
          </div>
        </div>

        <!-- Master Art Gallery Showcase (Interactive 3-Piece Grid) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          <!-- Left Column (7 Cols): Active Artwork Large Display & 3D Frame Mockup -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Framing Mockup Container -->
            <div class="relative p-6 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300"
                 [style.background-color]="environmentBackground()">
              
              <!-- Frame Border Style Simulator -->
              <div class="relative transition-all duration-300 shadow-2xl overflow-hidden"
                   [ngClass]="frameClass()"
                   [style.max-width.px]="frameMaxWidth()">
                
                <!-- Full-Bleed Art Image -->
                <div class="aspect-[3/4] w-full relative overflow-hidden bg-black select-none">
                  <div class="absolute inset-0 bg-cover bg-center transition-all duration-500"
                       [style.background-image]="'url(' + activeArt().imageFileName + ')'">
                  </div>
                </div>

              </div>

              <!-- Top Left Aspect Ratio Badge -->
              <div class="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/80 backdrop-blur border border-white/10 text-[11px] font-mono text-zinc-300 pointer-events-none">
                3:4 Standard Ratio · {{ selectedSize() }}
              </div>
            </div>

            <!-- Frame Customizer Controls Bar -->
            <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-zinc-400 font-bold uppercase tracking-wider">FRAME FINISH SELECTOR:</span>
                <span class="text-amber-300 font-bold">{{ selectedFrameName() }}</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-medium">
                <button (click)="selectFrame('walnut')"
                        type="button"
                        class="p-2.5 rounded-xl border transition-all text-center cursor-pointer"
                        [ngClass]="selectedFrame() === 'walnut' ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                  <div class="text-base mb-0.5">🪵</div>
                  <div class="text-[11px]">Dark Walnut</div>
                </button>

                <button (click)="selectFrame('oak')"
                        type="button"
                        class="p-2.5 rounded-xl border transition-all text-center cursor-pointer"
                        [ngClass]="selectedFrame() === 'oak' ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                  <div class="text-base mb-0.5">🌲</div>
                  <div class="text-[11px]">Natural Oak</div>
                </button>

                <button (click)="selectFrame('matte-black')"
                        type="button"
                        class="p-2.5 rounded-xl border transition-all text-center cursor-pointer"
                        [ngClass]="selectedFrame() === 'matte-black' ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                  <div class="text-base mb-0.5">⬛</div>
                  <div class="text-[11px]">Matte Black</div>
                </button>

                <button (click)="selectFrame('brushed-alu')"
                        type="button"
                        class="p-2.5 rounded-xl border transition-all text-center cursor-pointer"
                        [ngClass]="selectedFrame() === 'brushed-alu' ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                  <div class="text-base mb-0.5">🔘</div>
                  <div class="text-[11px]">Brushed Alu</div>
                </button>

                <button (click)="selectFrame('unframed')"
                        type="button"
                        class="p-2.5 rounded-xl border transition-all text-center cursor-pointer"
                        [ngClass]="selectedFrame() === 'unframed' ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                  <div class="text-base mb-0.5">📜</div>
                  <div class="text-[11px]">Unframed Giclée</div>
                </button>
              </div>
            </div>

          </div>

          <!-- Right Column (5 Cols): Product Purchase Card & Sizing -->
          <div class="lg:col-span-5 space-y-6">
            
            <!-- Artwork Info Card -->
            <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5">
              
              <!-- Title & Price -->
              <div>
                <span class="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  {{ activeArt().scientificConcept }}
                </span>
                <h2 class="text-2xl font-serif font-bold text-white mt-1">
                  {{ activeArt().title }}
                </h2>
                <p class="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {{ activeArt().description }}
                </p>
              </div>

              <!-- Size Selection Grid -->
              <div class="space-y-2">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                  Select Print Size:
                </label>
                <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                  @for (size of availableSizes; track size.label) {
                    <button (click)="selectSize(size.label, size.price)"
                            type="button"
                            class="p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer"
                            [ngClass]="selectedSize() === size.label ? 'bg-amber-950/40 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                      <span>{{ size.label }}</span>
                      <span class="font-bold text-white">\${{ size.price }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Price & Checkout Actions -->
              <div class="pt-4 border-t border-zinc-800 space-y-3">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-mono text-zinc-400">TOTAL PRICE:</span>
                  <span class="text-3xl font-black font-mono text-amber-400">\${{ totalPrice() }}.00</span>
                </div>

                <!-- 1-Click Amazon Buy & Stripe Checkout Buttons -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a [href]="amazonSearchUrl()"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="min-h-[48px] px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-center">
                    <span>🛒</span>
                    <span>Buy on Amazon</span>
                  </a>

                  <button (click)="launchStripeCheckout()"
                          type="button"
                          class="min-h-[48px] px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-zinc-700 active:scale-95 cursor-pointer text-center">
                    <span>💳</span>
                    <span>Stripe Checkout</span>
                  </button>
                </div>

                <div class="text-[11px] text-zinc-500 text-center font-mono pt-1">
                  📦 100% Archival Cotton Rag · Free Global Shipping on $75+
                </div>
              </div>

            </div>

            <!-- Artwork Trilogy Thumbnails Selector -->
            <div class="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                THE 3-PIECE WALL ART TRILOGY:
              </span>

              <div class="grid grid-cols-3 gap-3">
                @for (art of artworkCatalog; track art.id) {
                  <button (click)="selectArtwork(art)"
                          type="button"
                          class="group relative rounded-2xl overflow-hidden border transition-all cursor-pointer aspect-[3/4]"
                          [ngClass]="activeArt().id === art.id ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-zinc-800 hover:border-zinc-600'">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                         [style.background-image]="'url(' + art.imageFileName + ')'">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span class="text-[10px] font-mono font-bold text-white truncate">{{ art.title }}</span>
                    </div>
                  </button>
                }
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  `
})
export class FineArtStorefrontComponent {
  amazonService = inject(AmazonListingGeneratorService, { optional: true });

  readonly artworkCatalog: IArtProduct[] = [
    {
      id: 'art-cell-001',
      sku: 'PG-ART-CELL-001-3X4',
      title: 'Eukaryotic Cell Macro',
      subtitle: 'Cellular Landscape in 3D Paper Quilling',
      description: 'Full-bleed macro cellular landscape featuring glowing golden mitochondria, violet endoplasmic reticulum with ribosomal beads, turquoise Golgi apparatus, and swirling indigo cytoplasm.',
      imageFileName: '/assets/veo-frames/paper/scene3_biophysical_twin.jpg',
      colorPalette: ['#1e1b4b', '#f59e0b', '#7c3aed', '#06b6d4'],
      basePriceUsd: 38,
      amazonAffiliateQuery: 'cell biology paper quilling wall art print poster',
      scientificConcept: 'Cellular Cytology & Proteostasis'
    },
    {
      id: 'art-synapse-002',
      sku: 'PG-ART-SYNAPSE-002-3X4',
      title: 'Synaptic Transmission',
      subtitle: 'Neural Junction in Amber & Indigo',
      description: 'Full-bleed neural synapse depicting electrical and chemical neurotransmission with glowing amber vesicle coils and turquoise neurotransmitter flow into the synaptic cleft.',
      imageFileName: '/assets/veo-frames/paper/scene5_tri_paradigm.jpg',
      colorPalette: ['#4c1d95', '#fbbf24', '#0d9488', '#0f172a'],
      basePriceUsd: 38,
      amazonAffiliateQuery: 'neuroscience synapse wall art brain print poster',
      scientificConcept: 'Neurotransmission & Synaptic Plasticity'
    },
    {
      id: 'art-mito-003',
      sku: 'PG-ART-MITO-003-3X4',
      title: 'Mitochondrial Cristae',
      subtitle: 'The Bio-Energetic Core in Gold',
      description: 'Full-bleed biological mitochondrion featuring radiant golden folded cristae surrounded by vibrant turquoise ATP synthesis streams and deep violet outer membranes.',
      imageFileName: '/assets/veo-frames/paper/scene4_organelle_mitochondria.jpg',
      colorPalette: ['#d97706', '#0284c7', '#312e81', '#172554'],
      basePriceUsd: 38,
      amazonAffiliateQuery: 'mitochondria powerhouse of the cell wall art poster',
      scientificConcept: 'Mitochondrial Bio-Energetics & ATP Flux'
    }
  ];

  readonly availableSizes = [
    { label: '12" × 16"', price: 28 },
    { label: '18" × 24"', price: 38 },
    { label: '24" × 32"', price: 54 },
    { label: '30" × 40"', price: 78 }
  ];

  readonly activeArt = signal<IArtProduct>(this.artworkCatalog[0]);
  readonly selectedSize = signal<string>('18" × 24"');
  readonly selectedSizePrice = signal<number>(38);
  readonly selectedFrame = signal<'walnut' | 'oak' | 'matte-black' | 'brushed-alu' | 'unframed'>('walnut');

  readonly selectedFrameName = computed(() => {
    switch (this.selectedFrame()) {
      case 'walnut': return 'Solid Dark Walnut Shadowbox';
      case 'oak': return 'Nordic Natural Oak Shadowbox';
      case 'matte-black': return 'Matte Black Aluminum Frame';
      case 'brushed-alu': return 'Brushed Silver Aluminum';
      case 'unframed': return 'Unframed Archival Giclée Print';
    }
  });

  readonly frameClass = computed(() => {
    switch (this.selectedFrame()) {
      case 'walnut': return 'p-4 bg-[#2b1810] border-8 border-[#3d2317] rounded-xl ring-4 ring-[#1f1008]';
      case 'oak': return 'p-4 bg-[#c89d7c] border-8 border-[#b58763] rounded-xl ring-4 ring-[#8c5d3b]';
      case 'matte-black': return 'p-3 bg-[#121212] border-6 border-[#1c1c1c] rounded-lg ring-2 ring-black';
      case 'brushed-alu': return 'p-3 bg-[#94a3b8] border-6 border-[#cbd5e1] rounded-lg ring-2 ring-[#64748b]';
      case 'unframed': return 'p-0 border-0 rounded-none shadow-xl';
    }
  });

  readonly environmentBackground = computed(() => {
    return this.selectedFrame() === 'unframed' ? '#09090b' : '#18181b';
  });

  readonly frameMaxWidth = computed(() => {
    switch (this.selectedSize()) {
      case '12" × 16"': return 360;
      case '18" × 24"': return 440;
      case '24" × 32"': return 500;
      case '30" × 40"': return 560;
      default: return 440;
    }
  });

  readonly totalPrice = computed(() => {
    let frameAddOn = 0;
    if (this.selectedFrame() === 'walnut' || this.selectedFrame() === 'oak') frameAddOn = 35;
    if (this.selectedFrame() === 'matte-black' || this.selectedFrame() === 'brushed-alu') frameAddOn = 25;
    return this.selectedSizePrice() + frameAddOn;
  });

  readonly amazonSearchUrl = computed(() => {
    const query = this.activeArt().amazonAffiliateQuery;
    return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=pgdpo-20`;
  });

  selectArtwork(art: IArtProduct): void {
    this.activeArt.set(art);
  }

  selectSize(label: string, price: number): void {
    this.selectedSize.set(label);
    this.selectedSizePrice.set(price);
  }

  selectFrame(frame: 'walnut' | 'oak' | 'matte-black' | 'brushed-alu' | 'unframed'): void {
    this.selectedFrame.set(frame);
  }

  async launchStripeCheckout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const payload = {
        artId: this.activeArt().id,
        artTitle: this.activeArt().title,
        sku: this.activeArt().sku,
        size: this.selectedSize(),
        frame: this.selectedFrameName(),
        priceUsd: this.totalPrice(),
        imageFileName: this.activeArt().imageFileName
      };

      const res = await fetch('/api/billing/art-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Checkout failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(`Order Placed: "${this.activeArt().title}" (${this.selectedSize()} · ${this.selectedFrameName()}) — $${this.totalPrice()}.00`);
      }
    } catch (e: any) {
      console.warn('[Storefront] Stripe redirect fallback:', e.message);
      alert(`Stripe Secure Checkout: "${this.activeArt().title}" (${this.selectedSize()} · ${this.selectedFrameName()}) — $${this.totalPrice()}.00 (Demo Mode)`);
    }
  }
}
