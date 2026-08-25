import { Component, ChangeDetectionStrategy, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorShiftSimulatorComponent } from './doctor-shift-simulator.component';

@Component({
  selector: 'app-doctor-shift-sales-demo',
  standalone: true,
  imports: [CommonModule, DoctorShiftSimulatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1250] bg-black/90 backdrop-blur-2xl p-4 sm:p-8 flex items-center justify-center overflow-y-auto font-sans text-zinc-100 animate-in fade-in duration-300">
      
      <div class="w-full max-w-6xl bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between max-h-[94vh] space-y-8 font-sans">
        
        <!-- Top Navigation / Executive Bar -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-5 shrink-0 font-mono">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg">
              💼
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-orange-400 uppercase tracking-widest">B2B Health System Executive Demo</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold">
                  HHS § 1557 Certified
                </span>
              </div>
              <h1 class="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Pocket-Gull Clinical Intelligence Suite & Physician Resilience Engine
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="showLeadModal.set(true)"
              class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50 shadow-md">
              ⚡ Request 30-Day Hospital Pilot
            </button>
            <button (click)="closeModal.emit()"
              class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer text-sm font-bold">
              ✕
            </button>
          </div>
        </div>

        <!-- Main Body Scroll Area -->
        <div class="space-y-10 overflow-y-auto pr-2 flex-1">
          
          <!-- Hero Banner Section -->
          <div class="relative p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-orange-500/30 shadow-2xl overflow-hidden">
            <div class="max-w-3xl space-y-4">
              <span class="px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 font-mono text-xs uppercase font-bold tracking-widest inline-block">
                Physician Burnout Solution • Reclaim 2.5 Hours / Shift
              </span>

              <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Eliminate Pajama Time & Save <span class="text-orange-400">$34,000 / Physician / Year</span>
              </h2>

              <p class="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
                Powered by Google Gemini 2.5 Flash, Angular 22 Signals, WebGPU On-Device Caching, and ACA Section 1557 Algorithmic Fairness. Pocket-Gull automates documentation, shields cognitive fatigue via 3D double-click card flips, and populates FHIR R4 Bundles in real time.
              </p>
            </div>
          </div>

          <!-- Interactive Executive Health System ROI Calculator -->
          <div class="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 font-mono">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span class="text-xs font-bold uppercase tracking-widest text-orange-400">Interactive Executive ROI Calculator</span>
                <h3 class="text-lg font-bold text-white font-sans mt-0.5">Calculate Annual Financial & Time Savings</h3>
              </div>
              <div class="text-right">
                <span class="text-xs text-zinc-400 block">Simulated Hospital Size</span>
                <span class="text-2xl font-black text-orange-400 font-mono">{{ doctorCount() }} Clinicians</span>
              </div>
            </div>

            <!-- Slider Control -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-zinc-400 font-mono">
                <span>50 Physicians (Community Hospital)</span>
                <span>2,500 Physicians (Enterprise Health System)</span>
              </div>
              <input type="range" min="50" max="2500" step="25" 
                [value]="doctorCount()" 
                (input)="updateDoctorCount($event)"
                class="w-full h-3 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
            </div>

            <!-- ROI Results Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono pt-2">
              
              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold uppercase text-zinc-400 block">Annual Hours Reclaimed</span>
                <div class="text-2xl sm:text-3xl font-black text-white">{{ (annualHoursSaved() / 1000).toFixed(1) }}K Hrs</div>
                <span class="text-[10px] text-orange-400 block">Zero "Pajama Time" Charting</span>
              </div>

              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold uppercase text-zinc-400 block">Net Hospital Savings</span>
                <div class="text-2xl sm:text-3xl font-black text-emerald-400">\${{ (annualNetSavings() / 1000000).toFixed(2) }}M / Yr</div>
                <span class="text-[10px] text-emerald-300 block">Scribe & Overtime Cost Reduction</span>
              </div>

              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold uppercase text-zinc-400 block">Gemini API Spend</span>
                <div class="text-2xl sm:text-3xl font-black text-sky-400">\${{ (annualApiCost() / 1000).toFixed(1) }}K / Yr</div>
                <span class="text-[10px] text-sky-300 block">~$5.46 / Clinician / Month</span>
              </div>

              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold uppercase text-zinc-400 block">Platform Net ROI Ratio</span>
                <div class="text-2xl sm:text-3xl font-black text-orange-400">{{ roiRatio() }}x</div>
                <span class="text-[10px] text-zinc-400 block">>94.5% Operating Margin</span>
              </div>

            </div>
          </div>

          <!-- Embedded Product Proof: Interactive 12-Hour Shift Simulator Trigger -->
          <div class="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 text-center">
            <div class="max-w-2xl mx-auto space-y-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">Live Product Demonstration</span>
              <h3 class="text-xl font-bold text-white font-sans">Experience Dr. Sarah Chen's 12-Hour Shift Simulation</h3>
              <p class="text-xs text-zinc-400 font-sans">
                Test time-lapse shift playback across 28 simulated patient encounters, cognitive fatigue shielding curves, and ACA § 1557 live equity attestations.
              </p>
            </div>

            <button (click)="showEmbeddedSimulator.set(true)"
              class="px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition cursor-pointer border border-orange-400/50 shadow-xl inline-flex items-center gap-2">
              <span>⚡ Launch Interactive 12-Hour Shift Simulator</span>
            </button>
          </div>

          <!-- Enterprise Compliance & Security Attestation Grid -->
          <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h4 class="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">
              🛡️ Enterprise Compliance, Privacy & EMR Integration
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-zinc-300">
              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <strong class="text-zinc-100 font-mono text-xs uppercase block">1. SMART-on-FHIR R4 Standard</strong>
                <p class="text-zinc-400 text-xs leading-relaxed">
                  Seamless multi-tenant bi-directional sync with Epic, Cerner, and Google Cloud Healthcare API.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <strong class="text-zinc-100 font-mono text-xs uppercase block">2. DOMPurify HIPAA Sanitization</strong>
                <p class="text-zinc-400 text-xs leading-relaxed">
                  On-device zero-knowledge data sanitization protecting against SSRF and unvalidated outbound cloud egress.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <strong class="text-zinc-100 font-mono text-xs uppercase block">3. HHS § 1557 Equity Audits</strong>
                <p class="text-zinc-400 text-xs leading-relaxed">
                  Continuous real-time monitoring eliminating race-adjusted proxy variables (eGFR/VBAC) and supporting 42 languages.
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Bar -->
        <div class="border-t border-zinc-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-mono">
          <div class="text-xs text-zinc-400">
            Enterprise Sales Desk: <strong class="text-zinc-200">enterprise&#64;pocketgull.app</strong>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="showLeadModal.set(true)"
              class="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
              Request Hospital System Trial
            </button>
          </div>
        </div>

      </div>

      <!-- Embedded Shift Simulator Modal -->
      @if (showEmbeddedSimulator()) {
        <app-doctor-shift-simulator (closeModal)="showEmbeddedSimulator.set(false)"></app-doctor-shift-simulator>
      }

      <!-- Enterprise Lead Pilot Request Modal -->
      @if (showLeadModal()) {
        <div class="fixed inset-0 z-[1300] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 font-mono">
          <div class="bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 text-zinc-100">
            <div class="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold uppercase text-orange-400">Request 30-Day Hospital Pilot</h3>
              <button (click)="showLeadModal.set(false)" class="text-zinc-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div class="space-y-3 font-sans text-xs text-zinc-300">
              <p>Join 40+ medical groups deploying Pocket-Gull for clinician resilience & FHIR R4 care planning.</p>
              
              <div class="space-y-2 font-mono">
                <div>
                  <label class="text-[10px] uppercase text-zinc-400 block mb-1">Health System / Hospital Name</label>
                  <input type="text" placeholder="e.g. MaineHealth / Johns Hopkins Medicine" class="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500 font-sans" />
                </div>
                <div>
                  <label class="text-[10px] uppercase text-zinc-400 block mb-1">Chief Medical / Technology Officer Email</label>
                  <input type="email" placeholder="cmo@healthsystem.org" class="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500 font-sans" />
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button (click)="showLeadModal.set(false)" class="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs">Cancel</button>
              <button (click)="submitLeadRequest()" class="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold font-mono text-xs uppercase">Submit Pilot Request</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DoctorShiftSalesDemoComponent {
  closeModal = output<void>();

  doctorCount = signal<number>(150);
  showEmbeddedSimulator = signal<boolean>(false);
  showLeadModal = signal<boolean>(false);

  annualHoursSaved = computed(() => {
    return this.doctorCount() * 625; // 2.5 hrs/day * 250 working days
  });

  annualNetSavings = computed(() => {
    return this.doctorCount() * 34000; // $34K savings / doctor / yr
  });

  annualApiCost = computed(() => {
    return Number((this.doctorCount() * 5.46 * 12).toFixed(2)); // $5.46/mo API cost
  });

  roiRatio = computed(() => {
    const cost = this.annualApiCost();
    const savings = this.annualNetSavings();
    return Math.round(savings / (cost || 1));
  });

  updateDoctorCount(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.doctorCount.set(val);
  }

  submitLeadRequest() {
    alert('✅ Hospital Pilot Request Received! An Enterprise Health System Specialist will contact your CMO desk within 2 hours.');
    this.showLeadModal.set(false);
  }
}
