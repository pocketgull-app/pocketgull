import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeepSpaceCdsService, IDeepSpaceTriageResult, DeepSpaceProtocolId } from '../services/deep-space-cds.service';

@Component({
  selector: 'app-deep-space-cds-terminal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-black text-zinc-100 rounded-2xl border border-amber-900/50 shadow-2xl space-y-6 font-mono">
      <!-- Deep-Space Terminal Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-950 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400 text-lg">🛰️</span>
            <div>
              <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                POCKET-GULL DEEP-SPACE AUTONOMOUS CDS
                <span class="text-xs uppercase px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                  100% AIR-GAPPED OFFLINE
                </span>
              </h2>
              <p class="text-xs text-zinc-400">
                Mars One-Way Comms Latency: <span class="text-amber-400 font-bold">14.2 min</span> | 
                Local Gemma 3 Engine: <span class="text-emerald-400 font-bold">ONLINE (0ms Latency)</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Emergency Protocol Quick Triggers -->
        <div class="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            (click)="triggerEmergency('EVA_HEMORRHAGE_TRAUMA')"
            class="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700 transition-colors"
          >
            🚨 EVA Trauma
          </button>
          <button
            type="button"
            (click)="triggerEmergency('HYPERCAPNIA_CO2_TOXICITY')"
            class="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700 transition-colors"
          >
            ⚠️ CO2 Toxicity
          </button>
          <button
            type="button"
            (click)="triggerEmergency('ACUTE_SANS_DISC_EDEMA')"
            class="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700 transition-colors"
          >
            👁️ SANS Edema
          </button>
        </div>
      </div>

      <!-- Live Autonomous Triage Summary -->
      @if (activeTriage(); as t) {
        <div class="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <span class="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Autonomous Diagnosis</span>
              <h3 class="text-lg font-bold text-white mt-0.5">{{ t.primaryDiagnosis }}</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                Confidence: {{ t.diagnosticConfidencePercent }}%
              </span>
              <span 
                class="text-xs font-bold px-3 py-1.5 rounded-lg uppercase border"
                [ngClass]="{
                  'bg-rose-950 text-rose-300 border-rose-700 animate-pulse': t.triageSeverity === 'STAT_EMERGENCY',
                  'bg-amber-950 text-amber-300 border-amber-700': t.triageSeverity === 'URGENT_MONITOR',
                  'bg-zinc-900 text-zinc-300 border-zinc-700': t.triageSeverity === 'ROUTINE_SELF_CARE'
                }"
              >
                {{ t.triageSeverity.replace('_', ' ') }}
              </span>
            </div>
          </div>

          <!-- Actionable Checklist Steps -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">⚡ STAT Emergency Clinical Directives</h4>
            <div class="space-y-2">
              @for (act of t.immediateActions; track act; let i = $index) {
                <div class="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 flex items-start gap-3 text-xs">
                  <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">{{ i + 1 }}</span>
                  <span class="text-zinc-200 leading-relaxed">{{ act }}</span>
                </div>
              }
            </div>
          </div>

          <!-- POCUS Ultrasound Guidance & Formulary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <!-- Flight Formulary Dispense -->
            <div class="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-2">
              <div class="text-xs font-bold text-cyan-400 uppercase">💊 Medical Locker Dispensation</div>
              @if (t.formularyItemsToDispense.length > 0) {
                <div class="space-y-1.5 text-xs">
                  @for (drug of t.formularyItemsToDispense; track drug.drugName) {
                    <div class="p-2.5 bg-black/60 rounded border border-zinc-800 flex justify-between items-center">
                      <span class="font-bold text-white">{{ drug.drugName }}</span>
                      <span class="text-zinc-400 font-mono">{{ drug.dosage }} (Stock: {{ drug.remainingUnits }})</span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-xs text-zinc-500">No emergency injectable or controlled substances required.</p>
              }
            </div>

            <!-- Ground Control Delayed Telemetry Burst -->
            <div class="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-3">
              <div>
                <div class="text-xs font-bold text-purple-400 uppercase">📡 Earth Telemetry Burst Status</div>
                <p class="text-[11px] text-zinc-400 mt-1">
                  Autonomous intervention applied at T+0s. Burst transmission queued for Houston DSN window. One-way latency: 14.2 min.
                </p>
              </div>
              <button
                type="button"
                (click)="transmitEarthBurst()"
                class="w-full py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                Transmit Ground Control Packet
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Flight Pharmacy Formulary Inventory Table -->
      <div class="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
        <div class="flex justify-between items-center">
          <h4 class="text-xs font-bold uppercase text-zinc-400 tracking-wider">Flight Locker Medication Potency & Radiation Flux</h4>
          <span class="text-[11px] text-zinc-500">GCR Shielding Factor: 8.2 g/cm² Al-Eq</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-zinc-800 text-zinc-500 text-[11px] uppercase">
                <th class="pb-2">Medication Name</th>
                <th class="pb-2">Stock Level</th>
                <th class="pb-2">Indication</th>
                <th class="pb-2">GCR Potency Decay</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900">
              @for (item of formulary(); track item.id) {
                <tr class="hover:bg-zinc-900/40 transition-colors">
                  <td class="py-2.5 font-bold text-white">{{ item.name }}</td>
                  <td class="py-2.5 font-mono text-cyan-300">{{ item.quantityUnits }} {{ item.unitType }}</td>
                  <td class="py-2.5 text-zinc-400">{{ item.indication }}</td>
                  <td class="py-2.5 font-mono text-amber-400">-{{ item.radiationDegradationPercent }}%</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DeepSpaceCdsTerminalComponent {
  private cdsService = inject(DeepSpaceCdsService);

  formulary = this.cdsService.flightFormulary;
  activeTriage = signal<IDeepSpaceTriageResult | null>(null);

  constructor() {
    // Initialize with standard SANS case
    this.triggerEmergency('ACUTE_SANS_DISC_EDEMA');
  }

  triggerEmergency(protocolId: DeepSpaceProtocolId): void {
    if (protocolId === 'EVA_HEMORRHAGE_TRAUMA') {
      const res = this.cdsService.evaluateAutonomousTriage(
        ['Active arterial bleed right thigh during airlock egress'],
        { heartRate: 132, systolicBp: 82, spo2Percent: 91, co2Ppm: 650 }
      );
      this.activeTriage.set(res);
    } else if (protocolId === 'HYPERCAPNIA_CO2_TOXICITY') {
      const res = this.cdsService.evaluateAutonomousTriage(
        ['Throbbing headache', 'dizziness', 'scrubber canister alert'],
        { heartRate: 98, systolicBp: 140, spo2Percent: 97, co2Ppm: 5600 }
      );
      this.activeTriage.set(res);
    } else if (protocolId === 'ACUTE_SANS_DISC_EDEMA') {
      const res = this.cdsService.evaluateAutonomousTriage(
        ['Blurred vision', 'hyperopic shift', 'retinal thickness elevation'],
        { heartRate: 72, systolicBp: 120, spo2Percent: 99, co2Ppm: 1200, intracranialPressureMmHg: 24 }
      );
      this.activeTriage.set(res);
    }
  }

  transmitEarthBurst(): void {
    const triage = this.activeTriage();
    if (!triage) return;

    const packet = this.cdsService.generateTelemetryBurstPacket(
      'ASTRONAUT-ARTEMIS-07',
      triage.primaryDiagnosis,
      { hr: 88, bp: '120/78', spo2: 99 }
    );

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    }
  }
}
