import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoapNoteGeneratorService } from '../services/soap-note-generator.service';

@Component({
  selector: 'app-soap-note-generator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/85 backdrop-blur-xl border border-purple-500/30 shadow-2xl space-y-4 animate-in fade-in duration-300">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg">
            📝
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Ambient Real-Time SOAP Note Generator
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full border border-purple-500/30">FHIR R4 Standard</span>
            </h3>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              Live Scribe & DOMPurify HIPAA-sanitized clinical documentation deck.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="soap.refreshObjectiveFromVitals()"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition cursor-pointer flex items-center gap-1">
            <span>🔄 Sync Vitals</span>
          </button>
          <button
            type="button"
            (click)="copyNoteToClipboard()"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition cursor-pointer shadow-md flex items-center gap-1 active:scale-[0.98]">
            <span>{{ copied() ? '✓ Copied!' : '📋 Copy Note' }}</span>
          </button>
        </div>
      </div>

      <!-- Live Scribing HUD Indicator -->
      <div class="p-2.5 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
          </span>
          <span>Ambient Audio Telemetry Scribing Active</span>
        </div>
        <button
          type="button"
          (click)="downloadFhirBundle()"
          class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-900 text-purple-300 border border-purple-500/40 hover:bg-purple-600 hover:text-white rounded-lg transition cursor-pointer">
          Download FHIR R4 Bundle (.json)
        </button>
      </div>

      <!-- SOAP Sections Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- S: Subjective -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            Subjective (S)
          </label>
          <textarea
            rows="3"
            [value]="soap.subjective()"
            (input)="soap.subjective.set(getEventVal($event))"
            class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 resize-none">
          </textarea>
        </div>

        <!-- O: Objective -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            Objective (O)
          </label>
          <textarea
            rows="3"
            [value]="soap.objective()"
            (input)="soap.objective.set(getEventVal($event))"
            class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 resize-none">
          </textarea>
        </div>

        <!-- A: Assessment -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Assessment (A)
          </label>
          <textarea
            rows="3"
            [value]="soap.assessment()"
            (input)="soap.assessment.set(getEventVal($event))"
            class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 resize-none">
          </textarea>
        </div>

        <!-- P: Plan -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
          <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Plan (P)
          </label>
          <textarea
            rows="3"
            [value]="soap.plan()"
            (input)="soap.plan.set(getEventVal($event))"
            class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none">
          </textarea>
        </div>

      </div>

    </div>
  `
})
export class SoapNoteGeneratorComponent {
  soap = inject(SoapNoteGeneratorService);
  copied = signal(false);

  getEventVal(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }

  copyNoteToClipboard(): void {
    const text = `SUBJECTIVE:\n${this.soap.sanitizedSubjective()}\n\nOBJECTIVE:\n${this.soap.sanitizedObjective()}\n\nASSESSMENT:\n${this.soap.sanitizedAssessment()}\n\nPLAN:\n${this.soap.sanitizedPlan()}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  downloadFhirBundle(): void {
    const bundleJson = this.soap.generateFhirR4DocumentReference();
    const blob = new Blob([bundleJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_soap_note_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
