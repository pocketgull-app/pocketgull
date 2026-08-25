import { Component, ChangeDetectionStrategy, inject, signal, computed, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IInsightSpark {
  id: string;
  lensCategory: 'Summary Overview' | 'Functional Protocols' | 'Nutrition' | 'Monitoring & Follow-up' | 'Patient Education' | 'Precision Nutrients';
  title: string;
  hypothesis: string;
  keyBiomarkers: string[];
  proposedTrialProtocol: string;
  pubmedSearchQuery: string;
  innovationBadge: string;
}

export interface ISynergySpark {
  id: string;
  fromParadigm: string;
  toParadigm: string;
  title: string;
  translationalBridge: string;
  targetDatapoint: string;
  question: string;
}

export interface ICustomExperiment {
  title: string;
  hypothesis: string;
  protocol: string;
  question: string;
}

@Component({
  selector: 'app-lens-insight-spark-shield',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Header & Lens Shield Telemetry Banner (Dieter Rams Braun Style) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-xl">💡</span>
            <div>
              <h2 class="text-base font-black uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Lens Innovation Shield & Insight Sparks</span>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
                  {{ activeLens() }} Shield Active
                </span>
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Targeted clinical safety shields and translational research sparks for <strong>{{ activePatientName() }}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <button (click)="isDrillDownOpen.set(true)"
            class="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-955 text-[10px] font-bold uppercase transition shadow-md cursor-pointer flex items-center gap-1.5 border border-orange-400/50">
            <span>🔬</span>
            <span>Drill-Down Insight Sparks ({{ activeSparks().length }})</span>
          </button>
        </div>
      </div>

      <!-- Toggle Tabs between Standard Sparks, Synergy Explorer, and Experiment Lab -->
      <div class="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-800 pb-4 no-print font-mono text-xs">
        <button (click)="viewMode.set('standard')"
                [class]="viewMode() === 'standard' ? 'bg-orange-500 text-zinc-955 font-bold border-orange-400' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850 border-zinc-800'"
                class="px-4 py-1.5 rounded-xl transition cursor-pointer font-bold border">
          🛡️ Standard Lens Sparks
        </button>
        <button (click)="viewMode.set('synergy')"
                [class]="viewMode() === 'synergy' ? 'bg-orange-500 text-zinc-955 font-bold border-orange-400' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850 border-zinc-800'"
                class="px-4 py-1.5 rounded-xl transition cursor-pointer font-bold border">
          ☯️ Cross-Paradigm Synergy Explorer
        </button>
        <button (click)="viewMode.set('lab')"
                [class]="viewMode() === 'lab' ? 'bg-orange-500 text-zinc-955 font-bold border-orange-400' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850 border-zinc-800'"
                class="px-4 py-1.5 rounded-xl transition cursor-pointer font-bold border">
          🧪 Paradigm Bridge Experiment Lab
        </button>
        <button (click)="viewMode.set('inquiry')"
                [class]="viewMode() === 'inquiry' ? 'bg-orange-500 text-zinc-955 font-bold border-orange-400' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850 border-zinc-800'"
                class="px-4 py-1.5 rounded-xl transition cursor-pointer font-bold border">
          🔍 Inquisitive Pathways
        </button>
      </div>

      @if (viewMode() === 'standard') {
        <!-- Lens-Specific Active Innovation Shield Banner -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 font-mono shadow-sm">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-lg">{{ getLensIcon(activeLens()) }}</span>
              <span class="font-bold uppercase text-orange-400">{{ activeLens() }} Innovation Shield Protocol</span>
            </div>
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
              PROTECTION ENGAGED
            </span>
          </div>

          <p class="text-xs text-zinc-300 font-sans leading-relaxed">
            {{ getLensShieldSummary(activeLens()) }}
          </p>
        </div>

        <!-- Insight Sparks Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          @for (spark of activeSparks(); track spark.id) {
            <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition flex flex-col justify-between group shadow-sm">
              
              <div>
                <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5 font-mono text-[10px]">
                  <span class="px-2 py-0.5 rounded bg-zinc-950 text-orange-400 font-bold uppercase border border-zinc-800">
                    ⚡ {{ spark.innovationBadge }}
                  </span>
                  <span class="text-zinc-400">Translational Research Spark</span>
                </div>

                <h3 class="text-xs font-bold text-zinc-100 group-hover:text-orange-400 transition-colors leading-snug mb-1 font-sans">
                  {{ spark.title }}
                </h3>

                <p class="text-[11px] text-zinc-300 font-sans leading-relaxed mb-3">
                  <strong>Hypothesis:</strong> {{ spark.hypothesis }}
                </p>

                <div class="mb-3">
                  <span class="text-[10px] font-mono text-zinc-400 font-bold uppercase block mb-1">Key Biomarkers / Metrics:</span>
                  <div class="flex flex-wrap gap-1 font-mono text-[9.5px]">
                    @for (bio of spark.keyBiomarkers; track bio) {
                      <span class="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                        🧪 {{ bio }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- Footer Action Buttons -->
              <div class="pt-3 border-t border-zinc-800 flex items-center justify-between font-mono text-[10px]">
                <button (click)="launchPubMedSearch(spark)"
                  class="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">
                  <span>📚 Launch PubMed Search</span>
                </button>

                <button (click)="bookmarkSpark(spark)"
                  class="px-2.5 py-1 rounded-xl bg-zinc-955 hover:bg-zinc-850 text-zinc-300 text-[9.5px] font-bold uppercase transition cursor-pointer border border-zinc-800">
                  📌 Log Hypothesis
                </button>
              </div>

            </div>
          }
        </div>
      } @else if (viewMode() === 'synergy') {
        <!-- Cross-Paradigm Synergy Explorer Mode -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 font-mono shadow-sm">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-lg">☯️</span>
              <span class="font-bold uppercase text-orange-400">Cross-Paradigm Integration Philosophy</span>
            </div>
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
              CROSS-LENS ACTIVE
            </span>
          </div>

          <p class="text-xs text-zinc-300 font-sans leading-relaxed">
            Bridging different diagnostic systems (Western biomonitoring, Eastern meridians, and Ayurvedic Agni/Ojas) helps reveal complex physiological dependencies. Explore the translational sparks below to see how a lens from one paradigm aids another.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          @for (spark of synergySparks; track spark.id) {
            <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition flex flex-col justify-between group shadow-sm">
              
              <div>
                <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5 font-mono text-[10px]">
                  <span class="px-2 py-0.5 rounded bg-zinc-955 text-orange-400 font-bold uppercase border border-zinc-800">
                    Bridge: {{ spark.fromParadigm }} → {{ spark.toParadigm }}
                  </span>
                  <span class="text-zinc-400">Inter-paradigm Spark</span>
                </div>

                <h3 class="text-xs font-bold text-zinc-100 group-hover:text-orange-400 transition-colors leading-snug mb-2 font-sans">
                  {{ spark.title }}
                </h3>

                <p class="text-[11px] text-zinc-300 font-sans leading-relaxed mb-3">
                  <strong>Translational Concept:</strong> {{ spark.translationalBridge }}
                </p>

                <div class="mb-3">
                  <span class="text-[10px] font-mono text-zinc-400 font-bold uppercase block mb-1">Target Datapoints:</span>
                  <span class="text-[11px] text-zinc-300 font-sans">
                    {{ spark.targetDatapoint }}
                  </span>
                </div>

                <div class="p-3 rounded-lg bg-zinc-955 border border-zinc-855 mb-3">
                  <span class="text-[9.5px] font-mono text-orange-400 font-bold uppercase block mb-1">Clinical Inquiry to Explore:</span>
                  <p class="text-[11px] text-zinc-300 font-sans italic leading-relaxed">
                    "{{ spark.question }}"
                  </p>
                </div>
              </div>

              <!-- Footer Action Buttons -->
              <div class="pt-3 border-t border-zinc-800 flex items-center justify-between font-mono text-[10px]">
                <span class="text-zinc-500">Synergy Action</span>
                <button (click)="injectSynergyQuestion(spark)"
                  class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-955 text-[10px] font-bold uppercase transition shadow-md cursor-pointer flex items-center gap-1 border border-orange-400/50">
                  <span>💬 Inject to Consult</span>
                </button>
              </div>

            </div>
          }
        </div>
      } @else if (viewMode() === 'lab') {
        <!-- Paradigm Bridge Experiment Lab -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 font-mono shadow-sm">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-lg">🧪</span>
              <span class="font-bold uppercase text-orange-400">Paradigm Bridge Translation Lab</span>
            </div>
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800">
              EXPERIMENT BUILDER
            </span>
          </div>
          <p class="text-xs text-zinc-300 font-sans leading-relaxed">
            Construct custom translational clinical trial protocols by linking biometric source variables to cross-paradigm target constructs.
          </p>
        </div>

        <!-- Presets Bar -->
        <div class="mb-6 flex flex-wrap items-center gap-2 font-mono text-[10px]">
          <span class="text-zinc-400 font-bold uppercase">Load Preset Study Template:</span>
          @for (preset of presets; track preset.name) {
            <button (click)="loadPreset(preset)"
              class="px-2.5 py-1 rounded bg-zinc-955 border border-zinc-800 hover:border-orange-500/40 text-zinc-300 transition text-[9.5px] cursor-pointer">
              {{ preset.name }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono mb-6">
          <!-- Selection Controls -->
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-4">
            <h3 class="text-xs font-bold text-orange-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
              Step 1: Configure Bridges
            </h3>

            <!-- Source Configuration -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-zinc-400 uppercase block">Source Paradigm (Biometrics):</label>
              <div class="flex gap-1.5">
                @for (p of ['Western', 'Eastern', 'Ayurvedic']; track p) {
                  <button (click)="setSourceParadigm(p)"
                    [class]="sourceParadigm() === p ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-zinc-955 text-zinc-400 border-zinc-800 hover:bg-zinc-900'"
                    class="flex-1 py-1 rounded text-[9.5px] font-bold uppercase border transition cursor-pointer">
                    {{ p }}
                  </button>
                }
              </div>

              <label class="text-[10px] font-bold text-zinc-400 uppercase block mt-3">Source Metric:</label>
              <select [value]="sourceMetric()" (change)="sourceMetric.set($any($event.target).value)"
                aria-label="Source Metric"
                class="w-full p-2 rounded bg-zinc-955 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-orange-500/50">
                @for (metric of getMetricsForParadigm(sourceParadigm()); track metric) {
                  <option [value]="metric">{{ metric }}</option>
                }
              </select>
            </div>

            <!-- Target Configuration -->
            <div class="space-y-2 pt-2 border-t border-zinc-800">
              <label class="text-[10px] font-bold text-zinc-400 uppercase block">Target Paradigm (Constructs):</label>
              <div class="flex gap-1.5">
                @for (p of ['Western', 'Eastern', 'Ayurvedic']; track p) {
                  <button (click)="setTargetParadigm(p)"
                    [class]="targetParadigm() === p ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-zinc-955 text-zinc-400 border-zinc-800 hover:bg-zinc-900'"
                    class="flex-1 py-1 rounded text-[9.5px] font-bold uppercase border transition cursor-pointer">
                    {{ p }}
                  </button>
                }
              </div>

              <label class="text-[10px] font-bold text-zinc-400 uppercase block mt-3">Target Metric / Concept:</label>
              <select [value]="targetMetric()" (change)="targetMetric.set($any($event.target).value)"
                aria-label="Target Metric"
                class="w-full p-2 rounded bg-zinc-955 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-orange-500/50">
                @for (metric of getMetricsForParadigm(targetParadigm()); track metric) {
                  <option [value]="metric">{{ metric }}</option>
                }
              </select>
            </div>

            <!-- 3D Layer Overrides -->
            <div class="space-y-2 pt-3 border-t border-zinc-800">
              <label class="text-[10px] font-bold text-zinc-400 uppercase block">🌐 Live 3D Mannequin Layer Controls:</label>
              <div class="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
                @for (m of ['skin', 'muscle', 'skeleton', 'organs', 'eastern', 'ayurvedic']; track m) {
                  <button (click)="patientState.anatomyViewMode.set($any(m))"
                    [class]="patientState.anatomyViewMode() === m ? 'bg-teal-600 text-white font-bold border-teal-500/50' : 'bg-zinc-955 text-zinc-400 border-zinc-800 hover:bg-zinc-900'"
                    class="py-1 rounded uppercase border transition cursor-pointer text-center">
                    {{ m }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Generated Experiment Output -->
          @let exp = generatedExperiment();
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-bold text-orange-400 uppercase tracking-wider border-b border-zinc-800 pb-2 mb-3">
                Step 2: Trial Design Output
              </h3>

              <div class="space-y-3 font-sans">
                <div>
                  <span class="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Study Title:</span>
                  <span class="text-xs font-bold text-zinc-100">{{ exp.title }}</span>
                </div>

                <div>
                  <span class="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Translational Hypothesis:</span>
                  <p class="text-xs text-zinc-300 leading-relaxed mt-0.5">{{ exp.hypothesis }}</p>
                </div>

                <div>
                  <span class="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Proposed Trial Protocol:</span>
                  <p class="text-xs text-zinc-300 leading-relaxed mt-0.5">{{ exp.protocol }}</p>
                </div>

                <div class="p-3 rounded-xl bg-zinc-955 border border-zinc-850">
                  <span class="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest block mb-1">Exploratory Clinical Inquiry:</span>
                  <p class="text-[11.5px] text-zinc-300 italic leading-relaxed">
                    "{{ exp.question }}"
                  </p>
                </div>
              </div>

              <!-- Dynamic Telemetry Correlation Box -->
              <div class="mt-4 p-4 rounded-xl border border-zinc-855 bg-zinc-955 font-mono text-[11px] space-y-2.5">
                <div class="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                  <span class="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">📊 Active Patient Telemetry</span>
                  <span class="text-emerald-400 font-extrabold text-[9px]">LIVE</span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-zinc-300">
                  <div>
                    <span class="text-zinc-500 block text-[9.5px]">WESTERN:</span>
                    <span>HR: {{ patientState.vitals().hr || '72' }} BPM | BP: {{ patientState.vitals().bp || '120/80' }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-500 block text-[9.5px]">TCM TONGUE/PULSE:</span>
                    <span class="capitalize">{{ patientState.tcmIntake().tongueCoating }} / {{ patientState.tcmIntake().pulseQuality }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-500 block text-[9.5px]">AYURVEDIC AGNI:</span>
                    <span class="capitalize">{{ patientState.ayurvedicIntake().agniType }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-500 block text-[9.5px]">AMA METABOLIC TOXINS:</span>
                    <span>Score: {{ patientState.ayurvedicIntake().amaScore }}/10</span>
                  </div>
                </div>

                @if (patientCorrelationAlert(); as alert) {
                  <div class="mt-3 p-3 rounded-lg border text-xs leading-normal font-sans"
                       [class.bg-red-500\/10]="alert.type === 'perfect'"
                       [class.border-red-500\/30]="alert.type === 'perfect'"
                       [class.text-red-400]="alert.type === 'perfect'"
                       [class.bg-amber-500\/10]="alert.type === 'moderate'"
                       [class.border-amber-500\/30]="alert.type === 'moderate'"
                       [class.text-amber-400]="alert.type === 'moderate'">
                    {{ alert.text }}
                  </div>
                }
              </div>
            </div>

            <!-- Action controls -->
            <div class="pt-4 border-t border-zinc-800 flex items-center justify-between font-mono text-[10px] mt-4">
              <button (click)="logCustomExperiment(exp)"
                class="px-3 py-1.5 rounded-xl bg-zinc-955 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold uppercase transition border border-zinc-800 cursor-pointer">
                💾 Log to Chart
              </button>
              <button (click)="injectCustomExperiment(exp)"
                class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-955 text-[10px] font-bold uppercase transition shadow-md cursor-pointer flex items-center gap-1 border border-orange-400/50">
                <span>💬 Inject to Consult</span>
              </button>
            </div>
          </div>
        </div>
      } @else if (viewMode() === 'inquiry') {
        <!-- Inquisitive Research Pathways Directory -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 font-mono shadow-sm">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-lg">🔍</span>
              <span class="font-bold uppercase text-orange-400">Inquisitive Clinical Probing Directory</span>
            </div>
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-955 text-emerald-400 border border-zinc-800">
              EXPLORATORY PATHWAYS
            </span>
          </div>
          <p class="text-xs text-zinc-300 font-sans leading-relaxed">
            Examine the clinical research pathways below. Use these progressive inquiries during the consultation to probe the patient's biological response and traditional energetic state.
          </p>
        </div>

        <div class="space-y-6">
          @for (pathway of inquisitivePathways; track pathway.id) {
            <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 font-mono shadow-sm">
              <div class="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 mb-4 gap-2">
                <div>
                  <span class="text-[10px] font-bold text-orange-400 uppercase block">RESEARCH PATHWAY</span>
                  <h3 class="text-sm font-bold text-zinc-100 font-sans mt-0.5">{{ pathway.title }}</h3>
                </div>
                <span class="text-[9px] px-2 py-0.5 rounded bg-zinc-955 border border-zinc-800 text-zinc-400 uppercase">
                  {{ pathway.category }}
                </span>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4 text-xs">
                <div>
                  <span class="text-[9.5px] text-zinc-500 font-bold block uppercase mb-1">Scientific Rationale:</span>
                  <p class="text-zinc-300 font-sans leading-relaxed">{{ pathway.description }}</p>
                </div>
                <div>
                  <span class="text-[9.5px] text-zinc-500 font-bold block uppercase mb-1">Bridging Hypothesis:</span>
                  <p class="text-zinc-300 font-sans leading-relaxed italic border-l-2 border-zinc-800 pl-3">"{{ pathway.hypothesis }}"</p>
                </div>
              </div>

              <!-- Question Probes List -->
              <div class="space-y-3 pt-3 border-t border-zinc-855">
                <span class="text-[10px] text-orange-400 font-bold uppercase block tracking-wider mb-2">Progressive Probing Questions:</span>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  @for (q of pathway.questions; track q.label; let idx = $index) {
                    <div class="p-3.5 rounded-xl bg-zinc-955 border border-zinc-850 flex flex-col justify-between">
                      <div>
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="text-[9px] text-zinc-500 font-bold uppercase">{{ q.label }} Probe</span>
                          <span class="text-[10px] text-orange-400 font-bold">#{{ idx + 1 }}</span>
                        </div>
                        <p class="text-[11.5px] text-zinc-300 font-sans leading-normal italic">
                          "{{ q.text }}"
                        </p>
                      </div>
                      <div class="pt-3 flex justify-end">
                        <button (click)="injectInquiryText(pathway.title, q.label, q.text)"
                          class="px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-400 text-zinc-955 text-[9px] font-bold uppercase transition cursor-pointer">
                          💬 Ask Patient
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

            </div>
          }
        </div>
      }

      <!-- Drill-Down Exploration Modal -->
      @if (isDrillDownOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans animate-in fade-in duration-200">
          <div class="bg-zinc-955 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 text-zinc-100 shadow-2xl font-mono">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">🔬</span>
                <h3 class="text-sm font-bold uppercase text-orange-400">Drill-Down Clinical Insight Spark Directory</h3>
              </div>
              <button (click)="isDrillDownOpen.set(false)" class="text-xs text-zinc-400 hover:text-zinc-200">✕ Close</button>
            </div>

            <div class="space-y-3 text-xs font-mono mb-4 max-h-96 overflow-y-auto pr-1">
              @for (spark of allSparks; track spark.id) {
                <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-orange-400 font-bold uppercase">{{ spark.lensCategory }}</span>
                    <span class="text-zinc-400">{{ spark.innovationBadge }}</span>
                  </div>
                  <h5 class="text-xs font-bold text-zinc-100 font-sans">{{ spark.title }}</h5>
                  <p class="text-[11px] text-zinc-300 font-sans">{{ spark.proposedTrialProtocol }}</p>
                </div>
              }
            </div>

            <button (click)="isDrillDownOpen.set(false)"
              class="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-zinc-955 font-bold uppercase text-xs rounded-xl transition border border-orange-400/50">
              Acknowledge Drill-Down Insights
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class LensInsightSparkShieldComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  activeLens = input<string>('Summary Overview');
  isDrillDownOpen = signal<boolean>(false);
  
  // Navigation View Modes
  viewMode = signal<'standard' | 'synergy' | 'lab' | 'inquiry'>('standard');

  // Custom Experiment Signals
  sourceParadigm = signal<'Western' | 'Eastern' | 'Ayurvedic'>('Western');
  targetParadigm = signal<'Western' | 'Eastern' | 'Ayurvedic'>('Eastern');
  sourceMetric = signal<string>('Vagal HRV');
  targetMetric = signal<string>('Shen Disharmony');

  westernMetrics = ['hs-CRP', 'Vagal HRV', 'ApoB/LDL', 'Biological Age Delta', 'Cortisol Curve'];
  easternMetrics = ['Tongue Coat Thickness', 'Pulse Quality (Wiry/Slippery)', 'Meridian Stagnation', 'Shen Disharmony'];
  ayurvedicMetrics = ['Agni (Digestive Fire)', 'Ama (Toxin Load)', 'Dosha Imbalance', 'Ojas (Vital Essence)'];

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Alexander Vance';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Alexander Vance';
  });

  patientCorrelationAlert = computed(() => {
    const srcM = this.sourceMetric();
    const tgtM = this.targetMetric();
    const vitals = this.patientState.vitals();
    const tcm = this.patientState.tcmIntake();
    const ayur = this.patientState.ayurvedicIntake();
    const hasIssues = Object.keys(this.patientState.issues()).length > 0;
    
    let activeAlert: string | null = null;
    let matchType: 'perfect' | 'moderate' | 'neutral' = 'neutral';

    if (srcM === 'Vagal HRV' && tgtM === 'Shen Disharmony') {
      const hr = parseInt(vitals.hr, 10) || 72;
      if (hr > 85 || tcm.pulseQuality === 'wiry' || tcm.pulseQuality === 'floating-rapid') {
        activeAlert = `🚨 Perfect Match: Patient has an active elevated heart rate of ${hr} BPM and a "${tcm.pulseQuality}" pulse, confirming acute sympathetic stress (low HRV) and Shen agitation.`;
        matchType = 'perfect';
      } else {
        activeAlert = `💡 Moderate Correlation: Patient resting heart rate is ${hr} BPM with a "${tcm.pulseQuality}" pulse. High vagal tone exercises are suggested.`;
        matchType = 'moderate';
      }
    } else if (srcM === 'hs-CRP' && tgtM === 'Meridian Stagnation') {
      if (hasIssues || tcm.pulseQuality === 'wiry') {
        activeAlert = `🚨 Perfect Match: Active musculoskeletal pain issues and a "${tcm.pulseQuality}" pulse (associated with pain/stagnation) are on the chart, indicating active meridian blockage.`;
        matchType = 'perfect';
      } else {
        activeAlert = `💡 Moderate Correlation: Standard meridian circulation monitoring recommended. No active localized severe pain issues flagged.`;
        matchType = 'moderate';
      }
    } else if (srcM === 'Cortisol Curve' && tgtM === 'Agni (Digestive Fire)') {
      const ama = ayur.amaScore ?? 0;
      if (ayur.agniType === 'mandagni' || ama > 3) {
        activeAlert = `🚨 Perfect Match: Patient has active Mandagni (sluggish digestive fire) and an Ama toxicity score of ${ama}/10, indicating chronotherapy is highly indicated to prevent metabolic stagnation.`;
        matchType = 'perfect';
      } else {
        activeAlert = `💡 Moderate Correlation: Patient has "${ayur.agniType}" digestive fire. Monitoring post-meal sleepiness or fatigue is advised.`;
        matchType = 'moderate';
      }
    } else if (srcM === 'Biological Age Delta' && tgtM === 'Ojas (Vital Essence)') {
      const ama = ayur.amaScore ?? 0;
      if (ama > 4 || ayur.ashtavidhaStatus?.toLowerCase().includes('deficient') || hasIssues) {
        activeAlert = `🚨 Perfect Match: Patient displays signs of systemic depletion (Ojas deficiency) with Ama score of ${ama}/10, suggesting adaptogenic Rasayana therapies to reduce accelerated cellular aging.`;
        matchType = 'perfect';
      } else {
        activeAlert = `💡 Moderate Correlation: Preventative longevity protocols and antioxidant Rasayana tonics recommended to maintain cellular Ojas.`;
        matchType = 'moderate';
      }
    }

    return activeAlert ? { text: activeAlert, type: matchType } : null;
  });

  allSparks: IInsightSpark[] = [
    {
      id: 'sp1',
      lensCategory: 'Functional Protocols',
      title: '0.1 Hz Resonant Breathing & Leukocyte Telomere Epigenetics',
      hypothesis: '12 weeks of 0.1 Hz vagal resonant breathing reduces leukocyte DNA methylation age (Horvath Clock) via HPA axis cortisol dampening.',
      keyBiomarkers: ['Horvath mDNA Age', 'Baroreflex Sensitivity', 'Salivary Cortisol AUC'],
      proposedTrialProtocol: 'N=60 randomized clinical trial evaluating daily 15-min 0.1 Hz AVS breathing vs sham controls over 90 days.',
      pubmedSearchQuery: 'vagus nerve stimulation telomere length epigenetics',
      innovationBadge: 'Epigenetic Clock Trial'
    },
    {
      id: 'sp2',
      lensCategory: 'Nutrition',
      title: 'Circadian Chrono-Nutrition & GLUT4 Hepatic Clearance',
      hypothesis: 'Restricting macronutrient intake to individual BMAL1 peak expression window enhances postprandial glucose clearance by 42%.',
      keyBiomarkers: ['BMAL1/CLOCK mRNA', 'Continuous Glucose AUC', 'HOMA-IR'],
      proposedTrialProtocol: 'Cross-over trial matching meal timing with salivary melatonin onset window.',
      pubmedSearchQuery: 'BMAL1 clock gene chrono-nutrition glucose clearance',
      innovationBadge: 'Circadian Metabolic Spark'
    },
    {
      id: 'sp3',
      lensCategory: 'Precision Nutrients',
      title: 'Anthocyanin Glymphatic Amyloid Clearance',
      hypothesis: 'Natural Beetroot & Hibiscus Anthocyanins combined with 40 Hz Gamma entrainment accelerate parenchymal glymphatic waste clearance.',
      keyBiomarkers: ['CSF Amyloid-Beta 42', 'Tau Phosphorylation', 'Glymphatic MRI Flow'],
      proposedTrialProtocol: 'Pilot human imaging study tracking glymphatic tracer transit post-AVS gamma entrainment.',
      pubmedSearchQuery: 'anthocyanin gamma entrainment glymphatic clearance',
      innovationBadge: 'Glymphatic Clearance'
    }
  ];

  synergySparks: ISynergySpark[] = [
    {
      id: 'syn1',
      fromParadigm: 'Western Allopathic',
      toParadigm: 'TCM Qi Harmony',
      title: 'Inflammatory hs-CRP to Liver Qi Heat Bridge',
      translationalBridge: 'Elevated Western high-sensitivity CRP (chronic inflammation) correlates closely to Eastern stagnant Liver Qi transforming into Heat.',
      targetDatapoint: 'hs-CRP (> 3.0 mg/L) & Tongue Redness / Bitter Taste',
      question: 'Are you experiencing a bitter taste in the mouth, rib-side tightness, or anger/irritability, which may indicate liver heat related to the elevated CRP?'
    },
    {
      id: 'syn2',
      fromParadigm: 'TCM Pulse Diagnostics',
      toParadigm: 'Western Vagal HRV',
      title: 'Yin Deficiency Rapid Pulse to Low HRV Bridge',
      translationalBridge: 'A TCM thin, rapid pulse represents Yin deficiency (loss of moistening/cooling), which maps physiologically to sympathetic overdrive and low heart rate variability.',
      targetDatapoint: 'Resting Heart Rate (> 80 bpm), Low SDNN/RMSSD HRV, Dry Cough / Night Sweats',
      question: 'Do you experience night sweats, hot flashes, or dry throat/throat clearing, which suggest Yin deficiency contributing to your sympathetic dominance?'
    },
    {
      id: 'syn3',
      fromParadigm: 'Ayurvedic Tridosha',
      toParadigm: 'Western Chrono-Nutrition',
      title: 'Mandagni (Sluggish Agni) to Circadian GLUT4 Bridge',
      translationalBridge: 'Sluggish Ayurvedic Agni (digestive fire) aligns with decreased insulin sensitivity and GLUT4 expression in the late evening, making late-night meals metabolically disruptive.',
      targetDatapoint: 'Postprandial Blood Glucose Delta & Late Evening Melatonin Onset',
      question: 'Does bloating or brain fog worsen if you eat after 7:00 PM? This suggests Mandagni (low digestive fire) coinciding with reduced late-day glucose clearance.'
    },
    {
      id: 'syn4',
      fromParadigm: 'Western Epigenetics',
      toParadigm: 'Ayurvedic Rasayana',
      title: 'DNA Methylation (Biological Age) to Ojas Revitalization Bridge',
      translationalBridge: 'Accelerated epigenetic aging (Horvath Clock) can be offset by Ayurvedic adaptogenic Rasayana botanicals (e.g., Ashwagandha) that reduce HPA axis cortisol damage and replenish cellular Ojas (vital essence).',
      targetDatapoint: 'Salivary Cortisol AUC, DNA Methylation Delta, Muscle Vigor',
      question: 'Are you experiencing deep depletion or lack of vital energy (low Ojas)? We can explore introducing adaptogenic Rasayana herbs to reduce cortisol-driven biological aging.'
    }
  ];

  presets = [
    {
      name: 'Vagal-Shen Autonomic Presets',
      srcP: 'Western' as const,
      tgtP: 'Eastern' as const,
      srcM: 'Vagal HRV',
      tgtM: 'Shen Disharmony'
    },
    {
      name: 'CRP-Stagnation Presets',
      srcP: 'Western' as const,
      tgtP: 'Eastern' as const,
      srcM: 'hs-CRP',
      tgtM: 'Meridian Stagnation'
    },
    {
      name: 'Cortisol-Agni Presets',
      srcP: 'Western' as const,
      tgtP: 'Ayurvedic' as const,
      srcM: 'Cortisol Curve',
      tgtM: 'Agni (Digestive Fire)'
    },
    {
      name: 'Age-Ojas Epigenetics',
      srcP: 'Western' as const,
      tgtP: 'Ayurvedic' as const,
      srcM: 'Biological Age Delta',
      tgtM: 'Ojas (Vital Essence)'
    }
  ];

  inquisitivePathways = [
    {
      id: 'path-vagus',
      title: 'The Vagus-Shen Neuro-Cardiology Pathway',
      category: 'Autonomic / Cardiopulmonary',
      description: 'Investigates the intersection between vagal parasympathetic innervation (measured by Heart Rate Variability) and the TCM heart-mind system (Shen/Spirit). High vagal tone acts as a cooling brake on HPA hyper-arousal, allowing the Shen to rest.',
      hypothesis: 'Targeted slow resonant exhalations (increasing vagal efferent activity) act as a physiological anchor to quiet cerebral hyper-perfusion and soothe agitated Shen.',
      questions: [
        { label: 'Baseline', text: 'When you try to focus or relax, do you experience a racing mind or physical restlessness in the chest, even when resting?' },
        { label: 'Stress-State', text: 'During moments of sudden stress, do you feel an immediate rapid pulse accompanied by a feeling of mental scattering or loss of control?' },
        { label: 'Recovery', text: 'If you take slow, deep breaths with prolonged exhalations, does that chest tightness and racing thoughts settle down within a few minutes?' }
      ]
    },
    {
      id: 'path-cytokine',
      title: 'The Cytokine-Stagnation Micro-Vascular Pathway',
      category: 'Immunology / Circulation',
      description: 'Bridges chronic vascular micro-inflammation (driven by hs-CRP and TNF-alpha) to the traditional Chinese concept of Meridian Qi & Blood Stagnation. Localized cytokine accumulation induces micro-ischemia, manifesting as chronic fixed pain.',
      hypothesis: 'Upregulating systemic circulation through phytochemical nitric oxide donors (e.g. beetroot nitrates) resolves capillary stagnation and reduces localized tissue pressure pain.',
      questions: [
        { label: 'Baseline', text: 'Do you have areas of fixed, stabbing physical pain or stiffness that feel worse first thing in the morning or when remaining still?' },
        { label: 'Stress-State', text: 'Does this specific physical pain intensify during high-stress periods, and is it accompanied by coldness in your hands or feet?' },
        { label: 'Recovery', text: 'Does gentle movement, warmth, or targeted pressure/massage provide significant relief to that stubborn stiffness?' }
      ]
    },
    {
      id: 'path-hpa',
      title: 'The HPA-Agni Chrono-Metabolic Pathway',
      category: 'Endocrine / Gastrointestinal',
      description: 'Correlates the diurnal cortisol circadian curve with Ayurvedic Agni (digestive fire). Dysregulated morning cortisol rises or late-night spikes disrupt gastrointestinal motility and reduce gastric acid secretion, leading to Ama accumulation.',
      hypothesis: 'Aligning meals with peak metabolic cortisol windows prevents the accumulation of undigested toxins (Ama) and optimizes glycemic profiles.',
      questions: [
        { label: 'Baseline', text: 'Do you experience a heavy, sluggish feeling, bloating, or deep fatigue in the hours immediately following a normal meal?' },
        { label: 'Stress-State', text: 'If you eat when you are busy, anxious, or late in the evening, do you notice that your stomach feels completely locked up or fails to digest properly?' },
        { label: 'Recovery', text: 'Does eating your largest meal at midday (when digestion is traditionally strongest) improve your energy levels and eliminate bloating?' }
      ]
    },
    {
      id: 'path-epigenetic',
      title: 'The Epigenetic-Ojas Longevity Pathway',
      category: 'Epigenetics / Cellular Vitality',
      description: 'Connects DNA methylation drift (biological age acceleration) to the depletion of Ayurvedic Ojas (vital essence/immune reserve). Stress-induced cortisol spikes accelerate biological cell aging, depleting the body\'s baseline resilience.',
      hypothesis: 'Using adaptogenic Rasayana botanicals supports systemic HPA axis regulation, preventing stress-driven biological aging and preserving cellular Ojas.',
      questions: [
        { label: 'Baseline', text: 'Do you feel a deep, constitutional exhaustion that persists even after getting a full night of sleep?' },
        { label: 'Stress-State', text: 'How long does it take you to bounce back physically and mentally after a minor illness, strenuous workout, or busy week?' },
        { label: 'Recovery', text: 'When you take adaptogens or rest completely, do you feel your baseline immunity, skin luster, and physical endurance returning?' }
      ]
    }
  ];

  constructor() {
    effect(() => {
      // Whenever source or target metric changes in the lab, highlight the appropriate 3D node
      if (this.viewMode() === 'lab') {
        const srcM = this.sourceMetric();
        const tgtM = this.targetMetric();
        const srcP = this.sourceParadigm();
        const tgtP = this.targetParadigm();
        
        let nodeId: string | null = null;
        if (srcM === 'Vagal HRV' || tgtM === 'Shen Disharmony') {
          nodeId = this.targetParadigm() === 'Ayurvedic' ? 'chakra_anahata' : 'acupoint_cv17';
        } else if (srcM === 'hs-CRP' || tgtM === 'Meridian Stagnation') {
          nodeId = 'acupoint_li4_r';
        } else if (srcM === 'Cortisol Curve' || tgtM === 'Agni (Digestive Fire)') {
          nodeId = this.targetParadigm() === 'Ayurvedic' ? 'chakra_manipura' : 'stomach';
        } else if (srcM === 'Biological Age Delta' || tgtM === 'Ojas (Vital Essence)') {
          nodeId = this.targetParadigm() === 'Ayurvedic' ? 'chakra_sahasrara' : 'brain';
        }

        if (nodeId) {
          this.patientState.selectedPartId.set(nodeId);
        }

        // Automate view mode based on paradigm selection
        if (srcP === 'Eastern' || tgtP === 'Eastern') {
          this.patientState.anatomyViewMode.set('eastern');
        } else if (srcP === 'Ayurvedic' || tgtP === 'Ayurvedic') {
          this.patientState.anatomyViewMode.set('ayurvedic');
        } else {
          this.patientState.anatomyViewMode.set('organs');
        }
      }
    });
  }

  generatedExperiment = computed<ICustomExperiment>(() => {
    const srcP = this.sourceParadigm();
    const tgtP = this.targetParadigm();
    const srcM = this.sourceMetric();
    const tgtM = this.targetMetric();
    
    return this.createSynergyExperiment(srcP, tgtP, srcM, tgtM);
  });

  getMetricsForParadigm(p: 'Western' | 'Eastern' | 'Ayurvedic'): string[] {
    if (p === 'Western') return this.westernMetrics;
    if (p === 'Eastern') return this.easternMetrics;
    return this.ayurvedicMetrics;
  }

  setSourceParadigm(p: string) {
    const val = p as 'Western' | 'Eastern' | 'Ayurvedic';
    this.sourceParadigm.set(val);
    this.sourceMetric.set(this.getMetricsForParadigm(val)[0]);
  }

  setTargetParadigm(p: string) {
    const val = p as 'Western' | 'Eastern' | 'Ayurvedic';
    this.targetParadigm.set(val);
    this.targetMetric.set(this.getMetricsForParadigm(val)[0]);
  }

  loadPreset(preset: typeof this.presets[0]) {
    this.sourceParadigm.set(preset.srcP);
    this.targetParadigm.set(preset.tgtP);
    this.sourceMetric.set(preset.srcM);
    this.targetMetric.set(preset.tgtM);
  }

  createSynergyExperiment(srcP: string, tgtP: string, srcM: string, tgtM: string): ICustomExperiment {
    let title = `${srcM} to ${tgtM} Synergy Bridge`;
    let hypothesis = `Modulating ${srcM} (${srcP}) leads to a direct stabilization or improvement in ${tgtM} (${tgtP}) through neuro-endocrine and autonomic feedback pathways.`;
    let protocol = `A 60-day clinical protocol monitoring daily ${srcM} variations, incorporating tailored breathing/dietary adjustments, and assessing weekly ${tgtM} scores.`;
    let question = `How does your experience of ${tgtM} fluctuate when your ${srcM} values show signs of acute change?`;

    if (srcM === 'Vagal HRV' && tgtM === 'Shen Disharmony') {
      title = 'Autonomic HRV to Shen Spirit Stability Bridge';
      hypothesis = 'Upregulating Vagal Heart Rate Variability (HRV) through 0.1 Hz breathing directly pacifies agitated Shen (mind/spirit) by reducing sympathetic hyper-arousal.';
      protocol = 'N=30 cross-over trial measuring real-time vagal tone via wrist bio-sensing while tracking self-reported Shen disturbance, sleep quality, and anxiety markers over 4 weeks.';
      question = 'When you practice slow, structured breathing and your HRV stabilizes, do you notice a decrease in mental scattering or restlessness (Shen agitation)?';
    } else if (srcM === 'hs-CRP' && tgtM === 'Meridian Stagnation') {
      title = 'Microvascular hs-CRP to Qi & Blood Stagnation Bridge';
      hypothesis = 'Systemic micro-inflammatory state (hs-CRP > 3.0 mg/L) induces endothelial friction, manifesting as localized pain and classic Meridian Qi & Blood Stagnation.';
      protocol = 'Interventional pilot comparing anti-inflammatory nutrition (anthocyanins) paired with target meridian massage vs control, tracking plasma hs-CRP and pressure-pain thresholds.';
      question = 'Does your physical stiffness or muscle pain worsen during periods of high stress, indicating micro-inflammation corresponding to meridian blockages?';
    } else if (srcM === 'Cortisol Curve' && tgtM === 'Agni (Digestive Fire)') {
      title = 'HPA Axis Cortisol to Agni Digestive Fire Bridge';
      hypothesis = 'Flattened diurnal cortisol curves (HPA depletion) suppress splanchnic circulation, leading to sluggish digestive Agni (Mandagni) and chronic indigestion.';
      protocol = 'Daily saliva cortisol sampling mapping Agni stability metrics post-adaptation therapy (standardized Ashwagandha protocol) over 45 days.';
      question = 'Do you feel heavy or bloated after eating when you are under chronic fatigue? This shows stress hormones suppressing your Agni digestive fire.';
    } else if (srcM === 'Biological Age Delta' && tgtM === 'Ojas (Vital Essence)') {
      title = 'Epigenetic Horvath Ageing to Cellular Ojas Bridge';
      hypothesis = 'Accelerated biological aging is a cellular manifestation of Ojas depletion. Restoring Ojas through Rasayana adaptogens halts epigenetic methylation drift.';
      protocol = 'Randomized double-blind study tracking Horvath clock epigenetic age delta before and after 90 days of standardized adaptogenic Ojas tonics.';
      question = 'Are you feeling chronically depleted of core vitality (low Ojas)? We can explore whether adaptogenic rejuvenation therapies can help reverse biological cell aging.';
    }

    return { title, hypothesis, protocol, question };
  }

  activeSparks = computed(() => {
    const currentLens = this.activeLens();
    const filtered = this.allSparks.filter(s => s.lensCategory === currentLens);
    return filtered.length > 0 ? filtered : this.allSparks.slice(0, 2);
  });

  getLensIcon(lens: string): string {
    switch (lens) {
      case 'Summary Overview': return '📋';
      case 'Functional Protocols': return '🧠';
      case 'Nutrition': return '🥗';
      case 'Monitoring & Follow-up': return '📈';
      case 'Patient Education': return '🎓';
      case 'Precision Nutrients': return '💊';
      default: return '🛡️';
    }
  }

  getLensShieldSummary(lens: string): string {
    switch (lens) {
      case 'Summary Overview':
        return 'Multi-system baseline shield: Synthesizes cardiometabolic risk, vagal tone, and multi-paradigm diagnoses into high-priority clinical actions.';
      case 'Functional Protocols':
        return 'Neurological & autonomic shield: Deploys 0.1 Hz vagal resonant breathing, AVS brainwave entrainment, and HPA axis cortisol dampening.';
      case 'Nutrition':
        return 'Metabolic & chrono-nutrition shield: Aligns macronutrient timing with BMAL1 circadian clock gene expression to optimize postprandial glucose clearance.';
      case 'Monitoring & Follow-up':
        return 'Biomarker tracking shield: Monitors high-sensitivity CRP, ApoB, continuous glucose, and biological age delta metrics over time.';
      case 'Patient Education':
        return 'Empowerment & health literacy shield: Translates complex clinical findings into accessible 3-Act patient stories and actionable habits.';
      case 'Precision Nutrients':
        return 'Phytochemical & epigenetic shield: Utilizes targeted nootropics, anthocyanins, and methyl donors to support cellular detoxification and DNA repair.';
      default:
        return 'Active multi-paradigm healthspan protection engaged.';
    }
  }

  launchPubMedSearch(spark: IInsightSpark) {
    const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(spark.pubmedSearchQuery)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  bookmarkSpark(spark: IInsightSpark) {
    this.patientState.addClinicalNote({
      id: `spark-log-${Date.now()}`,
      text: `🔬 Logged Translational Research Hypothesis: ${spark.title} (${spark.innovationBadge}). Trial Protocol: ${spark.proposedTrialProtocol}`,
      sourceLens: spark.lensCategory,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`📌 Research Hypothesis Logged to Patient Record:\n${spark.title}`);
  }

  injectSynergyQuestion(spark: ISynergySpark) {
    this.patientState.isLiveAgentActive.set(true); // Ensure agent panel is active
    setTimeout(() => {
      this.patientState.liveAgentInput.set(
        `Regarding the Cross-Paradigm Bridge "${spark.title}":\n\nBridge Concept: ${spark.translationalBridge}\n\nClinical Inquiry to Explore: "${spark.question}"`
      );
      const input = document.querySelector<HTMLTextAreaElement>('#chatInput');
      input?.focus();
    }, 100);
  }

  injectCustomExperiment(exp: ICustomExperiment) {
    this.patientState.isLiveAgentActive.set(true); // Ensure agent panel is active
    setTimeout(() => {
      this.patientState.liveAgentInput.set(
        `Regarding the custom Trial Design "${exp.title}":\n\nHypothesis: ${exp.hypothesis}\n\nProtocol: ${exp.protocol}\n\nClinical Inquiry to Explore: "${exp.question}"`
      );
      const input = document.querySelector<HTMLTextAreaElement>('#chatInput');
      input?.focus();
    }, 100);
  }

  injectInquiryText(pathwayTitle: string, label: string, text: string) {
    this.patientState.isLiveAgentActive.set(true); // Ensure agent panel is active
    setTimeout(() => {
      this.patientState.liveAgentInput.set(
        `Regarding the clinical pathway "${pathwayTitle}" (${label} Probe):\n\nQuestion for patient: "${text}"`
      );
      const input = document.querySelector<HTMLTextAreaElement>('#chatInput');
      input?.focus();
    }, 100);
  }

  logCustomExperiment(exp: ICustomExperiment) {
    this.patientState.addClinicalNote({
      id: `exp-log-${Date.now()}`,
      text: `🔬 Logged Paradigm Bridge Experiment: ${exp.title}. Hypothesis: ${exp.hypothesis} Protocol: ${exp.protocol}`,
      sourceLens: 'Summary Overview',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`💾 Custom Study Protocol logged to patient chart:\n${exp.title}`);
  }
}
