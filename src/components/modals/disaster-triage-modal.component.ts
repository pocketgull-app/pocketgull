import { Component, ChangeDetectionStrategy, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../../services/patient-state.service';

export type TDisasterTag = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export interface IDisasterCasualty {
  id: string;
  tag: TDisasterTag;
  age: number;
  gender: string;
  mechanism: string;
  canWalk: boolean;
  respiratoryRate: number;
  radialPulse: 'present' | 'weak' | 'absent';
  capillaryRefillSec: number;
  mentalStatus: 'follows_commands' | 'unresponsive_or_confused';
  lifesavingInterventions: string[];
  assignedArea: string;
  admitTime: string;
}

export interface IDisasterCapacity {
  traumaBaysOccupied: number;
  traumaBaysTotal: number;
  icuCotsOccupied: number;
  icuCotsTotal: number;
  acuteBedsOccupied: number;
  acuteBedsTotal: number;
  ambulatoryCotsOccupied: number;
  ambulatoryCotsTotal: number;
}

@Component({
  selector: 'app-disaster-triage-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-2xl p-2 sm:p-6 flex items-center justify-center overflow-y-auto font-mono text-zinc-100 animate-in fade-in duration-200"
         role="dialog" aria-modal="true" aria-labelledby="disaster-triage-title">
      
      <div class="w-full max-w-6xl bg-zinc-950 rounded-3xl border border-rose-900/60 shadow-[0_0_50px_rgba(225,29,72,0.25)] p-4 sm:p-7 relative overflow-hidden font-mono flex flex-col justify-between max-h-[94vh] gap-4">
        
        <!-- Header Strip -->
        <header class="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 gap-2 shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-ping"></span>
            <div>
              <h2 id="disaster-triage-title" class="text-xs sm:text-base font-black uppercase tracking-tight text-rose-400 flex items-center gap-2">
                <span>🚨</span>
                <span>Mass Casualty / Disaster Rapid Triage Command (START / SALT)</span>
              </h2>
              <p class="text-[11px] text-zinc-400 font-sans">
                Tactile Physical Verification (Radial Pulse & Capillary Refill) • Surge Capacity HUD • NDMS / ICS-206
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 font-mono text-xs">
            <div class="px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-black text-[11px] tracking-wider animate-pulse">
              SURGE STATUS: CODE RED ACTIVE
            </div>
            <button type="button" (click)="close.emit()" aria-label="Close modal"
                    class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition cursor-pointer">
              ✕
            </button>
          </div>
        </header>

        <!-- Main Workspace -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          <!-- Capacity & Surge HUD Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div class="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>TRAUMA BAYS</span>
                <span class="text-rose-400 font-bold">{{ capacity().traumaBaysOccupied }}/{{ capacity().traumaBaysTotal }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div class="h-full bg-rose-500 transition-all duration-300"
                     [style.width.%]="(capacity().traumaBaysOccupied / capacity().traumaBaysTotal) * 100"></div>
              </div>
              <div class="text-[10px] text-zinc-500 font-mono">
                {{ capacity().traumaBaysTotal - capacity().traumaBaysOccupied }} Bays Available
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div class="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>ICU / RESUS COTS</span>
                <span class="text-amber-400 font-bold">{{ capacity().icuCotsOccupied }}/{{ capacity().icuCotsTotal }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div class="h-full bg-amber-500 transition-all duration-300"
                     [style.width.%]="(capacity().icuCotsOccupied / capacity().icuCotsTotal) * 100"></div>
              </div>
              <div class="text-[10px] text-zinc-500 font-mono">
                {{ capacity().icuCotsTotal - capacity().icuCotsOccupied }} Cots Available
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div class="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>STEP-DOWN / ACUTE</span>
                <span class="text-yellow-400 font-bold">{{ capacity().acuteBedsOccupied }}/{{ capacity().acuteBedsTotal }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div class="h-full bg-yellow-500 transition-all duration-300"
                     [style.width.%]="(capacity().acuteBedsOccupied / capacity().acuteBedsTotal) * 100"></div>
              </div>
              <div class="text-[10px] text-zinc-500 font-mono">
                {{ capacity().acuteBedsTotal - capacity().acuteBedsOccupied }} Beds Available
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div class="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>AMBULATORY (GREEN)</span>
                <span class="text-emerald-400 font-bold">{{ capacity().ambulatoryCotsOccupied }}/{{ capacity().ambulatoryCotsTotal }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-300"
                     [style.width.%]="(capacity().ambulatoryCotsOccupied / capacity().ambulatoryCotsTotal) * 100"></div>
              </div>
              <div class="text-[10px] text-zinc-500 font-mono">
                {{ capacity().ambulatoryCotsTotal - capacity().ambulatoryCotsOccupied }} Cots Available
              </div>
            </div>

          </div>

          <!-- Rapid Tactile Triage Station (The Officer's Rapid Assessment Console) -->
          <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div class="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-2 gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base">✋</span>
                <h3 class="text-xs font-mono font-black uppercase text-zinc-100">
                  Bedside Tactile Physical Assessment Console
                </h3>
              </div>
              
              <!-- Resulting Tag Badge -->
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-zinc-400">CALCULATED TAG:</span>
                <span class="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase tracking-wider"
                      [class]="computedTagBadgeClass()">
                  {{ computedTag() }} ({{ computedTagDescription() }})
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <!-- 1. Ambulatory -->
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label class="text-[11px] font-bold text-zinc-300 uppercase block">1. Walking / Ambulatory?</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="canWalk.set(true)"
                          [class]="canWalk() ? 'bg-emerald-600 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400'"
                          class="py-1.5 rounded-lg border border-zinc-700 text-xs transition cursor-pointer">
                    🚶 Yes (Walks)
                  </button>
                  <button type="button" (click)="canWalk.set(false)"
                          [class]="!canWalk() ? 'bg-rose-950 border-rose-700 text-rose-300 font-bold' : 'bg-zinc-900 text-zinc-400'"
                          class="py-1.5 rounded-lg border border-zinc-700 text-xs transition cursor-pointer">
                    🛑 No (Stretcher)
                  </button>
                </div>
              </div>

              <!-- 2. Respirations -->
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label class="text-[11px] font-bold text-zinc-300 uppercase block">
                  2. Breathing: {{ respRate() }} bpm
                </label>
                <input type="range" min="0" max="45" step="1" [ngModel]="respRate()" (ngModelChange)="respRate.set($event)"
                       class="w-full accent-rose-500 cursor-pointer">
                <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span [class.text-rose-400]="respRate() === 0">0 (Apneic)</span>
                  <span [class.text-emerald-400]="respRate() >= 10 && respRate() <= 29">10-29 (Normal)</span>
                  <span [class.text-rose-400]="respRate() >= 30">&ge; 30 (Rapid)</span>
                </div>
              </div>

              <!-- 3. Perfusion (Radial Pulse & Capillary Refill) -->
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label class="text-[11px] font-bold text-zinc-300 uppercase block">3. Perfusion (Tactile)</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="radialPulse.set('present')"
                          [class]="radialPulse() === 'present' ? 'bg-emerald-600 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400'"
                          class="py-1 rounded-lg border border-zinc-700 text-[11px] transition cursor-pointer">
                    Pulse: Present
                  </button>
                  <button type="button" (click)="radialPulse.set('absent')"
                          [class]="radialPulse() === 'absent' ? 'bg-rose-950 border-rose-700 text-rose-300 font-bold' : 'bg-zinc-900 text-zinc-400'"
                          class="py-1 rounded-lg border border-zinc-700 text-[11px] transition cursor-pointer">
                    Pulse: Absent
                  </button>
                </div>
                <div class="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-850">
                  <span class="text-zinc-400">Cap Refill:</span>
                  <button type="button" (click)="toggleCapRefill()"
                          [class]="capRefillOver2() ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'"
                          class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 cursor-pointer">
                    {{ capRefillOver2() ? '> 2 sec (Delayed)' : '≤ 2 sec (Normal)' }}
                  </button>
                </div>
              </div>

              <!-- 4. Mental Status -->
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label class="text-[11px] font-bold text-zinc-300 uppercase block">4. Mental Commands</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="mentalStatus.set('follows_commands')"
                          [class]="mentalStatus() === 'follows_commands' ? 'bg-emerald-600 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400'"
                          class="py-1.5 rounded-lg border border-zinc-700 text-xs transition cursor-pointer">
                    Follows
                  </button>
                  <button type="button" (click)="mentalStatus.set('unresponsive_or_confused')"
                          [class]="mentalStatus() === 'unresponsive_or_confused' ? 'bg-rose-950 border-rose-700 text-rose-300 font-bold' : 'bg-zinc-900 text-zinc-400'"
                          class="py-1.5 rounded-lg border border-zinc-700 text-xs transition cursor-pointer">
                    Altered / No
                  </button>
                </div>
              </div>

            </div>

            <!-- SALT Lifesaving Interventions (LSI) Rapid Checkboxes & Submit -->
            <div class="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3 text-[11px]">
                <span class="font-bold text-rose-400 uppercase font-mono">SALT Interventions:</span>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="lsiTourniquet" class="rounded bg-zinc-900 text-rose-500">
                  <span>Tourniquet (Hemorrhage)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="lsiAirway" class="rounded bg-zinc-900 text-rose-500">
                  <span>Airway Opened</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="lsiDecompression" class="rounded bg-zinc-900 text-rose-500">
                  <span>Needle Decompression</span>
                </label>
              </div>

              <button type="button" (click)="commitNewCasualty()"
                      class="px-4 py-2 rounded-xl bg-rose-600 text-zinc-950 hover:bg-rose-500 font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-1.5">
                <span>➕</span>
                <span>Tag & Admit Casualty</span>
              </button>
            </div>
          </div>

          <!-- Active Disaster Roster Table -->
          <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <h3 class="text-xs font-mono font-black uppercase text-zinc-200 flex items-center gap-2">
                <span>📋</span>
                <span>Incident Surge Roster ({{ casualties().length }} Casualties Logged)</span>
              </h3>
              <div class="flex items-center gap-2 text-[10px] font-mono">
                <span class="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">RED: {{ redCount() }}</span>
                <span class="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">YEL: {{ yellowCount() }}</span>
                <span class="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">GRN: {{ greenCount() }}</span>
                <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold">BLK: {{ blackCount() }}</span>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="border-b border-zinc-800 text-zinc-400 text-[10.5px]">
                    <th class="py-2 px-3">TAG</th>
                    <th class="py-2 px-3">ID / DEMO</th>
                    <th class="py-2 px-3">MECHANISM</th>
                    <th class="py-2 px-3">TACTILE VITALS</th>
                    <th class="py-2 px-3">ASSIGNED BAY</th>
                    <th class="py-2 px-3">TIME</th>
                    <th class="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-850">
                  @for (c of casualties(); track c.id) {
                    <tr class="hover:bg-zinc-850/50 transition">
                      <td class="py-2.5 px-3">
                        <span class="px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase"
                              [class]="getTagColorClass(c.tag)">
                          {{ c.tag }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3 font-semibold text-zinc-200">
                        {{ c.id }} • {{ c.age }}y {{ c.gender }}
                      </td>
                      <td class="py-2.5 px-3 text-zinc-300">
                        {{ c.mechanism }}
                      </td>
                      <td class="py-2.5 px-3 text-[11px] text-zinc-400">
                        Resp: {{ c.respiratoryRate }}/m • Pulse: {{ c.radialPulse }} • CapRefill: {{ c.capillaryRefillSec }}s
                      </td>
                      <td class="py-2.5 px-3 text-teal-400 font-bold text-xs">
                        {{ c.assignedArea }}
                      </td>
                      <td class="py-2.5 px-3 text-zinc-500 text-[11px]">
                        {{ c.admitTime }}
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        <button type="button" (click)="cycleTag(c.id)"
                                class="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-[10px] text-zinc-300 transition cursor-pointer">
                          Re-Tag ▾
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer Strip -->
        <footer class="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-800 text-[10.5px] font-mono text-zinc-500 shrink-0">
          <div>
            ICS-206 Medical Plan Standard • NDMS Disaster Response Certified • Tactile Verification Mandated
          </div>
          <div class="text-zinc-400">
            INCIDENT ID: DISASTER-SEA-{{ todayIncidentId }}
          </div>
        </footer>

      </div>
    </div>
  `
})
export class DisasterTriageModalComponent {
  readonly state = inject(PatientStateService);

  close = output<void>();

  todayIncidentId = Date.now().toString().slice(-6);

  // Tactile assessment state
  canWalk = signal<boolean>(false);
  respRate = signal<number>(22);
  radialPulse = signal<'present' | 'weak' | 'absent'>('present');
  capRefillOver2 = signal<boolean>(false);
  mentalStatus = signal<'follows_commands' | 'unresponsive_or_confused'>('follows_commands');

  // SALT Interventions
  lsiTourniquet = false;
  lsiAirway = false;
  lsiDecompression = false;

  // Capacity tracking
  readonly capacity = signal<IDisasterCapacity>({
    traumaBaysOccupied: 3,
    traumaBaysTotal: 4,
    icuCotsOccupied: 8,
    icuCotsTotal: 10,
    acuteBedsOccupied: 14,
    acuteBedsTotal: 20,
    ambulatoryCotsOccupied: 18,
    ambulatoryCotsTotal: 30
  });

  // Casualty Roster
  readonly casualties = signal<IDisasterCasualty[]>([
    {
      id: 'CAS-101',
      tag: 'RED',
      age: 38,
      gender: 'M',
      mechanism: 'Blast / Tension Pneumothorax',
      canWalk: false,
      respiratoryRate: 36,
      radialPulse: 'weak',
      capillaryRefillSec: 3.5,
      mentalStatus: 'unresponsive_or_confused',
      lifesavingInterventions: ['Needle Decompression'],
      assignedArea: 'Trauma Bay 1',
      admitTime: '08:12'
    },
    {
      id: 'CAS-102',
      tag: 'RED',
      age: 29,
      gender: 'F',
      mechanism: 'Femoral Laceration / Hemorrhagic Shock',
      canWalk: false,
      respiratoryRate: 28,
      radialPulse: 'absent',
      capillaryRefillSec: 4.0,
      mentalStatus: 'unresponsive_or_confused',
      lifesavingInterventions: ['Tourniquet'],
      assignedArea: 'Trauma Bay 2',
      admitTime: '08:15'
    },
    {
      id: 'CAS-103',
      tag: 'YELLOW',
      age: 52,
      gender: 'M',
      mechanism: 'Closed Femur Fracture',
      canWalk: false,
      respiratoryRate: 20,
      radialPulse: 'present',
      capillaryRefillSec: 1.5,
      mentalStatus: 'follows_commands',
      lifesavingInterventions: [],
      assignedArea: 'Acute Bed 4',
      admitTime: '08:18'
    },
    {
      id: 'CAS-104',
      tag: 'GREEN',
      age: 24,
      gender: 'F',
      mechanism: 'Superficial Glass Lacerations',
      canWalk: true,
      respiratoryRate: 16,
      radialPulse: 'present',
      capillaryRefillSec: 1.0,
      mentalStatus: 'follows_commands',
      lifesavingInterventions: [],
      assignedArea: 'Ambulatory Cot 7',
      admitTime: '08:21'
    },
    {
      id: 'CAS-105',
      tag: 'BLACK',
      age: 61,
      gender: 'M',
      mechanism: 'Catastrophic Head Trauma / Apnea',
      canWalk: false,
      respiratoryRate: 0,
      radialPulse: 'absent',
      capillaryRefillSec: 5.0,
      mentalStatus: 'unresponsive_or_confused',
      lifesavingInterventions: ['Airway opened (no spontaneous respiration)'],
      assignedArea: 'Morgue Holding Area',
      admitTime: '08:24'
    }
  ]);

  readonly redCount = computed(() => this.casualties().filter(c => c.tag === 'RED').length);
  readonly yellowCount = computed(() => this.casualties().filter(c => c.tag === 'YELLOW').length);
  readonly greenCount = computed(() => this.casualties().filter(c => c.tag === 'GREEN').length);
  readonly blackCount = computed(() => this.casualties().filter(c => c.tag === 'BLACK').length);

  computedTag = computed<TDisasterTag>(() => {
    // START Algorithm:
    // 1. Ambulatory?
    if (this.canWalk()) {
      return 'GREEN';
    }

    // 2. Respirations?
    const rr = this.respRate();
    if (rr === 0) {
      return 'BLACK';
    }
    if (rr >= 30) {
      return 'RED';
    }

    // 3. Perfusion (Radial pulse / Cap refill)
    if (this.radialPulse() === 'absent' || this.capRefillOver2()) {
      return 'RED';
    }

    // 4. Mental Status
    if (this.mentalStatus() === 'unresponsive_or_confused') {
      return 'RED';
    }

    return 'YELLOW';
  });

  computedTagDescription = computed<string>(() => {
    switch (this.computedTag()) {
      case 'RED': return 'Immediate Resuscitation Required';
      case 'YELLOW': return 'Delayed / Serious but Stable';
      case 'GREEN': return 'Minor / Walking Wounded';
      case 'BLACK': return 'Expectant / Non-Survivable';
    }
  });

  computedTagBadgeClass = computed<string>(() => {
    return this.getTagColorClass(this.computedTag());
  });

  toggleCapRefill(): void {
    this.capRefillOver2.set(!this.capRefillOver2());
  }

  getTagColorClass(tag: TDisasterTag): string {
    switch (tag) {
      case 'RED': return 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.6)]';
      case 'YELLOW': return 'bg-amber-500 text-zinc-950 font-bold';
      case 'GREEN': return 'bg-emerald-600 text-zinc-950 font-bold';
      case 'BLACK': return 'bg-zinc-800 text-zinc-300 border border-zinc-600';
    }
  }

  commitNewCasualty(): void {
    const nextNum = this.casualties().length + 101;
    const tag = this.computedTag();
    let assignedArea = 'Ambulatory Cot';

    if (tag === 'RED') {
      assignedArea = `Trauma Bay ${Math.min(4, this.capacity().traumaBaysOccupied + 1)}`;
      this.capacity.update(cap => ({
        ...cap,
        traumaBaysOccupied: Math.min(cap.traumaBaysTotal, cap.traumaBaysOccupied + 1)
      }));
    } else if (tag === 'YELLOW') {
      assignedArea = `Acute Bed ${Math.min(20, this.capacity().acuteBedsOccupied + 1)}`;
      this.capacity.update(cap => ({
        ...cap,
        acuteBedsOccupied: Math.min(cap.acuteBedsTotal, cap.acuteBedsOccupied + 1)
      }));
    } else if (tag === 'GREEN') {
      assignedArea = `Ambulatory Cot ${this.capacity().ambulatoryCotsOccupied + 1}`;
      this.capacity.update(cap => ({
        ...cap,
        ambulatoryCotsOccupied: Math.min(cap.ambulatoryCotsTotal, cap.ambulatoryCotsOccupied + 1)
      }));
    } else {
      assignedArea = 'Morgue Holding Area';
    }

    const interventions: string[] = [];
    if (this.lsiTourniquet) interventions.push('Tourniquet');
    if (this.lsiAirway) interventions.push('Airway Opened');
    if (this.lsiDecompression) interventions.push('Needle Decompression');

    const newCasualty: IDisasterCasualty = {
      id: `CAS-${nextNum}`,
      tag,
      age: 35,
      gender: 'M',
      mechanism: 'Surge Casualty / Blast Debris',
      canWalk: this.canWalk(),
      respiratoryRate: this.respRate(),
      radialPulse: this.radialPulse(),
      capillaryRefillSec: this.capRefillOver2() ? 3.0 : 1.5,
      mentalStatus: this.mentalStatus(),
      lifesavingInterventions: interventions,
      assignedArea,
      admitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.casualties.update(list => [newCasualty, ...list]);

    // Record ICS-206 surge note to clinical state
    this.state.addClinicalNote?.({
      id: `note_disaster_${Date.now()}`,
      text: `[MASS CASUALTY DISASTER TRIAGE - START/SALT RECORD]\n` +
        `Casualty ID: ${newCasualty.id} (Tag: ${newCasualty.tag})\n` +
        `Tactile Vitals: Resp ${newCasualty.respiratoryRate}/m, Pulse ${newCasualty.radialPulse}, CapRefill ${newCasualty.capillaryRefillSec}s\n` +
        `Assigned: ${assignedArea}\n` +
        `SALT Interventions: ${interventions.join(', ') || 'None required'}\n` +
        `Time: ${newCasualty.admitTime}`,
      sourceLens: 'telemetry',
      date: new Date().toISOString()
    });

    // Reset rapid inputs for next assessment
    this.canWalk.set(false);
    this.respRate.set(20);
    this.radialPulse.set('present');
    this.capRefillOver2.set(false);
    this.mentalStatus.set('follows_commands');
    this.lsiTourniquet = false;
    this.lsiAirway = false;
    this.lsiDecompression = false;
  }

  cycleTag(id: string): void {
    const cycleOrder: TDisasterTag[] = ['RED', 'YELLOW', 'GREEN', 'BLACK'];
    this.casualties.update(list => list.map(c => {
      if (c.id === id) {
        const nextIdx = (cycleOrder.indexOf(c.tag) + 1) % cycleOrder.length;
        return { ...c, tag: cycleOrder[nextIdx] };
      }
      return c;
    }));
  }
}
