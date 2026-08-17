import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BrandPackageGeneratorService, IBrandPackage, IBrandColorToken, IBrandAsset } from '../services/brand-package-generator.service';

@Component({
  selector: 'app-brand-package-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-3xl shadow-inner">
            🖋️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold tracking-tight text-white">AI Branding Package Generator</h1>
              <span class="px-2 py-0.5 text-xs font-semibold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                SWE Book &amp; Zero-Waste
              </span>
            </div>
            <p class="text-sm text-slate-400 mt-1">
              Deterministic vector logotypes, WCAG 2.2 AAA accessibility tokens, and 5-Archetype brand kits with scale-to-zero economics.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="min-h-[48px] px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-900/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer touch-manipulation"
            [disabled]="brandService.isLoading()"
            (click)="generateKit()"
          >
            @if (brandService.isLoading()) {
              <span class="animate-spin text-base">⏳</span>
              <span>Synthesizing...</span>
            } @else {
              <span>✨ Generate Brand Kit</span>
            }
          </button>
        </div>
      </div>

      <!-- Main Studio Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Configuration Parameters -->
        <div class="lg:col-span-4 space-y-4">
          <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>⚙️</span>
              <span>Brand Identity Parameters</span>
            </h2>

            <!-- Brand Name Input -->
            <div class="space-y-1.5">
              <label for="brand-name-input" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Brand / Product Name
              </label>
              <input
                id="brand-name-input"
                type="text"
                class="w-full min-h-[48px] px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                [ngModel]="brandName()"
                (ngModelChange)="brandName.set($event)"
                placeholder="e.g. PocketGull Sanctuary"
              />
            </div>

            <!-- Industry / Domain Input -->
            <div class="space-y-1.5">
              <label for="industry-input" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Industry &amp; Specialization
              </label>
              <input
                id="industry-input"
                type="text"
                class="w-full min-h-[48px] px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                [ngModel]="industry()"
                (ngModelChange)="industry.set($event)"
                placeholder="e.g. Clinical Decision Support &amp; Art Therapy"
              />
            </div>

            <!-- 5 Origami Mascots Archetype Picker -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Origami Guide Archetype
              </label>
              <div class="grid grid-cols-1 gap-2">
                @for (arch of archetypes; track arch.name) {
                  <button
                    type="button"
                    class="w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer touch-manipulation"
                    [class.border-orange-500]="selectedArchetype() === arch.name"
                    [class.bg-orange-50]="selectedArchetype() === arch.name"
                    [class.dark:bg-orange-950/20]="selectedArchetype() === arch.name"
                    [class.border-slate-200]="selectedArchetype() !== arch.name"
                    [class.dark:border-slate-800]="selectedArchetype() !== arch.name"
                    (click)="selectedArchetype.set(arch.name)"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">{{ arch.icon }}</span>
                      <div>
                        <div class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ arch.name }}</div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ arch.desc }}</div>
                      </div>
                    </div>
                    <span class="w-3.5 h-3.5 rounded-full" [style.backgroundColor]="arch.color"></span>
                  </button>
                }
              </div>
            </div>

            <!-- Primary Accent Override -->
            <div class="space-y-1.5">
              <label for="color-override-input" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Primary Hex Override (Optional)
              </label>
              <div class="flex items-center gap-2">
                <input
                  id="color-picker-input"
                  type="color"
                  class="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-1 bg-transparent"
                  [ngModel]="customColorHex()"
                  (ngModelChange)="customColorHex.set($event)"
                />
                <input
                  id="color-override-input"
                  type="text"
                  class="flex-1 min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  [ngModel]="customColorHex()"
                  (ngModelChange)="customColorHex.set($event)"
                  placeholder="#EA580C"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Brand Preview & Living Tokens -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Navigation Tabs -->
          <div class="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
            <button
              type="button"
              class="min-h-[48px] px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation whitespace-nowrap"
              [class.bg-white]="activeTab() === 'preview'"
              [class.dark:bg-slate-900]="activeTab() === 'preview'"
              [class.text-slate-900]="activeTab() === 'preview'"
              [class.dark:text-slate-100]="activeTab() === 'preview'"
              [class.shadow-sm]="activeTab() === 'preview'"
              [class.text-slate-600]="activeTab() !== 'preview'"
              [class.dark:text-slate-400]="activeTab() !== 'preview'"
              (click)="activeTab.set('preview')"
            >
              🎨 Brand Kit Preview
            </button>
            <button
              type="button"
              class="min-h-[48px] px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation whitespace-nowrap"
              [class.bg-white]="activeTab() === 'palette'"
              [class.dark:bg-slate-900]="activeTab() === 'palette'"
              [class.text-slate-900]="activeTab() === 'palette'"
              [class.dark:text-slate-100]="activeTab() === 'palette'"
              [class.shadow-sm]="activeTab() === 'palette'"
              [class.text-slate-600]="activeTab() !== 'palette'"
              [class.dark:text-slate-400]="activeTab() !== 'palette'"
              (click)="activeTab.set('palette')"
            >
              📊 WCAG AAA Palette
            </button>
            <button
              type="button"
              class="min-h-[48px] px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation whitespace-nowrap"
              [class.bg-white]="activeTab() === 'tokens'"
              [class.dark:bg-slate-900]="activeTab() === 'tokens'"
              [class.text-slate-900]="activeTab() === 'tokens'"
              [class.dark:text-slate-100]="activeTab() === 'tokens'"
              [class.shadow-sm]="activeTab() === 'tokens'"
              [class.text-slate-600]="activeTab() !== 'tokens'"
              [class.dark:text-slate-400]="activeTab() !== 'tokens'"
              (click)="activeTab.set('tokens')"
            >
              📦 CSS &amp; JSON Tokens
            </button>
          </div>

          <!-- Active Tab Content -->
          @if (activePackage(); as pkg) {
            <!-- Tab 1: Visual Brand Preview -->
            @if (activeTab() === 'preview') {
              <div class="space-y-4">
                <!-- Tagline & Narrative -->
                <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      {{ pkg.archetype }}
                    </span>
                    @if (pkg.cacheHit) {
                      <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ⚡ Served from Local Cache (0 Token Cost)
                      </span>
                    }
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                    &ldquo;{{ pkg.tagline }}&rdquo;
                  </h3>
                  <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {{ pkg.missionStatement }}
                  </p>
                  <div class="flex flex-wrap gap-2 pt-2">
                    @for (tone of pkg.toneOfVoice; track tone) {
                      <span class="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        #{{ tone }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Rendered Vector Assets -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (asset of pkg.assets; track asset.title) {
                    <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ asset.title }}</span>
                        <span class="text-[10px] font-mono uppercase text-slate-400">{{ asset.type }}</span>
                      </div>
                      <div
                        class="w-full bg-slate-950 p-4 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800"
                        [innerHTML]="sanitizeSvg(asset.svgContent)"
                      ></div>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ asset.description }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Tab 2: Color Palette & WCAG AAA Contrast -->
            @if (activeTab() === 'palette') {
              <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">WCAG 2.2 AAA Contrast Verification Matrix</h3>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    {{ wcagPassCount() }} / {{ pkg.colors.length }} Pass AAA (>= 7.0:1)
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  @for (c of pkg.colors; track c.name) {
                    <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div class="h-16 rounded-lg shadow-inner flex items-center justify-center font-mono text-xs font-bold" [style.backgroundColor]="c.hex" [style.color]="c.contrastOnWhite > 7 ? '#FFFFFF' : '#0F172A'">
                        {{ c.hex }}
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ c.name }}</span>
                        <span class="text-[10px] font-mono uppercase text-slate-400">{{ c.role }}</span>
                      </div>
                      <div class="text-[11px] space-y-1 font-mono text-slate-500 dark:text-slate-400">
                        <div class="flex justify-between">
                          <span>On White:</span>
                          <span class="font-bold" [class.text-teal-600]="c.contrastOnWhite >= 7.0">{{ c.contrastOnWhite }}:1</span>
                        </div>
                        <div class="flex justify-between">
                          <span>On Dark:</span>
                          <span class="font-bold" [class.text-teal-600]="c.contrastOnDark >= 7.0">{{ c.contrastOnDark }}:1</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Tab 3: Design Tokens Export -->
            @if (activeTab() === 'tokens') {
              <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">CSS Custom Properties &amp; JSON</h3>
                  <button
                    type="button"
                    class="min-h-[48px] px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer touch-manipulation"
                    (click)="copyCssTokens()"
                  >
                    @if (copied()) {
                      <span>✅ Copied to Clipboard</span>
                    } @else {
                      <span>📋 Copy CSS Tokens</span>
                    }
                  </button>
                </div>
                <pre class="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">{{ cssTokens() }}</pre>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class BrandPackageGeneratorComponent implements OnInit {
  protected readonly brandService = inject(BrandPackageGeneratorService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly brandName = signal<string>('PocketGull Sanctuary');
  readonly industry = signal<string>('Clinical Decision Support & Art Therapy');
  readonly selectedArchetype = signal<IBrandPackage['archetype']>('The Navigator');
  readonly customColorHex = signal<string>('#EA580C');
  readonly activeTab = signal<'preview' | 'palette' | 'tokens'>('preview');
  readonly copied = signal<boolean>(false);

  readonly archetypes: Array<{ name: IBrandPackage['archetype']; icon: string; desc: string; color: string }> = [
    { name: 'The Navigator', icon: '🧭', desc: 'Triage scoring & clarity', color: '#D4A373' },
    { name: 'The Chronicler', icon: '⏳', desc: 'Circadian vitals & sleep', color: '#E9C46A' },
    { name: 'The Statistician', icon: '⚖️', desc: 'Popperian tests (p < 0.05)', color: '#0284C7' },
    { name: 'The Scholar', icon: '📖', desc: 'Evidence & Cochrane synthesis', color: '#7E22CE' },
    { name: 'The Explorer', icon: '🔭', desc: '3D spatial anatomy & vision', color: '#0D9488' }
  ];

  readonly activePackage = computed(() => this.brandService.currentPackage());

  readonly wcagPassCount = computed(() => {
    const pkg = this.activePackage();
    if (!pkg) return 0;
    return pkg.colors.filter(c => c.wcagAaaNormalText).length;
  });

  readonly cssTokens = computed(() => {
    const pkg = this.activePackage();
    if (!pkg) return '';
    return this.brandService.exportCssTokens(pkg);
  });

  ngOnInit(): void {
    if (!this.brandService.currentPackage()) {
      this.generateKit();
    }
  }

  async generateKit(): Promise<void> {
    await this.brandService.generateBrandPackage({
      brandName: this.brandName(),
      industry: this.industry(),
      archetype: this.selectedArchetype(),
      primaryColorHex: this.customColorHex()
    });
  }

  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  async copyCssTokens(): Promise<void> {
    const tokens = this.cssTokens();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(tokens);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
