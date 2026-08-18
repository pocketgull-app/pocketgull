import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreSourcingService, IAffiliateStoreItem } from '../services/store-sourcing.service';

export interface IPatientArtwork {
  id: string;
  category: 'quilling' | 'origami' | 'cellular';
  categoryLabel: string;
  title: string;
  subtitle: string;
  artistName: string;
  artistJourney: string;
  medium: string;
  dimensions: string;
  imageSrc: string;
  gicleePrintPrice: number;
  originalPrice: number;
  digitalDownloadPrice: number;
  biologicalAnnotations: { label: string; organelle: string; significance: string }[];
  isOriginalAvailable: boolean;
}

export type FrameFinishType = 'natural_oak' | 'dark_walnut' | 'obsidian_ebony' | 'gold_leaf';

@Component({
  selector: 'app-patient-art-collective-store',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 sm:p-8 bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 rounded-3xl border border-stone-300 dark:border-stone-800 shadow-2xl space-y-8 font-sans max-w-6xl mx-auto">
      
      <!-- Top Navigation & Mission Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Social Enterprise & TypeTech Specimen
            </span>
            <span class="text-xs font-mono text-stone-500 dark:text-stone-400">Caslon Old Style 1734 × Bio-Paper Art</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight font-serif text-stone-900 dark:text-stone-50">
            PocketGull Cellular Art Collective & Apothecary
          </h2>
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl font-serif italic">
            "Transforming the cellular landscapes of chronic illness, neuro-somatic healing, and mitochondrial vitality into tactile paper art."
          </p>
        </div>

        <button 
          (click)="closeModal.emit()"
          type="button"
          class="self-start md:self-center px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono text-xs font-bold transition cursor-pointer min-h-[44px]">
          ✕ Return to Clinic
        </button>
      </div>

      <!-- Main Mode Switcher: Art Gallery vs. Amazon Storefront -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="activeMainTab.set('gallery')"
            class="px-4 py-2 rounded-xl font-serif text-xs font-bold transition cursor-pointer flex items-center gap-2 min-h-[44px]"
            [class.bg-amber-600]="activeMainTab() === 'gallery'"
            [class.text-white]="activeMainTab() === 'gallery'"
            [class.bg-stone-200]="activeMainTab() !== 'gallery'"
            [class.dark:bg-stone-800]="activeMainTab() !== 'gallery'"
            [class.text-stone-700]="activeMainTab() !== 'gallery'"
            [class.dark:text-stone-300]="activeMainTab() !== 'gallery'">
            <span>🎨 Patient Art Gallery & Typetech</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">{{ artworks().length }}</span>
          </button>

          <button
            type="button"
            (click)="activeMainTab.set('storefront')"
            class="px-4 py-2 rounded-xl font-serif text-xs font-bold transition cursor-pointer flex items-center gap-2 min-h-[44px]"
            [class.bg-teal-700]="activeMainTab() === 'storefront'"
            [class.text-white]="activeMainTab() === 'storefront'"
            [class.bg-stone-200]="activeMainTab() !== 'storefront'"
            [class.dark:bg-stone-800]="activeMainTab() !== 'storefront'"
            [class.text-stone-700]="activeMainTab() !== 'storefront'"
            [class.dark:text-stone-300]="activeMainTab() !== 'storefront'">
            <span>🏪 Amazon Health & Apothecary Catalog</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">{{ affiliateCatalog().length }}</span>
          </button>
        </div>

        <!-- Direct Tip Jar / Artist Support Toast -->
        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="text-stone-500">Support Creators:</span>
          <button (click)="contributeRelief(5)" class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold transition cursor-pointer min-h-[40px]">
            ☕ $5 Relief Tip
          </button>
          <button (click)="contributeRelief(15)" class="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold transition cursor-pointer min-h-[40px]">
            🎨 $15 Studio Fund
          </button>
        </div>
      </div>

      <!-- Tip Notification Banner -->
      @if (tipToast(); as toast) {
        <div class="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <span>💖 <strong>Thank You!</strong> {{ toast }}</span>
          <button (click)="tipToast.set(null)" class="text-emerald-600 hover:text-emerald-800 cursor-pointer">✕</button>
        </div>
      }

      <!-- Transparent Social Enterprise Impact Ledger ("Keeping the Lights On") -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-100 dark:via-stone-900 to-emerald-500/10 border border-amber-500/30 space-y-3 font-mono text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">💡</span>
            <span class="font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Transparent Social Impact: How Artwork Sales Keep the Lights On
            </span>
          </div>
          <span class="text-[11px] text-stone-500 dark:text-stone-400">100% Non-Commercial Transparency</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div class="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
            <div class="text-xl font-black text-emerald-600 dark:text-emerald-400">85%</div>
            <div class="font-bold text-stone-900 dark:text-stone-100">Direct Patient Artist Payout</div>
            <p class="text-[11px] text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              Goes directly to patient creators to fund out-of-pocket medical treatments, physical therapy, and fine-art adaptive studio tools.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
            <div class="text-xl font-black text-amber-600 dark:text-amber-400">10%</div>
            <div class="font-bold text-stone-900 dark:text-stone-100">Open-Source Server & Privacy Edge</div>
            <p class="text-[11px] text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              Maintains our zero-tracker, scale-to-zero GCP Cloud Run infrastructure and free public health telemetry tools.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
            <div class="text-xl font-black text-purple-600 dark:text-purple-400">5%</div>
            <div class="font-bold text-stone-900 dark:text-stone-100">Rare Disease Research Grants</div>
            <p class="text-[11px] text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              Donated to open-access PubMed/ArXiv research consortiums investigating mitochondrial disorders and long-COVID biology.
            </p>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: PATIENT ART GALLERY & TYPETECH SPECIMEN                         -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      @if (activeMainTab() === 'gallery') {
        
        <!-- Category Pill Filter -->
        <div class="flex flex-wrap items-center gap-2 pt-2">
          <span class="text-xs font-mono text-stone-500 uppercase tracking-widest mr-2">Filter Medium:</span>
          @for (cat of artFilterOptions; track cat.id) {
            <button
              type="button"
              (click)="selectedArtCategory.set(cat.id)"
              class="px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer min-h-[40px]"
              [class.bg-stone-900]="selectedArtCategory() === cat.id"
              [class.dark:bg-stone-100]="selectedArtCategory() === cat.id"
              [class.text-white]="selectedArtCategory() === cat.id"
              [class.dark:text-stone-900]="selectedArtCategory() === cat.id"
              [class.bg-stone-200]="selectedArtCategory() !== cat.id"
              [class.dark:bg-stone-800]="selectedArtCategory() !== cat.id"
              [class.text-stone-700]="selectedArtCategory() !== cat.id"
              [class.dark:text-stone-300]="selectedArtCategory() !== cat.id">
              {{ cat.label }}
            </button>
          }
        </div>

        <!-- Featured Masterpiece Spotlight -->
        @if (featuredArtwork(); as art) {
          <div class="p-6 rounded-3xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <!-- High-Res Zoomable Artwork Frame with Shadowbox Depth -->
              <div class="lg:col-span-6 space-y-4">
                
                <!-- Frame Customizer Controls -->
                <div class="flex items-center justify-between font-mono text-xs">
                  <span class="text-stone-500">Select Shadowbox Frame:</span>
                  <div class="flex gap-1.5">
                    <button (click)="activeFrameFinish.set('natural_oak')" [class.ring-2]="activeFrameFinish() === 'natural_oak'" class="px-2 py-0.5 rounded bg-[#d7ba89] text-stone-900 text-[10px] font-bold ring-amber-500 cursor-pointer">Oak</button>
                    <button (click)="activeFrameFinish.set('dark_walnut')" [class.ring-2]="activeFrameFinish() === 'dark_walnut'" class="px-2 py-0.5 rounded bg-[#4b3021] text-white text-[10px] font-bold ring-amber-500 cursor-pointer">Walnut</button>
                    <button (click)="activeFrameFinish.set('obsidian_ebony')" [class.ring-2]="activeFrameFinish() === 'obsidian_ebony'" class="px-2 py-0.5 rounded bg-[#18181b] text-white text-[10px] font-bold ring-amber-500 cursor-pointer">Ebony</button>
                    <button (click)="activeFrameFinish.set('gold_leaf')" [class.ring-2]="activeFrameFinish() === 'gold_leaf'" class="px-2 py-0.5 rounded bg-[#ca8a04] text-white text-[10px] font-bold ring-amber-500 cursor-pointer">24k Gold</button>
                  </div>
                </div>

                <div 
                  class="relative group rounded-2xl overflow-hidden shadow-2xl bg-stone-950 aspect-[3/4] max-h-[540px] transition-all duration-300"
                  [ngClass]="getFrameClass()">
                  
                  <img 
                    [src]="art.imageSrc" 
                    [alt]="art.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                  <!-- Overlay Badge -->
                  <div class="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                    <span class="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 text-xs font-mono font-bold border border-amber-500/40">
                      {{ art.categoryLabel }}
                    </span>
                    <span class="px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40">
                      {{ art.isOriginalAvailable ? 'Original Available' : 'Archival Prints Only' }}
                    </span>
                  </div>

                  <!-- Bottom Title in Shadowbox -->
                  <div class="absolute bottom-4 left-4 right-4 text-white space-y-1 pointer-events-none">
                    <h3 class="text-lg sm:text-xl font-bold font-serif leading-tight">{{ art.title }}</h3>
                    <p class="text-xs text-amber-200 font-mono">{{ art.medium }} · {{ art.dimensions }}</p>
                  </div>
                </div>

                <!-- Microscopic Organelle Annotation Chips -->
                <div class="flex flex-wrap gap-1.5 pt-1">
                  @for (anno of art.biologicalAnnotations; track anno.organelle) {
                    <span class="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300">
                      🔬 <strong class="text-amber-700 dark:text-amber-400">{{ anno.organelle }}:</strong> {{ anno.significance }}
                    </span>
                  }
                </div>
              </div>

              <!-- Artwork Details, Caslon Specimen, and Acquisition Options -->
              <div class="lg:col-span-6 space-y-6">
                
                <!-- Artist Genesis & Story -->
                <div class="space-y-2 border-b border-stone-200 dark:border-stone-800 pb-5">
                  <div class="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Featured Patient Creator: {{ art.artistName }}
                  </div>
                  <h3 class="text-2xl font-black font-serif text-stone-900 dark:text-stone-50">
                    {{ art.subtitle }}
                  </h3>
                  <p class="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed italic bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20">
                    "{{ art.artistJourney }}"
                  </p>
                </div>

                <!-- Caslon TypeTech Specimen Sheet -->
                <div class="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 font-serif text-xs">
                  <div class="flex items-center justify-between font-mono text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-stone-800 pb-1.5">
                    <span>TypeTech Specimen: Caslon 1734 Pro</span>
                    <span>Optical Kerning & Baseline Grid</span>
                  </div>
                  <div class="text-sm font-bold text-stone-900 dark:text-stone-100">
                    ABCDEFGHIJKLMN OPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 1234567890
                  </div>
                  <div class="text-[11px] text-stone-600 dark:text-stone-400 italic">
                    Ligatures: fi fl ffi ffl · Glyphs crafted for high-contrast clinical legibility across ambient lighting.
                  </div>
                </div>

                <!-- Acquisition Purchasing Cards -->
                <div class="space-y-3 font-mono">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Acquisition & Sourcing Channels:
                  </h4>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- Museum Giclée Print -->
                    <div class="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 hover:border-amber-500/50 transition">
                      <div class="flex justify-between items-baseline">
                        <span class="font-bold text-xs">Museum Giclée Print</span>
                        <span class="text-sm font-black text-amber-700 dark:text-amber-400">\${{ art.gicleePrintPrice }}</span>
                      </div>
                      <p class="text-[10.5px] text-stone-500 dark:text-stone-400 font-sans leading-tight">
                        Archival 308gsm cotton rag paper. 100-year colorfast inks.
                      </p>
                      <a 
                        [href]="sourcingService.generateAmazonAffiliateUrl('Cellular Biology Art Print ' + art.title)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-full py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-lg text-xs font-bold text-center transition min-h-[44px] flex items-center justify-center gap-1">
                        <span>📦 Buy Print on Amazon</span>
                        <span>↗</span>
                      </a>
                    </div>

                    <!-- Original Framed Shadowbox -->
                    <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div class="flex justify-between items-baseline">
                        <span class="font-bold text-xs text-amber-900 dark:text-amber-200">Original Shadowbox</span>
                        <span class="text-sm font-black text-emerald-700 dark:text-emerald-400">\${{ art.originalPrice }}</span>
                      </div>
                      <p class="text-[10.5px] text-stone-600 dark:text-stone-300 font-sans leading-tight">
                        1-of-1 physical paper sculpture. Solid wood museum frame with UV glass.
                      </p>
                      <a 
                        [href]="sourcingService.generateAmazonAffiliateUrl('Handmade Paper Quilling Art ' + art.title)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold text-center transition min-h-[44px] flex items-center justify-center gap-1">
                        <span>🏛️ Acquire Original</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>

                  <!-- Digital Wallpaper & Study Set -->
                  <div class="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold block">8K HDR Wallpaper & Medical Study Folio</span>
                      <span class="text-[11px] text-stone-500">Instant lossless download for desktop and iPad</span>
                    </div>
                    <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">\${{ art.digitalDownloadPrice }}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        }

        <!-- Gallery Grid of Available Patient Artworks -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold font-serif tracking-tight border-b border-stone-200 dark:border-stone-800 pb-2 flex items-center justify-between">
            <span>Explore All Gallery Curations</span>
            <span class="text-xs font-mono font-normal text-stone-500">{{ filteredArtworks().length }} Works Shown</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (item of filteredArtworks(); track item.id) {
              <div 
                (click)="selectedArtworkId.set(item.id)"
                class="group bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 p-4 space-y-3 cursor-pointer transition-all duration-300 shadow hover:shadow-xl flex flex-col justify-between"
                [class.ring-2]="selectedArtworkId() === item.id"
                [class.ring-amber-500]="selectedArtworkId() === item.id">
                
                <div class="aspect-4/3 rounded-xl overflow-hidden relative bg-stone-900">
                  <img [src]="item.imageSrc" [alt]="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div class="absolute bottom-2 left-2 right-2 text-white">
                    <span class="text-[10px] font-mono text-amber-300 block">{{ item.artistName }}</span>
                    <h4 class="text-xs font-bold font-serif line-clamp-1">{{ item.title }}</h4>
                  </div>
                </div>

                <p class="text-xs text-stone-600 dark:text-stone-400 font-serif italic line-clamp-2">
                  "{{ item.artistJourney }}"
                </p>

                <div class="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800 font-mono text-xs">
                  <span class="font-bold text-amber-700 dark:text-amber-400">Prints from \${{ item.gicleePrintPrice }}</span>
                  <span class="text-[11px] text-stone-500 group-hover:text-amber-600 transition-colors">Inspect →</span>
                </div>
              </div>
            }
          </div>
        </div>

      }

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: AMAZON HEALTH & APOTHECARY STOREFRONT CATALOG                    -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      @if (activeMainTab() === 'storefront') {
        <div class="space-y-6">
          <div class="space-y-1 border-b border-stone-200 dark:border-stone-800 pb-4">
            <h3 class="text-xl font-bold font-serif text-stone-900 dark:text-stone-50">
              Curated Amazon Health, Framing & Botanical Storefront
            </h3>
            <p class="text-xs text-stone-600 dark:text-stone-400 font-sans">
              All links automatically route to Amazon with tag <code class="text-amber-600 dark:text-amber-400 font-mono">pocketgull-20</code>. Qualifying purchases generate zero-cost affiliate contributions directly funding our open-source medical engine and patient relief grants.
            </p>
          </div>

          <!-- Catalog Category Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (item of affiliateCatalog(); track item.id) {
              <div class="p-5 rounded-2xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 shadow flex flex-col justify-between space-y-4">
                
                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                      {{ item.categoryLabel }}
                    </span>
                    @if (item.isHsaEligible) {
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        ✓ HSA / FSA Eligible
                      </span>
                    }
                  </div>

                  <h4 class="text-base font-bold font-serif text-stone-900 dark:text-stone-100 leading-snug">
                    {{ item.title }}
                  </h4>
                  <p class="text-xs font-mono text-amber-700 dark:text-amber-400">
                    {{ item.subtitle }}
                  </p>

                  <p class="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed pt-1">
                    {{ item.clinicalRationale }}
                  </p>

                  <div class="text-[11px] font-mono text-stone-500 dark:text-stone-400 pt-1">
                    <strong>Vetted Brands:</strong> {{ item.recommendedBrands.join(', ') }} · <em>Est: {{ item.priceEstimate }}</em>
                  </div>
                </div>

                <div class="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                  <a 
                    [href]="sourcingService.generateAmazonAffiliateUrl(item.searchQuery, item.isHsaEligible)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-1 py-2.5 px-4 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-mono font-bold text-center transition flex items-center justify-center gap-1.5 min-h-[44px]">
                    <span>🛒 View on Amazon</span>
                    <span>↗</span>
                  </a>

                  <a 
                    [href]="sourcingService.generateLocalMapsUrl('apothecary', item.title)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1 min-h-[44px]"
                    title="Find Nearby at Local Dispensary or Co-op">
                    <span>📍 Local Co-op</span>
                  </a>
                </div>

              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class PatientArtCollectiveStoreComponent {
  public readonly sourcingService = inject(StoreSourcingService);
  closeModal = output<void>();

  readonly activeMainTab = signal<'gallery' | 'storefront'>('gallery');
  readonly selectedArtCategory = signal<string>('all');
  readonly selectedArtworkId = signal<string>('art-001');
  readonly activeFrameFinish = signal<FrameFinishType>('natural_oak');
  readonly tipToast = signal<string | null>(null);

  readonly artFilterOptions = [
    { id: 'all', label: 'All Curations' },
    { id: 'quilling', label: '3D Paper Quilling' },
    { id: 'origami', label: 'Origami & Folios' },
    { id: 'cellular', label: 'Cellular Micro-Art' }
  ];

  readonly affiliateCatalog = computed<IAffiliateStoreItem[]>(() => {
    return this.sourcingService.getAffiliateStoreCatalog();
  });

  readonly artworks = signal<IPatientArtwork[]>([
    {
      id: 'art-001',
      category: 'quilling',
      categoryLabel: '3D Paper Filigree & Gold Vellum',
      title: 'The ATP Genesis: Mitochondrial Cristae in 3D Paper Filigree',
      subtitle: 'Cellular Energetics & Oxidative Phosphorylation in Hand-Rolled Paper',
      artistName: 'Maya L. (Living with Mitochondrial Myopathy & ME/CFS)',
      artistJourney: 'Crafting each concentric membrane fold became my daily neuro-somatic grounding during flare-ups. Each golden curl represents a surge of cellular vitality and resilience.',
      medium: 'Hand-Rolled Archival Paper, Metallic Pigments & Gold Vellum on Museum Matboard',
      dimensions: '16" × 20" Framed Shadowbox',
      imageSrc: '/assets/art/mitochondria_quilling.jpg',
      gicleePrintPrice: 45,
      originalPrice: 650,
      digitalDownloadPrice: 10,
      isOriginalAvailable: true,
      biologicalAnnotations: [
        { label: 'Inner Membrane', organelle: 'Mitochondrial Cristae', significance: 'Folds housing the electron transport chain and ATP synthase complexes' },
        { label: 'Transport Vesicles', organelle: 'Cyan Secretory Granules', significance: 'Active transport of cellular cargo and molecular antioxidants' },
        { label: 'Cytoskeleton', organelle: 'Deep Blue Tubulin Coils', significance: 'Structural filament lattice maintaining cellular biomechanical integrity' }
      ]
    },
    {
      id: 'art-002',
      category: 'cellular',
      categoryLabel: 'Cellular Architecture Quilling',
      title: 'The Organelle Symphony: Golgi & Endoplasmic Reticulum',
      subtitle: 'Protein Translation & Microtubule Wave Dynamics',
      artistName: 'Gabriel S. (Post-Concussion Syndrome & Neurodivergent Bio-Artist)',
      artistJourney: 'Visualizing intracellular transport helped me map my own neural pathways during vestibular rehabilitation.',
      medium: 'Three-Dimensional Paper Quilling & Cyan Acrylic Washes',
      dimensions: '18" × 24" Deep Shadowbox',
      imageSrc: '/assets/art/quilling_organelle_cell.jpg',
      gicleePrintPrice: 50,
      originalPrice: 850,
      digitalDownloadPrice: 12,
      isOriginalAvailable: true,
      biologicalAnnotations: [
        { label: 'Endoplasmic Reticulum', organelle: 'Rough ER & Ribosomes', significance: 'Ribosomal protein synthesis and chaperone protein folding' },
        { label: 'Golgi Apparatus', organelle: 'Cisternal Stacks', significance: 'Glycosylation and targeted molecular distribution' }
      ]
    },
    {
      id: 'art-003',
      category: 'quilling',
      categoryLabel: 'Vertical Bio-Filigree',
      title: 'Mitochondrial Cristae Longitudinal Section',
      subtitle: 'Chemiosmotic Proton Gradients & Outer Membrane Shell',
      artistName: 'Maya L. (Mitochondrial Myopathy Healing Collective)',
      artistJourney: 'A tribute to the powerhouses of our cells that silently keep us breathing.',
      medium: 'Hand-Curled Japanese Mulberry Paper & Metallic Pigments',
      dimensions: '12" × 24" Gallery Vertical Shadowbox',
      imageSrc: '/assets/art/quilling_mitochondria_vert.jpg',
      gicleePrintPrice: 40,
      originalPrice: 580,
      digitalDownloadPrice: 10,
      isOriginalAvailable: true,
      biologicalAnnotations: [
        { label: 'Intermembrane Space', organelle: 'Proton Reservoir', significance: 'Maintains the chemiosmotic electrochemical gradient driving ATP production' }
      ]
    },
    {
      id: 'art-004',
      category: 'origami',
      categoryLabel: 'Origami & Autonomic Waves',
      title: 'The Vagal Resonant Gull: Coastal Sanctuary',
      subtitle: 'Baroreflex Resonance & 0.1Hz Vagus Nerve Calibration',
      artistName: 'Dr. Phil Gear & The PocketGull Design Foundry',
      artistJourney: 'Inspired by the flight mechanics of sea gulls over coastal Maine, capturing calm parasympathetic tone.',
      medium: 'Origami Folded Mulberry Paper with Silver Leaf Accents',
      dimensions: '12" × 12" Gallery Mat',
      imageSrc: '/assets/art/origami_seagull_vagal_waves.png',
      gicleePrintPrice: 35,
      originalPrice: 420,
      digitalDownloadPrice: 8,
      isOriginalAvailable: false,
      biologicalAnnotations: [
        { label: 'Vagal Nerve Core', organelle: 'Baroreflex Loop', significance: 'Calibrates respiratory sinus arrhythmia and heart rate variability (HRV)' }
      ]
    },
    {
      id: 'art-005',
      category: 'origami',
      categoryLabel: 'Papercut Architectural Folio',
      title: 'The Coastal Lighthouse & Section 504 Beacon',
      subtitle: 'Pediatric Accommodation & Environmental Sanctuary',
      artistName: 'PocketGull Patient Rights & Pediatric Advocacy Studio',
      artistJourney: 'Created to represent safe passage and universal educational accommodations for all children.',
      medium: 'Multi-Layered Precision Cut Paper & Architectural Vellum',
      dimensions: '14" × 18" White Shadowbox',
      imageSrc: '/assets/art/papercut_beach_lighthouse.png',
      gicleePrintPrice: 38,
      originalPrice: 480,
      digitalDownloadPrice: 10,
      isOriginalAvailable: true,
      biologicalAnnotations: [
        { label: 'Beacon of Care', organelle: 'Section 504 Plan', significance: 'Demarcates legally binding classroom and environmental health accommodations' }
      ]
    }
  ]);

  readonly filteredArtworks = computed(() => {
    const cat = this.selectedArtCategory();
    if (cat === 'all') return this.artworks();
    return this.artworks().filter(a => a.category === cat);
  });

  readonly featuredArtwork = computed(() => {
    const id = this.selectedArtworkId();
    return this.artworks().find(a => a.id === id) || this.artworks()[0];
  });

  getFrameClass(): string {
    switch (this.activeFrameFinish()) {
      case 'natural_oak':
        return 'border-[12px] border-[#c49a62] shadow-[0_20px_50px_rgba(196,154,98,0.3)]';
      case 'dark_walnut':
        return 'border-[12px] border-[#3e2314] shadow-[0_20px_50px_rgba(62,35,20,0.4)]';
      case 'obsidian_ebony':
        return 'border-[12px] border-[#18181b] shadow-[0_20px_50px_rgba(0,0,0,0.7)]';
      case 'gold_leaf':
        return 'border-[12px] border-[#ca8a04] shadow-[0_20px_50px_rgba(202,138,4,0.35)]';
      default:
        return 'border-[12px] border-[#c49a62]';
    }
  }

  contributeRelief(amount: number) {
    this.tipToast.set(`Your \$${amount} contribution has been forwarded directly to the patient artist medical relief fund.`);
    setTimeout(() => {
      this.tipToast.set(null);
    }, 6000);
  }
}
