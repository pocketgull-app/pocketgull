import { Component, ChangeDetectionStrategy, inject, signal, computed, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { GamificationService } from '../services/gamification.service';

@Component({
  selector: 'app-patient-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, PocketGullButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block text-left z-50">
      <div>
      <div>
        <pocket-gull-button 
          type="button" 
          (click)="toggleDropdown()" 
          variant="secondary" 
          size="sm"
          [trailingIcon]="isOpen() ? 'M19 15l-7-7-7 7' : 'M5 9l7 7 7-7'">
          <span class="max-w-[110px] min-[400px]:max-w-[180px] sm:max-w-none truncate block">{{ currentPatientName() }}</span>
        </pocket-gull-button>
      </div>
      </div>

      @if (isOpen()) {
        <div class="origin-top-left absolute left-0 mt-2 w-72 max-w-[calc(100vw-24px)] rounded-sm shadow-xl bg-white dark:bg-[#09090b] ring-1 ring-black dark:ring-white/10 ring-opacity-5 focus:outline-none overflow-hidden flex flex-col max-h-[60dvh]">
          
          <div class="bg-gray-50 dark:bg-zinc-900 px-4 py-2 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
             <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Active Roster (Sorted by Triage Urgency)</span>
             <span class="text-xs font-bold text-gray-500 dark:text-zinc-400">{{ filteredPatients().length }}</span>
          </div>

          <!-- Fast Patient Data Read Executive Summary Card -->
          @if (selectedPatientObj(); as activeP) {
            <div class="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-indigo-500/30 shrink-0 font-mono text-xs">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-300">⚡ Fast Patient Read</span>
                <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded" [class]="getTriageBadge(activeP).bgClass">
                  {{ getTriageBadge(activeP).label }}
                </span>
              </div>
              <p class="font-bold text-sm text-amber-300 truncate">{{ activeP.name }} ({{ activeP.age }}y, {{ activeP.gender }})</p>
              <div class="grid grid-cols-3 gap-1 mt-1.5 text-[10px] text-zinc-300 bg-black/40 p-1.5 rounded border border-white/10">
                <div>BP: <strong class="text-white">{{ activeP.vitals?.bp || '120/80' }}</strong></div>
                <div>HR: <strong class="text-white">{{ activeP.vitals?.hr || '72' }}</strong></div>
                <div>SpO2: <strong class="text-white">{{ activeP.vitals?.spO2 || '98%' }}</strong></div>
              </div>
            </div>
          }

          <div class="p-2 border-b border-gray-100 dark:border-zinc-800 shrink-0">
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
                placeholder="Search name, condition..." 
                class="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-sm leading-5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#689F38] focus:border-[#689F38] sm:text-sm transition-colors"
              />
            </div>
          </div>

          <div class="py-1 overflow-y-auto flex-1 group/list">
            @for (patient of filteredPatients(); track patient.id) {
              <button (click)="selectPatient(patient.id)" 
                      class="group w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors relative border-l-4" 
                      [class.bg-brand-blue-50]="patient.id === patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                      [class.bg-amber-500/5]="patient.id === patientManagement.selectedPatientId() && isSentinelCase(patient)"
                      [class.dark:bg-[#689F38]/10]="patient.id === patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                      [class.dark:bg-amber-500/10]="patient.id === patientManagement.selectedPatientId() && isSentinelCase(patient)"
                      [class.border-[#689F38]]="patient.id === patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                      [class.border-amber-500]="patient.id === patientManagement.selectedPatientId() && isSentinelCase(patient)"
                      [class.border-transparent]="patient.id !== patientManagement.selectedPatientId()"
                      [class.text-gray-700]="!isSentinelCase(patient)"
                      [class.dark:text-zinc-300]="!isSentinelCase(patient)"
                      [class.text-amber-800]="isSentinelCase(patient)"
                      [class.dark:text-amber-300]="isSentinelCase(patient)"
                      [class.hover:bg-[#F8F9FA]]="!isSentinelCase(patient)"
                      [class.dark:hover:bg-zinc-800]="!isSentinelCase(patient)"
                      [class.hover:bg-amber-500/5]="isSentinelCase(patient)"
                      [class.dark:hover:bg-amber-500/10]="isSentinelCase(patient)">
                
                <div class="w-8 h-8 rounded-sm flex items-center justify-center text-xs shrink-0 font-bold shadow-sm"
                     [class.bg-[#689F38]]="patient.id === patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                     [class.bg-amber-500]="patient.id === patientManagement.selectedPatientId() && isSentinelCase(patient)"
                     [class.text-white]="patient.id === patientManagement.selectedPatientId()"
                     [class.bg-amber-100]="patient.id !== patientManagement.selectedPatientId() && isSentinelCase(patient)"
                     [class.dark:bg-amber-950/40]="patient.id !== patientManagement.selectedPatientId() && isSentinelCase(patient)"
                     [class.text-amber-800]="patient.id !== patientManagement.selectedPatientId() && isSentinelCase(patient)"
                     [class.dark:text-amber-300]="patient.id !== patientManagement.selectedPatientId() && isSentinelCase(patient)"
                     [class.bg-gray-200]="patient.id !== patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                     [class.dark:bg-zinc-700]="patient.id !== patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                     [class.text-gray-600]="patient.id !== patientManagement.selectedPatientId() && !isSentinelCase(patient)"
                     [class.dark:text-zinc-300]="patient.id !== patientManagement.selectedPatientId() && !isSentinelCase(patient)">
                  {{ patient.name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-sm truncate flex items-center gap-1.5"
                       [class.text-gray-900]="!isSentinelCase(patient)"
                       [class.dark:text-zinc-100]="!isSentinelCase(patient)">
                    {{ patient.name }}
                    @if (isSentinelCase(patient)) {
                      <span class="text-[12px] font-bold text-amber-800 dark:text-amber-400">🔦 Sentinel</span>
                    }
                    <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs ml-auto shrink-0 font-mono" [class]="getTriageBadge(patient).bgClass">
                      {{ getTriageBadge(patient).label }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                     <span class="whitespace-nowrap">{{ patient.age }} YRS</span>
                     <span class="w-1 h-1 bg-gray-300 dark:bg-zinc-600 rounded-sm shrink-0"></span>
                     <span class="truncate">{{ patient.gender }}</span>
                  </div>
                </div>

                <button (click)="removePatient($event, patient.id)" 
                        class="opacity-0 group-hover:opacity-100 p-1.5 rounded-sm text-brand-red-400 hover:text-brand-red-600 dark:hover:text-brand-red-400 hover:bg-brand-red-50 dark:hover:bg-brand-red-900/50 transition-all shrink-0"
                        aria-label="Remove Patient Record"
                        title="Remove Patient">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </button>
            }
            @if (filteredPatients().length === 0) {
              <div class="px-4 py-6 text-center text-sm text-gray-500 dark:text-zinc-400">
                No patients found.
              </div>
            }
          </div>
          
          <div class="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#09090b] shrink-0 p-2 flex flex-col gap-1">
             <pocket-gull-button 
               (click)="createNewPatient()" 
               variant="ghost" 
               size="sm" 
               class="w-full"
               icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z">
                New Patient
             </pocket-gull-button>
             <pocket-gull-button 
               (click)="triggerImport()" 
               variant="ghost" 
               size="sm" 
               class="w-full"
               icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12">
                Import IPatient
             </pocket-gull-button>
             <pocket-gull-button 
               (click)="exportActiveFhir()" 
               variant="ghost" 
               size="sm" 
               class="w-full"
               icon="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                Export FHIR R4
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

  isSentinelCase(patient: any): boolean {
    return !!patient && (patient.name.toLowerCase().includes('sentinel') || ['p004', 'p005', 'p006', 'p007'].includes(patient.id));
  }

  getPatientTriageScore(p: any): number {
    if (!p) return 0;
    if (p.name.toLowerCase().includes('frida kahlo') || p.id === 'p005') return 100; // Level 1 Emergency Resuscitation
    if (this.isSentinelCase(p)) return 90; // Level 2 Emergent Sentinel Case
    if (p.name.toLowerCase().includes('charles darwin')) return 75; // Level 3 Urgent Assessment
    if (p.name.toLowerCase().includes('florence nightingale')) return 60; // Level 3 Urgent
    return 40; // Level 4/5 Routine Care
  }

  getTriageBadge(p: any): { label: string; bgClass: string } {
    const score = this.getPatientTriageScore(p);
    if (score >= 95) return { label: '🚨 L1 EMERGENCY', bgClass: 'bg-rose-500 text-white font-mono' };
    if (score >= 85) return { label: '🟠 L2 EMERGENT', bgClass: 'bg-orange-500 text-white font-mono' };
    if (score >= 65) return { label: '🟡 L3 URGENT', bgClass: 'bg-amber-500 text-black font-mono' };
    return { label: '🟢 L4 STABLE', bgClass: 'bg-emerald-600 text-white font-mono' };
  }

  exportService = inject(ExportService);
  game = inject(GamificationService);
  elementRef = inject(ElementRef);
  isOpen = signal(false);
  importStatus = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  searchQuery = signal('');

  exportActiveFhir() {
    const active = this.selectedPatientObj();
    if (active) {
      this.exportService.exportPatientToFhirJson(active);
    }
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const patients = this.patientManagement.patients();
    let result = patients;

    if (query) {
      result = patients.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.gender?.toLowerCase().includes(query) ||
        p.age?.toString().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    // Sort patients so those needing help first appear FIRST at top of dropdown!
    return [...result].sort((a, b) => this.getPatientTriageScore(b) - this.getPatientTriageScore(a));
  });

  selectedPatientObj = computed(() => {
    const id = this.patientManagement.selectedPatientId();
    return this.patientManagement.patients().find(p => p.id === id) || null;
  });

  currentPatientName() {
    const activeId = this.patientManagement.selectedPatientId();
    if (!activeId) return 'Select Patient';
    const patient = this.patientManagement.patients().find(p => p.id === activeId);
    return patient ? patient.name : 'Select Patient';
  }

  toggleDropdown() {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      this.searchQuery.set(''); // Clear search when closing
    }
  }

  selectPatient(id: string) {
    console.log('[PatientDropdownComponent] selectPatient called with id:', id);
    this.patientManagement.selectPatient(id);
    this.game.completeQuest('select_patient');
    if (['p004', 'p005', 'p006', 'p007'].includes(id)) {
      this.game.completeQuest('sentinel_triage');
    }
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  async createNewPatient() {
    await this.patientManagement.createNewPatient();
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  removePatient(event: Event, id: string) {
    event.stopPropagation(); // Prevent selecting the patient when clicking remove
    if (confirm('Are you sure you want to permanently remove this patient record?')) {
      this.patientManagement.removePatient(id);
    }
  }

  triggerImport() {
    this.fileInput.nativeElement.value = ''; // Reset so same file can be re-selected
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
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

  private showStatus(type: 'success' | 'error', message: string) {
    this.importStatus.set({ type, message });
    setTimeout(() => this.importStatus.set(null), 3000);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
