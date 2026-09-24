import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialistReferralDossierService, SpecialistDomain, ISpecialtyReadinessGate, IFhirServiceRequestDossier, ITriDirectionalReEntryBrief } from '../services/specialist-referral-dossier.service';

@Component({
  selector: 'app-specialist-referral-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Specialist Referral & Co-Management Dossier Hub">
      <div class="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        <!-- Header -->
        <div class="p-4 sm:p-6 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-900/40 to-teal-950/30 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-lg shadow-inner">
              🏥
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">Specialist Referral & Co-Management Hub</h2>
                <span class="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded">HL7 FHIR R4</span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">Diagnostic Pre-Flight Gates • Epistemic SBAR • Chou-Talalay Safety • Dr. Crumpler Re-Entry</p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 flex items-center justify-center text-sm font-bold transition shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label="Close Specialist Referral Hub">
            ✕
          </button>
        </div>

        <!-- Specialty Selector Ribbon -->
        <div class="bg-zinc-900/70 border-b border-zinc-800/80 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">Target Specialty:</span>
          @for (dom of specialtyList; track dom.id) {
            <button
              type="button"
              (click)="selectDomain(dom.id)"
              [class.bg-teal-500/20]="referralService.selectedDomain() === dom.id"
              [class.border-teal-500/50]="referralService.selectedDomain() === dom.id"
              [class.text-teal-300]="referralService.selectedDomain() === dom.id"
              [class.text-zinc-400]="referralService.selectedDomain() !== dom.id"
              [class.border-zinc-800]="referralService.selectedDomain() !== dom.id"
              class="px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400">
              <span>{{ dom.icon }}</span>
              <span>{{ dom.label }}</span>
            </button>
          }
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-zinc-800/60 px-4 sm:px-6 bg-zinc-900/30 flex items-center gap-6 shrink-0 text-xs font-semibold">
          <button
            type="button"
            (click)="activeTab.set('preflight')"
            [class.text-teal-400]="activeTab() === 'preflight'"
            [class.border-teal-400]="activeTab() === 'preflight'"
            class="py-3 border-b-2 border-transparent transition cursor-pointer flex items-center gap-2 hover:text-zinc-200">
            <span>🛡️ Pre-Flight Readiness</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
                  [class.bg-teal-500/20]="gate().readinessScore >= 80"
                  [class.text-teal-300]="gate().readinessScore >= 80"
                  [class.bg-amber-500/20]="gate().readinessScore < 80"
                  [class.text-amber-300]="gate().readinessScore < 80">
              {{ gate().readinessScore }}%
            </span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('dossier')"
            [class.text-teal-400]="activeTab() === 'dossier'"
            [class.border-teal-400]="activeTab() === 'dossier'"
            class="py-3 border-b-2 border-transparent transition cursor-pointer flex items-center gap-2 hover:text-zinc-200">
            <span>📋 FHIR R4 ServiceRequest</span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('reentry')"
            [class.text-teal-400]="activeTab() === 'reentry'"
            [class.border-teal-400]="activeTab() === 'reentry'"
            class="py-3 border-b-2 border-transparent transition cursor-pointer flex items-center gap-2 hover:text-zinc-200">
            <span>🤝 Co-Management & Crumpler Guide</span>
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          <!-- TAB 1: PRE-FLIGHT READINESS GATES -->
          @if (activeTab() === 'preflight') {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Left: Readiness Gauge & Summary -->
              <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div class="absolute -top-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
                
                <!-- Circular Score Gauge -->
                <div class="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="8" class="text-zinc-800/80" fill="transparent"/>
                    <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="8"
                            [style.stroke-dasharray]="264"
                            [style.stroke-dashoffset]="264 - (264 * gate().readinessScore) / 100"
                            stroke-linecap="round"
                            [class.text-teal-400]="gate().readinessScore >= 80"
                            [class.text-amber-400]="gate().readinessScore < 80"
                            class="transition-all duration-700 ease-out"
                            fill="transparent"/>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-extrabold tracking-tight font-mono text-zinc-100">{{ gate().readinessScore }}%</span>
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Readiness</span>
                  </div>
                </div>

                <h3 class="text-sm font-bold text-zinc-200 mt-2">{{ gate().specialtyName }}</h3>
                <p class="text-xs text-zinc-400 mt-1">{{ gate().professionalSociety }}</p>

                <div class="mt-4 w-full pt-4 border-t border-zinc-800/80">
                  @if (gate().isApprovedForTransmission) {
                    <div class="flex items-center justify-center gap-1.5 text-xs text-teal-400 font-semibold bg-teal-500/10 py-1.5 px-3 rounded-lg border border-teal-500/30">
                      <span>✓</span> Approved for Specialist Transmission
                    </div>
                  } @else {
                    <div class="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/30">
                      <span>⚠️</span> Action Required: {{ gate().missingCriticalPrerequisites.length }} Missing Prerequisites
                    </div>
                  }
                </div>
              </div>

              <!-- Right: Interactive Prerequisites Checklist -->
              <div class="md:col-span-2 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <span>Specialty Diagnostic Checklist</span>
                    <span class="text-xs font-normal text-zinc-500">({{ gate().prerequisites.length }} items)</span>
                  </h3>
                  <button
                    type="button"
                    (click)="simulateTogglePrerequisites()"
                    class="text-xs text-teal-400 hover:text-teal-300 transition underline cursor-pointer">
                    Simulate Prerequisite Changes
                  </button>
                </div>

                <div class="space-y-2.5">
                  @for (pre of gate().prerequisites; track pre.id) {
                    <div class="p-3.5 rounded-xl border transition-all"
                         [class.bg-zinc-900/40]="pre.status === 'completed'"
                         [class.border-zinc-800]="pre.status === 'completed'"
                         [class.bg-amber-950/15]="pre.status === 'missing'"
                         [class.border-amber-700/40]="pre.status === 'missing'"
                         [class.bg-zinc-900/20]="pre.status === 'in_progress'"
                         [class.border-zinc-800/60]="pre.status === 'in_progress'">
                      <div class="flex items-start justify-between gap-3">
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-zinc-200">{{ pre.name }}</span>
                            @if (pre.required) {
                              <span class="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 bg-red-500/10 text-red-400 border border-red-500/20 rounded">Required</span>
                            } @else {
                              <span class="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">Optional</span>
                            }
                          </div>
                          <p class="text-xs text-zinc-400">{{ pre.clinicalRationale }}</p>
                          @if (pre.value) {
                            <div class="text-xs font-mono text-teal-300/90 mt-1 bg-zinc-950/60 px-2 py-1 rounded inline-block border border-zinc-800/80">
                              Result: {{ pre.value }}
                            </div>
                          }
                        </div>

                        <!-- Status Badge -->
                        <span class="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider shrink-0"
                              [class.bg-teal-500/20]="pre.status === 'completed'"
                              [class.text-teal-300]="pre.status === 'completed'"
                              [class.border]="pre.status === 'completed'"
                              [class.border-teal-500/30]="pre.status === 'completed'"
                              [class.bg-amber-500/20]="pre.status === 'missing'"
                              [class.text-amber-300]="pre.status === 'missing'"
                              [class.border-amber-500/30]="pre.status === 'missing'"
                              [class.bg-zinc-800]="pre.status === 'in_progress'"
                              [class.text-zinc-400]="pre.status === 'in_progress'">
                          {{ pre.status }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- TAB 2: FHIR R4 DOSSIER & SAFETY -->
          @if (activeTab() === 'dossier') {
            <div class="space-y-5">
              
              <!-- SBAR Summary Card -->
              <div class="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 class="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <span>Clinical SBAR Referral Summary</span>
                  </h3>
                  <span class="text-xs font-mono text-zinc-400">ID: {{ fhirDossier().id }}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">Patient</span>
                    <span class="text-zinc-200 font-medium">{{ fhirDossier().subject.display }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">Snomed CT Referral Target</span>
                    <span class="text-teal-300 font-mono">{{ fhirDossier().code.coding[0].display }} ({{ fhirDossier().code.coding[0].code }})</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">Primary Clinical Question</span>
                    <p class="text-zinc-300 mt-0.5 leading-relaxed">{{ fhirDossier().note[0].text }}</p>
                  </div>
                </div>

                <!-- Telemetry & Dual Coding Badges -->
                <div class="flex flex-wrap gap-2 pt-2">
                  <span class="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
                    WHO TM1 Code: {{ fhirDossier().reasonCode[0].coding[1].code }} ({{ fhirDossier().reasonCode[0].coding[1].display }})
                  </span>
                  <span class="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono">
                    Aortic PWV: 9.8 m/s (Central Arterial Stiffness Verified)
                  </span>
                  <span class="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                    CMS-0057-F Prior Auth Token: Ready
                  </span>
                </div>
              </div>

              <!-- Raw FHIR JSON Viewer -->
              <div class="bg-black/70 border border-zinc-800/80 rounded-xl overflow-hidden">
                <div class="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                  <span class="text-xs font-mono text-zinc-400">HL7 FHIR R4 ServiceRequest Payload</span>
                  <button
                    type="button"
                    (click)="copyFhirJson()"
                    class="text-xs text-teal-400 hover:text-teal-300 font-medium transition cursor-pointer">
                    {{ copiedJson() ? '✓ Copied to Clipboard' : 'Copy JSON' }}
                  </button>
                </div>
                <pre class="p-4 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-64 leading-tight">{{ fhirJsonString() }}</pre>
              </div>
            </div>
          }

          <!-- TAB 3: CO-MANAGEMENT & CRUMPLER GUIDE -->
          @if (activeTab() === 'reentry') {
            <div class="space-y-6">
              
              <!-- PCP Co-Management Contract -->
              <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span>🤝 PCP Co-Management Shared Care Contract</span>
                  </h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">Shared Accountability</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-zinc-500 font-semibold uppercase text-[10px] block">Primary Care Physician Role</span>
                    <p class="text-zinc-300 mt-0.5">{{ reentryBrief().pcpCoManagementContract.primaryCarePhysicianRole }}</p>
                  </div>
                  <div>
                    <span class="text-zinc-500 font-semibold uppercase text-[10px] block">Specialist Physician Role</span>
                    <p class="text-zinc-300 mt-0.5">{{ reentryBrief().pcpCoManagementContract.specialistPhysicianRole }}</p>
                  </div>
                </div>

                <!-- Laboratory Monitoring Schedule Table -->
                <div class="space-y-1.5 pt-2">
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Lab Monitoring Schedule</span>
                  <div class="border border-zinc-800 rounded-lg overflow-hidden">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-zinc-800/60 text-zinc-400 font-medium">
                        <tr>
                          <th class="p-2.5">Test Name</th>
                          <th class="p-2.5">Interval</th>
                          <th class="p-2.5">Owner</th>
                          <th class="p-2.5">Alert Threshold</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-zinc-800/60 text-zinc-300">
                        @for (lab of reentryBrief().pcpCoManagementContract.laboratoryMonitoringSchedule; track lab.testName) {
                          <tr class="hover:bg-zinc-800/30">
                            <td class="p-2.5 font-medium text-zinc-200">{{ lab.testName }}</td>
                            <td class="p-2.5 font-mono text-zinc-400">{{ lab.targetIntervalWeeks }} weeks</td>
                            <td class="p-2.5">{{ lab.responsibleRole }}</td>
                            <td class="p-2.5 font-mono text-amber-300/90">{{ lab.alertThresholds }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Dr. Rebecca Lee Crumpler Patient Take-Home Sheet -->
              <div class="bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-amber-950/20 border border-amber-500/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div class="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div>
                    <h3 class="text-sm font-bold text-amber-200 flex items-center gap-2">
                      <span>📖 {{ reentryBrief().crumplerPatientGuide.title }}</span>
                    </h3>
                    <p class="text-[11px] text-amber-400/80 mt-0.5">{{ reentryBrief().crumplerPatientGuide.readingLevel }}</p>
                  </div>
                  <button
                    type="button"
                    (click)="copyPatientGuide()"
                    class="text-xs text-amber-300 hover:text-white px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg transition cursor-pointer">
                    {{ copiedGuide() ? '✓ Copied Sheet' : 'Copy Guide' }}
                  </button>
                </div>

                <p class="text-xs text-zinc-300 leading-relaxed">{{ reentryBrief().crumplerPatientGuide.plainLanguageSummary }}</p>

                <!-- Daily Pill Routine -->
                <div class="space-y-2">
                  <span class="text-xs font-bold text-amber-300 uppercase tracking-wider block">Your Daily Medicine Routine</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (med of reentryBrief().crumplerPatientGuide.dailyMedicationSchedule; track med.medicationName) {
                      <div class="bg-black/40 border border-amber-500/20 rounded-lg p-3 text-xs space-y-1">
                        <div class="font-bold text-zinc-100">{{ med.medicationName }}</div>
                        <div class="text-amber-200/90 font-medium">{{ med.plainPurpose }}</div>
                        <div class="text-zinc-400 text-[11px]">{{ med.timing }}</div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Red Flags & When to Call Us -->
                <div class="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-xs space-y-1.5">
                  <span class="font-bold text-red-300 flex items-center gap-1.5 uppercase text-[11px]">
                    <span>⚠️</span> When To Call Our Clinic Immediately
                  </span>
                  <ul class="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                    @for (call of reentryBrief().crumplerPatientGuide.whenToCallUsImmediately; track call) {
                      <li>{{ call }}</li>
                    }
                  </ul>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-zinc-800 bg-zinc-900/80 px-6 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 text-xs text-zinc-400">
            <span class="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>FHIR R4 SMART Ready</span>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition cursor-pointer">
              Close
            </button>
            <button
              type="button"
              (click)="activeTab.set('reentry')"
              class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5">
              <span>Transmit & Generate Re-Entry Brief</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SpecialistReferralHubComponent {
  public readonly referralService = inject(SpecialistReferralDossierService);
  public readonly closeModal = output<void>();

  public readonly activeTab = signal<'preflight' | 'dossier' | 'reentry'>('preflight');
  public readonly copiedJson = signal<boolean>(false);
  public readonly copiedGuide = signal<boolean>(false);

  public readonly specialtyList: Array<{ id: SpecialistDomain; label: string; icon: string }> = [
    { id: 'cardiology', label: 'Cardiology', icon: '🫀' },
    { id: 'rheumatology', label: 'Rheumatology', icon: '🦴' },
    { id: 'neurology', label: 'Neurology', icon: '🧠' },
    { id: 'metabolic_health', label: 'Metabolic & Endo', icon: '🔬' }
  ];

  public readonly gate = computed(() => this.referralService.activeGate());

  public readonly fhirDossier = computed<IFhirServiceRequestDossier>(() => {
    return this.referralService.generateFhirServiceRequest({
      patientId: 'pat-9402',
      patientName: 'Homo Sapiens (Female, 52y, Vasomotor & Stiffness Presentation)',
      domain: this.referralService.selectedDomain(),
      clinicalQuestion: 'Specialist co-management evaluation and therapeutic titration under professional guidelines.',
      allopathicDiagnosis: { code: 'I10', display: 'Essential Hypertension' },
      whoTm1Code: 'SF50',
      pulseWaveVelocityMPerS: 9.8,
      botanicalPair: {
        agent1: 'Terminalia arjuna',
        dose1: 500,
        agent2: 'Crataegus oxyacantha',
        dose2: 300
      }
    });
  });

  public readonly fhirJsonString = computed(() => {
    return JSON.stringify(this.fhirDossier(), null, 2);
  });

  public readonly reentryBrief = computed<ITriDirectionalReEntryBrief>(() => {
    return this.referralService.generateTriDirectionalReEntryBrief({
      referralId: this.fhirDossier().id,
      domain: this.referralService.selectedDomain(),
      patientName: 'Sarah Jenkins',
      clinicalImpression: 'Stage 2 Hypertension with accelerated aortic pulse wave velocity (9.8 m/s) and non-dipping nocturnal profile.',
      medicationsToTitrate: [
        { name: 'Telmisartan 40mg', dose: '1 tablet daily', targetDose: '80mg daily', purpose: 'Relaxes stiff arteries and protects kidney function.' },
        { name: 'Amlodipine 5mg', dose: '1 tablet bedtime', targetDose: '10mg bedtime', purpose: 'Lowers nighttime blood pressure spike.' }
      ],
      monitoringLabs: [
        { test: 'Serum Basic Metabolic Panel (eGFR & Potassium)', intervalWeeks: 3, responsible: 'Primary Care Physician', alert: 'K+ > 5.2 or eGFR decrease > 25%' },
        { test: 'Central Aortic PWV Retest', intervalWeeks: 12, responsible: 'Specialist Clinic', alert: 'PWV remaining > 9.5 m/s' }
      ],
      redFlags: [
        'Sudden severe chest pressure or shortness of breath',
        'Feeling faint or dizzy when standing up quickly',
        'Puffy swelling around ankles or waking up coughing'
      ],
      homeInstructions: [
        'Take your blood pressure every morning after sitting quietly for 5 minutes.',
        'Drink plenty of warm water throughout the day; avoid cold soda and high-sodium frozen meals.',
        'Wear comfortable warm socks in the evening to keep foot blood circulation flowing smoothly.'
      ]
    });
  });

  public selectDomain(domain: SpecialistDomain): void {
    this.referralService.selectedDomain.set(domain);
  }

  public simulateTogglePrerequisites(): void {
    const current = this.gate();
    const hasMissing = current.prerequisites.some(p => p.status === 'missing');
    if (hasMissing) {
      // Toggle all to completed
      this.referralService.evaluatePrerequisites(
        this.referralService.selectedDomain(),
        current.prerequisites.map(p => ({ id: p.id, status: 'completed' }))
      );
    } else {
      // Toggle one to missing to observe dynamic score change
      const firstReq = current.prerequisites.find(p => p.required);
      if (firstReq) {
        this.referralService.evaluatePrerequisites(
          this.referralService.selectedDomain(),
          [{ id: firstReq.id, status: 'missing' }]
        );
      }
    }
  }

  public copyFhirJson(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.fhirJsonString()).then(() => {
        this.copiedJson.set(true);
        setTimeout(() => this.copiedJson.set(false), 2000);
      });
    }
  }

  public copyPatientGuide(): void {
    const guide = this.reentryBrief().crumplerPatientGuide;
    const text = `${guide.title}\n\n${guide.plainLanguageSummary}\n\nMEDICATIONS:\n` +
      guide.dailyMedicationSchedule.map(m => `- ${m.medicationName}: ${m.plainPurpose} (${m.timing})`).join('\n') +
      `\n\nHOME CARE:\n` + guide.homeCareAndFamilyPacing.map(h => `- ${h}`).join('\n') +
      `\n\nWHEN TO CALL:\n` + guide.whenToCallUsImmediately.map(c => `- ${c}`).join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedGuide.set(true);
        setTimeout(() => this.copiedGuide.set(false), 2000);
      });
    }
  }
}
