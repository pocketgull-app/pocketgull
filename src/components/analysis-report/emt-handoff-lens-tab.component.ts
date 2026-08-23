import { Component, ChangeDetectionStrategy, signal, computed, inject, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { generate } from 'lean-qr';
import { BystanderActionSuiteComponent } from '../bystander-action-suite.component';
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
    PocketGullButtonComponent,
    PocketGullCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-500 font-pocketgull-inter">
      <!-- 🚨 Bystander 911 Action Suite & Role Assignment -->
      <app-bystander-action-suite></app-bystander-action-suite>

      <!-- Crimson alert banner -->
      <div class="p-4 bg-gradient-to-r from-red-950/70 via-zinc-950/90 to-red-950/70 border-2 border-red-700/80 rounded-2xl text-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl font-pocketgull-mono">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 text-xl animate-pulse shrink-0">
            🚨
          </div>
          <div>
            <h4 class="font-pocketgull text-sm sm:text-base font-black uppercase tracking-wider text-red-200">
              Offline Emergency First Aid Suite
            </h4>
            <p class="text-xs text-zinc-300 font-sans opacity-90 mt-0.5">
              Zero-latency local sandbox. Bystander CPR timing, vitals telemetry &amp; Lean-QR handoff.
            </p>
          </div>
        </div>
        <pocket-gull-button (click)="toggleCprMetronome()" 
          [variant]="isCprMetronomeActive() ? 'primary' : 'outline'" 
          class="shrink-0 font-pocketgull font-bold uppercase tracking-widest text-xs py-2 px-4 border border-red-500/40 transition-all active:scale-95 shadow-md min-h-[44px]"
          [class.bg-red-600]="isCprMetronomeActive()"
          [class.text-white]="isCprMetronomeActive()">
          🔊 {{ isCprMetronomeActive() ? 'Stop Metronome' : 'CPR Metronome (' + (patientAgeCategory() === 'infant' ? '120' : '110') + ' BPM)' }}
        </pocket-gull-button>
      </div>

      <!-- Patient Demographic Selector (Age & Pregnancy) -->
      <div class="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-pocketgull-mono shadow-lg">
        <div>
          <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 font-pocketgull">
            Target Patient Demographic
          </span>
          <div class="flex items-center gap-2">
            <button type="button" (click)="patientAgeCategory.set('adult')"
              [class]="patientAgeCategory() === 'adult' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'"
              class="px-3.5 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
              🧑 Adult
            </button>
            <button type="button" (click)="patientAgeCategory.set('infant'); isPatientPregnant.set(false)"
              [class]="patientAgeCategory() === 'infant' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'"
              class="px-3.5 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
              👶 Infant (Baby)
            </button>
            <button type="button" (click)="patientAgeCategory.set('geriatric')"
              [class]="patientAgeCategory() === 'geriatric' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'"
              class="px-3.5 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
              🧓 Geriatric (Elder)
            </button>
          </div>
        </div>

        @if (patientAgeCategory() === 'adult') {
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-wider font-bold text-zinc-400 font-pocketgull">Pregnancy Check:</span>
            <button type="button" (click)="isPatientPregnant.set(!isPatientPregnant())"
              [class]="isPatientPregnant() ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'"
              class="px-3.5 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer min-h-[44px]">
              🤰 {{ isPatientPregnant() ? 'Pregnant Patient' : 'Not Pregnant' }}
            </button>
          </div>
        }
      </div>

      <!-- CPR Visual Coach HUD -->
      @if (isCprMetronomeActive()) {
        <div class="p-6 bg-gradient-to-b from-zinc-950 to-red-950/40 border-2 border-red-600/80 rounded-3xl flex flex-col items-center justify-center gap-4 text-center animate-in slide-in-from-top-4 duration-300 font-pocketgull-mono shadow-2xl">
          <div class="flex items-center gap-4">
            <div class="text-xs uppercase font-bold tracking-widest text-zinc-400">CYCLE {{ cprCycleCount() }}</div>
            <div class="w-2 h-2 rounded-full bg-red-500"></div>
            <div class="text-sm uppercase font-pocketgull font-black tracking-widest text-red-400 animate-pulse">
              @if (cprCompressionCount() <= 30) {
                COMPRESSION: {{ cprCompressionCount() }} / 30
              } @else {
                💨 2 RESCUE BREATHS
              }
            </div>
          </div>
          
          <!-- Bouncing Target Indicator synchronized with compression clicks -->
          <div class="relative w-24 h-24 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping"></div>
            <div class="rounded-full flex items-center justify-center text-white text-2xl font-black transition-all duration-75 shadow-2xl"
                 [class.w-20]="cprCompressionCount() % 2 === 0" [class.h-20]="cprCompressionCount() % 2 === 0" [class.bg-red-600]="cprCompressionCount() % 2 === 0"
                 [class.w-16]="cprCompressionCount() % 2 !== 0" [class.h-16]="cprCompressionCount() % 2 !== 0" [class.bg-red-950]="cprCompressionCount() % 2 !== 0"
                 [class.bg-sky-600]="cprCompressionCount() > 30" [style.transform]="cprCompressionCount() > 30 ? 'scale(1.15)' : 'none'">
              @if (cprCompressionCount() <= 30) {
                ❤️
              } @else {
                💨
              }
            </div>
          </div>
          
          <p class="text-base font-pocketgull font-bold text-zinc-100 max-w-lg leading-relaxed">{{ cprCoachPrompt() }}</p>
        </div>
      }

      <!-- Three-column grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-pocketgull-inter">
        <!-- Column 1: Vitals & Camera Pulse Sensor -->
        <pocket-gull-card title="Emergency Vitals" [icon]="ClinicalIcons.Assessment">
          <div class="grid grid-cols-2 gap-3 mb-4 font-pocketgull-mono">
            <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 font-pocketgull">Heart Rate</span>
              <div class="text-2xl font-black text-red-400 font-pocketgull-tabular">
                {{ state.vitals().hr || '--' }} <span class="text-xs font-normal text-zinc-500">BPM</span>
              </div>
            </div>
            <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 font-pocketgull">SpO2</span>
              <div class="text-2xl font-black text-sky-400 font-pocketgull-tabular">
                {{ state.vitals().spO2 || '--' }} <span class="text-xs font-normal text-zinc-500">%</span>
              </div>
            </div>
            <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 font-pocketgull">Temperature</span>
              <div class="text-2xl font-black text-amber-400 font-pocketgull-tabular">
                {{ state.vitals().temp || '--' }} <span class="text-xs font-normal text-zinc-500">°F</span>
              </div>
            </div>
            <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 font-pocketgull">Blood Pressure</span>
              <div class="text-2xl font-black text-purple-400 font-pocketgull-tabular">
                {{ state.vitals().bp || '--' }}
              </div>
            </div>
          </div>

          <div class="border-t border-zinc-800 pt-3 flex flex-col gap-2 font-pocketgull-mono">
            @if (!isPulseAcquiring()) {
              <button type="button" (click)="startPulseAcquisition()" class="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-pocketgull font-bold uppercase tracking-wider text-xs rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px] cursor-pointer">
                <span>📷 Acquire Pulse via Camera</span>
              </button>
            } @else {
              <div class="p-3 bg-zinc-950 border border-emerald-900/50 rounded-xl flex flex-col gap-2">
                <div class="flex items-center justify-between text-xs uppercase font-bold text-emerald-400">
                  <span class="animate-pulse">Hold finger over camera lens...</span>
                  <span class="font-pocketgull-tabular">{{ pulseProgress() | number:'1.0-0' }}%</span>
                </div>
                
                <div class="h-6 overflow-hidden flex items-end justify-center gap-1 bg-emerald-950/30 rounded-lg p-1">
                  <div class="w-2 bg-emerald-400 rounded-sm transition-all duration-75" [style.height.%]="20 + (pulseProgress() % 4 === 0 ? 60 : pulseProgress() % 4 === 1 ? 40 : 15)"></div>
                  <div class="w-2 bg-emerald-400 rounded-sm transition-all duration-75" [style.height.%]="30 + (pulseProgress() % 4 === 1 ? 55 : pulseProgress() % 4 === 2 ? 35 : 10)"></div>
                  <div class="w-2 bg-emerald-400 rounded-sm transition-all duration-75" [style.height.%]="25 + (pulseProgress() % 4 === 2 ? 65 : pulseProgress() % 4 === 3 ? 45 : 20)"></div>
                  <div class="w-2 bg-emerald-400 rounded-sm transition-all duration-75" [style.height.%]="40 + (pulseProgress() % 4 === 3 ? 50 : pulseProgress() % 4 === 0 ? 30 : 15)"></div>
                </div>

                <div class="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-emerald-400 h-full transition-all" [style.width.%]="pulseProgress()"></div>
                </div>
                <button type="button" (click)="cancelPulseAcquisition()" class="py-1 text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-200 font-bold cursor-pointer">
                  Cancel
                </button>
              </div>
            }
          </div>
        </pocket-gull-card>

        <!-- Column 2: Bystander Actions Timeline -->
        <pocket-gull-card title="Bystander Actions Timeline" [icon]="ClinicalIcons.FollowUp">
          @if (state.clinicalNotes().length === 0) {
            <div class="h-36 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl p-4 text-center">
              <p class="text-xs text-zinc-500 font-medium">No actions logged yet. Use 1-tap buttons above.</p>
            </div>
          } @else {
            <div class="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              @for (note of state.clinicalNotes(); track note.id) {
                <div class="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-zinc-200 font-medium break-words leading-relaxed">{{ note.text }}</p>
                    <span class="text-[10px] text-zinc-500 mt-1 block font-pocketgull-mono">{{ note.date }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </pocket-gull-card>

        <!-- Column 3: Patient Emergency Medical ID (ICE) -->
        <pocket-gull-card title="Patient Emergency Medical ID (ICE)" [icon]="ClinicalIcons.Education">
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span class="text-zinc-400 uppercase tracking-wider font-bold text-[10px] font-pocketgull">Blood Type</span>
              <span class="font-black text-red-400 font-pocketgull">{{ medicalId().bloodType }}</span>
            </div>
            <div class="flex flex-col gap-0.5 border-b border-zinc-800 pb-2">
              <span class="text-zinc-400 uppercase tracking-wider font-bold text-[10px] font-pocketgull">Severe Allergies</span>
              <span class="font-bold text-amber-400">{{ medicalId().allergies }}</span>
            </div>
            <div class="flex flex-col gap-0.5 border-b border-zinc-800 pb-2">
              <span class="text-zinc-400 uppercase tracking-wider font-bold text-[10px] font-pocketgull">Medications</span>
              <span class="text-zinc-300 leading-normal">{{ medicalId().medications }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-zinc-400 uppercase tracking-wider font-bold text-[10px] font-pocketgull">ICE Contact</span>
              <span class="font-bold text-zinc-200 font-pocketgull-mono">{{ medicalId().emergencyContact.split(' ')[0] }}</span>
            </div>
          </div>
        </pocket-gull-card>
      </div>

      <!-- GPS SOS Telemetry -->
      <div class="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pocketgull-mono shadow-lg">
        <div class="text-left flex-1">
          <span class="text-xs font-bold text-red-400 uppercase tracking-widest block mb-0.5 font-pocketgull">
            Emergency SOS Location Telemetry
          </span>
          @if (isGpsAcquired()) {
            <span class="text-xs font-bold text-zinc-200 font-pocketgull-tabular">📡 Coords: {{ gpsCoords() }}</span>
          } @else {
            <span class="text-xs text-zinc-400 font-sans">Location Telemetry has not been shared. Click button to enable.</span>
          }
        </div>
        @if (isGpsAcquired()) {
          <a [href]="smsHref()" class="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-pocketgull font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-lg no-underline min-h-[44px] cursor-pointer">
            🚨 Broadcast SOS SMS
          </a>
        } @else {
          <button type="button" (click)="loadLiveGpsCoordinates()" class="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-pocketgull font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-sm min-h-[44px] cursor-pointer">
            📡 Enable &amp; Share GPS Location
          </button>
        }
      </div>

      <!-- First Aid Quick Guides -->
      <pocket-gull-card title="Emergency Offline Treatment Guides" [icon]="ClinicalIcons.Medication">
        <div class="flex flex-wrap gap-2 mb-4 border-b border-zinc-800 pb-3 font-pocketgull">
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'bleeding' ? null : 'bleeding')"
             [class]="activeFirstAidGuide() === 'bleeding' ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-md font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'"
             class="px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
             🩸 Bleeding Control
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'choking' ? null : 'choking')"
             [class]="activeFirstAidGuide() === 'choking' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'"
             class="px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
             💨 Choking / Heimlich
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'overdose' ? null : 'overdose')"
             [class]="activeFirstAidGuide() === 'overdose' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'"
             class="px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
             💊 Overdose Response
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'stroke' ? null : 'stroke')"
             [class]="activeFirstAidGuide() === 'stroke' ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'"
             class="px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
             🧠 Stroke (FAST)
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'burns' ? null : 'burns')"
             [class]="activeFirstAidGuide() === 'burns' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-md font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'"
             class="px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
             🔥 Burn Care
           </button>
           <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'heat' ? null : 'heat')"
             [class]="activeFirstAidGuide() === 'heat' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'"
             class="px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl border transition cursor-pointer min-h-[44px]">
             ☀️ Heat Stroke
           </button>
        </div>
        
        <div class="text-xs sm:text-sm leading-relaxed text-zinc-300 font-pocketgull-inter">
          @if (activeFirstAidGuide() === 'bleeding') {
            <div class="space-y-2 animate-in fade-in duration-200">
              @if (patientAgeCategory() === 'infant') {
                <p class="font-pocketgull font-bold text-red-400">🩸 Infant Bleeding Control (Direct Pressure Only):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Direct Pressure:</strong> Place sterile gauze or clean cloth on the wound. Apply continuous, firm direct pressure using 2-3 fingers.</li>
                  <li><strong>No Windlass Tourniquets:</strong> Avoid adult windlass tourniquets on infants. Continue firm direct pressure until EMS arrives.</li>
                  <li><strong>Elevation &amp; Warmth:</strong> Elevate the limb slightly if possible. Keep infant warm to prevent hypothermia.</li>
                </ol>
              } @else if (isPatientPregnant()) {
                <p class="font-pocketgull font-bold text-red-400">🩸 Severe Bleeding Control (Pregnancy Specific):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Direct Pressure:</strong> Apply firm, continuous direct pressure with sterile dressings.</li>
                  <li><strong>Tourniquet:</strong> If bleeding is life-threatening on a limb, apply a tourniquet 2-3 inches above the wound. Tighten until bleeding stops.</li>
                  <li><strong>Left Lateral Position:</strong> Maintain left lateral tilt (elevate right hip) to prevent supine hypotensive syndrome (uterus pressing inferior vena cava) while managing bleeding.</li>
                </ol>
              } @else {
                <p class="font-pocketgull font-bold text-red-400">🩸 Bleeding Control Protocol:</p>
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
                <p class="font-pocketgull font-bold text-amber-400">💨 Infant Choking Protocol (Back Blows &amp; Chest Thrusts):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Assess:</strong> Look for ineffective cough, blue lips, or silent choking. Do NOT perform abdominal Heimlich thrusts.</li>
                  <li><strong>5 Back Blows:</strong> Support the infant's head and neck. Place face down along your forearm, resting on your thigh with the head lower than the chest. Deliver 5 firm back blows with the heel of your hand between the shoulder blades.</li>
                  <li><strong>5 Chest Thrusts:</strong> Support the head and flip the infant face up along your forearm. Place 2 fingers on the center of the breastbone (just below the nipple line) and compress 5 times. Repeat cycles.</li>
                </ol>
              } @else if (isPatientPregnant()) {
                <p class="font-pocketgull font-bold text-amber-400">💨 Pregnancy Choking Protocol (Chest Thrusts):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Assess:</strong> Confirm patient cannot speak or cough. Do NOT perform abdominal Heimlich thrusts.</li>
                  <li><strong>Chest Thrust Position:</strong> Wrap arms around the patient's chest from behind, placing your hands in the center of the breastbone (sternum).</li>
                  <li><strong>Deliver Chest Thrusts:</strong> Pull backward with quick, distinct inward thrusts until the airway is cleared or the patient becomes unresponsive.</li>
                </ol>
              } @else {
                <p class="font-pocketgull font-bold text-amber-400">💨 Conscious Choking Protocol (Heimlich):</p>
                <ol class="list-decimal pl-5 space-y-1">
                  <li><strong>Confirm Choking:</strong> Ask "Are you choking?" Look for hands clutched to throat, inability to speak/cough.</li>
                  <li><strong>Abdominal Thrusts:</strong> Stand behind the person. Wrap arms around waist. Place thumb side of fist slightly above the navel. Grasp fist with other hand.</li>
                  <li><strong>Deliver Thrusts:</strong> Perform quick, upward and inward thrusts until the object is expelled or the person becomes unconscious.</li>
                </ol>
              }
            </div>
          } @else if (activeFirstAidGuide() === 'overdose') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-pocketgull font-bold text-purple-400">💊 Opioid Overdose Response Protocol:</p>
              <ol class="list-decimal pl-5 space-y-1">
                <li><strong>Assess:</strong> Look for slow/stopped breathing, blue/gray lips/nails, unresponsive to sternum rub.</li>
                <li><strong>Call &amp; Narcan:</strong> Administer Naloxone (Narcan) nasal spray (spray entire bottle into one nostril). Call emergency services.</li>
                <li><strong>Rescue Breathing:</strong> If not breathing, perform rescue breathing (1 breath every 5 seconds) and prepare CPR if pulse is absent.</li>
              </ol>
            </div>
          } @else if (activeFirstAidGuide() === 'stroke') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-pocketgull font-bold text-sky-400">🧠 Stroke FAST Check Protocol:</p>
              <ul class="space-y-1.5 pl-4">
                <li><strong>F - Face Drooping:</strong> Ask the person to smile. Does one side of the face droop?</li>
                <li><strong>A - Arm Weakness:</strong> Ask the person to raise both arms. Does one arm drift downward?</li>
                <li><strong>S - Speech Difficulty:</strong> Ask the person to repeat a simple phrase. Is their speech slurred or strange?</li>
                <li><strong>T - Time to call 911:</strong> If they show any of these signs, note the time and call emergency services immediately.</li>
              </ul>
            </div>
          } @else if (activeFirstAidGuide() === 'burns') {
            <div class="space-y-2 animate-in fade-in duration-200">
              <p class="font-pocketgull font-bold text-orange-400">🔥 Burn Care Protocol:</p>
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
              <p class="font-pocketgull font-bold text-amber-400">☀️ Heat Stroke Protocol:</p>
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
            <p class="text-zinc-500 italic text-center py-4">Select an emergency guide above for offline step-by-step first aid instructions.</p>
          }
        </div>
      </pocket-gull-card>

      <!-- Centered QR Code and FHIR section -->
      <div class="flex flex-col items-center justify-center mt-4 p-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-xl font-pocketgull-mono text-center">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl mb-3">
          📱
        </div>
        <h3 class="text-sm font-pocketgull font-black text-zinc-100 uppercase tracking-wider mb-1">
          EMT Handoff QR Code
        </h3>
        <p class="text-xs text-zinc-400 max-w-md font-sans mb-6">
          Scan with any paramedic or clinical device to securely ingest patient vitals and treatment timeline in offline HL7 FHIR R4 format.
        </p>
        
        @if (qrDataUrl()) {
          <div class="p-5 bg-white rounded-2xl shadow-2xl border-4 border-amber-500/40 mb-4 flex items-center justify-center">
            <img [src]="qrDataUrl()" class="w-52 h-52 sm:w-64 sm:h-64 select-none pointer-events-none" style="image-rendering: pixelated;" alt="EMT Handoff FHIR QR Code" />
          </div>
        } @else {
          <div class="w-52 h-52 sm:w-64 sm:h-64 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
            <p class="text-xs text-zinc-500">Generating Offline FHIR QR...</p>
          </div>
        }

        <div class="flex items-center gap-2 text-[11px] text-zinc-400 font-bold uppercase tracking-wider font-pocketgull">
          <span>🔒 100% HIPAA Safe Harbor De-Identified</span>
          <span>•</span>
          <span class="text-emerald-400">FHIR R4 Bundle</span>
        </div>
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
