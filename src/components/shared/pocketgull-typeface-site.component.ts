import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketgullTypefaceSpecimenComponent } from './pocketgull-typeface-specimen.component';
import { MultilingualSpecimenComponent } from './multilingual-specimen.component';
import { PocketgullSansBenchComponent } from './pocketgull-sans-bench.component';
import { Typographic3dBodyComponent } from './typographic-3d-body.component';
import { PocketgullIconComponent } from './pocketgull-icon.component';

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
            <span>✍️</span> Felt-Tip Marker Specimen
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
        </div>
      </section>

      <!-- Tab Content Area -->
      <section class="max-w-7xl mx-auto px-6 pb-16">
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
            <!-- Master Specimen Image Card -->
            <div class="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900 p-2">
              <img 
                src="/images/specimens/dieter_rams_pocketgull_specimen.png" 
                alt="Dieter Rams Principles PocketGull Type Specimen"
                class="w-full h-auto rounded-2xl object-cover"
              />
            </div>

            <!-- Interactive Marker Specimen Sandbox Engine -->
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
  activeTab = signal<'sans' | '3d-body' | 'multilingual' | 'marker' | 'iconography'>('sans');
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
