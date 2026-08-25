import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrossBorderHealthWalletService } from '../services/cross-border-health-wallet.service';

@Component({
  selector: 'app-ambient-living-space-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-3xl p-6 sm:p-10 flex flex-col justify-between overflow-y-auto font-mono text-zinc-100 animate-in fade-in duration-300">
      
      <!-- Top Ambient Navigation Bar (Dieter Rams Braun Aesthetic) -->
      <div class="flex items-center justify-between gap-4 pb-6 border-b border-zinc-800 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
            🏡
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">Main Living Space Display Mode</span>
              <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">Ambient Co-Regulation</span>
            </div>
            <h2 class="text-base font-black text-zinc-100 tracking-wide uppercase mt-0.5">Living Room Ambient Health Studio</h2>
          </div>
        </div>

        <div class="flex items-center gap-3 font-mono">
          <button (click)="openGleeAlbum.emit()"
            class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
            🎵 Launch Duet Singalong
          </button>

          <button (click)="closeModal.emit()"
            class="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white font-bold flex items-center justify-center transition cursor-pointer text-base">
            ✕
          </button>
        </div>
      </div>

      <!-- Main Ambient Content Grid -->
      <div class="my-8 grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        
        <!-- Column 1: Circadian Ambient Lighting Guidance -->
        <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">🌅 Circadian Room Cue</span>
              <span class="text-[9.5px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800 font-bold uppercase">Optimal Spectrum</span>
            </div>
            <h3 class="text-base font-bold text-zinc-100 mb-2 font-sans">Warm Amber Twilight Spectrum (1800K - 2200K)</h3>
            <p class="text-xs text-zinc-300 leading-relaxed font-sans">
              Living room ambient lighting is tuned to suppress melatonin destruction. Promotes parasympathetic vagal tone and prepares multi-generational family members for restorative sleep.
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
            <span class="text-zinc-400">Melatonin Preservation</span>
            <span class="font-bold text-emerald-400">98.4% Shielded</span>
          </div>
        </div>

        <!-- Column 2: Multi-Generational Family Health Co-Regulation -->
        <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">👨‍👩‍👧‍👦 Family Co-Regulation</span>
              <span class="text-[9.5px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800 font-bold uppercase">+12.0 QALYs Target</span>
            </div>
            <h3 class="text-base font-bold text-zinc-100 mb-2 font-sans">Actuarial Glee Duet Singalong Session</h3>
            <p class="text-xs text-zinc-300 leading-relaxed font-sans">
              Prescribed 12-track singalong album encourages 2-player duet participation (Singer A Lead & Singer B Harmony), synchronizing family breathing rhythms and building resilience across generations.
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
            <span class="text-zinc-400">Autonomic Co-Regulation</span>
            <span class="font-bold text-orange-400">Synchronized (6.0 BPM)</span>
          </div>
        </div>

        <!-- Column 3: Cross-Border Emergency Passport Share -->
        <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">🌐 International Travel Share</span>
              <span class="text-[9.5px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800 font-bold uppercase">WHO ICD-11 Ready</span>
            </div>
            <h3 class="text-base font-bold text-zinc-100 mb-2 font-sans">Cross-Border Emergency Medical Passport</h3>
            <p class="text-xs text-zinc-300 leading-relaxed font-sans">
              Instantly export de-identified clinical telemetry and FHIR R4 care plans into an offline-scannable QR wallet for specialist consults and international emergency care abroad.
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
            <span class="text-zinc-400">Passport Status</span>
            <button (click)="generatePassport()" class="font-bold text-orange-400 underline hover:text-orange-300 cursor-pointer">
              Generate Passport QR
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Status Bar -->
      <div class="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div>Active Living Space Ambient Mode · Pocket-Gull Care Plan Engine v1.1.0</div>
        <div class="flex items-center gap-2">
          <span>GCP Cloud Project: gen-lang-client-0540208645</span>
        </div>
      </div>

    </div>
  `
})
export class AmbientLivingSpaceDashboardComponent {
  walletService = inject(CrossBorderHealthWalletService);

  closeModal = output<void>();
  openGleeAlbum = output<void>();

  generatePassport() {
    const wallet = this.walletService.generateEmergencyWallet('English');
    alert(`🌐 International Health Wallet Generated:\nID: ${wallet.walletId}\nVitals: ${wallet.vitalsSummary}\nICD-11: ${wallet.activeConditionsIcd11.join('; ')}`);
  }
}
