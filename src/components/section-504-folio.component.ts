import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section504AccommodationService, Section504Category, ISection504Plan } from '../services/section-504-accommodation.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

@Component({
  selector: 'app-section-504-folio',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl mb-8 font-sans">
      
      <!-- Header Banner with Cute Paper Art Accent -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">🎒</span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                Section 504 School &amp; Pediatric Accommodation Folio
              </h2>
              <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 uppercase">
                Rehabilitation Act §504
              </span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              Legally Binding School Accommodation Orders • School Nurse Emergency Action Plans (EAP) • Testing Modifications
            </p>
          </div>
        </div>

        <!-- Action Button: Print School Order -->
        <button (click)="triggerPrintPlan()"
          class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2 self-start sm:self-auto font-mono">
          <span>🖨️</span>
          <span>Print School 504 Order</span>
        </button>
      </div>

      <!-- Condition Category Selector Pills -->
      <div class="mb-6 space-y-2">
        <label class="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
          Select Pediatric Condition Profile:
        </label>
        <div class="flex flex-wrap gap-2">
          @for (cat of conditionOptions; track cat.id) {
            <button (click)="selectCategory(cat.id)"
              [class.bg-teal-600]="activeCategory() === cat.id"
              [class.text-white]="activeCategory() === cat.id"
              [class.border-teal-600]="activeCategory() === cat.id"
              [class.bg-zinc-100]="activeCategory() !== cat.id"
              [class.dark:bg-zinc-800]="activeCategory() !== cat.id"
              [class.text-zinc-700]="activeCategory() !== cat.id"
              [class.dark:text-zinc-300]="activeCategory() !== cat.id"
              class="px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:border-teal-400 transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <span>{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Main Folio Display: Archival Letterhead Mockup -->
      @if (currentPlan(); as plan) {
        <div class="p-6 sm:p-8 bg-[#faf8f5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-2xl border-2 border-zinc-300 dark:border-zinc-800 shadow-inner space-y-6 relative overflow-hidden font-serif">
          
          <!-- Subtle Cute Watermark: Pastel Waves -->
          <div class="absolute -right-16 -top-16 w-64 h-64 pointer-events-none opacity-10">
            <img src="/assets/art/origami_seagull_vagal_waves.png" alt="Watermark" class="w-full h-full object-contain" />
          </div>

          <!-- Formal Clinical Header -->
          <div class="border-b-2 border-teal-800 dark:border-teal-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="text-[11px] font-mono uppercase tracking-widest text-teal-800 dark:text-teal-400 font-bold">
                PHYSICIAN MEDICAL AUTHORIZATION &amp; ACCOMMODATION DIRECTIVE
              </div>
              <h3 class="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {{ plan.studentName }}
              </h3>
              <div class="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
                {{ plan.gradeLevel }} • {{ plan.schoolName }} • Record Digest: {{ plan.fhirBundleDigest }}
              </div>
            </div>

            <div class="text-right font-mono text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
              <div><strong>Attending:</strong> {{ plan.attendingPhysician }}</div>
              <div><strong>License:</strong> {{ plan.physicianLicense }}</div>
              <div><strong>Date of Plan:</strong> {{ plan.generatedDate }}</div>
            </div>
          </div>

          <!-- Diagnosis & Legal Functional Impairment Statement -->
          <div class="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-sans text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider font-mono text-[11px]">
                Primary Medical Diagnosis:
              </span>
              <span class="font-mono text-zinc-500 font-bold">
                ICD-10: {{ plan.icd10Codes.join(', ') }}
              </span>
            </div>
            <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-serif">
              {{ plan.primaryDiagnosis }}
            </div>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
              <strong>Substantial Limitation Rationale:</strong> {{ plan.functionalImpairmentSummary }}
            </p>
          </div>

          <!-- Classroom Accommodations Grid -->
          <div class="space-y-3 font-sans">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-teal-900 dark:text-teal-400 flex items-center gap-1.5">
              <span>📋</span> Mandatory Classroom &amp; Environmental Accommodations:
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (acc of plan.accommodations; track acc.id) {
                <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ acc.title }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {{ acc.category }}
                    </span>
                  </div>
                  <p class="text-zinc-600 dark:text-zinc-300 leading-snug">
                    {{ acc.description }}
                  </p>
                  <div class="text-[11px] text-zinc-500 italic">
                    <strong>Clinical Rationale:</strong> {{ acc.rationale }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Testing Modifications & PE -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h5 class="font-bold font-mono text-[11px] text-teal-800 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <span>📝</span> Testing &amp; Standardized Exam Accommodations
              </h5>
              <ul class="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-300">
                @for (t of plan.testingAccommodations; track t) {
                  <li>{{ t }}</li>
                }
              </ul>
            </div>

            <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h5 class="font-bold font-mono text-[11px] text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>🏃</span> Physical Education &amp; Recess Modifications
              </h5>
              @if (plan.peModifications.length > 0) {
                <ul class="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-300">
                  @for (pe of plan.peModifications; track pe) {
                    <li>{{ pe }}</li>
                  }
                </ul>
              } @else {
                <p class="text-zinc-500 italic">No physical activity restrictions required for this diagnosis.</p>
              }
            </div>
          </div>

          <!-- School Nurse Emergency Action Protocol (EAP) -->
          @if (plan.emergencyActionPlan; as eap) {
            <div class="p-5 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 font-sans text-xs space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold font-mono text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>🚨</span> School Nurse Emergency Action Plan (EAP)
                </span>
                <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                  CRITICAL PROTOCOL
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-800 dark:text-zinc-200">
                <div>
                  <strong class="text-rose-700 dark:text-rose-400 block mb-1">Trigger Symptoms:</strong>
                  <ul class="list-disc pl-4 space-y-0.5 text-zinc-700 dark:text-zinc-300 text-[11px]">
                    @for (s of eap.triggerSymptoms; track s) {
                      <li>{{ s }}</li>
                    }
                  </ul>
                </div>

                @if (eap.rescueMedication) {
                  <div>
                    <strong class="text-rose-700 dark:text-rose-400 block mb-1">Prescribed Rescue Medication:</strong>
                    <div class="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-rose-200 dark:border-rose-800 text-[11px] space-y-0.5">
                      <div><strong>Med:</strong> {{ eap.rescueMedication.name }}</div>
                      <div><strong>Dose:</strong> {{ eap.rescueMedication.dosage }} ({{ eap.rescueMedication.route }})</div>
                      <div><strong>Location:</strong> {{ eap.rescueMedication.location }}</div>
                    </div>
                  </div>
                }
              </div>

              <div class="pt-2 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-[11px]">
                <span class="font-bold text-rose-900 dark:text-rose-300">
                  <strong>Activate 911 Criteria:</strong> {{ eap.call911Criteria.join('; ') }}
                </span>
              </div>
            </div>
          }

          <!-- Signature Block & Legal Seal -->
          <div class="pt-6 border-t border-zinc-300 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <div class="space-y-1 text-center sm:text-left">
              <div>________________________________________</div>
              <div class="font-bold text-zinc-900 dark:text-zinc-200">{{ plan.attendingPhysician }} (Physician Signature)</div>
              <div class="text-[10px]">Medical License: {{ plan.physicianLicense }} • NPI: 1948201948</div>
            </div>

            <div class="text-right text-[10px] space-y-0.5">
              <div>CONFIDENTIAL STUDENT RECORD</div>
              <div>FERPA &amp; Section 504 Protected</div>
              <div>Annual Review Due: {{ plan.reviewDate }}</div>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class Section504FolioComponent {
  sec504Service = inject(Section504AccommodationService);
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  activeCategory = signal<Section504Category>('type1_diabetes');

  conditionOptions: { id: Section504Category; label: string; icon: string }[] = [
    { id: 'type1_diabetes', label: 'Type 1 Diabetes', icon: '💉' },
    { id: 'pots_dysautonomia', label: 'POTS & Dysautonomia', icon: '🫀' },
    { id: 'food_allergy_anaphylaxis', label: 'Severe Anaphylaxis', icon: '🥜' },
    { id: 'adhd_executive_function', label: 'ADHD & Executive', icon: '🧠' },
    { id: 'epilepsy_seizure', label: 'Epilepsy & Seizures', icon: '⚡' },
    { id: 'asthma_respiratory', label: 'Asthma & Respiratory', icon: '🫁' },
    { id: 'dyslexia_learning', label: 'Dyslexia & Learning', icon: '📖' },
    { id: 'ibd_gastrointestinal', label: 'IBD & Crohn\'s', icon: '🩺' },
    { id: 'juvenile_arthritis', label: 'Juvenile Arthritis', icon: '🦴' }
  ];

  activeStudentName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Maya Torres';
    const p = this.patientManagement.patients().find(pt => pt.id === pId);
    return p ? p.name : 'Maya Torres';
  });

  currentPlan = computed(() => {
    return this.sec504Service.generateSection504Plan({
      patientId: this.patientState.patientId() || 'p001',
      studentName: this.activeStudentName(),
      conditionCategory: this.activeCategory(),
      gradeLevel: 'Grade 6 (Middle School)',
      schoolName: 'Lincoln Unified District',
      attendingPhysician: 'Dr. Phil Gear, FACP'
    });
  });

  selectCategory(cat: Section504Category) {
    this.activeCategory.set(cat);
  }

  triggerPrintPlan() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
