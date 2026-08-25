import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { PlainLanguageGlossaryService } from '../services/plain-language-glossary.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { RevealDirective } from '../directives/reveal.directive';

export interface IHealthyHobbyOption {
  id: string;
  title: string;
  icon: string;
  category: string;
  intensity: 'Gentle' | 'Moderate' | 'Vigorous';
  plainLanguageSummary: string;
  westernMedicalBenefit: string;
  traditionalHolisticBenefit: string;
  recommendedCadence: string;
  primaryHealthyDecision: string;
}

@Component({
  selector: 'app-healthy-hobbies-lifestyle',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden pocket-gull-card mb-8">
      
      <!-- Component Header (Braun Industrial Instrument Style) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-zinc-200 dark:border-zinc-800 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-2xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_rgba(28,28,28,0.9)] font-bold shrink-0">
            ⚡
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">Therapeutic Lifestyle Decisions</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#F6B12B] text-zinc-950 font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                Swoop ⚡ Active Guide
              </span>
              <pocket-gull-badge label="Dynamic Patient Prescriptions" severity="success"></pocket-gull-badge>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-1 uppercase">
              Active Lifestyle & Healthy Decision Suite
            </h3>
            <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-1">
              Personalized for <strong class="text-orange-600 dark:text-orange-400 font-extrabold uppercase">{{ activePatientName() }}</strong>
            </p>
          </div>
        </div>

        <!-- Cognitive Ergonomics Dual-Depth Toggle Switch -->
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-[#1C1C1C] dark:border-zinc-800 flex items-center gap-1.5 font-mono text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)]">
            <button (click)="isPlainLanguage.set(true)"
                    [class]="isPlainLanguage() ? 'bg-orange-500 text-zinc-950 font-extrabold shadow-md border border-[#1C1C1C]' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
                    class="px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <span>🌱</span> Plain Language
            </button>
            <button (click)="isPlainLanguage.set(false)"
                    [class]="!isPlainLanguage() ? 'bg-orange-500 text-zinc-950 font-extrabold shadow-md border border-[#1C1C1C]' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
                    class="px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <span>🔬</span> Deep Clinical Rationale
            </button>
          </div>
        </div>
      </div>

      <p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-sans mb-6 leading-relaxed">
        Prescribing therapeutic active hobbies to build Zone 2 aerobic capacity, protect vulnerable anatomical joints without axial compression, and optimize autonomic nervous system stress resilience for {{ activePatientName() }}.
      </p>

      <!-- Healthy Hobby Selection Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        @for (hobby of hobbyOptions(); track hobby.id) {
          <div appReveal [revealDelay]="100"
               class="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border transition-all cursor-pointer flex flex-col justify-between sub-panel shadow-md"
               [class.border-orange-500]="selectedHobbyId() === hobby.id"
               [class.dark:border-orange-500]="selectedHobbyId() === hobby.id"
               [class.border-zinc-200]="selectedHobbyId() !== hobby.id"
               [class.dark:border-zinc-800]="selectedHobbyId() !== hobby.id"
               (click)="selectedHobbyId.set(hobby.id)">
            
            <div>
              <!-- Hobby Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">{{ hobby.icon }}</span>
                  <div>
                    <h4 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">{{ hobby.title }}</h4>
                    <span class="text-xs text-zinc-600 dark:text-zinc-400 font-mono font-semibold block mt-0.5">{{ hobby.category }}</span>
                  </div>
                </div>

                <span class="px-3 py-1 rounded-xl text-xs font-extrabold uppercase font-mono border shadow-sm shrink-0"
                      [class.bg-emerald-500/10]="hobby.intensity === 'Gentle'"
                      [class.text-emerald-700]="hobby.intensity === 'Gentle'"
                      [class.dark:text-emerald-400]="hobby.intensity === 'Gentle'"
                      [class.border-emerald-500/30]="hobby.intensity === 'Gentle'"
                      [class.bg-orange-500/10]="hobby.intensity === 'Moderate'"
                      [class.text-orange-700]="hobby.intensity === 'Moderate'"
                      [class.dark:text-orange-400]="hobby.intensity === 'Moderate'"
                      [class.border-orange-500/30]="hobby.intensity === 'Moderate'"
                      [class.bg-purple-500/10]="hobby.intensity === 'Vigorous'"
                      [class.text-purple-700]="hobby.intensity === 'Vigorous'"
                      [class.dark:text-purple-400]="hobby.intensity === 'Vigorous'"
                      [class.border-purple-500/30]="hobby.intensity === 'Vigorous'">
                  {{ hobby.intensity }} Intensity
                </span>
              </div>

              <!-- Primary Healthy Decision -->
              <div class="p-4 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 mb-4 text-xs sm:text-sm shadow-inner">
                <strong class="text-orange-600 dark:text-orange-400 text-xs sm:text-sm uppercase font-mono font-extrabold block mb-1.5">🎯 Core Healthy Decision:</strong>
                <p class="text-zinc-800 dark:text-zinc-200 font-sans text-sm sm:text-base leading-relaxed">{{ hobby.primaryHealthyDecision }}</p>
              </div>

              <!-- Cognitive Ergonomics Dual-Depth View: Plain Language vs Deep Rationale -->
              @if (isPlainLanguage()) {
                <div class="p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-sm font-sans text-emerald-950 dark:text-emerald-200 leading-relaxed mb-4">
                  <div class="flex items-center justify-between mb-2 font-mono text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                    <span class="flex items-center gap-1.5">
                      <span>🌱</span> Plain-Language Summary
                    </span>
                    <div class="flex items-center gap-3">
                      <button (click)="readAloud(hobby.plainLanguageSummary, $event)" class="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 transition cursor-pointer flex items-center gap-1 font-extrabold">
                        <span>🔊</span> Read Aloud
                      </button>
                      <button (click)="copyPatientExplanation(hobby, $event)" class="text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer flex items-center gap-1 font-extrabold">
                        <span>📋</span> Copy
                      </button>
                    </div>
                  </div>
                  <p class="text-sm sm:text-base leading-relaxed text-zinc-900 dark:text-zinc-100 font-sans">{{ hobby.plainLanguageSummary }}</p>
                </div>
              } @else {
                <div class="space-y-3 text-xs sm:text-sm font-sans mb-4">
                  <div class="p-3 rounded-xl bg-sky-50/90 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-500/30">
                    <strong class="text-sky-700 dark:text-sky-400 font-mono text-xs uppercase font-extrabold block mb-1">🔬 Medical & Biomechanical Benefit:</strong>
                    <span class="text-zinc-900 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">{{ hobby.westernMedicalBenefit }}</span>
                  </div>

                  <div class="p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30">
                    <strong class="text-emerald-700 dark:text-emerald-400 font-mono text-xs uppercase font-extrabold block mb-1">☯️ Holistic & Energetic Harmony:</strong>
                    <span class="text-zinc-900 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">{{ hobby.traditionalHolisticBenefit }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Footer & Log Action -->
            <div class="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 font-mono">
              <span class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Target Cadence: <strong class="text-zinc-900 dark:text-zinc-100 font-extrabold">{{ hobby.recommendedCadence }}</strong></span>
              
              <button (click)="prescribeHobby(hobby, $event)"
                      class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition cursor-pointer border border-orange-400/50 shadow-md">
                📌 Prescribe Decision
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Action Toast Banner -->
      @if (toastMessage(); as toast) {
        <div class="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm font-mono font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span class="text-base">✅</span>
          <span>{{ toast }}</span>
        </div>
      }

    </div>
  `
})
export class HealthyHobbiesLifestyleComponent {
  state = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  plainLanguageService = inject(PlainLanguageGlossaryService);

  isPlainLanguage = signal<boolean>(true);
  selectedHobbyId = signal<string>('outdoor_cycling');
  toastMessage = signal<string | null>(null);

  activePatient = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return null;
    return this.patientManagement.patients().find(p => p.id === pId) || null;
  });

  activePatientName = computed(() => {
    const p = this.activePatient();
    return p ? p.name : 'Alexander Vance';
  });

  hobbyOptions = computed<IHealthyHobbyOption[]>(() => {
    const p = this.activePatient();
    const condText = [
      ...(p?.preexistingConditions || []),
      p?.reasonForVisit || '',
      p?.patientGoals || '',
      p?.name || ''
    ].join(' ').toLowerCase();

    // 1. Mara Santos / MS / Neurological / Fatigue
    if (p?.id === 'p_mara_santos' || condText.includes('sclerosis') || condText.includes('fog') || condText.includes('spasticity') || condText.includes('mara')) {
      return [
        {
          id: 'hydro_pilates',
          title: 'Cooling Hydro-Movement & Aquatic Pilates',
          icon: '🏊‍♀️',
          category: 'Temperature Control & Neuro-Rehab',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Select 28°C cooling aquatic movements over high-heat gym workouts to avoid triggering thermal Uhthoff nerve conduction blocks.',
          plainLanguageSummary: 'Cool-water swimming and aquatic pilates support your joints and balance safely while keeping your body temperature low so you do not feel sudden muscle weakness or brain fog.',
          westernMedicalBenefit: 'Water buoyancy reduces joint impact by 80%, while 28°C aquatic temperature suppresses Uhthoff-induced demyelinating fatigue spikes.',
          traditionalHolisticBenefit: 'Nourishes Kidney Yin-Water, clears excess Liver Heat, and stabilizes floating Shen spirit.',
          recommendedCadence: '30 mins @ 28°C water (3x / week)'
        },
        {
          id: 'bonsai_pruning',
          title: 'Therapeutic Botanical Bonsai Pruning',
          icon: '🪴',
          category: 'Fine Motor & Cognitive Reserve',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Engage in fine-precision horticulture to stimulate bilateral motor cortex hands and reduce salivary cortisol.',
          plainLanguageSummary: 'Caring for small trees exercises your hands and fingers, improves fine motor focus, and calms prefrontal chatter without physical strain.',
          westernMedicalBenefit: 'Fine motor pruning exercises activate motor strip neuroplasticity and reduce salivary amylase and cortisol arousal by 22%.',
          traditionalHolisticBenefit: 'Harmonizes Wood element, grounds erratic Vata energy, and promotes patient mindfulness.',
          recommendedCadence: '20-30 mins (4x / week)'
        },
        {
          id: 'phytoncide_hiking',
          title: 'Shaded Forest Phytoncide Trail Walking',
          icon: '🌲',
          category: 'Autonomic Coherence & BDNF',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Incorporate morning shaded forest walks to inhale botanical phytoncides that stimulate BDNF for motor recovery.',
          plainLanguageSummary: 'Walking along cool forest trails lowers stress hormones, helps you sleep deeper, and releases natural tree chemicals that protect brain health.',
          westernMedicalBenefit: 'Arboreal phytoncides elevate Natural Killer (NK) cell activity while mild aerobic movement boosts Brain-Derived Neurotrophic Factor (BDNF).',
          traditionalHolisticBenefit: 'Anchors Spleen Earth, soothes Liver Qi, and restores vital energy.',
          recommendedCadence: '20 mins morning shaded walk'
        },
        {
          id: 'recumbent_ergometer',
          title: 'Low-Speed Recumbent Ergometry',
          icon: '🚴‍♀️',
          category: 'Cardiovascular & Fall Prevention',
          intensity: 'Moderate',
          primaryHealthyDecision: 'Choose seated recumbent pedaling over upright treadmill walking to build Zone 2 aerobic density with zero fall risk.',
          plainLanguageSummary: 'Recumbent cycling gives your heart a healthy workout while seated comfortably, protecting your balance and preventing falls.',
          westernMedicalBenefit: 'Seated closed-chain cycling increases mitochondrial fat oxidation while eliminating posture instability or fall anxiety.',
          traditionalHolisticBenefit: 'Tonifies Heart Blood, supports Kidney Qi, and maintains smooth metabolic flow.',
          recommendedCadence: '25 mins (3x / week)'
        },
        {
          id: 'clay_sculpting',
          title: 'Somatic Clay Sculpting & Pottery',
          icon: '🏺',
          category: 'Proprioception & Sensory Grounding',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Practice tactile clay sculpting to maintain upper limb proprioception and calm amygdala hyper-arousal.',
          plainLanguageSummary: 'Working with cool natural clay provides rich sensory feedback to your hands, improving finger control and easing nervous anxiety.',
          westernMedicalBenefit: 'Bilateral tactile friction activates mechanoreceptors, blunting sympathetic fear pathways and enhancing manual grip sensation.',
          traditionalHolisticBenefit: 'Tonifies Spleen Earth element, absorbs dampness, and anchors erratic Shen spirit.',
          recommendedCadence: '45 mins (2x / week)'
        },
        {
          id: 'classical_guitar',
          title: 'Polyphonic Fingerpicking & Acoustic Guitar',
          icon: '🎸',
          category: 'Neuroplasticity & Fine Motor Skill',
          intensity: 'Moderate',
          primaryHealthyDecision: 'Practice acoustic fingerpicking to stimulate cortical motor map reorganization and build auditory-motor synchrony.',
          plainLanguageSummary: 'Playing soft acoustic guitar tunes exercises both hands simultaneously, firing up brain connections for movement and memory.',
          westernMedicalBenefit: 'Bimanual coordination increases corpus callosum white matter integrity and stimulates auditory-motor neuroplasticity.',
          traditionalHolisticBenefit: 'Harmonizes Heart Fire and Kidney Water, elevating mood and easing emotional tension.',
          recommendedCadence: '30 mins (4x / week)'
        },
        {
          id: 'tai_chi_qigong',
          title: 'Gentle Water-Style Tai Chi & Qigong',
          icon: '☯️',
          category: 'Postural Balance & Micro-Circulation',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Perform slow-motion Qigong weight shifts to strengthen joint stabilizer muscles without heat accumulation.',
          plainLanguageSummary: 'Slow, flowing Tai Chi movements build steady balance and leg strength gently while keeping your mind calm and quiet.',
          westernMedicalBenefit: 'Slow closed-loop weight transfers enhance vestibular reflex balance and reduce postural sway by 34%.',
          traditionalHolisticBenefit: 'Circulates Qi through all twelve meridians, tames Liver Wind, and tonifies Kidney Essence.',
          recommendedCadence: '20 mins daily'
        },
        {
          id: 'binaural_journaling',
          title: 'Circadian Light & Binaural Sound Journaling',
          icon: '✍️',
          category: 'Prefrontal Focus & Sleep Hygiene',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Maintain a daily reflection journal under 10,000-lux morning light while listening to 10 Hz alpha binaural beats.',
          plainLanguageSummary: 'Writing down morning thoughts under bright morning light helps set your internal body clock, sharpens focus, and clears cognitive fog.',
          westernMedicalBenefit: 'Morning photic stimulation resets suprachiasmatic nucleus melatonin timing, while 10 Hz auditory entrainment boosts EEG alpha coherence.',
          traditionalHolisticBenefit: 'Clears Heart-Shen cloudiness and grounds chaotic Vata thought patterns.',
          recommendedCadence: '15 mins morning'
        }
      ];
    }

    // 2. Sarah Jenkins / Asthma / Respiratory / Lumbar Spine
    if (p?.id === 'p002' || condText.includes('asthma') || condText.includes('breath') || condText.includes('spine') || condText.includes('sarah')) {
      return [
        {
          id: 'halotherapy_breathwork',
          title: 'Halotherapy Salt Sanctuary & Respiratory Pacing',
          icon: '🧂',
          category: 'Airway Clearance & IgE Reduction',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Practice guided diaphragmatic breathwork inside micro-fine sodium aerosol salt rooms to reduce bronchial mucosal edema.',
          plainLanguageSummary: 'Sitting in a clean salt room and practicing slow breathing opens up your lungs, thins out sticky mucus, and calms allergic asthma flares.',
          westernMedicalBenefit: 'Aerosolized micro-particles of NaCl thin pulmonary mucus secretions, lower serum IgE, and reduce bronchial smooth muscle reactivity.',
          traditionalHolisticBenefit: 'Tonifies Lung Metal Qi, descends rebellious airway Qi, and dissolves accumulated Kapha phlegm.',
          recommendedCadence: '30 mins (2x / week)'
        },
        {
          id: 'restorative_chair_yoga',
          title: 'Restorative Chair Yoga & Pelvic Tilt',
          icon: '🧘‍♀️',
          category: 'Spinal Alignment & Core Stability',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Perform seated restorative yoga postures to stretch tight lumbar erector muscles without axial compression or asthma triggers.',
          plainLanguageSummary: 'Easy seated yoga poses gently stretch your lower back, improve posture, and expand your lung capacity without straining your body.',
          westernMedicalBenefit: 'Decompresses L4-L5 lumbar discs while increasing Forced Vital Capacity (FVC) through diaphragmatic expansion.',
          traditionalHolisticBenefit: 'Strengthens Kidney Qi, reinforces Earth stability, and grounds floating Vata anxiety.',
          recommendedCadence: '25 mins daily'
        },
        {
          id: 'indoor_herbal_gardening',
          title: 'Filtered Indoor Chamomile & Herb Cultivation',
          icon: '🌿',
          category: 'Low-Allergen Botanical Aromatherapy',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Cultivate HEPA-filtered indoor chamomile and mint to benefit from natural terpene aromatherapy without outdoor pollen exposure.',
          plainLanguageSummary: 'Growing indoor herbs gives you gentle movement and natural soothing scents without exposing you to outdoor pollen or air pollution.',
          westernMedicalBenefit: 'Inhaling chamomile and mint volatiles reduces mast cell histamine release and promotes slow nasal breathing.',
          traditionalHolisticBenefit: 'Harmonizes Spleen Earth and Lung Metal while easing chest tightness.',
          recommendedCadence: '20 mins daily'
        },
        {
          id: 'warm_water_aquatics',
          title: 'Warm-Water Aquatics & Floating Decompression',
          icon: '🏊‍♂️',
          category: '0-G Spinal Unloading',
          intensity: 'Moderate',
          primaryHealthyDecision: 'Engage in buoyant warm-water walking to relieve 90% of spine weight bearing while expanding ribcage compliance.',
          plainLanguageSummary: 'Floating and gentle pool movements relieve lower back pressure, soothe tight back muscles, and make deep breathing easy.',
          westernMedicalBenefit: 'Hydrostatic pressure unloads intervertebral discs by 90% and improves venous cardiac return.',
          traditionalHolisticBenefit: 'Cools excess Pitta inflammatory heat and relaxes tight Vata tendons.',
          recommendedCadence: '30 mins (2-3x / week)'
        },
        {
          id: 'diaphragmatic_flute',
          title: 'Diaphragmatic Flute & Acoustic Wind Reading',
          icon: '🪈',
          category: 'Respiratory Muscle & FEV1 Support',
          intensity: 'Moderate',
          primaryHealthyDecision: 'Play acoustic woodwind or flute instruments to train prolonged expiratory control and strengthen intercostal muscles.',
          plainLanguageSummary: 'Playing a flute or wind instrument acts like a fun breathing gym, strengthening your breathing muscles and boosting lung stamina.',
          westernMedicalBenefit: 'Resisted blowing increases forced expiratory volume (FEV1), enhances diaphragm strength, and prevents airway collapse.',
          traditionalHolisticBenefit: 'Tonifies Lung Qi, opens the throat chakra, and releases trapped emotional grief.',
          recommendedCadence: '20-30 mins (3x / week)'
        },
        {
          id: 'restorative_calligraphy',
          title: 'Spinal Posture Restorative Calligraphy',
          icon: '🖌️',
          category: 'Postural Poise & Stillness',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Practice brush calligraphy on an inclined desk to maintain erect thoracic spine posture and slow respiration.',
          plainLanguageSummary: 'Practicing brush writing on an angled desk encourages naturally straight posture, unhumping upper back tightness.',
          westernMedicalBenefit: 'Inclined posture eliminates neck flexion strain, reduces trapezius spasm, and lowers respiratory rate to 6 BPM.',
          traditionalHolisticBenefit: 'Anchors Kidney Water, tonifies Spleen Qi, and cultivates calm focus.',
          recommendedCadence: '25 mins (3x / week)'
        },
        {
          id: 'morning_sunlight_grounding',
          title: 'Barefoot Morning Sunlight & Dew Grounding',
          icon: '🌅',
          category: 'Circadian Alignment & Earthing',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Step barefoot onto damp grass for 15 minutes after sunrise to reset circadian melatonin and absorb free electrons.',
          plainLanguageSummary: 'Standing barefoot on green morning grass in early sunlight wakes up your circadian rhythm and reduces whole-body inflammation.',
          westernMedicalBenefit: 'Direct skin contact with earth transfers free electrons to neutralize reactive oxygen species (ROS) and align cortisol rhythm.',
          traditionalHolisticBenefit: 'Pulls excess heat from the head down into Yongquan (KD-1), soothing Vata and grounding Shen.',
          recommendedCadence: '15 mins post-sunrise'
        },
        {
          id: 'somatic_vagal_humming',
          title: 'Polyvagal Chanting & Resonant Humming',
          icon: '🎙️',
          category: 'Vagus Nerve & Nitric Oxide Boost',
          intensity: 'Gentle',
          primaryHealthyDecision: 'Practice 10 minutes of low-pitched humming (Bhramari Pranayama) to boost nasal nitric oxide 15-fold and stimulate vagal tone.',
          plainLanguageSummary: 'Humming quietly with closed lips vibrates your nasal passages, producing natural nitric oxide that relaxes your blood vessels and lungs.',
          westernMedicalBenefit: 'Paranasal sinus oscillation increases nasal nitric oxide (NO) production by 1500%, dilating airways and activating the vagus nerve.',
          traditionalHolisticBenefit: 'Calms Prana Vata, soothes Prana Vayu in the lungs, and tranquilizes the mind.',
          recommendedCadence: '10 mins twice daily'
        }
      ];
    }

    // Default / Generic Patient Prescriptions (e.g. Robert Davis or General)
    return [
      {
        id: 'outdoor_cycling',
        title: 'Outdoor Cycling & Biking',
        icon: '🚲',
        category: 'Aerobic & Joint Preservation',
        intensity: 'Moderate',
        primaryHealthyDecision: 'Choose steady outdoor cycling over high-impact pavement running to build Zone 2 mitochondrial density without knee joint compression.',
        plainLanguageSummary: 'Cycling is a smooth, low-impact exercise that gets your heart pumping safely without putting heavy pressure on your knees or hips. It builds steady energy and burns fat while giving you fresh air.',
        westernMedicalBenefit: 'Closed-chain 80-90 RPM pedal revolutions lubricate knee cartilage with synovial fluid while maintaining mitochondrial fat oxidation.',
        traditionalHolisticBenefit: 'Outdoor movement through natural landscapes smooths Liver Qi stagnation and calms the Heart-Shen spirit through natural sunlight.',
        recommendedCadence: '30-45 mins @ 80-90 RPM (3x / week)'
      },
      {
        id: 'forest_walking',
        title: 'Forest Bathing & Trail Hiking',
        icon: '🌲',
        category: 'Phytoncide & Stress Resilience',
        intensity: 'Gentle',
        primaryHealthyDecision: 'Incorporate 20-minute daily nature walks to inhale plant phytoncides, reducing systemic inflammation and baseline cortisol.',
        plainLanguageSummary: 'Walking in nature lowers stress hormones, helps you sleep deeper, and boosts your immune system by breathing in natural clean forest air.',
        westernMedicalBenefit: 'Inhaling arboreal terpene phytoncides boosts Natural Killer (NK) immune cell activity by 40% and lowers mean blood pressure.',
        traditionalHolisticBenefit: 'Grounds Spleen Qi, absorbs Earth element stability, and clears excess mental heat from overworked analytical thoughts.',
        recommendedCadence: '20-30 mins daily outdoor nature walks'
      },
      {
        id: 'grounded_gardening',
        title: 'Soil Microbe Permaculture Gardening',
        icon: '🌱',
        category: 'Microbiome & Functional Balance',
        intensity: 'Gentle',
        primaryHealthyDecision: 'Practice outdoor soil gardening to cultivate gut microbiome diversity and maintain proprioceptive balance.',
        plainLanguageSummary: 'Gardening grounds your mind, keeps your joints flexible through easy movement, and exposes you to natural soil bacteria that boost your mood and gut health.',
        westernMedicalBenefit: 'Direct contact with Mycobacterium vaccae soil bacteria stimulates serotonin production and enhances gut flora diversity.',
        traditionalHolisticBenefit: 'Harmonizes Yin-Yang energy, nourishes Kidney Jing vital force, and reinforces physical stability.',
        recommendedCadence: '45 mins (3-4x / week)'
      },
      {
        id: 'probiotic_fermentation',
        title: 'Sourdough & Probiotic Culinary Guild',
        icon: '🥖',
        category: 'Gut Microbiome & Metabolic Health',
        intensity: 'Gentle',
        primaryHealthyDecision: 'Engage in artisanal sourdough and probiotic fermentation prep to improve gut SCFA levels and regulate glycemic index.',
        plainLanguageSummary: 'Baking sourdough bread and fermenting healthy foods introduces active beneficial enzymes and microbes that nourish your gut digestion.',
        westernMedicalBenefit: 'Fermented lactic acid bacteria produce short-chain fatty acids (acetate, butyrate) that improve insulin sensitivity and gut barrier integrity.',
        traditionalHolisticBenefit: 'Kindles Spleen-Stomach Agni digestive fire and transforms damp stagnation.',
        recommendedCadence: '2 hrs / week'
      },
      {
        id: 'low_impact_swimming',
        title: 'Low-Impact Aquatic Swimming',
        icon: '🏊',
        category: 'Cardiovascular & 0-G Unloading',
        intensity: 'Moderate',
        primaryHealthyDecision: 'Engage in buoyant water swimming to expand lung vital capacity while relieving 90% of spinal axial weight-bearing loads.',
        plainLanguageSummary: 'Swimming supports your whole body with zero pressure on your spine or joints. It stretches tight muscles, helps you breathe deeply, and cools internal heat.',
        westernMedicalBenefit: 'Hydrostatic pressure improves venous blood return, promotes diaphragmatic breathing, and enhances arterial vascular compliance.',
        traditionalHolisticBenefit: 'Cools excess Pitta inflammatory heat in the blood and dissolves accumulated Kapha metabolic stagnation.',
        recommendedCadence: '30 mins (2-3x / week)'
      },
      {
        id: 'nordic_walking',
        title: 'Nordic Pole Walking & Vagal Pacing',
        icon: '🦯',
        category: 'Full-Body Aerobic & BP Reduction',
        intensity: 'Moderate',
        primaryHealthyDecision: 'Use Nordic walking poles during walks to engage upper body musculature, increasing calorie burn by 20% while taking load off knees.',
        plainLanguageSummary: 'Walking with Nordic poles engages your arms and back muscles smoothly, helping you burn more energy and support your knees.',
        westernMedicalBenefit: 'Pole pushing activates 90% of skeletal muscles, reduces peak knee impact by 26%, and lowers resting blood pressure by 8-12 mmHg.',
        traditionalHolisticBenefit: 'Balances upper and lower body Qi flow, tonifying Kidney and Spleen elements.',
        recommendedCadence: '30 mins (3-4x / week)'
      },
      {
        id: 'archery_focus',
        title: 'Zen Archery & Postural Concentration',
        icon: '🏹',
        category: 'Postural Strength & Focus',
        intensity: 'Moderate',
        primaryHealthyDecision: 'Practice traditional target archery to strengthen scapular retractors, open chest posture, and train mono-directional focus.',
        plainLanguageSummary: 'Drawing a bow strengthens your upper back and shoulder blades, promoting a tall posture while sharpening mental focus.',
        westernMedicalBenefit: 'Bow drawing recruits rhomboids and middle trapezius muscles, countering forward-head posture and enhancing parasympathetic concentration.',
        traditionalHolisticBenefit: 'Aligns Heart Fire with Eye Qi, calming mental chatter and strengthening willpower.',
        recommendedCadence: '45 mins (2x / week)'
      },
      {
        id: 'woodworking_craft',
        title: 'Precision Woodworking & Hand Planing',
        icon: '🪵',
        category: 'Manual Dexterity & Tactile Flow',
        intensity: 'Moderate',
        primaryHealthyDecision: 'Engage in manual hand-plane woodworking to foster deep psychological flow state and build functional shoulder strength.',
        plainLanguageSummary: 'Shaping wood with hand tools provides satisfying physical work that builds shoulder strength and immerses your mind in creative flow.',
        westernMedicalBenefit: 'Rhythmic planing movements promote flow state (alpha-theta EEG), lowering blood pressure and enhancing bilateral shoulder stability.',
        traditionalHolisticBenefit: 'Nourishes Wood element creativity, clears Liver Qi stagnation, and grounds energy.',
        recommendedCadence: '1-2 hrs weekend craft'
      }
    ];
  });

  prescribeHobby(hobby: IHealthyHobbyOption, event: Event) {
    event.stopPropagation();
    const currentGoals = this.state.patientGoals();
    const newPrescription = `[Active Hobby Prescribed]: ${hobby.title} — ${hobby.primaryHealthyDecision}`;
    this.state.updateGoals(currentGoals ? `${currentGoals} | ${newPrescription}` : newPrescription);
    this.state.addClinicalNote({
      id: `lifestyle-${Date.now()}`,
      text: `🚲 Prescribed Lifestyle Decision for ${this.activePatientName()}: ${hobby.title} (${hobby.recommendedCadence}). Decision: ${hobby.primaryHealthyDecision}`,
      sourceLens: 'Lifestyle & Hobbies',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    this.toastMessage.set(`Prescribed "${hobby.title}" as a healthy lifestyle decision to ${this.activePatientName()}'s active care plan!`);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  copyPatientExplanation(hobby: IHealthyHobbyOption, event: Event) {
    event.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${hobby.title} (Patient Explanation for ${this.activePatientName()}):\n${hobby.plainLanguageSummary}\n\nRecommended Schedule: ${hobby.recommendedCadence}`);
      this.toastMessage.set(`Copied Plain-Language explanation for "${hobby.title}" to clipboard!`);
      setTimeout(() => this.toastMessage.set(null), 3000);
    }
  }

  readAloud(text: string, event: Event) {
    event.stopPropagation();
    if (this.plainLanguageService.isSpeaking()) {
      this.plainLanguageService.stopSpeaking();
    } else {
      this.plainLanguageService.speakPlainLanguageSummary(text);
    }
  }
}
