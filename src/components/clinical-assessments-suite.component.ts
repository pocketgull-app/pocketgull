import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalAssessmentsService } from '../services/clinical-assessments/clinical-assessments.service';
import { AssessmentType, IQuestionItem, ISeverityTier, IAssessmentDefinition } from '../services/clinical-assessments/types';
import { getAssessment } from '../services/clinical-assessments/assessment-registry';

@Component({
  selector: 'app-clinical-assessments-suite',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-300">
      <!-- Header Suite Card with 3D Double-Click Flip State Machine -->
      <div class="relative perspective-1000 group cursor-pointer"
           (dblclick)="toggleHeaderFlip($event)"
           title="Double-click to flip over for Motivational Interviewing (OARS) & Plain-Language Rationale">
        
        <div [class.rotate-y-180]="isHeaderFlipped()"
             class="relative w-full transition-transform duration-500 transform-style-3d">

          <!-- FRONT FACE: Quantitative Assessment Telemetry -->
          <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm backface-hidden">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Clinical & Life Sovereignty Instrumentation</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-850">
                  {{ currentAssessment().badge }}
                </span>
                <span (click)="toggleHeaderFlip($event)"
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition cursor-pointer select-none">
                  dblclick 🔄 flip OARS
                </span>
              </div>
              <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ currentAssessment().title }}</h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                {{ currentAssessment().patientEducation }}
              </p>
              @if (currentAssessment().citation) {
                <div class="mt-2 text-[10px] text-zinc-400 font-mono italic">
                  Ref: {{ currentAssessment().citation }}
                </div>
              }
            </div>

            <div class="flex flex-col items-center shrink-0 p-4 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl w-full md:w-64 text-center shadow-inner">
              <div class="text-xs uppercase font-bold text-zinc-400 mb-1 font-mono">
                Active: {{ currentAssessment().shortName }}
              </div>
              <span class="text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                {{ currentScore() }}<span class="text-sm font-normal text-zinc-400">/{{ currentMaxScore() }}</span>
              </span>
              <div class="mt-2 w-full">
                <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300 w-full justify-center" [class]="currentTier().colorClass">
                  {{ currentTier().label }}
                </span>
              </div>
            </div>
          </div>

          <!-- BACK FACE: Motivational Interviewing (OARS) & Plain-Language Rationale -->
          <div class="p-6 bg-indigo-950 text-white border border-indigo-500/40 rounded-2xl flex flex-col justify-between gap-4 shadow-2xl absolute inset-0 rotate-y-180 backface-hidden backdrop-blur-xl font-sans">
            <div>
              <div class="flex items-center justify-between border-b border-indigo-800 pb-2 mb-3 font-mono text-xs">
                <div class="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider">
                  <span>💬</span>
                  <span>Motivational Interviewing (OARS) & Patient Guidance</span>
                </div>
                <span class="text-[10px] text-indigo-400 font-mono">dblclick flip back</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="space-y-1.5">
                  <span class="font-bold text-amber-300 font-mono block uppercase">💬 Open-Ended Reflection Prompt (OARS):</span>
                  <p class="text-indigo-100 italic leading-relaxed">
                    "{{ currentMotivationalPrompt() }}"
                  </p>
                </div>

                <div class="space-y-1.5">
                  <span class="font-bold text-emerald-300 font-mono block uppercase">🧑‍🤝‍🧑 Plain-Language Patient Literacy Tip:</span>
                  <p class="text-indigo-100 leading-relaxed">
                    {{ currentAssessment().patientEducation }}
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-2 border-t border-indigo-900 font-mono text-[10px] text-indigo-400 flex justify-between items-center">
              <span>Cognitive Load Shield Active</span>
              <span>Double-click anytime to return to scores</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Tab Navigation Row -->
      <div class="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto gap-1">
        <button (click)="svc.activeTab.set('growthyself')"
          [class.border-b-2]="svc.activeTab() === 'growthyself'"
          [class.border-emerald-500]="svc.activeTab() === 'growthyself'"
          [class.text-emerald-600]="svc.activeTab() === 'growthyself'"
          [class.text-zinc-400]="svc.activeTab() !== 'growthyself'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-emerald-50/50 dark:bg-emerald-950/20">
          <span>🌱 Grow-Thyself (Life Index)</span>
        </button>

        <button (click)="svc.activeTab.set('phq9')"
          [class.border-b-2]="svc.activeTab() === 'phq9'"
          [class.border-sky-500]="svc.activeTab() === 'phq9'"
          [class.text-sky-600]="svc.activeTab() === 'phq9'"
          [class.text-zinc-400]="svc.activeTab() !== 'phq9'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🧠 PHQ-9 (Depression)</span>
        </button>

        <button (click)="svc.activeTab.set('gad7')"
          [class.border-b-2]="svc.activeTab() === 'gad7'"
          [class.border-emerald-500]="svc.activeTab() === 'gad7'"
          [class.text-emerald-600]="svc.activeTab() === 'gad7'"
          [class.text-zinc-400]="svc.activeTab() !== 'gad7'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🌿 GAD-7 (Anxiety)</span>
        </button>

        <button (click)="svc.activeTab.set('isi')"
          [class.border-b-2]="svc.activeTab() === 'isi'"
          [class.border-amber-500]="svc.activeTab() === 'isi'"
          [class.text-amber-600]="svc.activeTab() === 'isi'"
          [class.text-zinc-400]="svc.activeTab() !== 'isi'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🌙 ISI (Insomnia)</span>
        </button>

        <button (click)="svc.activeTab.set('cvsq')"
          [class.border-b-2]="svc.activeTab() === 'cvsq'"
          [class.border-cyan-500]="svc.activeTab() === 'cvsq'"
          [class.text-cyan-600]="svc.activeTab() === 'cvsq'"
          [class.text-zinc-400]="svc.activeTab() !== 'cvsq'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>👁️ CVS-Q (Vision Strain)</span>
        </button>

        <button (click)="svc.activeTab.set('mbi')"
          [class.border-b-2]="svc.activeTab() === 'mbi'"
          [class.border-rose-500]="svc.activeTab() === 'mbi'"
          [class.text-rose-600]="svc.activeTab() === 'mbi'"
          [class.text-zinc-400]="svc.activeTab() !== 'mbi'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🔥 MBI (Burnout)</span>
        </button>

        <button (click)="svc.activeTab.set('cssrs')"
          [class.border-b-2]="svc.activeTab() === 'cssrs'"
          [class.border-rose-500]="svc.activeTab() === 'cssrs'"
          [class.text-rose-600]="svc.activeTab() === 'cssrs'"
          [class.text-zinc-400]="svc.activeTab() !== 'cssrs'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🚨 C-SSRS (Safety)</span>
        </button>

        <button (click)="svc.activeTab.set('ros14')"
          [class.border-b-2]="svc.activeTab() === 'ros14'"
          [class.border-indigo-500]="svc.activeTab() === 'ros14'"
          [class.text-indigo-600]="svc.activeTab() === 'ros14'"
          [class.text-zinc-400]="svc.activeTab() !== 'ros14'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🩺 ROS-14 (Review Systems)</span>
        </button>

        <button (click)="svc.activeTab.set('phq15')"
          [class.border-b-2]="svc.activeTab() === 'phq15'"
          [class.border-purple-500]="svc.activeTab() === 'phq15'"
          [class.text-purple-600]="svc.activeTab() === 'phq15'"
          [class.text-zinc-400]="svc.activeTab() !== 'phq15'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>⚡ PHQ-15 (Somatic)</span>
        </button>

        <button (click)="svc.activeTab.set('prapare')"
          [class.border-b-2]="svc.activeTab() === 'prapare'"
          [class.border-teal-500]="svc.activeTab() === 'prapare'"
          [class.text-teal-600]="svc.activeTab() === 'prapare'"
          [class.text-zinc-400]="svc.activeTab() !== 'prapare'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🏘️ PRAPARE (SDOH Risk)</span>
        </button>

        <button (click)="svc.activeTab.set('ayurveda')"
          [class.border-b-2]="svc.activeTab() === 'ayurveda'"
          [class.border-orange-500]="svc.activeTab() === 'ayurveda'"
          [class.text-orange-600]="svc.activeTab() === 'ayurveda'"
          [class.text-zinc-400]="svc.activeTab() !== 'ayurveda'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🛕 Ayurveda (Tridosha)</span>
        </button>

        <button (click)="svc.activeTab.set('tcm')"
          [class.border-b-2]="svc.activeTab() === 'tcm'"
          [class.border-red-500]="svc.activeTab() === 'tcm'"
          [class.text-red-600]="svc.activeTab() === 'tcm'"
          [class.text-zinc-400]="svc.activeTab() !== 'tcm'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>☯️ TCM (Shi Wen)</span>
        </button>

        <button (click)="svc.activeTab.set('moca')"
          [class.border-b-2]="svc.activeTab() === 'moca'"
          [class.border-cyan-500]="svc.activeTab() === 'moca'"
          [class.text-cyan-600]="svc.activeTab() === 'moca'"
          [class.text-zinc-400]="svc.activeTab() !== 'moca'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🧩 MoCA (Cognition)</span>
        </button>

        <button (click)="svc.activeTab.set('auditc')"
          [class.border-b-2]="svc.activeTab() === 'auditc'"
          [class.border-amber-500]="svc.activeTab() === 'auditc'"
          [class.text-amber-600]="svc.activeTab() === 'auditc'"
          [class.text-zinc-400]="svc.activeTab() !== 'auditc'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🍷 AUDIT-C (Alcohol)</span>
        </button>

        <button (click)="svc.activeTab.set('sarcf')"
          [class.border-b-2]="svc.activeTab() === 'sarcf'"
          [class.border-emerald-500]="svc.activeTab() === 'sarcf'"
          [class.text-emerald-600]="svc.activeTab() === 'sarcf'"
          [class.text-zinc-400]="svc.activeTab() !== 'sarcf'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>💪 SARC-F (Sarcopenia)</span>
        </button>

        <button (click)="svc.activeTab.set('dn4')"
          [class.border-b-2]="svc.activeTab() === 'dn4'"
          [class.border-rose-500]="svc.activeTab() === 'dn4'"
          [class.text-rose-600]="svc.activeTab() === 'dn4'"
          [class.text-zinc-400]="svc.activeTab() !== 'dn4'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>⚡ DN4 (Neuropathic Pain)</span>
        </button>

        <button (click)="svc.activeTab.set('sibi')"
          [class.border-b-2]="svc.activeTab() === 'sibi'"
          [class.border-orange-500]="svc.activeTab() === 'sibi'"
          [class.text-orange-600]="svc.activeTab() === 'sibi'"
          [class.text-zinc-400]="svc.activeTab() !== 'sibi'"
          class="pb-3 px-4 font-extrabold uppercase tracking-widest text-[11px] outline-none transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
          <span>🦷 SIBI (Teledentistry &amp; Cardio)</span>
        </button>
      </div>

      <!-- Action Control Row -->
      <div class="flex flex-wrap gap-3">
        <button (click)="commitAssessment()"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>💾 Commit {{ svc.activeTab().toUpperCase() }} to FHIR Timeline</span>
        </button>

        @if (svc.activeTab() === 'gad7' && svc.gad7Score() >= 5) {
          <button (click)="triggerVagalBiofeedback()"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer animate-bounce">
            <span>🫁 Trigger 0.1Hz Vagal HRV Pacer</span>
          </button>
        }

        <button (click)="svc.resetAssessment(svc.activeTab())"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs transition active:scale-95 cursor-pointer">
          <span>🗑️ Clear Tab Answers</span>
        </button>
      </div>

      @if (toastMessage()) {
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>✅ {{ toastMessage() }}</span>
          <button (click)="toastMessage.set(null)" class="text-xs text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      }

      <!-- Questions List Card -->
      <div class="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-6 shadow-sm">
        <div class="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-3">
          <div>
            <strong class="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1">Clinical Protocol Recommendation:</strong>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">{{ currentTier().recommendation }}</p>
          </div>

          <!-- MBI Burnout Subscale Breakdown Bar -->
          @if (svc.activeTab() === 'mbi') {
            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3 text-xs font-mono flex-wrap">
              <span class="font-bold uppercase text-zinc-400">Burnout Subscale Indices:</span>
              <span class="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold">🧠 Emotional Exhaustion (EE): {{ svc.mbiBreakdown().ee }}/18</span>
              <span class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold">⚡ Depersonalization (DP): {{ svc.mbiBreakdown().dp }}/15</span>
              <span class="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-bold">🛡️ Personal Accomplishment Strain: {{ svc.mbiBreakdown().pa }}/15</span>
            </div>
          }

          <!-- Grow-Thyself Life Domain Breakdown Bar -->
          @if (svc.activeTab() === 'growthyself') {
            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3 text-xs font-mono flex-wrap">
              <span class="font-bold uppercase text-zinc-400">Master Life Domain Breakdown:</span>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">🎯 Purpose: {{ svc.growThyselfBreakdown().purpose }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-bold">🫁 Somatic: {{ svc.growThyselfBreakdown().somatic }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold">🍏 Nutrition: {{ svc.growThyselfBreakdown().nutrition }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold">❤️ Emotional: {{ svc.growThyselfBreakdown().emotional }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold">🧠 Cognitive: {{ svc.growThyselfBreakdown().cognitive }}</span>
            </div>
          }

          <!-- Ayurvedic Doshic Breakdown Bar -->
          @if (svc.activeTab() === 'ayurveda') {
            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3 text-xs font-mono">
              <span class="font-bold uppercase text-zinc-400">Tridosha Profile:</span>
              <span class="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-bold">💨 Vata: {{ svc.doshaBreakdown().vata }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 font-bold">🔥 Pitta: {{ svc.doshaBreakdown().pitta }}</span>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">⛰️ Kapha: {{ svc.doshaBreakdown().kapha }}</span>
            </div>
          }

          <!-- TCM Ba Gang Breakdown Bar -->
          @if (svc.activeTab() === 'tcm') {
            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3 text-xs font-mono flex-wrap">
              <span class="font-bold uppercase text-zinc-400">Ba Gang Profile:</span>
              <span class="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 font-bold">Yang: {{ svc.tcmBreakdown().yang }}</span>
              <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-bold">Yin: {{ svc.tcmBreakdown().yin }}</span>
              <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">Qi: {{ svc.tcmBreakdown().qi }}</span>
              <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold">Blood: {{ svc.tcmBreakdown().blood }}</span>
              <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold">Heat: {{ svc.tcmBreakdown().heat }}</span>
              <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-bold">Cold: {{ svc.tcmBreakdown().cold }}</span>
            </div>
          }
        </div>

        <!-- Dynamic Questions Stream -->
        <div class="flex flex-col gap-4">
          @for (item of currentQuestions(); track item.id) {
            <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-zinc-300 dark:hover:border-zinc-700">
              <div class="flex items-start gap-3 flex-1">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-bold shrink-0">
                  {{ item.id }}
                </span>
                <div>
                  @if (item.category) {
                    <span class="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-0.5">{{ item.category }}</span>
                  }
                  @if (item.zCode) {
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 inline-block mb-1">
                      ICD-10 {{ item.zCode }}
                    </span>
                  }
                  <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">{{ item.question }}</p>
                </div>
              </div>

              <!-- Option Buttons / Radio Group -->
              <div class="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0 self-end md:self-center w-full md:w-auto">
                @for (opt of item.options; track opt.value) {
                  <button (click)="svc.setAnswer(svc.activeTab(), item.id, opt.value)"
                    [class.bg-indigo-50]="getAnswer(item.id) === opt.value"
                    [class.border-indigo-400]="getAnswer(item.id) === opt.value"
                    [class.dark:bg-indigo-950\/15]="getAnswer(item.id) === opt.value"
                    [class.dark:border-indigo-850]="getAnswer(item.id) === opt.value"
                    [class.border-zinc-200]="getAnswer(item.id) !== opt.value"
                    [class.dark:border-zinc-850]="getAnswer(item.id) !== opt.value"
                    class="flex items-center text-left p-2.5 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition text-xs cursor-pointer">
                    
                    <!-- Radio dot indicator -->
                    <span class="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 mr-2.5"
                      [class.border-indigo-600]="getAnswer(item.id) === opt.value"
                      [class.border-zinc-300]="getAnswer(item.id) !== opt.value"
                      [class.dark:border-zinc-700]="getAnswer(item.id) !== opt.value">
                      @if (getAnswer(item.id) === opt.value) {
                        <span class="w-1.5 h-1.5 rounded-sm bg-indigo-600"></span>
                      }
                    </span>

                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-baseline">
                        <span class="font-bold text-zinc-800 dark:text-zinc-200 leading-none truncate">{{ opt.label }}</span>
                        <span class="text-[9px] font-mono text-zinc-400 leading-none pl-1">({{ opt.value }})</span>
                      </div>
                    </div>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ClinicalAssessmentsSuiteComponent {
  svc = inject(ClinicalAssessmentsService);

  readonly isHeaderFlipped = signal<boolean>(false);
  private lastHeaderFlipTime = 0;

  toggleHeaderFlip(event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastHeaderFlipTime < 200) return;
    this.lastHeaderFlipTime = now;
    this.isHeaderFlipped.update(v => !v);
  }

  readonly toastMessage = signal<string | null>(null);

  readonly currentAssessment = computed<IAssessmentDefinition>(() => getAssessment(this.svc.activeTab()));
  readonly currentTitle = computed(() => this.currentAssessment().title);
  readonly currentQuestions = computed<IQuestionItem[]>(() => this.currentAssessment().questions);
  readonly currentScore = computed(() => this.svc.currentScore());
  readonly currentMaxScore = computed(() => this.currentAssessment().maxScore);
  readonly currentTier = computed<ISeverityTier>(() => this.svc.currentTier());
  readonly currentMotivationalPrompt = computed(() => {
    const def = this.currentAssessment();
    return def.motivationalPrompt ? def.motivationalPrompt(this.currentScore(), this.currentTier()) : `Assessment score is ${this.currentScore()}/${def.maxScore}.`;
  });

  getAnswer(questionId: number): number | undefined {
    return this.svc.answersMap()[this.svc.activeTab()]?.[questionId];
  }

  commitAssessment() {
    const payload = this.svc.commitToTimeline(this.svc.activeTab());
    if (payload) {
      this.toastMessage.set(`${payload.title} (Score: ${payload.totalScore}/${payload.maxScore} — ${payload.severityLabel}) committed to FHIR Patient Timeline.`);
      setTimeout(() => this.toastMessage.set(null), 6000);
    }
  }

  triggerVagalBiofeedback() {
    window.dispatchEvent(new CustomEvent('somatic-grounding-activate'));
    this.toastMessage.set('Triggered 0.1 Hz Vagal HRV Biofeedback pacing for autonomic stabilization.');
    setTimeout(() => this.toastMessage.set(null), 5000);
  }
}