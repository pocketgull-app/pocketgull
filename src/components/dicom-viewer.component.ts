import { Component, inject, signal, computed, effect, untracked, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DicomService, IDicomStudy } from '../services/dicom.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientManagementService } from '../services/patient-management.service';
import { Medical3DViewerComponent } from './medical-3d-viewer.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dicom-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, Medical3DViewerComponent],
  template: `
    <div class="h-[450px] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm font-mono">
      <div class="px-4 py-3 border-b flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h3 class="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
           <svg class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Medical Imaging Suite — <span class="text-orange-400 font-bold">{{ activePatientName() }}</span>
        </h3>
        <button (click)="loadStudies()"
                class="text-xs px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors font-mono cursor-pointer"
                [disabled]="dicomService.isLoading()">
          {{ dicomService.isLoading() ? 'Loading...' : 'Refresh Studies' }}
        </button>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar: Patient Study List -->
        <div class="w-1/3 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/30">
          @if (dicomService.error()) {
            <div class="p-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 m-4 rounded">
              {{ dicomService.error() }}
            </div>
          }
          @if (studies().length === 0 && !dicomService.isLoading()) {
            <div class="p-8 text-center text-xs font-mono text-zinc-500 flex flex-col items-center">
                <svg class="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                No DICOM imaging studies for {{ activePatientName() }}.
            </div>
          }
          <div class="p-2 space-y-2 font-mono">
            @for (study of studies(); track study.studyInstanceUid) {
              <div class="p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.98]"
                   [class.border-orange-500]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                   [class.bg-zinc-900]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                   [class.border-zinc-200]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   [class.dark:border-zinc-800]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   [class.hover:border-zinc-300]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   [class.dark:hover:border-zinc-700]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   (click)="selectStudy(study)">
                <div class="flex justify-between items-start mb-1">
                  <div class="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate pr-2 uppercase" title="{{ study.patientName }}">
                    {{ study.patientName }}
                  </div>
                  <div class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-orange-400 font-mono font-bold border border-zinc-800">
                    {{ study.modalities?.join(',') || 'CT' }}
                  </div>
                </div>
                <div class="text-xs text-zinc-400 truncate" title="{{ study.studyDescription }}">
                  {{ study.studyDescription || 'No description' }}
                </div>
                <div class="text-[10px] text-zinc-400 mt-1">
                  {{ formatDate(study.studyDate) }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Main viewer panel: split 2D Slice and 3D Reconstruction -->
        <div class="flex-1 flex flex-col bg-black relative group overflow-hidden">
          @if (currentImageSrc()) {
            <div class="flex-1 flex overflow-hidden min-h-0">
              <!-- Left side: 2D DICOM Slice -->
              <div class="w-1/2 flex flex-col border-r border-zinc-800 relative bg-zinc-950/80">
                <div class="absolute top-2 left-2 z-10 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-orange-400 uppercase tracking-widest border border-zinc-800">
                  2D Slice View
                </div>
                <div class="flex-1 flex items-center justify-center overflow-hidden p-3">
                  <img [src]="currentImageSrc()" alt="DICOM study image" class="max-h-full max-w-full object-contain select-none pointer-events-none" />
                </div>
              </div>

              <!-- Right side: 3D Reconstruction model -->
              <div class="w-1/2 flex flex-col relative bg-zinc-950">
                <div class="absolute top-2 left-2 z-10 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-orange-400 uppercase tracking-widest border border-zinc-800">
                  3D Reconstruction
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

            <!-- Analysis Bar -->
            <div class="p-3 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center shrink-0 font-mono">
              <div class="text-[10.5px] text-zinc-400 font-mono truncate max-w-[50%]">
                 Study: {{ selectedStudy()?.studyInstanceUid?.substring(0,22) }}...
              </div>
              <button (click)="analyzeImage()"
                      [disabled]="isAnalyzing()"
                      class="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border border-orange-400/50"
                      [class.bg-orange-500]="!isAnalyzing()"
                      [class.hover:bg-orange-400]="!isAnalyzing()"
                      [class.text-zinc-950]="!isAnalyzing()"
                      [class.bg-zinc-900]="isAnalyzing()"
                      [class.text-zinc-500]="isAnalyzing()">
                @if (isAnalyzing()) {
                  <svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                } @else {
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze with Gemini
                }
              </button>
            </div>
          } @else {
            <div class="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-black font-mono">
               <svg class="w-12 h-12 mb-4 opacity-50 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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

  activePatientName = computed(() => {
    const pId = this.patientManager.selectedPatientId();
    if (!pId) return 'Active Patient';
    const patient = this.patientManager.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Active Patient';
  });

  constructor() {
    effect(() => {
      // Re-query & isolate DICOM studies whenever the selected patient changes
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

    const studyUid = study.studyInstanceUid;
    const seriesUid = 'mock-series-uid';
    const instanceUid = 'mock-instance-uid';

    const src = this.dicomService.getRenderedImageUrl(studyUid, seriesUid, instanceUid);
    this.currentImageSrc.set(src);
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
            text: `**Radiology Analysis Complete:**

\${analysis}`
        }]);

        console.log('DICOM Analysis Response:', analysis);
      };

    } catch (e: any) {
      console.error('DICOM Analysis Failed', e);
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
