import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinical-cds-disclaimer-banner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-3 px-4 bg-zinc-950/90 border-t border-zinc-800 backdrop-blur-md font-mono text-[10.5px] text-zinc-400 flex flex-wrap items-center justify-between gap-3 z-40">
      <div class="flex items-center gap-2">
        <span class="text-amber-400 text-xs">🛡️</span>
        <span class="font-bold text-zinc-200">FDA CDS Guidance (21 U.S.C. 360j(o)) & HIPAA Security Rule Notice:</span>
        <span class="hidden md:inline text-zinc-400">
          Pocket-Gull Clinical Intelligence outputs serve as Clinical Decision Support (CDS) for independent licensed provider review. Patient data protected via FHIR R4 and DOMPurify sanitization.
        </span>
      </div>
      <div class="flex items-center gap-2 text-[9.5px]">
        <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">NIST AI RMF 1.0</span>
        <span class="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold">SPDX 2.3 SBOM</span>
      </div>
    </div>
  `
})
export class ClinicalCdsDisclaimerBannerComponent {}
