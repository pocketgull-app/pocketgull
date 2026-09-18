import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketgullTypefaceSpecimenComponent } from './pocketgull-typeface-specimen.component';
import { MultilingualSpecimenComponent } from './multilingual-specimen.component';
import { PocketgullSansBenchComponent } from './pocketgull-sans-bench.component';
import { Typographic3dBodyComponent } from './typographic-3d-body.component';
import { PocketgullIconComponent } from './pocketgull-icon.component';
import { GlyphForgeStudioComponent } from './glyph-forge-studio.component';

@Component({
  selector: 'app-pocketgull-typeface-site',
  standalone: true,
  imports: [
    CommonModule,
    PocketgullTypefaceSpecimenComponent,
    MultilingualSpecimenComponent,
    PocketgullSansBenchComponent,
    Typographic3dBodyComponent,
    PocketgullIconComponent,
    GlyphForgeStudioComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      <!-- Minimalist Braun Grid Top Header -->
      <header class="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <app-pocketgull-icon name="seagull" />
            <span class="text-xl font-pocketgull tracking-tight text-zinc-900 dark:text-amber-400 uppercase">
              PocketGull
            </span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono font-bold">
              Typeface Suite
            </span>
          </div>

          <div class="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span class="hidden sm:inline">Dieter Rams Minimal Grid</span>
            <a href="https://github.com/philgear/pocketgull" target="_blank" class="px-3 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity">
              GitHub OFL
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div class="space-y-4 max-w-3xl">
          <div class="inline-flex items-center gap-2 text-xs font-mono font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-widest">
            <span>—</span> Weniger, aber besser (Less, but better)
          </div>
          <h1 class="text-4xl sm:text-6xl font-pocketgull text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
            PocketGull VF &amp; Typeface Suite
          </h1>
          <p class="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-pocketgull-inter">
            Clinical typography designed for screen legibility, zero-error ICU dosage disambiguation, and global No-Tofu multilingual coverage.
          </p>
        </div>

        <!-- Specimen Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto">
          <button
            (click)="activeTab.set('studio')"
            [class.bg-gradient-to-r]="activeTab() === 'studio'"
            [class.from-amber-500]="activeTab() === 'studio'"
            [class.to-rose-500]="activeTab() === 'studio'"
            [class.text-zinc-950]="activeTab() === 'studio'"
            [class.shadow-md]="activeTab() === 'studio'"
            [class.bg-zinc-100]="activeTab() !== 'studio'"
            [class.dark:bg-zinc-800]="activeTab() !== 'studio'"
            [class.text-zinc-600]="activeTab() !== 'studio'"
            [class.dark:text-zinc-300]="activeTab() !== 'studio'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🖋️</span> In-Browser Glyph Studio &amp; Exporter
          </button>

          <button
            (click)="activeTab.set('sans')"
            [class.bg-cyan-500]="activeTab() === 'sans'"
            [class.text-zinc-950]="activeTab() === 'sans'"
            [class.shadow-md]="activeTab() === 'sans'"
            [class.bg-zinc-100]="activeTab() !== 'sans'"
            [class.dark:bg-zinc-800]="activeTab() !== 'sans'"
            [class.text-zinc-600]="activeTab() !== 'sans'"
            [class.dark:text-zinc-300]="activeTab() !== 'sans'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🔬</span> PocketGull Sans (Inter-Grotesque)
          </button>

          <button
            (click)="activeTab.set('3d-body')"
            [class.bg-emerald-500]="activeTab() === '3d-body'"
            [class.text-zinc-950]="activeTab() === '3d-body'"
            [class.shadow-md]="activeTab() === '3d-body'"
            [class.bg-zinc-100]="activeTab() !== '3d-body'"
            [class.dark:bg-zinc-800]="activeTab() !== '3d-body'"
            [class.text-zinc-600]="activeTab() !== '3d-body'"
            [class.dark:text-zinc-300]="activeTab() !== '3d-body'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🫀</span> Typographic 3D Body &amp; Shaders
          </button>

          <button
            (click)="activeTab.set('multilingual')"
            [class.bg-amber-500]="activeTab() === 'multilingual'"
            [class.text-zinc-950]="activeTab() === 'multilingual'"
            [class.shadow-md]="activeTab() === 'multilingual'"
            [class.bg-zinc-100]="activeTab() !== 'multilingual'"
            [class.dark:bg-zinc-800]="activeTab() !== 'multilingual'"
            [class.text-zinc-600]="activeTab() !== 'multilingual'"
            [class.dark:text-zinc-300]="activeTab() !== 'multilingual'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🌐</span> No-Tofu Multilingual VF
          </button>

          <button
            (click)="activeTab.set('marker')"
            [class.bg-amber-500]="activeTab() === 'marker'"
            [class.text-zinc-950]="activeTab() === 'marker'"
            [class.shadow-md]="activeTab() === 'marker'"
            [class.bg-zinc-100]="activeTab() !== 'marker'"
            [class.dark:bg-zinc-800]="activeTab() !== 'marker'"
            [class.text-zinc-600]="activeTab() !== 'marker'"
            [class.dark:text-zinc-300]="activeTab() !== 'marker'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🔤</span> PocketGull Rounded Superfamily
          </button>

          <button
            (click)="activeTab.set('iconography')"
            [class.bg-amber-500]="activeTab() === 'iconography'"
            [class.text-zinc-950]="activeTab() === 'iconography'"
            [class.shadow-md]="activeTab() === 'iconography'"
            [class.bg-zinc-100]="activeTab() !== 'iconography'"
            [class.dark:bg-zinc-800]="activeTab() !== 'iconography'"
            [class.text-zinc-600]="activeTab() !== 'iconography'"
            [class.dark:text-zinc-300]="activeTab() !== 'iconography'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🩺</span> Clinical Iconography ({{ icons.length }})
          </button>

          <button
            (click)="activeTab.set('terminal')"
            [class.bg-teal-500]="activeTab() === 'terminal'"
            [class.text-zinc-950]="activeTab() === 'terminal'"
            [class.shadow-md]="activeTab() === 'terminal'"
            [class.bg-zinc-100]="activeTab() !== 'terminal'"
            [class.dark:bg-zinc-800]="activeTab() !== 'terminal'"
            [class.text-zinc-600]="activeTab() !== 'terminal'"
            [class.dark:text-zinc-300]="activeTab() !== 'terminal'"
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>📟</span> Circadian Terminal (Oh My Posh)
          </button>
        </div>
      </section>

      <!-- Tab Content Area -->
      <section class="max-w-7xl mx-auto px-6 pb-16">
        @if (activeTab() === 'terminal') {
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
            <div class="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-pocketgull">
                  Circadian Terminal Engine &amp; Shell Suite
                </h2>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  Precision Oh My Posh themes with Dieter Rams minimalism, bio-rhythmic circadian pacing, and 100% Zero-Tofu support in Pocket Gull Mono.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <a href="/brand/terminal/pocketgull-washi.omp.json" download class="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-bold hover:bg-amber-500/20 transition">
                  ⬇️ Washi Theme (.json)
                </a>
                <a href="/brand/terminal/pocketgull-ophthalmic.omp.json" download class="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/30 text-xs font-mono font-bold hover:bg-teal-500/20 transition">
                  ⬇️ Ophthalmic Theme (.json)
                </a>
              </div>
            </div>

            <!-- Live Interactive Visual Previews -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Washi Daytime Card -->
              <div class="p-6 rounded-3xl bg-[#faf8f2] text-zinc-900 border border-[#e5dfd3] shadow-md space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">☀️</span>
                    <span class="font-bold text-sm tracking-wide uppercase font-pocketgull text-zinc-900">PocketGull Washi (Daytime)</span>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/40 font-bold">07:00 – 18:00</span>
                </div>
                <p class="text-xs text-zinc-600 leading-relaxed">
                  Tactile unbleached washi paper tones for natural daylight ergonomics. Prevents pupil constriction and screen fatigue.
                </p>
                
                <!-- Terminal Mockup -->
                <div class="p-4 rounded-2xl bg-[#f0ebe1] border border-[#e2d9c8] font-mono text-xs overflow-x-auto shadow-inner">
                  <div class="flex items-center gap-1.5 pb-2 text-zinc-400 border-b border-[#e2d9c8] mb-3 text-[10px]">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                    <span class="ml-2 font-bold text-zinc-500">pwsh — PocketGull Washi</span>
                  </div>
                  <div class="py-2 flex items-center flex-wrap gap-1">
                    <span class="text-[#0f766e]"></span><span class="bg-[#0f766e] text-white px-2 py-0.5 font-bold">⚕ POCKETGULL</span><span class="text-[#0f766e] mr-1"></span>
                    <span class="text-[#e5dfd3]"></span><span class="bg-[#e5dfd3] text-zinc-900 px-2 py-0.5 font-bold">📁 ~/Pocketgull</span><span class="text-[#e5dfd3] mr-1"></span>
                    <span class="text-[#047857]"></span><span class="bg-[#047857] text-white px-2 py-0.5 font-bold"> main</span><span class="text-[#047857] mr-1"></span>
                    <span class="text-[#f0ebe1]"></span><span class="bg-[#f0ebe1] text-[#78350f] px-2 py-0.5 font-bold">⏱ 12ms</span><span class="text-[#f0ebe1]"></span>
                  </div>
                </div>
              </div>

              <!-- Ophthalmic Night Card -->
              <div class="p-6 rounded-3xl bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-md space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🌙</span>
                    <span class="font-bold text-sm tracking-wide uppercase font-pocketgull text-zinc-100">PocketGull Ophthalmic (Night)</span>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 font-bold">18:00 – 07:00</span>
                </div>
                <p class="text-xs text-zinc-400 leading-relaxed">
                  Surgical obsidian backdrop with high-contrast emerald &amp; teal status telemetry. Conforms to WCAG 2.1 AAA contrast rules.
                </p>
                
                <!-- Terminal Mockup -->
                <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs overflow-x-auto shadow-inner">
                  <div class="flex items-center gap-1.5 pb-2 text-zinc-600 border-b border-zinc-800/80 mb-3 text-[10px]">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span class="ml-2 font-bold text-zinc-400">pwsh — PocketGull Ophthalmic</span>
                  </div>
                  <div class="py-2 flex items-center flex-wrap gap-1">
                    <span class="text-[#0f766e]"></span><span class="bg-[#0f766e] text-white px-2 py-0.5 font-bold">⚕ POCKETGULL</span><span class="text-[#0f766e] mr-1"></span>
                    <span class="text-[#18181b]"></span><span class="bg-[#18181b] text-zinc-100 px-2 py-0.5 font-bold">📁 ~/Pocketgull</span><span class="text-[#18181b] mr-1"></span>
                    <span class="text-[#059669]"></span><span class="bg-[#059669] text-white px-2 py-0.5 font-bold"> main</span><span class="text-[#059669] mr-1"></span>
                    <span class="text-[#1c1917]"></span><span class="bg-[#1c1917] text-[#fbbf24] px-2 py-0.5 font-bold">⏱ 8ms</span><span class="text-[#1c1917]"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Installation Box -->
            <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold uppercase tracking-wider font-mono text-zinc-800 dark:text-zinc-200">
                  ⚡ 1-Minute PowerShell &amp; Windows Terminal Integration
                </h3>
                <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">✓ Zero-Tofu Guaranteed</span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Compatible with both Windows PowerShell 5.1 and PowerShell 7 (pwsh). Uses your local PocketGull installation assets.
              </p>
              <pre class="p-4 rounded-xl bg-zinc-950 text-zinc-200 text-xs font-mono overflow-x-auto border border-zinc-800"><code># Add to $PROFILE
if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) &#123;
    $shellType = if ($PSVersionTable.PSVersion.Major -ge 6) &#123; 'pwsh' &#125; else &#123; 'powershell' &#125;
    $h = (Get-Date).Hour
    $washiTheme = "$HOME&#92;Pocketgull&#92;pocketgull&#92;public&#92;brand&#92;terminal&#92;pocketgull-washi.omp.json"
    $ophthalmicTheme = "$HOME&#92;Pocketgull&#92;pocketgull&#92;public&#92;brand&#92;terminal&#92;pocketgull-ophthalmic.omp.json"
    $cfg = if ($h -ge 7 -and $h -lt 18 -and (Test-Path $washiTheme)) &#123; $washiTheme &#125; elseif (Test-Path $ophthalmicTheme) &#123; $ophthalmicTheme &#125; else &#123; $null &#125;
    if ($cfg) &#123; oh-my-posh init $shellType --config $cfg | Invoke-Expression &#125; else &#123; oh-my-posh init $shellType | Invoke-Expression &#125;
&#125;</code></pre>
            </div>
          </div>
        }

        @if (activeTab() === 'studio') {
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <app-glyph-forge-studio />
          </div>
        }

        @if (activeTab() === 'sans') {
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <app-pocketgull-sans-bench />
          </div>
        }

        @if (activeTab() === '3d-body') {
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <app-typographic-3d-body />
          </div>
        }

        @if (activeTab() === 'multilingual') {
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <app-multilingual-specimen />
          </div>
        }

        @if (activeTab() === 'marker') {
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <app-pocketgull-typeface-specimen />
          </div>
        }

        @if (activeTab() === 'iconography') {
          <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h2 class="text-2xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-pocketgull">
                Clinical Iconography Suite
              </h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Vector icon glyphs designed for high-visibility medical charting and biometric telemetry.
              </p>
            </div>

            <div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              @for (icon of icons; track icon.name) {
                <div class="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 transition-colors shadow-xs">
                  <app-pocketgull-icon [name]="icon.name" />
                  <span class="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 capitalize">{{ icon.label }}</span>
                </div>
              }
            </div>
          </div>
        }
      </section>

      <!-- Footer -->
      <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
        <p class="font-mono">PocketGull Typeface Suite • Released under SIL Open Font License 1.1</p>
        <p>Designed with Dieter Rams Principles • Certified WCAG 2.1 AAA Contrast Ratio &amp; Zero-Tofu Multilingual Cascade</p>
      </footer>
    </div>
  `
})
export class PocketgullTypefaceSiteComponent {
  activeTab = signal<'studio' | 'sans' | '3d-body' | 'multilingual' | 'marker' | 'iconography' | 'terminal'>('studio');
  icons: Array<{ name: any; label: string }> = [
    { name: 'seagull', label: 'Mascot' },
    { name: 'heart', label: 'Cardiology' },
    { name: 'lungs', label: 'Pulmonary' },
    { name: 'brain', label: 'Neurology' },
    { name: 'spine', label: 'Orthopedic' },
    { name: 'tooth', label: 'Teledentistry' },
    { name: 'cgm', label: 'CGM Blood' },
    { name: 'stethoscope', label: 'Auscultation' },
    { name: 'dna', label: 'Genomics' },
    { name: 'syringe', label: 'Injection' },
    { name: 'pill', label: 'Pharma' },
    { name: 'shield', label: 'HIPAA Lock' }
  ];
}
