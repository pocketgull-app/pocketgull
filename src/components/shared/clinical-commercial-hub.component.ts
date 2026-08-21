import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicOnboardingWizardComponent } from './clinic-onboarding-wizard.component';
import { CdiscRweCardComponent } from './cdisc-rwe-card.component';

@Component({
  selector: 'app-clinical-commercial-hub',
  standalone: true,
  imports: [CommonModule, ClinicOnboardingWizardComponent, CdiscRweCardComponent],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div class="flex items-center gap-3">
          <img src="/images/google_admin_origami_solo_whitebg_320x132.png" 
               alt="PocketGull Origami Crane" 
               class="h-10 w-auto rounded-lg shadow-sm border border-emerald-500/30 shrink-0 bg-white p-1" />
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight text-white">Commercial Monetization &amp; Practice Growth Hub</h2>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Revenue Pipelines
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">
              Turn PocketGull's clinical algorithms, ambient scribing, and FHIR pipelines into active practice revenue and recurring SaaS subscriptions.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-2xs text-zinc-400 font-mono">CMS NPI: <strong class="text-emerald-400">1487569752</strong></span>
          <span class="text-zinc-600">&bull;</span>
          <span class="text-2xs text-zinc-400 font-mono">ORCID: <strong class="text-emerald-400">0009-0008-1372-5381</strong></span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          (click)="activeTab.set('onboarding')"
          [class]="activeTab() === 'onboarding' 
            ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm' 
            : 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🚀 60-Sec Clinic Onboarding &amp; Sandbox
        </button>
        <button
          type="button"
          (click)="activeTab.set('tiers')"
          [class]="activeTab() === 'tiers' 
            ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm' 
            : 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          💳 Commercial Tiers &amp; Stripe Checkout
        </button>
        <button
          type="button"
          (click)="activeTab.set('rwe')"
          [class]="activeTab() === 'rwe' 
            ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white shadow-sm' 
            : 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🔬 Clinical Research &amp; CDISC SDTM
        </button>
        <button
          type="button"
          (click)="activeTab.set('outreach')"
          [class]="activeTab() === 'outreach' 
            ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm' 
            : 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          📧 Clinic Outreach &amp; Pitch Templates
        </button>
        <button
          type="button"
          (click)="activeTab.set('sow')"
          [class]="activeTab() === 'sow' 
            ? 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm' 
            : 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          📄 Statement of Work &amp; BAA Kit
        </button>
      </div>

      <!-- Tab 0: 60-Sec Clinic Onboarding & Sandbox -->
      @if (activeTab() === 'onboarding') {
        <app-clinic-onboarding-wizard></app-clinic-onboarding-wizard>
      }

      <!-- Tab RWE: Clinical Research & CDISC SDTM Dossier -->
      @if (activeTab() === 'rwe') {
        <app-cdisc-rwe-card></app-cdisc-rwe-card>
      }

      <!-- Tab 1: Commercial Tiers & Stripe Checkout -->
      @if (activeTab() === 'tiers') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <!-- Tier 1: Clinic Pilot Tier -->
          <div class="p-5 rounded-xl bg-zinc-900/90 border border-emerald-500/40 space-y-4 flex flex-col justify-between relative shadow-lg">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Independent Practice</span>
                <span class="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Monthly Pilot</span>
              </div>
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold text-white">$299</span>
                  <span class="text-xs text-zinc-400">/ month</span>
                </div>
                <h3 class="text-sm font-bold text-zinc-100 mt-1">Clinic Pilot License</h3>
              </div>
              <ul class="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li class="flex items-start gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Ambient Clinical Scribe + SOAP generator (3 seats)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>RxGuard Pharmacogenomics &amp; Herb-Drug intercept</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Socratic Calgary-Cambridge patient intake triage</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Zero PHI Cloud Egress (Edge WebAssembly / WebGPU)</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              (click)="onInitiateCheckout('pilot')"
              [disabled]="loadingTier() === 'pilot'"
              class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              @if (loadingTier() === 'pilot') {
                <span class="animate-spin">⏳</span>
                <span>Connecting to Stripe...</span>
              } @else {
                <span>🚀 Launch Clinic Pilot ($299/mo)</span>
              }
            </button>
          </div>

          <!-- Tier 2: 2-Week Implementation Sprint -->
          <div class="p-5 rounded-xl bg-zinc-900/90 border border-purple-500/40 space-y-4 flex flex-col justify-between relative shadow-lg">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-purple-400 uppercase tracking-wider">Turnkey Consulting</span>
                <span class="px-2 py-0.5 rounded text-2xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">Fixed Scope</span>
              </div>
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold text-white">$3,500</span>
                  <span class="text-xs text-zinc-400">one-time</span>
                </div>
                <h3 class="text-sm font-bold text-zinc-100 mt-1">Clinical AI &amp; FHIR Implementation Sprint</h3>
              </div>
              <ul class="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li class="flex items-start gap-2">
                  <span class="text-purple-400">✓</span>
                  <span>Full HIPAA §164.514 Safe Harbor pipeline integration</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-purple-400">✓</span>
                  <span>Custom Gemma 3 LoRA fine-tuning for clinic workflow</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-purple-400">✓</span>
                  <span>FHIR R4 Bundle &amp; GA4GH Phenopackets v2 export setup</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-purple-400">✓</span>
                  <span>Includes 30 days of direct engineering support</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              (click)="onInitiateCheckout('sprint')"
              [disabled]="loadingTier() === 'sprint'"
              class="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              @if (loadingTier() === 'sprint') {
                <span class="animate-spin">⏳</span>
                <span>Connecting to Stripe...</span>
              } @else {
                <span>⚡ Book 2-Week Sprint ($3,500)</span>
              }
            </button>
          </div>

          <!-- Tier 3: Academic Lab & Research License -->
          <div class="p-5 rounded-xl bg-zinc-900/90 border border-indigo-500/40 space-y-4 flex flex-col justify-between relative shadow-lg">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Academia &amp; Grants</span>
                <span class="px-2 py-0.5 rounded text-2xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Annual License</span>
              </div>
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold text-white">$1,200</span>
                  <span class="text-xs text-zinc-400">/ year</span>
                </div>
                <h3 class="text-sm font-bold text-zinc-100 mt-1">Academic Lab &amp; Residency Hub</h3>
              </div>
              <ul class="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li class="flex items-start gap-2">
                  <span class="text-indigo-400">✓</span>
                  <span>GA4GH Phenopackets v2 schema translation for UDN</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-400">✓</span>
                  <span>11-Paradigm open science fine-tuning datasets (Zenodo DOI)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-400">✓</span>
                  <span>Unlimited medical student OSCE training simulation seats</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-400">✓</span>
                  <span>NSF &amp; NIH CTSA grant sub-award collaborative partnership</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              (click)="onInitiateCheckout('academic')"
              [disabled]="loadingTier() === 'academic'"
              class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              @if (loadingTier() === 'academic') {
                <span class="animate-spin">⏳</span>
                <span>Connecting to Stripe...</span>
              } @else {
                <span>🎓 Academic License ($1,200/yr)</span>
              }
            </button>
          </div>

        </div>
      }

      <!-- Tab 2: Clinic Outreach & Pitch Templates -->
      @if (activeTab() === 'outreach') {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-300">Choose Target Segment to Copy Tailored Email:</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="selectedOutreach.set('clinic')"
                [class]="selectedOutreach() === 'clinic' ? 'px-2.5 py-1 rounded bg-zinc-800 text-emerald-400 text-xs font-bold' : 'px-2.5 py-1 text-xs text-zinc-400 hover:text-white'"
              >
                🏥 Independent Practices
              </button>
              <button
                type="button"
                (click)="selectedOutreach.set('digitalHealth')"
                [class]="selectedOutreach() === 'digitalHealth' ? 'px-2.5 py-1 rounded bg-zinc-800 text-purple-400 text-xs font-bold' : 'px-2.5 py-1 text-xs text-zinc-400 hover:text-white'"
              >
                🚀 Digital Health Startups
              </button>
              <button
                type="button"
                (click)="selectedOutreach.set('academic')"
                [class]="selectedOutreach() === 'academic' ? 'px-2.5 py-1 rounded bg-zinc-800 text-indigo-400 text-xs font-bold' : 'px-2.5 py-1 text-xs text-zinc-400 hover:text-white'"
              >
                🌲 Academic CTSA Hubs
              </button>
              <button
                type="button"
                (click)="selectedOutreach.set('tribal')"
                [class]="selectedOutreach() === 'tribal' ? 'px-2.5 py-1 rounded bg-zinc-800 text-amber-400 text-xs font-bold' : 'px-2.5 py-1 text-xs text-zinc-400 hover:text-white'"
              >
                🪶 Tribal Health &amp; 638 Clinics
              </button>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono text-zinc-400">Subject: <strong class="text-zinc-200">{{ currentSubject() }}</strong></span>
              <button
                type="button"
                (click)="onCopyOutreach()"
                class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 cursor-pointer font-semibold"
              >
                {{ copiedOutreach() ? '✓ Copied Email' : '📋 Copy Pitch Email' }}
              </button>
            </div>
            <pre class="p-3 bg-zinc-950 rounded-lg text-xs font-sans text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">{{ currentBody() }}</pre>
          </div>
        </div>
      }

      <!-- Tab 3: SOW & BAA Kit -->
      @if (activeTab() === 'sow') {
        <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-white">Standard 2-Week Implementation Sprint SOW &amp; BAA</h3>
            <button
              type="button"
              (click)="onDownloadSow()"
              class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
            >
              📥 Download SOW &amp; BAA (.md)
            </button>
          </div>
          <p class="text-xs text-zinc-400">
            Use this contract draft when closing $3,500 implementation sprints. It guarantees deliverables (HIPAA Safe Harbor, LoRA adapter fine-tuning, FHIR R4 pipeline) while establishing statutory Business Associate Agreement protection.
          </p>
          <pre class="p-3 bg-zinc-950 rounded-lg text-2xs font-mono text-zinc-300 max-h-64 overflow-y-auto whitespace-pre-wrap">{{ sowText }}</pre>
        </div>
      }

    </div>
  `
})
export class ClinicalCommercialHubComponent {
  readonly activeTab = signal<'onboarding' | 'tiers' | 'rwe' | 'outreach' | 'sow'>('onboarding');
  readonly selectedOutreach = signal<'clinic' | 'digitalHealth' | 'academic' | 'tribal'>('clinic');
  readonly loadingTier = signal<string | null>(null);
  readonly copiedOutreach = signal(false);

  readonly currentSubject = computed(() => {
    switch (this.selectedOutreach()) {
      case 'digitalHealth':
        return 'Accelerating FHIR R4 & Edge CDS with Zero-Cloud PHI Egress Sprints';
      case 'academic':
        return 'Open-Science Clinical Trial Matching & CDISC SDTM Pipeline for CTSA Hubs';
      case 'tribal':
        return 'Zero-Cost Public Service License & Offline Clinical Scribe for Tribal Health Centers (CARE Principles)';
      case 'clinic':
      default:
        return 'Eliminating 2 hours of EHR charting daily with zero-cloud PHI egress';
    }
  });

  readonly currentBody = computed(() => {
    switch (this.selectedOutreach()) {
      case 'digitalHealth':
        return `Hi [Engineering / Clinical Lead],

I noticed your team is building scalable digital health infrastructure. Balancing rapid AI-assisted clinical workflows with strict HIPAA Safe Harbor de-identification and FHIR R4 interoperability often adds months to product roadmaps.

PocketGull (CMS NPI: 1487569752) offers a 2-Week Implementation Sprint ($3,500 fixed fee) where we deliver:
1. In-browser client-side HIPAA §164.514 sanitizer (stripping all 18 direct/indirect identifiers).
2. Custom Gemma 3 LoRA adapter fine-tuned on your specialty clinical templates.
3. Turnkey FHIR R4 and GA4GH Phenopackets v2 serialization for automated EHR export.
4. Statutory Business Associate Agreement (BAA) with zero foundation model training on your data.

Are you open to a brief 10-minute technical sync this week?

Best regards,

Phil Gear
Founder & Health Informatics Lead, PocketGull LLC
CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381
leads@pocketgull.app | https://pocketgull.com`;

      case 'academic':
        return `Dear Dr. [Principal Investigator / Dean],

I am writing regarding the open-science translational medicine tools developed at PocketGull (Zenodo DOI: 10.5281/zenodo.20647514).

Our platform provides academic medical centers and CTSA hubs with:
- Automated Point-of-Care Clinical Trial Matching via ClinicalTrials.gov APIv2.
- 1-Click CDISC SDTM v2.0 Dataset Package generation (DM, VS, CM domains) with FDA 21 CFR Part 11 electronic signature seals.
- Bayesian N-of-1 single-case crossover trial protocol designer with automated washout modeling.
- Zero-cost academic research licenses with complete export to R and Python pipelines.

We would be honored to provide an institutional walkthrough for your research fellows and clinical informatics faculty.

Sincerely,

Phillip Gear
Health Informatics Lead, PocketGull LLC
CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381
research@pocketgull.app | https://pocketgull.com`;

      case 'tribal':
        return `To: The Tribal Health Director & Medical Leadership Team
Regarding: Formal Zero-Cost Public Service License & Offline Edge Scribing for Tribal Health Centers

Dear Tribal Health Leadership,

On behalf of PocketGull LLC (Oregon Registry: 258869891 | CMS NPI: 1487569752), I am writing to formally offer a perpetual, zero-cost Enterprise Public Service License for your Indian Health Service (IHS) facility, P.L. 93-638 Tribally Operated Health Center, or Urban Indian Health Program.

PocketGull is architected in strict adherence to Indigenous Data Sovereignty and the CARE Principles (Collective Benefit, Authority to Control, Responsibility, Ethics):
1. 100% Offline Edge Computation: Ambient clinical scribing, vitals tracking, and pharmacogenomics run locally in-browser via WebAssembly with ZERO cloud egress. Patient data never leaves the reservation or tribal clinic.
2. Traditional Botanical Codex: Integrative screening for traditional remedies (Devil's Club, Sweetgrass, Cedar, Wild Willow, Chaga) with Cytochrome P450 drug interaction checks.
3. The Sacred First 1,000 Days: Epigenetic maternal-infant support protocols designed to protect lineage health across the next Seven Generations.
4. Mobile CHR Support: Fully functional offline on tablets for remote home visits and rural elder wellness checks.
5. Zero Software Licensing Fees: No subscription charges, fees, or vendor lock-in.

We welcome the opportunity to meet with your Tribal Health Committee or Health Board at your convenience to provide a demonstration.

With highest respect and solidarity,

Phillip Gear
Founder & Health Informatics Lead, PocketGull LLC
CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381
101 SW Madison St #1664, Portland, OR 97207
tribal@pocketgull.app | https://pocketgull.com`;

      case 'clinic':
      default:
        return `Hi [Practice Manager / Dr. Name],

I noticed your clinic specializes in comprehensive patient care. Most clinicians are losing 1.5 to 2 hours every evening completing EHR charts and checking complex polypharmacy drug-herb interactions.

We built PocketGull (CMS NPI: 1487569752)—a zero-cloud-egress clinical intelligence engine that runs ambient SOAP scribing, Socratic patient intake, and pharmacogenomics screening entirely on your local device (100% HIPAA Safe Harbor compliant with zero data storage in external clouds).

We are currently onboarding 5 forward-thinking independent clinics for our 30-day $299 Pilot Program:
- Ambient Clinical Scribe (auto-formats conversation into structured SOAP & SBAR)
- RxGuard (screens Cytochrome P450 interactions across prescriptions and botanical supplements)
- Calgary-Cambridge Socratic intake form to eliminate patient waiting room fatigue

Would you be open to a brief 10-minute video walkthrough this week to see how it can save your clinicians 10+ hours a week?

Best regards,

Phil Gear
Founder & Clinical Informatics Lead, PocketGull
CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381
leads@pocketgull.app | https://pocketgull.com`;
    }
  });

  readonly sowText = `# STATEMENT OF WORK (SOW) & BUSINESS ASSOCIATE AGREEMENT (BAA)

**Client**: [Client Legal Name]
**Provider**: PocketGull LLC (Oregon Registry: 258869891 | CMS NPI: 1487569752)
**Principal Office**: 101 SW Madison St #1664, Portland, OR 97207 USA
**Project**: 2-Week Clinical AI & FHIR Implementation Sprint
**Total Fixed Fee**: $3,500.00 USD

## 1. SCOPE OF DELIVERABLES
1. **HIPAA §164.514 Safe Harbor De-Identification Pipeline**: In-browser string sanitization stripping all 18 HIPAA identifiers prior to AI inference.
2. **Specialized Clinical LoRA Model Adapter**: Fine-tuning Gemma 3 on client's specific clinical nomenclature, intake templates, and specialty CDS logic.
3. **FHIR R4 / GA4GH Phenopackets v2 Serialization**: Standardized JSON serialization for seamless EHR interoperability.
4. **On-Device Edge Deployment**: Packaging into WebAssembly / WebGPU or dedicated private Google Cloud Vertex AI endpoint.

## 2. STATUTORY BUSINESS ASSOCIATE AGREEMENT (BAA) TERMS
Provider warrants that all processing conforms to 45 CFR Part 160 and Part 164. Zero Protected Health Information (PHI) is retained or utilized for foundational base model training.

**Executed on behalf of Provider**:
PocketGull LLC, an Oregon Limited Liability Company
By: Phillip Gear, Sole Member / Health Informatics Lead
Date: ________________________

**Executed on behalf of Client**:
By: ___________________________ Title: ________________________
Date: ________________________`;

  async onInitiateCheckout(tier: 'pilot' | 'sprint' | 'academic'): Promise<void> {
    this.loadingTier.set(tier);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier,
          successUrl: `${window.location.origin}/#workbench?billing=success`,
          cancelUrl: `${window.location.origin}/#workbench?billing=canceled`,
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`Checkout session ready: Tier ${tier.toUpperCase()}`);
      }
    } catch (e: any) {
      console.error('Checkout error:', e);
      alert('Unable to connect to Stripe checkout. Please try again.');
    } finally {
      this.loadingTier.set(null);
    }
  }

  onCopyOutreach(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Subject: ${this.currentSubject()}\n\n${this.currentBody()}`);
      this.copiedOutreach.set(true);
      setTimeout(() => this.copiedOutreach.set(false), 2500);
    }
  }

  onDownloadSow(): void {
    const blob = new Blob([this.sowText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pocketgull_implementation_sprint_sow_baa.md';
    a.click();
    URL.revokeObjectURL(url);
  }
}
