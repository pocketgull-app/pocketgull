import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IEmergencyNutritionalSuggestion {
  id: string;
  category: 'Rapid Osmotic Hydration' | 'Cardiovascular Cooling' | 'Tissue Oxygenation' | 'Glycemic Support' | 'Thermal Supportive Beverage';
  emoji: string;
  title: string;
  triggerSource: string; // Vitals, Condition, or Location
  activeFormula: string;
  emergencyRationale: string;
  preparationTime: string;
  dosageInstructions: string;
  urgencyLevel: 'ADVISORY' | 'SUPPORTIVE';
  evidenceTier: 'Tier 3 (Level C: Supportive Wellness)';
}

@Component({
  selector: 'app-emergency-nutritional-bypass',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-gradient-to-br from-red-950/30 via-zinc-950 to-zinc-900 border-2 border-red-500/40 rounded-3xl text-zinc-100 shadow-2xl mb-8 font-mono">
      
      <!-- 🚨 MANDATORY ACUTE EMS & 911 REDIRECTION CALLOUT -->
      <div class="p-4 rounded-2xl bg-red-600/20 border-2 border-red-500/60 mb-5 text-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div class="flex items-start gap-3">
          <span class="text-2xl shrink-0">🚨</span>
          <div>
            <h4 class="text-xs sm:text-sm font-black uppercase tracking-wider text-red-300">
              Acute Medical Emergency Protocol — Call 911 Immediately
            </h4>
            <p class="text-[11px] text-zinc-200 font-sans mt-0.5 leading-relaxed">
              If the patient experiences chest pain, acute respiratory distress (SpO₂ &lt; 92%), acute stroke signs (FAST), severe hypothermia, or altered mental status, <strong>immediately call 911 / EMS</strong> or proceed to the nearest Emergency Department. Software cannot replace emergency medical evaluation.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
          <span class="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow">
            EMS: 911
          </span>
          <span class="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 font-mono">
            Poison Control: 1-800-222-1222
          </span>
          <span class="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 font-mono">
            Crisis: 988
          </span>
        </div>
      </div>

      <!-- Supportive Clinical Triage Reference Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-amber-400">
              📋 Supportive Nutritional & Hydration Reference (Tier 3 CDS Draft)
            </h3>
          </div>
          <p class="text-[11px] text-zinc-400 mt-1 font-sans">
            Draft non-pharmacological supportive hydration recommendations staged for independent Attending Clinician evaluation.
          </p>
        </div>

        <div class="flex items-center gap-2 text-[10px]">
          <span class="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
            Context Region: {{ activeLocationRegion() }}
          </span>
        </div>
      </div>

      <!-- Educational Suggestions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of suggestions(); track item.id) {
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition shadow-md flex flex-col justify-between">
            <div>
              <!-- Badge Header -->
              <div class="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                  {{ item.evidenceTier }}
                </span>
                <span class="text-xs text-zinc-400 font-sans">⏱️ {{ item.preparationTime }}</span>
              </div>

              <!-- Title & Formula -->
              <div class="flex items-start gap-3 mb-2">
                <span class="text-2xl shrink-0">{{ item.emoji }}</span>
                <div>
                  <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-tight">{{ item.title }}</h4>
                  <span class="text-[10px] text-amber-300 font-bold block mt-0.5">Supportive Formula: {{ item.activeFormula }}</span>
                </div>
              </div>

              <!-- Rationale & Trigger -->
              <p class="text-[11px] text-zinc-300 font-sans leading-relaxed mb-3">
                {{ item.emergencyRationale }}
              </p>
            </div>

            <!-- Footer Dosage & Action -->
            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
              <span class="text-zinc-400">Trigger: <strong class="text-zinc-200">{{ item.triggerSource }}</strong></span>
              <button (click)="prescribeEmergencyItem(item)"
                class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 flex items-center gap-1">
                <span>📋</span> Stage for HCP Review
              </button>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class EmergencyNutritionalBypassComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  activeLocationRegion = computed(() => {
    return 'Oregon Pacific Coast (Buoy 46050)';
  });

  suggestions = computed<IEmergencyNutritionalSuggestion[]>(() => {
    const vitals = this.patientState.vitals();
    const result: IEmergencyNutritionalSuggestion[] = [];

    // 1. High BP Observation (>130/80)
    if (vitals.bp) {
      const sys = parseInt(vitals.bp.split('/')[0], 10);
      if (sys >= 130) {
        result.push({
          id: 'emerg-bp',
          category: 'Rapid Osmotic Hydration',
          emoji: '🥥',
          title: 'Isotonic Electrolyte Osmotic Hydration Proposal',
          triggerSource: `Elevated BP Observation (${vitals.bp} mmHg)`,
          activeFormula: 'Coconut Water + Potassium Citrate 1000mg + Magnesium Glycinate 400mg',
          emergencyRationale: 'Draft supportive electrolyte fluid proposal to facilitate vascular relaxation alongside primary medical therapy.',
          preparationTime: '< 2 Mins',
          dosageInstructions: 'Sip 250ml every 20 minutes under clinician guidance.',
          urgencyLevel: 'SUPPORTIVE',
          evidenceTier: 'Tier 3 (Level C: Supportive Wellness)'
        });
      }
    }

    // 2. High HR / Tachycardia Observation (>85 bpm)
    if (vitals.hr) {
      const hr = parseInt(vitals.hr, 10);
      if (hr >= 85) {
        result.push({
          id: 'emerg-hr',
          category: 'Cardiovascular Cooling',
          emoji: '🫖',
          title: 'Supportive Chrysanthemum & Peppermint Infusion',
          triggerSource: `Elevated Heart Rate Observation (${vitals.hr} BPM)`,
          activeFormula: 'Wild Chrysanthemum (Ju Hua) + Peppermint Menthol 15mg',
          emergencyRationale: 'Traditional supportive beverage intended to assist parasympathetic relaxation alongside standard clinical assessment.',
          preparationTime: '3 Mins Steep',
          dosageInstructions: 'Serve lukewarm at 37°C.',
          urgencyLevel: 'SUPPORTIVE',
          evidenceTier: 'Tier 3 (Level C: Supportive Wellness)'
        });
      }
    }

    // 3. Low SpO2 / Oxygen Observation (<95%)
    if (vitals.spO2) {
      const spo2 = parseInt(vitals.spO2, 10);
      if (spo2 < 95) {
        result.push({
          id: 'emerg-spo2',
          category: 'Tissue Oxygenation',
          emoji: '🍷',
          title: 'Dietary Nitrate Beetroot Beverage Proposal',
          triggerSource: `Low SpO2 Observation (${vitals.spO2}%)`,
          activeFormula: 'Concentrated Beetroot Extract (500mg Inorganic Nitrate) + L-Arginine 3g',
          emergencyRationale: 'Supportive dietary nitrate substrate proposal. (Note: Acute hypoxemia requires immediate clinical oxygenation / 911 evaluation).',
          preparationTime: 'Instant Shot',
          dosageInstructions: 'Single 70ml concentrated shot as adjunctive dietary support.',
          urgencyLevel: 'SUPPORTIVE',
          evidenceTier: 'Tier 3 (Level C: Supportive Wellness)'
        });
      }
    }

    // 4. Fallback Supportive Maritime Climate Warmth
    if (result.length === 0) {
      result.push({
        id: 'emerg-default',
        category: 'Thermal Supportive Beverage',
        emoji: '🫚',
        title: 'Supportive Coastal Thermal Ginger Decoction',
        triggerSource: 'Oregon Coastal Maritime Climate Reference',
        activeFormula: '6-Gingerol 30mg + Sea Salt Electrolytes (Na+ 500mg) + Bone Broth Collagen',
        emergencyRationale: 'Supportive warm broth proposed for maritime cold weather comfort. (Severe hypothermia requires active medical re-warming & EMS).',
        preparationTime: '5 Mins Brew',
        dosageInstructions: 'Sip warm as dietary comfort.',
        urgencyLevel: 'ADVISORY',
        evidenceTier: 'Tier 3 (Level C: Supportive Wellness)'
      });
    }

    return result;
  });

  prescribeEmergencyItem(item: IEmergencyNutritionalSuggestion) {
    const noteText = `📋 Staged Supportive Nutritional Draft (Tier 3): ${item.emoji} ${item.title} (${item.activeFormula}) — Trigger: ${item.triggerSource}`;
    this.patientState.addClinicalNote({
      id: `emerg-log-${item.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'EMT Handoff',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }
}
