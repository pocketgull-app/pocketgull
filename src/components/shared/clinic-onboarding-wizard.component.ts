import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../../services/patient-state.service';
import { POCKETGULL_CORPORATE_IDENTITY } from '../../services/corporate-identity';

export interface IClinicProfile {
  clinicName: string;
  leadClinician: string;
  email: string;
  specialty: 'integrative' | 'dpc' | 'functional' | 'cardiology' | 'neurology' | 'other';
  clinicianCount: number;
  ehrSystem: 'athenahealth' | 'epic' | 'elation' | 'canvas' | 'simplepractice' | 'paper_none';
}

@Component({
  selector: 'app-clinic-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🚀</span>
            <span>Independent Clinic 30-Day Pilot Fast-Track</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Self-Serve Clinical Onboarding &amp; BAA Sandbox
          </h2>
          <p class="text-xs sm:text-sm text-stone-400 mt-1">
            Activate ambient scribing, RxGuard herb-drug interaction screening, and FHIR/GA4GH interoperability for your practice in under 2 minutes.
          </p>
        </div>

        <div class="flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-xl border border-stone-800">
          <img src="/images/google_admin_origami_solo_whitebg_320x132.png" alt="PocketGull" class="h-6 w-auto rounded bg-white p-0.5" />
          <div class="text-right">
            <span class="block text-[10px] font-mono text-stone-500 uppercase">Provider Entity</span>
            <span class="block text-xs font-bold text-stone-200">{{ corporate.legalName }}</span>
          </div>
        </div>
      </div>

      <!-- Step Progress Indicator -->
      <div class="grid grid-cols-3 gap-2">
        <button
          type="button"
          (click)="currentStep.set(1)"
          [class.border-teal-500]="currentStep() === 1"
          [class.bg-teal-500/10]="currentStep() === 1"
          class="p-2.5 rounded-xl border border-stone-800 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">STEP 1</span>
          <span class="text-xs font-semibold text-white">Clinic Profile</span>
        </button>

        <button
          type="button"
          (click)="currentStep.set(2)"
          [class.border-teal-500]="currentStep() === 2"
          [class.bg-teal-500/10]="currentStep() === 2"
          class="p-2.5 rounded-xl border border-stone-800 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">STEP 2</span>
          <span class="text-xs font-semibold text-white">Sandbox Simulator</span>
        </button>

        <button
          type="button"
          (click)="currentStep.set(3)"
          [class.border-teal-500]="currentStep() === 3"
          [class.bg-teal-500/10]="currentStep() === 3"
          class="p-2.5 rounded-xl border border-stone-800 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">STEP 3</span>
          <span class="text-xs font-semibold text-white">Stripe &amp; BAA Checkout</span>
        </button>
      </div>

      <!-- STEP 1: CLINIC PROFILE -->
      @if (currentStep() === 1) {
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-300">Practice / Clinic Legal Name</label>
              <input
                type="text"
                [(ngModel)]="profile.clinicName"
                placeholder="e.g. Cascade Integrative Medicine"
                class="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-teal-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-300">Lead Clinician / Medical Director</label>
              <input
                type="text"
                [(ngModel)]="profile.leadClinician"
                placeholder="e.g. Dr. Sarah Jenkins, MD"
                class="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-teal-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-300">Practice Primary Specialty</label>
              <select
                [(ngModel)]="profile.specialty"
                class="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-teal-500">
                <option value="integrative">Integrative &amp; Functional Medicine</option>
                <option value="dpc">Direct Primary Care (DPC)</option>
                <option value="cardiology">Cardiology &amp; Metabolic</option>
                <option value="neurology">Neurology &amp; Complex Chronic Care</option>
                <option value="other">General Practice / Multi-Specialty</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-stone-300">Current EHR / Charting System</label>
              <select
                [(ngModel)]="profile.ehrSystem"
                class="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-teal-500">
                <option value="athenahealth">AthenaHealth (ONC CAPI Certified)</option>
                <option value="epic">Epic Systems (SMART-on-FHIR)</option>
                <option value="elation">Elation Health</option>
                <option value="canvas">Canvas Medical</option>
                <option value="simplepractice">SimplePractice / CharmHealth</option>
                <option value="paper_none">Standalone / Paper / Dictation</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="button"
              (click)="currentStep.set(2)"
              class="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-2">
              <span>Continue to Sandbox Simulator</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      }

      <!-- STEP 2: SANDBOX DEMO SCENARIOS -->
      @if (currentStep() === 2) {
        <div class="space-y-4">
          <p class="text-xs text-stone-400">
            Select a representative de-identified patient archetype to populate the live PocketGull diagnostic HUD, 3D anatomical viewer, and RxGuard interaction matrices:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Scenario 1 -->
            <button
              type="button"
              (click)="loadScenario('cardio_poly')"
              class="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500 text-left transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-base">🫀</span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">RxGuard Alert</span>
              </div>
              <h4 class="text-xs font-bold text-white group-hover:text-teal-300">Cardiology &amp; Polypharmacy</h4>
              <p class="text-[11px] text-stone-400 mt-1 line-clamp-2">
                Atrial Fibrillation + St. John's Wort supplement interaction with CYP2C19 poor metabolizer status.
              </p>
            </button>

            <!-- Scenario 2 -->
            <button
              type="button"
              (click)="loadScenario('long_covid')"
              class="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500 text-left transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-base">⚡</span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tri-Paradigm</span>
              </div>
              <h4 class="text-xs font-bold text-white group-hover:text-teal-300">Long COVID Neuro-Metabolic</h4>
              <p class="text-[11px] text-stone-400 mt-1 line-clamp-2">
                Mitochondrial ATP velocity decline with Ayurvedic Vata aggravation and PEM dysautonomia.
              </p>
            </button>

            <!-- Scenario 3 -->
            <button
              type="button"
              (click)="loadScenario('rare_genomics')"
              class="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500 text-left transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-base">🧬</span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">GA4GH v2</span>
              </div>
              <h4 class="text-xs font-bold text-white group-hover:text-teal-300">Rare Disease &amp; Phenopackets</h4>
              <p class="text-[11px] text-stone-400 mt-1 line-clamp-2">
                Harvard UDN rare pediatric seizure variant with HPO phenotypic translation and LOINC lab panel.
              </p>
            </button>
          </div>

          @if (scenarioLoaded()) {
            <div class="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-xs flex items-center justify-between">
              <span>✅ Scenario <strong>{{ scenarioLoaded() }}</strong> successfully populated into live patient state!</span>
              <span class="font-mono text-[10px]">Zero Cloud Egress Active</span>
            </div>
          }

          <div class="flex justify-between items-center pt-2">
            <button
              type="button"
              (click)="currentStep.set(1)"
              class="text-xs text-stone-400 hover:text-stone-200">
              &larr; Back to Profile
            </button>
            <button
              type="button"
              (click)="currentStep.set(3)"
              class="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-2">
              <span>Review BAA &amp; Initiate Pilot ($299)</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      }

      <!-- STEP 3: STRIPE & BAA EXECUTION -->
      @if (currentStep() === 3) {
        <div class="space-y-5">
          <!-- BAA Binding Box -->
          <div class="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>📑</span>
                <span>Statutory Business Associate Agreement (BAA) Binding</span>
              </span>
              <span class="text-[10px] font-mono text-stone-500">45 CFR § 164.502(e)</span>
            </div>
            <p class="text-[11px] text-stone-300 leading-relaxed">
              By initiating checkout, <strong>{{ profile.clinicName || '[Your Practice Legal Name]' }}</strong> and <strong>PocketGull LLC</strong> (Oregon Registry: 258869891) agree to the terms of the PocketGull HIPAA Business Associate Agreement. Zero protected health information is stored in external foundation AI models.
            </p>
          </div>

          <!-- Checkout Action Card -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-stone-950 to-stone-900 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div class="text-lg font-bold text-white">30-Day Independent Clinic Pilot</div>
              <div class="text-xs text-stone-400">Includes Ambient Scribe, RxGuard, Socratic Intake for up to 3 clinicians.</div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-2xl font-black text-teal-400">$299</div>
                <div class="text-[10px] font-mono text-stone-500">30-Day Money-Back Guarantee</div>
              </div>
              <button
                type="button"
                (click)="onInitiateCheckout()"
                [disabled]="isCheckingOut()"
                class="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all">
                {{ isCheckingOut() ? 'Redirecting to Stripe...' : 'Start Pilot Now' }}
              </button>
            </div>
          </div>

          <div class="flex justify-start">
            <button
              type="button"
              (click)="currentStep.set(2)"
              class="text-xs text-stone-400 hover:text-stone-200">
              &larr; Back to Sandbox Simulator
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class ClinicOnboardingWizardComponent {
  private readonly patientState = inject(PatientStateService);
  readonly corporate = POCKETGULL_CORPORATE_IDENTITY;

  currentStep = signal<number>(1);
  scenarioLoaded = signal<string | null>(null);
  isCheckingOut = signal<boolean>(false);

  profile: IClinicProfile = {
    clinicName: '',
    leadClinician: '',
    email: '',
    specialty: 'integrative',
    clinicianCount: 2,
    ehrSystem: 'athenahealth'
  };

  loadScenario(type: 'cardio_poly' | 'long_covid' | 'rare_genomics'): void {
    if (type === 'cardio_poly') {
      this.patientState.patientName.set('Homo Sapiens (Male, Cardiovascular Archetype, 68y)');
      this.patientState.patientAge.set(68);
      this.patientState.patientGender.set('Male');
      this.patientState.vitals.set({
        bp: '148/92',
        hr: '88',
        temp: '98.6',
        spO2: '96',
        weight: '185',
        height: '70',
        cgmGlucoseMgDl: '110',
        vitC: '',
        vitD3: '',
        magnesium: '',
        zinc: '',
        b12: ''
      });
      this.patientState.reasonForVisit.set('Palpitations and irregular pulse; exertional dyspnea on stair climbing; concomitant St. Johns Wort supplementation with Warfarin');
      this.scenarioLoaded.set('Cardiology & Polypharmacy');
    } else if (type === 'long_covid') {
      this.patientState.patientName.set('Homo Sapiens (Female, Neuro-Metabolic Archetype, 38y)');
      this.patientState.patientAge.set(38);
      this.patientState.patientGender.set('Female');
      this.patientState.vitals.set({
        bp: '108/68',
        hr: '104',
        temp: '98.2',
        spO2: '98',
        weight: '135',
        height: '65',
        cgmGlucoseMgDl: '95',
        vitC: '',
        vitD3: '',
        magnesium: '',
        zinc: '',
        b12: ''
      });
      this.patientState.reasonForVisit.set('Post-exertional malaise (PEM) lasting >48 hours; cognitive brain fog and memory delay; orthostatic tachycardia');
      this.scenarioLoaded.set('Long COVID Neuro-Metabolic');
    } else if (type === 'rare_genomics') {
      this.patientState.patientName.set('Homo Sapiens (Pediatric Rare Disease Model, 7y)');
      this.patientState.patientAge.set(7);
      this.patientState.patientGender.set('Female');
      this.patientState.vitals.set({
        bp: '95/60',
        hr: '92',
        temp: '98.4',
        spO2: '99',
        weight: '48',
        height: '46',
        cgmGlucoseMgDl: '88',
        vitC: '',
        vitD3: '',
        magnesium: '',
        zinc: '',
        b12: ''
      });
      this.patientState.reasonForVisit.set('Refractory focal seizures with impaired awareness (HP:0002384); global developmental delay (HP:0001263); novel de novo SCN1A missense variant');
      this.scenarioLoaded.set('Rare Disease & Phenopackets');
    }
  }

  async onInitiateCheckout(): Promise<void> {
    this.isCheckingOut.set(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'pilot',
          successUrl: `${window.location.origin}/#workbench?billing=pilot_success`,
          cancelUrl: `${window.location.origin}/#workbench?billing=pilot_cancel`,
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Stripe Checkout Session initialized for $299 Pilot.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      this.isCheckingOut.set(false);
    }
  }
}
