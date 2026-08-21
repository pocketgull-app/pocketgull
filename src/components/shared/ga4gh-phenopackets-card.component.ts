import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ga4ghPhenopacketService, IGa4ghPhenopacketV2 } from '../../services/ga4gh-phenopacket.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IPatient } from '../../services/patient.types';

@Component({
  selector: 'app-ga4gh-phenopackets-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 rounded-2xl bg-zinc-950/90 border border-emerald-500/40 shadow-2xl space-y-6 text-zinc-100 font-sans">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">🧬</span>
            <h2 class="text-lg font-bold text-white tracking-tight">GA4GH Phenopackets v2 &amp; Harvard UDN Rare Disease Bridge</h2>
            <span class="px-2 py-0.5 text-2xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50">
              Schema v2.0
            </span>
          </div>
          <p class="text-xs text-zinc-400">
            Automated serialization of clinical encounters into Global Alliance for Genomics &amp; Health (GA4GH) Phenopackets for Harvard Undiagnosed Diseases Network (UDN) and OHSU OCTRI CTSA Hub rare disease matching.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            (click)="copyJson()"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer">
            <span>📋</span>
            <span>{{ copyStatus() }}</span>
          </button>
          <button
            (click)="downloadJson()"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
            <span>⬇️</span>
            <span>Download Phenopacket JSON</span>
          </button>
        </div>
      </div>

      <!-- Provenance Credentials Matrix -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span class="text-zinc-500 text-2xs block">SUBMITTING CLINICIAN NPI</span>
          <a href="https://npiregistry.cms.hhs.gov/provider-view/1487569752" target="_blank" rel="noopener" class="text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
            <span>🏥</span> 1487569752 (CMS)
          </a>
        </div>

        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span class="text-zinc-500 text-2xs block">RESEARCHER ORCID</span>
          <a href="https://orcid.org/0009-0008-1372-5381" target="_blank" rel="noopener" class="text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
            <span>🆔</span> 0009-0008-1372-5381
          </a>
        </div>

        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span class="text-zinc-500 text-2xs block">ZENODO OPEN ARCHIVE</span>
          <a href="https://doi.org/10.5281/zenodo.20647514" target="_blank" rel="noopener" class="text-purple-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
            <span>🌌</span> DOI: 10.5281/zenodo.20647514
          </a>
        </div>

        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span class="text-zinc-500 text-2xs block">RESEARCH CONSORTIUMS</span>
          <div class="text-amber-300 font-bold text-2xs mt-0.5 flex flex-wrap gap-1">
            <span class="px-1.5 py-0.5 rounded bg-zinc-800">Harvard UDN</span>
            <span class="px-1.5 py-0.5 rounded bg-zinc-800">OHSU OCTRI</span>
            <span class="px-1.5 py-0.5 rounded bg-zinc-800">PhysioNet</span>
          </div>
        </div>
      </div>

      <!-- Phenotypic Features & HPO Term Mappings -->
      @let packet = currentPhenopacket();
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- HPO Phenotypic Features -->
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏷️</span> Human Phenotype Ontology (HPO) Features
            </h3>
            <span class="text-2xs font-mono text-emerald-400 font-bold">{{ packet.phenotypicFeatures.length }} Mapped</span>
          </div>

          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            @for (feat of packet.phenotypicFeatures; track $index) {
              <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span class="font-semibold text-zinc-100">{{ feat.type.label }}</span>
                  <span class="block text-2xs font-mono text-emerald-400">{{ feat.type.id }}</span>
                </div>
                <span class="px-2 py-0.5 text-2xs rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                  {{ feat.severity?.label || 'Observed' }}
                </span>
              </div>
            } @empty {
              <div class="p-3 text-xs text-zinc-500 italic text-center">No active symptoms recorded. Add symptoms to auto-map HPO terms.</div>
            }
          </div>
        </div>

        <!-- LOINC Quantitative Measurements & MONDO Diseases -->
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📊</span> LOINC Vitals &amp; MONDO Ontologies
            </h3>
            <span class="text-2xs font-mono text-cyan-400 font-bold">{{ packet.measurements.length }} Telemetry Feeds</span>
          </div>

          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            @for (meas of packet.measurements; track meas.id) {
              <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span class="font-semibold text-zinc-100">{{ meas.assay.label }}</span>
                  <span class="block text-2xs font-mono text-cyan-400">{{ meas.assay.id }}</span>
                </div>
                <span class="font-mono text-zinc-200 font-bold text-xs">
                  {{ meas.value.quantity?.value }} {{ meas.value.quantity?.unit.label }}
                </span>
              </div>
            }

            @for (dis of packet.diseases; track dis.term.id) {
              <div class="p-2.5 rounded-lg bg-zinc-950 border border-amber-900/30 flex items-center justify-between text-xs">
                <div>
                  <span class="font-semibold text-amber-200">{{ dis.term.label }}</span>
                  <span class="block text-2xs font-mono text-amber-400">{{ dis.term.id }}</span>
                </div>
                <span class="px-2 py-0.5 text-2xs rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                  Confirmed
                </span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- JSON Preview Box -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-zinc-400">
          <span class="font-mono font-semibold">GA4GH Phenopacket v2 Payload Preview</span>
          <span class="text-2xs text-zinc-500 font-mono">UTF-8 JSON • Safe Harbor De-Identified</span>
        </div>
        <pre class="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 text-2xs font-mono text-emerald-300/90 overflow-x-auto max-h-60 leading-relaxed select-all">{{ phenopacketJson() }}</pre>
      </div>
    </div>
  `
})
export class Ga4ghPhenopacketsCardComponent {
  private phenopacketService = inject(Ga4ghPhenopacketService);
  private patientState = inject(PatientStateService);

  readonly copyStatus = signal<string>('Copy JSON');

  readonly currentPatient = computed<IPatient>(() => {
    const issuesMap = this.patientState.issues() || {};
    const vitals = this.patientState.vitals() || {
      bp: '120/80',
      hr: '72',
      temp: '98.6',
      spO2: '99',
      weight: '70',
      height: '175'
    };

    return {
      id: 'pat-current',
      name: 'Homo Sapiens (Participant #8821)',
      gender: 'Female',
      age: 34,
      lastVisit: '2026-08-21',
      preexistingConditions: ['Osteoarthritis'],
      history: [],
      bookmarks: [],
      issues: issuesMap,
      patientGoals: this.patientState.patientGoals() || 'Reduce inflammation and improve mobility',
      vitals
    };
  });

  readonly currentPhenopacket = computed<IGa4ghPhenopacketV2>(() => {
    return this.phenopacketService.generatePhenopacket(this.currentPatient());
  });

  readonly phenopacketJson = computed<string>(() => {
    return JSON.stringify(this.currentPhenopacket(), null, 2);
  });

  copyJson(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.phenopacketJson()).then(() => {
        this.copyStatus.set('Copied!');
        setTimeout(() => this.copyStatus.set('Copy JSON'), 2000);
      });
    }
  }

  downloadJson(): void {
    if (typeof document === 'undefined') return;
    const blob = new Blob([this.phenopacketJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phenopacket-${this.currentPatient().id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
