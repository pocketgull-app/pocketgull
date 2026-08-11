import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartOnFhirLauncherService } from '../services/smart-on-fhir-launcher.service';

@Component({
  selector: 'app-smart-fhir-launcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 text-gray-100 shadow-2xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏥</span>
            <h2 class="text-xl font-bold text-gray-100">SMART on FHIR v2 / EHR App Gallery Hub</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              USCDI v4 Standardized
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            1-Click OAuth2 EHR Authorization & Context Synchronization for Epic, Cerner, AthenaHealth, and VA Lighthouse.
          </p>
        </div>

        @if (launcher.isConnected()) {
          <button (click)="launcher.disconnectSession()" class="px-3.5 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 rounded-lg text-xs font-bold transition">
            Disconnect EHR
          </button>
        }
      </div>

      <!-- EHR Vendor Gallery Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        @for (vendor of launcher.supportedVendors(); track vendor.id) {
          <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 transition-all hover:border-sky-500/40 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-2xl">{{ vendor.logo }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-gray-400 border border-zinc-700">FHIR R4</span>
              </div>
              <h3 class="font-bold text-sm text-gray-200">{{ vendor.name }}</h3>
              <p class="text-[11px] text-gray-400 mt-1 truncate font-mono">{{ vendor.fhirBaseUrl }}</p>
            </div>

            <button 
              (click)="launcher.initiateLaunch(vendor.id)"
              [disabled]="launcher.activeSession().status === 'AUTHORIZING'"
              class="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md">
              <span>Connect {{ vendor.id | uppercase }}</span>
            </button>
          </div>
        }
      </div>

      <!-- Active Connection Status HUD -->
      @if (launcher.activeSession().status !== 'IDLE') {
        <div class="p-4 bg-zinc-900 rounded-xl border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full animate-pulse" [class.bg-yellow-400]="launcher.activeSession().status === 'AUTHORIZING'" [class.bg-emerald-400]="launcher.activeSession().status === 'CONNECTED'"></div>
            <div>
              <span class="text-xs font-bold text-gray-300">Active OAuth2 Launch Status:</span>
              <span class="text-xs font-mono font-semibold ml-2 text-sky-400">{{ launcher.activeSession().status }}</span>
              @if (launcher.activeSession().patientId) {
                <span class="text-xs text-gray-400 ml-3">Bound Patient ID: <code class="text-emerald-400 font-bold">{{ launcher.activeSession().patientId }}</code></span>
              }
            </div>
          </div>

          <div class="text-[11px] font-mono text-gray-400 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
            Scopes: launch patient/*.read openid fhirUser
          </div>
        </div>
      }
    </div>
  `
})
export class SmartFhirLauncherComponent {
  readonly launcher = inject(SmartOnFhirLauncherService);
}
