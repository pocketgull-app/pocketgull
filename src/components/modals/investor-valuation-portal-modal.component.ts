import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from '../shared/pocket-gull-button.component';

export interface IPitchSlide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  keyPoints: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-investor-valuation-portal-modal',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl max-h-[92vh] bg-zinc-950 text-zinc-100 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/20">
              💎
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-extrabold tracking-tight text-white">Pocket Gull Investor & Valuation Portal</h2>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-widest">
                  v1.20.0 Verified
                </span>
              </div>
              <p class="text-xs text-zinc-400">Institutional pitch deck, live COCOMO II cost-to-replicate model & enterprise valuation framework</p>
            </div>
          </div>
          
          <button (click)="closeModal.emit()" 
            class="text-zinc-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer transition" title="Close Portal">
            &times;
          </button>
        </div>

        <!-- Navigation Tabs (Deck vs Valuation Simulator) -->
        <div class="px-6 pt-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
          <div class="flex gap-2">
            <button (click)="viewMode.set('deck')"
              [class.bg-indigo-600]="viewMode() === 'deck'"
              [class.text-white]="viewMode() === 'deck'"
              [class.bg-zinc-900]="viewMode() !== 'deck'"
              [class.text-zinc-400]="viewMode() !== 'deck'"
              class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition cursor-pointer border border-b-0 border-zinc-800">
              📊 Pitch Deck Slides ({{ slides.length }})
            </button>

            <button (click)="viewMode.set('simulator')"
              [class.bg-indigo-600]="viewMode() === 'simulator'"
              [class.text-white]="viewMode() === 'simulator'"
              [class.bg-zinc-900]="viewMode() !== 'simulator'"
              [class.text-zinc-400]="viewMode() !== 'simulator'"
              class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition cursor-pointer border border-b-0 border-zinc-800">
              🧮 Multi-Model Cost Simulator
            </button>
          </div>

          <!-- Quick Metric Badges -->
          <div class="hidden sm:flex items-center gap-4 text-xs font-mono pb-2">
            <span class="text-zinc-400">Current Valuation: <strong class="text-emerald-400 font-sans font-bold">$5.0M – $8.0M</strong></span>
            <span class="text-zinc-600">|</span>
            <span class="text-zinc-400">Replacement Cost: <strong class="text-indigo-400 font-sans font-bold">$15.9M – $24.9M</strong></span>
          </div>
        </div>

        <!-- Content Body -->
        <div class="p-6 flex-1 overflow-y-auto space-y-6">
          
          <!-- VIEW MODE 1: PITCH DECK SLIDES -->
          @if (viewMode() === 'deck') {
            <!-- Slide Selector Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              @for (slide of slides; track slide.id) {
                <button (click)="activeSlideId.set(slide.id)"
                  [class.bg-indigo-950\/80]="activeSlideId() === slide.id"
                  [class.border-indigo-500]="activeSlideId() === slide.id"
                  [class.text-indigo-300]="activeSlideId() === slide.id"
                  [class.bg-zinc-900\/60]="activeSlideId() !== slide.id"
                  [class.border-zinc-800]="activeSlideId() !== slide.id"
                  [class.text-zinc-400]="activeSlideId() !== slide.id"
                  class="p-2.5 rounded-xl border text-left transition cursor-pointer hover:border-indigo-500/60">
                  <div class="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">Slide 0{{ slide.id }}</div>
                  <div class="text-xs font-bold truncate mt-0.5">{{ slide.title }}</div>
                </button>
              }
            </div>

            <!-- Active Slide Viewer -->
            @if (currentSlide(); as slide) {
              <div class="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-150">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span class="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">{{ slide.category }}</span>
                    <h3 class="text-2xl font-extrabold text-white mt-1">{{ slide.title }}</h3>
                    <p class="text-sm text-zinc-400 mt-1">{{ slide.subtitle }}</p>
                  </div>
                  <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl font-bold">
                    0{{ slide.id }}
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (point of slide.keyPoints; track point) {
                    <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3 hover:border-zinc-700 transition">
                      <span class="text-indigo-400 text-lg">⚡</span>
                      <span class="text-xs text-zinc-300 leading-relaxed font-medium">{{ point }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          }

          <!-- VIEW MODE 2: MULTI-MODEL COST SIMULATOR -->
          @if (viewMode() === 'simulator') {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Left Control Inputs -->
              <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
                <h3 class="text-xs font-bold uppercase tracking-widest text-indigo-400">Simulation Parameters</h3>
                
                <!-- Developer Hourly Rate Slider -->
                <div class="space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Blended Developer Rate:</span>
                    <span class="font-mono font-bold text-emerald-400">\${{ hourlyRate() }}/hr</span>
                  </div>
                  <input type="range" min="95" max="250" step="5" [value]="hourlyRate()"
                    (input)="updateHourlyRate(\$event)"
                    class="w-full accent-indigo-500 cursor-pointer" />
                </div>

                <!-- SLOC Scale Multiplier Slider -->
                <div class="space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Base SLOC Multiplier:</span>
                    <span class="font-mono font-bold text-indigo-400">{{ slocMultiplier().toFixed(2) }}x ({{ sloc().toLocaleString() }} SLOC)</span>
                  </div>
                  <input type="range" min="0.5" max="2.0" step="0.05" [value]="slocMultiplier()"
                    (input)="updateSlocMultiplier(\$event)"
                    class="w-full accent-indigo-500 cursor-pointer" />
                </div>

                <!-- Summary Info Card -->
                <div class="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
                  <div class="font-bold text-zinc-200 uppercase tracking-wider text-[10px]">Empirical Base Metrics</div>
                  <div>• Angular 22 Single-Source Web: 156,919 SLOC (92.0%)</div>
                  <div>• Minimal Flutter Hybrid Shell: 685 SLOC (0.4%)</div>
                  <div>• Standalone Backend API & Services: 4,757 SLOC (2.8%)</div>
                  <div>• Tests & Automation Scripts: 8,293 SLOC (4.8%)</div>
                  <div>• 18 COTS APIs: 19,082 lines glue code</div>
                </div>
              </div>

              <!-- Right Results Cards -->
              <div class="md:col-span-2 space-y-4">
                
                <!-- Top Summary Stat Banner -->
                <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">Consolidated Replacement Cost</span>
                    <div class="text-3xl font-extrabold text-white mt-0.5">\${{ (totalReplicationCost() / 1000000).toFixed(2) }}M</div>
                    <p class="text-xs text-zinc-400 mt-1">Triangulated across COCOMO II, COSYSMO, and COCOTS models</p>
                  </div>

                  <div class="text-right">
                    <span class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Investor Asset Discount</span>
                    <div class="text-2xl font-extrabold text-emerald-400">{{ discountToReplicate() }}% OFF</div>
                    <span class="text-[10px] text-zinc-400">vs \$6.5M Mid Pre-Revenue Price</span>
                  </div>
                </div>

                <!-- 4 Model Grid Breakdown -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-zinc-300">1. COCOMO II (Dev Effort)</span>
                      <span class="font-mono text-indigo-400 font-bold">\${{ (cocomoCost() / 1000000).toFixed(2) }}M</span>
                    </div>
                    <p class="text-[11px] text-zinc-500">673 person-months (56.1 solo-developer years) core code build.</p>
                  </div>

                  <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-zinc-300">2. COSYSMO (Systems Eng)</span>
                      <span class="font-mono text-purple-400 font-bold">\${{ (cosysmoCost() / 1000000).toFixed(2) }}M</span>
                    </div>
                    <p class="text-[11px] text-zinc-500">35% SE overhead for HIPAA, FHIR R4/R5, and 3D biophysics.</p>
                  </div>

                  <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-zinc-300">3. COCOTS (API Glue Code)</span>
                      <span class="font-mono text-cyan-400 font-bold">\${{ (cocotsCost() / 1000000).toFixed(2) }}M</span>
                    </div>
                    <p class="text-[11px] text-zinc-500">8,530 hours configuring 18 COTS integrations & zero-copy streams.</p>
                  </div>

                  <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-zinc-300">4. SLIM/QSM (Compress Premium)</span>
                      <span class="font-mono text-emerald-400 font-bold">2.8x Velocity</span>
                    </div>
                    <p class="text-[11px] text-zinc-500">Achieved in 16 months what traditional staffing requires 45+ months.</p>
                  </div>

                </div>

              </div>

            </div>
          }

        </div>

        <!-- Footer Actions -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div class="text-xs text-zinc-500 font-mono">
            <span>OpenSSF Scorecard: <strong>10/10</strong></span>
            <span class="mx-2">•</span>
            <span>Scale-to-Zero: <strong>$0.20/mo</strong></span>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="copyExecutiveBrief()"
              class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer">
              {{ copyStatus() || '📋 Copy Brief' }}
            </button>
            <pocket-gull-button (onClick)="closeModal.emit()">
              Close Portal
            </pocket-gull-button>
          </div>
        </div>

      </div>

    </div>
  `
})
export class InvestorValuationPortalModalComponent {
  closeModal = output<void>();

  viewMode = signal<'deck' | 'simulator'>('deck');
  activeSlideId = signal<number>(1);
  hourlyRate = signal<number>(155);
  slocMultiplier = signal<number>(1.0);
  copyStatus = signal<string | null>(null);

  slides: IPitchSlide[] = [
    {
      id: 1,
      title: 'The Problem: Practitioner Burnout & Data Silos',
      subtitle: 'Modern health systems force clinicians into fragmented EHR menus, causing cognitive overload.',
      category: 'Market Opportunity',
      keyPoints: [
        'Clinicians spend 2+ hours clicking through EHR menus for every 1 hour of direct patient care.',
        'Siloed diagnostics (allopathic labs vs. lifestyle vs. functional medicine) prevent holistic treatment.',
        'Existing clinical AI tools act as expensive, un-validated LLM text wrappers without real-time telemetry.'
      ]
    },
    {
      id: 2,
      title: 'The Solution: Tri-Paradigm Consilience Engine',
      subtitle: 'Synthesizing Western Evidence, TCM Zang-Fu, and Ayurvedic Medicine into a unified Care Plan.',
      category: 'Product & Technology',
      keyPoints: [
        'Gull\'s Eye View: Elevates thousands of data points into instant, interactive care plan visual cards.',
        'Tri-Paradigm Synthesis: Bridges conventional lab markers to meridian energetics and doshic balances.',
        'Zero-Copy Privacy: Binary ArrayBuffer streaming with DOMPurify sanitization & HIPAA Safe Harbor.'
      ]
    },
    {
      id: 3,
      title: 'Proprietary Technology Moat & Engineering',
      subtitle: '170,580 SLOC across 968 files with 18 COTS integrations and 40 WebMCP Clinical Tools.',
      category: 'Defensibility',
      keyPoints: [
        'Single-Source Architecture: Angular 22 Standalone Signals core with lightweight Flutter Hybrid Shell for HealthKit/Biometrics.',
        'Full-Duplex Voice Consults: Gemini Live multimodal audio streaming with Web Speech API integration.',
        'Verified Quality: 198 Vitest spec files (623 tests), 76 Playwright E2E tests, OpenSSF 10/10 score.'
      ]
    },
    {
      id: 4,
      title: 'Valuation & Multi-Model Replacement Cost',
      subtitle: '$5.0M – $8.0M pre-revenue valuation represents a 50%–70% discount to replacement cost.',
      category: 'Financials & Valuation',
      keyPoints: [
        'COCOMO II Baseline: $7.62M development cost (324 person-months / 27.0 solo-developer years).',
        'Combined 3-Model Total: $14.85M (COCOMO II + COSYSMO Systems Eng + COCOTS Integration).',
        'Scale-to-Zero Economics: GCP Cloud Run --min-instances=0 caps baseline cloud overhead at ~$0.20/month.'
      ]
    },
    {
      id: 5,
      title: 'Go-To-Market & Commercialization Roadmap',
      subtitle: 'Grants → B2B Specialty SaaS → EHR App Orchard Ecosystem Marketplace.',
      category: 'Growth Strategy',
      keyPoints: [
        'Phase 1 Grants: NSF SBIR Phase I/II & Eurostars Health Technology Blueprint proposals.',
        'Phase 2 SaaS: Clinician Pro ($199/mo/seat) & Clinic Enterprise Hub ($1,499/mo/clinic).',
        'Phase 3 Integration: SMART-on-FHIR R4/R5 App Orchard listings for Epic, Cerner, and AthenaHealth.'
      ]
    }
  ];

  currentSlide = computed(() => {
    return this.slides.find(s => s.id === this.activeSlideId()) || this.slides[0];
  });

  sloc = computed(() => Math.round(170580 * this.slocMultiplier()));
  
  cocomoCost = computed(() => {
    const ksloc = this.sloc() / 1000;
    const pm = 2.94 * Math.pow(ksloc, 1.0887) * 0.4033;
    const hrs = pm * 152;
    return Math.round(hrs * this.hourlyRate());
  });

  cosysmoCost = computed(() => Math.round(this.cocomoCost() * 0.35 * 1.1687));
  cocotsCost = computed(() => Math.round(8530 * (this.hourlyRate() * 1.15)));

  totalReplicationCost = computed(() => {
    return this.cocomoCost() + this.cosysmoCost() + this.cocotsCost();
  });

  discountToReplicate = computed(() => {
    const cost = this.totalReplicationCost();
    if (!cost) return 0;
    return Math.round((1 - (6500000 / cost)) * 100);
  });

  updateHourlyRate(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.hourlyRate.set(parseInt(val, 10) || 155);
  }

  updateSlocMultiplier(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.slocMultiplier.set(parseFloat(val) || 1.0);
  }

  copyExecutiveBrief() {
    const summary = `Pocket Gull Investor Executive Brief:
- Base SLOC: ${this.sloc().toLocaleString()}
- Consolidated Replacement Cost: \$${(this.totalReplicationCost() / 1000000).toFixed(2)}M
- Valuation Discount: ${this.discountToReplicate()}% vs \$6.5M Pre-Revenue Valuation
- Tech Moat: 18 COTS APIs, 40 WebMCP Tools, OpenSSF 10/10`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      this.copyStatus.set('✓ Copied!');
      setTimeout(() => this.copyStatus.set(null), 2500);
    }
  }
}
