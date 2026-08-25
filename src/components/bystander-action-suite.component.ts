import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { EmergencySupplyFinderComponent } from './emergency-supply-finder.component';

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
  imports: [CommonModule, PocketGullBadgeComponent, EmergencySupplyFinderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-2xl bg-red-950/40 border border-red-800/80 backdrop-blur-md shadow-2xl font-mono text-zinc-100 mb-6">
      
      <!-- Call 911 Primary Action Banner -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-red-650 via-red-700 to-red-800 border border-red-400/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3 text-center sm:text-left">
          <span class="text-3xl animate-bounce">🚨</span>
          <div>
            <div class="flex items-center justify-center sm:justify-start gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-red-200">First Priority Protocol</span>
              <pocket-gull-badge label="911 Emergency Dispatch" severity="warning"></pocket-gull-badge>
            </div>
            <h3 class="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">Step 1: Call 911 Immediately</h3>
            <p class="text-xs text-red-100 font-sans mt-0.5">
              Assign a dedicated bystander to call 911 and place the phone on speakerphone next to the patient.
            </p>
          </div>
        </div>

        <a href="tel:911"
           class="px-5 py-3 rounded-xl bg-white text-red-950 font-black text-sm uppercase tracking-wider transition hover:bg-red-50 border-2 border-white shadow-xl flex items-center gap-2 shrink-0 active:scale-95 no-underline cursor-pointer">
          <span class="animate-pulse">📞</span> CALL 911 NOW
        </a>
      </div>

      <!-- 911 Dispatch Speakerphone Script -->
      <div class="p-4 rounded-xl bg-zinc-950/80 border border-red-900/40 mb-6">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-2">
          <span>📢</span> What to Tell 911 Dispatch:
        </h4>
        <ul class="text-xs text-zinc-300 font-sans space-y-1.5 list-disc list-inside leading-relaxed">
          <li><strong class="text-white">Location:</strong> State exact street address, floor number, or nearest landmark.</li>
          <li><strong class="text-white">Status:</strong> Tell operator: <em>"Unresponsive patient, CPR in progress."</em> or <em>"Severe trauma/choking."</em></li>
          <li><strong class="text-white">Speakerphone:</strong> Keep line open. Dispatchers provide real-time CPR beat coaching over speaker.</li>
        </ul>
      </div>

      <!-- Bystander Role Assignments & Task Checklist -->
      <div class="mb-6">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center justify-between">
          <span class="flex items-center gap-2"><span>👥</span> Immediate Bystander Role Checklist</span>
          <span class="text-[10px] text-zinc-500 font-mono">Check off completed actions</span>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (task of tasks(); track task.id) {
            <div (click)="toggleTask(task.id)"
                 class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3"
                 [class.bg-emerald-950\/30]="task.completed"
                 [class.border-emerald-500\/40]="task.completed"
                 [class.bg-zinc-900\/80]="!task.completed"
                 [class.border-zinc-800]="!task.completed">
              
              <input type="checkbox"
                     [checked]="task.completed"
                     class="mt-1 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ task.icon }}</span>
                  <span class="text-xs font-bold font-mono uppercase tracking-wider"
                        [class.text-emerald-400]="task.completed"
                        [class.text-white]="!task.completed">
                    {{ task.role }}
                  </span>
                </div>
                <p class="text-[11.5px] font-sans text-zinc-400 mt-1 leading-relaxed"
                   [class.line-through]="task.completed"
                   [class.text-zinc-500]="task.completed">
                  {{ task.assignedAction }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Emergency Medical Supply & Geolocation Telemetry Radar -->
      <app-emergency-supply-finder />

      <!-- Quick 1-Tap Bystander Event Logger -->
      <div>
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-2">
          <span>⏱️</span> Log Bystander Action Timeline (for Incoming EMTs):
        </h4>

        <div class="flex flex-wrap gap-2 mb-3">
          <button (click)="logEvent('Call 911 Placed & Dispatch Notified')"
                  class="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer">
            📌 911 Placed
          </button>
          
          <button (click)="logEvent('CPR Compressions Started')"
                  class="px-2.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer">
            📌 CPR Started
          </button>

          <button (click)="logEvent('AED Arrived & Shock Delivered')"
                  class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer">
            📌 AED Shock
          </button>

          <button (click)="logEvent('Naloxone (Narcan) Administered')"
                  class="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer">
            📌 Naloxone Given
          </button>

          <button (click)="logEvent('Paramedics Arrived on Scene')"
                  class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer">
            📌 Paramedics Arrived
          </button>
        </div>

        <!-- Logged Bystander Action History -->
        @if (state.clinicalNotes().length > 0) {
          <div class="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px]">
            @for (note of state.clinicalNotes(); track note.id) {
              <div class="flex items-center justify-between text-zinc-300 border-b border-zinc-900 pb-1">
                <span class="text-orange-400 font-bold">[{{ note.date }}]</span>
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

  tasks = signal<IBystanderTask[]>([
    {
      id: 'task_caller',
      role: 'Bystander 1: 911 Caller',
      assignedAction: 'Dial 911, state location, put phone on speakerphone, report patient status.',
      icon: '📞',
      completed: false
    },
    {
      id: 'task_aed',
      role: 'Bystander 2: AED & First Aid',
      assignedAction: 'Locate & retrieve nearest AED (Defibrillator) and Emergency First Aid kit.',
      icon: '⚡',
      completed: false
    },
    {
      id: 'task_cpr',
      role: 'Bystander 3: CPR Rescuer',
      assignedAction: 'Position patient flat on back and start 110 BPM chest compressions immediately.',
      icon: '❤️',
      completed: false
    },
    {
      id: 'task_guide',
      role: 'Bystander 4: Paramedic Guide',
      assignedAction: 'Go to street entrance or lobby to guide arriving paramedics directly to scene.',
      icon: '🚪',
      completed: false
    }
  ]);

  toggleTask(taskId: string) {
    this.tasks.update(list =>
      list.map(t => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            this.state.addClinicalNote({
              id: 'task_' + Date.now(),
              text: `[Bystander Role Completed]: ${t.role} — ${t.assignedAction}`,
              date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              sourceLens: 'EMT Handoff'
            });
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  }

  logEvent(actionText: string) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.state.addClinicalNote({
      id: 'event_' + Date.now(),
      text: `[Emergency Timeline]: ${actionText}`,
      date: timestamp,
      sourceLens: 'EMT Handoff'
    });
  }
}
