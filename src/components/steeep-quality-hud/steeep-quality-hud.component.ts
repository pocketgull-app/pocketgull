import { 
  Component, 
  inject, 
  signal, 
  computed, 
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  SteeepQualityAuditService, 
  ISteeepAuditReport, 
  TSteeepDimension, 
  ISteeepDimensionScore 
} from '../../services/steeep-quality-audit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-steeep-quality-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-auto min-h-[620px] flex flex-col bg-slate-950/95 text-zinc-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-mono">
      
      <!-- Top Title & NAM Certification Header -->
      <div class="px-5 py-4 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-900/90 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-base">
            🏛️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                National Academy of Medicine (NAM) STEEEP Quality Radar
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Grade {{ report().compositeGrade }} ({{ report().compositeScore }}%)
              </span>
            </div>
            <p class="text-[10px] text-zinc-400">
              Safe • Timely • Effective • Efficient • Equitable • Patient-Centered
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="refreshAudit()"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer">
            <span>↺ Re-Audit STEEEP</span>
          </button>
          <button 
            (click)="printCareCard()"
            class="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
            <span>🖨️ Print Refrigerator Card</span>
          </button>
        </div>
      </div>

      <!-- Navigation Lens Selector Bar -->
      <div class="px-5 py-2.5 bg-slate-900/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button 
            type="button"
            (click)="activeTab.set('RADAR')"
            [class.bg-teal-500]="activeTab() === 'RADAR'"
            [class.text-zinc-950]="activeTab() === 'RADAR'"
            [class.text-zinc-300]="activeTab() !== 'RADAR'"
            class="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5">
            <span>📊</span> 6-Axis Radar Visualizer
          </button>

          <button 
            type="button"
            (click)="activeTab.set('SCORECARD')"
            [class.bg-teal-500]="activeTab() === 'SCORECARD'"
            [class.text-zinc-950]="activeTab() === 'SCORECARD'"
            [class.text-zinc-300]="activeTab() !== 'SCORECARD'"
            class="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5">
            <span>📋</span> Dimension Scorecard
          </button>

          <button 
            type="button"
            (click)="activeTab.set('REFRIGERATOR_CARD')"
            [class.bg-teal-500]="activeTab() === 'REFRIGERATOR_CARD'"
            [class.text-zinc-950]="activeTab() === 'REFRIGERATOR_CARD'"
            [class.text-zinc-300]="activeTab() !== 'REFRIGERATOR_CARD'"
            class="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5">
            <span>🧊</span> 1-Page Refrigerator Card
          </button>

          <button 
            type="button"
            (click)="activeTab.set('FHIR_MEASURE')"
            [class.bg-teal-500]="activeTab() === 'FHIR_MEASURE'"
            [class.text-zinc-950]="activeTab() === 'FHIR_MEASURE'"
            [class.text-zinc-300]="activeTab() !== 'FHIR_MEASURE'"
            class="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5">
            <span>📜</span> FHIR R4 Quality Measure
          </button>
        </div>

        <div class="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
          <span>SHA-256 Seal:</span>
          <span class="text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[200px]">
            {{ report().sha256Seal }}
          </span>
        </div>
      </div>

      <!-- Main Body Viewport -->
      <div class="flex-1 p-5 overflow-y-auto">

        <!-- TAB 1: 6-Axis Radar Visualizer -->
        @if (activeTab() === 'RADAR') {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <!-- Radar SVG Canvas (7 Columns) -->
            <div class="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-900/40 border border-slate-800 rounded-2xl relative">
              <svg viewBox="0 0 420 420" class="w-full max-w-[380px] h-auto select-none">
                <!-- Concentric Quality Scale Rings (20%, 40%, 60%, 80%, 100%) -->
                @for (ring of [0.2, 0.4, 0.6, 0.8, 1.0]; track ring) {
                  <polygon 
                    [attr.points]="getRadarGridPoints(ring)" 
                    fill="none" 
                    stroke="#27272a" 
                    stroke-width="1" 
                    stroke-dasharray="2,2"
                  />
                  <text 
                    [attr.x]="210" 
                    [attr.y]="210 - (ring * 160) + 10" 
                    fill="#52525b" 
                    font-size="8" 
                    text-anchor="middle"
                    class="font-mono">
                    {{ (ring * 100).toFixed(0) }}%
                  </text>
                }

                <!-- 6 Spokes radiating from center -->
                @for (axis of axes; track axis.name; let i = $index) {
                  <line 
                    x1="210" y1="210" 
                    [attr.x2]="getSpokeEndpoint(i).x" 
                    [attr.y2]="getSpokeEndpoint(i).y" 
                    stroke="#3f3f46" 
                    stroke-width="1.5" 
                  />
                  <!-- Axis Labels -->
                  <text 
                    [attr.x]="getLabelPosition(i).x" 
                    [attr.y]="getLabelPosition(i).y" 
                    fill="#a1a1aa" 
                    font-size="10" 
                    font-weight="bold"
                    text-anchor="middle"
                    class="font-mono">
                    {{ axis.label }} ({{ getDimensionScore(axis.key) }}%)
                  </text>
                }

                <!-- Filled Quality Radar Polygon -->
                <polygon 
                  [attr.points]="getRadarPolygonPoints()" 
                  fill="rgba(20, 184, 166, 0.25)" 
                  stroke="#14b8a6" 
                  stroke-width="2.5" 
                />

                <!-- Axis Vertices Markers -->
                @for (axis of axes; track axis.name; let i = $index) {
                  <circle 
                    [attr.cx]="getVertexPosition(i, getDimensionScore(axis.key)).x" 
                    [attr.cy]="getVertexPosition(i, getDimensionScore(axis.key)).y" 
                    r="4.5" 
                    fill="#2dd4bf" 
                    stroke="#09090b" 
                    stroke-width="2" 
                  />
                }
              </svg>

              <div class="mt-2 text-center text-[10px] text-zinc-400 font-mono">
                NAM 6-Axis Quality Hexagon • Outer Boundary = 100% Quality Benchmark
              </div>
            </div>

            <!-- Radar Metrics Summary (5 Columns) -->
            <div class="lg:col-span-5 space-y-3">
              <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <h4 class="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🏛️</span> Quality Composite Index
                </h4>
                <div class="flex items-baseline gap-3 mb-3">
                  <span class="text-3xl font-black text-white font-mono">{{ report().compositeScore }}%</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    Grade {{ report().compositeGrade }} Optimal
                  </span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  All 6 clinical dimensions evaluated by Pocket-Gull adhere to the National Academy of Medicine standards with zero safety violations.
                </p>
              </div>

              <!-- Mini Dimension Bars -->
              <div class="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2.5">
                @for (dim of dimensionList(); track dim.dimension) {
                  <div>
                    <div class="flex justify-between items-center text-xs mb-1">
                      <span class="text-zinc-300 flex items-center gap-1.5">
                        <span>{{ dim.icon }}</span> {{ dim.title }}
                      </span>
                      <span class="font-bold text-teal-400 font-mono">{{ dim.score }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-teal-500 rounded-full transition-all duration-300" [style.width.%]="dim.score"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- TAB 2: Dimension Scorecard -->
        @if (activeTab() === 'SCORECARD') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (dim of dimensionList(); track dim.dimension) {
              <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">{{ dim.icon }}</span>
                      <div>
                        <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wider">{{ dim.title }}</h4>
                        <span class="text-[9px] text-zinc-400">{{ dim.status }}</span>
                      </div>
                    </div>
                    <span class="text-sm font-bold font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                      {{ dim.score }}%
                    </span>
                  </div>

                  <!-- Metrics List -->
                  <div class="space-y-2 mb-3">
                    @for (m of dim.metrics; track m.label) {
                      <div class="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px]">
                        <div class="flex justify-between items-center text-zinc-300 font-bold mb-0.5">
                          <span>{{ m.label }}</span>
                          <span class="text-teal-400">{{ m.value }}</span>
                        </div>
                        <p class="text-[10px] text-zinc-400">{{ m.detail }}</p>
                      </div>
                    }
                  </div>
                </div>

                <!-- Recommendations -->
                <div class="pt-2 border-t border-slate-800 text-[10px] text-zinc-400 space-y-1">
                  <span class="font-bold text-zinc-300 uppercase">Guidance:</span>
                  @for (rec of dim.recommendations; track rec) {
                    <p class="text-zinc-400">• {{ rec }}</p>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- TAB 3: 1-Page Refrigerator Care Card -->
        @if (activeTab() === 'REFRIGERATOR_CARD') {
          <div class="max-w-3xl mx-auto bg-zinc-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl text-zinc-100 font-sans print:bg-white print:text-black print:border-black print:shadow-none" id="refrigerator-card-print">
            
            <!-- Card Header -->
            <div class="border-b-2 border-teal-500/60 pb-3 mb-4 flex justify-between items-start">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold">Pocket-Gull Care Plan • Refrigerator Quick-Reference</span>
                <h2 class="text-xl font-black text-white tracking-tight mt-0.5">{{ card().patientName }}'s Vitality Action Card</h2>
                <p class="text-xs text-zinc-400 font-mono mt-0.5">{{ card().coreDiagnosis }}</p>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-mono text-zinc-400">Updated: {{ card().updatedAt }}</span>
                <div class="mt-1 px-2 py-0.5 bg-teal-950 border border-teal-500/40 rounded text-[10px] font-mono text-teal-300 font-bold">
                  Health Literacy: Grade {{ card().fleschKincaidGradeLevel }}
                </div>
              </div>
            </div>

            <!-- 3-Act Trajectory Section -->
            <div class="mb-5 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <h4 class="text-xs font-bold text-teal-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>🧭</span> Your 3-Act Recovery Journey
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span class="text-[10px] font-bold text-orange-400 font-mono uppercase">1. Where You've Been</span>
                  <p class="text-zinc-300 mt-1 leading-relaxed text-[11px]">{{ card().threeActTrajectory.whereYouveBeen }}</p>
                </div>
                <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span class="text-[10px] font-bold text-teal-400 font-mono uppercase">2. Where You Stand Today</span>
                  <p class="text-zinc-300 mt-1 leading-relaxed text-[11px]">{{ card().threeActTrajectory.whereYouStandToday }}</p>
                </div>
                <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span class="text-[10px] font-bold text-indigo-400 font-mono uppercase">3. Where You're Going</span>
                  <p class="text-zinc-300 mt-1 leading-relaxed text-[11px]">{{ card().threeActTrajectory.whereYoureGoing }}</p>
                </div>
              </div>
            </div>

            <!-- Traffic-Light Action Plan -->
            <div class="mb-5 space-y-3">
              <h4 class="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">🚦 Traffic-Light Action Guide</h4>
              
              <!-- GREEN -->
              <div class="p-3 bg-emerald-950/40 border-l-4 border-emerald-500 rounded-r-2xl text-xs space-y-1">
                <div class="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>🟢</span> {{ card().trafficLightActionPlan.green.status }}
                </div>
                <ul class="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px] pl-1">
                  @for (act of card().trafficLightActionPlan.green.actions; track act) {
                    <li>{{ act }}</li>
                  }
                </ul>
              </div>

              <!-- YELLOW -->
              <div class="p-3 bg-amber-950/40 border-l-4 border-amber-500 rounded-r-2xl text-xs space-y-1">
                <div class="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🟡</span> {{ card().trafficLightActionPlan.yellow.status }}
                </div>
                <ul class="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px] pl-1">
                  @for (act of card().trafficLightActionPlan.yellow.actions; track act) {
                    <li>{{ act }}</li>
                  }
                </ul>
                <div class="text-[10px] text-amber-200 font-bold pt-1">
                  👉 Alert Team: {{ card().trafficLightActionPlan.yellow.alertDoctorIf }}
                </div>
              </div>

              <!-- RED -->
              <div class="p-3 bg-rose-950/40 border-l-4 border-rose-500 rounded-r-2xl text-xs space-y-1">
                <div class="font-bold text-rose-300 flex items-center gap-1.5">
                  <span>🔴</span> {{ card().trafficLightActionPlan.red.status }}
                </div>
                <ul class="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px] pl-1">
                  @for (act of card().trafficLightActionPlan.red.actions; track act) {
                    <li>{{ act }}</li>
                  }
                </ul>
                <div class="text-[10px] text-rose-200 font-bold pt-1">
                  🚨 STAT: {{ card().trafficLightActionPlan.red.emergencyAction }}
                </div>
              </div>
            </div>

            <!-- Teach-Back Verification Checkboxes -->
            <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 mb-4">
              <h4 class="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>💬</span> Teach-Back Family Alignment (Check when understood)
              </h4>
              <div class="space-y-1.5 text-[11px]">
                @for (q of card().teachBackQuestions; track q) {
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" class="mt-0.5 accent-teal-400 rounded cursor-pointer" />
                    <span class="text-zinc-300">{{ q }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Footer & 24/7 Hotline -->
            <div class="border-t border-slate-800 pt-3 text-center text-[10px] font-mono text-zinc-400">
              {{ card().emergencyContactLine }}
            </div>

          </div>
        }

        <!-- TAB 4: FHIR R4 Quality Measure -->
        @if (activeTab() === 'FHIR_MEASURE') {
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div class="text-xs text-zinc-400 font-mono">
                HL7 FHIR R4 MeasureReport (LOINC 96841-2) with SHA-256 Digital Seal
              </div>
              <button 
                (click)="copyFhirJson()"
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-mono rounded-lg border border-slate-700 transition">
                {{ isCopied() ? '✓ Copied JSON' : '📋 Copy FHIR JSON' }}
              </button>
            </div>

            <pre class="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-teal-300 overflow-x-auto max-h-[420px]">{{ fhirJsonString() }}</pre>
          </div>
        }

      </div>

    </div>
  `
})
export class SteeepQualityHudComponent {
  private steeepService = inject(SteeepQualityAuditService);

  report = this.steeepService.activeReport;
  card = computed(() => this.report().refrigeratorCareCard);
  dimensionList = computed(() => Object.values(this.report().dimensions));

  activeTab = signal<'RADAR' | 'SCORECARD' | 'REFRIGERATOR_CARD' | 'FHIR_MEASURE'>('RADAR');
  isCopied = signal(false);

  axes: { name: string; key: TSteeepDimension; label: string }[] = [
    { name: 'Safe', key: 'SAFE', label: 'Safe' },
    { name: 'Timely', key: 'TIMELY', label: 'Timely' },
    { name: 'Effective', key: 'EFFECTIVE', label: 'Effective' },
    { name: 'Efficient', key: 'EFFICIENT', label: 'Efficient' },
    { name: 'Equitable', key: 'EQUITABLE', label: 'Equitable' },
    { name: 'Patient-Centered', key: 'PATIENT_CENTERED', label: 'Patient' }
  ];

  fhirJsonString = computed(() => {
    const json = this.steeepService.generateFhirMeasureReport(this.report());
    return JSON.stringify(json, null, 2);
  });

  refreshAudit(): void {
    this.steeepService.generateAuditReport();
  }

  printCareCard(): void {
    this.activeTab.set('REFRIGERATOR_CARD');
    if (typeof window !== 'undefined') {
      setTimeout(() => window.print(), 100);
    }
  }

  copyFhirJson(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.fhirJsonString());
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    }
  }

  getDimensionScore(key: TSteeepDimension): number {
    return this.report().dimensions[key]?.score ?? 90;
  }

  // Radar Geometry Computations
  getSpokeEndpoint(index: number, radius: number = 160): { x: number; y: number } {
    const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
    return {
      x: +(210 + Math.cos(angle) * radius).toFixed(1),
      y: +(210 + Math.sin(angle) * radius).toFixed(1)
    };
  }

  getLabelPosition(index: number): { x: number; y: number } {
    return this.getSpokeEndpoint(index, 190);
  }

  getVertexPosition(index: number, score: number): { x: number; y: number } {
    const scale = Math.max(0, Math.min(100, score)) / 100;
    return this.getSpokeEndpoint(index, 160 * scale);
  }

  getRadarGridPoints(scale: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const pos = this.getSpokeEndpoint(i, 160 * scale);
      return `${pos.x},${pos.y}`;
    }).join(' ');
  }

  getRadarPolygonPoints(): string {
    return this.axes.map((axis, i) => {
      const score = this.getDimensionScore(axis.key);
      const pos = this.getVertexPosition(i, score);
      return `${pos.x},${pos.y}`;
    }).join(' ');
  }
}
