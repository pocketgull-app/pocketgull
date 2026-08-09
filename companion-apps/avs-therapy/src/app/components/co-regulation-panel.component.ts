import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProtocolMode } from './avs.constants';
import { IAvsProtocol, AthleticState } from '../services/patient.types';
import { BreathGuideComponent } from './breath-guide.component';

@Component({
  selector: 'app-co-regulation-panel',
  standalone: true,
  imports: [CommonModule, BreathGuideComponent],
  template: `
    <div class="rounded-xl border dark:border-violet-500/15 bg-violet-500/[0.03] dark:bg-violet-950/20 overflow-hidden transition-all duration-500"
         [class.border-violet-500/40]="avsProtocol"
         [class.border-violet-500/20]="!avsProtocol">

      <!-- Panel Header -->
      <div class="px-4 py-3 border-b border-violet-500/15 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.69 3 3 0 0 1 .49-5.62A5 5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.69 3 3 0 0 0-.49-5.62A5 5 0 0 0 14.5 2Z"/>
          </svg>
          <div class="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-800">
            <button (click)="protocolModeChange.emit('clinical')"
                    class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    [class.bg-violet-500]="protocolMode === 'clinical'" [class.text-white]="protocolMode === 'clinical'"
                    [class.text-gray-600]="protocolMode === 'clinical'" [class.dark:text-zinc-400]="protocolMode !== 'clinical'">Clinical</button>
            <button (click)="protocolModeChange.emit('athletic')"
                    class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    [class.bg-violet-500]="protocolMode === 'athletic'" [class.text-white]="protocolMode === 'athletic'"
                    [class.text-gray-600]="protocolMode !== 'athletic'" [class.dark:text-zinc-400]="protocolMode !== 'athletic'">Athletic</button>
          </div>
        </div>
        @if (protocolMode === 'clinical' && avsProtocol) {
          <span class="text-[9px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
            {{ avsProtocol.wave | uppercase }} · {{ avsProtocol.breathing_bpm }} BPM
          </span>
        }
        @if (protocolMode === 'athletic' && athleticSession) {
          <span class="text-[9px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
            {{ athleticSession.profile.state | uppercase }}
          </span>
        }
      </div>

      <div class="p-4 space-y-4">

        <!-- Context Fields -->
        @if (protocolMode === 'clinical') {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Reason for Visit</label>
              <input type="text" placeholder="Chief complaint or reason for today's visit..."
                     [value]="reasonForVisit"
                     (input)="reasonForVisitChange.emit($any($event.target).value)"
                     class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Occupation</label>
              <input type="text" placeholder="e.g. Veteran, Firefighter, Nurse..."
                     [value]="occupation"
                     (input)="occupationChange.emit($any($event.target).value)"
                     class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Dietary & Nutrition Intake</label>
              <input type="text" placeholder="e.g. Fasting state, high inflammation, digestive distress..."
                     [value]="dietaryProtocol"
                     (input)="dietaryProtocolChange.emit($any($event.target).value)"
                     class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Sport / Activity</label>
              <input type="text" placeholder="e.g. Sprinting, Golf, eSports..."
                     [value]="athleticSport"
                     (input)="athleticSportChange.emit($any($event.target).value)"
                     class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Target State</label>
              <select [value]="athleticState" (change)="athleticStateChange.emit($any($event.target).value)"
                      class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500/60 transition-colors cursor-pointer">
                <option value="priming">Priming (High-Beta/Gamma)</option>
                <option value="flow">Flow (SMR/Alpha)</option>
                <option value="recovery">Recovery (Theta)</option>
                <option value="phase-shift">Phase-Shift (Circadian)</option>
              </select>
            </div>
          </div>
        }

        <!-- Generate Button -->
        <button (click)="generate.emit()"
                [disabled]="isGenerating"
                class="w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                [ngClass]="!isGenerating ?
                  'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20' :
                  'bg-zinc-800 text-zinc-500 cursor-not-allowed'">
          @if (isGenerating) {
            <!-- Spinner -->
            <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generating Protocol...
          } @else if ((protocolMode === 'clinical' && avsProtocol) || (protocolMode === 'athletic' && athleticSession)) {
            <!-- Regenerate icon -->
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            Re-generate Protocol
          } @else {
            <!-- Spark icon -->
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            </svg>
            Generate Protocol
          }
        </button>

        <!-- Protocol Result -->
        @if (protocolMode === 'clinical' && avsProtocol; as proto) {
          <div class="space-y-4 pt-1" [@.disabled]="true">

            <!-- Breath Guide + Patient Message -->
            <div class="flex flex-col items-center gap-2 py-2">
              <app-breath-guide [size]="160" [showLabel]="true" [voicePacingEnabled]="voicePacingEnabled" />
            </div>

            <!-- Session Intent (clinician) -->
            <div class="p-3 rounded-lg bg-violet-500/[0.06] border border-violet-500/20">
              <p class="text-[9px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">Session Intent (Clinician)</p>
              <p class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed italic">{{ proto.session_intent }}</p>
            </div>

            <!-- Protocol Stats Row -->
            <div class="grid grid-cols-3 gap-2">
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 text-center">
                <p class="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-0.5">Wave</p>
                <p class="text-sm font-extrabold text-violet-600 dark:text-violet-400 uppercase">{{ proto.wave }}</p>
              </div>
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 text-center">
                <p class="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-0.5">Rate</p>
                <p class="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{{ proto.breathing_bpm }}<span class="text-[9px] ml-0.5">BPM</span></p>
              </div>
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 text-center">
                <p class="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-0.5">Ratio</p>
                <p class="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">{{ proto.breath_ratio.inhale }}-{{ proto.breath_ratio.hold }}-{{ proto.breath_ratio.exhale }}</p>
              </div>
            </div>

            <!-- Safety Flags -->
            @if (proto.safety_flags.length > 0) {
              <div class="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
                <p class="text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  Clinical Advisories
                </p>
                @for (flag of proto.safety_flags; track flag) {
                  <p class="text-[10px] text-amber-800 dark:text-amber-300/80 leading-snug">· {{ flag }}</p>
                }
              </div>
            }

            <!-- Apply to Session Button -->
            <button (click)="apply.emit()"
                    class="w-full py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Apply Clinical Protocol
            </button>

          </div>
        } @else if (protocolMode === 'athletic' && athleticSession) {
          <div class="space-y-4 pt-1" [@.disabled]="true">
            <div class="p-3 rounded-lg bg-violet-500/[0.06] border border-violet-500/20">
              <p class="text-[9px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">Coach Note</p>
              <p class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed italic">{{ athleticSession.coach_note }}</p>
            </div>
            <div class="space-y-2">
              <p class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Athlete Guidance</p>
              @for (g of athleticSession.athlete_guidance; track g) {
                <p class="text-[10px] text-gray-700 dark:text-zinc-300 leading-snug">· {{ g }}</p>
              }
            </div>
            <!-- Apply button -->
            <button (click)="apply.emit()"
                    class="w-full py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Apply Athletic Protocol
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class CoRegulationPanelComponent {
  @Input() protocolMode: ProtocolMode = 'clinical';
  @Input() avsProtocol: IAvsProtocol | null = null;
  @Input() athleticSession: any | null = null;
  @Input() reasonForVisit = '';
  @Input() occupation = '';
  @Input() dietaryProtocol = '';
  @Input() athleticSport = '';
  @Input() athleticState: AthleticState = 'priming';
  @Input() isGenerating = false;
  @Input() voicePacingEnabled = false;

  @Output() protocolModeChange = new EventEmitter<ProtocolMode>();
  @Output() reasonForVisitChange = new EventEmitter<string>();
  @Output() occupationChange = new EventEmitter<string>();
  @Output() dietaryProtocolChange = new EventEmitter<string>();
  @Output() athleticSportChange = new EventEmitter<string>();
  @Output() athleticStateChange = new EventEmitter<AthleticState>();
  @Output() generate = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();
}
