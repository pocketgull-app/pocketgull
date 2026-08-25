import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketgullTypefaceSpecimenComponent } from './pocketgull-typeface-specimen.component';
import { PocketgullIconComponent } from './pocketgull-icon.component';

@Component({
  selector: 'app-pocketgull-typeface-site',
  standalone: true,
  imports: [CommonModule, PocketgullTypefaceSpecimenComponent, PocketgullIconComponent],
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
      <section class="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div class="space-y-4 max-w-3xl">
          <div class="inline-flex items-center gap-2 text-xs font-mono font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-widest">
            <span>—</span> Weniger, aber besser (Less, but better)
          </div>
          <h1 class="text-4xl sm:text-6xl font-pocketgull text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
            Handcrafted Felt-Tip Marker &amp; High-Contrast Clinical Typeface
          </h1>
          <p class="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-pocketgull-inter">
            Designed for clinical legibility, papercraft branding, and zero-error ICU lab chart readouts. Certified WCAG 2.1 AAA high-contrast disambiguation under the SIL Open Font License 1.1.
          </p>
        </div>

        <!-- Master Specimen Image Card -->
        <div class="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900 p-2">
          <img 
            src="/images/specimens/dieter_rams_pocketgull_specimen.png" 
            alt="Dieter Rams Principles PocketGull Type Specimen"
            class="w-full h-auto rounded-2xl object-cover"
          />
        </div>
      </section>

      <!-- Interactive Specimen Sandbox Engine -->
      <section class="max-w-7xl mx-auto px-6 py-12">
        <app-pocketgull-typeface-specimen />
      </section>

      <!-- Clinical Iconography Grid -->
      <section class="max-w-7xl mx-auto px-6 py-16 space-y-6">
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
      </section>

      <!-- Footer -->
      <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
        <p class="font-mono">PocketGull Typeface Suite • Released under SIL Open Font License 1.1</p>
        <p>Designed with Dieter Rams Principles • Certified WCAG 2.1 AAA Contrast Ratio</p>
      </footer>
    </div>
  `
})
export class PocketgullTypefaceSiteComponent {
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
