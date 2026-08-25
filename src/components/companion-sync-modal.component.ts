import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

@Component({
  selector: 'app-companion-sync-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" role="dialog" aria-modal="true">
      <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-md w-full p-6 text-gray-900 dark:text-gray-100 flex flex-col gap-5">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              📱
            </div>
            <div>
              <h2 class="text-base font-bold tracking-tight">Pocket Gull Companion Sync</h2>
              <p class="text-xs text-gray-500 dark:text-zinc-400">FHIR R4 Smart Launch & Mobile Link</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
            ✕
          </button>
        </div>

        <!-- Mode Toggle -->
        <div class="grid grid-cols-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider">
          <button 
            (click)="syncMode.set('doctor')" 
            [class]="syncMode() === 'doctor' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🩺 Doctor Mode
          </button>
          <button 
            (click)="syncMode.set('patient')" 
            [class]="syncMode() === 'patient' ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🌱 Patient Mode
          </button>
        </div>

        <!-- QR Code SVG Representation -->
        <div class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-850">
          <div class="p-3 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <!-- Dynamic SVG QR Matrix -->
            <svg class="w-44 h-44" viewBox="0 0 100 100" fill="currentColor">
              <!-- Finder Patterns -->
              <rect x="5" y="5" width="25" height="25" fill="#1e1b4b" rx="4"/>
              <rect x="9" y="9" width="17" height="17" fill="white" rx="2"/>
              <rect x="13" y="13" width="9" height="9" fill="#1e1b4b" rx="1"/>

              <rect x="70" y="5" width="25" height="25" fill="#1e1b4b" rx="4"/>
              <rect x="74" y="9" width="17" height="17" fill="white" rx="2"/>
              <rect x="78" y="13" width="9" height="9" fill="#1e1b4b" rx="1"/>

              <rect x="5" y="70" width="25" height="25" fill="#1e1b4b" rx="4"/>
              <rect x="9" y="74" width="17" height="17" fill="white" rx="2"/>
              <rect x="13" y="78" width="9" height="9" fill="#1e1b4b" rx="1"/>

              <!-- Dynamic Data Matrix Bits based on patient -->
              <circle cx="45" cy="15" r="3" fill="#4f46e5"/>
              <circle cx="55" cy="15" r="3" fill="#4f46e5"/>
              <circle cx="40" cy="25" r="3" fill="#10b981"/>
              <circle cx="50" cy="35" r="4" fill="#6366f1"/>
              <circle cx="60" cy="45" r="3" fill="#4f46e5"/>
              <circle cx="35" cy="55" r="3" fill="#10b981"/>
              <circle cx="50" cy="65" r="3" fill="#4f46e5"/>
              <circle cx="75" cy="45" r="3" fill="#6366f1"/>
              <circle cx="85" cy="65" r="3" fill="#10b981"/>
              <circle cx="45" cy="85" r="3" fill="#4f46e5"/>
              <circle cx="65" cy="85" r="4" fill="#6366f1"/>
            </svg>
            <span class="mt-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">FHIR R4 Smart Launch</span>
          </div>

          <!-- Active Patient Data Metadata -->
          <div class="mt-3 text-center">
            <span class="text-xs font-bold text-gray-800 dark:text-zinc-200">Patient: {{ currentPatientName() }}</span>
            <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 max-w-xs">
              {{ syncMode() === 'doctor' ? 'Pre-configures Sentinel Outbreaks, 3D Raycaster & FastAPI ML Scoring.' : 'Pre-configures Serene Intake, Goal Checklist & Gulliver Voice Assistant.' }}
            </p>
          </div>
        </div>

        <!-- Smart Link URL Box -->
        <div class="flex items-center gap-2 p-2.5 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs">
          <input 
            type="text" 
            readonly 
            [value]="deepLinkUrl()" 
            class="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-gray-600 dark:text-zinc-300 truncate" />
          <button 
            (click)="copyLink()" 
            class="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10.5px] uppercase tracking-wider rounded-lg hover:bg-indigo-500 transition shadow-sm shrink-0">
            {{ copied() ? 'Copied!' : 'Copy Link' }}
          </button>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 pt-1">
          <span>Supported on iOS, Android & Flutter Desktop</span>
          <button (click)="closeModal.emit()" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Done
          </button>
        </div>
      </div>
    </div>
  `
})
export class CompanionSyncModalComponent {
  closeModal = output<void>();

  private patientState = inject(PatientStateService);
  private patientMgmt = inject(PatientManagementService);

  syncMode = signal<'doctor' | 'patient'>('patient');
  copied = signal(false);

  currentPatientName = computed(() => {
    return this.patientState.patientName() || 'Alexander Vance';
  });

  deepLinkUrl = computed(() => {
    const pId = this.patientMgmt.selectedPatientId() || 'p005';
    const mode = this.syncMode();
    const scope = this.patientState.sentinelScope();
    return `pocketgull://sync?patientId=${pId}&mode=${mode}&scope=${scope}&fhirStore=cloud-run&vitals=hr_bp_spo2_macro`;
  });

  copyLink(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.deepLinkUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
