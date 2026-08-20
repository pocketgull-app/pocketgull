import { Component, ChangeDetectionStrategy, inject, signal, computed, HostListener, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';
import { GamificationService } from '../services/gamification.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-patient-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, PocketGullButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block text-left z-50">
      <div>
        <pocket-gull-button 
          type="button" 
          (click)="toggleDropdown()" 
          variant="secondary" 
          size="sm"
          [trailingIcon]="isOpen() ? 'M19 15l-7-7-7 7' : 'M5 9l7 7 7-7'">
          <span class="max-w-[140px] min-[400px]:max-w-[220px] sm:max-w-none truncate block font-medium">
            {{ currentPatientName() }}
          </span>
        </pocket-gull-button>
      </div>

      @if (isOpen()) {
        <div class="origin-top-left absolute left-0 mt-2 w-96 max-w-[calc(100vw-24px)] rounded-xl shadow-2xl bg-white dark:bg-[#09090b] border border-gray-200 dark:border-zinc-800 ring-1 ring-black/5 focus:outline-none overflow-hidden flex flex-col max-h-[75dvh]">
          
          <!-- Roster Header -->
          <div class="bg-gray-50 dark:bg-zinc-900/90 px-4 py-2.5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
             <div class="flex items-center gap-2">
               <span class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">Diagnostic Patient Cockpit</span>
               <span class="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full border border-blue-500/20">
                 HIPAA De-identified
               </span>
             </div>
             <span class="text-xs font-mono font-bold text-gray-500 dark:text-zinc-400">{{ filteredPatients().length }} Enrolled</span>
          </div>

          <!-- Active Patient Executive Telemetry HUD -->
          @if (selectedPatientObj(); as activeP) {
            <div class="p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white border-b border-indigo-500/30 shrink-0 font-sans text-xs space-y-2">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-300 font-mono">⚡ Active Clinical Focus</span>
                <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs font-mono" [class]="getTriageBadge(activeP).bgClass">
                  {{ getTriageBadge(activeP).label }}
                </span>
              </div>
              
              <div class="flex items-baseline justify-between">
                <p class="font-bold text-sm text-white truncate">{{ activeP.name }}</p>
                <span class="text-[10px] font-mono text-zinc-400 shrink-0">{{ activeP.age }}y &bull; {{ activeP.gender }}</span>
              </div>

              <!-- Diagnostic Outliers Strip -->
              <div class="grid grid-cols-3 gap-1.5 text-[11px] font-mono bg-black/50 p-2 rounded-lg border border-white/10">
                <div>
                  <span class="text-zinc-400 text-[10px] block">Blood Pressure</span>
                  <strong [class.text-rose-400]="isBpElevated(activeP.vitals?.bp)" class="text-white">
                    {{ activeP.vitals?.bp || '120/80' }}
                  </strong>
                </div>
                <div>
                  <span class="text-zinc-400 text-[10px] block">Resting HR / SpO2</span>
                  <strong class="text-white">{{ activeP.vitals?.hr || '72' }} bpm</strong> &bull; <span class="text-emerald-400">{{ activeP.vitals?.spO2 || '98%' }}</span>
                </div>
                <div>
                  <span class="text-zinc-400 text-[10px] block">HbA1c / Glucose</span>
                  <strong class="text-amber-300">{{ activeP.vitals?.hba1c || '5.4%' }}</strong>
                </div>
              </div>

              @if (getPatientDiagnosticSummary(activeP); as diag) {
                <div class="text-[11px] text-zinc-300 truncate flex items-center gap-1.5">
                  <span class="text-indigo-400 font-bold">Dx:</span>
                  <span class="truncate">{{ diag }}</span>
                </div>
              }
            </div>
          }

          <!-- Search Input -->
          <div class="p-2 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-[#09090b]">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400 dark:text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input 
                type="text" 
                [ngModel]="searchQuery()" 
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search diagnosis, genomic variant, phenotype..." 
                class="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg leading-5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-xs transition-colors font-sans"
              />
            </div>
          </div>

          <!-- Patient List -->
          <div class="py-1 overflow-y-auto flex-1 group/list divide-y divide-gray-100 dark:divide-zinc-800/60">
            @for (patient of filteredPatients(); track patient.id) {
              <button 
                type="button"
                (click)="selectPatient(patient.id)" 
                class="group w-full text-left px-3.5 py-2.5 text-sm flex items-start gap-3 transition-colors relative border-l-4" 
                [class.bg-blue-50]="patient.id === patientManagement.selectedPatientId()"
                [class.dark:bg-blue-950/20]="patient.id === patientManagement.selectedPatientId()"
                [class.border-blue-600]="patient.id === patientManagement.selectedPatientId()"
                [class.border-transparent]="patient.id !== patientManagement.selectedPatientId()"
                [class.hover:bg-gray-50]="patient.id !== patientManagement.selectedPatientId()"
                [class.dark:hover:bg-zinc-850]="patient.id !== patientManagement.selectedPatientId()">
                
                <!-- Avatar Indicator -->
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold shadow-xs mt-0.5"
                     [class.bg-blue-600]="patient.id === patientManagement.selectedPatientId()"
                     [class.text-white]="patient.id === patientManagement.selectedPatientId()"
                     [class.bg-gray-100]="patient.id !== patientManagement.selectedPatientId()"
                     [class.dark:bg-zinc-800]="patient.id !== patientManagement.selectedPatientId()"
                     [class.text-gray-700]="patient.id !== patientManagement.selectedPatientId()"
                     [class.dark:text-zinc-300]="patient.id !== patientManagement.selectedPatientId()">
                  {{ getTriageIcon(patient) }}
                </div>

                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-xs truncate text-gray-900 dark:text-zinc-100">
                      {{ patient.name }}
                    </span>
                    <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-2xs shrink-0 font-mono" [class]="getTriageBadge(patient).bgClass">
                      {{ getTriageBadge(patient).label }}
                    </span>
                  </div>

                  <!-- Primary Diagnosis & Demographics -->
                  <div class="text-[11px] text-gray-600 dark:text-zinc-400 flex items-center justify-between font-sans">
                    <span class="truncate">{{ patient.preexistingConditions?.[0] || patient.symptoms?.[0]?.name || 'Standard Wellness Care' }}</span>
                    <span class="font-mono text-[10px] text-gray-400 dark:text-zinc-500 shrink-0">{{ patient.age }}y &bull; {{ patient.gender }}</span>
                  </div>

                  <!-- Quick Diagnostic Biomarkers -->
                  <div class="flex items-center gap-2 text-[10px] font-mono text-gray-500 dark:text-zinc-400 pt-0.5">
                    <span>BP: <strong [class.text-rose-500]="isBpElevated(patient.vitals?.bp)">{{ patient.vitals?.bp || '120/80' }}</strong></span>
                    <span>&bull;</span>
                    <span>HR: <strong>{{ patient.vitals?.hr || '72' }}</strong></span>
                    @if (patient.vitals?.hba1c) {
                      <span>&bull;</span>
                      <span>A1c: <strong>{{ patient.vitals.hba1c }}</strong></span>
                    }
                  </div>
                </div>
              </button>
            }
            @if (filteredPatients().length === 0) {
              <div class="px-4 py-6 text-center text-xs text-gray-500 dark:text-zinc-400">
                No patients match the search query.
              </div>
            }
          </div>
          
          <!-- Actions Footer -->
          <div class="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-[#09090b] shrink-0 p-2 flex items-center justify-between gap-2">
             <pocket-gull-button 
               (click)="createNewPatient()" 
               variant="ghost" 
               size="sm" 
               class="flex-1"
               icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z">
                New Archetype
             </pocket-gull-button>
             <pocket-gull-button 
               (click)="exportActiveFhir()" 
               variant="ghost" 
               size="sm" 
               class="flex-1"
               icon="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                Export FHIR
             </pocket-gull-button>
          </div>
        </div>
      }

      <!-- Hidden file input for import -->
      <input #fileInput type="file" accept=".json,.xml,.png,.jpg,.jpeg,.pdf" class="hidden" (change)="onFileSelected($event)" />

      <!-- Import status toast -->
      @if (importStatus()) {
        <div class="absolute right-0 mt-2 w-72 p-3 rounded-lg shadow-lg text-sm font-medium z-50 animate-in fade-in slide-in-from-top duration-200"
             [class.bg-brand-green-50]="importStatus()!.type === 'success'"
             [class.text-brand-green-800]="importStatus()!.type === 'success'"
             [class.border-brand-green-200]="importStatus()!.type === 'success'"
             [class.bg-brand-red-50]="importStatus()!.type === 'error'"
             [class.text-brand-red-800]="importStatus()!.type === 'error'"
             [class.border-brand-red-200]="importStatus()!.type === 'error'"
             class="border">
          {{ importStatus()!.message }}
        </div>
      }
    </div>
  `
})
export class PatientDropdownComponent {
  patientManagement = inject(PatientManagementService);
  exportService = inject(ExportService);
  game = inject(GamificationService);
  elementRef = inject(ElementRef);

  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  importStatus = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  currentPatientName = computed(() => {
    const p = this.patientManagement.selectedPatient();
    return p ? p.name : 'Select Patient Archetype';
  });

  selectedPatientObj = computed<IPatient | null>(() => {
    return this.patientManagement.selectedPatient() || null;
  });

  filteredPatients = computed<IPatient[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.patientManagement.patients();
    if (!q) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.preexistingConditions || []).some(c => c.toLowerCase().includes(q)) ||
      (p.symptoms || []).some(s => s.name.toLowerCase().includes(q)) ||
      p.gender?.toLowerCase().startsWith(q)
    );
  });

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  selectPatient(patientId: string): void {
    this.patientManagement.selectPatient(patientId);
    this.game.completeQuest('select_patient');
    this.isOpen.set(false);
  }

  createNewPatient(): void {
    this.patientManagement.createNewPatient();
    this.isOpen.set(false);
  }

  exportActiveFhir(): void {
    const active = this.selectedPatientObj();
    if (active) {
      this.exportService.exportPatientToFhirJson(active);
    }
  }

  triggerImport(): void {
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const patient = await this.exportService.importFromFile(file);
      this.patientManagement.importPatient(patient);
      this.isOpen.set(false);
      this.showStatus('success', `Imported "${patient.name}" successfully.`);
    } catch (err: any) {
      this.showStatus('error', err.message || 'Failed to import patient file.');
    }
  }

  private showStatus(type: 'success' | 'error', message: string): void {
    this.importStatus.set({ type, message });
    setTimeout(() => this.importStatus.set(null), 3000);
  }

  isBpElevated(bp?: string): boolean {
    if (!bp) return false;
    const sys = parseInt(bp.split('/')[0] || '120', 10);
    return sys >= 135;
  }

  getPatientDiagnosticSummary(p: IPatient): string {
    if (p.preexistingConditions && p.preexistingConditions.length > 0) {
      return p.preexistingConditions.slice(0, 2).join(' &bull; ');
    }
    if (p.symptoms && p.symptoms.length > 0) {
      return p.symptoms.slice(0, 2).map(s => s.name).join(' &bull; ');
    }
    return 'Metabolic & Cardiovascular Health';
  }

  getTriageIcon(p: IPatient): string {
    const conds = (p.preexistingConditions || []).join(' ').toLowerCase();
    if (conds.includes('cancer') || conds.includes('oncology')) return '🎗️';
    if (conds.includes('heart') || conds.includes('hypertension')) return '🫀';
    if (conds.includes('asthma') || conds.includes('respiratory')) return '🫁';
    if (conds.includes('postpartum') || conds.includes('maternal')) return '🤰';
    if (conds.includes('alzheimer') || conds.includes('neurological')) return '🧠';
    return '👤';
  }

  getTriageBadge(p: IPatient): { label: string; bgClass: string } {
    const conds = (p.preexistingConditions || []).join(' ').toLowerCase();
    const bp = p.vitals?.bp || '120/80';
    const sys = parseInt(bp.split('/')[0] || '120', 10);

    if (conds.includes('pdac') || conds.includes('cancer') || sys >= 150) {
      return { label: '🔴 Critical', bgClass: 'bg-rose-500 text-white' };
    }
    if (conds.includes('hypertension') || conds.includes('diabetes') || conds.includes('postpartum')) {
      return { label: '🟡 Active', bgClass: 'bg-amber-500 text-slate-950 font-bold' };
    }
    return { label: '🟢 Stable', bgClass: 'bg-emerald-500 text-white' };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
