import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface IDomainTrack {
  id: string;
  title: string;
  badge: string;
  icon: string;
  targetProfessionals: string;
  domainMission: string;
  howYouWrangleAgents: string[];
  deliverables: string[];
  prerequisites: string[];
}

export interface IRedTeamConsultSample {
  patientDemographic: string;
  presentingSymptoms: string;
  agentGeneratedDraft: string;
  originalEvidenceGrade: 'Level C (Expert Opinion)' | 'Level B (Cohort Study)' | 'Level A (RCT / Cochrane)';
  detectedVulnerabilities: {
    type: 'CONTRAINDICATION_OMISSION' | 'EVIDENCE_INFLATION' | 'CROSSWALK_GAP';
    title: string;
    description: string;
    clinicalCorrection: string;
  }[];
}

@Component({
  selector: 'app-talent-hr-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 text-zinc-100 font-sans max-w-7xl mx-auto pb-12">
      <!-- 🌿 Hero Section: Value Proposition -->
      <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-teal-950/40 p-6 sm:p-10 border border-teal-900/50 shadow-2xl">
        <div class="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10 space-y-4 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-widest uppercase">
            <span>🔬</span>
            <span>Domain-Guided Agent Intelligence</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-teal-100 to-teal-300 leading-tight">
            You Bring the Clinical &amp; Scientific Truth.<br class="hidden sm:inline" />
            Agents Handle the Boilerplate.
          </h1>
          <p class="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            Pocket-Gull is building next-generation clinical intelligence. We are recruiting physicians, pharmacogenomicists, multi-paradigm practitioners, trialists, and regulatory experts to <strong>steer, benchmark, and red-team autonomous AI agent swarms</strong> using their deep domain knowledge.
          </p>
          <div class="flex flex-wrap gap-4 pt-2">
            <button 
              (click)="scrollToApply()"
              class="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-teal-500/20 active:scale-95 cursor-pointer flex items-center gap-2">
              <span>📝</span>
              <span>Apply as a Domain Specialist</span>
            </button>
            <button 
              (click)="scrollToSandbox()"
              class="px-6 py-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-zinc-700 hover:border-teal-500/40 cursor-pointer flex items-center gap-2">
              <span>🧪</span>
              <span>Try the Red-Team Sandbox</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 🧭 Domain Specialist Tracks Selector -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <span>🧭</span>
              <span>6 Domain Specialist &amp; Agent-Wrangler Tracks</span>
            </h2>
            <p class="text-xs text-zinc-400">Select a specialization track to explore how your domain knowledge steers the system</p>
          </div>
          <span class="text-xs font-mono text-teal-400 bg-teal-950/40 px-3 py-1 rounded-md border border-teal-800/50 self-start sm:self-auto">
            Fellowships • Contributor Bounties • Clinical Advisory
          </span>
        </div>

        <!-- Track Tabs Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          @for (track of domainTracks; track track.id) {
            <button 
              (click)="selectTrack(track.id)"
              [class.bg-teal-950]="selectedTrackId() === track.id"
              [class.border-teal-500]="selectedTrackId() === track.id"
              [class.text-white]="selectedTrackId() === track.id"
              [class.bg-zinc-900]="selectedTrackId() !== track.id"
              [class.border-zinc-800]="selectedTrackId() !== track.id"
              [class.text-zinc-400]="selectedTrackId() !== track.id"
              class="p-3 rounded-xl border text-left transition-all hover:border-teal-500/50 flex flex-col justify-between gap-2 min-h-[96px] cursor-pointer group">
              <span class="text-2xl group-hover:scale-110 transition-transform">{{ track.icon }}</span>
              <div>
                <span class="text-xs font-bold block leading-tight group-hover:text-zinc-100 transition-colors">{{ track.title }}</span>
                <span class="text-[10px] text-zinc-500 font-mono block mt-0.5">{{ track.badge }}</span>
              </div>
            </button>
          }
        </div>

        <!-- Active Track Detail Card -->
        @if (activeTrack(); as track) {
          <div class="p-6 rounded-2xl bg-zinc-900/90 border border-teal-900/40 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div class="flex items-center gap-3">
                <span class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-2xl">
                  {{ track.icon }}
                </span>
                <div>
                  <h3 class="text-lg font-bold text-zinc-100">{{ track.title }}</h3>
                  <p class="text-xs text-teal-400 font-mono">Target: {{ track.targetProfessionals }}</p>
                </div>
              </div>
              <button 
                (click)="applyWithTrack(track.id)"
                class="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer self-start md:self-auto">
                Apply for this Track →
              </button>
            </div>

            <p class="text-sm text-zinc-300 leading-relaxed">{{ track.domainMission }}</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span class="font-mono text-teal-400 font-bold uppercase tracking-wider block">🛠️ How You Wrangle Agents</span>
                <ul class="space-y-1.5 text-zinc-300">
                  @for (item of track.howYouWrangleAgents; track item) {
                    <li class="flex items-start gap-1.5">
                      <span class="text-teal-400 shrink-0">•</span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span class="font-mono text-emerald-400 font-bold uppercase tracking-wider block">📦 Concrete Deliverables</span>
                <ul class="space-y-1.5 text-zinc-300">
                  @for (item of track.deliverables; track item) {
                    <li class="flex items-start gap-1.5">
                      <span class="text-emerald-400 shrink-0">✓</span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span class="font-mono text-amber-400 font-bold uppercase tracking-wider block">🎓 Domain Prerequisites</span>
                <ul class="space-y-1.5 text-zinc-300">
                  @for (item of track.prerequisites; track item) {
                    <li class="flex items-start gap-1.5">
                      <span class="text-amber-400 shrink-0">❖</span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        }
      </section>

      <!-- 🧪 Interactive "Clinical Red-Team & Eval" Sandbox -->
      <section id="clinical-sandbox" class="space-y-4">
        <div class="border-b border-zinc-800 pb-3">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold uppercase mb-1">
            <span>🧪</span>
            <span>Interactive Demonstration</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-zinc-100">Live Clinical Red-Team &amp; Agent Calibration Sandbox</h2>
          <p class="text-xs text-zinc-400">See how your clinical knowledge transforms an unverified draft into a hardened deterministic evaluation harness</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
          <!-- Left: Agent Generated Draft -->
          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span class="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Draft Consult Generated by Autonomous Agent</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Status: Pending Domain Review
              </span>
            </div>

            <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-3 font-mono">
              <div>
                <span class="text-zinc-500 block text-[10px]">PATIENT PROFILE:</span>
                <span class="text-zinc-200 font-bold">{{ sampleConsult.patientDemographic }}</span>
              </div>
              <div>
                <span class="text-zinc-500 block text-[10px]">PRESENTING SYMPTOMS &amp; VITALS:</span>
                <span class="text-zinc-300">{{ sampleConsult.presentingSymptoms }}</span>
              </div>
              <div class="pt-2 border-t border-zinc-800">
                <span class="text-zinc-500 block text-[10px] mb-1">AGENT CARE PLAN RECOMMENDATION:</span>
                <p class="text-zinc-200 leading-relaxed font-sans bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                  {{ sampleConsult.agentGeneratedDraft }}
                </p>
              </div>
              <div class="flex items-center justify-between pt-1 text-[11px]">
                <span class="text-zinc-400">Claimed Evidence Grade:</span>
                <span class="text-amber-400 font-bold">{{ sampleConsult.originalEvidenceGrade }}</span>
              </div>
            </div>

            <!-- Domain Actions: Steer the Agent -->
            <div class="space-y-2">
              <span class="text-xs font-bold text-zinc-300 block">Apply Your Domain Knowledge (Select a Critique Vector):</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button 
                  (click)="applyRedTeamCritique('CONTRAINDICATION_OMISSION')"
                  [class.bg-rose-950]="activeCritiqueType() === 'CONTRAINDICATION_OMISSION'"
                  [class.border-rose-500]="activeCritiqueType() === 'CONTRAINDICATION_OMISSION'"
                  [class.text-white]="activeCritiqueType() === 'CONTRAINDICATION_OMISSION'"
                  class="p-2.5 rounded-lg border border-zinc-700 bg-zinc-950 hover:border-rose-500/60 text-zinc-300 text-xs font-bold text-left transition cursor-pointer flex flex-col gap-1">
                  <span>🚨 Flag Contraindication</span>
                  <span class="text-[10px] text-zinc-400 font-normal">Catch unaddressed renal/CYP450 risk</span>
                </button>

                <button 
                  (click)="applyRedTeamCritique('EVIDENCE_INFLATION')"
                  [class.bg-amber-950]="activeCritiqueType() === 'EVIDENCE_INFLATION'"
                  [class.border-amber-500]="activeCritiqueType() === 'EVIDENCE_INFLATION'"
                  [class.text-white]="activeCritiqueType() === 'EVIDENCE_INFLATION'"
                  class="p-2.5 rounded-lg border border-zinc-700 bg-zinc-950 hover:border-amber-500/60 text-zinc-300 text-xs font-bold text-left transition cursor-pointer flex flex-col gap-1">
                  <span>⚖️ Calibrate Evidence</span>
                  <span class="text-[10px] text-zinc-400 font-normal">Downgrade inflated trial claims</span>
                </button>

                <button 
                  (click)="applyRedTeamCritique('CROSSWALK_GAP')"
                  [class.bg-teal-950]="activeCritiqueType() === 'CROSSWALK_GAP'"
                  [class.border-teal-500]="activeCritiqueType() === 'CROSSWALK_GAP'"
                  [class.text-white]="activeCritiqueType() === 'CROSSWALK_GAP'"
                  class="p-2.5 rounded-lg border border-zinc-700 bg-zinc-950 hover:border-teal-500/60 text-zinc-300 text-xs font-bold text-left transition cursor-pointer flex flex-col gap-1">
                  <span>🌿 Multi-Paradigm Sync</span>
                  <span class="text-[10px] text-zinc-400 font-normal">Add TCM/Ayurvedic crosswalk</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Deterministic Eval Harness Output -->
          <div class="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-zinc-950 border border-teal-900/30 space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span class="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">Deterministic Golden Eval Generated</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                  Automated Test Created
                </span>
              </div>

              @if (activeCritique(); as critique) {
                <div class="space-y-2 text-xs">
                  <div class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                    <span class="text-[10px] font-mono text-zinc-400 block uppercase">Specialist Domain Finding:</span>
                    <span class="font-bold text-teal-300">{{ critique.title }}</span>
                    <p class="text-zinc-300 leading-relaxed font-sans text-[11px]">{{ critique.description }}</p>
                  </div>

                  <div class="p-3 rounded-lg bg-teal-950/40 border border-teal-500/30 space-y-1">
                    <span class="text-[10px] font-mono text-teal-400 block uppercase">Generated Guardrail Rule (Eval):</span>
                    <p class="text-zinc-200 font-mono text-[11px] leading-relaxed">{{ critique.clinicalCorrection }}</p>
                  </div>
                </div>
              } @else {
                <div class="h-44 flex flex-col items-center justify-center text-center p-4 text-zinc-500 text-xs">
                  <span class="text-3xl mb-2">👈</span>
                  <span>Select a domain critique action on the left to see how specialist insights convert to immutable automated test suites.</span>
                </div>
              }
            </div>

            <div class="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span class="font-bold text-zinc-200 block">💡 Why this matters:</span>
              <span>Your single critique prevents hundreds of downstream AI errors across thousands of patient consultations.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 💎 Regenerative Work & Compensation Charter -->
      <section class="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold uppercase">
            <span>💎</span>
            <span>"Live the Medicine"</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-zinc-100">Regenerative Work, Credit &amp; Compensation Charter</h2>
          <p class="text-xs text-zinc-400">We reject burnout culture and corporate theater in favor of deep autonomy and public attribution.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
            <span class="text-2xl">⏳</span>
            <h3 class="font-bold text-zinc-100 text-sm">Circadian-First Autonomy</h3>
            <p class="text-zinc-400 leading-relaxed">
              Work 100% asynchronously when your cognitive focus is at its peak. Zero mandatory meetings. Clear written RFCs and GitHub milestone deliverables.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
            <span class="text-2xl">⚡</span>
            <h3 class="font-bold text-zinc-100 text-sm">Micro-Bounties &amp; Fellowships</h3>
            <p class="text-zinc-400 leading-relaxed">
              Competitive fellow stipends, fair contract rates, and immediate payouts via Stripe or GitHub Sponsors for discrete evaluation reviews and dataset curation.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
            <span class="text-2xl">📜</span>
            <h3 class="font-bold text-zinc-100 text-sm">Permanent Attribution &amp; IP</h3>
            <p class="text-zinc-400 leading-relaxed">
              Permanent co-authorship credit in scientific preprints, Kaggle benchmarks, and public recognition in <code class="text-teal-400">CONTRIBUTING_SPECIALISTS.md</code>.
            </p>
          </div>
        </div>
      </section>

      <!-- 📝 Specialist Intake & Portfolio Submission Form -->
      <section id="specialist-intake-form" class="p-6 sm:p-10 rounded-3xl bg-zinc-900 border border-teal-900/50 shadow-2xl space-y-6">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-mono font-bold uppercase">
            <span>📝</span>
            <span>Direct Specialist Application</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-zinc-100">Join the Specialist &amp; Agent-Wrangling Network</h2>
          <p class="text-xs text-zinc-400">
            Tell us about your domain background and how you want to help steer and calibrate our clinical AI models.
          </p>
        </div>

        @if (applicationSubmitted()) {
          <div class="p-6 rounded-2xl bg-teal-950/60 border border-teal-500/50 space-y-4 animate-in fade-in duration-300">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl">✓</span>
              <div>
                <h3 class="text-base font-bold text-white">Application Received!</h3>
                <p class="text-xs text-teal-300">Thank you, {{ applicantName() }}. Our clinical engineering leads will review your domain background.</p>
              </div>
            </div>
            <p class="text-xs text-zinc-300">
              A confirmation packet and next steps regarding the <strong>{{ applicantTrackTitle() }}</strong> track have been logged.
            </p>
            <button 
              (click)="resetForm()"
              class="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition cursor-pointer">
              Submit Another Inquiry
            </button>
          </div>
        } @else {
          <form (ngSubmit)="submitApplication()" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="applicant-name" class="font-bold text-zinc-300 block">Full Name / Title *</label>
                <input 
                  id="applicant-name"
                  type="text" 
                  [(ngModel)]="applicantName"
                  name="applicantName"
                  required
                  placeholder="e.g. Dr. Jane Chen, MD or Alex Rivera, PharmD"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 focus:border-teal-400 focus:outline-none transition min-h-[44px]" />
              </div>

              <div class="space-y-1">
                <label for="applicant-email" class="font-bold text-zinc-300 block">Email Address *</label>
                <input 
                  id="applicant-email"
                  type="email" 
                  [(ngModel)]="applicantEmail"
                  name="applicantEmail"
                  required
                  placeholder="jane.chen@institution.edu"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 focus:border-teal-400 focus:outline-none transition min-h-[44px]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="applicant-domain" class="font-bold text-zinc-300 block">Primary Specialty / Clinical Domain *</label>
                <input 
                  id="applicant-domain"
                  type="text" 
                  [(ngModel)]="applicantDomain"
                  name="applicantDomain"
                  required
                  placeholder="e.g. Critical Care, Ayurvedic Medicine, Toxicology"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 focus:border-teal-400 focus:outline-none transition min-h-[44px]" />
              </div>

              <div class="space-y-1">
                <label for="applicant-track" class="font-bold text-zinc-300 block">Preferred Engagement Track *</label>
                <select 
                  id="applicant-track"
                  [(ngModel)]="selectedTrackId"
                  name="selectedTrackId"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 focus:border-teal-400 focus:outline-none transition min-h-[44px] cursor-pointer">
                  @for (track of domainTracks; track track.id) {
                    <option [value]="track.id">{{ track.title }} ({{ track.badge }})</option>
                  }
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label for="applicant-portfolio" class="font-bold text-zinc-300 block">Portfolio, ORCID, GitHub, Kaggle, or LinkedIn URL (Optional)</label>
              <input 
                id="applicant-portfolio"
                type="url" 
                [(ngModel)]="applicantPortfolio"
                name="applicantPortfolio"
                placeholder="https://orcid.org/... or https://github.com/..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 focus:border-teal-400 focus:outline-none transition min-h-[44px]" />
            </div>

            <div class="space-y-1">
              <label for="applicant-prompt" class="font-bold text-zinc-300 block">
                How would you use your domain knowledge to steer or red-team our AI agents? *
              </label>
              <textarea 
                id="applicant-prompt"
                rows="4" 
                [(ngModel)]="applicantPrompt"
                name="applicantPrompt"
                required
                placeholder="Briefly describe a clinical edge-case, toxicological pitfall, multi-paradigm nuance, or evaluation standard you want to benchmark..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 focus:border-teal-400 focus:outline-none transition"></textarea>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-[11px] text-zinc-400 font-mono">🔒 Confidential • HIPAA Safe Harbor Compliant</span>
              <button 
                type="submit"
                [disabled]="!isFormValid()"
                class="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer">
                Submit Domain Application →
              </button>
            </div>
          </form>
        }
      </section>
    </div>
  `
})
export class TalentHrPortalComponent {
  readonly domainTracks: IDomainTrack[] = [
    {
      id: 'allopathic-icu',
      title: 'Allopathic & ICU Critical Care',
      badge: 'MD / DO / RN / EMT',
      icon: '🩺',
      targetProfessionals: 'Emergency Physicians, Hospitalists, Critical Care Nurses, EMTs',
      domainMission: 'Provide high-stakes triage heuristics, hemodynamic boundary conditions (CO, MAP), and STAT emergency life-support safety rails.',
      howYouWrangleAgents: [
        'Red-team agent care plans for lethal contraindications (e.g. beta-blockers in decompensated heart failure)',
        'Calibrate hemodynamic threshold algorithms against ICU standard-of-care',
        'Author acute chest pain & stroke triage golden evaluation scenarios'
      ],
      deliverables: [
        'Golden diagnostic vignettes with strict contraindication boundaries',
        'Hemodynamic stability scoring validation benchmarks',
        'FAST stroke & STEMI rapid-triage decision trees'
      ],
      prerequisites: [
        'Active or prior medical licensure (MD, DO, MBBS, RN, EMT-P) or senior health informatics training',
        'Familiarity with evidence-based clinical practice guidelines (AHA, ACC, Surviving Sepsis)'
      ]
    },
    {
      id: 'multi-paradigm',
      title: 'Multi-Paradigm Integrative Medicine',
      badge: 'Ayurvedic / TCM / Osteopathic',
      icon: '🌿',
      targetProfessionals: 'Ayurvedic Vaidyas, TCM Doctors & Acupuncturists, Osteopathic Physicians',
      domainMission: 'Architect verified diagnostic crosswalks mapping Sanskrit Dosha energetics, Hanzi Meridian/Pulse patterns, and Osteopathic T.A.R.T. somatics to modern biophysics.',
      howYouWrangleAgents: [
        'Ensure authentic Devanagari (आयुर्वेद) and Hanzi (中医) nomenclature integrity',
        'Author quad-philosophy integrative care plans combining modern evidence with ancient wisdom',
        'Verify pulse, tongue, and musculoskeletal somatic diagnostic crosswalks'
      ],
      deliverables: [
        'Tri-paradigm integrative clinical crosswalk dataset',
        'Pulse & tongue visual inspection verification matrices',
        'Craniosacral PRM rhythm and somatic restriction rubrics'
      ],
      prerequisites: [
        'Formal training or degree in Ayurvedic Medicine (BAMS/MD Ayur), TCM (DAOM/LAc), or Osteopathy (DO)',
        'Dedication to rigorous biophysical explanation without science-washing'
      ]
    },
    {
      id: 'pharmacogenomics',
      title: 'Pharmacogenomics & Toxicology',
      badge: 'PharmD / Toxicologist',
      icon: '💊',
      targetProfessionals: 'Clinical Pharmacists, Board-Certified Toxicologists, PGx Researchers',
      domainMission: 'Hardcode CYP450 enzyme metabolism tables, toxic exposure vectors (e.g. PACT Act burn pits), and narrow-therapeutic-index dosing curves.',
      howYouWrangleAgents: [
        'Audit agent drug recommendations for CYP2D6/CYP2C19 poor-metabolizer toxicity',
        'Build toxicological exposure assessment rules for heavy metals, PFAS, and burn pits',
        'Enforce ISMP zero-error dosage conventions (slashed zeros, no trailing zeros)'
      ],
      deliverables: [
        'CYP450 interaction & drug clearance decision matrix',
        'Veterans PACT Act toxic exposure screener algorithms',
        'High-alert drug dosage disambiguation test cases'
      ],
      prerequisites: [
        'PharmD, PhD in Pharmacology/Toxicology, or clinical pharmacy residency',
        'Expertise in CPIC guidelines and FDA drug safety alerts'
      ]
    },
    {
      id: 'skeptical-epistemology',
      title: 'Skeptical Epistemology & Trialists',
      badge: 'Epidemiologist / Cochrane Reviewer',
      icon: '⚖️',
      targetProfessionals: 'Clinical Epidemiologists, Biostatisticians, Trialists, Systematic Reviewers',
      domainMission: 'Benchmark agent conclusions against Cochrane RoB 2, compute null-hypothesis p-values, and eliminate citation hallucination and publication bias.',
      howYouWrangleAgents: [
        'Enforce Popperian null-hypothesis testing across all AI health recommendations',
        'Grade cited clinical trial literature using Oxford CEBM Levels 1–5 and Cochrane RoB 2',
        'Build automated falsifiability checks to prevent "science-washing"'
      ],
      deliverables: [
        'Cochrane RoB 2 appraisal benchmark dataset',
        'Clinical trial power calculation & p-value verification test suite',
        'Socratic evidence challenge modules for clinical education'
      ],
      prerequisites: [
        'Graduate degree (MPH, MS, PhD) in Epidemiology, Biostatistics, or Evidence-Based Medicine',
        'Deep familiarity with GRADE methodology and clinical trial design'
      ]
    },
    {
      id: 'health-equity-regulatory',
      title: 'Health Equity & Sovereign Regulatory Standards',
      badge: 'JD / Compliance / Patient Advocate',
      icon: '🌐',
      targetProfessionals: 'Healthcare Attorneys, Privacy Officers, Multilingual Patient Advocates',
      domainMission: 'Ensure strict statutory compliance across international partner jurisdictions (HIPAA, NHS DTAC, PIPEDA, TGA) and expand 6th-grade cognitive health literacy.',
      howYouWrangleAgents: [
        'Audit prompt injection and data egress pipelines for HIPAA Safe Harbor de-identification',
        'Calibrate multi-jurisdictional emergency vectors (988 US, 111 UK, 988 CA, 13 11 14 AU)',
        'Test Bionic Reading and cognitive translation for low-health-literacy populations'
      ],
      deliverables: [
        'Multi-jurisdiction statutory regulatory mapping matrix',
        'HIPAA §164.514 18-identifier de-identification evaluation suite',
        'Multilingual health equity & optotypic legibility audits'
      ],
      prerequisites: [
        'JD, CIPP/US/E, or clinical compliance / patient advocacy background',
        'Experience with healthcare privacy statutes and accessibility standards (WCAG AAA)'
      ]
    },
    {
      id: 'agentops-harness',
      title: 'AgentOps & Evaluation Harness',
      badge: 'Agent Evaluator / Systems Engineer',
      icon: '🤖',
      targetProfessionals: 'Full-Stack Engineers, Agent Evaluator Specialists, Systems Developers',
      domainMission: 'Design high-throughput subagent routing, WebMCP tool contracts, and hermetic CI/CD proof chains to keep AI agent swarms robust and deterministic.',
      howYouWrangleAgents: [
        'Architect multi-agent consensus protocols and tool-calling execution sandboxes',
        'Hardcode OWASP LLM01 indirect prompt injection defenses and Unicode sanitizers',
        'Implement sub-second local edge inference pipelines (WebGPU, WASM, Lemonade QLoRA)'
      ],
      deliverables: [
        'WebMCP tool registry JSON Schemas with AbortController signals',
        'Hermetic end-to-end evaluation runner with automated proof chains',
        'Client-side WASM/WebGPU scoring engines'
      ],
      prerequisites: [
        'Experience with Angular Signals, TypeScript, Python FastAPI, or Three.js WebGL',
        'Practical familiarity with LLM tool calling, agentic evals, and prompt injection defense'
      ]
    }
  ];

  readonly sampleConsult: IRedTeamConsultSample = {
    patientDemographic: 'Homo Sapiens (Female, 58y, Post-Menopausal)',
    presentingSymptoms: 'Persistent morning joint stiffness (1.5h), bilateral MCP pain, chronic fatigue, eGFR 42 mL/min/1.73m²',
    agentGeneratedDraft: 'Initiate High-Dose Ibuprofen (800mg TID) combined with Methotrexate 15mg weekly. Recommend vigorous resistance training daily for joint mobility.',
    originalEvidenceGrade: 'Level A (RCT / Cochrane)',
    detectedVulnerabilities: [
      {
        type: 'CONTRAINDICATION_OMISSION',
        title: 'Severe Renal Insufficiency NSAID Toxicity & MTX Clearance Risk',
        description: 'Patient has stage 3b CKD (eGFR 42). High-dose ibuprofen is strictly contraindicated due to acute-on-chronic renal failure risk and severe reduction in methotrexate renal clearance, precipitating fatal bone marrow suppression.',
        clinicalCorrection: 'assert(eGFR < 60) -> PROHIBIT(High_Dose_NSAID); ENFORCE_MONITORING(MTX_Toxicity_CBC_Renal);'
      },
      {
        type: 'EVIDENCE_INFLATION',
        title: 'Evidence Grade Inflation on Resistance Regimen During Acute Flare',
        description: 'Daily vigorous resistance training during an active bilateral inflammatory flare lacks Level A evidence and risks joint micro-trauma. Standard of care recommends range-of-motion and aquatic therapy (Level B).',
        clinicalCorrection: 'downgradeEvidenceGrade("Level A", "Level B"); RECOMMEND("Aquatic Range of Motion in Warm Pool");'
      },
      {
        type: 'CROSSWALK_GAP',
        title: 'Missing Ayurvedic Ama & TCM Bi-Syndrome Metabolic Crosswalk',
        description: 'In systemic multi-paradigm medicine, heavy morning stiffness with fatigue indicates chronic inflammatory metabolite accumulation (Ama / Dampness-Cold Bi Syndrome).',
        clinicalCorrection: 'attachIntegrativeCrosswalk({ tcm: "Wind-Cold-Damp Bi Syndrome", ayurveda: "Amavata Joint Energetics", osteopathic: "Lymphatic Thoracic Pump Restriction" });'
      }
    ]
  };

  selectedTrackId = signal<string>('allopathic-icu');
  activeCritiqueType = signal<'CONTRAINDICATION_OMISSION' | 'EVIDENCE_INFLATION' | 'CROSSWALK_GAP' | null>(null);

  applicantName = signal<string>('');
  applicantEmail = signal<string>('');
  applicantDomain = signal<string>('');
  applicantPortfolio = signal<string>('');
  applicantPrompt = signal<string>('');
  applicationSubmitted = signal<boolean>(false);

  activeTrack = computed(() => {
    return this.domainTracks.find(t => t.id === this.selectedTrackId()) ?? this.domainTracks[0];
  });

  activeCritique = computed(() => {
    const type = this.activeCritiqueType();
    if (!type) return null;
    return this.sampleConsult.detectedVulnerabilities.find(v => v.type === type) ?? null;
  });

  applicantTrackTitle = computed(() => {
    return this.activeTrack()?.title ?? 'Domain Specialist';
  });

  selectTrack(trackId: string): void {
    this.selectedTrackId.set(trackId);
  }

  applyWithTrack(trackId: string): void {
    this.selectedTrackId.set(trackId);
    this.scrollToApply();
  }

  applyRedTeamCritique(type: 'CONTRAINDICATION_OMISSION' | 'EVIDENCE_INFLATION' | 'CROSSWALK_GAP'): void {
    this.activeCritiqueType.set(type);
  }

  isFormValid(): boolean {
    return !!(
      this.applicantName().trim() &&
      this.applicantEmail().trim().includes('@') &&
      this.applicantDomain().trim() &&
      this.applicantPrompt().trim()
    );
  }

  submitApplication(): void {
    if (!this.isFormValid()) return;
    this.applicationSubmitted.set(true);
  }

  resetForm(): void {
    this.applicantName.set('');
    this.applicantEmail.set('');
    this.applicantDomain.set('');
    this.applicantPortfolio.set('');
    this.applicantPrompt.set('');
    this.applicationSubmitted.set(false);
  }

  scrollToApply(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('specialist-intake-form');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToSandbox(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('clinical-sandbox');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
