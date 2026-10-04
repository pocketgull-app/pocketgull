import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IpPatentRegistryService, IPatentClaimCluster, IStatutoryClause } from '../../services/ip-patent-registry.service';

export type PatentHudTab = 'inventions' | 'clauses' | 'math' | 'charter' | 'provisional';

@Component({
  selector: 'app-patent-claims-hud-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 no-print"
         role="dialog"
         aria-modal="true"
         aria-labelledby="patent-hud-modal-title">
      
      <div class="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-zinc-950 rounded-xs border border-zinc-300 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans">
        
        <!-- Header Bar -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 bg-teal-500 rounded-2xs"></span>
            <div>
              <div class="flex items-center gap-2">
                <h2 id="patent-hud-modal-title" class="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                  POCKETGULL IP &amp; PATENT CLAIMS REGISTRY
                </h2>
                <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                  [ {{ summary.totalClaimClusters }} INVENTIONS ▪ {{ summary.totalClaimsCount }} CLAIMS ]
                </span>
              </div>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                USPTO / EPO / WIPO PCT Provisional Application Specification Codex
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            @if (copiedText()) {
              <span class="text-[11px] font-mono text-teal-600 dark:text-teal-400 animate-in fade-in">
                ✓ COPIED TO CLIPBOARD
              </span>
            }
            <button type="button"
                    (click)="close.emit()"
                    aria-label="Close Patent Registry Modal"
                    class="px-2.5 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white text-zinc-800 dark:text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700">
              [ ✕ ESC ]
            </button>
          </div>
        </div>

        <!-- Segmented Tab Navigation -->
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 shrink-0 overflow-x-auto">
          <nav class="flex space-x-1 sm:space-x-4" aria-label="Patent Registry Tabs">
            <button type="button"
                    (click)="activeTab.set('inventions')"
                    [class.border-teal-500]="activeTab() === 'inventions'"
                    [class.text-teal-600]="activeTab() === 'inventions'"
                    [class.dark:text-teal-400]="activeTab() === 'inventions'"
                    [class.border-transparent]="activeTab() !== 'inventions'"
                    [class.text-zinc-500]="activeTab() !== 'inventions'"
                    [class.dark:text-zinc-400]="activeTab() !== 'inventions'"
                    class="py-2.5 px-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap">
              01 Inventions ({{ summary.totalClaimsCount }})
            </button>

            <button type="button"
                    (click)="activeTab.set('clauses')"
                    [class.border-teal-500]="activeTab() === 'clauses'"
                    [class.text-teal-600]="activeTab() === 'clauses'"
                    [class.dark:text-teal-400]="activeTab() === 'clauses'"
                    [class.border-transparent]="activeTab() !== 'clauses'"
                    [class.text-zinc-500]="activeTab() !== 'clauses'"
                    [class.dark:text-zinc-400]="activeTab() !== 'clauses'"
                    class="py-2.5 px-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap">
              02 Statutory Clauses
            </button>

            <button type="button"
                    (click)="activeTab.set('math')"
                    [class.border-teal-500]="activeTab() === 'math'"
                    [class.text-teal-600]="activeTab() === 'math'"
                    [class.dark:text-teal-400]="activeTab() === 'math'"
                    [class.border-transparent]="activeTab() !== 'math'"
                    [class.text-zinc-500]="activeTab() !== 'math'"
                    [class.dark:text-zinc-400]="activeTab() !== 'math'"
                    class="py-2.5 px-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap">
              03 Mathematical Proofs
            </button>

            <button type="button"
                    (click)="activeTab.set('charter')"
                    [class.border-teal-500]="activeTab() === 'charter'"
                    [class.text-teal-600]="activeTab() === 'charter'"
                    [class.dark:text-teal-400]="activeTab() === 'charter'"
                    [class.border-transparent]="activeTab() !== 'charter'"
                    [class.text-zinc-500]="activeTab() !== 'charter'"
                    [class.dark:text-zinc-400]="activeTab() !== 'charter'"
                    class="py-2.5 px-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap">
              04 Prior Art &amp; Specs
            </button>

            <button type="button"
                    (click)="activeTab.set('provisional')"
                    [class.border-teal-500]="activeTab() === 'provisional'"
                    [class.text-teal-600]="activeTab() === 'provisional'"
                    [class.dark:text-teal-400]="activeTab() === 'provisional'"
                    [class.border-transparent]="activeTab() !== 'provisional'"
                    [class.text-zinc-500]="activeTab() !== 'provisional'"
                    [class.dark:text-zinc-400]="activeTab() !== 'provisional'"
                    class="py-2.5 px-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 whitespace-nowrap">
              ⭐ 05 USPTO Provisional Binder (20 Claims)
            </button>
          </nav>

          <!-- Search Filter -->
          <div class="hidden sm:flex items-center py-1.5">
            <input type="text"
                   [ngModel]="searchQuery()"
                   (ngModelChange)="searchQuery.set($event)"
                   placeholder="Search claims &amp; equations..."
                   class="px-2.5 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100 w-52 placeholder-zinc-400" />
          </div>
        </div>

        <!-- Modal Body Content -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          
          <!-- TAB 1: STAKED INVENTIONS -->
          @if (activeTab() === 'inventions') {
            <div class="grid grid-cols-1 gap-3.5">
              @for (cluster of filteredClusters(); track cluster.id) {
                <div class="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/40 transition">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        CLUSTER {{ cluster.clusterNumber }}
                      </span>
                      <span class="text-xs font-mono font-bold uppercase text-teal-600 dark:text-teal-400">
                        {{ cluster.claimRange }}
                      </span>
                      <span class="text-[10px] font-mono text-zinc-400">
                        ({{ cluster.totalClaims }} Claims)
                      </span>
                    </div>
                    <span class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {{ cluster.filingTier }}
                    </span>
                  </div>

                  <h3 class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                    {{ cluster.title }}
                  </h3>

                  <p class="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                    {{ cluster.abstract }}
                  </p>

                  <div class="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <div class="flex items-center gap-2">
                      <span>Source:</span>
                      <span class="text-zinc-800 dark:text-zinc-200 font-semibold">{{ cluster.primaryServicePath }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      @for (agency of cluster.targetAgencies; track agency) {
                        <span class="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-bold uppercase">
                          {{ agency }}
                        </span>
                      }
                      <button type="button"
                              (click)="copyClusterClaims(cluster)"
                              class="ml-2 px-2 py-0.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[10px] uppercase font-bold cursor-pointer transition">
                        Copy Claim Summary
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- TAB 2: COPYRIGHT & STATUTORY CLAUSES -->
          @if (activeTab() === 'clauses') {
            <div class="space-y-4">
              <div class="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="font-bold">⚖️ STATUTORY GOVERNANCE:</span>
                  <span>7 Active Statutory IP &amp; Licensing Articles Enforced.</span>
                </div>
                <button type="button"
                        (click)="copyAllClauses()"
                        class="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-[10px] font-bold uppercase cursor-pointer transition">
                  Copy All Clauses
                </button>
              </div>

              <div class="grid grid-cols-1 gap-3.5">
                @for (clause of filteredClauses(); track clause.id) {
                  <div class="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          {{ clause.article }} • {{ clause.section }}
                        </span>
                        <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {{ clause.title }}
                        </span>
                      </div>
                      <span class="text-[10px] font-mono text-zinc-400">
                        {{ clause.governingLaw }}
                      </span>
                    </div>

                    <p class="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-2.5 p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 leading-relaxed">
                      "{{ clause.fullText }}"
                    </p>

                    <div class="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{{ clause.summary }}</span>
                      <button type="button"
                              (click)="copyText(clause.fullText)"
                              class="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] uppercase font-bold cursor-pointer transition">
                        Copy Clause
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 3: MATHEMATICAL PROOFS -->
          @if (activeTab() === 'math') {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              @for (cluster of filteredClusters(); track cluster.id) {
                <div class="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                        INVENTION {{ cluster.clusterNumber }} • {{ cluster.claimRange }}
                      </span>
                      <span class="text-[10px] font-mono text-zinc-400">{{ cluster.filingTier }}</span>
                    </div>
                    <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {{ cluster.title }}
                    </h4>
                    <div class="mt-2.5 p-2.5 bg-zinc-950 text-teal-400 border border-zinc-800 font-pocketgull-math clinical-formula text-[12px] overflow-x-auto">
                      <code>{{ cluster.mathematicalFormulation }}</code>
                    </div>
                  </div>

                  <div class="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Engine: {{ cluster.primaryServicePath.split('/').pop() }}</span>
                    <button type="button"
                            (click)="copyText(cluster.mathematicalFormulation)"
                            class="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold uppercase cursor-pointer">
                      Copy Proof
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- TAB 4: PRIOR ART & FILING CHARTER -->
          @if (activeTab() === 'charter') {
            <div class="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 font-mono text-xs">
              <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div>
                  <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">USPTO / PCT PROVISIONAL APPLICATION STATUS</h3>
                  <p class="text-[11px] text-zinc-500 mt-0.5">200 Patent Claims across 10 Inventions • 7 Statutory Articles</p>
                </div>
                <span class="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
                  ✓ VERIFIED &amp; SEALED
                </span>
              </div>

              <div class="space-y-2 text-zinc-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                <p>• <strong>USPTO Specification Document</strong>: <code class="text-teal-600 dark:text-teal-400">docs/research/POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md</code></p>
                <p>• <strong>Statutory Clauses &amp; IP Governance</strong>: <code class="text-teal-600 dark:text-teal-400">docs/legal/INVENTION_ASSIGNMENT_AND_COPYRIGHT_CLAUSES.md</code></p>
                <p>• <strong>Cryptographic Anchor</strong>: Git Repository SHA-256 Commit Chain (Automated Pre-Commit Sentinel Guard)</p>
                <p>• <strong>Prior Art Differentiation</strong>: Zero video cloud streaming, Popperian $H_0$ statistical falsification ($p < 0.05$), and Stackelberg adherence rebate optimization ($r^*$).</p>
              </div>

              <div class="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span class="text-[11px] text-zinc-500">Jurisdictions: USPTO (US), EPO (EU), WIPO (PCT)</span>
                <button type="button"
                        (click)="copyText('docs/research/POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md')"
                        class="px-3 py-1.5 bg-teal-500 text-white font-bold text-xs uppercase cursor-pointer hover:bg-teal-600 transition">
                  Copy Charter File Reference
                </button>
              </div>
            </div>
          }

          <!-- TAB 5: USPTO PROVISIONAL PATENT BINDER -->
          @if (activeTab() === 'provisional') {
            <div class="space-y-4">
              <!-- Top Provisional Banner -->
              <div class="p-4 bg-teal-950/40 border border-teal-500/40 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/40 uppercase">
                      USPTO DOCKET {{ provisionalBinder.docketNumber }}
                    </span>
                    <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                      35 U.S.C. § 111(b) PROVISIONAL
                    </span>
                  </div>
                  <h3 class="text-sm font-bold text-white mt-1.5">
                    {{ provisionalBinder.title }}
                  </h3>
                  <p class="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Assignee: {{ provisionalBinder.assignee }} • Priority Date: {{ provisionalBinder.filingDate }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2 shrink-0">
                  <button type="button"
                          (click)="downloadProvisionalBinder()"
                          class="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-mono text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-md">
                    <span>⬇</span> Download Binder (.md)
                  </button>
                  <button type="button"
                          (click)="copyAllProvisionalClaims()"
                          class="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-teal-500/30 font-mono text-xs font-bold uppercase transition cursor-pointer">
                    Copy 20 Claims
                  </button>
                  <button type="button"
                          (click)="copyFullProvisionalSpec()"
                          class="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-mono text-xs font-bold uppercase transition cursor-pointer">
                    Copy Full Spec
                  </button>
                </div>
              </div>

              <!-- Prior Art Demarcation Card: Epic Sepsis Model vs Claimed Conformal System -->
              <div class="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                <div class="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold uppercase text-amber-500">⚖️ Prior Art Demarcation</span>
                    <span class="text-xs text-zinc-400">• Wong et al. 2021 JAMA Intern Med Failure Analysis</span>
                  </div>
                  <span class="text-[10px] font-mono text-teal-500 font-bold">120,000-Cohort Empirical Proof</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 space-y-1.5 font-mono">
                    <div class="flex items-center justify-between font-bold">
                      <span>PRIOR ART: EPIC SEPSIS MODEL (ESM)</span>
                      <span class="text-rose-500">FAILED</span>
                    </div>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>AUROC</strong>: 0.624 (Wong et al. 2021 external validation)
                    </p>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>False Alarm Rate</strong>: 88.2% false alarms across 18% of all inpatients
                    </p>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>Point Probability</strong>: Arbitrary threshold p ≥ 0.50 induces extreme alert fatigue
                    </p>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>Single-Paradigm</strong>: Zero botanical/TCM CYP450 interaction detection
                    </p>
                  </div>

                  <div class="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-200 space-y-1.5 font-mono">
                    <div class="flex items-center justify-between font-bold">
                      <span>CLAIMED INVENTION: MONDRIAN ICP CONFORMAL</span>
                      <span class="text-teal-400">PATENT READY</span>
                    </div>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>AUROC</strong>: 0.835 (+33.8% discrimination improvement)
                    </p>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>Alarm Fatigue Reduction</strong>: 89.9% reduction in false-positive alerts
                    </p>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>Epistemic Abstention</strong>: Set &#123;0, 1&#125; suppresses alarms + reflexes labs + 2m poll
                    </p>
                    <p class="text-[11px] leading-relaxed">
                      • <strong>Tri-Paradigm</strong>: Multi-objective EBM / TCM / Ayurveda with CYP450 gate
                    </p>
                  </div>
                </div>
              </div>

              <!-- Figures HUD with Figure Switcher & Visual Render -->
              <div class="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100">
                      Formal Patent Drawings (FIG. 1 – 4)
                    </span>
                    <span class="text-[10px] font-mono text-zinc-400">USPTO 37 CFR § 1.84 Compliant</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    @for (fig of provisionalBinder.figures; track fig.figureNumber) {
                      <button type="button"
                              (click)="selectedProvisionalFig.set(fig.figureNumber)"
                              [class.bg-teal-500]="selectedProvisionalFig() === fig.figureNumber"
                              [class.text-white]="selectedProvisionalFig() === fig.figureNumber"
                              [class.bg-zinc-200]="selectedProvisionalFig() !== fig.figureNumber"
                              [class.dark:bg-zinc-800]="selectedProvisionalFig() !== fig.figureNumber"
                              [class.text-zinc-700]="selectedProvisionalFig() !== fig.figureNumber"
                              [class.dark:text-zinc-300]="selectedProvisionalFig() !== fig.figureNumber"
                              class="px-2 py-1 text-[11px] font-mono font-bold uppercase cursor-pointer transition">
                        FIG. {{ fig.figureNumber }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Current Figure Display -->
                <div class="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="font-bold text-teal-400">{{ currentFigure().title }}</span>
                    <span class="text-zinc-400">{{ currentFigure().description }}</span>
                  </div>

                  <!-- SVG Render Frame -->
                  <div class="w-full overflow-x-auto border border-zinc-900 p-2 bg-black rounded-xs"
                       [innerHTML]="sanitizedCurrentSvg()">
                  </div>

                  <!-- Collapsible ASCII Fallback -->
                  <details class="text-[10px] font-mono text-zinc-400 pt-1">
                    <summary class="cursor-pointer hover:text-teal-400 uppercase font-bold">
                      View High-Resolution ASCII Schematic
                    </summary>
                    <pre class="mt-2 p-2 bg-zinc-900/80 text-zinc-300 overflow-x-auto leading-tight">{{ currentFigure().asciiArt }}</pre>
                  </details>
                </div>
              </div>

              <!-- 20 Formal Patent Claims List (35 U.S.C. § 112) -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between px-1">
                  <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Complete 20 Formal Patent Claims (35 U.S.C. § 112)
                  </h4>
                  <span class="text-[10px] font-mono text-zinc-400">
                    [ Claims 1–10: System | Claims 11–18: Method | Claims 19–20: CRM ]
                  </span>
                </div>

                <div class="grid grid-cols-1 gap-2.5">
                  @for (claim of provisionalBinder.claims; track claim.claimNumber) {
                    <div class="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/40 transition">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                          <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                            CLAIM {{ claim.claimNumber }}
                          </span>
                          <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase"
                                [class.bg-blue-500-10]="claim.claimType === 'System'"
                                [class.text-blue-500]="claim.claimType === 'System'"
                                [class.bg-amber-500-10]="claim.claimType === 'Method'"
                                [class.text-amber-500]="claim.claimType === 'Method'"
                                [class.bg-purple-500-10]="claim.claimType === 'CRM'"
                                [class.text-purple-500]="claim.claimType === 'CRM'">
                            {{ claim.claimType }}
                          </span>
                          <span class="text-[10px] font-mono font-bold uppercase text-zinc-500">
                            {{ claim.isIndependent ? 'Independent' : 'Dependent' }}
                          </span>
                        </div>

                        <button type="button"
                                (click)="copyText(claim.claimText)"
                                class="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono uppercase font-bold cursor-pointer transition">
                          Copy Claim
                        </button>
                      </div>

                      <p class="text-xs text-zinc-700 dark:text-zinc-300 font-mono mt-2 leading-relaxed bg-white dark:bg-zinc-950 p-2.5 border border-zinc-200 dark:border-zinc-800/80">
                        {{ claim.claimText }}
                      </p>
                    </div>
                  }
                </div>
              </div>

            </div>
          }

        </div>

        <!-- Modal Footer Bar with Brand Marker Typography -->
        <div class="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-2 text-[11px] text-zinc-500">
            <span class="font-pocketgull-brand text-xs font-bold text-zinc-800 dark:text-zinc-200">PocketGull</span>
            <span>•</span>
            <span>Copyright © 2026 Applied Clinical AI Consortium. All Rights Reserved.</span>
          </div>

          <div class="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span>35 U.S.C. §101 / 17 U.S.C. §101</span>
            <span>•</span>
            <span class="text-teal-600 dark:text-teal-400 font-bold">{{ summary.totalClaimsCount }} CLAIMS STAKED</span>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PatentClaimsHudModalComponent {
  private patentService = inject(IpPatentRegistryService);
  private sanitizer = inject(DomSanitizer, { optional: true });

  readonly close = output<void>();

  readonly activeTab = signal<PatentHudTab>('inventions');
  readonly searchQuery = signal<string>('');
  readonly copiedText = signal<boolean>(false);
  readonly selectedProvisionalFig = signal<number>(1);

  readonly provisionalBinder = this.patentService.getUsptoProvisionalBinder();
  readonly currentFigure = computed(() => {
    return this.provisionalBinder.figures.find(f => f.figureNumber === this.selectedProvisionalFig()) || this.provisionalBinder.figures[0];
  });

  readonly sanitizedCurrentSvg = computed<SafeHtml>(() => {
    const markup = this.currentFigure().svgMarkup;
    return this.sanitizer ? this.sanitizer.bypassSecurityTrustHtml(markup) : markup;
  });

  readonly summary = this.patentService.getPatentSummary();

  readonly filteredClusters = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.summary.clusters;
    return this.summary.clusters.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.abstract.toLowerCase().includes(query) ||
      c.mathematicalFormulation.toLowerCase().includes(query) ||
      c.claimRange.toLowerCase().includes(query)
    );
  });

  readonly filteredClauses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.summary.statutoryClauses;
    return this.summary.statutoryClauses.filter(cl =>
      cl.title.toLowerCase().includes(query) ||
      cl.fullText.toLowerCase().includes(query) ||
      cl.article.toLowerCase().includes(query) ||
      cl.governingLaw.toLowerCase().includes(query)
    );
  });

  copyText(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copiedText.set(true);
      setTimeout(() => this.copiedText.set(false), 2500);
    }
  }

  copyClusterClaims(cluster: IPatentClaimCluster): void {
    const formatted = `[POCKETGULL PATENT CLAIM CLUSTER ${cluster.clusterNumber}: ${cluster.claimRange}]\nTitle: ${cluster.title}\nStatus: ${cluster.filingTier}\nAbstract: ${cluster.abstract}\nMathematical Proof: ${cluster.mathematicalFormulation}\nPrimary Service: ${cluster.primaryServicePath}`;
    this.copyText(formatted);
  }

  copyAllClauses(): void {
    const formatted = this.summary.statutoryClauses
      .map(cl => `${cl.article} (${cl.section}): ${cl.title}\nGoverning Law: ${cl.governingLaw}\n"${cl.fullText}"\n`)
      .join('\n---\n\n');
    this.copyText(formatted);
  }

  copyAllProvisionalClaims(): void {
    const formatted = this.provisionalBinder.claims
      .map(c => `[CLAIM ${c.claimNumber} (${c.claimType}, ${c.isIndependent ? 'Independent' : 'Dependent'})]\n${c.claimText}\n`)
      .join('\n');
    this.copyText(formatted);
  }

  copyFullProvisionalSpec(): void {
    this.copyText(this.provisionalBinder.fullSpecificationMarkdown);
  }

  downloadProvisionalBinder(): void {
    if (typeof document === 'undefined') return;
    const blob = new Blob([this.provisionalBinder.fullSpecificationMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'USPTO_PROVISIONAL_TRI_PARADIGM_CONFORMAL_SEPSIS.md';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
