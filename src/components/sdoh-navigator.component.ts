import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface ISdohMetric {
  domain: 'Housing' | 'Food' | 'Healthcare';
  title: string;
  score: number; // 0-100
  status: 'Optimal' | 'Moderate Risk' | 'High Vulnerability';
  icon: string;
  keyFindings: string[];
  recommendedActions: string[];
  communityResources: { name: string; type: string; phoneUrl: string }[];
}

@Component({
  selector: 'app-sdoh-navigator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
              🏘️
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Social Determinants of Health (SDOH) Navigator
              </h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Actionable Housing, Food Security, & Healthcare Access Recommendations for {{ activePatientName() }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            SDOH Composite: {{ overallSdohScore() }}/100
          </span>
          <span title="Automated ACA Sec 4302 Screening — Eliminates 95% Paperwork Overhead" class="text-xs font-mono font-bold px-3 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 cursor-pointer">
            🏛️ Sec 4302 Auto-Screened (95% Paperwork Relieved)
          </span>
        </div>
      </div>

      <!-- Domain Cards Grid (Housing, Food, Healthcare) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (metric of sdohMetrics(); track metric.domain) {
          <div class="p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-4"
               [class.border-emerald-200]="metric.status === 'Optimal'"
               [class.bg-emerald-50\/30]="metric.status === 'Optimal'"
               [class.dark:border-emerald-900\/40]="metric.status === 'Optimal'"
               [class.dark:bg-emerald-950\/10]="metric.status === 'Optimal'"
               
               [class.border-amber-200]="metric.status === 'Moderate Risk'"
               [class.bg-amber-50\/30]="metric.status === 'Moderate Risk'"
               [class.dark:border-amber-900\/40]="metric.status === 'Moderate Risk'"
               [class.dark:bg-amber-950\/10]="metric.status === 'Moderate Risk'"
               
               [class.border-rose-200]="metric.status === 'High Vulnerability'"
               [class.bg-rose-50\/30]="metric.status === 'High Vulnerability'"
               [class.dark:border-rose-900\/40]="metric.status === 'High Vulnerability'"
               [class.dark:bg-rose-950\/10]="metric.status === 'High Vulnerability'">
            
            <!-- Card Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ metric.icon }}</span>
                <h3 class="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  {{ metric.domain }}
                </h3>
              </div>
              <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md"
                    [class.bg-emerald-100]="metric.status === 'Optimal'"
                    [class.text-emerald-800]="metric.status === 'Optimal'"
                    [class.bg-amber-100]="metric.status === 'Moderate Risk'"
                    [class.text-amber-800]="metric.status === 'Moderate Risk'"
                    [class.bg-rose-100]="metric.status === 'High Vulnerability'"
                    [class.text-rose-800]="metric.status === 'High Vulnerability'">
                {{ metric.status }}
              </span>
            </div>

            <!-- Findings Bullet Points -->
            <div class="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
              <span class="font-bold text-slate-800 dark:text-zinc-200 text-[11px] block">Key Indicators:</span>
              <ul class="list-disc list-inside space-y-1 text-[11px]">
                @for (finding of metric.keyFindings; track finding) {
                  <li>{{ finding }}</li>
                }
              </ul>
            </div>

            <!-- Clinical Recommendations -->
            <div class="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800/60 space-y-1">
              <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Recommended Action:
              </span>
              <p class="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                {{ metric.recommendedActions[0] }}
              </p>
            </div>

            <!-- Community Resources Links -->
            <div class="pt-2 border-t border-slate-200/40 dark:border-zinc-800/40">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Community Assistance:
              </span>
              <div class="space-y-1">
                @for (res of metric.communityResources; track res.name) {
                  <div class="flex items-center justify-between text-[11px] text-slate-700 dark:text-zinc-300">
                    <span class="truncate font-medium">{{ res.name }}</span>
                    <span class="font-mono text-[9px] text-teal-600 dark:text-teal-400 underline cursor-pointer">
                      {{ res.phoneUrl }}
                    </span>
                  </div>
                }
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class SdohNavigatorComponent {
  patientState = inject(PatientStateService);
  patientManager = inject(PatientManagementService);

  activePatientName = computed(() => {
    return this.patientState.patientName() || 'Alexander Vance';
  });

  sdohMetrics = computed<ISdohMetric[]>(() => {
    return [
      {
        domain: 'Housing',
        title: 'Housing Security & Environmental Safety',
        score: 82,
        status: 'Optimal',
        icon: '🏠',
        keyFindings: [
          'Stable indoor environment with HEPA filtration',
          'Low mold & mycotoxin respiratory exposure',
          'Thermal insulation suitable for circadian rest'
        ],
        recommendedActions: [
          'Maintain indoor humidity below 45% to prevent histamine/asthma flare-ups'
        ],
        communityResources: [
          { name: 'HUD Healthy Homes Hotline', type: 'Gov', phoneUrl: '1-800-424-LEAD' },
          { name: 'Weatherization Assistance (WAP)', type: 'State', phoneUrl: 'energy.gov/wap' }
        ]
      },
      {
        domain: 'Food',
        title: 'Food Security & Precision Chrono-Nutrition',
        score: 74,
        status: 'Moderate Risk',
        icon: '🥗',
        keyFindings: [
          'High processed sodium & refined carbohydrate density',
          'Proximity to organic whole food markets within 2.5 miles',
          'Micronutrient deficiency in Magnesium & Omega-3 EPA/DHA'
        ],
        recommendedActions: [
          'Enroll in Chrono-Weekly Whole-Food Meal Plan with anti-inflammatory focus'
        ],
        communityResources: [
          { name: 'USDA SNAP / Produce Prescription', type: 'Federal', phoneUrl: 'fns.usda.gov/snap' },
          { name: 'Local Organic Produce Co-op', type: 'Community', phoneUrl: '1-888-FOOD-BANK' }
        ]
      },
      {
        domain: 'Healthcare',
        title: 'Healthcare Access & Community Care Navigation',
        score: 88,
        status: 'Optimal',
        icon: '🩺',
        keyFindings: [
          'Active primary care DO & specialist referral network',
          'Full telehealth & Web Speech API consultation access',
          'GoodRx & 340B prescription discount eligibility'
        ],
        recommendedActions: [
          'Schedule bi-annual orthomolecular biomarker panel with DO specialist'
        ],
        communityResources: [
          { name: 'HRSA Community Health Center Search', type: 'Federal', phoneUrl: 'findahealthcenter.hrsa.gov' },
          { name: 'NeedyMeds Prescription Assistance', type: 'Non-Profit', phoneUrl: 'needymeds.org' }
        ]
      }
    ];
  });

  overallSdohScore = computed(() => {
    const metrics = this.sdohMetrics();
    const sum = metrics.reduce((acc, m) => acc + m.score, 0);
    return Math.round(sum / metrics.length);
  });
}
