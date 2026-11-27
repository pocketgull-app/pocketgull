import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { EmergencySupplyFinderComponent } from './emergency-supply-finder.component';
import { resolveEmergencyProtocolDescriptor } from '../services/emergency-protocol';
import { getSecureRandomId } from '../utils/security-helper';
import { PgTranslatePipe } from '../pipes/pg-translate.pipe';

export interface IBystanderTask {
  id: string;
  role: string;
  assignedAction: string;
  icon: string;
  completed: boolean;
}

@Component({
  selector: 'app-bystander-action-suite',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent, EmergencySupplyFinderComponent, PgTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-red-950/60 via-zinc-950/90 to-zinc-950 border-2 border-red-700/80 backdrop-blur-md shadow-2xl font-pocketgull-inter text-zinc-100 mb-6">
      
      <!-- Call 911 Primary Action Banner -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-rose-700 border-2 border-red-400/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
        <div class="flex items-center gap-3.5 text-center sm:text-left">
          <span class="text-3xl sm:text-4xl shrink-0" aria-hidden="true">🚨</span>
          <div>
            <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span class="text-xs font-pocketgull-mono font-bold uppercase tracking-widest text-red-100">{{ 'First Priority Protocol' | pgT:'emergency.first_priority' }}</span>
              <pocket-gull-badge [label]="protocol().shortBadge" severity="warning"></pocket-gull-badge>
            </div>
            <h3 class="text-lg sm:text-xl font-pocketgull font-black text-white tracking-tight">{{ protocol().step1Headline }}</h3>
            <p class="text-xs sm:text-sm text-red-100 font-sans mt-0.5 leading-relaxed">
              {{ protocol().step1Subtitle }}
            </p>
          </div>
        </div>

        <a href="tel:911"
           class="px-5 sm:px-6 py-3.5 rounded-2xl bg-white hover:bg-red-50 text-red-950 font-pocketgull font-black text-sm sm:text-base uppercase tracking-wider transition border-2 border-white shadow-2xl flex items-center gap-2.5 shrink-0 active:scale-95 no-underline cursor-pointer min-h-[48px]">
          <span aria-hidden="true">📞</span> <span><bdi dir="ltr">{{ 'CALL 911 NOW' | pgT:'emergency.call_911_now' }}</bdi></span>
        </a>
      </div>

      <!-- 911 Dispatch Speakerphone Script -->
      <div class="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-red-900/50 mb-5 font-pocketgull-mono shadow-inner">
        <h4 class="text-xs sm:text-sm font-pocketgull font-black uppercase tracking-wider text-red-400 mb-2.5 flex items-center gap-2">
          <span>📢</span> What to Tell 911 Dispatch:
        </h4>
        <ul class="text-xs sm:text-sm text-zinc-300 font-pocketgull-inter space-y-2 list-disc list-inside leading-relaxed">
          <li><strong class="text-white font-pocketgull">Location:</strong> State exact street address, floor number, or nearest landmark.</li>
          <li><strong class="text-white font-pocketgull">Status:</strong> Tell operator: <em>{{ protocol().dispatchStatusHint }}</em></li>
          <li><strong class="text-white font-pocketgull">Speakerphone:</strong> Keep line open. Dispatchers provide real-time CPR beat coaching over speaker.</li>
        </ul>
      </div>

      <!-- Bystander Role Assignments & Task Checklist -->
      <div class="mb-5 font-pocketgull-mono">
        <h4 class="text-xs sm:text-sm font-pocketgull font-black uppercase tracking-wider text-zinc-200 mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <span class="flex items-center gap-2"><span>👥</span> Immediate Bystander Role Checklist</span>
          <span class="text-[11px] text-zinc-400 font-normal">Tap to mark completed actions</span>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          @for (task of tasks(); track task.id) {
            <button type="button"
                    (click)="toggleTask(task.id)"
                    [attr.aria-pressed]="task.completed"
                    class="w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                    [class.bg-emerald-950\/40]="task.completed"
                    [class.border-emerald-500\/50]="task.completed"
                    [class.bg-zinc-900\/90]="!task.completed"
                    [class.border-zinc-800]="!task.completed">
              
              <span aria-hidden="true"
                    class="mt-0.5 w-5 h-5 rounded border flex items-center justify-center text-xs font-black shrink-0"
                    [class.bg-emerald-500]="task.completed"
                    [class.border-emerald-400]="task.completed"
                    [class.text-zinc-950]="task.completed"
                    [class.border-zinc-600]="!task.completed"
                    [class.bg-zinc-800]="!task.completed">
                @if (task.completed) { ✓ }
              </span>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-lg" aria-hidden="true">{{ task.icon }}</span>
                  <span class="text-xs sm:text-sm font-pocketgull font-bold uppercase tracking-wider"
                        [class.text-emerald-400]="task.completed"
                        [class.text-white]="!task.completed">
                    {{ task.role }}
                  </span>
                </div>
                <p class="text-xs font-pocketgull-inter text-zinc-300 mt-1 leading-relaxed"
                   [class.line-through]="task.completed"
                   [class.text-zinc-500]="task.completed">
                  {{ task.assignedAction }}
                </p>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Emergency Medical Supply & Geolocation Telemetry Radar Toggle -->
      <div class="mb-4">
        <button type="button" (click)="showSupplyRadar.set(!showSupplyRadar())"
          class="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-pocketgull font-bold uppercase tracking-wider transition flex items-center justify-between shadow-md cursor-pointer min-h-[44px]">
          <span class="flex items-center gap-2">
            <span>⚡</span>
            <span>{{ showSupplyRadar() ? 'Hide Nearest AED & Emergency Supply Radar' : 'Locate Nearest AED & Critical Medical Supplies (GPS Radar)' }}</span>
          </span>
          <span class="text-amber-400 font-mono">{{ showSupplyRadar() ? '▲' : '▼' }}</span>
        </button>
        @if (showSupplyRadar()) {
          <div class="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <app-emergency-supply-finder />
          </div>
        }
      </div>

      <!-- Quick 1-Tap Bystander Event Logger -->
      <div class="font-pocketgull-mono pt-2">
        <h4 class="text-xs sm:text-sm font-pocketgull font-black uppercase tracking-wider text-zinc-200 mb-2.5 flex items-center gap-2">
          <span>⏱️</span> Log Bystander Action Timeline (for Incoming EMTs):
        </h4>

        <div class="flex flex-wrap gap-2.5 mb-3.5">
          <button (click)="logEvent('Call 911 Placed & Dispatch Notified')"
                  class="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 text-xs font-pocketgull font-bold uppercase tracking-wider transition cursor-pointer min-h-[44px]">
            📌 911 Placed
          </button>
          
          <button (click)="logEvent('CPR Compressions Started')"
                  class="px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/50 text-xs font-pocketgull font-bold uppercase tracking-wider transition cursor-pointer min-h-[44px]">
            📌 CPR Started
          </button>

          <button (click)="logEvent('AED Arrived & Shock Delivered')"
                  class="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-pocketgull font-bold uppercase tracking-wider transition cursor-pointer min-h-[44px]">
            📌 AED Shock
          </button>

          <button (click)="logEvent('Naloxone (Narcan) Administered')"
                  class="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 text-xs font-pocketgull font-bold uppercase tracking-wider transition cursor-pointer min-h-[44px]">
            📌 Naloxone Given
          </button>

          <button (click)="logEvent('Paramedics Arrived on Scene')"
                  class="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-pocketgull font-bold uppercase tracking-wider transition cursor-pointer min-h-[44px]">
            📌 Paramedics Arrived
          </button>
        </div>

        <!-- Logged Bystander Action History -->
        @if (state.clinicalNotes().length > 0) {
          <div class="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 max-h-40 overflow-y-auto space-y-1.5 font-pocketgull-mono text-xs">
            @for (note of state.clinicalNotes(); track note.id) {
              <div class="flex items-center justify-between text-zinc-300 border-b border-zinc-900 pb-1.5">
                <span class="text-amber-400 font-bold">[{{ note.date }}]</span>
                <span class="truncate ml-2 flex-1 text-zinc-200">{{ note.text }}</span>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class BystanderActionSuiteComponent {
  state = inject(PatientStateService);
  showSupplyRadar = signal<boolean>(false);
  private readonly completedTaskIds = signal<ReadonlySet<string>>(new Set());

  readonly protocol = computed(() =>
    this.state.emergencyProtocol?.() ?? resolveEmergencyProtocolDescriptor('STAT_CODE_BLUE')
  );

  readonly tasks = computed<IBystanderTask[]>(() => {
    const done = this.completedTaskIds();
    return this.protocol().priorityTasks.map((t) => ({
      ...t,
      completed: done.has(t.id)
    }));
  });

  toggleTask(taskId: string) {
    const wasCompleted = this.completedTaskIds().has(taskId);
    const nextDone = new Set(this.completedTaskIds());
    if (wasCompleted) {
      nextDone.delete(taskId);
    } else {
      nextDone.add(taskId);
      const task = this.tasks().find((t) => t.id === taskId);
      if (task) {
        this.state.addClinicalNote({
          id: 'task_' + getSecureRandomId(),
          text: `[Bystander Role Completed]: ${task.role} — ${task.assignedAction}`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sourceLens: 'EMT Handoff'
        });
      }
    }
    this.completedTaskIds.set(nextDone);
  }

  logEvent(actionText: string) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.state.addClinicalNote({
      id: 'event_' + getSecureRandomId(),
      text: `[Emergency Timeline]: ${actionText}`,
      date: timestamp,
      sourceLens: 'EMT Handoff'
    });
  }
}
