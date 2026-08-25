import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IDietaryAllergen {
  id: string;
  name: string;
  category: 'Synthetic Dye' | 'Preservative' | 'Protein / Grain' | 'Dairy / Casein';
  severity: 'HIGH (Anaphylactoid / Histamine)' | 'MODERATE' | 'MILD';
  symptomManifestation: string;
  hiddenSources: string[];
  organicSubstitution: string;
  fhirCode: string;
}

@Component({
  selector: 'app-dietary-allergy-shield',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Ambient Warning Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header & Patient Allergy Telemetry Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-pulse">🚫</span>
            <div>
              <h2 class="text-lg font-bold uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Dietary Allergy & Additive Shield</span>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                  Red Dye #40 Hypersensitivity
                </span>
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Active food additive allergen profiling and FHIR R4 AllergyIntolerance safety engine for <strong>{{ activePatientName() }}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono">
          <button (click)="isFhirModalOpen.set(true)"
            class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase transition shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5">
            <span>🔥</span>
            <span>FHIR R4 Allergy Bundle</span>
          </button>
        </div>
      </div>

      <!-- Active Allergen Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        @for (item of activeAllergens(); track item.id) {
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-red-900/50 hover:border-red-500 transition flex flex-col justify-between group">
            
            <div>
              <!-- Header Badges -->
              <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3 font-mono text-[10px]">
                <span class="px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  🚫 {{ item.category }}
                </span>
                <span class="text-red-400 font-bold uppercase tracking-wider">
                  {{ item.severity }}
                </span>
              </div>

              <!-- Name & Manifestation -->
              <h4 class="text-sm font-bold text-zinc-100 group-hover:text-red-400 transition-colors leading-snug mb-1 flex items-center gap-2">
                <span>{{ item.name }}</span>
                @if (item.name.includes('Red Dye')) {
                  <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PATIENT ALLERGY MATCH
                  </span>
                }
              </h4>
              
              <p class="text-xs text-zinc-300 font-sans leading-relaxed mb-3">
                <strong>Manifestation:</strong> {{ item.symptomManifestation }}
              </p>

              <!-- Hidden Sources Pill List -->
              <div class="mb-3">
                <span class="text-[10px] font-mono text-zinc-400 font-bold uppercase block mb-1">Hidden Sources to Avoid:</span>
                <div class="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  @for (src of item.hiddenSources; track src) {
                    <span class="px-2 py-0.5 rounded bg-zinc-950 text-red-300 border border-zinc-800">
                      ⚠️ {{ src }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Organic Substitution Footer -->
            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[10px]">
              <span class="text-emerald-400 font-bold flex items-center gap-1">
                <span>🌿 Organic Substitution:</span>
                <span>{{ item.organicSubstitution }}</span>
              </span>

              <button (click)="prescribeSafetyNote(item)"
                class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold uppercase transition cursor-pointer active:scale-95">
                📌 Log Safety Note
              </button>
            </div>

          </div>
        }
      </div>

      <!-- FHIR AllergyIntolerance Modal -->
      @if (isFhirModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans animate-in fade-in duration-200">
          <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 text-zinc-100 shadow-2xl font-mono">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">🔥</span>
                <h3 class="text-sm font-bold uppercase text-red-400">HL7 FHIR R4 AllergyIntolerance Resource</h3>
              </div>
              <button (click)="isFhirModalOpen.set(false)" class="text-xs text-zinc-400 hover:text-zinc-200">✕ Close</button>
            </div>

            <pre class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-emerald-400 overflow-x-auto max-h-80 select-all">
&#123;
  "resourceType": "AllergyIntolerance",
  "id": "allergy-red-dye-40-phil",
  "clinicalStatus": &#123; "coding": [&#123; "code": "active" &#125;] &#125;,
  "verificationStatus": &#123; "coding": [&#123; "code": "confirmed" &#125;] &#125;,
  "category": ["food"],
  "criticality": "high",
  "code": &#123;
    "coding": [&#123;
      "system": "http://snomed.info/sct",
      "code": "387413000",
      "display": "Red Dye #40 (Allura Red AC)"
    &#125;]
  &#125;,
  "patient": &#123; "display": "{{ activePatientName() }}" &#125;,
  "reaction": [&#123;
    "substance": &#123; "display": "Synthetic Food Colorant Red #40" &#125;,
    "manifestation": [&#123; "text": "Mast cell histamine degranulation & neuro-excitability" &#125;]
  &#125;]
&#125;
            </pre>

            <button (click)="isFhirModalOpen.set(false)"
              class="w-full mt-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs rounded-xl transition">
              Acknowledge FHIR Safety Mapping
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class DietaryAllergyShieldComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  isFhirModalOpen = signal<boolean>(false);

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Alexander Vance';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Alexander Vance';
  });

  activeAllergens = computed<IDietaryAllergen[]>(() => {
    return [
      {
        id: 'red_dye_40',
        name: 'Red Dye #40 (Allura Red AC / E129)',
        category: 'Synthetic Dye',
        severity: 'HIGH (Anaphylactoid / Histamine)',
        symptomManifestation: 'Triggers mast cell histamine release, neuro-excitability, evening restlessness, and gut mucosal inflammation.',
        hiddenSources: ['Processed Red Electrolytes', 'Artificially Colored Supplements', 'Cherry Syrups', 'Sports Drinks'],
        organicSubstitution: 'Organic Beetroot Anthocyanin Extract or Hibiscus Flower Infusion',
        fhirCode: '387413000'
      },
      {
        id: 'sulfites',
        name: 'Sulfites & Sodium Metabisulfite (E221)',
        category: 'Preservative',
        severity: 'MODERATE',
        symptomManifestation: 'Triggers bronchial reactivity, flushing, and vascular headaches.',
        hiddenSources: ['Dried Fruit Conservations', 'Wine Vinegar', 'Commercial Fruit Concentrates'],
        organicSubstitution: 'Sun-dried Unsulfured Fruit & Fresh Press Botanical Juices',
        fhirCode: '256333008'
      },
      {
        id: 'gluten_gliadin',
        name: 'Gliadin Gluten Proteins',
        category: 'Protein / Grain',
        severity: 'MODERATE',
        symptomManifestation: 'Zonulin pathway hyper-permeability, sub-clinical gut inflammation, and postprandial fatigue.',
        hiddenSources: ['Refined Wheat Flour', 'Commercial Soy Sauce', 'Process Malt Extracts'],
        organicSubstitution: 'Sprouted Quinoa, Wild Rice, & Organic Buckwheat Flour',
        fhirCode: '227042002'
      }
    ];
  });

  prescribeSafetyNote(allergen: IDietaryAllergen) {
    const noteText = `🚫 Allergen Safety Alert logged: ${allergen.name} (${allergen.category}) — Avoid ${allergen.hiddenSources.slice(0, 2).join(', ')}. Organic substitute: ${allergen.organicSubstitution}.`;
    this.patientState.addClinicalNote({
      id: `allergy-note-${allergen.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }
}
