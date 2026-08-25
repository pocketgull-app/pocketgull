/**
 * Clinical Game Theory HSA Incentive Network Component
 *
 * Direct integration of Stackelberg / Nash equilibrium adherence rebates (r*)
 * with patient HSA/FSA debit cards and IRS §223/§213(d) qualified expense substantiation.
 *
 * @module components/hsa-incentive-network.component
 */
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HsaIncentiveBridgeService, IHsaRebateTransaction } from '../services/hsa-incentive-bridge.service';

@Component({
  selector: 'app-hsa-incentive-network',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-zinc-950 text-white border border-emerald-500/30 shadow-2xl space-y-6 font-mono animate-in fade-in duration-300">
      
      <!-- Top Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner">
            💳
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              Clinical Game Theory HSA Incentive Network
              <span class="px-2.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40">
                IRS §223 / §213(d) Compliant
              </span>
            </h3>
            <p class="text-xs text-zinc-400 font-sans">
              Direct Stackelberg equilibrium adherence rebate ($r^*$) disbursement to patient HSA/FSA debit cards.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs">
          <span class="text-zinc-400">Total Settled:</span>
          <span class="text-base font-bold text-emerald-400">\${{ hsa.totalRebatesSettled() | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Main Layout: Metallic Card + Stackelberg Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Metallic 3D-Styled HSA Debit Card (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between">
            <span>Linked HSA/FSA Debit Card</span>
            <span class="text-[10px] text-emerald-400">IIAS Auto-Substantiated</span>
          </h4>

          <!-- Virtual Metallic Obsidian Card Visual -->
          <div class="relative w-full aspect-[1.586/1] rounded-3xl p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-emerald-500/40 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-emerald-400 transition-all duration-300">
            <!-- Ambient Card Glow -->
            <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
            
            <!-- Card Top Row: Chip & Type -->
            <div class="flex justify-between items-center z-10">
              <div class="flex items-center gap-3">
                <!-- Gold EMV Chip Graphic -->
                <div class="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border border-amber-300/80 shadow-xs flex items-center justify-center">
                  <div class="w-6 h-4 border border-amber-800/40 rounded-xs"></div>
                </div>
                <!-- Contactless Indicator -->
                <span class="text-zinc-500 text-xs">📡 Contactless</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {{ hsa.linkedCard().cardType }} DEBIT
              </span>
            </div>

            <!-- Card Middle Row: PAN & Live Balance -->
            <div class="space-y-1 z-10 my-auto">
              <div class="text-lg sm:text-xl font-bold tracking-widest text-zinc-200">
                {{ hsa.linkedCard().maskedPan }}
              </div>
              <div class="flex justify-between items-baseline pt-1">
                <div>
                  <span class="text-[9px] uppercase tracking-wider text-zinc-500 block">Available HSA Balance</span>
                  <span class="text-2xl font-black text-emerald-400">\${{ hsa.linkedCard().currentHsaBalanceUsd | number:'1.2-2' }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[9px] uppercase tracking-wider text-zinc-500 block">Lifetime Rebates</span>
                  <span class="text-sm font-bold text-cyan-300">+\${{ hsa.linkedCard().lifetimeRebatesEarnedUsd | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Row: Member Name & Expiry -->
            <div class="flex justify-between items-end z-10 text-xs text-zinc-400">
              <div>
                <span class="text-[9px] uppercase text-zinc-500 block">Cardholder</span>
                <span class="font-bold text-zinc-200">{{ hsa.linkedCard().cardholderName }}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] uppercase text-zinc-500 block">Expires</span>
                <span class="font-bold text-zinc-200">{{ hsa.linkedCard().expiry }}</span>
              </div>
            </div>
          </div>

          <!-- Quick 1-Click Adherence Payout Simulator -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h5 class="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>⚡ Instant Adherence Payout Triggers</span>
              <span class="text-[10px] text-emerald-400">Auto-Disburse</span>
            </h5>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button 
                type="button"
                (click)="triggerAdherence('MEDICATION_PDC', 15.00, 'Morning Prescription Adherence Confirmed')"
                class="p-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-950/80 hover:border-emerald-500/50 border border-zinc-700 text-left transition flex items-center justify-between cursor-pointer">
                <span>💊 Rx Adherence</span>
                <span class="font-bold text-emerald-400">+$15.00</span>
              </button>

              <button 
                type="button"
                (click)="triggerAdherence('BP_HOMEOSTASIS', 20.00, 'Target BP Corridor Maintained (<125/82)')"
                class="p-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-950/80 hover:border-emerald-500/50 border border-zinc-700 text-left transition flex items-center justify-between cursor-pointer">
                <span>🩺 BP Target</span>
                <span class="font-bold text-emerald-400">+$20.00</span>
              </button>

              <button 
                type="button"
                (click)="triggerAdherence('ZONE2_ACTIVITY', 10.00, '7,500 Daily Steps / Zone 2 Completed')"
                class="p-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-950/80 hover:border-emerald-500/50 border border-zinc-700 text-left transition flex items-center justify-between cursor-pointer">
                <span>👟 7.5k Steps</span>
                <span class="font-bold text-emerald-400">+$10.00</span>
              </button>

              <button 
                type="button"
                (click)="triggerAdherence('CHRONO_FASTING', 10.00, '14-Hour Chrono-Fasting Window Respected')"
                class="p-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-950/80 hover:border-emerald-500/50 border border-zinc-700 text-left transition flex items-center justify-between cursor-pointer">
                <span>🌙 Chrono Fast</span>
                <span class="font-bold text-emerald-400">+$10.00</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Stackelberg Equilibrium Solver & Ledger (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Stackelberg / Nash Equilibrium Calculator HUD -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <span>⚖️ Stackelberg Equilibrium Adherence Solver ($r^*$)</span>
              </h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PDC Target: {{ hsa.equilibriumResult().targetPdcPercent }}%
              </span>
            </div>

            <!-- Parameters Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="space-y-1">
                <div class="flex justify-between text-[11px] text-zinc-400">
                  <span>Annual Patient Copay Friction:</span>
                  <span class="text-amber-400 font-bold">\${{ hsa.annualCopayInput() }} / yr</span>
                </div>
                <input 
                  type="range" min="100" max="1200" step="50" 
                  [value]="hsa.annualCopayInput()" 
                  (input)="hsa.annualCopayInput.set(asNumber($event))"
                  class="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-[11px] text-zinc-400">
                  <span>Avoided Inpatient Risk Value:</span>
                  <span class="text-cyan-400 font-bold">\${{ hsa.avoidedHospitalizationInput() | number }} / yr</span>
                </div>
                <input 
                  type="range" min="5000" max="30000" step="1000" 
                  [value]="hsa.avoidedHospitalizationInput()" 
                  (input)="hsa.avoidedHospitalizationInput.set(asNumber($event))"
                  class="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <!-- Equilibrium Outcomes Card -->
            <div class="p-3 rounded-xl bg-black/60 border border-zinc-800 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <span class="text-[9px] uppercase text-zinc-500 block">Optimal Subsidy ($r^*$)</span>
                <span class="text-lg font-black text-emerald-400">\${{ hsa.equilibriumResult().optimalRebateSubsidyUsd }} / yr</span>
              </div>
              <div>
                <span class="text-[9px] uppercase text-zinc-500 block">Equilibrium PDC Effort</span>
                <span class="text-lg font-black text-indigo-400">{{ hsa.equilibriumResult().patientStrategy.adherenceEffortPercent }}%</span>
              </div>
              <div>
                <span class="text-[9px] uppercase text-zinc-500 block">Net Payer Savings</span>
                <span class="text-lg font-black text-cyan-400">+\${{ hsa.equilibriumResult().payerStrategy.netPayerSavingsUsd | number }}</span>
              </div>
            </div>

            <div class="text-[10px] text-zinc-400 font-sans italic">
              {{ hsa.equilibriumResult().gameTheoryDirective }}
            </div>
          </div>

          <!-- Real-Time HSA Settlement Ledger Feed -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between">
              <span>📜 Real-Time Adherence Disbursement Ledger</span>
              <span class="text-[10px] text-zinc-500">{{ hsa.transactions().length }} Settled Transactions</span>
            </h4>

            <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
              @for (tx of hsa.transactions(); track tx.id) {
                <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/40 transition text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {{ tx.id }}
                      </span>
                      <span class="text-[11px] font-bold text-zinc-200">{{ tx.ruleDescription }}</span>
                    </div>
                    <span class="font-black text-emerald-400 text-sm">+\${{ tx.amountUsd | number:'1.2-2' }}</span>
                  </div>

                  <div class="flex items-center justify-between text-[10px] text-zinc-500 font-sans pt-0.5">
                    <span>{{ tx.timestamp }} &bull; {{ tx.irsSubstantiationCode }}</span>
                    <span class="text-cyan-400 font-mono font-bold">{{ tx.transactionStatus }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class HsaIncentiveNetworkComponent {
  hsa = inject(HsaIncentiveBridgeService);

  asNumber(event: Event): number {
    return parseFloat((event.target as HTMLInputElement).value) || 0;
  }

  triggerAdherence(domain: IHsaRebateTransaction['adherenceDomain'], amount: number, desc: string): void {
    this.hsa.disburseAdherenceRebate(domain, amount, desc);
  }
}
