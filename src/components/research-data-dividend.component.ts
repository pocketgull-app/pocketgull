import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearchConsentService } from '../services/research-consent.service';
import {
  IResearchCohortListing,
  IBigQueryAnalyticsHubListing,
  IDryRunSqlQueryResult
} from '../models/research-cohort.types';

@Component({
  selector: 'app-research-data-dividend',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6 font-sans">
      
      <!-- Header / Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20 text-lg">🧬</span>
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ethical Open Science Commons &amp; Research Impact Hub
            </h2>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            You own your data. When accredited universities or non-profit research consortia query your de-identified telemetry,
            <span class="text-teal-300 font-semibold">100% of scientific discoveries and personalized benchmarks</span> are returned directly to you.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-semibold rounded-full flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            HIPAA §164.514 Safe Harbor
          </span>
          <span class="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold rounded-full flex items-center gap-1.5">
            <span>☁️</span>
            BigQuery Analytics Hub
          </span>
        </div>
      </div>

      <!-- Belmont Report & Common Rule Ethical Guard Banner -->
      <div class="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-3">
        <span class="text-base shrink-0">⚖️</span>
        <div class="leading-relaxed">
          <span class="font-bold text-teal-300">Belmont Report &amp; Common Rule Safeguard (45 CFR § 46):</span>
          Patient participation in PocketGull research cohorts is non-commercial open science, protected against financial coercion and undue inducement. Direct patient stipends occur exclusively when an accredited institutional sponsor (NIH, university, or non-profit consortium) deposits verified grant escrow for an approved IRB study.
        </div>
      </div>

      <!-- Ethical Precedents Governance Card -->
      <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
            <span>🛡️</span> Verified Ethical Research Precedents
          </span>
          <span class="text-[11px] text-zinc-500 font-mono">100% Opt-In • Zero Third-Party Data Brokers</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <!-- NIH All of Us Precedent -->
          <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="text-emerald-400">🏛️</span> NIH "All of Us" Model
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Federal research registry collecting EHR, vitals, and biosignals. Patients receive free personalized biometric insights and trial priority.
            </p>
          </div>

          <!-- LunaDNA Precedent -->
          <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="text-teal-400">📈</span> LunaDNA Public Benefit Model
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Public benefit cooperative framework where community members govern research priorities and receive direct scientific returns.
            </p>
          </div>

          <!-- Ciitizen Precedent -->
          <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="text-indigo-400">🔬</span> Ciitizen Rare Disease Model
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Patients with chronic or rare conditions participate in longitudinal open registries to accelerate FDA drug approvals and clinical trials.
            </p>
          </div>
        </div>
      </div>

      <!-- Open Science Impact & Escrow Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Research Contributions -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Research Contributions</span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-extrabold text-teal-400 font-mono">
              {{ researchService.totalContributionsCount() }}
            </span>
            <span class="text-xs text-zinc-500 font-mono">Studies Supported</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2">Protected by Laplace Differential Privacy (&epsilon; = 0.8)</span>
        </div>

        <!-- Institutional Grant Escrow Status -->
        <div class="p-4 rounded-xl border border-teal-500/30 bg-teal-950/20 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-teal-300 font-semibold">Grant Escrow Status</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Pure Open Science
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-extrabold text-white font-mono">
              \${{ researchService.grantEscrowBalance() | number:'1.2-2' }}
            </span>
            <span class="text-xs text-zinc-400 font-mono">USD Escrow</span>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-[11px] text-zinc-400">Awaiting Accredited Grant</span>
            <button 
              (click)="exportResearchDossier()"
              class="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1">
              <span>Export Dossier</span>
              <span>📄</span>
            </button>
          </div>
        </div>

        <!-- Active Cohort Enrollments -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Enrolled Disease Registries</span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-extrabold text-indigo-300 font-mono">
              {{ researchService.enrolledCohortCount() }}
            </span>
            <span class="text-xs text-zinc-500 font-mono">/ {{ researchService.availableCohorts().length }} Active</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2">Accredited university &amp; biotech discovery vectors</span>
        </div>
      </div>

      <!-- Dossier Export Banner (when exported) -->
      @if (showDossierExportNotice()) {
        <div class="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="font-bold text-teal-300 flex items-center gap-2">
              <span>✓ Research Impact Dossier Generated</span>
              <span class="font-mono text-[10px] text-zinc-400">SHA-256 Attested</span>
            </div>
            <p class="text-zinc-300 text-[11px]">
              Complete provenance manifest of {{ researchService.totalContributionsCount() }} de-identified open science contributions formatted for clinical trial qualification and IRB review.
            </p>
          </div>
          <button (click)="showDossierExportNotice.set(false)" class="text-zinc-400 hover:text-white text-xs px-2 py-1">Dismiss</button>
        </div>
      }

      <!-- HIPAA Authorization Status & Revocation Bar -->
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div [class.bg-green-500]="researchService.isHipaaAuthorized()" [class.bg-amber-500]="!researchService.isHipaaAuthorized()" class="h-3 w-3 rounded-full shrink-0"></div>
          <div>
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <span>{{ researchService.isHipaaAuthorized() ? 'HIPAA § 164.508 Digital Research Authorization Active' : 'Authorization Inactive' }}</span>
              @if (researchService.isHipaaAuthorized()) {
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {{ researchService.enrollment().authorizationSignatureHash | slice:0:16 }}...
                </span>
              }
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              All 18 direct identifiers stripped. Telemetry encrypted with differential privacy ($k \ge 5$). Zero data sold without active consent.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          @if (researchService.isHipaaAuthorized()) {
            <button 
              (click)="revokeConsent()"
              class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition cursor-pointer">
              Revoke Consent &amp; Purge
            </button>
          } @else {
            <button 
              (click)="signConsent()"
              class="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold rounded-lg transition cursor-pointer">
              Sign HIPAA Authorization
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs: Patient Cohorts vs. BigQuery Analytics Hub Data Exchange -->
      <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button 
          (click)="activeTab.set('cohorts')"
          [class.bg-teal-500]="activeTab() === 'cohorts'"
          [class.text-zinc-950]="activeTab() === 'cohorts'"
          [class.bg-zinc-900]="activeTab() !== 'cohorts'"
          [class.text-zinc-400]="activeTab() !== 'cohorts'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
          <span>🧬</span>
          <span>Open Disease Registries</span>
        </button>

        <button 
          (click)="activeTab.set('analytics_hub')"
          [class.bg-indigo-500]="activeTab() === 'analytics_hub'"
          [class.text-white]="activeTab() === 'analytics_hub'"
          [class.bg-zinc-900]="activeTab() !== 'analytics_hub'"
          [class.text-zinc-400]="activeTab() !== 'analytics_hub'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
          <span>📊</span>
          <span>BigQuery Analytics Hub Exchange</span>
          <span class="px-1.5 py-0.2 bg-indigo-900/60 text-indigo-300 rounded text-[10px] font-mono">GCP</span>
        </button>
      </div>

      <!-- TAB 1: Patient Disease Cohort Selection Grid -->
      @if (activeTab() === 'cohorts') {
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Open Science Disease Research Registries
            </h3>
            <span class="text-xs text-zinc-500 font-mono">Select registries you wish to contribute to</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            @for (cohort of researchService.availableCohorts(); track cohort.id) {
              <div 
                [class.border-teal-500/50]="researchService.isCohortEnrolled(cohort.id)"
                [class.bg-teal-950/10]="researchService.isCohortEnrolled(cohort.id)"
                class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 transition flex flex-col justify-between gap-3">
                
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <span class="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {{ cohort.sponsorOrInstitution }}
                      </span>
                      <h4 class="text-base font-bold text-white mt-1.5">{{ cohort.title }}</h4>
                    </div>
                    <span class="text-xs font-mono font-semibold text-teal-300 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20 shrink-0">
                      Open Science
                    </span>
                  </div>

                  <p class="text-xs text-zinc-400 mt-2">{{ cohort.description }}</p>
                  <div class="text-[11px] text-zinc-500 mt-1 italic">🎯 {{ cohort.clinicalObjective }}</div>
                  <div class="text-[11px] text-teal-400/90 mt-1.5 flex items-center gap-1">
                    <span>🎁</span> <span><strong>Patient Return:</strong> {{ cohort.participantBenefitDescription }}</span>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-1.5">
                    @for (tag of cohort.tags; track tag) {
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                        #{{ tag }}
                      </span>
                    }
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                  <span class="text-[11px] text-zinc-500 font-mono">
                    👥 {{ cohort.participantCount | number }} enrolled (k={{ cohort.kAnonymityScore }})
                  </span>

                  <button 
                    (click)="toggleCohort(cohort.id)"
                    [class.bg-teal-500]="researchService.isCohortEnrolled(cohort.id)"
                    [class.text-zinc-950]="researchService.isCohortEnrolled(cohort.id)"
                    [class.bg-zinc-800]="!researchService.isCohortEnrolled(cohort.id)"
                    [class.text-zinc-300]="!researchService.isCohortEnrolled(cohort.id)"
                    class="px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1">
                    <span>{{ researchService.isCohortEnrolled(cohort.id) ? '✓ Enrolled' : '+ Enroll' }}</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: BigQuery Analytics Hub Data Exchange & Dry-Run SQL Preview -->
      @if (activeTab() === 'analytics_hub') {
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-zinc-900/80 border border-indigo-500/30 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                <span>⚡</span> Google Cloud BigQuery Analytics Hub Data Exchange
              </span>
              <span class="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                gen-lang-client-0540208645
              </span>
            </div>
            <p class="text-xs text-zinc-300">
              Published on <strong class="text-white">pocketgull_data_exchange</strong>. Subscribed researchers run queries directly in BigQuery with zero data movement. All aggregates are protected by Laplace Differential Privacy (&epsilon; &le; 0.8, &delta; &le; 1e-5) and verified k-anonymity (&ge; 5).
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3.5">
            @for (listing of researchService.analyticsHubListings(); track listing.listingId) {
              <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {{ listing.category }}
                      </span>
                      <span class="text-[11px] font-mono text-zinc-500">
                        {{ listing.datasetReference }}
                      </span>
                    </div>
                    <h4 class="text-base font-bold text-white mt-1">{{ listing.displayName }}</h4>
                    <p class="text-xs text-zinc-400 mt-1">{{ listing.description }}</p>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      ε = {{ listing.differentialPrivacyBudget.epsilon }} DP
                    </span>
                    <span class="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">
                      k = {{ listing.kAnonymityScore }}
                    </span>
                    <button 
                      (click)="runDryRun(listing)"
                      class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1">
                      <span>Dry-Run SQL</span>
                      <span>🔎</span>
                    </button>
                  </div>
                </div>

                <!-- Sample Schema Columns -->
                <div class="pt-2 border-t border-zinc-800/80">
                  <span class="text-[11px] text-zinc-400 font-semibold">De-Identified Schema Columns:</span>
                  <div class="mt-1.5 flex flex-wrap gap-2">
                    @for (col of listing.sampleColumns; track col.name) {
                      <div class="text-[10px] font-mono px-2 py-1 rounded bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
                        <span class="text-teal-300 font-semibold">{{ col.name }}</span>
                        <span class="text-zinc-600">({{ col.type }})</span>
                        <span class="text-emerald-400 font-bold text-[9px]">✓ Safe</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Dry-Run SQL Results Drawer / Card (when dry-run active) -->
          @if (dryRunResult(); as res) {
            <div class="p-4 rounded-xl bg-zinc-900 border border-indigo-500/50 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 font-bold text-sm">✓ BigQuery Privacy-Safe Dry-Run Executed</span>
                  <span class="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 border border-zinc-700">
                    Est. Billed: {{ res.estimatedBytesBilled / 1048576 | number:'1.1-1' }} MB
                  </span>
                </div>
                <button (click)="dryRunResult.set(null)" class="text-xs text-zinc-400 hover:text-white">✕ Close</button>
              </div>

              <div class="space-y-1">
                <span class="text-[11px] font-mono text-zinc-400 uppercase">Aggregated SQL Statement:</span>
                <pre class="p-2.5 rounded bg-zinc-950 font-mono text-[11px] text-teal-300 overflow-x-auto border border-zinc-800/80">{{ res.sql }}</pre>
              </div>

              <div class="space-y-1.5">
                <span class="text-[11px] font-mono text-zinc-400 uppercase">Laplace Perturbed Output Sample (Zero PHI Leakage):</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  @for (metric of getMetricEntries(res.perturbedAggregateSample); track metric.key) {
                    <div class="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span class="text-[10px] text-zinc-500 font-mono block">{{ metric.key }}</span>
                      <span class="text-base font-bold text-emerald-400 font-mono">{{ metric.val }}</span>
                    </div>
                  }
                </div>
              </div>

              <p class="text-[11px] text-zinc-400 italic">
                🛡️ {{ res.executionNotice }} (ε consumed: {{ res.differentialPrivacyEpsilonConsumed }})
              </p>
            </div>
          }
        </div>
      }

      <!-- Simulate Academic Query & Open Science Contribution Bar -->
      <div class="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-xs uppercase font-mono font-bold text-indigo-400">⚡ Open Science Discovery Simulator</span>
          <p class="text-xs text-zinc-300 mt-0.5">
            Simulate an accredited BigQuery study query from Stanford / Mayo Clinic to see your de-identified telemetry unlock peer-reviewed clinical findings in real time.
          </p>
        </div>
        <button 
          (click)="simulateResearchQuery()"
          class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0">
          Simulate Open Science Study Query
        </button>
      </div>

      <!-- Research Impact Transparency Stream -->
      <div class="space-y-2">
        <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-300">
          Open Science Impact &amp; Published Findings Stream
        </h3>
        
        <div class="divide-y divide-zinc-800 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden text-xs">
          @for (entry of researchService.recentLedger(); track entry.id) {
            <div class="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/40 transition">
              <div class="flex items-start gap-3">
                <span class="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20 text-xs font-mono font-bold shrink-0">
                  Impact {{ entry.openScienceImpactScore ?? 90 }}
                </span>
                <div>
                  <div class="text-white font-semibold flex items-center gap-2">
                    <span>{{ entry.cohortTitle }}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-teal-300 border border-zinc-700">
                      Open Access
                    </span>
                    @if (entry.studyDoi) {
                      <span class="text-[10px] font-mono text-zinc-500">DOI: {{ entry.studyDoi }}</span>
                    }
                  </div>
                  <div class="text-[11px] text-zinc-400 mt-0.5">
                    {{ entry.buyerInstitution }} • <span class="font-mono text-zinc-500">{{ entry.timestamp | date:'short' }}</span>
                  </div>
                  @if (entry.researchFindingSummary) {
                    <div class="text-[11px] text-zinc-300 mt-1 italic bg-zinc-950/40 p-1.5 rounded border border-zinc-800/60">
                      💡 <strong>Discovery Return:</strong> {{ entry.researchFindingSummary }}
                    </div>
                  }
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span class="text-[11px] font-mono font-semibold uppercase text-teal-400">
                  {{ entry.status }}
                </span>
                <span class="text-[10px] font-mono text-zinc-600 hidden md:inline">{{ entry.transactionHash }}</span>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class ResearchDataDividendComponent {
  readonly researchService: ResearchConsentService;
  readonly showDossierExportNotice = signal(false);
  readonly activeTab = signal<'cohorts' | 'analytics_hub'>('cohorts');
  readonly selectedListing = signal<IBigQueryAnalyticsHubListing | null>(null);
  readonly dryRunResult = signal<IDryRunSqlQueryResult | null>(null);


  constructor(researchService?: ResearchConsentService) {
    this.researchService = researchService || inject(ResearchConsentService, { optional: true }) || new ResearchConsentService();
  }

  toggleCohort(cohortId: string): void {
    this.researchService.toggleCohortEnrollment(cohortId);
  }

  signConsent(): void {
    this.researchService.signHipaaAuthorization('Patient Self-Attestation');
  }

  revokeConsent(): void {
    this.researchService.revokeAuthorizationAndPurge();
  }

  simulateResearchQuery(): void {
    this.researchService.simulateDividendAccrual('cohort_diabetes_cgm', 'Stanford Center for Precision Medicine');
  }

  exportResearchDossier(): void {
    this.showDossierExportNotice.set(true);
  }

  runDryRun(listing: IBigQueryAnalyticsHubListing): void {
    this.selectedListing.set(listing);
    const cohortId = listing.listingId.split('/').pop() || 'cohort_diabetes_cgm';
    const res = this.researchService.executePrivacyPreservingDryRun(cohortId);
    this.dryRunResult.set(res);
  }

  getMetricEntries(sample: Record<string, number>): Array<{ key: string; val: number }> {
    return Object.entries(sample).map(([key, val]) => ({ key, val }));
  }
}

