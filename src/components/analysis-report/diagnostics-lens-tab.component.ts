import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DiagnosticSubTab = 'labs' | 'imaging' | 'telemetry';

@Component({
  selector: 'app-diagnostics-lens-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <!-- Diagnostic Sub-Lens Tab Selection -->
      <div class="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-4xl overflow-x-auto">
        <button (click)="subTab.set('labs')"
          [class.bg-white]="subTab() === 'labs'"
          [class.dark:bg-zinc-800]="subTab() === 'labs'"
          [class.text-indigo-600]="subTab() === 'labs'"
          [class.dark:text-indigo-400]="subTab() === 'labs'"
          [class.text-zinc-500]="subTab() !== 'labs'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🧪 Laboratory & Biomarkers
        </button>
        <button (click)="subTab.set('imaging')"
          [class.bg-white]="subTab() === 'imaging'"
          [class.dark:bg-zinc-800]="subTab() === 'imaging'"
          [class.text-indigo-600]="subTab() === 'imaging'"
          [class.dark:text-indigo-400]="subTab() === 'imaging'"
          [class.text-zinc-500]="subTab() !== 'imaging'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🩻 Diagnostic Imaging (DICOM)
        </button>
        <button (click)="subTab.set('telemetry')"
          [class.bg-white]="subTab() === 'telemetry'"
          [class.dark:bg-zinc-800]="subTab() === 'telemetry'"
          [class.text-indigo-600]="subTab() === 'telemetry'"
          [class.dark:text-indigo-400]="subTab() === 'telemetry'"
          [class.text-zinc-500]="subTab() !== 'telemetry'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          📡 Wearable Telemetry & CGM
        </button>
      </div>

      <!-- Content Panel -->
      <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-4">
        @if (subTab() === 'labs') {
          <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">LOINC Laboratory Diagnostics Panel</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Comprehensive metabolic panel (CMP), lipid particle sub-fractions, inflammatory markers (hs-CRP, SIBI), and pharmacogenomic panel orders.
          </p>
        } @else if (subTab() === 'imaging') {
          <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">DICOM 3D Spatial Imaging Orders</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            High-resolution volumetric CT/MRI orders, musculoskeletal ultrasound, and automated AI radiomic feature extraction.
          </p>
        } @else {
          <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">Continuous Sensor Telemetry Tracking</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Continuous Glucose Monitor (CGM) time-in-range metrics, nocturnal HRV autonomic balance, and PPG pulse wave velocity.
          </p>
        }
      </div>
    </div>
  `
})
export class DiagnosticsLensTabComponent {
  subTab = signal<DiagnosticSubTab>('labs');
}
