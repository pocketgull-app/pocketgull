import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { CoppaPrivacyShieldService } from '../services/coppa-privacy-shield.service';
import { IPatient } from '../services/patient.types';
import { ClinicalMoERouterService, IPatientTriageEvaluation } from '../services/clinical-moe-router.service';

@Component({
  selector: 'app-patient-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-[#F4F4F5] dark:bg-zinc-950 z-[60] overflow-y-auto w-full h-full flex flex-col no-print font-sans transition-colors duration-300">
      
      <!-- New Patient Modal -->
      @if (showNewPatientModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Patient Chart</h2>
            
            <form (ngSubmit)="saveNewPatient()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" [(ngModel)]="newPatientForm.name" name="name" required
                       class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all">
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Age</label>
                  <input type="number" [(ngModel)]="newPatientForm.age" name="age" required min="1" max="150"
                         class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Gender</label>
                  <select [(ngModel)]="newPatientForm.gender" name="gender" required
                          class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Pediatric COPPA & Guardian Proxy Attestation Gate (< 13 years) -->
              @if (isPediatricMinor()) {
                <div class="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <div class="flex items-center gap-2">
                    <span class="text-base">🔒</span>
                    <div>
                      <h3 class="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        FTC COPPA & Guardian Proxy Shield
                      </h3>
                      <p class="text-[11px] text-emerald-600 dark:text-emerald-400 leading-tight">
                        Patient is a minor (&lt; 13y). Guardian authorization is required.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Authorizing Relationship
                    </label>
                    <select [(ngModel)]="guardianRelationship" name="guardianRelationship"
                            class="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-emerald-500/30 rounded-lg text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="Parent">Parent</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Authorized Clinician">Authorized Clinician</option>
                    </select>
                  </div>

                  <label class="flex items-start gap-2 cursor-pointer pt-1">
                    <input type="checkbox" [(ngModel)]="hasGuardianAttested" name="hasGuardianAttested"
                           class="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500">
                    <span class="text-[11px] text-gray-700 dark:text-zinc-300 leading-tight">
                      I confirm I am the parent, legal guardian, or treating clinician authorized to manage this minor's care plan under FTC 16 C.F.R. § 312.
                    </span>
                  </label>
                </div>
              }

              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Primary Complaint / Goals</label>
                <textarea [(ngModel)]="newPatientForm.goals" name="goals" rows="3"
                          placeholder="What is the primary reason for the clinical evaluation today?"
                          class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-6">
                <button type="button" (click)="showNewPatientModal.set(false)"
                        class="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" [disabled]="!isFormValid()"
                        class="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-sm hover:shadow hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 cursor-pointer">
                  Create Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Sticky Command Header -->
      <header class="sticky top-0 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800/80 px-4 sm:px-8 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 z-20 shadow-xs">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl shrink-0 shadow-xs">
            🚨
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight font-sans">
                Clinical Triage & Command Roster
              </h1>
              <span class="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/40">
                ⚡ SMoE Pre-Gated
              </span>
              <span class="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                ESI 1–5 Stratified
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 font-sans">
              Real-time Emergency Severity Index triage, physiological vital alerts, and Sparse Mixture of Experts UI slot allocation.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Switcher: Triage vs Classic Directory -->
          <div class="flex items-center border border-gray-300 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 text-xs font-bold uppercase font-mono shadow-xs">
            <button
              type="button"
              (click)="viewMode.set('triage')"
              [class]="viewMode() === 'triage'
                ? 'px-3 py-1.5 rounded-md bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs cursor-pointer font-black'
                : 'px-3 py-1.5 rounded-md text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer'">
              🚨 Triage Matrix
            </button>
            <button
              type="button"
              (click)="viewMode.set('directory')"
              [class]="viewMode() === 'directory'
                ? 'px-3 py-1.5 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs cursor-pointer font-black'
                : 'px-3 py-1.5 rounded-md text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer'">
              📋 Roster Grid
            </button>
          </div>

          <button (click)="openNewPatientModal()" 
                  class="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg shadow-sm hover:shadow active:scale-95 transition-all text-xs font-bold uppercase font-mono cursor-pointer">
            <span>+</span>
            <span>New Patient</span>
          </button>

          <!-- Close / Return Button if a patient is already selected -->
          @if (patientService.selectedPatientId()) {
            <button (click)="closeModal()" 
                    class="p-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    title="Close Triage Roster & Return to Active Chart">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          }
        </div>
      </header>

      <!-- Main Container -->
      <main class="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">

        <!-- TRIAGE SITUATION VIEW -->
        @if (viewMode() === 'triage') {
          <!-- Acuity Stratification KPI Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <span class="text-[10.5px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Total Patients</span>
              <div class="mt-1 flex items-baseline justify-between">
                <span class="text-2xl font-black text-gray-950 dark:text-white font-mono">{{ triageCounts().total }}</span>
                <span class="text-[10px] font-bold text-gray-500 font-mono">100% Enrolled</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 shadow-xs flex flex-col justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span class="text-[10.5px] font-mono font-black uppercase tracking-wider text-red-700 dark:text-red-300">ESI-1 STAT</span>
              </div>
              <div class="mt-1 flex items-baseline justify-between">
                <span class="text-2xl font-black text-red-700 dark:text-red-200 font-mono">{{ triageCounts().esi1 }}</span>
                <span class="text-[10px] font-bold text-red-600 dark:text-red-400 font-mono">Immediate</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 shadow-xs flex flex-col justify-between">
              <span class="text-[10.5px] font-mono font-black uppercase tracking-wider text-orange-700 dark:text-orange-300">ESI-2 Emergent</span>
              <div class="mt-1 flex items-baseline justify-between">
                <span class="text-2xl font-black text-orange-700 dark:text-orange-200 font-mono">{{ triageCounts().esi2 }}</span>
                <span class="text-[10px] font-bold text-orange-600 dark:text-orange-400 font-mono">&lt; 10 min</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-xs flex flex-col justify-between">
              <span class="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">ESI-3 Urgent</span>
              <div class="mt-1 flex items-baseline justify-between">
                <span class="text-2xl font-black text-amber-700 dark:text-amber-200 font-mono">{{ triageCounts().esi3 }}</span>
                <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">Multi-Resource</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-xs flex flex-col justify-between">
              <span class="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">ESI-4 Less Urgent</span>
              <div class="mt-1 flex items-baseline justify-between">
                <span class="text-2xl font-black text-emerald-700 dark:text-emerald-200 font-mono">{{ triageCounts().esi4 }}</span>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">Single Resource</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <span class="text-[10.5px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">ESI-5 Non-Urgent</span>
              <div class="mt-1 flex items-baseline justify-between">
                <span class="text-2xl font-black text-zinc-800 dark:text-zinc-200 font-mono">{{ triageCounts().esi5 }}</span>
                <span class="text-[10px] font-bold text-zinc-500 font-mono">Maintenance</span>
              </div>
            </div>
          </div>

          <!-- Controls: Search & Acuity Filter Tabs -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <!-- Search -->
            <div class="relative flex-1 max-w-md">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text"
                     [(ngModel)]="searchQuery"
                     placeholder="Search patient name, condition, or SMoE expert..."
                     class="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono">
            </div>

            <!-- Filter Buttons -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
              <button
                type="button"
                (click)="acuityFilter.set('all')"
                [class]="acuityFilter() === 'all'
                  ? 'px-3 py-1.5 rounded-lg bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold shadow-xs cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:text-gray-900 dark:hover:text-white cursor-pointer'">
                All ({{ triageCounts().total }})
              </button>
              <button
                type="button"
                (click)="acuityFilter.set('critical')"
                [class]="acuityFilter() === 'critical'
                  ? 'px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold shadow-xs cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer'">
                🔴 Critical ESI 1–2 ({{ triageCounts().critical }})
              </button>
              <button
                type="button"
                (click)="acuityFilter.set('urgent')"
                [class]="acuityFilter() === 'urgent'
                  ? 'px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-xs cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer'">
                🟡 Urgent ESI 3 ({{ triageCounts().esi3 }})
              </button>
              <button
                type="button"
                (click)="acuityFilter.set('stable')"
                [class]="acuityFilter() === 'stable'
                  ? 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold shadow-xs cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer'">
                🟢 Stable ESI 4–5 ({{ triageCounts().esi4 + triageCounts().esi5 }})
              </button>
            </div>
          </div>

          <!-- TRIAGE PATIENT CARDS STREAM -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            @for (triage of filteredTriagedPatients(); track triage.patient.id) {
              <div
                class="group relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-lg flex flex-col justify-between gap-4"
                [class]="triage.borderClass">
                
                <!-- Card Header -->
                <div class="space-y-2.5">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div class="flex items-center gap-3">
                      <!-- Avatar -->
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black font-mono shadow-inner shrink-0"
                           [class]="triage.badgeBg">
                        {{ triage.patient.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h2 class="text-base font-bold text-gray-950 dark:text-white font-sans group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {{ triage.patient.name }}
                          </h2>
                          @if (isSentinelCase(triage.patient)) {
                            <span class="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded border border-amber-500/30">
                              🔦 Sentinel
                            </span>
                          }
                        </div>
                        <div class="text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                          ID: {{ triage.patient.id }} &bull; {{ triage.patient.age }}y &bull; {{ triage.patient.gender }}
                        </div>
                      </div>
                    </div>

                    <!-- ESI & NEWS2 Badges -->
                    <div class="flex flex-col items-end gap-1 font-mono">
                      <span class="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shadow-xs" [class]="triage.badgeBg">
                        {{ triage.esiLabel }}
                      </span>
                      <div class="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-zinc-400 font-semibold">
                        <span>NEWS2: <strong class="text-gray-900 dark:text-white">{{ triage.news2Score }}</strong></span>
                        &bull;
                        <span>Wait: <strong>{{ triage.targetMaxWaitMinutes === 0 ? 'Immediate' : '< ' + triage.targetMaxWaitMinutes + 'm' }}</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- Clinical Priority Rationale & Outliers -->
                  <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950/70 border border-gray-100 dark:border-zinc-800/80 text-xs text-gray-700 dark:text-zinc-300 space-y-1.5">
                    <p class="leading-relaxed">
                      <span class="font-bold text-gray-900 dark:text-white">Triage Rationale:</span>
                      {{ triage.priorityRationale }}
                    </p>

                    @if (triage.vitalsSummary.hasCriticalOutlier) {
                      <div class="flex flex-wrap items-center gap-1.5 pt-1">
                        <span class="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400">Outliers:</span>
                        @for (outlier of triage.vitalsSummary.criticalOutliers; track outlier) {
                          <span class="px-2 py-0.5 rounded bg-red-500/15 text-red-700 dark:text-red-300 text-[10px] font-mono font-bold border border-red-500/30">
                            ⚠️ {{ outlier }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Physiological Telemetry Strip -->
                  <div class="grid grid-cols-4 gap-2 text-[11px] font-mono bg-gray-50/80 dark:bg-zinc-950/40 p-2 rounded-xl border border-gray-100 dark:border-zinc-800/50">
                    <div>
                      <span class="text-gray-400 dark:text-zinc-500 text-[10px] block">BP</span>
                      <strong class="text-gray-900 dark:text-zinc-200">{{ triage.vitalsSummary.bp }}</strong>
                    </div>
                    <div>
                      <span class="text-gray-400 dark:text-zinc-500 text-[10px] block">HR</span>
                      <strong class="text-gray-900 dark:text-zinc-200">{{ triage.vitalsSummary.hr }}</strong>
                    </div>
                    <div>
                      <span class="text-gray-400 dark:text-zinc-500 text-[10px] block">SpO2</span>
                      <strong [class.text-amber-500]="triage.vitalsSummary.spO2.includes('92') || triage.vitalsSummary.spO2.includes('93')" class="text-emerald-600 dark:text-emerald-400">{{ triage.vitalsSummary.spO2 }}</strong>
                    </div>
                    <div>
                      <span class="text-gray-400 dark:text-zinc-500 text-[10px] block">Temp</span>
                      <strong class="text-gray-900 dark:text-zinc-200">{{ triage.vitalsSummary.temp }}</strong>
                    </div>
                  </div>

                  <!-- Preexisting Conditions snippet -->
                  @if (triage.patient.preexistingConditions && triage.patient.preexistingConditions.length > 0) {
                    <div class="flex flex-wrap gap-1 text-[10.5px]">
                      @for (c of triage.patient.preexistingConditions.slice(0, 3); track c) {
                        <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700/60">
                          {{ c }}
                        </span>
                      }
                      @if (triage.patient.preexistingConditions.length > 3) {
                        <span class="px-1.5 py-0.5 text-gray-400 dark:text-zinc-500 text-[10px] font-mono">
                          +{{ triage.patient.preexistingConditions.length - 3 }} more
                        </span>
                      }
                    </div>
                  }

                  <!-- Companion / Proxy & Language Access Ribbons -->
                  @if (triage.accompaniedBy || triage.languageAccess) {
                    <div class="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                      @if (triage.accompaniedBy) {
                        <div class="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <span>👤</span>
                          <span class="font-bold">With Patient:</span>
                          <span>{{ triage.accompaniedBy.label }}</span>
                        </div>
                      }
                      @if (triage.languageAccess) {
                        <div class="px-2 py-0.5 rounded-md border flex items-center gap-1"
                             [class]="triage.languageAccess.interpreterNeeded 
                               ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold'
                               : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60'">
                          <span>{{ triage.languageAccess.interpreterNeeded ? '🗣️' : '🌐' }}</span>
                          @if (triage.languageAccess.interpreterNeeded) {
                            <span class="font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Interpreter Required:</span>
                          }
                          <span>{{ triage.languageAccess.preferredLanguage }}</span>
                          <span class="opacity-75 font-normal">({{ triage.languageAccess.modality }})</span>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- SMoE Dynamic Slot Pre-Allocation Strip -->
                <div class="pt-3 border-t border-gray-100 dark:border-zinc-800/60 space-y-2.5 font-mono">
                  <div class="flex items-center justify-between text-[10.5px]">
                    <span class="font-bold text-gray-600 dark:text-zinc-400 flex items-center gap-1">
                      <span>⚡</span>
                      <span>SMoE Pre-Gated Slots:</span>
                    </span>
                    <span class="text-[9.5px] text-teal-600 dark:text-teal-400 font-bold uppercase">
                      Softmax Top-2
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <!-- Primary Slot -->
                    <div class="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                      <div class="flex items-center gap-1.5 truncate">
                        <span>{{ triage.predictedTopExperts[0].icon }}</span>
                        <span class="font-bold text-teal-900 dark:text-teal-200 truncate text-[11px]">{{ triage.predictedTopExperts[0].name }}</span>
                      </div>
                      <span class="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 shrink-0 ml-1">{{ triage.predictedTopExperts[0].probabilityPercent }}%</span>
                    </div>

                    <!-- Secondary Slot -->
                    <div class="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
                      <div class="flex items-center gap-1.5 truncate">
                        <span>{{ triage.predictedTopExperts[1].icon }}</span>
                        <span class="font-bold text-indigo-900 dark:text-indigo-200 truncate text-[11px]">{{ triage.predictedTopExperts[1].name }}</span>
                      </div>
                      <span class="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 shrink-0 ml-1">{{ triage.predictedTopExperts[1].probabilityPercent }}%</span>
                    </div>
                  </div>

                  <!-- Cross Attention Synapse if active -->
                  @if (triage.crossAttentionSynapse) {
                    <div class="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <span class="shrink-0">⚡</span>
                      <span class="font-bold">Synapse Bridge:</span>
                      <span class="truncate">{{ triage.crossAttentionSynapse.title }}</span>
                    </div>
                  }

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      (click)="selectChart(triage.patient.id, true)"
                      class="flex-1 min-h-[38px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                      title="Admit patient directly into the Synoptic Canvas">
                      <span>🌐</span>
                      <span>Admit to Synoptic Canvas</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      (click)="selectChart(triage.patient.id, false)"
                      class="px-3 min-h-[38px] bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all active:scale-[0.98] cursor-pointer"
                      title="Open Standard Medical Chart">
                      Chart
                    </button>
                  </div>
                </div>

              </div>
            }

            @if (filteredTriagedPatients().length === 0) {
              <div class="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/20">
                <span class="text-3xl mb-2">🔍</span>
                <h3 class="text-base font-bold text-gray-900 dark:text-zinc-300">No triage patients match current filter</h3>
                <p class="text-xs mt-1">Try clearing your search query or selecting "All".</p>
              </div>
            }
          </div>
        }

        <!-- STANDARD DIRECTORY GRID VIEW -->
        @if (viewMode() === 'directory') {
          <div class="space-y-4">
            <!-- Search -->
            <div class="relative max-w-xl">
              <svg class="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text"
                     [(ngModel)]="searchQuery"
                     placeholder="Search clinical roster by name or ID..."
                     class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1C1C1C] border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl shadow-xs text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (patient of filteredPatients(); track patient.id) {
                <div (click)="selectChart(patient.id, false)"
                     class="group relative bg-white dark:bg-[#1C1C1C] rounded-2xl p-6 border shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                     [class.border-amber-300]="isSentinelCase(patient)"
                     [class.dark:border-amber-900]="isSentinelCase(patient)"
                     [class.border-gray-200]="!isSentinelCase(patient)"
                     [class.dark:border-zinc-800]="!isSentinelCase(patient)"
                     [class.hover:border-teal-500]="true">
                  <!-- Active Indicator Line -->
                  <div class="absolute left-0 top-6 bottom-6 w-1 rounded-r opacity-0 group-hover:opacity-100 transition-opacity bg-teal-500"></div>
                  
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ patient.name }}</h3>
                        @if (isSentinelCase(patient)) {
                          <span class="px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 rounded uppercase tracking-wider font-mono">🔦 Sentinel</span>
                        }
                      </div>
                      <div class="text-xs font-mono text-gray-500 dark:text-zinc-500 mt-0.5">ID: {{ patient.id }}</div>
                    </div>
                    <div class="w-10 h-10 rounded-xl text-sm font-bold shadow-inner flex items-center justify-center font-mono"
                         [class.bg-amber-100]="isSentinelCase(patient)"
                         [class.dark:bg-amber-950/40]="isSentinelCase(patient)"
                         [class.text-amber-800]="isSentinelCase(patient)"
                         [class.dark:text-amber-300]="isSentinelCase(patient)"
                         [class.bg-gray-100]="!isSentinelCase(patient)"
                         [class.dark:bg-zinc-800]="!isSentinelCase(patient)"
                         [class.text-gray-600]="!isSentinelCase(patient)"
                         [class.dark:text-zinc-300]="!isSentinelCase(patient)">
                      {{ patient.name.charAt(0) }}
                    </div>
                  </div>

                  <div class="space-y-2 text-xs border-t border-gray-100 dark:border-zinc-800/50 pt-4 font-mono">
                    <div class="flex justify-between">
                      <span class="text-gray-500 dark:text-zinc-400">Age:</span>
                      <span class="font-medium text-gray-900 dark:text-zinc-200">{{ patient.age }}y</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500 dark:text-zinc-400">Vitals (BP):</span>
                      <span class="font-medium text-gray-900 dark:text-zinc-200">{{ patient.vitals?.bp || '--/--' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500 dark:text-zinc-400">Last Visit:</span>
                      <span class="font-medium text-gray-900 dark:text-zinc-200">{{ patient.lastVisit || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
              }

              @if (filteredPatients().length === 0) {
                <div class="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/20 font-mono">
                  <h3 class="text-base font-medium text-gray-900 dark:text-zinc-300">No patients found</h3>
                  <p class="text-xs mt-1">Try adjusting your search query.</p>
                </div>
              }
            </div>
          </div>
        }

      </main>
    </div>
  `
})
export class PatientDirectoryComponent {
  readonly patientService = inject(PatientManagementService);
  private readonly patientState = inject(PatientStateService);
  readonly coppaShield = inject(CoppaPrivacyShieldService);
  readonly moeRouter = inject(ClinicalMoERouterService);

  // Close directory output
  closeDirectory = output<void>();

  // Local state
  searchQuery = signal<string>('');
  showNewPatientModal = signal<boolean>(false);
  viewMode = signal<'triage' | 'directory'>('triage');
  acuityFilter = signal<'all' | 'critical' | 'urgent' | 'stable'>('all');
  
  newPatientForm = {
    name: '',
    age: 35,
    gender: 'Other' as IPatient['gender'],
    goals: ''
  };

  guardianRelationship: 'Parent' | 'Legal Guardian' | 'Authorized Clinician' = 'Parent';
  hasGuardianAttested = false;

  isSentinelCase(patient: any): boolean {
    return !!patient && (patient.name.toLowerCase().includes('sentinel') || ['p004', 'p005', 'p006', 'p007'].includes(patient.id));
  }

  isPediatricMinor(): boolean {
    return this.coppaShield.isUnderAgeThreshold(this.newPatientForm.age);
  }

  isFormValid(): boolean {
    if (!this.newPatientForm.name || !this.newPatientForm.age) return false;
    if (this.isPediatricMinor() && !this.hasGuardianAttested) return false;
    return true;
  }
  
  // Computed projection of all patients evaluated for Triage
  readonly allTriagedPatients = computed<IPatientTriageEvaluation[]>(() => {
    return this.moeRouter.evaluateAllPatientsTriage(this.patientService.patients());
  });

  // Filtered triaged patients
  readonly filteredTriagedPatients = computed<IPatientTriageEvaluation[]>(() => {
    let list = this.allTriagedPatients();
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.acuityFilter();

    if (filter === 'critical') {
      list = list.filter(t => t.esiLevel <= 2);
    } else if (filter === 'urgent') {
      list = list.filter(t => t.esiLevel === 3);
    } else if (filter === 'stable') {
      list = list.filter(t => t.esiLevel >= 4);
    }

    if (query) {
      list = list.filter(t => 
        t.patient.name.toLowerCase().includes(query) || 
        t.patient.id.toLowerCase().includes(query) ||
        t.esiLabel.toLowerCase().includes(query) ||
        (t.patient.preexistingConditions || []).some(c => c.toLowerCase().includes(query)) ||
        t.predictedTopExperts.some(e => e.name.toLowerCase().includes(query))
      );
    }

    return list;
  });

  // Triage count statistics
  readonly triageCounts = computed(() => {
    const list = this.allTriagedPatients();
    return {
      total: list.length,
      esi1: list.filter(t => t.esiLevel === 1).length,
      esi2: list.filter(t => t.esiLevel === 2).length,
      esi3: list.filter(t => t.esiLevel === 3).length,
      esi4: list.filter(t => t.esiLevel === 4).length,
      esi5: list.filter(t => t.esiLevel === 5).length,
      critical: list.filter(t => t.esiLevel <= 2).length,
    };
  });

  // Standard directory projection
  readonly filteredPatients = computed(() => {
    const rawData = this.patientService.patients();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return rawData;
    
    return rawData.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query)
    );
  });

  selectChart(id: string, launchSmoe: boolean = false) {
    this.patientService.selectPatient(id);
    if (launchSmoe) {
      this.moeRouter.analysisViewMode.set('canvas');
    }
    this.closeDirectory.emit();
  }

  closeModal() {
    this.closeDirectory.emit();
  }

  openNewPatientModal() {
    this.newPatientForm = { name: '', age: 35, gender: 'Other', goals: '' };
    this.guardianRelationship = 'Parent';
    this.hasGuardianAttested = false;
    this.showNewPatientModal.set(true);
  }

  async saveNewPatient() {
    if (!this.isFormValid()) return;
    
    // If minor, record guardian attestation in compliance audit trail
    if (this.isPediatricMinor()) {
      this.patientState.recordGuardianProxyAttestation(
        this.guardianRelationship,
        `Authorized intake for minor patient ${this.newPatientForm.name} (${this.newPatientForm.age}y)`
      );
    }

    // Create via service and capture the auto-generated ID
    const newId = await this.patientService.createNewPatient();
    
    if (newId) {
      this.patientService.updatePatientDetails(newId, {
        name: this.newPatientForm.name,
        age: this.newPatientForm.age,
        gender: this.newPatientForm.gender,
        patientGoals: this.newPatientForm.goals
      });
      this.selectChart(newId, true);
    }
    
    this.showNewPatientModal.set(false);
  }
}
