import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface ISocialVector {
  id: string;
  name: string;
  category: 'event' | 'community' | 'environment' | 'avoidance';
  type: 'gravitate' | 'avoid';
  coherenceMatchPercent: number; // 0 - 100
  distanceMiles: number;
  emoji: string;
  biomarkerImpact: string;
  energeticRationale: string;
  tcmAyurvedicMatch: string;
  locationName: string;
}

export interface IHobbyVector {
  id: string;
  name: string;
  emoji: string;
  timeCommitment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  clinicalBenefits: string;
  energeticSynergy: string;
  characterTrait: string;
}

@Component({
  selector: 'app-social-health-gravitation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden pocket-gull-card mb-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full status-dot bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🧭</span>
              <span>Social Health & Local Event Gravitation Matrix</span>
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#3B82F6] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
              Sentinel 🔦 Safety Guide
            </span>
            <span class="text-xs font-extrabold px-3 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 uppercase tracking-wider">
              Coherence Vector Engine
            </span>
          </div>
          <p class="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1.5 font-sans leading-relaxed">
            Personalized local community connections to <strong>gravitate towards</strong> for vagal healing, and environmental stressors to <strong>stay away from</strong>.
          </p>
        </div>

        <div class="text-right text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono shrink-0">
          <span>Active Patient: <strong class="text-orange-600 dark:text-orange-400 font-extrabold uppercase">{{ activePatientName() }}</strong></span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 font-mono">
        <div class="flex flex-wrap items-center gap-2">
          <button (click)="filterMode.set('all')"
            [class]="filterMode() === 'all'
              ? 'px-4 py-2 rounded-xl bg-orange-500 text-zinc-950 font-extrabold text-xs sm:text-sm transition cursor-pointer border border-orange-400/50 shadow-md'
              : 'px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-400 transition cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200'">
            🌐 All Vectors ({{ vectors().length }})
          </button>

          <button (click)="filterMode.set('gravitate')"
            [class]="filterMode() === 'gravitate'
              ? 'px-4 py-2 rounded-xl bg-orange-500 text-zinc-950 font-extrabold text-xs sm:text-sm transition cursor-pointer border border-orange-400/50 shadow-md'
              : 'px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-400 transition cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200'">
            🌱 Gravitate Towards ({{ gravitateCount() }})
          </button>

          <button (click)="filterMode.set('avoid')"
            [class]="filterMode() === 'avoid'
              ? 'px-4 py-2 rounded-xl bg-orange-500 text-zinc-950 font-extrabold text-xs sm:text-sm transition cursor-pointer border border-orange-400/50 shadow-md'
              : 'px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-400 transition cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200'">
            ⚠️ Stay Away From ({{ avoidCount() }})
          </button>
        </div>

        <span class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono">
          Radius: <strong class="text-zinc-900 dark:text-zinc-100 font-bold">Local (Within 10 miles)</strong>
        </span>
      </div>

      <!-- Social Gravitation Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10 font-sans mb-8">
        @for (vector of filteredVectors(); track vector.id) {
          <div (click)="selectVector(vector)"
            class="p-6 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 transition cursor-pointer flex flex-col justify-between group shadow-md font-mono sub-panel">
            
            <div>
              <!-- Top Row -->
              <div class="flex items-center justify-between gap-2 mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl group-hover:scale-110 transition-transform">{{ vector.emoji }}</span>
                  <div>
                    <h3 class="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight font-mono">{{ vector.name }}</h3>
                    <span class="text-xs text-zinc-600 dark:text-zinc-400 block font-semibold mt-0.5">📍 {{ vector.locationName }} ({{ vector.distanceMiles }} mi)</span>
                  </div>
                </div>

                @if (vector.type === 'gravitate') {
                  <span class="text-xs font-extrabold px-3 py-1 rounded-xl bg-white dark:bg-zinc-950 text-orange-600 dark:text-orange-400 border border-zinc-200 dark:border-zinc-800 uppercase shadow-sm shrink-0">
                    {{ vector.coherenceMatchPercent }}% Match
                  </span>
                } @else {
                  <span class="text-xs font-extrabold px-3 py-1 rounded-xl bg-white dark:bg-zinc-950 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-800 uppercase shadow-sm shrink-0">
                    Avoid Target
                  </span>
                }
              </div>

              <!-- Impact & Rationale -->
              <div class="space-y-3 text-xs sm:text-sm mb-4 font-sans">
                <div class="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span class="text-xs uppercase font-extrabold text-zinc-600 dark:text-zinc-400 font-mono block mb-1">Biomarker Impact:</span>
                  <p class="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    {{ vector.biomarkerImpact }}
                  </p>
                </div>

                <div class="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span class="text-xs uppercase font-extrabold text-zinc-600 dark:text-zinc-400 font-mono block mb-1">Energetic & TCM Rationale:</span>
                  <p class="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    {{ vector.energeticRationale }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span class="text-zinc-600 dark:text-zinc-400">TCM: <strong class="text-zinc-900 dark:text-zinc-200 font-bold">{{ vector.tcmAyurvedicMatch }}</strong></span>
              
              @if (vector.type === 'gravitate') {
                <button (click)="rsvpVector($event, vector)"
                  class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-extrabold uppercase transition border border-orange-400/50 shadow-md">
                  🤝 Join Circle
                </button>
              } @else {
                <span class="text-rose-600 dark:text-rose-400 font-extrabold uppercase text-xs">🛑 Steer Clear</span>
              }
            </div>

          </div>
        }
      </div>

      <!-- Pro-Health Hobbies & Human Flourishing Suite -->
      <div class="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative z-10 font-mono sub-panel">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-5 gap-3">
          <div class="flex items-center gap-3.5">
            <span class="text-2xl">🌱</span>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Pro-Health Hobbies & Character-Building Interests
              </h3>
              <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
                Recommended activities to cultivate resilience, emotional balance, and lifelong flourishing for {{ activePatientName() }}.
              </p>
            </div>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 uppercase shrink-0">
            Therapeutic Interests
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
          @for (hobby of hobbies(); track hobby.id) {
            <div class="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition shadow-sm">
              <div>
                <div class="flex items-center justify-between font-mono mb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl">{{ hobby.emoji }}</span>
                    <h4 class="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight font-mono">{{ hobby.name }}</h4>
                  </div>
                  <span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono uppercase border border-zinc-200 dark:border-zinc-800 shrink-0">{{ hobby.difficulty }}</span>
                </div>

                <div class="space-y-2 text-xs sm:text-sm">
                  <p class="text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    <strong class="text-orange-600 dark:text-orange-400 font-mono text-xs uppercase block mb-1">Trait: {{ hobby.characterTrait }}</strong>
                    {{ hobby.clinicalBenefits }}
                  </p>
                  <p class="text-zinc-600 dark:text-zinc-400 font-mono text-xs pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    Synergy: <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ hobby.energeticSynergy }}</span>
                  </p>
                </div>
              </div>

              <div class="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span class="text-zinc-600 dark:text-zinc-400">⏱ {{ hobby.timeCommitment }}</span>
                <button (click)="adoptHobby(hobby)"
                  class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-extrabold uppercase transition border border-orange-400/50 shadow-md">
                  ✨ Adopt Hobby
                </button>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class SocialHealthGravitationComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  filterMode = signal<'all' | 'gravitate' | 'avoid'>('all');

  activePatient = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return null;
    return this.patientManagement.patients().find(p => p.id === pId) || null;
  });

  activePatientName = computed(() => {
    const p = this.activePatient();
    return p ? p.name : 'Alexander Vance';
  });

  vectors = computed<ISocialVector[]>(() => {
    const p = this.activePatient();
    const condText = [
      ...(p?.preexistingConditions || []),
      p?.reasonForVisit || '',
      p?.patientGoals || '',
      p?.name || ''
    ].join(' ').toLowerCase();

    // 1. Mara Santos / MS / Neurological / Cognitive Fog / Spasticity
    if (p?.id === 'p_mara_santos' || condText.includes('sclerosis') || condText.includes('fog') || condText.includes('spasticity') || condText.includes('mara')) {
      return [
        {
          id: 'vec-ms-1',
          name: 'Cooling Hydrotherapy & Aquatic Movement Circle',
          category: 'event',
          type: 'gravitate',
          coherenceMatchPercent: 98,
          distanceMiles: 1.8,
          emoji: '🏊‍♀️',
          biomarkerImpact: 'Cooling aquatic movement prevents thermal Uhthoff worsening, lowers NfL neuro-inflammation & enhances vagal tone.',
          energeticRationale: 'Kidney Water cooling & Liver Wind smoothing.',
          tcmAyurvedicMatch: 'Pitta Cooling & Vata Grounding',
          locationName: 'Casco Bay Thermal Aquatic Center'
        },
        {
          id: 'vec-ms-2',
          name: 'Sensory Nature Walk & Forest Phytoncide Path',
          category: 'environment',
          type: 'gravitate',
          coherenceMatchPercent: 95,
          distanceMiles: 2.4,
          emoji: '🌲',
          biomarkerImpact: 'Aerosolized phytoncides boost NK immune function and stimulate BDNF for neuroplastic motor recovery.',
          energeticRationale: 'Wood element harmony & Shen spirit calming.',
          tcmAyurvedicMatch: 'Vata Pacifying',
          locationName: 'Pine Sanctuary Reserve'
        },
        {
          id: 'vec-ms-3',
          name: 'Dual-Task Cognitive Chess & Fingerpicking Guild',
          category: 'community',
          type: 'gravitate',
          coherenceMatchPercent: 92,
          distanceMiles: 1.1,
          emoji: '🧩',
          biomarkerImpact: 'Dual motor-cognitive training builds neuro-cognitive reserve and buffers word-finding difficulty.',
          energeticRationale: 'Heart & Kidney resonance.',
          tcmAyurvedicMatch: 'Mindfulness & Shen Support',
          locationName: 'Portland Cultural Guild'
        },
        {
          id: 'vec-ms-4',
          name: 'Unventilated High-Heat Sauna & Thermal Bath Complex',
          category: 'avoidance',
          type: 'avoid',
          coherenceMatchPercent: 8,
          distanceMiles: 0.7,
          emoji: '♨️',
          biomarkerImpact: 'Elevates core temp above 37.8°C, causing acute demyelinating nerve conduction block & severe fatigue.',
          energeticRationale: 'Excess Heat agitates Heart & consumes Yin.',
          tcmAyurvedicMatch: 'Severe Pitta Flare Trigger',
          locationName: 'Downtown Thermal Spa'
        },
        {
          id: 'vec-ms-5',
          name: 'High-Acoustic Traffic Corridor & Heavy Noise Construction',
          category: 'avoidance',
          type: 'avoid',
          coherenceMatchPercent: 14,
          distanceMiles: 0.9,
          emoji: '🔊',
          biomarkerImpact: 'High decibel sensory overload triggers sympathetic surge and impairs cognitive processing speed.',
          energeticRationale: 'Disturbs Shen spirit & Liver Yang.',
          tcmAyurvedicMatch: 'Vata Disruption',
          locationName: 'Harbor Commercial Way'
        }
      ];
    }

    // 2. Sarah Jenkins / Asthma / Respiratory / Back Pain
    if (p?.id === 'p002' || condText.includes('asthma') || condText.includes('breath') || condText.includes('sarah')) {
      return [
        {
          id: 'vec-ast-1',
          name: 'Halotherapy Salt Cave & Respiratory Breathwork Circle',
          category: 'event',
          type: 'gravitate',
          coherenceMatchPercent: 97,
          distanceMiles: 1.5,
          emoji: '🧂',
          biomarkerImpact: 'Micro-fine dry aerosol sodium chloride reduces airway edema, clears bronchial mucus & lowers serum IgE.',
          energeticRationale: 'Lung Metal element tonification & Qi descending.',
          tcmAyurvedicMatch: 'Kapha Dissolution & Vata Relief',
          locationName: 'Ocean Breeze Salt Sanctuary'
        },
        {
          id: 'vec-ast-2',
          name: 'Restorative Chair Yoga & Spinal Stabilization Guild',
          category: 'community',
          type: 'gravitate',
          coherenceMatchPercent: 94,
          distanceMiles: 2.1,
          emoji: '🧘‍♀️',
          biomarkerImpact: 'Strengthens lumbar erectores and pelvic tilt while expanding forced vital capacity (FVC) without exercise-induced spasm.',
          energeticRationale: 'Kidney Qi grasping Lung Air.',
          tcmAyurvedicMatch: 'Vata Grounding & Earth Stability',
          locationName: 'Harmonious Posture Studio'
        },
        {
          id: 'vec-ast-3',
          name: 'Pollen-Filtered Greenhouse & Chamomile Herbal Garden',
          category: 'community',
          type: 'gravitate',
          coherenceMatchPercent: 91,
          distanceMiles: 1.9,
          emoji: '🌼',
          biomarkerImpact: 'Filtered HEPA air environment with anti-inflammatory chamomile volatiles lowers mast cell histamine release.',
          energeticRationale: 'Spleen Earth & Lung Metal harmony.',
          tcmAyurvedicMatch: 'Spleen Qi Support',
          locationName: 'Botanic Herbarium'
        },
        {
          id: 'vec-ast-4',
          name: 'High-Diesel Industrial Expressway & PM2.5 Corridor',
          category: 'avoidance',
          type: 'avoid',
          coherenceMatchPercent: 6,
          distanceMiles: 0.8,
          emoji: '🚛',
          biomarkerImpact: 'Diesel exhaust particles and particulate PM2.5 cause acute bronchial smooth muscle spasm and leukotriene elevation.',
          energeticRationale: 'Toxic Heat oppresses Lung Qi.',
          tcmAyurvedicMatch: 'Severe Lung Metal Damage',
          locationName: 'Freight Terminal Expressway'
        },
        {
          id: 'vec-ast-5',
          name: 'Damp Moldy Underground Storage Vault',
          category: 'avoidance',
          type: 'avoid',
          coherenceMatchPercent: 11,
          distanceMiles: 0.5,
          emoji: '🏚️',
          biomarkerImpact: 'Aspergillus mold spores trigger pulmonary mucosal inflammation and acute bronchospasm.',
          energeticRationale: 'Damp-Dampness obstructs Middle Jiao.',
          tcmAyurvedicMatch: 'Severe Kapha Damp Aggravation',
          locationName: 'Old Port Basement Vaults'
        }
      ];
    }

    // 3. Robert Davis / Metabolic Syndrome / Hypertension / Cardiac
    if (p?.id === 'p001' || condText.includes('metabolic') || condText.includes('hypertension') || condText.includes('robert')) {
      return [
        {
          id: 'vec-met-1',
          name: 'Community Organic Permaculture & Soil Microbe Garden',
          category: 'community',
          type: 'gravitate',
          coherenceMatchPercent: 96,
          distanceMiles: 1.4,
          emoji: '🥬',
          biomarkerImpact: 'Tactile soil microbes (Mycobacterium vaccae) boost serotonin, improve insulin sensitivity & lower IL-6.',
          energeticRationale: 'Spleen Earth element tonification & Liver Qi dispersion.',
          tcmAyurvedicMatch: 'Earth / Kapha Balance',
          locationName: 'Androscoggin Community Garden'
        },
        {
          id: 'vec-met-2',
          name: 'Sunset Forest Bathing & Vagal Breathing Circle',
          category: 'event',
          type: 'gravitate',
          coherenceMatchPercent: 94,
          distanceMiles: 3.2,
          emoji: '🌲',
          biomarkerImpact: 'Aerosolized phytoncides increase Natural Killer (NK) immune cell count & reduce systolic blood pressure by 8 mmHg.',
          energeticRationale: 'Wood & Lung Metal element harmony.',
          tcmAyurvedicMatch: 'Vata Calming',
          locationName: 'Pine Tree Sanctuary'
        },
        {
          id: 'vec-met-3',
          name: 'Low-Glycemic Fermentation & Probiotic Culinary Guild',
          category: 'community',
          type: 'gravitate',
          coherenceMatchPercent: 93,
          distanceMiles: 2.5,
          emoji: '🧄',
          biomarkerImpact: 'Probiotic food prep improves gut microbiome diversity and short-chain fatty acids (SCFAs) for glycemic control.',
          energeticRationale: 'Spleen & Stomach Agni Kindling.',
          tcmAyurvedicMatch: 'Pitta & Kapha Harmonization',
          locationName: 'Culinary Wellness Hub'
        },
        {
          id: 'vec-met-4',
          name: 'Heavy Industrial Noise Construction & High-EMF Site',
          category: 'avoidance',
          type: 'avoid',
          coherenceMatchPercent: 12,
          distanceMiles: 0.8,
          emoji: '🏗️',
          biomarkerImpact: 'Elevates sympathetic vasoconstriction, spikes epinephrine, and disrupts 0.1 Hz baroreflex.',
          energeticRationale: 'Agitates Heart Shen & disturbs Liver Yang.',
          tcmAyurvedicMatch: 'Severe Pitta/Vata Aggravation',
          locationName: 'Downtown High-Rise Site'
        },
        {
          id: 'vec-met-5',
          name: 'Late-Night High-Sodium Sports Bar & Ultra-Processed Buffet',
          category: 'avoidance',
          type: 'avoid',
          coherenceMatchPercent: 10,
          distanceMiles: 1.3,
          emoji: '🍟',
          biomarkerImpact: 'Excess dietary sodium & circadian disruption cause nocturnal hypertension and spike post-prandial triglycerides.',
          energeticRationale: 'Generates Phlegm-Dampness & overburdens Stomach.',
          tcmAyurvedicMatch: 'Severe Kapha/Pitta Indigestion',
          locationName: 'Commercial Strip Lounge'
        }
      ];
    }

    // Default / Generic Patient Vectors
    return [
      {
        id: 'vec-def-1',
        name: 'Community Organic Permaculture Garden',
        category: 'community',
        type: 'gravitate',
        coherenceMatchPercent: 95,
        distanceMiles: 1.4,
        emoji: '🥬',
        biomarkerImpact: 'Grounding tactile soil microbes (Mycobacterium vaccae) boost serotonin & lower systemic IL-6.',
        energeticRationale: 'Spleen Earth element tonification & Liver Qi dispersion.',
        tcmAyurvedicMatch: 'Earth / Kapha Balance',
        locationName: 'Androscoggin Community Garden'
      },
      {
        id: 'vec-def-2',
        name: 'Sunset Forest Bathing & Vagal Breathing Circle',
        category: 'event',
        type: 'gravitate',
        coherenceMatchPercent: 93,
        distanceMiles: 3.2,
        emoji: '🌲',
        biomarkerImpact: 'Aerosolized phytoncides increase Natural Killer (NK) immune cell count & lower blood pressure.',
        energeticRationale: 'Wood & Lung Metal element harmony.',
        tcmAyurvedicMatch: 'Vata Calming',
        locationName: 'Pine Tree Sanctuary'
      },
      {
        id: 'vec-def-3',
        name: 'Heavy Industrial Noise Construction Site',
        category: 'avoidance',
        type: 'avoid',
        coherenceMatchPercent: 12,
        distanceMiles: 0.8,
        emoji: '🏗️',
        biomarkerImpact: 'Elevates sympathetic vasoconstriction, spikes epinephrine, and disrupts 0.1 Hz baroreflex.',
        energeticRationale: 'Agitates Heart Shen & disturbs Liver Yang.',
        tcmAyurvedicMatch: 'Severe Pitta/Vata Aggravation',
        locationName: 'Downtown High-Rise Site'
      }
    ];
  });

  hobbies = computed<IHobbyVector[]>(() => {
    const p = this.activePatient();
    const condText = [
      ...(p?.preexistingConditions || []),
      p?.reasonForVisit || '',
      p?.patientGoals || '',
      p?.name || ''
    ].join(' ').toLowerCase();

    if (p?.id === 'p_mara_santos' || condText.includes('sclerosis') || condText.includes('fog') || condText.includes('spasticity') || condText.includes('mara')) {
      return [
        {
          id: 'hob-ms-1',
          name: 'Cooling Hydro-Pilates & Aquatic Balance',
          emoji: '🏊‍♀️',
          timeCommitment: '2 hrs/week',
          difficulty: 'Beginner',
          characterTrait: 'Resilient Somatic Balance',
          clinicalBenefits: 'Buoyancy reduces joint shear, cooling water prevents fatigue spikes, and enhances motor coordination.',
          energeticSynergy: 'Nourishes Kidney Water & soothes Liver Wind.'
        },
        {
          id: 'hob-ms-2',
          name: 'Bonsai Cultivation & Pruning',
          emoji: '🪴',
          timeCommitment: '2 hrs/week',
          difficulty: 'Beginner',
          characterTrait: 'Patience & Long-term Mindfulness',
          clinicalBenefits: 'Reduces salivary cortisol arousal by 22%, enhances fine motor coordination, and calms prefrontal chatter.',
          energeticSynergy: 'Balances Wood element; grounds erratic Vata energy.'
        },
        {
          id: 'hob-ms-3',
          name: 'Ceramic Pottery & Clay Sculpting',
          emoji: '🏺',
          timeCommitment: '3 hrs/week',
          difficulty: 'Intermediate',
          characterTrait: 'Tactile Grounding & Motor Control',
          clinicalBenefits: 'Provides tactile sensory stimulation, activates bilateral brain hemispheres, and reduces amygdala fear reactivity.',
          energeticSynergy: 'Tonifies Earth element and Spleen Qi; anchors floating Shen spirit.'
        },
        {
          id: 'hob-ms-4',
          name: 'Acoustic Guitar Fingerpicking',
          emoji: '🎸',
          timeCommitment: '3 hrs/week',
          difficulty: 'Intermediate',
          characterTrait: 'Auditory-Motor Integration',
          clinicalBenefits: 'Bimanual finger work rebuilds white matter connectivity and enhances motor coordination.',
          energeticSynergy: 'Harmonizes Heart Fire and Kidney Water.'
        },
        {
          id: 'hob-ms-5',
          name: 'Gentle Qigong & Postural Shift',
          emoji: '☯️',
          timeCommitment: '20 mins daily',
          difficulty: 'Beginner',
          characterTrait: 'Mindful Somatic Equilibrium',
          clinicalBenefits: 'Enhances vestibular reflex balance and lowers postural sway by 34% without thermal stress.',
          energeticSynergy: 'Circulates meridian Qi and tames Liver Wind.'
        },
        {
          id: 'hob-ms-6',
          name: 'Binaural Morning Journaling',
          emoji: '✍️',
          timeCommitment: '15 mins daily',
          difficulty: 'Beginner',
          characterTrait: 'Prefrontal Clarity',
          clinicalBenefits: 'Bright morning light and 10 Hz alpha entrainment clear cognitive fog and sharpen focus.',
          energeticSynergy: 'Grounds Vata thoughts and clears Shen spirit.'
        }
      ];
    }

    if (p?.id === 'p002' || condText.includes('asthma') || condText.includes('breath') || condText.includes('spine') || condText.includes('sarah')) {
      return [
        {
          id: 'hob-ast-1',
          name: 'Diaphragmatic Flute & Acoustic Sight-Reading',
          emoji: '🪈',
          timeCommitment: '3 hrs/week',
          difficulty: 'Intermediate',
          characterTrait: 'Breath Mastery & Auditory Focus',
          clinicalBenefits: 'Strengthens diaphragm & intercostal muscles, increases FEV1 forced expiratory volume & lowers respiratory rate.',
          energeticSynergy: 'Tonifies Lung Metal Qi and calms anxiety.'
        },
        {
          id: 'hob-ast-2',
          name: 'Organic Herb Cultivation & Drying',
          emoji: '🌿',
          timeCommitment: '2 hrs/week',
          difficulty: 'Beginner',
          characterTrait: 'Nurturing & Environmental Care',
          clinicalBenefits: 'Low-allergen indoor herbal cultivation provides natural aromatherapy and promotes steady nasal breathing.',
          energeticSynergy: 'Harmonizes Spleen Earth & Lung Metal.'
        },
        {
          id: 'hob-ast-3',
          name: 'Spinal Posture Restorative Calligraphy',
          emoji: '🖌️',
          timeCommitment: '2 hrs/week',
          difficulty: 'Beginner',
          characterTrait: 'Deliberate Stillness & Poise',
          clinicalBenefits: 'Improves thoracic spine posture, reduces lower back muscle strain, and promotes parasympathetic dominance.',
          energeticSynergy: 'Anchors Kidney Water and tonifies Spleen.'
        },
        {
          id: 'hob-ast-4',
          name: 'Halotherapy Breathing Pacing',
          emoji: '🧂',
          timeCommitment: '30 mins (2x/wk)',
          difficulty: 'Beginner',
          characterTrait: 'Mucosal Immunity Mastery',
          clinicalBenefits: 'Micro-fine dry aerosol salt thins airway mucus and lowers serum IgE reactivity.',
          energeticSynergy: 'Tonifies Lung Metal & dissolves Kapha.'
        },
        {
          id: 'hob-ast-5',
          name: 'Barefoot Dew Grounding',
          emoji: '🌅',
          timeCommitment: '15 mins daily',
          difficulty: 'Beginner',
          characterTrait: 'Circadian Alignment',
          clinicalBenefits: 'Transfers earth electrons to reduce whole-body inflammatory oxidative stress.',
          energeticSynergy: 'Draws excess heat from head down into Yongquan (KD-1).'
        },
        {
          id: 'hob-ast-6',
          name: 'Resonant Vagal Humming',
          emoji: '🎙️',
          timeCommitment: '10 mins daily',
          difficulty: 'Beginner',
          characterTrait: 'Autonomic Self-Regulation',
          clinicalBenefits: 'Sinus oscillation boosts nasal nitric oxide 15-fold and stimulates vagus nerve tone.',
          energeticSynergy: 'Calms Prana Vata and tranquilizes the mind.'
        }
      ];
    }

    return [
      {
        id: 'hob-1',
        name: 'Bonsai Cultivation & Horticulture',
        emoji: '🪴',
        timeCommitment: '2 hrs/week',
        difficulty: 'Beginner',
        characterTrait: 'Patience & Long-term Mindfulness',
        clinicalBenefits: 'Reduces salivary cortisol arousal by 22%, enhances fine motor coordination, and calms prefrontal chatter.',
        energeticSynergy: 'Balances Wood element; grounds erratic Vata energy and clears Liver Qi stagnation.'
      },
      {
        id: 'hob-2',
        name: 'Ceramic Pottery & Clay Sculpting',
        emoji: '🏺',
        timeCommitment: '3 hrs/week',
        difficulty: 'Intermediate',
        characterTrait: 'Somatic Emotional Grounding',
        clinicalBenefits: 'Provides tactile sensory stimulation, activates bilateral brain hemispheres, and reduces amygdala fear reactivity.',
        energeticSynergy: 'Tonifies Earth element and Spleen Qi; anchors floating Shen spirit.'
      },
      {
        id: 'hob-3',
        name: 'Classical Acoustic Guitar & Sight-Reading',
        emoji: '🎸',
        timeCommitment: '4 hrs/week',
        difficulty: 'Intermediate',
        characterTrait: 'Focus & Polyphonic Harmony',
        clinicalBenefits: 'Enhances neuroplasticity, boosts HRV coherence during fingerpicking, and stimulates auditory cortex.',
        energeticSynergy: 'Harmonizes Heart Fire and Kidney Water; elevates spirit.'
      },
      {
        id: 'hob-4',
        name: 'Nordic Pole Walking',
        emoji: '🦯',
        timeCommitment: '30 mins (3x/wk)',
        difficulty: 'Intermediate',
        characterTrait: 'Cardiovascular Endurance',
        clinicalBenefits: 'Engages 90% of skeletal muscles, reduces knee impact by 26%, and lowers resting BP.',
        energeticSynergy: 'Balances upper and lower body Qi flow.'
      },
      {
        id: 'hob-5',
        name: 'Sourdough Probiotic Fermentation',
        emoji: '🥖',
        timeCommitment: '2 hrs/week',
        difficulty: 'Beginner',
        characterTrait: 'Nourishing Alchemical Patience',
        clinicalBenefits: 'Lactic acid bacteria produce short-chain fatty acids for gut barrier & glycemic control.',
        energeticSynergy: 'Kindles Spleen-Stomach Agni digestive fire.'
      },
      {
        id: 'hob-6',
        name: 'Zen Archery & Postural Focus',
        emoji: '🏹',
        timeCommitment: '45 mins (2x/wk)',
        difficulty: 'Intermediate',
        characterTrait: 'Mono-directional Willpower',
        clinicalBenefits: 'Strengthens scapular retractors, counters forward-head posture, and trains focus.',
        energeticSynergy: 'Aligns Heart Fire with Eye Qi.'
      }
    ];
  });

  filteredVectors = computed(() => {
    const mode = this.filterMode();
    if (mode === 'gravitate') return this.vectors().filter(v => v.type === 'gravitate');
    if (mode === 'avoid') return this.vectors().filter(v => v.type === 'avoid');
    return this.vectors();
  });

  gravitateCount = computed(() => this.vectors().filter(v => v.type === 'gravitate').length);
  avoidCount = computed(() => this.vectors().filter(v => v.type === 'avoid').length);

  selectVector(vector: ISocialVector) {
    console.log('Selected vector:', vector);
  }

  rsvpVector(event: Event, vector: ISocialVector) {
    event.stopPropagation();
    alert(`🤝 Reserved spot for ${vector.name}! Added to local health schedule.`);
  }

  adoptHobby(hobby: IHobbyVector) {
    this.patientState.addClinicalNote({
      id: `hobby-${Date.now()}`,
      text: `🌱 Adopted Therapeutic Hobby: ${hobby.name} (${hobby.characterTrait}). ${hobby.clinicalBenefits}`,
      sourceLens: 'Social & Lifestyle',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`✨ Adopted Hobby: ${hobby.name}! Added to patient care plan strategy.`);
  }
}
