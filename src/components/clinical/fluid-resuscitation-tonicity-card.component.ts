import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FluidTonicityResuscitationService,
  FLUID_CATALOG,
  FluidInfusionType,
  ClinicalHydrationState,
  BiologicalSex
} from '../../services/fluid-tonicity-resuscitation.service';

@Component({
  selector: 'app-fluid-resuscitation-tonicity-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/95 border border-cyan-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-6 mb-6">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400">
            💧
          </div>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <span>IV Fluid Resuscitation &amp; Tonicity Shift Engine (Model P14)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Multi-Compartment Translocations (ICF &bull; ISF &bull; IV Plasma) &bull; Adrogu&eacute;-Madias [Na⁺] Kinetics &bull; Stewart SID &bull; ODS Guardrails
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Fluid Retention Badge -->
          <span class="text-xs px-3 py-1 rounded-full font-extrabold border"
                [ngClass]="{
                  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40': sim().shifts.intravascularRetentionPercent >= 25,
                  'bg-purple-500/20 text-purple-300 border-purple-500/40': sim().shifts.intravascularRetentionPercent > 100,
                  'bg-amber-500/20 text-amber-300 border-amber-500/40': sim().shifts.intravascularRetentionPercent < 25
                }">
            Intravascular: {{ sim().shifts.intravascularRetentionPercent }}% ({{ sim().shifts.deltaIntravascularMl > 0 ? '+' : '' }}{{ sim().shifts.deltaIntravascularMl }} mL)
          </span>

          <!-- Hyperchloremia Risk Badge -->
          <span class="text-xs px-3 py-1 rounded-full font-extrabold border"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': sim().hyperchloremicAcidosisRisk === 'Low',
                  'bg-amber-500/20 text-amber-300 border-amber-500/40': sim().hyperchloremicAcidosisRisk === 'Moderate',
                  'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse': sim().hyperchloremicAcidosisRisk === 'High' || sim().hyperchloremicAcidosisRisk === 'Severe'
                }">
            Acidosis: {{ sim().hyperchloremicAcidosisRisk }}
          </span>

          <!-- ODS Alert Badge -->
          @if (sim().osmoticDemyelinationRisk) {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-rose-600 text-white animate-pulse flex items-center gap-1 shadow-[0_0_12px_rgba(244,63,94,0.9)]">
              <span>🚨</span>
              <span>ODS RISK: &Delta;Na⁺ {{ sim().deltaSodiumMEq > 0 ? '+' : '' }}{{ sim().deltaSodiumMEq }}</span>
            </span>
          }
        </div>
      </div>

      <!-- Presets Quick Bar -->
      <div class="flex flex-wrap items-center gap-2 p-2.5 bg-zinc-900/60 rounded-2xl border border-zinc-850 text-xs">
        <span class="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Clinical Presets:</span>
        <button type="button" (click)="loadPreset('sepsis_resuscitation')"
                class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-300 transition text-[11px] border border-zinc-700 cursor-pointer">
          🦠 Sepsis (30 mL/kg LR)
        </button>
        <button type="button" (click)="loadPreset('cerebral_edema_3pct')"
                class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-purple-950 hover:text-purple-300 transition text-[11px] border border-zinc-700 cursor-pointer">
          🧠 Acute Cerebral Edema (3% NaCl)
        </button>
        <button type="button" (click)="loadPreset('dka_euvolemic')"
                class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 transition text-[11px] border border-zinc-700 cursor-pointer">
          🩸 DKA Rehydration (Plasma-Lyte)
        </button>
        <button type="button" (click)="loadPreset('severe_burn_parkland')"
                class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-amber-950 hover:text-amber-300 transition text-[11px] border border-zinc-700 cursor-pointer">
          🔥 Severe Burn (Parkland)
        </button>
        <button type="button" (click)="loadPreset('cirrhotic_paracentesis')"
                class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-blue-950 hover:text-blue-300 transition text-[11px] border border-zinc-700 cursor-pointer">
          🍺 Paracentesis (25% Albumin)
        </button>
      </div>

      <!-- 3-Compartment Visual Fluid Shift Gauge -->
      <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <span>⚖️</span>
            <span>Tri-Compartment Fluid Translocation Matrix</span>
          </h4>
          <span class="text-[11px] text-zinc-400">Total Body Water: {{ sim().baselineVolumes.totalBodyWaterL }} L</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <!-- Intravascular Plasma Compartment -->
          <div class="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-bold text-cyan-300">Intravascular Plasma</span>
                <span class="text-cyan-400 text-[11px]">Base: {{ sim().baselineVolumes.intravascularPlasmaL }} L</span>
              </div>
              <p class="text-[10px] text-zinc-400">Circulating blood volume maintaining MAP &amp; perfusion</p>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline justify-between mb-1">
                <span class="text-lg font-black text-cyan-200">
                  {{ sim().shifts.finalIntravascularPlasmaL }} L
                </span>
                <span class="text-xs font-bold"
                      [class.text-cyan-300]="sim().shifts.deltaIntravascularMl >= 0"
                      [class.text-rose-400]="sim().shifts.deltaIntravascularMl < 0">
                  {{ sim().shifts.deltaIntravascularMl >= 0 ? '+' : '' }}{{ sim().shifts.deltaIntravascularMl }} mL
                </span>
              </div>
              <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div class="bg-cyan-400 h-full transition-all duration-500"
                     [style.width.%]="calcBarWidth(sim().shifts.finalIntravascularPlasmaL, sim().baselineVolumes.intravascularPlasmaL)">
                </div>
              </div>
            </div>
          </div>

          <!-- Interstitial Fluid Compartment -->
          <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-bold text-amber-300">Interstitial Fluid (ISF)</span>
                <span class="text-amber-400 text-[11px]">Base: {{ sim().baselineVolumes.interstitialL }} L</span>
              </div>
              <p class="text-[10px] text-zinc-400">Extracellular matrix bathing cells (edema reservoir)</p>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline justify-between mb-1">
                <span class="text-lg font-black text-amber-200">
                  {{ sim().shifts.finalInterstitialL }} L
                </span>
                <span class="text-xs font-bold"
                      [class.text-amber-300]="sim().shifts.deltaInterstitialMl >= 0"
                      [class.text-emerald-400]="sim().shifts.deltaInterstitialMl < 0">
                  {{ sim().shifts.deltaInterstitialMl >= 0 ? '+' : '' }}{{ sim().shifts.deltaInterstitialMl }} mL
                </span>
              </div>
              <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div class="bg-amber-400 h-full transition-all duration-500"
                     [style.width.%]="calcBarWidth(sim().shifts.finalInterstitialL, sim().baselineVolumes.interstitialL)">
                </div>
              </div>
            </div>
          </div>

          <!-- Intracellular Fluid Compartment -->
          <div class="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-bold text-purple-300">Intracellular Fluid (ICF)</span>
                <span class="text-purple-400 text-[11px]">Base: {{ sim().baselineVolumes.intracellularL }} L</span>
              </div>
              <p class="text-[10px] text-zinc-400">Inside cell membranes (sensitive to osmotic shifts)</p>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline justify-between mb-1">
                <span class="text-lg font-black text-purple-200">
                  {{ sim().shifts.finalIntracellularL }} L
                </span>
                <span class="text-xs font-bold"
                      [class.text-purple-300]="sim().shifts.deltaIntracellularMl >= 0"
                      [class.text-cyan-400]="sim().shifts.deltaIntracellularMl < 0">
                  {{ sim().shifts.deltaIntracellularMl >= 0 ? '+' : '' }}{{ sim().shifts.deltaIntracellularMl }} mL
                </span>
              </div>
              <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div class="bg-purple-400 h-full transition-all duration-500"
                     [style.width.%]="calcBarWidth(sim().shifts.finalIntracellularL, sim().baselineVolumes.intracellularL)">
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Controls & Prescription Matrix (2-Column Grid) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Left: Patient Characteristics & Hydration State -->
        <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-300">1. Patient Substrate</h4>
          
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block text-[10px] text-zinc-400 mb-1">Weight (kg):</label>
              <input type="number" [value]="svc.inputs().patientWeightKg"
                     (input)="onWeightChange($event)"
                     min="10" max="250"
                     class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-100 font-bold focus:border-cyan-500 outline-none">
            </div>

            <div>
              <label class="block text-[10px] text-zinc-400 mb-1">Biological Sex:</label>
              <select [value]="svc.inputs().biologicalSex"
                      (change)="onSexChange($event)"
                      class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 font-bold focus:border-cyan-500 outline-none text-xs">
                <option value="male">Male (60% TBW)</option>
                <option value="female">Female (50% TBW)</option>
              </select>
            </div>
          </div>

          <div class="text-xs">
            <label class="block text-[10px] text-zinc-400 mb-1">Clinical Hydration State:</label>
            <select [value]="svc.inputs().hydrationState"
                    (change)="onHydrationChange($event)"
                    class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 font-bold focus:border-cyan-500 outline-none text-xs">
              <option value="euvolemic">Euvolemic (Intact Glycocalyx)</option>
              <option value="hypovolemic_dehydrated">Hypovolemic Dehydration</option>
              <option value="septic_capillary_leak">Septic Capillary Leak (Glycocalyx Denuded)</option>
              <option value="burn_trauma">Burn &amp; Polytrauma (Microvascular Leak)</option>
              <option value="cirrhotic_ascites">Cirrhotic Ascites / Hepatorenal</option>
              <option value="congestive_heart_failure">Congestive Heart Failure (Hypervolemic)</option>
            </select>
          </div>

          <!-- Baseline Labs -->
          <div class="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-zinc-800">
            <div>
              <label class="block text-[9.5px] text-zinc-400">Base Na⁺ (mEq/L):</label>
              <input type="number" [value]="svc.inputs().baselineSerumSodiumMEq"
                     (input)="onSodiumChange($event)"
                     class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200">
            </div>
            <div>
              <label class="block text-[9.5px] text-zinc-400">Base Cl⁻ (mEq/L):</label>
              <input type="number" [value]="svc.inputs().baselineSerumChlorideMEq"
                     (input)="onChlorideChange($event)"
                     class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200">
            </div>
            <div>
              <label class="block text-[9.5px] text-zinc-400">Base Albumin (g/dL):</label>
              <input type="number" step="0.1" [value]="svc.inputs().baselineSerumAlbuminGDl"
                     (input)="onAlbuminChange($event)"
                     class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200">
            </div>
          </div>

          @if (svc.inputs().hydrationState === 'burn_trauma') {
            <div class="pt-2 border-t border-zinc-800 text-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-amber-400 font-bold">Wallace Burn TBSA (%):</span>
                <span class="text-amber-300 font-extrabold">{{ svc.inputs().burnTbsaPercent }}%</span>
              </div>
              <input type="range" min="0" max="80" step="5"
                     [value]="svc.inputs().burnTbsaPercent"
                     (input)="onBurnTbsaChange($event)"
                     class="w-full accent-amber-500">
            </div>
          }
        </div>

        <!-- Right: Fluid Prescription & Kinetics -->
        <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-300">2. Infusate Prescription</h4>
          
          <div class="text-xs">
            <label class="block text-[10px] text-zinc-400 mb-1">Infusion Fluid Formulation:</label>
            <select [value]="svc.inputs().fluidType"
                    (change)="onFluidChange($event)"
                    class="w-full bg-zinc-950 border border-cyan-700/60 rounded-lg px-2 py-1.5 text-cyan-200 font-bold focus:border-cyan-400 outline-none text-xs">
              <optgroup label="Balanced Crystalloids (Renal-Protective)">
                <option value="lactated_ringers">Lactated Ringer's (Hartmann's, SID 25)</option>
                <option value="plasmalyte_a">Plasma-Lyte A (Normosol, SID 47)</option>
              </optgroup>
              <optgroup label="Isotonic & Hypotonic Crystalloids">
                <option value="normal_saline_09">0.9% Normal Saline (SID 0, Acidosis Risk)</option>
                <option value="half_normal_saline_045">0.45% Half-Normal Saline (154 mOsm)</option>
                <option value="d5w">5% Dextrose in Water (D5W, 100% Free Water)</option>
              </optgroup>
              <optgroup label="Hypertonic Osmotherapy (ICP / ODS)">
                <option value="hypertonic_saline_3">3% Hypertonic Saline (1026 mOsm/L)</option>
                <option value="hypertonic_saline_75">7.5% Hypertonic Saline (2566 mOsm/L)</option>
              </optgroup>
              <optgroup label="Colloids (Oncotic Pull)">
                <option value="albumin_5">5% Human Albumin (Iso-Oncotic, 20 mmHg)</option>
                <option value="albumin_25">25% Albumin ("Salt-Poor", 100 mmHg)</option>
              </optgroup>
            </select>
          </div>

          <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
            <span class="font-bold text-cyan-400">{{ activeFluidDef().name }}:</span>
            {{ activeFluidDef().description }}
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block text-[10px] text-zinc-400 mb-1">Volume (mL):</label>
              <input type="number" step="50" min="0" max="10000"
                     [value]="svc.inputs().infusionVolumeMl"
                     (input)="onVolumeChange($event)"
                     class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-100 font-bold focus:border-cyan-500 outline-none">
            </div>

            <div>
              <label class="block text-[10px] text-zinc-400 mb-1">Duration (Hours):</label>
              <input type="number" step="0.5" min="0.5" max="48"
                     [value]="svc.inputs().infusionDurationHours"
                     (input)="onDurationChange($event)"
                     class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-100 font-bold focus:border-cyan-500 outline-none">
            </div>
          </div>

          <!-- Infusion Rate & Maintenance Telemetry -->
          <div class="flex items-center justify-between text-[11px] p-2 bg-zinc-950 rounded-xl border border-zinc-850">
            <span class="text-zinc-400">Infusion Rate: <strong class="text-cyan-300">{{ calcRateMlHr() }} mL/hr</strong></span>
            <span class="text-zinc-400">4-2-1 Maintenance: <strong class="text-emerald-400">{{ sim().maintenanceRateMlHr }} mL/hr</strong></span>
          </div>

        </div>

      </div>

      <!-- Telemetry Dials: Predicted Electrolytes & Acid-Base Balance -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Predicted Na⁺</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-cyan-300">{{ sim().predictedSodiumMEq }}</span>
            <span class="text-[10px] text-zinc-400">mEq/L</span>
          </div>
          <span class="text-[10.5px] font-bold"
                [class.text-cyan-400]="sim().deltaSodiumMEq >= 0"
                [class.text-amber-400]="sim().deltaSodiumMEq < 0">
            &Delta; {{ sim().deltaSodiumMEq > 0 ? '+' : '' }}{{ sim().deltaSodiumMEq }} mEq/L
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Predicted Cl⁻</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-amber-300">{{ sim().predictedChlorideMEq }}</span>
            <span class="text-[10px] text-zinc-400">mEq/L</span>
          </div>
          <span class="text-[10.5px] text-zinc-400">
            Base: {{ svc.inputs().baselineSerumChlorideMEq }} mEq/L
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Predicted SID</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black"
                  [class.text-emerald-300]="sim().predictedSidMEq >= 36 && sim().predictedSidMEq <= 44"
                  [class.text-rose-400]="sim().predictedSidMEq < 36"
                  [class.text-purple-400]="sim().predictedSidMEq > 44">
              {{ sim().predictedSidMEq }}
            </span>
            <span class="text-[10px] text-zinc-400">mEq/L</span>
          </div>
          <span class="text-[10.5px] text-zinc-400">
            Normal: 38–42 mEq/L
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">24h Maintenance</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-emerald-300">{{ sim().maintenanceVolume24hMl }}</span>
            <span class="text-[10px] text-zinc-400">mL/day</span>
          </div>
          <span class="text-[10.5px] text-emerald-400">
            {{ sim().maintenanceRateMlHr }} mL/hr (4-2-1 Rule)
          </span>
        </div>

      </div>

      <!-- Clinical Guidance & Guardrail Directives -->
      <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <span>📋</span>
          <span>Physiological Resuscitation Directives &amp; Safety Checks</span>
        </h4>

        <div class="space-y-1.5">
          @for (rec of sim().clinicalGuidance; track $index) {
            <div class="text-xs leading-relaxed p-2 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-start gap-2">
              <span class="text-cyan-400 mt-0.5 shrink-0">&bull;</span>
              <span class="text-zinc-200 font-sans">{{ rec }}</span>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class FluidResuscitationTonicityCardComponent {
  readonly svc = inject(FluidTonicityResuscitationService);
  readonly sim = this.svc.simulation;

  readonly activeFluidDef = () => FLUID_CATALOG[this.svc.inputs().fluidType] || FLUID_CATALOG.lactated_ringers;

  calcBarWidth(currentL: number, baseL: number): number {
    if (baseL <= 0) return 50;
    const ratio = (currentL / baseL) * 50;
    return Math.min(100, Math.max(10, Math.round(ratio)));
  }

  calcRateMlHr(): number {
    const dur = Math.max(0.1, this.svc.inputs().infusionDurationHours);
    return Math.round(this.svc.inputs().infusionVolumeMl / dur);
  }

  loadPreset(preset: 'sepsis_resuscitation' | 'cerebral_edema_3pct' | 'dka_euvolemic' | 'severe_burn_parkland' | 'cirrhotic_paracentesis'): void {
    this.svc.loadPreset(preset);
  }

  onWeightChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('patientWeightKg', val);
  }

  onSexChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as BiologicalSex;
    this.svc.updateInput('biologicalSex', val);
  }

  onHydrationChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as ClinicalHydrationState;
    this.svc.updateInput('hydrationState', val);
  }

  onSodiumChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('baselineSerumSodiumMEq', val);
  }

  onChlorideChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('baselineSerumChlorideMEq', val);
  }

  onAlbuminChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('baselineSerumAlbuminGDl', val);
  }

  onBurnTbsaChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('burnTbsaPercent', val);
  }

  onFluidChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as FluidInfusionType;
    this.svc.updateInput('fluidType', val);
  }

  onVolumeChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('infusionVolumeMl', val);
  }

  onDurationChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.svc.updateInput('infusionDurationHours', val);
  }
}
