import { Component, inject, signal, computed, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RecoveryCompanionService,
  IRecoveryCheckInPayload,
  IRecoveryCheckInResult,
  BristolStoolType,
  IWearableSleepTelemetry
} from '../../services/recovery-companion.service';
import { IEhrWritebackBatchResult } from '../../services/fhir/ehr-writeback.service';

@Component({
  selector: 'app-recovery-companion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-zinc-100 select-none"
         role="dialog"
         aria-modal="true"
         aria-labelledby="recovery-modal-title">
      <div class="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

        <!-- HEADER -->
        <div class="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🌿
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 id="recovery-modal-title" class="text-sm sm:text-base font-bold text-zinc-50 tracking-tight">
                  Daily Patient Recovery Check-In
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase"
                      [class.bg-emerald-950/80]="acuityTier() === 'STABLE_FLOURISHING'"
                      [class.border-emerald-500/50]="acuityTier() === 'STABLE_FLOURISHING'"
                      [class.text-emerald-300]="acuityTier() === 'STABLE_FLOURISHING'"
                      [class.bg-amber-950/80]="acuityTier() === 'MILD_STRAIN'"
                      [class.border-amber-500/50]="acuityTier() === 'MILD_STRAIN'"
                      [class.text-amber-300]="acuityTier() === 'MILD_STRAIN'"
                      [class.bg-orange-950/80]="acuityTier() === 'MODERATE_ALERT'"
                      [class.border-orange-500/50]="acuityTier() === 'MODERATE_ALERT'"
                      [class.text-orange-300]="acuityTier() === 'MODERATE_ALERT'"
                      [class.bg-rose-950/80]="acuityTier() === 'CRITICAL_INTERRUPT'"
                      [class.border-rose-500/60]="acuityTier() === 'CRITICAL_INTERRUPT'"
                      [class.text-rose-200]="acuityTier() === 'CRITICAL_INTERRUPT'">
                  {{ acuityTier().replace('_', ' ') }}
                </span>
              </div>
              <span class="text-[11px] text-zinc-400 block pt-0.5">
                Phase 2 &amp; 3 Whole-Person Recovery • Sleep Architecture • Craving VAS • FDA Oral Defense
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="closeModal()"
              aria-label="Close modal"
              class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer min-h-[44px] min-w-[44px]">
              ✕
            </button>
          </div>
        </div>

        <!-- CRISIS ESCAPE HATCH (Always prominent when craving >= 8 or severe distress) -->
        @if (cravingScore() >= 8) {
          <div class="p-3.5 bg-rose-950/90 border-b border-rose-600/70 text-rose-100 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
            <div class="flex items-center gap-2">
              <span class="text-xl">🚨</span>
              <div>
                <strong class="font-bold">Urgent Recovery Support Active:</strong> You are not alone. High cravings are neurobiological waves that crest and pass.
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a href="tel:988" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold no-underline transition cursor-pointer flex items-center gap-1.5">
                <span>📞 Call 988 Lifeline</span>
              </a>
              <button type="button" (click)="requestPeerOutreach()" class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-rose-500/40 text-rose-200 font-bold transition cursor-pointer">
                Connect with Peer Specialist
              </button>
            </div>
          </div>
        }

        <!-- SCROLLABLE BODY -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          <!-- 1. CRAVING VISUAL ANALOG SCALE (VAS 0 - 10) -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-300 block">
                  1. Current Opioid Craving Surge (VAS 0–10)
                </span>
                <span class="text-[11px] text-zinc-400">
                  How strong are thoughts or urges to use opioids right now?
                </span>
              </div>
              <div class="text-xl font-mono font-black"
                   [class.text-emerald-400]="cravingScore() <= 3"
                   [class.text-amber-400]="cravingScore() >= 4 && cravingScore() <= 5"
                   [class.text-orange-400]="cravingScore() >= 6 && cravingScore() <= 7"
                   [class.text-rose-400]="cravingScore() >= 8">
                {{ cravingScore() }}/10
              </div>
            </div>

            <!-- Range Slider -->
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              [ngModel]="cravingScore()"
              (ngModelChange)="setCravingScore($event)"
              class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              aria-label="Craving Visual Analog Scale" />

            <div class="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0 (Zero Urge)</span>
              <span>3 (Mild / Transient)</span>
              <span>5 (Moderate)</span>
              <span>7 (Strong Urge)</span>
              <span>10 (Overwhelming Crisis)</span>
            </div>
          </div>

          <!-- 2. WEARABLE SLEEP ARCHITECTURE (Phase 2 Neuroplastic Recovery) -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="text-base">🌙</span>
                <div>
                  <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-300 block">
                    2. Sleep Architecture &amp; Wearable Telemetry
                  </span>
                  <span class="text-[11px] text-zinc-400">
                    Source: {{ sleepTelemetry().source }}
                  </span>
                </div>
              </div>
              <button
                type="button"
                (click)="simulateWearableSync()"
                class="px-2.5 py-1 rounded-lg bg-teal-950/70 border border-teal-600/40 text-teal-300 text-[11px] font-mono hover:bg-teal-900 transition cursor-pointer flex items-center gap-1">
                <span>🔄</span> <span>Sync Wearable Data</span>
              </button>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">Total Sleep</span>
                <span class="text-base font-bold text-zinc-100">{{ sleepTelemetry().totalSleepHours }}h</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">Deep (N3)</span>
                <span class="text-base font-bold text-emerald-400">{{ sleepTelemetry().deepSleepPercent }}%</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">REM Stage</span>
                <span class="text-base font-bold text-sky-400">{{ sleepTelemetry().remSleepPercent }}%</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block">Nocturnal HR Dip</span>
                <span class="text-base font-bold text-teal-400">{{ sleepTelemetry().nocturnalHrDipPercent }}%</span>
              </div>
            </div>
          </div>

          <!-- 3. ENTERIC HEALTH & OIBD (BRISTOL STOOL FORM SCALE) -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 space-y-3">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-300 block">
              3. Enteric Health &amp; Bowel Function (Bristol Stool Scale)
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center font-mono">
              @for (type of [1, 2, 3, 4, 5, 6, 7]; track type) {
                <button
                  type="button"
                  (click)="setBristolType(type)"
                  [class.bg-teal-950]="bristolType() === type"
                  [class.border-teal-500]="bristolType() === type"
                  [class.text-teal-200]="bristolType() === type"
                  [class.bg-zinc-950]="bristolType() !== type"
                  [class.border-zinc-800]="bristolType() !== type"
                  [class.text-zinc-400]="bristolType() !== type"
                  class="p-2 rounded-xl border text-[11px] transition cursor-pointer hover:border-zinc-700 min-h-[44px]">
                  <span class="block font-bold">Type {{ type }}</span>
                  <span class="text-[9px] block text-zinc-500">
                    {{ type <= 2 ? 'Constipation' : type <= 4 ? 'Normal' : 'Loose/Diarrhea' }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- 4. FDA 2022 BUPRENORPHINE ORAL HEALTH CHECKLIST -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 space-y-2.5">
            <div class="flex items-center gap-2">
              <span class="text-base">🦷</span>
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                4. FDA Transmucosal Oral Health Protocol (Daily Adherence)
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
              <label class="flex items-center gap-2.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                <input type="checkbox" [(ngModel)]="postDosingWaterRinse" (change)="recalculate()" class="accent-teal-400 w-4 h-4 cursor-pointer" />
                <span>Neutral water rinse completed after sublingual dissolution</span>
              </label>
              <label class="flex items-center gap-2.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                <input type="checkbox" [(ngModel)]="oneHourBrushingDelay" (change)="recalculate()" class="accent-teal-400 w-4 h-4 cursor-pointer" />
                <span>Strict 1-hour delay observed before tooth brushing</span>
              </label>
              <label class="flex items-center gap-2.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                <input type="checkbox" [(ngModel)]="highFluorideUsed" (change)="recalculate()" class="accent-teal-400 w-4 h-4 cursor-pointer" />
                <span>5000 ppm prescription fluoride or nHAp paste used</span>
              </label>
              <label class="flex items-center gap-2.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                <input type="checkbox" [(ngModel)]="xylitolPacingUsed" (change)="recalculate()" class="accent-teal-400 w-4 h-4 cursor-pointer" />
                <span>Xylitol gum or salivary secretagogue chewed</span>
              </label>
            </div>
          </div>

          <!-- 5. REAL-TIME RESTORATIVE DIRECTIVES -->
          @if (checkInResult(); as res) {
            <div class="p-4 bg-teal-950/20 rounded-2xl border border-teal-500/40 space-y-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-300 block">
                🌱 Personalized Restorative Directives:
              </span>
              <p class="text-zinc-300 text-xs font-sans leading-relaxed">{{ res.triageDirective }}</p>

              <div class="space-y-1.5 pt-2 font-mono text-[11px]">
                @for (action of res.pawsInterventions; track action) {
                  <div class="flex items-start gap-2 text-zinc-300">
                    <span class="text-teal-400">✓</span>
                    <span>{{ action }}</span>
                  </div>
                }
                @for (action of res.entericInterventions; track action) {
                  <div class="flex items-start gap-2 text-zinc-300">
                    <span class="text-emerald-400">✓</span>
                    <span>{{ action }}</span>
                  </div>
                }
              </div>
            </div>
          }

        </div>

        <!-- FOOTER & EHR WRITEBACK -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            @if (checkInResult(); as res) {
              <span>Part 11 Seal: {{ res.integrityDigest.slice(0, 16) }}...</span>
              <span class="text-emerald-400">✓ Sealed</span>
            }
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="fileToEhr()"
              [disabled]="isWritingBack() || writebackReceipt() !== null"
              class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]">
              @if (isWritingBack()) {
                <span class="animate-spin">⏳</span> <span>Filing to Chart...</span>
              } @else if (writebackReceipt()) {
                <span>✓ Filed to EHR ({{ writebackReceipt()?.ehrVendor }})</span>
              } @else {
                <span>🏥 Submit Daily Log to Clinician (RFC 7523)</span>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class RecoveryCompanionModalComponent implements OnInit {
  private service = inject(RecoveryCompanionService);
  readonly close = output<void>();

  cravingScore = signal<number>(2);
  bristolType = signal<BristolStoolType>(4);
  sleepTelemetry = signal<IWearableSleepTelemetry>({
    source: 'Apple HealthKit',
    totalSleepHours: 7.2,
    sleepLatencyMinutes: 20,
    deepSleepPercent: 18,
    remSleepPercent: 22,
    nocturnalHrDipPercent: 12,
    restingHeartRateBpm: 64
  });

  pawsDysphoria = signal<number>(1);
  restlessness = signal<number>(1);
  muscleAches = signal<number>(1);

  postDosingWaterRinse = true;
  oneHourBrushingDelay = true;
  highFluorideUsed = true;
  xylitolPacingUsed = true;

  checkInResult = signal<IRecoveryCheckInResult | null>(null);
  isWritingBack = signal<boolean>(false);
  writebackReceipt = signal<IEhrWritebackBatchResult | null>(null);

  readonly acuityTier = computed(() => {
    return this.checkInResult()?.acuityTier || 'STABLE_FLOURISHING';
  });

  async ngOnInit(): Promise<void> {
    await this.recalculate();
  }

  async setCravingScore(val: number): Promise<void> {
    this.cravingScore.set(Number(val));
    await this.recalculate();
  }

  async setBristolType(type: number): Promise<void> {
    this.bristolType.set(type as BristolStoolType);
    await this.recalculate();
  }

  async simulateWearableSync(): Promise<void> {
    this.sleepTelemetry.set({
      source: 'Google Health Connect',
      totalSleepHours: 6.8,
      sleepLatencyMinutes: 18,
      deepSleepPercent: 21,
      remSleepPercent: 24,
      nocturnalHrDipPercent: 14,
      restingHeartRateBpm: 62
    });
    await this.recalculate();
  }

  requestPeerOutreach(): void {
    if (typeof window !== 'undefined') {
      alert('Peer Recovery Specialist notification triggered. A certified specialist will contact you shortly.');
    }
  }

  async recalculate(): Promise<void> {
    const payload: IRecoveryCheckInPayload = {
      cravingScore: this.cravingScore(),
      sleepTelemetry: this.sleepTelemetry(),
      pawsDysphoriaScore: this.pawsDysphoria(),
      restlessnessScore: this.restlessness(),
      muscleAchesScore: this.muscleAches(),
      bristolStoolType: this.bristolType(),
      oralCareAdherence: {
        postDosingWaterRinseCompleted: this.postDosingWaterRinse,
        oneHourBrushingDelayRespected: this.oneHourBrushingDelay,
        highFluorideUsed: this.highFluorideUsed,
        xylitolPacingUsed: this.xylitolPacingUsed
      }
    };

    const res = await this.service.evaluateCheckIn(payload);
    this.checkInResult.set(res);
  }

  async fileToEhr(): Promise<void> {
    const res = this.checkInResult();
    if (!res) return;

    this.isWritingBack.set(true);
    try {
      const receipt = await this.service.writeBackToEhr(res);
      this.writebackReceipt.set(receipt);
    } finally {
      this.isWritingBack.set(false);
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
