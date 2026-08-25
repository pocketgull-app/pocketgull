import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearchConsentService } from '../services/research-consent.service';
import { IResearchCohortListing } from '../models/research-cohort.types';

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
            <span class="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-lg">🧬</span>
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ethical Patient Research Data Dividend &amp; Cohort Registry
            </h2>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            You own your data. When accredited universities or biotech labs query your de-identified telemetry,
            <span class="text-emerald-400 font-semibold">85% of query revenue</span> is disbursed directly to your wallet.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-semibold rounded-full flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            HIPAA §164.514 Safe Harbor
          </span>
        </div>
      </div>

      <!-- Ethical Precedents Governance Card -->
      <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
            <span>🛡️</span> Verified Ethical Research Precedents
          </span>
          <span class="text-[11px] text-zinc-500 font-mono">100% Opt-In • Zero Third-Party Brokers</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <!-- NIH All of Us Precedent -->
          <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="text-emerald-400">🏛️</span> NIH "All of Us" Model
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Federal research registry collecting EHR, vitals, and biosignals. Patients receive stipends ($25–$100) + free personalized biometric insights.
            </p>
          </div>

          <!-- LunaDNA Precedent -->
          <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="text-teal-400">📈</span> LunaDNA (LunaPBC) Model
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              SEC-qualified public benefit corporation where members own shares and receive direct dividends for contributing health &amp; genomic data.
            </p>
          </div>

          <!-- Ciitizen Precedent -->
          <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="text-indigo-400">🔬</span> Ciitizen / Invitae Model
            </div>
            <p class="text-zinc-400 text-[11px] leading-relaxed">
              Patients with chronic or rare conditions participate in paid longitudinal registries to accelerate FDA drug approvals and clinical trials.
            </p>
          </div>
        </div>
      </div>

      <!-- Financial Ledger Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Lifetime Dividends -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Lifetime Research Dividends</span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-extrabold text-emerald-400 font-mono">
              \${{ researchService.lifetimeEarnings() | number:'1.2-2' }}
            </span>
            <span class="text-xs text-zinc-500 font-mono">USD</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2">Cumulative revenue share from accredited queries</span>
        </div>

        <!-- Available Balance -->
        <div class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col justify-between">
          <span class="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Available for Cash Out</span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-extrabold text-white font-mono">
              \${{ researchService.availableBalance() | number:'1.2-2' }}
            </span>
            <span class="text-xs text-zinc-400 font-mono">USD</span>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-[11px] text-zinc-400">{{ researchService.enrollment().payoutAccountMasked || 'Stripe Connect' }}</span>
            <button 
              (click)="cashOut()"
              [disabled]="researchService.availableBalance() <= 0 || isProcessingPayout()"
              class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1">
              <span>{{ isProcessingPayout() ? 'Transferring...' : 'Cash Out' }}</span>
              <span>💳</span>
            </button>
          </div>
        </div>

        <!-- Active Cohort Enrollments -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Enrolled Disease Cohorts</span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-extrabold text-teal-300 font-mono">
              {{ researchService.enrolledCohortCount() }}
            </span>
            <span class="text-xs text-zinc-500 font-mono">/ {{ researchService.availableCohorts().length }} Active</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2">Accredited university &amp; biotech discovery vectors</span>
        </div>
      </div>

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

      <!-- Disease Cohort Selection Grid -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Available Disease Research Cohorts
          </h3>
          <span class="text-xs text-zinc-500 font-mono">Select cohorts you wish to contribute to</span>
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
                  <span class="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shrink-0">
                    +\${{ cohort.compensationPerQueryUsd | number:'1.2-2' }} / query
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

      <!-- Simulate Academic Query & Dividend Distribution Bar (Demo / Testing) -->
      <div class="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-xs uppercase font-mono font-bold text-indigo-400">⚡ Live Dividend &amp; Insight Simulator</span>
          <p class="text-xs text-zinc-300 mt-0.5">
            Simulate an accredited BigQuery study query from Stanford / Mayo Clinic to see your ledger balance accrue and research findings return in real time.
          </p>
        </div>
        <button 
          (click)="simulateResearchQuery()"
          class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0">
          Simulate \+$25.00 Study Query
        </button>
      </div>

      <!-- Research Impact Transparency Stream -->
      <div class="space-y-2">
        <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-300">
          Transparent Research Access &amp; Discovery Stream
        </h3>
        
        <div class="divide-y divide-zinc-800 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden text-xs">
          @for (entry of researchService.recentLedger(); track entry.id) {
            <div class="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/40 transition">
              <div class="flex items-start gap-3">
                <span class="text-emerald-400 font-mono font-bold text-sm shrink-0">+\${{ entry.amountUsd | number:'1.2-2' }}</span>
                <div>
                  <div class="text-white font-semibold flex items-center gap-2">
                    <span>{{ entry.cohortTitle }}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-teal-300 border border-zinc-700">
                      {{ entry.patientRevenueSharePercent }}% Patient Share
                    </span>
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
                <span [class.text-emerald-400]="entry.status === 'paid_out'" [class.text-amber-400]="entry.status === 'accrued'" class="text-[11px] font-mono font-semibold uppercase">
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
  readonly isProcessingPayout = signal(false);

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

  cashOut(): void {
    this.isProcessingPayout.set(true);
    setTimeout(() => {
      this.researchService.requestCashOut();
      this.isProcessingPayout.set(false);
    }, 600);
  }
}
