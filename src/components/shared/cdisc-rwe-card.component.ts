import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdiscRweDossierService, IIrbProtocolDossier } from '../../services/cdisc-rwe-dossier.service';

@Component({
  selector: 'app-cdisc-rwe-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-zinc-950 border border-teal-500/30 p-5 shadow-2xl space-y-4 font-pocketgull-inter text-zinc-100">
      
      <!-- Header with FDA 21 CFR Part 11 & CDISC SDTM Badges -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-lg">
            📜
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold font-pocketgull-mono text-teal-300">CDISC SDTM &amp; FDA RWE Dossier</h3>
              <span class="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-teal-950 text-teal-300 border border-teal-500/30 font-pocketgull-mono">
                21 CFR Part 11
              </span>
            </div>
            <p class="text-xs text-zinc-400">Institutional Review Board (IRB) Protocol &amp; Real-World Evidence</p>
          </div>
        </div>

        <!-- Electronic Signature Hash Seal -->
        <div class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-teal-500/40 text-[10px] font-pocketgull-mono text-teal-400">
          <span class="text-zinc-500">Seal:</span> {{ dossier().sdtmDatasetPackage.fdaCfr21Part11Seal }}
        </div>
      </div>

      <!-- Protocol Summary & Specific Aims -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
          <div class="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-pocketgull-mono">
            🎯 Protocol &amp; Specific Aims
          </div>
          <div class="font-semibold text-zinc-200">{{ dossier().protocolNumber }}</div>
          <ul class="space-y-1 text-zinc-400 text-[11px]">
            @for (aim of dossier().specificAims; track aim) {
              <li class="flex items-start gap-1.5">
                <span class="text-teal-400 font-bold">•</span>
                <span>{{ aim }}</span>
              </li>
            }
          </ul>
        </div>

        <!-- CDISC Domains Breakdown (DM, VS, CM) -->
        <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
          <div class="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-pocketgull-mono">
            📊 CDISC SDTM v2.0 Dataset Records
          </div>
          <div class="grid grid-cols-3 gap-2 text-center pt-1">
            <div class="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div class="text-xs font-bold text-teal-300 font-pocketgull-mono">DM (Demo)</div>
              <div class="text-sm font-extrabold text-zinc-100 font-pocketgull-tabular">{{ dossier().sdtmDatasetPackage.dm.length }}</div>
              <div class="text-[9px] text-zinc-500">Subject</div>
            </div>
            <div class="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div class="text-xs font-bold text-teal-300 font-pocketgull-mono">VS (Vitals)</div>
              <div class="text-sm font-extrabold text-zinc-100 font-pocketgull-tabular">{{ dossier().sdtmDatasetPackage.vs.length }}</div>
              <div class="text-[9px] text-zinc-500">Observations</div>
            </div>
            <div class="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <div class="text-xs font-bold text-teal-300 font-pocketgull-mono">CM (Meds)</div>
              <div class="text-sm font-extrabold text-zinc-100 font-pocketgull-tabular">{{ dossier().sdtmDatasetPackage.cm.length }}</div>
              <div class="text-[9px] text-zinc-500">Therapies</div>
            </div>
          </div>
          <div class="text-[10px] text-zinc-400 pt-1 flex items-center justify-between">
            <span>Standard: {{ dossier().sdtmDatasetPackage.dataDictionarySummary }}</span>
            <span class="text-emerald-400 font-bold">100% De-Identified</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
        <div class="text-[11px] text-zinc-400">
          Principal Investigator: <strong class="text-zinc-200">{{ dossier().piName }}</strong> (NPI: <span class="font-pocketgull-mono text-teal-400">{{ dossier().piNpi }}</span>)
        </div>

        <div class="flex items-center gap-2">
          <button (click)="copyDossierMarkdown()"
                  class="px-3 py-1.5 text-xs font-bold font-pocketgull-inter rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <span>{{ copied() ? '✅ Copied!' : '📋 Copy IRB Markdown' }}</span>
          </button>
          <button (click)="downloadJsonPackage()"
                  class="px-3 py-1.5 text-xs font-bold font-pocketgull-inter rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md shadow-teal-900/30">
            <span>💾 Export SDTM JSON</span>
          </button>
        </div>
      </div>

    </div>
  `
})
export class CdiscRweCardComponent {
  private cdiscService: CdiscRweDossierService;
  dossier = signal<IIrbProtocolDossier>({} as any);
  copied = signal(false);

  constructor(customService?: CdiscRweDossierService) {
    if (customService) {
      this.cdiscService = customService;
    } else {
      try {
        this.cdiscService = inject(CdiscRweDossierService, { optional: true }) || new CdiscRweDossierService();
      } catch {
        this.cdiscService = new CdiscRweDossierService();
      }
    }
    this.dossier.set(this.cdiscService.generateIrbDossier());
  }

  copyDossierMarkdown(): void {
    const md = this.cdiscService.formatIrbDossierMarkdown(this.dossier());
    navigator.clipboard.writeText(md);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }

  downloadJsonPackage(): void {
    const jsonStr = JSON.stringify(this.dossier().sdtmDatasetPackage, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDISC_SDTM_${this.dossier().protocolNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
