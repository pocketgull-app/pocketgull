import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IBotanicalEntity {
  id: string;
  commonName: string;
  botanicalName: string;
  icon: string;
  category: 'Adaptogen' | 'Anti-Inflammatory' | 'Nootropic & Neuro' | 'Mushroom Biologic' | 'Cellular Antioxidant';
  activePhytochemicals: string[];
  allopathicMechanism: string;
  biomarkersTargeted: string[];
  clinicalEvidenceTier: 'Tier 1 (Multiple RCTs / Meta-Analyses)' | 'Tier 2 (Clinical Trials)' | 'Tier 3 (Mechanistic & Observational)';
  ayurvedic: {
    sanskritName: string;
    rasaGunaViryaVipaka: string;
    doshaAction: string;
    ojasBenefit: string;
  };
  tcm: {
    chineseName: string;
    pinyinName: string;
    thermalNature: string;
    meridianChannels: string;
    qiAction: string;
  };
  osteopathicSynergy: string;
  recommendedDosage: string;
  cautionsAndInteractions: string;
}

export type TBreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

@Component({
  selector: 'app-awcim-integrative-prescriber',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-emerald-500/30 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl">
      
      <!-- Top Title & AWCIM Accreditation Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-amber-400 to-cyan-500 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            🌿
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                AWCIM Integrative Medicine &amp; Botanical Prescriber
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                Whole-Person Care
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Aligned with the Andrew Weil Center for Integrative Medicine curriculum: Anti-inflammatory botanicals, 4-7-8 breathwork, and lifestyle bioenergetics.
            </p>
          </div>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono">
          <button
            (click)="activeTab.set('botanicals')"
            [class.bg-emerald-500]="activeTab() === 'botanicals'"
            [class.text-zinc-950]="activeTab() === 'botanicals'"
            [class.text-zinc-400]="activeTab() !== 'botanicals'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            💊 Botanical Codex
          </button>
          <button
            (click)="activeTab.set('breathwork')"
            [class.bg-emerald-500]="activeTab() === 'breathwork'"
            [class.text-zinc-950]="activeTab() === 'breathwork'"
            [class.text-zinc-400]="activeTab() !== 'breathwork'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            🫁 4-7-8 Breathwork Lab
          </button>
          <button
            (click)="activeTab.set('case-study')"
            [class.bg-emerald-500]="activeTab() === 'case-study'"
            [class.text-zinc-950]="activeTab() === 'case-study'"
            [class.text-zinc-400]="activeTab() !== 'case-study'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            🎓 Fellowship Case
          </button>
        </div>
      </div>

      <!-- TAB 1: BOTANICAL MEDICINE CODEX -->
      @if (activeTab() === 'botanicals') {
        <div class="space-y-5 animate-in fade-in duration-300">
          
          <!-- Botanical Selector Ribbon -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span class="font-bold uppercase tracking-wider">Select Evidence-Based Botanical:</span>
              <span class="text-emerald-400 font-bold">{{ activeBotanical().commonName }} ({{ activeBotanical().botanicalName }})</span>
            </div>

            <div class="flex flex-wrap gap-2">
              @for (herb of botanicalCatalog; track herb.id) {
                <button
                  (click)="selectBotanical(herb)"
                  [class.bg-emerald-500/20]="activeBotanical().id === herb.id"
                  [class.border-emerald-400]="activeBotanical().id === herb.id"
                  [class.text-emerald-300]="activeBotanical().id === herb.id"
                  [class.bg-slate-900]="activeBotanical().id !== herb.id"
                  [class.border-slate-800]="activeBotanical().id !== herb.id"
                  [class.text-zinc-400]="activeBotanical().id !== herb.id"
                  class="px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition hover:border-slate-700 cursor-pointer shadow-sm"
                >
                  <span class="text-base">{{ herb.icon }}</span>
                  <span>{{ herb.commonName }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Main Botanical Detail Showcase -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 font-mono text-xs">
            
            <!-- Card 1: Allopathic & Phytochemical Action -->
            <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔬</span> Allopathic Mechanism
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {{ activeBotanical().clinicalEvidenceTier.split(' ')[0] }} {{ activeBotanical().clinicalEvidenceTier.split(' ')[1] }}
                </span>
              </div>

              <div>
                <div class="text-base font-bold text-zinc-100 font-pocketgull-sans">
                  {{ activeBotanical().commonName }}
                </div>
                <div class="text-xs italic text-zinc-400">
                  {{ activeBotanical().botanicalName }}
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div class="text-[10px] text-zinc-400 uppercase font-bold">Biochemical Target:</div>
                <div class="text-[11px] text-rose-200">{{ activeBotanical().allopathicMechanism }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-[10px] text-zinc-400 uppercase">Key Phytochemicals:</div>
                <div class="text-emerald-300 font-bold text-[11px]">
                  {{ activeBotanical().activePhytochemicals.join(', ') }}
                </div>
              </div>

              <div class="space-y-1">
                <div class="text-[10px] text-zinc-400 uppercase">Targeted Inflammatory Biomarkers:</div>
                <div class="text-cyan-300 text-[11px]">
                  {{ activeBotanical().biomarkersTargeted.join(' • ') }}
                </div>
              </div>
            </div>

            <!-- Card 2: Ayurvedic & TCM Multi-Paradigm Energetics -->
            <div class="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <span class="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🪷</span> Ayurvedic &amp; TCM Energetics
                </span>
                <span class="text-[10px] text-amber-400 font-pocketgull-notofu">आयुर्वेद &amp; 中医药</span>
              </div>

              <!-- Sanskrit Nomenclature -->
              <div class="space-y-1">
                <div class="text-lg font-bold font-pocketgull-notofu text-amber-200">
                  {{ activeBotanical().ayurvedic.sanskritName }}
                </div>
                <div class="text-[10px] text-zinc-400">
                  {{ activeBotanical().ayurvedic.rasaGunaViryaVipaka }}
                </div>
                <div class="text-[11px] text-amber-300">
                  <strong class="text-zinc-400">Dosha:</strong> {{ activeBotanical().ayurvedic.doshaAction }}
                </div>
              </div>

              <!-- Chinese TCM Nomenclature -->
              <div class="pt-2 border-t border-amber-500/20 space-y-1">
                <div class="text-base font-bold font-pocketgull-notofu text-emerald-200">
                  {{ activeBotanical().tcm.chineseName }} ({{ activeBotanical().tcm.pinyinName }})
                </div>
                <div class="text-[11px] text-zinc-300">
                  <strong class="text-zinc-400">Nature:</strong> {{ activeBotanical().tcm.thermalNature }} • {{ activeBotanical().tcm.meridianChannels }}
                </div>
                <div class="text-[11px] text-emerald-300">
                  {{ activeBotanical().tcm.qiAction }}
                </div>
              </div>
            </div>

            <!-- Card 3: Clinical Prescribing & Osteopathic Synergy -->
            <div class="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span class="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🦴</span> Clinical Prescribing &amp; OMT
                </span>
                <span class="text-[10px] text-cyan-400">Dosage Guide</span>
              </div>

              <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div class="text-[10px] text-emerald-400 uppercase font-bold">Standard Therapeutic Dosage:</div>
                <div class="text-[11px] text-emerald-200 font-bold">{{ activeBotanical().recommendedDosage }}</div>
              </div>

              <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="text-[10px] text-cyan-400 uppercase font-bold">Osteopathic &amp; Fascial Synergy:</div>
                <div class="text-[11px] text-zinc-200">{{ activeBotanical().osteopathicSynergy }}</div>
              </div>

              <div class="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1">
                <div class="text-[10px] text-rose-400 uppercase font-bold">Clinical Cautions &amp; Interactions:</div>
                <div class="text-[10px] text-rose-200">{{ activeBotanical().cautionsAndInteractions }}</div>
              </div>
            </div>

          </div>

        </div>
      }

      <!-- TAB 2: DR. WEIL'S 4-7-8 BREATHWORK LAB -->
      @if (activeTab() === 'breathwork') {
        <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 animate-in fade-in duration-300 font-mono">
          
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 class="text-base font-bold uppercase text-cyan-300 tracking-wider flex items-center gap-2">
                <span>🫁</span> Dr. Andrew Weil's 4-7-8 Relaxing Breathwork Engine
              </h3>
              <p class="text-xs text-zinc-400 font-sans">
                A natural tranquilizer for the nervous system: Stimulates parasympathetic vagal tone, reduces sympathetic tone, and stabilizes Heart Rate Variability (HRV).
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="toggleBreathwork()"
                [class.bg-rose-500]="isBreathActive()"
                [class.bg-emerald-500]="!isBreathActive()"
                class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 transition cursor-pointer shadow-lg"
              >
                {{ isBreathActive() ? '⏹ Stop Session' : '▶ Start 4-7-8 Breathwork' }}
              </button>
            </div>
          </div>

          <!-- Kinetic Breathwork Visualizer -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <!-- SVG Breathing Circle Ring -->
            <div class="flex flex-col items-center justify-center p-8 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden min-h-[300px]">
              
              <!-- Expanding/Contracting Kinetic Circle -->
              <div
                class="w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl"
                [style.transform]="computedBreathScale()"
                [style.border-color]="computedBreathColor()"
                [style.box-shadow]="computedBreathGlow()"
              >
                <div class="text-2xl font-black uppercase text-zinc-100 font-pocketgull-sans tracking-widest">
                  {{ breathPhaseText() }}
                </div>
                <div class="text-4xl font-black font-mono text-cyan-300 pt-1">
                  {{ breathSecondsRemaining() }}s
                </div>
                <div class="text-[10px] text-zinc-400 uppercase tracking-widest pt-1">
                  Cycle {{ breathCycleCount() }} / 4
                </div>
              </div>

              <!-- Subtitle Directive -->
              <div class="pt-6 text-center text-xs text-zinc-400 max-w-xs">
                {{ computedBreathInstruction() }}
              </div>
            </div>

            <!-- Real-Time Autonomic & Vagal Telemetry -->
            <div class="space-y-3 font-mono text-xs">
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div class="flex justify-between text-zinc-400 text-[11px]">
                  <span>Parasympathetic Vagal Nerve Output:</span>
                  <span class="text-emerald-400 font-bold">{{ computedVagalTone() }}% (High)</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500" [style.width.%]="computedVagalTone()"></div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div class="flex justify-between text-zinc-400 text-[11px]">
                  <span>Heart Rate Variability (HRV SDNN):</span>
                  <span class="text-cyan-300 font-bold">{{ computedHrvSdnn() }} ms (Coherence)</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-amber-400 to-cyan-400 h-full transition-all duration-500" [style.width.%]="computedHrvSdnn()"></div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div class="flex justify-between text-zinc-400 text-[11px]">
                  <span>Sympathetic Adrenaline / Cortisol Tone:</span>
                  <span class="text-rose-400 font-bold">{{ 100 - computedVagalTone() }}% (Suppressed)</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-rose-500 h-full transition-all duration-500" [style.width.%]="100 - computedVagalTone()"></div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                💡 <strong>Clinical Guidance:</strong> Practice 4 cycles twice daily. Dr. Weil emphasizes that regular practice permanently lowers resting baseline heart rate and strengthens the autonomic brake.
              </div>
            </div>

          </div>

        </div>
      }

      <!-- TAB 3: FELLOWSHIP CASE STUDY LAB -->
      @if (activeTab() === 'case-study') {
        <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 animate-in fade-in duration-300 font-mono text-xs">
          
          <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold uppercase text-amber-300 flex items-center gap-2">
                <span>🎓</span> AWCIM Fellowship Interactive Case: Chronic Inflammatory Dysregulation
              </h3>
              <p class="text-xs text-zinc-400 font-sans">
                Patient: Female, 48y • Chief Complaint: Severe systemic fatigue, bilateral hand joint pain, brain fog, and unrefreshing sleep.
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
              Multi-Paradigm OSCE
            </span>
          </div>

          <!-- 4-Pillar Clinical Formulation Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="text-rose-400 font-bold uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <span>🩺</span> 1. Allopathic Biomarkers
              </div>
              <div>• hs-CRP: <strong class="text-rose-300">4.2 mg/L</strong> (Elevated)</div>
              <div>• HbA1c: <strong class="text-amber-300">5.8%</strong> (Pre-diabetic)</div>
              <div>• ESR: <strong class="text-rose-300">28 mm/hr</strong></div>
              <div>• Vit D: <strong class="text-rose-300">22 ng/mL</strong> (Deficient)</div>
            </div>

            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="text-amber-400 font-bold uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <span>🪷</span> 2. Ayurvedic Assessment
              </div>
              <div class="font-pocketgull-notofu">• दोष: <strong class="text-amber-300">वात-पित्त प्रकोप (Vata-Pitta)</strong></div>
              <div>• आम (Ama): Deep toxic digestive sludge</div>
              <div>• मन्दाग्नि (Mandagni): Sluggish cellular fire</div>
              <div>• ओजस् क्षय (Ojas): Depleted vitality</div>
            </div>

            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="text-emerald-400 font-bold uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <span>🌿</span> 3. TCM Pattern
              </div>
              <div class="font-pocketgull-notofu">• 辨证: <strong class="text-emerald-300">肝郁脾虚 (Liver Stagnation / Spleen Deficiency)</strong></div>
              <div>• 湿热蕴结: Damp-heat accumulation in joints</div>
              <div>• 舌苔: Pale tongue with greasy yellow coating</div>
              <div>• 脉象: Wiry and slippery pulse</div>
            </div>

            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="text-cyan-400 font-bold uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <span>🦴</span> 4. Osteopathic T.A.R.T.
              </div>
              <div>• T5–T9: Viscerosomatic paraspinal ropiness</div>
              <div>• Diaphragm: Restricted descent on inhalation</div>
              <div>• Thoracic Inlet: Stasis impeding lymphatic return</div>
              <div>• PRM: 7 cpm (Depressed craniosacral rhythm)</div>
            </div>

          </div>

          <!-- Integrative Fellowship Care Plan Synthesis -->
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div class="text-emerald-300 font-bold uppercase text-xs flex items-center gap-2">
              <span>📋</span> Formulated Whole-Person Integrative Prescription
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-zinc-300">
              <div class="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <strong class="text-amber-400">Botanical:</strong> Curcumin (BCM-95 500mg BID) + Ashwagandha (KSM-66 300mg QHS).
              </div>
              <div class="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <strong class="text-cyan-400">Mind-Body:</strong> Dr. Weil 4-7-8 Breathwork (4 cycles BID) + 20 min morning sunlight.
              </div>
              <div class="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <strong class="text-emerald-400">Acupuncture:</strong> ST-36, SP-6, LR-3, and CV-12 to strengthen Spleen Qi and soothe Liver.
              </div>
              <div class="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <strong class="text-rose-400">OMT Protocol:</strong> Thoracic inlet release, Rib raising, and Suboccipital decompression.
              </div>
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class AwcimIntegrativePrescriberComponent implements OnDestroy {
  activeTab = signal<'botanicals' | 'breathwork' | 'case-study'>('botanicals');

  // Breathwork State
  isBreathActive = signal<boolean>(false);
  breathPhase = signal<TBreathPhase>('idle');
  breathSecondsRemaining = signal<number>(4);
  breathCycleCount = signal<number>(1);
  vagalTonePercent = signal<number>(45); // Baseline 45%
  private breathIntervalId?: ReturnType<typeof setInterval>;

  readonly botanicalCatalog: IBotanicalEntity[] = [
    {
      id: 'curcumin',
      commonName: 'Curcumin (Turmeric)',
      botanicalName: 'Curcuma longa',
      icon: '🟡',
      category: 'Anti-Inflammatory',
      activePhytochemicals: ['Curcumin I', 'Demethoxycurcumin', 'Bisdemethoxycurcumin', 'Turmerones'],
      allopathicMechanism: 'Suppresses NF-κB nuclear translocation, downregulates COX-2, 5-LOX, and reduces serum IL-6, TNF-α, and hs-CRP.',
      biomarkersTargeted: ['hs-CRP (<0.5 mg/L)', 'IL-6', 'TNF-α', 'ESR'],
      clinicalEvidenceTier: 'Tier 1 (Multiple RCTs / Meta-Analyses)',
      ayurvedic: {
        sanskritName: 'हरिद्रा • कफ-पित्त शामक',
        rasaGunaViryaVipaka: 'Tikta/Katu (Bitter/Pungent), Ushna (Warm), Katu Vipaka',
        doshaAction: 'Pacifies Kapha and Pitta; clears deep tissue Ama and detoxifies Rakta Dhatu',
        ojasBenefit: 'Rebuilds foundational cellular Ojas and cleanses liver micro-channels (Yakrit Srotas)'
      },
      tcm: {
        chineseName: '姜黄',
        pinyinName: 'Jiang Huang',
        thermalNature: 'Warm, Acrid, Bitter',
        meridianChannels: 'Spleen, Liver',
        qiAction: 'Invigorates Blood, breaks Blood Stasis (祛瘀), and moves stagnant Qi to relieve pain'
      },
      osteopathicSynergy: 'Decreases myofascial tension and joint capsule effusion, accelerating response to Muscle Energy and MFR techniques.',
      recommendedDosage: '500 mg standardized extract (95% curcuminoids) with 5 mg BioPerine (piperine) BID with food.',
      cautionsAndInteractions: 'Caution with anticoagulant therapy (Warfarin, NOACs) and biliary obstruction.'
    },
    {
      id: 'ashwagandha',
      commonName: 'Ashwagandha',
      botanicalName: 'Withania somnifera',
      icon: '🌿',
      category: 'Adaptogen',
      activePhytochemicals: ['Withanolides (Withaferin A, Withanolide D)', 'Sitoindosides', 'Alkaloids'],
      allopathicMechanism: 'Modulates Hypothalamic-Pituitary-Adrenal (HPA) axis, lowers serum morning cortisol, activates GABA-A receptors, and enhances mitochondrial ATP.',
      biomarkersTargeted: ['Salivary Cortisol', 'DHEA-S', 'Fasting Blood Glucose', 'HRV SDNN'],
      clinicalEvidenceTier: 'Tier 1 (Multiple RCTs / Meta-Analyses)',
      ayurvedic: {
        sanskritName: 'अश्वगन्धा • वात-कफ शामक',
        rasaGunaViryaVipaka: 'Tikta/Kashaya/Madhura, Laghu/Snigdha, Ushna Virya',
        doshaAction: 'Supreme Rasayana for pacifying Vata Dosha and nourishing Majja and Shukra Dhatus',
        ojasBenefit: 'Directly nourishes Supreme Ojas, providing stamina and nervous system stabilization'
      },
      tcm: {
        chineseName: '南非醉茄',
        pinyinName: 'Nan Fei Zui Qie',
        thermalNature: 'Warm, Sweet, Astringent',
        meridianChannels: 'Kidney, Heart, Spleen',
        qiAction: 'Tonifies Kidney Yang, calms the Shen (Spirit), and replenishes Pre-Heaven Jing essence'
      },
      osteopathicSynergy: 'Reduces resting sympathetic hypertonicity, facilitating craniosacral still-point induction (CV-4).',
      recommendedDosage: '300–600 mg standardized root extract (KSM-66 / Sensoril) BID or QHS.',
      cautionsAndInteractions: 'May stimulate thyroid hormone production; monitor in hyperthyroidism.'
    },
    {
      id: 'reishi',
      commonName: 'Reishi (Lingzhi Mushroom)',
      botanicalName: 'Ganoderma lucidum',
      icon: '🍄',
      category: 'Mushroom Biologic',
      activePhytochemicals: ['Beta-1,3/1,6-D-Glucans', 'Ganoderic Acids (Triterpenes)', 'Polysaccharides'],
      allopathicMechanism: 'Primes Dectin-1 and TLR-4 on Natural Killer (NK) cells and macrophages; modulates Th1/Th2 immune balance and supports hepatic phase I/II detoxification.',
      biomarkersTargeted: ['CD4+/CD8+ Ratio', 'NK Cell Cytotoxicity', 'ALT / AST', 'hs-CRP'],
      clinicalEvidenceTier: 'Tier 2 (Clinical Trials)',
      ayurvedic: {
        sanskritName: 'छत्राक • ओजस्कर रसायन',
        rasaGunaViryaVipaka: 'Tikta (Bitter), Sheeta (Cooling), Katu Vipaka',
        doshaAction: 'Pacifies Pitta and Kapha, harmonizes Prana and Vyana Vayu',
        ojasBenefit: 'Enhances long-term cellular resilience and deep bone marrow (Majja) immunity'
      },
      tcm: {
        chineseName: '灵芝',
        pinyinName: 'Ling Zhi (Mushroom of Immortality)',
        thermalNature: 'Neutral, Sweet',
        meridianChannels: 'Heart, Lung, Liver, Kidney',
        qiAction: 'Nourishes Heart Qi, calms the Shen, tonifies Lung Qi, and transforms phlegm'
      },
      osteopathicSynergy: 'Supports thoracic duct lymphatic circulation and reduces visceral organ congestion.',
      recommendedDosage: '1000–1500 mg dual-extracted fruiting body extract daily.',
      cautionsAndInteractions: 'Potential additive hypotensive and anticoagulant effects.'
    },
    {
      id: 'egcg',
      commonName: 'Green Tea Extract (EGCG)',
      botanicalName: 'Camellia sinensis',
      icon: '🍵',
      category: 'Cellular Antioxidant',
      activePhytochemicals: ['Epigallocatechin Gallate (EGCG)', 'Epicatechin', 'L-Theanine'],
      allopathicMechanism: 'Potent polyphenol scavenging free radicals, upregulating Nrf2 antioxidant response element (ARE), and promoting autophagy.',
      biomarkersTargeted: ['Total Cholesterol / LDL-C', 'Fasting Insulin', 'F2-Isoprostanes (ROS)'],
      clinicalEvidenceTier: 'Tier 1 (Multiple RCTs / Meta-Analyses)',
      ayurvedic: {
        sanskritName: 'चाय • कफघ्न',
        rasaGunaViryaVipaka: 'Kashaya/Tikta (Astringent/Bitter), Sheeta (Cooling)',
        doshaAction: 'Clears excess Kapha and Pitta; sharpens Medha (intellect and focus)',
        ojasBenefit: 'Protects cellular membranes from oxidative degradation'
      },
      tcm: {
        chineseName: '绿茶',
        pinyinName: 'Lu Cha',
        thermalNature: 'Cool, Bitter, Sweet',
        meridianChannels: 'Heart, Lung, Stomach',
        qiAction: 'Clears Toxic Heat, brightens the Eyes, resolves phlegm, and promotes digestion'
      },
      osteopathicSynergy: 'Promotes microvascular endothelial elasticity and reduces peripheral fascial edema.',
      recommendedDosage: '300–400 mg standardized EGCG extract daily (with decaffeinated option).',
      cautionsAndInteractions: 'Take with food to protect gastric mucosa; avoid extreme mega-doses in liver disease.'
    },
    {
      id: 'boswellia',
      commonName: 'Boswellia (Indian Frankincense)',
      botanicalName: 'Boswellia serrata',
      icon: '🪵',
      category: 'Anti-Inflammatory',
      activePhytochemicals: ['AKBA (3-O-acetyl-11-keto-beta-boswellic acid)', 'Boswellic Acids'],
      allopathicMechanism: 'Specific non-redox inhibitor of 5-Lipoxygenase (5-LOX), preventing leukotriene B4 (LTB4) synthesis without gastric ulceration.',
      biomarkersTargeted: ['Leukotriene B4 (LTB4)', 'MMP-3', 'hs-CRP', 'WOMAC Osteoarthritis Score'],
      clinicalEvidenceTier: 'Tier 1 (Multiple RCTs / Meta-Analyses)',
      ayurvedic: {
        sanskritName: 'शल्लकी • सन्धि-वातघ्न',
        rasaGunaViryaVipaka: 'Tikta/Kashaya/Madhura, Snigdha, Sheeta Virya',
        doshaAction: 'Specifically pacifies aggravated Vata and Pitta in the joints and intestinal mucosa',
        ojasBenefit: 'Strengthens Asthi-Sandhi (Bone-Joint) stability and mucosal barrier integrity'
      },
      tcm: {
        chineseName: '乳香',
        pinyinName: 'Ru Xiang',
        thermalNature: 'Warm, Pungent, Bitter',
        meridianChannels: 'Heart, Liver, Spleen',
        qiAction: 'Invigorates Blood, relieves pain, generates new tissue, and relaxes sinews'
      },
      osteopathicSynergy: 'Directly alleviates spinal articular facet joint inflammation, facilitating HVLA and articulatory OMT.',
      recommendedDosage: '100–250 mg enriched AKBA extract (ApresFlex / 5-Loxin) or 400 mg standardized extract TID.',
      cautionsAndInteractions: 'Generally well-tolerated with excellent gastrointestinal safety profile.'
    }
  ];

  activeBotanical = signal<IBotanicalEntity>(this.botanicalCatalog[0]);

  selectBotanical(herb: IBotanicalEntity): void {
    this.activeBotanical.set(herb);
  }

  // 4-7-8 Breathwork Computed Properties
  computedBreathScale = computed(() => {
    const phase = this.breathPhase();
    if (phase === 'inhale') return 'scale(1.35)';
    if (phase === 'hold') return 'scale(1.35)';
    if (phase === 'exhale') return 'scale(0.85)';
    return 'scale(1.0)';
  });

  computedBreathColor = computed(() => {
    const phase = this.breathPhase();
    if (phase === 'inhale') return '#38bdf8'; // cyan
    if (phase === 'hold') return '#fbbf24'; // amber
    if (phase === 'exhale') return '#34d399'; // emerald
    return '#64748b'; // slate
  });

  computedBreathGlow = computed(() => {
    const phase = this.breathPhase();
    if (phase === 'inhale') return '0 0 35px rgba(56, 189, 248, 0.4)';
    if (phase === 'hold') return '0 0 45px rgba(251, 191, 36, 0.5)';
    if (phase === 'exhale') return '0 0 35px rgba(52, 211, 153, 0.4)';
    return 'none';
  });

  breathPhaseText = computed(() => {
    const phase = this.breathPhase();
    if (phase === 'inhale') return 'INHALE';
    if (phase === 'hold') return 'HOLD';
    if (phase === 'exhale') return 'EXHALE';
    return 'READY';
  });

  computedBreathInstruction = computed(() => {
    const phase = this.breathPhase();
    if (phase === 'inhale') return 'Breathe in quietly through the nose for 4 seconds...';
    if (phase === 'hold') return 'Hold your breath comfortably for 7 seconds...';
    if (phase === 'exhale') return 'Exhale completely through your mouth with a whoosh sound for 8 seconds...';
    return 'Click "Start 4-7-8 Breathwork" to begin Dr. Weil\'s relaxing autonomic reset.';
  });

  computedVagalTone = computed(() => {
    return this.vagalTonePercent();
  });

  computedHrvSdnn = computed(() => {
    return Math.round(35 + this.vagalTonePercent() * 0.45);
  });

  toggleBreathwork(): void {
    if (this.isBreathActive()) {
      this.stopBreathwork();
    } else {
      this.startBreathwork();
    }
  }

  private startBreathwork(): void {
    this.isBreathActive.set(true);
    this.breathCycleCount.set(1);
    this.runInhalePhase();
  }

  private runInhalePhase(): void {
    this.breathPhase.set('inhale');
    this.breathSecondsRemaining.set(4);

    let sec = 4;
    this.clearInterval();
    this.breathIntervalId = setInterval(() => {
      sec--;
      this.breathSecondsRemaining.set(sec);
      if (sec <= 0) {
        this.runHoldPhase();
      }
    }, 1000);
  }

  private runHoldPhase(): void {
    this.breathPhase.set('hold');
    this.breathSecondsRemaining.set(7);

    let sec = 7;
    this.clearInterval();
    this.breathIntervalId = setInterval(() => {
      sec--;
      this.breathSecondsRemaining.set(sec);
      if (sec <= 0) {
        this.runExhalePhase();
      }
    }, 1000);
  }

  private runExhalePhase(): void {
    this.breathPhase.set('exhale');
    this.breathSecondsRemaining.set(8);

    // Increase vagal tone by 10% each cycle
    this.vagalTonePercent.update(v => Math.min(95, v + 10));

    let sec = 8;
    this.clearInterval();
    this.breathIntervalId = setInterval(() => {
      sec--;
      this.breathSecondsRemaining.set(sec);
      if (sec <= 0) {
        const nextCycle = this.breathCycleCount() + 1;
        if (nextCycle <= 4) {
          this.breathCycleCount.set(nextCycle);
          this.runInhalePhase();
        } else {
          this.stopBreathwork();
        }
      }
    }, 1000);
  }

  private stopBreathwork(): void {
    this.clearInterval();
    this.isBreathActive.set(false);
    this.breathPhase.set('idle');
    this.breathSecondsRemaining.set(4);
  }

  private clearInterval(): void {
    if (this.breathIntervalId) {
      clearInterval(this.breathIntervalId);
      this.breathIntervalId = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }
}
