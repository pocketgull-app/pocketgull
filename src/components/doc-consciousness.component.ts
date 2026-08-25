import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocProtocolService } from '../services/doc-protocol.service';
import { DocLevel, IDocProfile, IDocStimBlock } from '../services/patient.types';

/**
 * DocConsciousnessComponent
 *
 * Clinician/family-facing panel for Disorders of Consciousness (DOC)
 * stimulation protocol planning. Generates an evidence-based, scheduled
 * session plan based on the patient's GCS and DOC classification.
 *
 * Intended for ICU, neuro-rehab, and palliative care settings.
 */
@Component({
  selector: 'app-doc-consciousness',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full bg-white dark:bg-[#070a0f] border border-gray-200 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">

      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-800/60 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Brain waves icon -->
          <div class="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white tracking-tight">Consciousness Support Protocol</h2>
            <p class="text-[12px] font-medium text-sky-400/80 uppercase tracking-widest">DOC / Coma Sensory Stimulation</p>
          </div>
        </div>
        @if (docService.session()) {
          <span class="text-[12px] px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-400 font-bold uppercase tracking-wider border border-sky-500/20">
            Protocol Active
          </span>
        }
      </div>

      <div class="p-5 space-y-5">

        <!-- Clinical Context Notice -->
        <div class="p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] flex items-start gap-2.5">
          <span class="text-sm mt-0.5">⚕️</span>
          <p class="text-[12px] text-amber-300/80 leading-relaxed">
            <strong class="text-amber-400">Research-informed, not a clinical decision system.</strong>
            All protocols require physician oversight. Immediately discontinue if ICP elevates, autonomic storming occurs, or patient shows signs of distress.
          </p>
        </div>

        @if (!docService.session()) {
          <!-- PROFILE FORM ────────────────────────────────────────────────── -->
          <div class="space-y-4">

            <!-- GCS + DOC Level -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[12px] font-bold uppercase tracking-widest text-slate-400">GCS Score</label>
                <div class="flex items-center gap-2">
                  <input type="range" min="3" max="15" step="1"
                         [value]="form().gcsScore"
                         (input)="updateGcs($any($event.target).value)"
                         class="flex-1 accent-sky-500 cursor-pointer"/>
                  <span class="text-lg font-extrabold tabular-nums"
                        [class]="gcsColor()">{{ form().gcsScore }}</span>
                </div>
                <p class="text-[12px] text-slate-500 italic">{{ gcsInterpretation() }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-[12px] font-bold uppercase tracking-widest text-slate-400">DOC Level</label>
                <select [value]="form().docLevel"
                        (change)="updateField('docLevel', $any($event.target).value)"
                        class="w-full px-2.5 py-2 rounded-lg border border-slate-700/50 bg-slate-900/60 text-xs text-slate-200 focus:outline-none focus:border-sky-500/60">
                  <option value="coma">Coma (no wake-sleep)</option>
                  <option value="vs-uws">Vegetative / UWS</option>
                  <option value="mcs-minus">MCS- (non-verbal)</option>
                  <option value="mcs-plus">MCS+ (command-following)</option>
                  <option value="emcs">Emerging from MCS</option>
                  <option value="locked-in">Locked-in Syndrome ⚠️</option>
                </select>
              </div>
            </div>

            <!-- Etiology + Days -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[12px] font-bold uppercase tracking-widest text-slate-400">Etiology</label>
                <input type="text" placeholder="TBI, hypoxic, stroke, metabolic..."
                       [value]="form().etiology"
                       (input)="updateField('etiology', $any($event.target).value)"
                       class="w-full px-2.5 py-2 rounded-lg border border-slate-700/50 bg-slate-900/60 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/60"/>
              </div>
              <div class="space-y-1.5">
                <label class="text-[12px] font-bold uppercase tracking-widest text-slate-400">Days Post-Onset</label>
                <input type="number" min="0" placeholder="0"
                       [value]="form().daysPostOnset"
                       (input)="updateField('daysPostOnset', +$any($event.target).value)"
                       class="w-full px-2.5 py-2 rounded-lg border border-slate-700/50 bg-slate-900/60 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/60"/>
              </div>
            </div>

            <!-- Preferred Music -->
            <div class="space-y-1.5">
              <label class="text-[12px] font-bold uppercase tracking-widest text-slate-400">Preferred Music (from family)</label>
              <input type="text" placeholder="e.g. Classic rock, Frank Sinatra, Country 1980s..."
                     [value]="form().preferredMusic"
                     (input)="updateField('preferredMusic', $any($event.target).value)"
                     class="w-full px-2.5 py-2 rounded-lg border border-slate-700/50 bg-slate-900/60 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/60"/>
            </div>

            <!-- Checkbox flags -->
            <div class="grid grid-cols-2 gap-2">
              @for (flag of checkboxFlags; track flag.key) {
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox"
                         [checked]="form()[flag.key]"
                         (change)="updateField(flag.key, $any($event.target).checked)"
                         class="rounded accent-sky-500 cursor-pointer"/>
                  <span class="text-[12px] text-slate-400 group-hover:text-slate-200 transition-colors leading-tight">{{ flag.label }}</span>
                </label>
              }
            </div>

            <!-- Generate Button -->
            <button (click)="generate()"
                    class="w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[12px] bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
              </svg>
              Generate Stimulation Protocol
            </button>
          </div>

        } @else {

          <!-- SESSION OUTPUT ──────────────────────────────────────────────── -->
          @if (docService.session(); as sess) {

            <!-- Clinician summary bar -->
            <div class="p-3 rounded-lg bg-sky-500/[0.06] border border-sky-500/20">
              <p class="text-[12px] font-bold uppercase tracking-widest text-sky-400 mb-1">Clinician Note</p>
              <p class="text-xs text-slate-300 leading-relaxed">{{ sess.clinician_note }}</p>
              <div class="flex items-center gap-4 mt-2 pt-2 border-t border-sky-500/10">
                <div class="text-center">
                  <p class="text-[12px] text-slate-500 uppercase tracking-widest">Total</p>
                  <p class="text-sm font-extrabold text-sky-400">{{ sess.totalDurationMin }} min</p>
                </div>
                <div class="text-center">
                  <p class="text-[12px] text-slate-500 uppercase tracking-widest">Sessions/Day</p>
                  <p class="text-sm font-extrabold text-blue-400">{{ sess.sessionsPerDay }}×</p>
                </div>
                <div class="text-center">
                  <p class="text-[12px] text-slate-500 uppercase tracking-widest">Blocks</p>
                  <p class="text-sm font-extrabold text-indigo-400">{{ sess.schedule.length }}</p>
                </div>
              </div>
            </div>

            <!-- Safety Warnings -->
            @if (sess.safety_warnings.length > 0) {
              <div class="p-3 rounded-lg bg-red-500/[0.05] border border-red-500/20">
                <p class="text-[12px] font-bold uppercase tracking-widest text-red-400 mb-1.5">Safety Advisories</p>
                @for (w of sess.safety_warnings; track w) {
                  <p class="text-[12px] text-red-300/80 leading-snug mb-0.5">{{ w }}</p>
                }
              </div>
            }

            <!-- Schedule Blocks -->
            <div class="space-y-2">
              <p class="text-[12px] font-bold uppercase tracking-widest text-slate-500">Session Schedule</p>
              @for (block of sess.schedule; track block.label; let i = $index) {
                <div class="rounded-lg border overflow-hidden" [class]="blockBorderClass(block)">
                  <div class="px-3 py-2 flex items-center justify-between" [class]="blockHeaderClass(block)">
                    <div class="flex items-center gap-2">
                      <span class="text-sm">{{ blockEmoji(block) }}</span>
                      <span class="text-[12px] font-bold uppercase tracking-wider" [class]="blockTitleColor(block)">
                        {{ block.label }}
                      </span>
                      @if (block.frequencyHz) {
                        <span class="text-[12px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">{{ block.frequencyHz }} Hz</span>
                      }
                    </div>
                    <span class="text-[12px] font-bold text-slate-400">{{ block.durationMin }} min</span>
                  </div>
                  <div class="px-3 py-2.5 space-y-1.5">
                    <p class="text-[12px] text-slate-200 leading-relaxed font-medium">{{ block.instruction }}</p>
                    <p class="text-[12px] text-slate-500 italic leading-relaxed">{{ block.rationale }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Family Guidance -->
            <div class="p-3 rounded-lg bg-violet-500/[0.05] border border-violet-500/20">
              <p class="text-[12px] font-bold uppercase tracking-widest text-violet-400 mb-2">Family Guidance</p>
              @for (g of sess.family_guidance; track g) {
                <p class="text-[12px] text-slate-300 leading-snug mb-1.5">{{ g }}</p>
              }
            </div>

            <!-- Evidence References (collapsed) -->
            <details class="group">
              <summary class="text-[12px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-300 transition-colors list-none flex items-center gap-1.5">
                <svg class="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                Evidence References ({{ sess.evidence_references.length }})
              </summary>
              <div class="mt-2 space-y-1 pl-5 border-l border-slate-800">
                @for (ref of sess.evidence_references; track ref) {
                  <p class="text-[12px] text-slate-500 leading-snug">{{ ref }}</p>
                }
              </div>
            </details>

            <!-- Reset -->
            <button (click)="reset()"
                    class="w-full py-2 rounded-xl font-bold uppercase tracking-wider text-[12px] border border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all cursor-pointer">
              Reset / New Patient
            </button>

          }
        }

      </div>
    </div>
  `,
})
export class DocConsciousnessComponent {
  readonly docService = inject(DocProtocolService);

  // ── Form state ────────────────────────────────────────────────────────────
  readonly form = signal<IDocProfile>({
    gcsScore:             8,
    docLevel:             'vs-uws',
    daysPostOnset:        14,
    etiology:             '',
    hasAutonomicStorming: false,
    preferredMusic:       '',
    familyVoiceAvailable: true,
    hasHearingAid:        false,
    hasPhotosensitivity:  false,
    activeIcpMonitor:     false,
  });

  readonly checkboxFlags: Array<{ key: keyof IDocProfile; label: string }> = [
    { key: 'familyVoiceAvailable', label: 'Family willing to record voice / attend sessions' },
    { key: 'hasAutonomicStorming', label: 'Autonomic storming present (PSH)' },
    { key: 'activeIcpMonitor',     label: 'ICP monitor in place' },
    { key: 'hasPhotosensitivity',  label: 'Photosensitivity / seizure history' },
    { key: 'hasHearingAid',        label: 'Hearing aid required' },
  ];

  readonly gcsColor = computed(() => {
    const g = this.form().gcsScore;
    if (g <= 7)  return 'text-red-400';
    if (g <= 12) return 'text-amber-400';
    return 'text-emerald-400';
  });

  readonly gcsInterpretation = computed(() => {
    const g = this.form().gcsScore;
    if (g <= 7)  return 'Severe — coma / vegetative range';
    if (g <= 12) return 'Moderate — MCS range';
    if (g <= 14) return 'Mild — emerging / EMCS range';
    return 'Normal consciousness';
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  updateGcs(val: string): void {
    const gcs = parseInt(val, 10);
    let docLevel: DocLevel = 'vs-uws';
    if (gcs <= 7)  docLevel = 'coma';
    else if (gcs <= 10) docLevel = 'mcs-minus';
    else if (gcs <= 12) docLevel = 'mcs-plus';
    else if (gcs <= 14) docLevel = 'emcs';
    this.form.update(f => ({ ...f, gcsScore: gcs, docLevel }));
  }

  updateField<K extends keyof IDocProfile>(key: K, value: IDocProfile[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  generate(): void {
    this.docService.generate(this.form());
  }

  reset(): void {
    this.docService.session.set(null);
  }

  // ── Block display helpers ─────────────────────────────────────────────────
  blockEmoji(b: IDocStimBlock): string {
    const M: Record<string, string> = {
      'quiet':          '🤫',
      'familiar-voice': '🗣️',
      'auditory':       '🎵',
      'vibroacoustic':  '〰️',
      'tactile-audio':  '🤲',
      'gamma-light':    '💡',
    };
    return M[b.modality] ?? '⬡';
  }

  blockBorderClass(b: IDocStimBlock): string {
    const M: Record<string, string> = {
      'quiet':          'border-slate-800/50',
      'familiar-voice': 'border-violet-500/25',
      'auditory':       'border-sky-500/25',
      'vibroacoustic':  'border-blue-500/25',
      'tactile-audio':  'border-indigo-500/25',
      'gamma-light':    'border-amber-500/25',
    };
    return M[b.modality] ?? 'border-slate-800';
  }

  blockHeaderClass(b: IDocStimBlock): string {
    const M: Record<string, string> = {
      'quiet':          'bg-slate-800/30',
      'familiar-voice': 'bg-violet-500/[0.05]',
      'auditory':       'bg-sky-500/[0.05]',
      'vibroacoustic':  'bg-blue-500/[0.05]',
      'tactile-audio':  'bg-indigo-500/[0.05]',
      'gamma-light':    'bg-amber-500/[0.05]',
    };
    return M[b.modality] ?? 'bg-slate-800/20';
  }

  blockTitleColor(b: IDocStimBlock): string {
    const M: Record<string, string> = {
      'quiet':          'text-slate-500',
      'familiar-voice': 'text-violet-400',
      'auditory':       'text-sky-400',
      'vibroacoustic':  'text-blue-400',
      'tactile-audio':  'text-indigo-400',
      'gamma-light':    'text-amber-400',
    };
    return M[b.modality] ?? 'text-slate-400';
  }
}
