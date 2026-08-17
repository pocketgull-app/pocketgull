import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IArchivalGalleryCard {
  id: string;
  milestoneTitle: string;
  encounterType: string;
  date: string;
  attendingPhysician: string;
  vignetteTheme: 'origami_vagal_gull' | 'quilling_mitochondria' | 'papercut_lighthouse' | 'quilling_organelle';
  vignetteImgSrc: string;
  themeLabel: string;
  vitalsSummary: string;
  keyDiagnoses: string[];
  prescribedProtocols: string[];
  fhirPassportHash: string;
  notesExcerpt: string;
}

@Component({
  selector: 'app-archival-health-gallery',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl mb-8 font-sans">
      
      <!-- Header Banner with Fine Art Theme Accent -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">🖼️</span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                Living Archival Health History Gallery
              </h2>
              <span class="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                Longitudinal Art Keepsakes
              </span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              Chronological Healthspan Milestones • Paper-Art Illuminated Folios • Cryptographic FHIR R4 Passports
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            Total Milestones: <strong>{{ galleryCards().length }}</strong>
          </span>
        </div>
      </div>

      <!-- Gallery Deck Carousel / Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (card of galleryCards(); track card.id; let idx = $index) {
          <div class="group bg-[#faf8f5] dark:bg-zinc-950 rounded-2xl border-2 border-zinc-300 dark:border-zinc-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 shadow-md hover:shadow-2xl overflow-hidden flex flex-col justify-between relative font-serif">
            
            <!-- Card Vignette Header Image with Soft Vignette Shader -->
            <div class="aspect-16/9 overflow-hidden relative bg-zinc-900">
              <img [src]="card.vignetteImgSrc" [alt]="card.milestoneTitle" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" />
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent"></div>
              
              <!-- Floating Date & Theme Badge -->
              <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  {{ card.date }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-teal-950/80 backdrop-blur text-teal-300 text-[10px] font-mono font-bold border border-teal-500/40">
                  {{ card.themeLabel }}
                </span>
              </div>

              <!-- Milestone Title in Vignette -->
              <div class="absolute bottom-2.5 left-3 right-3 text-white space-y-0.5">
                <div class="text-[10px] font-mono uppercase tracking-widest text-teal-300">{{ card.encounterType }}</div>
                <h3 class="text-sm font-bold leading-snug line-clamp-1">{{ card.milestoneTitle }}</h3>
              </div>
            </div>

            <!-- Card Body: Clinical Highlights on Vellum Texture -->
            <div class="p-4 space-y-3 font-sans text-xs flex-grow">
              
              <!-- Vitals Telemetry Capsule -->
              <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span class="font-bold text-teal-700 dark:text-teal-400">📊 Vitals:</span>
                <span>{{ card.vitalsSummary }}</span>
              </div>

              <!-- Diagnoses Tags -->
              <div class="flex flex-wrap gap-1">
                @for (dx of card.keyDiagnoses; track dx) {
                  <span class="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium">
                    {{ dx }}
                  </span>
                }
              </div>

              <!-- Notes Excerpt -->
              <p class="text-zinc-600 dark:text-zinc-400 text-xs italic line-clamp-2 leading-relaxed">
                "{{ card.notesExcerpt }}"
              </p>
            </div>

            <!-- Card Footer: Cryptographic Hash & Actions -->
            <div class="p-3 bg-zinc-100/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <span class="truncate max-w-[140px]" [title]="card.fhirPassportHash">
                🔐 {{ card.fhirPassportHash }}
              </span>
              <button (click)="openMilestoneDetail(card)"
                class="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold transition cursor-pointer flex items-center gap-1">
                <span>View Folio</span>
                <span>→</span>
              </button>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class ArchivalHealthGalleryComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  selectedCard = signal<IArchivalGalleryCard | null>(null);

  galleryCards = computed<IArchivalGalleryCard[]>(() => {
    return [
      {
        id: 'gal-001',
        milestoneTitle: 'Initial Baseline & Autonomic Vagal Resonance Intake',
        encounterType: 'Annual Healthspan Exam',
        date: '2026.01.14',
        attendingPhysician: 'Dr. Phil Gear, FACP',
        vignetteTheme: 'origami_vagal_gull',
        vignetteImgSrc: '/assets/art/origami_seagull_vagal_waves.png',
        themeLabel: '🕊️ Vagal Resonance',
        vitalsSummary: 'BP 118/76 · HR 68 bpm · SpO2 99%',
        keyDiagnoses: ['Baseline Longevity', 'Autonomic Stability'],
        prescribedProtocols: ['0.1 Hz Resonant Breathing', 'High-Polyphenol Menu'],
        fhirPassportHash: 'urn:uuid:f84a-9102-pg',
        notesExcerpt: 'Patient demonstrated excellent baroreflex vagal peak resonance at 6 bpm breathing cadence.'
      },
      {
        id: 'gal-002',
        milestoneTitle: 'Cellular Energetics & Mitochondrial Cristae Optimization',
        encounterType: 'Chrono-Nutrition Review',
        date: '2026.04.22',
        attendingPhysician: 'Dr. Elena Vance, MD',
        vignetteTheme: 'quilling_mitochondria',
        vignetteImgSrc: '/assets/art/quilling_mitochondria_vert.jpg',
        themeLabel: '✨ Mitochondrial Cristae',
        vitalsSummary: 'CGM TIR 94% · Fasting BG 84 mg/dL',
        keyDiagnoses: ['Metabolic Health', 'BMAL1 Circadian Rhythm'],
        prescribedProtocols: ['14-Hour Time-Restricted Feeding', 'Wild Salmon & Turmeric'],
        fhirPassportHash: 'urn:uuid:c92e-4410-pg',
        notesExcerpt: 'Continuous glucose monitoring confirmed zero nocturnal excursions with high metabolic flexibility.'
      },
      {
        id: 'gal-003',
        milestoneTitle: 'Section 504 School Accommodation & Environmental Order',
        encounterType: 'Pediatric Care Plan',
        date: '2026.08.17',
        attendingPhysician: 'Dr. Phil Gear, FACP',
        vignetteTheme: 'papercut_lighthouse',
        vignetteImgSrc: '/assets/art/papercut_beach_lighthouse.png',
        themeLabel: '🏖️ Coastal Lighthouse',
        vitalsSummary: 'PPD 2.1mm · SIBI Score 1.8 (Optimal)',
        keyDiagnoses: ['Section 504 Plan', 'FARE Anaphylaxis Protocol'],
        prescribedProtocols: ['Desk Hydration Pass', 'Elevator Access Protocol'],
        fhirPassportHash: 'urn:uuid:71bd-8802-pg',
        notesExcerpt: 'Formal Section 504 school authorization directive minted and certified for school district submission.'
      }
    ];
  });

  openMilestoneDetail(card: IArchivalGalleryCard) {
    this.selectedCard.set(card);
  }
}
