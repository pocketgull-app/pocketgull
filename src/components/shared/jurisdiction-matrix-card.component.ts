import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalJurisdictionMatrixService, IJurisdictionProfile } from '../../services/global-jurisdiction-matrix.service';
import { JurisdictionGuardService } from '../../services/jurisdiction-guard.service';

@Component({
  selector: 'app-jurisdiction-matrix-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl font-sans text-gray-900 dark:text-zinc-100 transition-all">
      
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800/80 pb-4 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
            🌐
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-zinc-50">
                Global & State Jurisdictional Compliance Studio
              </h2>
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                Multi-Sovereignty Engine
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              Real-Time Statutory Privacy, Biometric Consent Mandates, and Medical Device AI Classifications
            </p>
          </div>
        </div>

        <!-- Active Region Badge -->
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-800 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-bold text-gray-800 dark:text-zinc-200">{{ profile().displayName }}</span>
        </div>
      </div>

      <!-- Quick Interactive Region Selector Tabs -->
      <div class="mb-5">
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
          Select Regulatory Jurisdiction & State:
        </div>
        <div class="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 text-xs font-mono">
          
          <!-- US States -->
          <button (click)="selectJurisdiction('US', 'CA')"
                  [class.bg-indigo-600]="isCurrent('US', 'CA')"
                  [class.text-white]="isCurrent('US', 'CA')"
                  [class.text-gray-700]="!isCurrent('US', 'CA')"
                  [class.dark:text-zinc-300]="!isCurrent('US', 'CA')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇺🇸 California (CMIA/CalAIM)
          </button>

          <button (click)="selectJurisdiction('US', 'WA')"
                  [class.bg-indigo-600]="isCurrent('US', 'WA')"
                  [class.text-white]="isCurrent('US', 'WA')"
                  [class.text-gray-700]="!isCurrent('US', 'WA')"
                  [class.dark:text-zinc-300]="!isCurrent('US', 'WA')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇺🇸 Washington (MHMDA)
          </button>

          <button (click)="selectJurisdiction('US', 'IL')"
                  [class.bg-indigo-600]="isCurrent('US', 'IL')"
                  [class.text-white]="isCurrent('US', 'IL')"
                  [class.text-gray-700]="!isCurrent('US', 'IL')"
                  [class.dark:text-zinc-300]="!isCurrent('US', 'IL')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇺🇸 Illinois (BIPA)
          </button>

          <button (click)="selectJurisdiction('US', 'NY')"
                  [class.bg-indigo-600]="isCurrent('US', 'NY')"
                  [class.text-white]="isCurrent('US', 'NY')"
                  [class.text-gray-700]="!isCurrent('US', 'NY')"
                  [class.dark:text-zinc-300]="!isCurrent('US', 'NY')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇺🇸 New York (WCB/MTG)
          </button>

          <button (click)="selectJurisdiction('US', 'TX')"
                  [class.bg-indigo-600]="isCurrent('US', 'TX')"
                  [class.text-white]="isCurrent('US', 'TX')"
                  [class.text-gray-700]="!isCurrent('US', 'TX')"
                  [class.dark:text-zinc-300]="!isCurrent('US', 'TX')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇺🇸 Texas (TMRPA)
          </button>

          <!-- International Nations -->
          <button (click)="selectJurisdiction('EU')"
                  [class.bg-indigo-600]="isCurrent('EU')"
                  [class.text-white]="isCurrent('EU')"
                  [class.text-gray-700]="!isCurrent('EU')"
                  [class.dark:text-zinc-300]="!isCurrent('EU')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇪🇺 European Union (GDPR/AI Act)
          </button>

          <button (click)="selectJurisdiction('GB')"
                  [class.bg-indigo-600]="isCurrent('GB')"
                  [class.text-white]="isCurrent('GB')"
                  [class.text-gray-700]="!isCurrent('GB')"
                  [class.dark:text-zinc-300]="!isCurrent('GB')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇬🇧 United Kingdom (NHS/NICE)
          </button>

          <button (click)="selectJurisdiction('CA')"
                  [class.bg-indigo-600]="isCurrent('CA')"
                  [class.text-white]="isCurrent('CA')"
                  [class.text-gray-700]="!isCurrent('CA')"
                  [class.dark:text-zinc-300]="!isCurrent('CA')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇨🇦 Canada (PHIPA/Law 25)
          </button>

          <button (click)="selectJurisdiction('AU')"
                  [class.bg-indigo-600]="isCurrent('AU')"
                  [class.text-white]="isCurrent('AU')"
                  [class.text-gray-700]="!isCurrent('AU')"
                  [class.dark:text-zinc-300]="!isCurrent('AU')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇦🇺 Australia (TGA/APPs)
          </button>

          <button (click)="selectJurisdiction('JP')"
                  [class.bg-indigo-600]="isCurrent('JP')"
                  [class.text-white]="isCurrent('JP')"
                  [class.text-gray-700]="!isCurrent('JP')"
                  [class.dark:text-zinc-300]="!isCurrent('JP')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇯🇵 Japan (PMDA/Kampo)
          </button>

          <button (click)="selectJurisdiction('IN')"
                  [class.bg-indigo-600]="isCurrent('IN')"
                  [class.text-white]="isCurrent('IN')"
                  [class.text-gray-700]="!isCurrent('IN')"
                  [class.dark:text-zinc-300]="!isCurrent('IN')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border-0">
            🇮🇳 India (ABDM/AYUSH)
          </button>
        </div>
      </div>

      <!-- Main Specifications Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        
        <!-- 1. Privacy & Health Data Law -->
        <div class="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400">Data Privacy & Health Law</span>
            <div class="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1 leading-snug">
              {{ profile().dataPrivacyStatute }}
            </div>
          </div>
          <div class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
            EHR Standard: {{ profile().electronicHealthRecordStandard }}
          </div>
        </div>

        <!-- 2. Clinical AI Classification -->
        <div class="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400">Clinical AI & Device Framework</span>
            <div class="text-xs font-black text-blue-600 dark:text-blue-400 mt-1 leading-snug">
              {{ profile().clinicalAiClassification }}
            </div>
          </div>
          <div class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
            Regulatory Agency: {{ profile().statutoryHealthAgency }}
          </div>
        </div>

        <!-- 3. Biometric & Sensor Mandate -->
        <div class="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400">Biometric & Optical rPPG Mandate</span>
            <div class="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 leading-snug">
              {{ profile().biometricConsentLaw }}
            </div>
          </div>
          <div class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
            Optical Sensor Consent: Active
          </div>
        </div>
      </div>

      <!-- Mandatory Consents Checklist -->
      <div class="mb-5 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <span>🛡️</span> Mandatory Jurisdictional Consents ({{ profile().mandatoryConsents.length }})
          </h4>
          <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
            Zero-Knowledge Verifiable
          </span>
        </div>

        <div class="space-y-2">
          @for (consent of profile().mandatoryConsents; track consent.statute) {
            <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {{ consent.statute }}
                  </span>
                  <span class="text-xs font-bold text-gray-900 dark:text-zinc-100">{{ consent.requirementName }}</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-zinc-400 mt-1">
                  {{ consent.description }}
                </p>
              </div>

              <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded-md shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {{ consent.optInRequired ? 'Opt-In Active' : 'Compliant' }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Statutory Crisis Hotlines & Approved Medical Paradigms -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Emergency Dispatch -->
        <div class="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40">
          <h4 class="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200 mb-2 flex items-center gap-2">
            <span>🚨</span> Statutory Emergency Dispatch
          </h4>
          <div class="space-y-2">
            @for (item of profile().emergencyDispatch; track item.number) {
              <div class="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800">
                <div>
                  <div class="font-bold text-gray-900 dark:text-zinc-100">{{ item.serviceName }}</div>
                  <span class="text-[10px] text-gray-500 dark:text-zinc-400">{{ item.specialtyType }}</span>
                </div>
                <span class="font-mono font-black text-rose-600 dark:text-rose-400 text-sm px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50">
                  {{ item.number }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Approved Multi-Paradigm Scope -->
        <div class="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
          <h4 class="text-xs font-black uppercase tracking-wider text-teal-900 dark:text-teal-200 mb-2 flex items-center gap-2">
            <span>🌿</span> Statutorily Recognized Clinical Paradigms
          </h4>
          <div class="space-y-1.5">
            @for (paradigm of profile().approvedParadigms; track $index) {
              <div class="text-xs text-teal-800 dark:text-teal-300 font-medium flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-teal-100 dark:border-zinc-800">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>{{ paradigm }}</span>
              </div>
            }
          </div>
        </div>

      </div>

    </div>
  `
})
export class JurisdictionMatrixCardComponent {
  private matrixService = inject(GlobalJurisdictionMatrixService);
  private guardService = inject(JurisdictionGuardService);

  readonly profile = this.matrixService.activeProfile;

  public selectJurisdiction(country: string, state?: string): void {
    this.matrixService.setLocation(country, state);
    this.guardService.setCountry(country);
  }

  public isCurrent(country: string, state?: string): boolean {
    const prof = this.profile();
    if (state) {
      return prof.countryCode === country && prof.stateCode === state;
    }
    return prof.countryCode === country;
  }
}
