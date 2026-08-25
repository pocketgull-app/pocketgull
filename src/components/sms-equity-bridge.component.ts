import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmsEquityBridgeService, ISmsBridgePlan, IParsedSmsResponse } from '../services/sms-equity-bridge.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-sms-equity-bridge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-teal-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xl shadow-xs">
            💬
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              SMS Compass: Health Equity SMS Bridge
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 rounded-full border border-teal-500/30">
                Grade Level: {{ plan().readingGradeLevel }}
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Bridges digital care plans to basic mobile devices (flip phones) in rural & underserved regions via 160-char SMS.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs font-mono">
          <!-- Language Selector -->
          <div class="flex items-center gap-1">
            <span class="text-zinc-400 text-[10px]">Lang:</span>
            <select [ngModel]="selectedLanguage()" (ngModelChange)="selectedLanguage.set($event)" class="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none">
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
              <option value="de">Deutsch (DE)</option>
              <option value="zh">中文 (ZH)</option>
              <option value="ja">日本語 (JA)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="ar">العربية (AR)</option>
              <option value="pt">Português (PT)</option>
            </select>
          </div>

          <div class="flex items-center gap-1">
            <span class="text-zinc-400">Target Line:</span>
            <span class="font-bold text-teal-600 dark:text-teal-400">{{ plan().phoneNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Main Layout: Simulator & Outbound Schedule -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Outbound Daily Schedule (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-2">
              <span>📅 Outbound Micro-Interventions (<= 160 Chars)</span>
            </h4>
            <span class="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/30">
              9 Languages Active
            </span>
          </div>

          <div class="space-y-3">
            @for (prompt of plan().dailyPrompts; track prompt.id) {
              <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                      {{ prompt.timeSlot }}
                    </span>
                    <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">{{ prompt.primaryDomain }}</span>
                  </div>
                  <span class="text-[10px] font-mono text-zinc-400 font-bold">
                    {{ prompt.charCount }}/160 chars
                  </span>
                </div>

                <!-- Bubble Mock -->
                <div class="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/40 text-xs text-zinc-800 dark:text-zinc-200 font-sans shadow-2xs">
                  "{{ prompt.messageBody }}"
                </div>

                <div class="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Prompt: <strong>{{ prompt.callToAction }}</strong></span>
                  <span class="font-mono text-[10px]">Readability: Grade {{ prompt.fleschKincaidGradeLevel }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right: Inbound SMS Simulator & Live Parsed Telemetry (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
              📱 Inbound SMS Telemetry Parser
            </h4>
            <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              FHIR R4 Compliant
            </span>
          </div>

          <!-- Live Input Mock Box -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            <label class="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block">
              Simulate Inbound Patient Text Message:
            </label>
            <div class="flex gap-2">
              <input 
                type="text" 
                [ngModel]="testInput()" 
                (ngModelChange)="testInput.set($event)"
                placeholder='e.g. "BP 136/88 pulse 74 feeling dizzy"'
                class="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button 
                type="button" 
                (click)="simulateSend()"
                class="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition shadow-xs cursor-pointer">
                Send
              </button>
            </div>

            <!-- Quick Action Chips -->
            <div class="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
              <button type="button" (click)="testInput.set('LOG BP 120/80 HR 72'); simulateSend()" class="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200">BP 120/80</button>
              <button type="button" (click)="testInput.set('MED YES took morning Lisinopril'); simulateSend()" class="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200">MED YES</button>
              <button type="button" (click)="testInput.set('PAIN 4 lower back after walking'); simulateSend()" class="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200">PAIN 4</button>
              <button type="button" (click)="testInput.set('STATUS'); simulateSend()" class="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200">STATUS</button>
            </div>

            <!-- Auto-Parsed Result Card -->
            @if (latestParsed(); as parsed) {
              <div class="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">⚡ Parsed Output</span>
                  <div class="flex items-center gap-1.5">
                    @if (parsed.adherencePointsEarned) {
                      <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                        +{{ parsed.adherencePointsEarned }} Pts
                      </span>
                    }
                    <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border"
                          [ngClass]="{
                            'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300': parsed.urgencyLevel === 'ROUTINE',
                            'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300': parsed.urgencyLevel === 'ELEVATED',
                            'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300': parsed.urgencyLevel === 'CRITICAL_CALL_911'
                          }">
                      {{ parsed.urgencyLevel }}
                    </span>
                  </div>
                </div>

                <div class="space-y-1 font-mono text-[11px]">
                  @if (parsed.detectedVitals.bp) {
                    <div>Detected BP: <strong class="text-zinc-900 dark:text-zinc-100">{{ parsed.detectedVitals.bp }}</strong></div>
                  }
                  @if (parsed.detectedVitals.hr) {
                    <div>Detected HR: <strong class="text-zinc-900 dark:text-zinc-100">{{ parsed.detectedVitals.hr }} bpm</strong></div>
                  }
                  @if (parsed.detectedSymptoms.length > 0) {
                    <div>Symptoms: <strong class="text-amber-600 dark:text-amber-400">{{ parsed.detectedSymptoms.join(', ') }}</strong></div>
                  }
                </div>

                <div class="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <span class="text-zinc-400 text-[10px] block font-bold uppercase">Automated Patient SMS Reply:</span>
                  "{{ parsed.automatedResponseText }}"
                </div>
              </div>
            }
          </div>

          <!-- History Feed -->
          <div class="space-y-2">
            <span class="text-[10px] font-mono uppercase font-bold text-zinc-400 block">Recent SMS Ingestion Stream</span>
            @for (msg of plan().inboundHistory; track msg.rawText) {
              <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 text-[11px] space-y-1">
                <div class="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>{{ msg.timestamp }}</span>
                  <span class="font-bold text-teal-600 dark:text-teal-400">{{ msg.urgencyLevel }}</span>
                </div>
                <p class="text-zinc-800 dark:text-zinc-200 font-medium">"{{ msg.rawText }}"</p>
              </div>
            }
          </div>

        </div>

      </div>

    </div>
  `
})
export class SmsEquityBridgeComponent {
  private smsService = inject(SmsEquityBridgeService);
  private patientState = inject(PatientStateService, { optional: true });

  selectedLanguage = signal<string>('en');
  testInput = signal<string>('Morning BP 136/88 pulse 74 feeling a little dizzy');
  latestParsed = signal<IParsedSmsResponse | null>(null);

  currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot() || {
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  plan = computed<ISmsBridgePlan>(() => {
    return this.smsService.getBridgePlan(this.currentPatient(), this.selectedLanguage());
  });

  constructor() {
    this.latestParsed.set(this.smsService.parseInboundSms(this.testInput(), 'p001'));
  }

  simulateSend(): void {
    if (!this.testInput()) return;
    const parsed = this.smsService.parseInboundSms(this.testInput(), this.currentPatient().id);
    this.latestParsed.set(parsed);
  }
}
