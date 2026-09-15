import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocDrillService } from '../../services/doc-drill.service';
import { BioAdaptiveTypographyService } from '../../services/bio-adaptive-typography.service';

@Component({
  selector: 'app-splash-bedside-physics-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- 👁️ Sloan 5:1 Optotype Calibration & 203 DPI Bedside Badge -->
    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 text-[9.5px] font-mono mt-2 shadow-2xs">
      <button type="button" (click)="openSloanDrill()"
        class="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        title="Drill down on Sloan 5:1 Optotype Invariant">
        <span class="pg-icon pg-icon-eye text-xs leading-none"></span>
        <span>Sloan 5:1 Invariant</span>
      </button>
      <span class="text-zinc-400 dark:text-zinc-500">•</span>
      <button type="button" (click)="openThermalDrill()"
        class="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-bold hover:underline cursor-pointer"
        title="Drill down on 203 DPI Bedside Thermal Physics">
        <span class="pg-icon pg-icon-print text-[10px] leading-none"></span>
        <span>203 DPI Physics</span>
      </button>
      <span class="text-zinc-400 dark:text-zinc-500">•</span>
      <button type="button" (click)="printDemo($event)" title="Test 203 DPI Bedside Label Print"
        class="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer">
        <span>Print Demo</span>
      </button>
    </div>
  `
})
export class SplashBedsidePhysicsBadgeComponent {
  readonly docDrill = inject(DocDrillService, { optional: true });
  readonly bioTypography = inject(BioAdaptiveTypographyService, { optional: true });
  readonly printTriggered = output<void>();

  openSloanDrill(): void {
    this.docDrill?.openDrill('Louise Sloan 5:1 Invariant', { category: 'OPHTHALMOLOGY' });
  }

  openThermalDrill(): void {
    this.docDrill?.openDrill('Bedside 203 DPI Thermal Label Physics', { category: 'HARDWARE INTEROP' });
  }

  printDemo(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (typeof document !== 'undefined') {
      document.body.classList.add('printing-thermal');
      if (this.bioTypography) {
        this.bioTypography.printBedsideThermalLabel();
      } else if (typeof window !== 'undefined') {
        window.print();
      }
      setTimeout(() => {
        document.body.classList.remove('printing-thermal');
      }, 1000);
    }
    this.printTriggered.emit();
  }
}
