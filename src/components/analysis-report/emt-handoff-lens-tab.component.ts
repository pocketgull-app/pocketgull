import { Component, ChangeDetectionStrategy, signal, computed, inject, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { generate } from 'lean-qr';
import { BystanderActionSuiteComponent } from '../bystander-action-suite.component';
import { EmergencyNutritionalBypassComponent } from '../emergency-nutritional-bypass.component';
import { PocketGullButtonComponent } from '../shared/pocket-gull-button.component';
import { PocketGullCardComponent } from '../shared/pocket-gull-card.component';
import { ClinicalIcons } from '../../assets/clinical-icons';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';

@Component({
  selector: 'app-emt-handoff-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    BystanderActionSuiteComponent,
    EmergencyNutritionalBypassComponent,
    PocketGullButtonComponent,
    PocketGullCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-500">
      <!-- 🚨 Bystander 911 Action Suite & Role Assignment -->
      <app-bystander-action-suite></app-bystander-action-suite>

      <!-- Crimson alert banner -->
      <div class="p-4 bg-red-955/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center justify-between shadow-inner">
        <div class="flex items-center gap-2.5">
          <span class="text-lg">🚨</span>
          <div>
            <h4 class="font-bold uppercase tracking-wider text-red-400">Offline Emergency First Aid Active</h4>
            <p class="opacity-90 mt-0.5">Session-isolated, temporary clinical sandbox. No persistent data is saved.</p>
          </div>
        </div>
        <pocket-gull-button (click)="toggleCprMetronome()" 
          [variant]="isCprMetronomeActive() ? 'primary' : 'outline'" 
          class="shrink-0 font-bold uppercase tracking-widest text-[12px] py-1.5 px-3 border border-red-500/30 transition-all active:scale-95"
          [class.bg-red-600]="isCprMetronomeActive()"
          [class.text-white]="isCprMetronomeActive()">
          🔊 {{ isCprMetronomeActive() ? 'Stop Metronome' : 'CPR Metronome (' + (patientAgeCategory() === 'infant' ? '120' : '110') + ' BPM)' }}
        </pocket-gull-button>
      </div>

      <!-- Patient Demographic Selector (Age & Pregnancy) -->
      <div class="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="text-[12px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest block mb-1">Target Patient Demographic</span>
          <div class="flex items-center gap-2">
            <button type="button" (click)="patientAgeCategory.set('adult')"
              [class]="patientAgeCategory() === 'adult' ? 'bg-zinc-850 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
              class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
              🧑 Adult
            </button>
            <button type="button" (click)="patientAgeCategory.set('infant'); isPatientPregnant.set(false)"
              [class]="patientAgeCategory() === 'infant' ? 'bg-zinc-850 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
              class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
              👶 Infant (Baby)
            </button>
            <button type="button" (click)="patientAgeCategory.set('geriatric')"
              [class]="patientAgeCategory() === 'geriatric' ? 'bg-zinc-850 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
              class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
              🧓 Geriatric (Elder)
            </button>
          </div>
        </div>

        @if (patientAgeCategory() === 'adult') {
          <div class="flex items-center gap-2">
            <span class="text-[12px] uppercase tracking-wider font-bold text-gray-500 dark:text-zinc-400">Pregnancy Check:</span>
            <button type="button" (click)="isPatientPregnant.set(!isPatientPregnant())"
              [class]="isPatientPregnant() ? 'bg-pink-500/10 text-pink-600 border-pink-500/40' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
              class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition flex items-center gap-1.5">
              🤰 {{ isPatientPregnant() ? 'Pregnant Patient' : 'Not Pregnant' }}
            </button>
          </div>
        }
      </div>

      <!-- CPR Visual Coach HUD -->
      @if (isCprMetronomeActive()) {
        <div class="p-5 bg-zinc-950 border border-red-900/60 rounded-2xl flex flex-col items-center justify-center gap-4 text-center animate-in slide-in-from-top-4 duration-300">
          <div class="flex items-center gap-4">
            <div class="text-[12px] uppercase font-mono tracking-widest text-zinc-500">Cycle {{ cprCycleCount() }}</div>
            <div class="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
            <div class="text-[12px] uppercase font-mono tracking-widest text-red-500 font-extrabold animate-pulse">
              @if (cprCompressionCount() <= 30) {
                COMPRESSION: {{ cprCompressionCount() }} / 30
              } @else {
                RESCUE BREATH PHASE
              }
            </div>
          </div>
          
          <!-- Bouncing Target Indicator synchronized with compression clicks -->
          <div class="relative w-20 h-20 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border border-red-500/20"></div>
            <div class="rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-75"
                 [class.w-16]="cprCompressionCount() % 2 === 0" [class.h-16]="cprCompressionCount() % 2 === 0" [class.bg-red-650]="cprCompressionCount() % 2 === 0"
                 [class.w-12]="cprCompressionCount() % 2 !== 0" [class.h-12]="cprCompressionCount() % 2 !== 0" [class.bg-red-950]="cprCompressionCount() % 2 !== 0"
                 [class.bg-blue-600]="cprCompressionCount() > 30" [style.transform]="cprCompressionCount() > 30 ? 'scale(1.1)' : 'none'">
              @if (cprCompressionCount() <= 30) {
                ❤️
              } @else {
                💨
              }
            </div>
          </div>
          
          <p class="text-sm font-bold text-zinc-200 max-w-md">{{ cprCoachPrompt() }}</p>
        </div>
      }

      <!-- Three-column grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Column 1: Vitals & Camera Pulse Sensor -->
        <pocket-gull-card title="Emergency Vitals" [icon]="ClinicalIcons.Assessment">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
              <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">Heart Rate</span>
              <div class="text-lg font-extrabold text-red-500 dark:text-red-400">
                {{ state.vitals().hr || '--' }} <span class="text-[12px] font-normal text-gray-500 dark:text-zinc-500">BPM</span>
              </div>
            </div>
            <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
              <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">SpO2</span>
              <div class="text-lg font-extrabold text-blue-500 dark:text-blue-400">
                {{ state.vitals().spO2 || '--' }} <span class="text-[12px] font-normal text-gray-500 dark:text-zinc-500">%</span>
              </div>
            </div>
            <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
              <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">Temperature</span>
              <div class="text-lg font-extrabold text-amber-500 dark:text-amber-400">
                {{ state.vitals().temp || '--' }} <span class="text-[12px] font-normal text-gray-500 dark:text-zinc-500">°F</span>
              </div>
            </div>
            <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
              <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">Blood Pressure</span>
              <div class="text-lg font-extrabold text-purple-500 dark:text-purple-400">
                {{ state.vitals().bp || '--' }}
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 dark:border-zinc-800/80 pt-3 flex flex-col gap-2">
            @if (!isPulseAcquiring()) {
              <button type="button" (click)="startPulseAcquisition()" class="w-full py-2 bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-widest text-[12px] rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98]">
                <span>📷 Acquire pulse via Camera</span>
              </button>
            } @else {
              <div class="p-2 bg-zinc-950 border border-emerald-900/40 rounded-xl flex flex-col gap-2">
                <div class="flex items-center justify-between text-[12px] uppercase font-bold text-emerald-555">
                  <span class="animate-pulse">Hold finger on camera lens...</span>
                  <span>{{ pulseProgress() | number:'1.0-0' }}%</span>
                </div>
                
                <div class="h-6 overflow-hidden flex items-end justify-center gap-[2px] bg-emerald-950/20 rounded">
                  <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="20 + (pulseProgress() % 4 === 0 ? 60 : pulseProgress() % 4 === 1 ? 40 : 15)"></div>
                  <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="30 + (pulseProgress() % 4 === 1 ? 55 : pulseProgress() % 4 === 2 ? 35 : 10)"></div>
                  <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="25 + (pulseProgress() % 4 === 2 ? 65 : pulseProgress() % 4 === 3 ? 45 : 20)"></div>
                  <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="40 + (pulseProgress() % 4 === 3 ? 50 : pulseProgress() % 4 === 0 ? 30 : 15)"></div>
                </div>

                <div class="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div class="bg-emerald-500 h-full transition-all" [style.width.%]="pulseProgress()"></div>
                </div>
                <button type="button" (click)="cancelPulseAcquisition()" class="py-0.5 text-[8.5px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 font-bold">
                  Cancel
                </button>
              </div>
            }
          </div>
        </pocket-gull-card>

        <!-- Column 2: Bystander Actions Timeline -->
        <pocket-gull-card title="Bystander Actions Timeline" [icon]="ClinicalIcons.FollowUp">
          @if (state.clinicalNotes().length === 0) {
            <div class="h-32 flex items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
              <p class="text-[12px] text-gray-400 dark:text-zinc-500 font-medium">No actions logged yet.</p>
            </div>
          } @else {
            <div class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              @for (note of state.clinicalNotes(); track note.id) {
                <div class="p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/60 flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-[12px] text-gray-700 dark:text-zinc-300 font-medium break-words leading-relaxed">{{ note.text }}</p>
                    <span class="text-[8.5px] text-gray-400 dark:text-zinc-500 mt-1 block">{{ note.date }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </pocket-gull-card>

        <!-- Column 3: Patient Emergency Medical ID (ICE) -->
        <pocket-gull-card title="Patient Emergency Medical ID (ICE)" [icon]="ClinicalIcons.Education">
          <div class="space-y-3 text-[12px]">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/85 pb-2">
              <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">Blood Type</span>
              <span class="font-extrabold text-red-500 dark:text-red-400">{{ medicalId().bloodType }}</span>
            </div>
            <div class="flex flex-col gap-0.5 border-b border-gray-100 dark:border-zinc-800/85 pb-2">
              <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">Severe Allergies</span>
              <span class="font-bold text-amber-600 dark:text-amber-450">{{ medicalId().allergies }}</span>
            </div>
            <div class="flex flex-col gap-0.5 border-b border-gray-100 dark:border-zinc-800/85 pb-2">
              <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">Medications</span>
              <span class="text-gray-700 dark:text-zinc-300 leading-normal">{{ medicalId().medications }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">ICE Contact</span>
              <span class="font-bold text-gray-700 dark:text-zinc-300">{{ medicalId().emergencyContact.split(' ')[0] }}</span>
            </div>
          </div>
        </pocket-gull-card>
      </div>

      <!-- GPS SOS Telemetry -->
      <div class="p-4 bg-zinc-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-left flex-1">
          <span class="text-[12px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest block mb-0.5">Emergency SOS Location Telemetry</span>
          @if (isGpsAcquired()) {
            <span class="text-xs font-bold text-gray-700 dark:text-zinc-300">📡 Coords: {{ gpsCoords() }}</span>
          } @else {
            <span class="text-xs text-gray-500 dark:text-zinc-400 font-medium">Location Telemetry has not been shared. Click button to enable.</span>
          }
        </div>
        @if (isGpsAcquired()) {
          <a [href]="smsHref()" class="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-[0_4px_12px_rgba(220,38,38,0.2)] no-underline">
            🚨 Broadcast SOS SMS
          </a>
        } @else {
          <button type="button" (click)="loadLiveGpsCoordinates()" class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-sm">
            📡 Enable & Share GPS Location
          </button>
        }
      </div>

      <!-- Emergency Bypass Rapid Nutritional Triage Telemetry -->
      <app-emergency-nutritional-bypass></app-emergency-nutritional-bypass>

      <!-- First Aid Quick Guides -->
      <pocket-gull-card title="Emergency Offline Treatment Guides" [icon]="ClinicalIcons.Medication">
        <div class="flex flex-wrap gap-2 mb-4 border-b border-gray-150 dark:border-zinc-800/80 pb-3">
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'bleeding' ? null : 'bleeding')"
             [class]="activeFirstAidGuide() === 'bleeding' ? 'bg-red-500/10 text-red-600 border-red-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
             class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
             🩸 Bleeding Control
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'choking' ? null : 'choking')"
             [class]="activeFirstAidGuide() === 'choking' ? 'bg-amber-500/10 text-amber-600 border-amber-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
             class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
             💨 Choking / Heimlich
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'overdose' ? null : 'overdose')"
             [class]="activeFirstAidGuide() === 'overdose' ? 'bg-purple-500/10 text-purple-650 border-purple-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
             class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
             💊 Overdose Response
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'stroke' ? null : 'stroke')"
             [class]="activeFirstAidGuide() === 'stroke' ? 'bg-blue-500/10 text-blue-600 border-blue-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
             class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
             🧠 Stroke (FAST)
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'burns' ? null : 'burns')"
             [class]="activeFirstAidGuide() === 'burns' ? 'bg-orange-500/10 text-orange-600 border-orange-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
             class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
             🔥 Burn Care
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'heat' ? null : 'heat')"
             [class]="activeFirstAidGuide() === 'heat' ? 'bg-amber-600/10 text-amber-700 border-amber-650/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
             class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
             ☀️ Heat Stroke
           </button>
        </div>
        
        <div class="text-[12px] leading-relaxed text-gray-700 dark:text-zinc-300">
          @if (activeFirstAidGuide() === 'bleeding') {
            <div class="space-y-2 animate-in fade-in duration-200">
              @if (patientAgeCategory() === 'infant') {
                <p class="font-bold text-red-500">🩸 Infant Bleeding Control (Direct Pressure Only):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Direct Pressure:</strong> Place sterile gauze or clean cloth on the wound. Apply continuous, firm direct pressure using 2-3 fingers.</li>
                  <li><strong>No Windlass Tourniquets:</strong> Avoid adult windlass tourniquets on infants. Continue firm direct pressure until EMS arrives.</li>
                  <li><strong>Elevation & Warmth:</strong> Elevate the limb slightly if possible. Keep infant warm to prevent hypothermia.</li>
                </ol>
              } @else if (isPatientPregnant()) {
                <p class="font-bold text-red-500">🩸 Severe Bleeding Control (Pregnancy Specific):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Direct Pressure:</strong> Apply firm, continuous direct pressure with sterile dressings.</li>
                  <li><strong>Tourniquet:</strong> If bleeding is life-threatening on a limb, apply a tourniquet 2-3 inches above the wound. Tighten until bleeding stops.</li>
                  <li><strong>Left Lateral Position:</strong> Maintain left lateral tilt (elevate right hip) to prevent supine hypotensive syndrome (uterus pressing inferior vena cava) while managing bleeding.</li>
                </ol>
              } @else {
                <p class="font-bold text-red-500">🩸 Bleeding Control Protocol:</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Direct Pressure:</strong> Place sterile gauze or clean cloth directly on the wound and apply firm, continuous pressure.</li>
                  <li><strong>Elevation:</strong> Elevate the injured limb above the level of the heart if possible.</li>
                  <li><strong>Tourniquet (Severe Bleeding):</strong> If bleeding is life-threatening on a limb and direct pressure fails, apply a tourniquet 2-3 inches above the wound (never on a joint). Tighten until bleeding stops. Record time.</li>
                </ol>
              }
            </div>
          } @else if (activeFirstAidGuide() === 'choking') {
            <div class="space-y-2 animate-in fade-in duration-200">
              @if (patientAgeCategory() === 'infant') {
                <p class="font-bold text-amber-500">💨 Infant Choking Protocol (Back Blows & Chest Thrusts):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Assess:</strong> Look for ineffective cough, blue lips, or silent choking. Do NOT perform abdominal Heimlich thrusts.</li>
                  <li><strong>5 Back Blows:</strong> Support the infant's head and neck. Place face down along your forearm, resting on your thigh with the head lower than the chest. Deliver 5 firm back blows with the heel of your hand between the shoulder blades.</li>
                  <li><strong>5 Chest Thrusts:</strong> Support the head and flip the infant face up along your forearm. Place 2 fingers on the center of the breastbone (just below the nipple line) and compress 5 times. Repeat cycles.</li>
                </ol>
              } @else if (isPatientPregnant()) {
                <p class="font-bold text-amber-500">💨 Pregnancy Choking Protocol (Chest Thrusts):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Assess:</strong> Confirm patient cannot speak or cough. Do NOT perform abdominal Heimlich thrusts.</li>
                  <li><strong>Chest Thrust Position:</strong> Wrap arms around the patient's chest from behind, placing your hands in the center of the breastbone (sternum).</li>
                  <li><strong>Deliver Chest Thrusts:</strong> Pull backward with quick, distinct inward thrusts until the airway is cleared or the patient becomes unresponsive.</li>
                </ol>
              } @else {
                <p class="font-bold text-amber-500">💨 Conscious Choking Protocol (Heimlich):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Confirm Choking:</strong> Ask "Are you choking?" Look for hands clutched to throat, inability to speak/cough.</li>
                  <li><strong>Abdominal Thrusts:</strong> Stand behind the person. Wrap arms around waist. Place thumb side of fist slightly above the navel. Grasp fist with other hand.</li>
                  <li><strong>Deliver Thrusts:</strong> Perform quick, upward and inward thrusts until the object is expelled or the person becomes unconscious.</li>
                </ol>
              }
            </div>
          } @else if (activeFirstAidGuide() === 'overdose') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-bold text-purple-650">💊 Opioid Overdose Response Protocol:</p>
              <ol class="list-decimal pl-5 space-y-1">
                <li><strong>Assess:</strong> Look for slow/stopped breathing, blue/gray lips/nails, unresponsive to sternum rub.</li>
                <li><strong>Call & Narcan:</strong> Administer Naloxone (Narcan) nasal spray (spray entire bottle into one nostril). Call emergency services.</li>
                <li><strong>Rescue Breathing:</strong> If not breathing, perform rescue breathing (1 breath every 5 seconds) and prepare CPR if pulse is absent.</li>
              </ol>
            </div>
          } @else if (activeFirstAidGuide() === 'stroke') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-bold text-blue-500">🧠 Stroke FAST Check Protocol:</p>
              <ul class="space-y-1.5 pl-4">
                <li><strong>F - Face Drooping:</strong> Ask the person to smile. Does one side of the face droop?</li>
                <li><strong>A - Arm Weakness:</strong> Ask the person to raise both arms. Does one arm drift downward?</li>
                <li><strong>S - Speech Difficulty:</strong> Ask the person to repeat a simple phrase. Is their speech slurred or strange?</li>
                <li><strong>T - Time to call 911:</strong> If they show any of these signs, note the time and call emergency services immediately.</li>
              </ul>
            </div>
          } @else if (activeFirstAidGuide() === 'burns') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-bold text-orange-500">🔥 Burn Care Protocol:</p>
              <ol class="list-decimal pl-5 space-y-1">
                <li><strong>Cool Immediately:</strong> Run cool (not cold/ice) water over the burn for 10-20 minutes.</li>
                <li><strong>Cover Loosely:</strong> Cover with a clean, dry, non-adherent dressing or plastic wrap. Do not apply butter, ointments, or toothpaste.</li>
                <li><strong>Demographic Warnings:</strong>
                  @if (patientAgeCategory() === 'infant') {
                    <strong>Infants are at high risk of hypothermia!</strong> Do not cool large burns (over 10% body surface area) for long periods. Keep the baby warm.
                  } @else if (patientAgeCategory() === 'geriatric') {
                    <strong>Elderly skin is thin and heals slowly!</strong> Be extremely gentle; do not pop blisters, and monitor for signs of shock.
                  } @else {
                    Avoid popping blisters. Seek emergency care for third-degree (charred/white skin) or face/hand/joint burns.
                  }
                </li>
              </ol>
            </div>
          } @else if (activeFirstAidGuide() === 'heat') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-bold text-amber-700">☀️ Heat Stroke Protocol:</p>
              <ol class="list-decimal pl-5 space-y-1">
                <li><strong>Assess:</strong> Look for body temperature >103°F, red/hot/dry skin (or heavy sweating), rapid pulse, confusion/unconsciousness.</li>
                <li><strong>Cool Rapidly:</strong> Move patient to shade/AC. Cool with water spray, wet sheets, fan, or ice packs in armpits, groin, and neck.</li>
                <li><strong>Hydration Warning:</strong>
                  @if (patientAgeCategory() === 'infant' || patientAgeCategory() === 'geriatric') {
                    <strong>Do NOT force fluids</strong> if the patient is confused, drowsy, or vomiting, as they may aspirate. Seek immediate EMS transport.
                  } @else {
                    If fully conscious and able to swallow, give sips of cool water or electrolyte drink. Do not give aspirin or acetaminophen.
                  }
                </li>
              </ol>
            </div>
          } @else {
            <p class="text-gray-400 dark:text-zinc-500 italic text-center py-4">Select an emergency guide above for offline step-by-step first aid instructions.</p>
          }
        </div>
      </pocket-gull-card>

      <!-- Centered QR Code and FHIR section -->
      <div class="flex flex-col items-center justify-center mt-4 p-6 bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60 rounded-2xl">
        <h3 class="text-xs font-bold text-gray-900 dark:text-zinc-200 uppercase tracking-widest mb-1 text-center">EMT Handoff QR Code</h3>
        <p class="text-[12px] text-gray-500 dark:text-zinc-400 max-w-sm text-center mb-6">Scan with any mobile device to securely transfer patient vitals and treatment timeline in offline HL7 FHIR format.</p>
        
        @if (qrDataUrl()) {
          <div class="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-6 flex items-center justify-center">
            <img [src]="qrDataUrl()" class="w-48 h-48 sm:w-64 sm:h-64 select-none pointer-events-none" style="image-rendering: pixelated;" alt="EMT Handoff FHIR QR Code" />
          </div>
        } @else {
          <div class="w-48 h-48 sm:w-64 sm:h-64 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center mb-6">
            <p class="text-xs text-gray-400">Loading QR Code...</p>
          </div>
        }
      </div>
    </div>
  `
})
export class EmtHandoffLensTabComponent implements OnDestroy {
  readonly state = inject(PatientStateService);
  readonly patientManager = inject(PatientManagementService);

  // Expose ClinicalIcons for template icon bindings
  readonly ClinicalIcons = ClinicalIcons;

  // CPR Metronome State
  readonly isCprMetronomeActive = signal<boolean>(false);
  readonly cprCompressionCount = signal<number>(0);
  readonly cprCycleCount = signal<number>(1);
  readonly cprCoachPrompt = signal<string>('Prepare chest compressions. Place hands in the center of the chest.');
  private cprIntervalId: ReturnType<typeof setInterval> | null = null;
  private audioCtx: AudioContext | null = null;

  // Pulse Acquisition State
  readonly isPulseAcquiring = signal<boolean>(false);
  readonly pulseProgress = signal<number>(0);
  private pulseAcquireIntervalId: ReturnType<typeof setInterval> | null = null;

  // Demographic Selection State
  readonly patientAgeCategory = signal<'adult' | 'infant' | 'geriatric'>('adult');
  readonly isPatientPregnant = signal<boolean>(false);

  // Quick Actions Accordion / Tab State
  readonly activeFirstAidGuide = signal<'bleeding' | 'choking' | 'overdose' | 'stroke' | 'burns' | 'heat' | null>(null);

  // GPS SOS Telemetry State
  readonly isGpsAcquired = signal<boolean>(false);
  readonly gpsCoords = signal<string>('46.0503° N, 124.0502° W (Oregon Coast Buoy 46050 Boundary)');
  readonly smsHref = computed(() => {
    return `sms:911?body=${encodeURIComponent('Emergency! Bystander first aid in progress at ' + this.gpsCoords())}`;
  });

  // Mock Medical ID / ICE Data
  readonly medicalId = signal({
    bloodType: 'O-Negative (Universal)',
    allergies: 'Penicillin, Sulfonamides, Bee Venom',
    medications: 'Lisinopril 10mg daily, Albuterol inhaler PRN',
    emergencyContact: 'Sarah Gear (Spouse) - 555-019-2834'
  });

  // FHIR Bundle & QR Code Generation
  readonly fhirJsonString = computed(() => {
    const v = this.state.vitals();
    const notes = this.state.clinicalNotes();
    const entry: Array<{ resource: Record<string, unknown> }> = [];

    if (v.hr) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'Heart Rate' },
          valueQuantity: { value: parseFloat(v.hr) || v.hr, unit: 'BPM' }
        }
      });
    }
    if (v.spO2) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'SpO2' },
          valueQuantity: { value: parseFloat(v.spO2) || v.spO2, unit: '%' }
        }
      });
    }
    if (v.temp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'Temp' },
          valueQuantity: { value: parseFloat(v.temp) || v.temp }
        }
      });
    }
    if (v.bp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'BP' },
          valueString: v.bp
        }
      });
    }

    notes.forEach((note) => {
      entry.push({
        resource: {
          resourceType: 'Procedure',
          status: 'completed',
          code: { text: note.text }
        }
      });
    });

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry
    };

    return JSON.stringify(bundle);
  });

  readonly compactFhirJsonString = computed(() => {
    const v = this.state.vitals();
    const notes = this.state.clinicalNotes();
    const entry: Array<{ resource: Record<string, unknown> }> = [];

    if (v.hr) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'HR' },
          valueQuantity: { value: parseFloat(v.hr) || v.hr }
        }
      });
    }
    if (v.spO2) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'SpO2' },
          valueQuantity: { value: parseFloat(v.spO2) || v.spO2 }
        }
      });
    }
    if (v.temp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'Temp' },
          valueQuantity: { value: parseFloat(v.temp) || v.temp }
        }
      });
    }
    if (v.bp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'BP' },
          valueString: v.bp
        }
      });
    }

    notes.forEach((note) => {
      entry.push({
        resource: {
          resourceType: 'Procedure',
          status: 'completed',
          code: { text: note.text }
        }
      });
    });

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry
    };

    return JSON.stringify(bundle);
  });

  readonly qrDataUrl = computed(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    const fullJson = this.fhirJsonString();
    const compactJson = this.compactFhirJsonString();
    
    const fhirStr = fullJson.length < 1200 ? fullJson : compactJson;
    
    try {
      const qr = generate(fhirStr);
      return qr.toDataURL({ scale: 8 });
    } catch (e) {
      console.error('Failed to generate QR Code:', e);
      return '';
    }
  });

  ngOnDestroy(): void {
    this.stopCprMetronome();
    this.cancelPulseAcquisition();
  }

  loadLiveGpsCoordinates(): void {
    this.isGpsAcquired.set(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          this.gpsCoords.set(`${lat}° N, ${lng}° W (Live Device GPS)`);
        },
        (error) => {
          console.warn('[GPS] Geolocation failed or denied, using buoy fallback:', error);
          this.gpsCoords.set('46.0503° N, 124.0502° W (Oregon Coast Buoy 46050 Boundary)');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      this.gpsCoords.set('46.0503° N, 124.0502° W (Oregon Coast Buoy 46050 Boundary)');
    }
  }

  toggleCprMetronome(): void {
    if (this.isCprMetronomeActive()) {
      this.stopCprMetronome();
    } else {
      this.cprCompressionCount.set(0);
      this.cprCycleCount.set(1);
      
      let initialMsg = 'Compressions starting. Push hard and fast in the center of the chest!';
      let speechMsg = 'Start chest compressions. Press hard and fast.';
      
      const age = this.patientAgeCategory();
      const preg = this.isPatientPregnant();

      if (age === 'infant') {
        initialMsg = 'Infant CPR starting. Push 1.5 inches deep using two fingers on breastbone.';
        speechMsg = 'Start infant compressions. Use two fingers on breastbone.';
      } else if (preg) {
        initialMsg = 'Pregnant patient CPR starting. Place hands slightly higher on sternum.';
        speechMsg = 'Start compressions slightly higher on breastbone.';
      } else if (age === 'geriatric') {
        initialMsg = 'Geriatric CPR starting. Push 2 inches. Mindful of rib fracture risk.';
        speechMsg = 'Start elderly compressions. Push firmly but carefully.';
      }

      this.cprCoachPrompt.set(initialMsg);
      this.speakFirstAidPrompt(speechMsg);
      this.startCprMetronome();
    }
  }

  startCprMetronome(): void {
    if (typeof window === 'undefined') return;
    if (this.cprIntervalId) return;

    this.isCprMetronomeActive.set(true);
    const bpm = this.patientAgeCategory() === 'infant' ? 120 : 110;
    const intervalMs = 60000 / bpm;

    this.playCprClick();

    this.cprIntervalId = setInterval(() => {
      this.playCprClick();
    }, intervalMs);
  }

  stopCprMetronome(): void {
    if (this.cprIntervalId) {
      clearInterval(this.cprIntervalId);
      this.cprIntervalId = null;
    }
    this.isCprMetronomeActive.set(false);
    this.cprCompressionCount.set(0);
    if (typeof window !== 'undefined') {
      document.body.classList.remove('cpr-flash');
      window.speechSynthesis?.cancel();
    }
  }

  playCprClick(): void {
    if (typeof window === 'undefined') return;

    document.body.classList.add('cpr-flash');
    setTimeout(() => {
      document.body.classList.remove('cpr-flash');
    }, 100);

    const age = this.patientAgeCategory();
    const preg = this.isPatientPregnant();

    this.cprCompressionCount.update(c => {
      const nextCount = c + 1;
      if (nextCount <= 30) {
        if (nextCount === 1) {
          if (age === 'infant') {
            this.cprCoachPrompt.set('Infant: Compress 1.5" with 2 fingers (120 BPM)');
          } else if (preg) {
            this.cprCoachPrompt.set('Pregnant: Hands slightly higher on breastbone (110 BPM)');
          } else if (age === 'geriatric') {
            this.cprCoachPrompt.set('Geriatric: Compress 2" carefully to avoid fracture (110 BPM)');
          } else {
            this.cprCoachPrompt.set('Adult: Compress 2" in center of chest (110 BPM)');
          }
        } else if (nextCount === 15) {
          this.cprCoachPrompt.set('Keep going! 15 compressions completed.');
        }
        return nextCount;
      } else if (nextCount <= 39) {
        const breathNum = nextCount - 30;
        if (breathNum === 1) {
          if (age === 'infant') {
            this.cprCoachPrompt.set('Stop compressions. Give 2 GENTLE puffs of breath.');
            this.speakFirstAidPrompt('Give gentle puff 1.');
          } else {
            this.cprCoachPrompt.set('Stop compressions. Tilt head & give Breath 1.');
            this.speakFirstAidPrompt('Give breath 1.');
          }
        } else if (breathNum === 5) {
          if (age === 'infant') {
            this.cprCoachPrompt.set('Give gentle puff 2.');
            this.speakFirstAidPrompt('Give gentle puff 2.');
          } else {
            this.cprCoachPrompt.set('Give Breath 2.');
            this.speakFirstAidPrompt('Give breath 2.');
          }
        }
        return nextCount;
      } else {
        this.cprCycleCount.update(cy => cy + 1);
        let resumeMsg = 'Resume compressions!';
        if (preg) {
          resumeMsg = 'Resume chest compressions. Ensure left lateral tilt.';
        }
        this.cprCoachPrompt.set(resumeMsg);
        this.speakFirstAidPrompt('Resume compressions.');
        return 1;
      }
    });

    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      console.warn('[CPR] audio click failed:', e);
    }
  }

  startPulseAcquisition(): void {
    if (this.isPulseAcquiring()) return;
    this.isPulseAcquiring.set(true);
    this.pulseProgress.set(0);

    this.speakFirstAidPrompt('Place finger over camera lens and hold steady.');

    const durationMs = 4000;
    const stepMs = 100;
    const increment = 100 / (durationMs / stepMs);

    this.pulseAcquireIntervalId = setInterval(() => {
      this.pulseProgress.update(p => {
        if (p >= 100) {
          if (this.pulseAcquireIntervalId) {
            clearInterval(this.pulseAcquireIntervalId);
            this.pulseAcquireIntervalId = null;
          }
          this.completePulseAcquisition();
          return 100;
        }
        return p + increment;
      });
    }, stepMs);
  }

  cancelPulseAcquisition(): void {
    if (this.pulseAcquireIntervalId) {
      clearInterval(this.pulseAcquireIntervalId);
      this.pulseAcquireIntervalId = null;
    }
    this.isPulseAcquiring.set(false);
    this.pulseProgress.set(0);
  }

  completePulseAcquisition(): void {
    this.isPulseAcquiring.set(false);
    this.pulseProgress.set(0);
    
    const simulatedHr = Math.floor(72 + Math.random() * 20).toString();
    const simulatedSpO2 = Math.floor(96 + Math.random() * 4).toString();
    const simulatedTemp = (97.8 + Math.random() * 1.5).toFixed(1);
    const simulatedBp = `${Math.floor(115 + Math.random() * 15)}/${Math.floor(75 + Math.random() * 10)}`;

    this.state.vitals.update(v => ({
      ...v,
      hr: simulatedHr,
      spO2: simulatedSpO2,
      temp: simulatedTemp,
      bp: simulatedBp
    }));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.state.clinicalNotes.update(notes => [
      {
        id: Math.random().toString(),
        text: `Acquired Vitals: HR ${simulatedHr} BPM, SpO2 ${simulatedSpO2}%, Temp ${simulatedTemp}°F, BP ${simulatedBp}`,
        date: timestamp,
        sourceLens: 'EMT Handoff'
      },
      ...notes
    ]);

    this.speakFirstAidPrompt(`Vitals acquired. Heart rate ${simulatedHr} beats per minute. Oxygen saturation ${simulatedSpO2} percent.`);
  }

  speakFirstAidPrompt(text: string): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}
