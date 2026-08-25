import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IEmergencyNutritionalSuggestion {
  id: string;
  category: 'Rapid Osmotic Hydration' | 'Cardiovascular Cooling' | 'Tissue Oxygenation' | 'Glycemic Emergency' | 'Thermal Shivering Reset';
  emoji: string;
  title: string;
  triggerSource: string; // Vitals, Condition, or Location
  activeFormula: string;
  emergencyRationale: string;
  preparationTime: string;
  dosageInstructions: string;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'ADVISORY';
}

@Component({
  selector: 'app-emergency-nutritional-bypass',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-900 border-2 border-amber-500/50 rounded-3xl text-zinc-100 shadow-2xl mb-8 font-mono">
      
      <!-- Emergency Bypass Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-4 mb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-ping"></span>
            <h3 class="text-sm sm:text-base font-extrabold uppercase tracking-widest text-amber-400">
              🚨 Emergency Bypass — Rapid Nutritional Triage Telemetry
            </h3>
          </div>
          <p class="text-[11px] text-zinc-400 mt-1 font-sans">
            Real-time emergency dietary & osmotic hydration recommendations calculated from patient vitals, active conditions, and GPS location telemetry.
          </p>
        </div>

        <div class="flex items-center gap-2 text-[10px]">
          <span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
            Location: {{ activeLocationRegion() }}
          </span>
        </div>
      </div>

      <!-- Emergency Suggestions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of suggestions(); track item.id) {
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 hover:border-amber-500/60 transition shadow-md flex flex-col justify-between">
            <div>
              <!-- Badge Header -->
              <div class="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                  [class.bg-red-500/20]="item.urgencyLevel === 'CRITICAL'"
                  [class.text-red-400]="item.urgencyLevel === 'CRITICAL'"
                  [class.bg-amber-500/20]="item.urgencyLevel === 'HIGH'"
                  [class.text-amber-400]="item.urgencyLevel === 'HIGH'"
                  [class.bg-emerald-500/20]="item.urgencyLevel === 'ADVISORY'"
                  [class.text-emerald-400]="item.urgencyLevel === 'ADVISORY'">
                  {{ item.urgencyLevel }} • {{ item.category }}
                </span>
                <span class="text-xs text-zinc-400 font-sans">⏱️ {{ item.preparationTime }}</span>
              </div>

              <!-- Title & Formula -->
              <div class="flex items-start gap-3 mb-2">
                <span class="text-2xl shrink-0">{{ item.emoji }}</span>
                <div>
                  <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-tight">{{ item.title }}</h4>
                  <span class="text-[10px] text-amber-300 font-bold block mt-0.5">Formula: {{ item.activeFormula }}</span>
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
                class="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 font-bold uppercase tracking-wider transition cursor-pointer active:scale-95">
                ➕ Log Triage Meal
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

    // 1. High BP Triage (>130/80)
    if (vitals.bp) {
      const sys = parseInt(vitals.bp.split('/')[0], 10);
      if (sys >= 130) {
        result.push({
          id: 'emerg-bp',
          category: 'Rapid Osmotic Hydration',
          emoji: '🥥',
          title: 'Isotonic Electrolyte Osmotic Hydration Solution',
          triggerSource: `High BP (${vitals.bp} mmHg)`,
          activeFormula: 'Coconut Water + Potassium Citrate 1000mg + Magnesium Glycinate 400mg',
          emergencyRationale: 'Induces rapid vascular endothelial relaxation via SGLT-1 cotransport and Na+/K+-ATPase pump stabilization.',
          preparationTime: '< 2 Mins',
          dosageInstructions: 'Sip 250ml every 20 minutes.',
          urgencyLevel: 'CRITICAL'
        });
      }
    }

    // 2. High HR / Tachycardia (>85 bpm)
    if (vitals.hr) {
      const hr = parseInt(vitals.hr, 10);
      if (hr >= 85) {
        result.push({
          id: 'emerg-hr',
          category: 'Cardiovascular Cooling',
          emoji: '🫖',
          title: 'TCM Cooling Chrysanthemum & Peppermint Infusion',
          triggerSource: `Elevated Heart Rate (${vitals.hr} BPM)`,
          activeFormula: 'Wild Chrysanthemum (Ju Hua) + Peppermint Menthol 15mg',
          emergencyRationale: 'Clears TCM Liver/Heart Heat fire, stimulates vagal parasympathetic reflex, and lowers cardiac chronotropy.',
          preparationTime: '3 Mins Steep',
          dosageInstructions: 'Serve lukewarm at 37°C.',
          urgencyLevel: 'HIGH'
        });
      }
    }

    // 3. Low SpO2 / Oxygen Triage (<95%)
    if (vitals.spO2) {
      const spo2 = parseInt(vitals.spO2, 10);
      if (spo2 < 95) {
        result.push({
          id: 'emerg-spo2',
          category: 'Tissue Oxygenation',
          emoji: '🍷',
          title: 'Inorganic Nitrate Beetroot Elixir',
          triggerSource: `Low SpO2 (${vitals.spO2}%)`,
          activeFormula: 'Concentrated Beetroot Extract (500mg Inorganic Nitrate) + L-Arginine 3g',
          emergencyRationale: 'Converts to Endogenous Nitric Oxide (NO) in hypoxic tissues, inducing microvascular vasodilation and arterial oxygen saturation.',
          preparationTime: 'Instant Shot',
          dosageInstructions: 'Single 70ml concentrated shot.',
          urgencyLevel: 'CRITICAL'
        });
      }
    }

    // 4. Fallback / Default Climate & Location Emergency Suggestion
    if (result.length === 0) {
      result.push({
        id: 'emerg-default',
        category: 'Thermal Shivering Reset',
        emoji: '🫚',
        title: 'Coastal Field Thermal Gingerol Broth',
        triggerSource: 'Oregon Coastal Maritime Climate GPS',
        activeFormula: '6-Gingerol 30mg + Sea Salt Electrolytes (Na+ 500mg) + Bone Broth Collagen',
        emergencyRationale: 'Prevents environmental hypothermia, maintains gastric mucosal perfusion, and ignites thermogenic shivering threshold.',
        preparationTime: '5 Mins Brew',
        dosageInstructions: 'Sip warm at 50°C.',
        urgencyLevel: 'ADVISORY'
      });
    }

    return result;
  });

  prescribeEmergencyItem(item: IEmergencyNutritionalSuggestion) {
    const noteText = `🚨 Emergency Bypass Triage Logged: ${item.emoji} ${item.title} (${item.activeFormula}) — Trigger: ${item.triggerSource}`;
    this.patientState.addClinicalNote({
      id: `emerg-log-${item.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'EMT Handoff',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }
}
