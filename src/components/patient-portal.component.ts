import { Component, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { Holographic3DAnatomyComponent } from './holographic-3d-anatomy.component';
import { TeledentistryOdontogramComponent } from './teledentistry-odontogram.component';
import { AdkLiveService } from '../services/ai/adk-live.service';

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [
    CommonModule,
    Holographic3DAnatomyComponent,
    TeledentistryOdontogramComponent
  ],
  template: `
    <div class="fixed inset-0 z-[9990] flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <!-- ══ Top Exit Vector & Status Navigation Header ══════════════════════════════ -->
      <header class="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              PG
            </div>
            <div>
              <h1 class="text-base font-semibold text-slate-100 flex items-center gap-2">
                Patient Telehealth Portal
                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Telemetry
                </span>
              </h1>
              <p class="text-xs text-slate-400">Self-service biophysical tracking & AI consult studio</p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          <button (click)="activeTab.set('overview')"
                  [class.bg-emerald-600]="activeTab() === 'overview'"
                  [class.text-white]="activeTab() === 'overview'"
                  [class.text-slate-400]="activeTab() !== 'overview'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all">
            Overview
          </button>
          <button (click)="activeTab.set('anatomy')"
                  [class.bg-emerald-600]="activeTab() === 'anatomy'"
                  [class.text-white]="activeTab() === 'anatomy'"
                  [class.text-slate-400]="activeTab() !== 'anatomy'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all">
            3D Spatial Anatomy
          </button>
          <button (click)="activeTab.set('odontogram')"
                  [class.bg-emerald-600]="activeTab() === 'odontogram'"
                  [class.text-white]="activeTab() === 'odontogram'"
                  [class.text-slate-400]="activeTab() !== 'odontogram'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all">
            Oral-Systemic (SIBI)
          </button>
          <button (click)="activeTab.set('consult')"
                  [class.bg-emerald-600]="activeTab() === 'consult'"
                  [class.text-white]="activeTab() === 'consult'"
                  [class.text-slate-400]="activeTab() !== 'consult'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            AI Voice Consult
          </button>
        </div>

        <!-- Exit & Privacy Actions -->
        <div class="flex items-center gap-3">
          <button (click)="confirmPurgeState()"
                  class="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            1-Click Ephemeral Purge
          </button>
          <button (click)="close.emit()"
                  class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1">
            <span>Return to Clinician View</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </header>

      <!-- ══ Main Content Area ═══════════════════════════════════════════════════════ -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-950">
        @switch (activeTab()) {
          @case ('overview') {
            <div class="max-w-6xl mx-auto space-y-6">
              <!-- Welcome Banner -->
              <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <h2 class="text-xl font-bold text-slate-100">Welcome to Your Biophysical Health Hub</h2>
                  <p class="text-sm text-slate-400 mt-1">Real-time health status, biophysical markers, and systemic risk telemetry.</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <div class="text-xs text-slate-400">Heart Rate</div>
                    <div class="text-lg font-bold text-emerald-400">{{ patientState.vitals().heartRate }} bpm</div>
                  </div>
                  <div class="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <div class="text-xs text-slate-400">Blood Pressure</div>
                    <div class="text-lg font-bold text-blue-400">{{ patientState.vitals().systolicBP }}/{{ patientState.vitals().diastolicBP }}</div>
                  </div>
                  <div class="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <div class="text-xs text-slate-400">SpO₂</div>
                    <div class="text-lg font-bold text-cyan-400">{{ patientState.vitals().spO2 }}%</div>
                  </div>
                </div>
              </div>

              <!-- SIBI Inflammation & Cardiovascular Telemetry Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Systemic Inflammatory Index (SIBI)</div>
                  <div class="text-3xl font-extrabold text-amber-400 my-2">48 <span class="text-sm font-normal text-slate-500">/ 100</span></div>
                  <p class="text-xs text-slate-400">Moderate cytokine activation detected from periodontal deep pockets.</p>
                  <div class="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div class="bg-amber-400 h-full rounded-full" style="width: 48%"></div>
                  </div>
                </div>

                <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Cardiovascular Risk Multiplier</div>
                  <div class="text-3xl font-extrabold text-emerald-400 my-2">1.4x <span class="text-sm font-normal text-slate-500">baseline</span></div>
                  <p class="text-xs text-slate-400">Trans-epithelial bacteremia index optimized via daily oral rinse.</p>
                  <div class="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div class="bg-emerald-400 h-full rounded-full" style="width: 35%"></div>
                  </div>
                </div>

                <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Predicted HbA1c Trajectory</div>
                  <div class="text-3xl font-extrabold text-cyan-400 my-2">+0.2% <span class="text-sm font-normal text-slate-500">shift</span></div>
                  <p class="text-xs text-slate-400">Insulin resistance sensitivity within normal metabolic bounds.</p>
                  <div class="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div class="bg-cyan-400 h-full rounded-full" style="width: 25%"></div>
                  </div>
                </div>
              </div>

              <!-- Quick Launch Consultation Callout -->
              <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 class="text-base font-semibold text-slate-100">Ready to speak with your AI Health Consult?</h3>
                  <p class="text-xs text-slate-400 mt-1">Start a bi-directional streaming voice session powered by Google Gemini Live.</p>
                </div>
                <button (click)="activeTab.set('consult')"
                        class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950 flex items-center gap-2">
                  <span>Start Live Voice Consult</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
              </div>
            </div>
          }

          @case ('anatomy') {
            <div class="h-full rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-900">
              <app-holographic-3d-anatomy />
            </div>
          }

          @case ('odontogram') {
            <div class="h-full overflow-y-auto rounded-2xl p-4 border border-slate-800 bg-slate-900">
              <app-teledentistry-odontogram />
            </div>
          }

          @case ('consult') {
            <div class="max-w-4xl mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6">
              <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>

              <div>
                <h2 class="text-2xl font-bold text-slate-100">Gemini Live Consult Assistant</h2>
                <p class="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                  Bi-directional streaming voice consultation active. Speak naturally or use hardware-free simulated audio testing.
                </p>
              </div>

              <div class="flex justify-center gap-4">
                <button (click)="startLiveConsult()"
                        [disabled]="adkLive.isConnected()"
                        class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950">
                  @if (adkLive.isConnected()) {
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Session Connected (140ms)</span>
                  } @else {
                    <span>Connect Streaming Voice</span>
                  }
                </button>

                <button (click)="adkLive.disconnect()"
                        [disabled]="!adkLive.isConnected()"
                        class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-sm border border-slate-700 transition-all">
                  Disconnect Session
                </button>
              </div>
            </div>
          }
        }
      </main>

      <!-- ══ Ephemeral State Purge Modal ═══════════════════════════════════════════ -->
      @if (showPurgeConfirmation()) {
        <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true">
          <div class="w-full max-w-md p-6 bg-slate-900 rounded-2xl border border-red-500/30 text-center space-y-4">
            <div class="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-100">Confirm Ephemeral State Purge</h3>
            <p class="text-xs text-slate-400">
              This will permanently erase all local transient symptoms, vitals telemetry, and session state per HIPAA Safe Harbor §164.514 standards.
            </p>
            <div class="flex justify-center gap-3 pt-2">
              <button (click)="showPurgeConfirmation.set(false)"
                      class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors">
                Cancel
              </button>
              <button (click)="executePurgeState()"
                      class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors">
                Purge All Data
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PatientPortalComponent {
  @Output() close = new EventEmitter<void>();

  patientState = inject(PatientStateService);
  adkLive = inject(AdkLiveService);

  activeTab = signal<'overview' | 'anatomy' | 'odontogram' | 'consult'>('overview');
  showPurgeConfirmation = signal(false);

  confirmPurgeState() {
    this.showPurgeConfirmation.set(true);
  }

  executePurgeState() {
    this.showPurgeConfirmation.set(false);
    this.patientState.purgeTransientPatientState();
    this.close.emit();
  }

  startLiveConsult() {
    this.adkLive.simulateLiveStreamResponse([
      'Hello! I am your AI Patient Consult Assistant.',
      ' I am monitoring your SIBI inflammatory indices and vitals in real time.'
    ]);
  }
}
