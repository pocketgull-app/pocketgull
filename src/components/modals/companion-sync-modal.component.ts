import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { BioThemeSongEngineService } from '../../services/bio-theme-song-engine.service';
import { PeerNetworkService } from '../../services/peer-network.service';
import { CrossDeviceSyncService } from '../../services/cross-device-sync.service';
import { PocketgullDesktopSuiteComponent } from '../pocketgull-desktop-suite.component';
import { BrandedQrCodeComponent } from '../shared/branded-qr-code.component';
import { QrBrandVariant } from '../../services/branded-qr-code.service';

@Component({
  selector: 'app-companion-sync-modal',
  standalone: true,
  imports: [CommonModule, PocketgullDesktopSuiteComponent, BrandedQrCodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" role="dialog" aria-modal="true">
      <div [class]="syncMode() === 'desktop' ? 'relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-3xl w-full p-6 text-gray-900 dark:text-gray-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto' : 'relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-md w-full p-6 text-gray-900 dark:text-gray-100 flex flex-col gap-5'">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              📱
            </div>
            <div>
              <h2 class="text-base font-bold tracking-tight">Pocket Gull Companion &amp; Network Hub</h2>
              <p class="text-xs text-gray-500 dark:text-zinc-400">FHIR R4 Smart Launch, Desktop Suite &amp; Bio-Theme Studio</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
            ✕
          </button>
        </div>

        <!-- Mode Toggle -->
        <div class="grid grid-cols-5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl text-[11px] font-bold uppercase tracking-wider">
          <button 
            (click)="syncMode.set('sync')" 
            [class]="syncMode() === 'sync' ? 'bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🔄 Sync
          </button>
          <button 
            (click)="syncMode.set('doctor')" 
            [class]="syncMode() === 'doctor' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🩺 Doctor
          </button>
          <button 
            (click)="syncMode.set('patient')" 
            [class]="syncMode() === 'patient' ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🌱 Patient
          </button>
          <button 
            (click)="syncMode.set('network')" 
            [class]="syncMode() === 'network' ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🎵 Theme
          </button>
          <button 
            (click)="syncMode.set('desktop')" 
            [class]="syncMode() === 'desktop' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm rounded-lg py-2' : 'text-gray-500 py-2 hover:text-gray-900 dark:hover:text-gray-200'">
            🖥️ Desktop
          </button>
        </div>

        @if (syncMode() === 'desktop') {
          <app-pocketgull-desktop-suite></app-pocketgull-desktop-suite>
        } @else if (syncMode() === 'sync') {
          <!-- Real-Time Cross-Device Sync Telemetry Panel -->
          <div class="flex flex-col gap-3 p-4 bg-zinc-950 rounded-2xl border border-teal-500/40 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span class="font-bold text-white uppercase">ROOM: {{ crossSync.roomId() }}</span>
              </div>
              <div class="flex items-center gap-2 text-[10px]">
                <span class="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
                  {{ crossSync.syncStatus() }}
                </span>
                <span class="text-zinc-400">{{ crossSync.latencyMs() }}ms RTT</span>
              </div>
            </div>

            <!-- Connected Devices List -->
            <div class="space-y-2">
              <span class="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Connected Mesh Peers:</span>
              @for (device of crossSync.connectedDevices(); track device.deviceId) {
                <div class="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">{{ device.role === 'flutter-provider-mobile' ? '📱' : '📟' }}</span>
                    <div>
                      <div class="font-bold text-zinc-200">{{ device.deviceLabel }}</div>
                      <div class="text-[9.5px] text-zinc-500">{{ device.ipOrAddress }} • Last seen: {{ device.lastSeen }}</div>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {{ device.status }}
                  </span>
                </div>
              }
            </div>

            <!-- Broadcast Triggers -->
            <div class="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
              <button type="button" (click)="triggerEsiSync()"
                      class="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition">
                ⚡ Push ESI Triage to Mobile
              </button>
            </div>
          </div>
        } @else {
          <!-- Scannable Branded QR Code -->
          <div class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-850">
            <app-branded-qr-code
              [data]="deepLinkUrl()"
              [variant]="syncQrVariant()"
              [title]="syncMode() === 'network' ? 'Bio-Network Scannable QR' : 'FHIR R4 Smart Launch'"
              subtitle="Scan with Any Mobile Device"
              [destinationSummary]="syncQrDestinationSummary()"
              downloadFilename="pocketgull-companion-sync.png"
              [ariaLabel]="syncMode() === 'network' ? 'Bio-Network Scannable QR' : 'FHIR R4 Smart Launch'">
            </app-branded-qr-code>

            <!-- Active Metadata Section -->
            <div class="mt-3 text-center">
              @if (syncMode() === 'network') {
                <span class="text-xs font-bold text-purple-700 dark:text-purple-300">
                  {{ themeEngine.myThemeSong().themeSongName }} ({{ themeEngine.myThemeSong().baseFrequencyHz }}Hz)
                </span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 max-w-xs">
                  Scanning this QR plays your entrance bio-theme song and triggers synchronized haptic pulses (BPM: {{ themeEngine.myThemeSong().bpmPulse }}).
                </p>
                <div class="mt-2 flex items-center justify-center gap-2">
                  <button 
                    (click)="themeEngine.playPeerThemeSongOnQrScan()" 
                    class="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500 transition shadow-xs">
                    ▶️ Play Theme Song &amp; Haptics
                  </button>
                </div>
              } @else {
                <span class="text-xs font-bold text-gray-800 dark:text-zinc-200">Patient: {{ currentPatientName() }}</span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 max-w-xs">
                  {{ syncMode() === 'doctor' ? 'Pre-configures Sentinel Outbreaks, 3D Raycaster & FastAPI ML Scoring.' : 'Pre-configures Serene Intake, Goal Checklist & Gulliver Voice Assistant.' }}
                </p>
              }
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
        }

        <!-- Footer -->
        <div class="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 pt-1">
          <span>Encrypted Ephemeral Bilateral Consent</span>
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
  themeEngine = inject(BioThemeSongEngineService);
  peerNetwork = inject(PeerNetworkService);
  readonly crossSync = inject(CrossDeviceSyncService);

  syncMode = signal<'sync' | 'doctor' | 'patient' | 'network' | 'desktop'>('sync');
  copied = signal(false);

  triggerEsiSync(): void {
    const patient = this.patientMgmt.selectedPatient();
    this.crossSync.broadcastEsiTriage({
      patientId: patient?.id || 'P-001',
      patientName: patient?.name || 'Active Patient',
      acuityLevel: 2,
      acuityLabel: 'EMERGENT',
      nurseAttestation: true,
      rationale: 'Workstation clinical review triggered live ESI-2 priority telemetry sync.',
      timestamp: new Date().toISOString()
    });
  }

  currentPatientName = computed(() => {
    return this.patientState.patientName() || 'Homo Sapiens';
  });

  deepLinkUrl = computed(() => {
    if (this.syncMode() === 'network') {
      const alias = this.currentPatientName();
      return this.peerNetwork.generateMyPeerQrPayload(alias, 'stanford');
    }
    const pId = this.patientMgmt.selectedPatientId() || 'p005';
    const mode = this.syncMode();
    const scope = this.patientState.sentinelScope();
    return `pocketgull://sync?patientId=${pId}&mode=${mode}&scope=${scope}&fhirStore=cloud-run&vitals=hr_bp_spo2_macro`;
  });

  syncQrVariant = computed<QrBrandVariant>(() => {
    const mode = this.syncMode();
    if (mode === 'patient') return 'emerald';
    if (mode === 'doctor') return 'amber';
    if (mode === 'network') return 'obsidian';
    return 'teal';
  });

  syncQrDestinationSummary = computed(() => {
    const mode = this.syncMode();
    if (mode === 'network') {
      return `PocketGull Bio-Network • Theme: ${this.themeEngine.myThemeSong().themeSongName}`;
    }
    return `PocketGull FHIR R4 Smart Launch • ${this.currentPatientName()}`;
  });

  copyLink(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.deepLinkUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
