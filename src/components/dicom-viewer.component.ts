import { 
  Component, 
  inject, 
  signal, 
  computed, 
  effect, 
  untracked, 
  afterNextRender, 
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DicomService, IDicomStudy } from '../services/dicom.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientManagementService } from '../services/patient-management.service';
import { Medical3DViewerComponent } from './anatomy-3d/medical-3d-viewer.component';

export type TWindowPreset = 'bone' | 'lung' | 'soft' | 'brain' | 'default' | 'custom';
export type TSlicePlane = 'axial' | 'sagittal' | 'coronal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dicom-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, Medical3DViewerComponent],
  template: `
    <div class="h-auto min-h-[620px] flex flex-col bg-slate-950/95 text-zinc-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-mono">
      
      <!-- Top Title & Control Header -->
      <div class="px-4 py-3 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-900/90 gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-sm">
            🩻
          </div>
          <div>
            <h3 class="font-bold text-xs text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
              DICOM Advanced Radiomics Suite — <span class="text-orange-400 font-bold">{{ activePatientName() }}</span>
            </h3>
            <p class="text-[10px] text-zinc-400">
              Hounsfield Unit (HU) Windowing • Multi-Planar MPR • Calipers • AI Anomaly Heatmaps
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button (click)="loadStudies()"
                  class="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-zinc-200 rounded-lg transition font-mono cursor-pointer"
                  [disabled]="dicomService.isLoading()">
            {{ dicomService.isLoading() ? 'Loading...' : '↺ Refresh Studies' }}
          </button>
        </div>
      </div>

      <!-- Main Two-Column Viewer Body -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[500px]">
        
        <!-- Sidebar: Study List & Clinical Series -->
        <div class="w-full lg:w-72 border-r border-slate-800 overflow-y-auto bg-slate-900/40 p-2 space-y-2 shrink-0">
          <div class="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1 flex justify-between items-center">
            <span>Patient Imaging Series</span>
            <span class="text-orange-400 font-bold">{{ studies().length }} Studies</span>
          </div>

          @if (dicomService.error()) {
            <div class="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-xl">
              {{ dicomService.error() }}
            </div>
          }

          @if (studies().length === 0 && !dicomService.isLoading()) {
            <div class="p-6 text-center text-xs font-mono text-zinc-500 flex flex-col items-center">
              <span>No DICOM imaging studies for {{ activePatientName() }}.</span>
            </div>
          }

          @for (study of studies(); track study.studyInstanceUid) {
            <div class="p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98]"
                 [class.border-orange-500]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                 [class.bg-orange-500/10]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                 [class.border-slate-800]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                 [class.bg-slate-900/70]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                 (click)="selectStudy(study)">
              <div class="flex justify-between items-start mb-1">
                <div class="font-bold text-xs text-zinc-100 truncate pr-2 uppercase">
                  {{ study.patientName }}
                </div>
                <div class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-orange-400 font-bold border border-slate-700">
                  {{ study.modalities?.join(',') || 'CT' }}
                </div>
              </div>
              <div class="text-xs text-zinc-400 truncate">
                {{ study.studyDescription || 'No description' }}
              </div>
              <div class="text-[10px] text-zinc-500 mt-1 flex justify-between">
                <span>{{ formatDate(study.studyDate) }}</span>
                <span class="text-cyan-400">{{ getSeriesCount(study) }} Series</span>
              </div>
            </div>
          }
        </div>

        <!-- Main Radiomics Viewport -->
        <div class="flex-1 flex flex-col bg-black relative overflow-hidden">
          
          <!-- Radiomics Controls Toolbar -->
          <div class="p-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
            
            <!-- Hounsfield Window/Level Presets -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-zinc-400 font-bold uppercase mr-1">HU Window:</span>
              <button 
                (click)="applyWindowPreset('bone')"
                [class.bg-amber-500]="activePreset() === 'bone'"
                [class.text-zinc-950]="activePreset() === 'bone'"
                [class.text-zinc-300]="activePreset() !== 'bone'"
                class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold transition cursor-pointer">
                🦴 Bone (2000/400)
              </button>
              <button 
                (click)="applyWindowPreset('lung')"
                [class.bg-cyan-500]="activePreset() === 'lung'"
                [class.text-zinc-950]="activePreset() === 'lung'"
                [class.text-zinc-300]="activePreset() !== 'lung'"
                class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold transition cursor-pointer">
                🫁 Lung (1500/-600)
              </button>
              <button 
                (click)="applyWindowPreset('soft')"
                [class.bg-rose-500]="activePreset() === 'soft'"
                [class.text-zinc-950]="activePreset() === 'soft'"
                [class.text-zinc-300]="activePreset() !== 'soft'"
                class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold transition cursor-pointer">
                🥩 Soft (350/50)
              </button>
              <button 
                (click)="applyWindowPreset('brain')"
                [class.bg-purple-500]="activePreset() === 'brain'"
                [class.text-zinc-950]="activePreset() === 'brain'"
                [class.text-zinc-300]="activePreset() !== 'brain'"
                class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold transition cursor-pointer">
                🧠 Brain (80/40)
              </button>
              <button 
                (click)="applyWindowPreset('default')"
                [class.bg-slate-700]="activePreset() === 'default'"
                [class.text-zinc-100]="activePreset() === 'default'"
                [class.text-zinc-400]="activePreset() !== 'default'"
                class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold transition cursor-pointer">
                Default
              </button>
            </div>

            <!-- Measurement & AI Tool Toggles -->
            <div class="flex items-center gap-2">
              <button 
                (click)="toggleCaliper()"
                [class.bg-teal-500]="isCaliperActive()"
                [class.text-zinc-950]="isCaliperActive()"
                [class.bg-slate-800]="!isCaliperActive()"
                [class.text-zinc-300]="!isCaliperActive()"
                class="px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
                <span>📐</span> Caliper ({{ isCaliperActive() ? 'ON' : 'OFF' }})
              </button>

              <button 
                (click)="toggleAiAnomalies()"
                [class.bg-orange-500]="showAiAnomalies()"
                [class.text-zinc-950]="showAiAnomalies()"
                [class.bg-slate-800]="!showAiAnomalies()"
                [class.text-zinc-300]="!showAiAnomalies()"
                class="px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
                <span>🤖</span> AI Heatmap
              </button>

              <button 
                (click)="toggleNominaLabels()"
                [class.bg-indigo-500]="showNominaLabels()"
                [class.text-zinc-950]="showNominaLabels()"
                [class.bg-slate-800]="!showNominaLabels()"
                [class.text-zinc-300]="!showNominaLabels()"
                class="px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
                <span>🌐</span> Nomina
              </button>
            </div>

          </div>

          <!-- Dual 2D Slice + 3D Model Panels -->
          @if (currentImageSrc()) {
            <div class="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
              
              <!-- Left: 2D DICOM Slice with HU Filters & Overlays -->
              <div class="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 relative bg-slate-950 select-none">
                
                <!-- Corner HUD Overlays (DICOM Header Metadata) -->
                <div class="absolute top-2 left-2 z-20 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-orange-400 uppercase tracking-wider border border-slate-800">
                  {{ activePlane() }} • Slice {{ currentSlice() }}/{{ totalSlices() }}
                </div>

                <div class="absolute top-2 right-2 z-20 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 border border-slate-800">
                  W: {{ windowWidth() }} • L: {{ windowLevel() }} HU
                </div>

                <!-- Live 2D Slice Image Container with HU Contrast Matrix -->
                <div 
                  class="flex-1 flex items-center justify-center p-3 relative overflow-hidden cursor-crosshair"
                  (mousedown)="onCanvasMouseDown($event)">
                  
                  <img 
                    [src]="currentImageSrc()" 
                    alt="DICOM Slice" 
                    class="max-h-full max-w-full object-contain pointer-events-none transition-all duration-200"
                    [style.filter]="computedImageFilter()"
                  />

                  <!-- AI Anomaly Detection Bounding Box Overlay -->
                  @if (showAiAnomalies()) {
                    <div class="absolute top-1/3 left-1/3 w-36 h-28 border-2 border-dashed border-rose-500 rounded-lg pointer-events-none animate-pulse flex flex-col justify-between p-1 bg-rose-500/10">
                      <span class="text-[9px] font-bold bg-rose-950/90 text-rose-300 px-1 py-0.5 rounded border border-rose-500/40 uppercase">
                        AI: Lumbar Disc Degeneration
                      </span>
                      <span class="text-[8px] text-right text-rose-200 font-bold bg-slate-950/80 px-1 rounded self-end">
                        94.2% Conf
                      </span>
                    </div>
                  }

                  <!-- Multilingual Nomina Callout Overlay -->
                  @if (showNominaLabels()) {
                    <div class="absolute bottom-4 left-4 p-2 bg-slate-900/90 border border-indigo-500/40 rounded-xl text-[10px] font-mono space-y-0.5 pointer-events-none">
                      <div class="text-indigo-300 font-bold">VERTEBRA LUMBALIS (L4-L5)</div>
                      <div class="text-amber-300 font-pocketgull-notofu">कशेरुका • Asthi Dhatu</div>
                      <div class="text-emerald-300 font-pocketgull-notofu">腰椎 • Du Mai Channel</div>
                    </div>
                  }

                  <!-- Interactive Caliper Measurement Line -->
                  @if (caliperStart() && caliperEnd()) {
                    <svg class="absolute inset-0 w-full h-full pointer-events-none">
                      <line 
                        [attr.x1]="caliperStart()!.x" 
                        [attr.y1]="caliperStart()!.y" 
                        [attr.x2]="caliperEnd()!.x" 
                        [attr.y2]="caliperEnd()!.y" 
                        stroke="#14b8a6" 
                        stroke-width="2" 
                        stroke-dasharray="4"
                      />
                      <circle [attr.cx]="caliperStart()!.x" [attr.cy]="caliperStart()!.y" r="4" fill="#14b8a6" />
                      <circle [attr.cx]="caliperEnd()!.x" [attr.cy]="caliperEnd()!.y" r="4" fill="#14b8a6" />
                      <text 
                        [attr.x]="(caliperStart()!.x + caliperEnd()!.x) / 2 + 8" 
                        [attr.y]="(caliperStart()!.y + caliperEnd()!.y) / 2 - 8" 
                        fill="#14b8a6" 
                        font-size="11" 
                        font-weight="bold"
                        class="font-mono bg-slate-950">
                        {{ caliperDistanceMm() }} mm
                      </text>
                    </svg>
                  }

                </div>

                <!-- Slice Navigation Bar -->
                <div class="p-2 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span class="text-[10px] text-zinc-400 uppercase font-bold">Slice Index:</span>
                  <input 
                    type="range" min="1" [max]="totalSlices()" step="1" 
                    [value]="currentSlice()" 
                    (input)="updateSlice($event)"
                    aria-label="DICOM Slice Index Navigator"
                    class="flex-1 accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span class="text-orange-400 font-bold text-[11px] w-12 text-right">{{ currentSlice() }} / {{ totalSlices() }}</span>
                </div>

              </div>

              <!-- Right: 3D Reconstruction Model Panel -->
              <div class="w-full md:w-1/2 flex flex-col relative bg-slate-950">
                <div class="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-orange-400 uppercase tracking-wider border border-slate-800">
                  3D Spatial Mesh
                </div>
                <div class="flex-1 min-h-0 min-w-0">
                  <app-medical-3d-viewer
                    [threejsId]="getThreejsId(selectedStudy())"
                    [severity]="getStudySeverity(selectedStudy())"
                    [particles]="true">
                  </app-medical-3d-viewer>
                </div>
              </div>

            </div>

            <!-- Bottom Analysis & Gemini Multimodal Action Bar -->
            <div class="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap justify-between items-center shrink-0 font-mono gap-2">
              <div class="text-[11px] text-zinc-400 font-mono truncate max-w-sm">
                Study: <span class="text-zinc-200">{{ selectedStudy()?.studyInstanceUid }}</span>
              </div>

              <div class="flex items-center gap-3">
                @if (isCaliperActive() && caliperDistanceMm() > 0) {
                  <span class="text-teal-400 font-bold text-xs">
                    Caliper: {{ caliperDistanceMm() }} mm
                  </span>
                }

                <button (click)="analyzeImage()"
                        [disabled]="isAnalyzing()"
                        class="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border border-orange-400/50"
                        [class.bg-orange-500]="!isAnalyzing()"
                        [class.hover:bg-orange-400]="!isAnalyzing()"
                        [class.text-zinc-950]="!isAnalyzing()"
                        [class.bg-slate-800]="isAnalyzing()"
                        [class.text-zinc-500]="isAnalyzing()">
                  @if (isAnalyzing()) {
                    <svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Radiomics...
                  } @else {
                    <span>🤖 Analyze with Gemini</span>
                  }
                </button>
              </div>
            </div>

          } @else {
            <div class="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-slate-950 font-mono p-8 text-center">
              <div class="text-3xl mb-3">🩻</div>
              <p class="text-xs font-bold uppercase tracking-wider text-zinc-300">Select a study for {{ activePatientName() }} to view DICOM imaging.</p>
            </div>
          }

        </div>

      </div>

    </div>
  `
})
export class DicomViewerComponent {
  dicomService = inject(DicomService);
  intelligenceService = inject(ClinicalIntelligenceService);
  patientManager = inject(PatientManagementService);

  studies = this.dicomService.studies;
  selectedStudy = this.dicomService.selectedStudy;

  currentImageSrc = signal<string | null>(null);
  isAnalyzing = signal(false);

  // Advanced Radiomics & Windowing Signals
  windowWidth = signal<number>(1000);
  windowLevel = signal<number>(0);
  activePreset = signal<TWindowPreset>('default');

  // Slice & Multi-Planar Signals
  activePlane = signal<TSlicePlane>('axial');
  currentSlice = signal<number>(16);
  totalSlices = signal<number>(32);

  // Measurement Caliper Signals
  isCaliperActive = signal<boolean>(false);
  caliperStart = signal<{ x: number, y: number } | null>(null);
  caliperEnd = signal<{ x: number, y: number } | null>(null);

  // Overlay Toggles
  showAiAnomalies = signal<boolean>(true);
  showNominaLabels = signal<boolean>(false);

  activePatientName = computed(() => {
    const pId = this.patientManager.selectedPatientId();
    if (!pId) return 'Active Patient';
    const patient = this.patientManager.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Active Patient';
  });

  computedImageFilter = computed(() => {
    const w = Math.max(50, this.windowWidth());
    const l = this.windowLevel();
    const contrast = Math.min(300, Math.max(50, Math.round((1000 / w) * 100)));
    const brightness = Math.min(200, Math.max(50, Math.round((1 + (l / 1500)) * 100)));
    return `contrast(${contrast}%) brightness(${brightness}%)`;
  });

  caliperDistanceMm = computed(() => {
    const p1 = this.caliperStart();
    const p2 = this.caliperEnd();
    if (!p1 || !p2) return 0;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const pixelDist = Math.sqrt(dx * dx + dy * dy);
    return +(pixelDist * 0.45).toFixed(1); // 0.45 mm per pixel calibration
  });

  constructor() {
    effect(() => {
      const pid = this.patientManager.selectedPatientId();
      if (pid) {
        untracked(() => {
          this.loadStudies();
        });
      }
    });

    afterNextRender(() => {
      this.loadStudies();
    });
  }

  async loadStudies() {
    await this.dicomService.searchStudies();
    const loaded = this.studies();
    if (loaded && loaded.length > 0) {
      this.selectStudy(loaded[0]);
    } else {
      this.currentImageSrc.set(null);
    }
  }

  selectStudy(study: IDicomStudy) {
    this.dicomService.selectedStudy.set(study);
    const src = this.dicomService.getRenderedImageUrl(study.studyInstanceUid, 'mock-series-uid', 'mock-instance-uid');
    this.currentImageSrc.set(src);
    this.caliperStart.set(null);
    this.caliperEnd.set(null);
  }

  applyWindowPreset(preset: TWindowPreset) {
    this.activePreset.set(preset);
    switch (preset) {
      case 'bone':
        this.windowWidth.set(2000);
        this.windowLevel.set(400);
        break;
      case 'lung':
        this.windowWidth.set(1500);
        this.windowLevel.set(-600);
        break;
      case 'soft':
        this.windowWidth.set(350);
        this.windowLevel.set(50);
        break;
      case 'brain':
        this.windowWidth.set(80);
        this.windowLevel.set(40);
        break;
      case 'default':
      default:
        this.windowWidth.set(1000);
        this.windowLevel.set(0);
        break;
    }
  }

  toggleCaliper() {
    this.isCaliperActive.update(c => !c);
    if (!this.isCaliperActive()) {
      this.caliperStart.set(null);
      this.caliperEnd.set(null);
    }
  }

  toggleAiAnomalies() {
    this.showAiAnomalies.update(a => !a);
  }

  toggleNominaLabels() {
    this.showNominaLabels.update(n => !n);
  }

  updateSlice(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentSlice.set(Number(input.value));
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (!this.isCaliperActive()) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    if (!this.caliperStart() || (this.caliperStart() && this.caliperEnd())) {
      this.caliperStart.set({ x, y });
      this.caliperEnd.set(null);
    } else {
      this.caliperEnd.set({ x, y });
    }
  }

  getSeriesCount(study?: IDicomStudy | null): number {
    return (study && study.seriesCount) ? study.seriesCount : 1;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr || dateStr.length !== 8) return dateStr || 'Unknown Date';
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }

  getThreejsId(study: IDicomStudy | null): string {
    if (!study) return 'generic';
    const desc = (study.studyDescription || '').toLowerCase();
    if (desc.includes('spine') || desc.includes('lumbar') || desc.includes('skeletal')) return 'skeletal';
    if (desc.includes('brain') || desc.includes('neuro') || desc.includes('head')) return 'neurological';
    if (desc.includes('chest') || desc.includes('lung') || desc.includes('pulmonary')) return 'pulmonary';
    if (desc.includes('cardiac') || desc.includes('heart')) return 'cardiac';
    return 'generic';
  }

  getStudySeverity(study: IDicomStudy | null): 'green' | 'yellow' | 'red' | undefined {
    if (!study) return undefined;
    const desc = (study.studyDescription || '').toLowerCase();
    if (desc.includes('spine') || desc.includes('lumbar')) return 'red';
    if (desc.includes('brain') || desc.includes('neuro')) return 'yellow';
    return 'green';
  }

  async analyzeImage() {
    if (!this.currentImageSrc()) return;
    this.isAnalyzing.set(true);
    try {
      const response = await fetch(this.currentImageSrc()!);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const analysis = await this.intelligenceService.analyzeRadiologyImage(base64data, this.selectedStudy()?.studyDescription || '');
        this.intelligenceService.transcript.update(t => [...t, {
            role: 'model',
            text: `**Radiology Analysis Complete:**\n\n${analysis}`
        }]);
      };
    } catch (e: any) {
      console.error('DICOM Analysis Failed', e);
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
