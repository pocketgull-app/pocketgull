import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';

export interface IToothData {
  fdiCode: number; // e.g. 11, 18, 21, 31, 48
  name: string;
  quadrant: 1 | 2 | 3 | 4;
  surfaces: {
    mesial: boolean;
    occlusal: boolean;
    distal: boolean;
    facial: boolean;
    lingual: boolean;
  };
  probingDepthMm: number;
  bleedingOnProbing: boolean;
  wearGrade: 0 | 1 | 2 | 3 | 4; // Smith & Knight TWI Tooth Wear Index
  notes?: string;
}

@Component({
  selector: 'app-teledentistry-odontogram',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-teal-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-lg">
            🦷
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Teledentistry FDI Odontogram & Periodontal Telemetry
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Interactive 32-tooth FDI notation surface mapping, probing pocket depth (PPD), and oral microbiome risk.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold font-mono">
            Salivary pH: {{ salivaryPh() }} ({{ pHStatus() }})
          </span>
        </div>
      </div>

      <!-- Oral Microbiome & Salivary Health Dashboard -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">Salivary pH Buffer</span>
          <div class="text-lg font-black text-teal-600 dark:text-teal-400 font-mono">{{ salivaryPh() }}</div>
          <span class="text-[10px] text-gray-500 dark:text-zinc-400">Optimal Range: 6.7 – 7.3</span>
        </div>

        <div class="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">Biofilm & Microbial Risk</span>
          <div class="text-lg font-black font-mono" [class.text-emerald-500]="microbiomeRisk() === 'Low'" [class.text-amber-500]="microbiomeRisk() === 'Moderate'" [class.text-rose-500]="microbiomeRisk() === 'High'">
            {{ microbiomeRisk() }}
          </div>
          <span class="text-[10px] text-gray-500 dark:text-zinc-400">S. mutans / P. gingivalis index</span>
        </div>

        <div class="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">Periodontal Sites &ge; 4mm</span>
          <div class="text-lg font-black text-rose-500 font-mono">{{ deepProbingSitesCount() }} sites</div>
          <span class="text-[10px] text-gray-500 dark:text-zinc-400">LOINC 54568-1 PSR Score</span>
        </div>
      </div>

      <!-- Tooth Selector Quick Tabs (Upper Right, Upper Left, Lower Left, Lower Right) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            FDI Permanent Tooth Arch Grid (Select tooth to inspect or mark surfaces)
          </h4>
        </div>

        <!-- FDI Teeth Grid -->
        <div class="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-3 bg-gray-50 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-xl">
          @for (tooth of teeth(); track tooth.fdiCode) {
            <button
              (click)="selectTooth(tooth.fdiCode)"
              [class.border-teal-500]="selectedFdiCode() === tooth.fdiCode"
              [class.bg-teal-500\/20]="selectedFdiCode() === tooth.fdiCode"
              [class.border-rose-500]="tooth.probingDepthMm >= 4 || tooth.bleedingOnProbing"
              class="p-2 border rounded-lg transition text-center flex flex-col items-center gap-1 cursor-pointer bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-teal-400">
              <span class="text-[10px] font-bold font-mono text-gray-500 dark:text-zinc-400">#{{ tooth.fdiCode }}</span>
              <span class="text-xs">🦷</span>
              @if (hasSurfaceCaries(tooth)) {
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              }
            </button>
          }
        </div>

        <!-- Selected Tooth Detail Card -->
        @if (activeToothData(); as activeTooth) {
          <div class="p-4 bg-teal-500/5 border border-teal-500/30 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-teal-500/20 pb-2">
              <div>
                <span class="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Tooth FDI #{{ activeTooth.fdiCode }}: {{ activeTooth.name }}
                </span>
                <span class="text-[11px] text-gray-500 dark:text-zinc-400 block">Quadrant {{ activeTooth.quadrant }}</span>
              </div>

              <!-- Bleeding on Probing Toggle -->
              <button
                (click)="toggleBleeding(activeTooth.fdiCode)"
                [class.bg-rose-600]="activeTooth.bleedingOnProbing"
                [class.text-white]="activeTooth.bleedingOnProbing"
                [class.bg-gray-100]="!activeTooth.bleedingOnProbing"
                [class.dark:bg-zinc-800]="!activeTooth.bleedingOnProbing"
                [class.text-gray-700]="!activeTooth.bleedingOnProbing"
                [class.dark:text-zinc-300]="!activeTooth.bleedingOnProbing"
                class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
                <span>🩸 Bleeding on Probing (BOP)</span>
                <span>{{ activeTooth.bleedingOnProbing ? 'YES' : 'NO' }}</span>
              </button>
            </div>

            <!-- Tooth Surface Mapping, Probing Depth, and TWI Wear Controls -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <!-- Surfaces -->
              <div class="space-y-2">
                <span class="font-bold text-gray-700 dark:text-zinc-300 block uppercase tracking-wider text-[11px]">
                  Anatomical Surface Caries / Restoration Mapping:
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <button (click)="toggleSurface(activeTooth.fdiCode, 'mesial')" [class.bg-rose-500]="activeTooth.surfaces.mesial" [class.text-white]="activeTooth.surfaces.mesial" class="px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-[10.5px] font-bold uppercase transition cursor-pointer">M</button>
                  <button (click)="toggleSurface(activeTooth.fdiCode, 'occlusal')" [class.bg-rose-500]="activeTooth.surfaces.occlusal" [class.text-white]="activeTooth.surfaces.occlusal" class="px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-[10.5px] font-bold uppercase transition cursor-pointer">O</button>
                  <button (click)="toggleSurface(activeTooth.fdiCode, 'distal')" [class.bg-rose-500]="activeTooth.surfaces.distal" [class.text-white]="activeTooth.surfaces.distal" class="px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-[10.5px] font-bold uppercase transition cursor-pointer">D</button>
                  <button (click)="toggleSurface(activeTooth.fdiCode, 'facial')" [class.bg-rose-500]="activeTooth.surfaces.facial" [class.text-white]="activeTooth.surfaces.facial" class="px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-[10.5px] font-bold uppercase transition cursor-pointer">F</button>
                  <button (click)="toggleSurface(activeTooth.fdiCode, 'lingual')" [class.bg-rose-500]="activeTooth.surfaces.lingual" [class.text-white]="activeTooth.surfaces.lingual" class="px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-[10.5px] font-bold uppercase transition cursor-pointer">L</button>
                </div>
              </div>

              <!-- Probing Depth -->
              <div class="space-y-2">
                <span class="font-bold text-gray-700 dark:text-zinc-300 block uppercase tracking-wider text-[11px]">
                  Probing Depth (PPD):
                </span>
                <div class="flex items-center gap-2">
                  <button (click)="setProbingDepth(activeTooth.fdiCode, activeTooth.probingDepthMm - 1)" class="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-black text-xs cursor-pointer">-</button>
                  <span class="text-sm font-mono font-black" [class.text-rose-500]="activeTooth.probingDepthMm >= 4">{{ activeTooth.probingDepthMm }} mm</span>
                  <button (click)="setProbingDepth(activeTooth.fdiCode, activeTooth.probingDepthMm + 1)" class="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-black text-xs cursor-pointer">+</button>
                  @if (activeTooth.probingDepthMm >= 4) {
                    <span class="text-[9.5px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-300">
                      ⚠️ Pocketing
                    </span>
                  }
                </div>
              </div>

              <!-- Tooth Wear & Tear Index (TWI Grade 0-4) -->
              <div class="space-y-2">
                <span class="font-bold text-gray-700 dark:text-zinc-300 block uppercase tracking-wider text-[11px]">
                  Tooth Wear & Tear Index (Smith & Knight TWI):
                </span>
                <div class="flex flex-wrap gap-1">
                  @for (grade of [0, 1, 2, 3, 4]; track grade) {
                    <button
                      (click)="setWearGrade(activeTooth.fdiCode, $any(grade))"
                      [class.bg-amber-500]="activeTooth.wearGrade === grade && grade >= 2"
                      [class.text-white]="activeTooth.wearGrade === grade"
                      [class.bg-teal-600]="activeTooth.wearGrade === grade && grade < 2"
                      [class.bg-gray-100]="activeTooth.wearGrade !== grade"
                      [class.dark:bg-zinc-800]="activeTooth.wearGrade !== grade"
                      [class.text-gray-700]="activeTooth.wearGrade !== grade"
                      [class.dark:text-zinc-300]="activeTooth.wearGrade !== grade"
                      class="px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-[10px] font-extrabold cursor-pointer transition">
                      G{{ grade }}
                    </button>
                  }
                </div>
                <span class="text-[10px] text-gray-500 dark:text-zinc-400 block">
                  {{ activeTooth.wearGrade === 0 ? 'Normal Enamel' : activeTooth.wearGrade === 1 ? 'Mild Smooth Facets' : activeTooth.wearGrade === 2 ? 'Dentin Exposed <1/3' : activeTooth.wearGrade === 3 ? 'Dentin Exposed >1/3' : 'Pulp Exposure / Severe Wear' }}
                </span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Emergency OTC Dental Relief Trigger Banner -->
      <div class="p-4 bg-teal-950/40 border border-teal-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span>🚨</span>
          <div>
            <span class="font-bold text-teal-200 uppercase tracking-wider block">Acute Toothache or Tooth Injury?</span>
            <span class="text-[11px] text-teal-300/80">Locate fast-acting Benzocaine 20% pain gel & eugenol temporary tooth fillings at nearby grocery stores.</span>
          </div>
        </div>

        <button (click)="openEmergencyDentalSupplies()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg border border-teal-400 transition cursor-pointer shadow-md">
          🏥 Find OTC Dental Relief Nearby
        </button>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class TeledentistryOdontogramComponent {
  private state = inject(PatientStateService);
  private decoder = inject(MedicalDecoderService);

  readonly selectedFdiCode = signal<number>(11);
  readonly salivaryPh = signal<number>(6.9);
  readonly microbiomeRisk = signal<'Low' | 'Moderate' | 'High'>('Low');

  readonly pHStatus = computed(() => {
    const ph = this.salivaryPh();
    if (ph < 6.5) return 'Acidic (Enamel Erosion Risk)';
    if (ph > 7.4) return 'Alkaline (Calculus Formation Risk)';
    return 'Balanced (Normal Buffering)';
  });

  readonly teeth = signal<IToothData[]>([
    // Maxillary Upper Arch (18 -> 28)
    { fdiCode: 18, name: 'Upper Right 3rd Molar (Wisdom)', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 1 },
    { fdiCode: 17, name: 'Upper Right 2nd Molar', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 3, bleedingOnProbing: false, wearGrade: 1 },
    { fdiCode: 16, name: 'Upper Right 1st Molar', quadrant: 1, surfaces: { mesial: false, occlusal: true, distal: false, facial: false, lingual: false }, probingDepthMm: 4, bleedingOnProbing: true, wearGrade: 2 },
    { fdiCode: 15, name: 'Upper Right 2nd Premolar', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 14, name: 'Upper Right 1st Premolar', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 13, name: 'Upper Right Canine', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 1 },
    { fdiCode: 12, name: 'Upper Right Lateral Incisor', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 11, name: 'Upper Right Central Incisor', quadrant: 1, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    
    { fdiCode: 21, name: 'Upper Left Central Incisor', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 22, name: 'Upper Left Lateral Incisor', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 23, name: 'Upper Left Canine', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 1 },
    { fdiCode: 24, name: 'Upper Left 1st Premolar', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 25, name: 'Upper Left 2nd Premolar', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 3, bleedingOnProbing: false, wearGrade: 0 },
    { fdiCode: 26, name: 'Upper Left 1st Molar', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 3, bleedingOnProbing: false, wearGrade: 1 },
    { fdiCode: 27, name: 'Upper Left 2nd Molar', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 1 },
    { fdiCode: 28, name: 'Upper Left 3rd Molar (Wisdom)', quadrant: 2, surfaces: { mesial: false, occlusal: false, distal: false, facial: false, lingual: false }, probingDepthMm: 2, bleedingOnProbing: false, wearGrade: 0 }
  ]);

  readonly activeToothData = computed(() => {
    const code = this.selectedFdiCode();
    return this.teeth().find(t => t.fdiCode === code) ?? this.teeth()[0];
  });

  readonly deepProbingSitesCount = computed(() => {
    return this.teeth().filter(t => t.probingDepthMm >= 4).length;
  });

  readonly significantToothWearCount = computed(() => {
    return this.teeth().filter(t => t.wearGrade >= 2).length;
  });

  setWearGrade(fdiCode: number, grade: 0 | 1 | 2 | 3 | 4): void {
    this.teeth.update(teethList => 
      teethList.map(t => t.fdiCode === fdiCode ? { ...t, wearGrade: grade } : t)
    );
  }

  selectTooth(fdiCode: number): void {
    this.selectedFdiCode.set(fdiCode);
  }

  hasSurfaceCaries(tooth: IToothData): boolean {
    const s = tooth.surfaces;
    return s.mesial || s.occlusal || s.distal || s.facial || s.lingual;
  }

  toggleSurface(fdiCode: number, surface: keyof IToothData['surfaces']): void {
    this.teeth.update(teethList => 
      teethList.map(t => {
        if (t.fdiCode === fdiCode) {
          return {
            ...t,
            surfaces: {
              ...t.surfaces,
              [surface]: !t.surfaces[surface]
            }
          };
        }
        return t;
      })
    );
  }

  setProbingDepth(fdiCode: number, depthMm: number): void {
    const clamped = Math.max(1, Math.min(12, depthMm));
    this.teeth.update(teethList => 
      teethList.map(t => t.fdiCode === fdiCode ? { ...t, probingDepthMm: clamped } : t)
    );
  }

  toggleBleeding(fdiCode: number): void {
    this.teeth.update(teethList => 
      teethList.map(t => t.fdiCode === fdiCode ? { ...t, bleedingOnProbing: !t.bleedingOnProbing } : t)
    );
  }

  openEmergencyDentalSupplies(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-medical-supply-navigator', { detail: { category: 'Dental & Oral Health Care' } }));
    }
  }
}
