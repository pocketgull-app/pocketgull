import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentinelSurveillanceService } from '../services/sentinel-surveillance.service';

@Component({
  selector: 'app-public-health-sentinel-suite',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-3">
        <div>
          <span class="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">Global Health & Epidemiological Layer</span>
          <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            📡 WHO & CDC Public Health Sentinel Suite
          </h2>
        </div>
        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            WHO EWARS / CDC NWSS SYNC
          </span>
        </div>
      </div>

      <!-- 4 Missions Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Mission 1: WHO EWARS & CDC Wastewater Outbreak Radar (6 cols) -->
        <div class="lg:col-span-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🌊</span> Mission 1: EWARS & CDC Wastewater Outbreak Radar
              </h3>
              <span class="text-[10px] font-mono text-zinc-500">CDC NWSS Station #402</span>
            </div>

            @if (surveillance.ewarsAlerts().length === 0) {
              <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                No active wastewater surge alerts reported for current zip code.
              </div>
            } @else {
              <div class="space-y-3">
                @for (alert of surveillance.ewarsAlerts(); track alert.id) {
                  <div class="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/60 hover:border-zinc-700 transition-colors">
                    <div class="flex items-start justify-between gap-2 mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full" [class.bg-red-500]="alert.surgeStatus === 'Active Surge'" [class.bg-amber-400]="alert.surgeStatus === 'Monitoring'"></span>
                        <h4 class="font-bold text-white text-xs tracking-tight">{{ alert.pathogen }}</h4>
                      </div>
                      <span [class]="riskBadgeClass(alert.riskToPatient)" class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wide">
                        {{ alert.riskToPatient }} RISK
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
                      <div class="p-2 rounded bg-zinc-900/60 border border-zinc-800/40">
                        <span class="text-[9px] text-zinc-500 block uppercase">Viral Density</span>
                        <strong class="text-indigo-300 font-bold">{{ alert.viralCopyCount }}</strong>
                      </div>
                      <div class="p-2 rounded bg-zinc-900/60 border border-zinc-800/40">
                        <span class="text-[9px] text-zinc-500 block uppercase">WHO Bulletin</span>
                        <a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" class="text-teal-400 hover:underline font-bold">
                          {{ alert.whoBulletin }} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Source: WHO EWARS & CDC NWSS</span>
            <span class="text-indigo-400 font-semibold">Continuous Genomic Sequencing</span>
          </div>
        </div>

        <!-- Mission 2: CDC Traveler's Health & Vector Shield (6 cols) -->
        <div class="lg:col-span-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>✈️</span> Mission 2: CDC Travel Medicine & Vector Shield
              </h3>
              <span class="text-[10px] font-mono text-zinc-500">CDC Yellow Book 2026</span>
            </div>

            @if (!surveillance.travelProfile()) {
              <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                No active international travel itinerary on file.
              </div>
            } @else {
              <div class="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800/60 space-y-3">
                <div class="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div>
                    <span class="text-[10px] font-mono text-zinc-500 block uppercase">Upcoming Destination</span>
                    <h4 class="font-bold text-white text-xs">{{ surveillance.travelProfile()?.destination }}</h4>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[9px] font-bold uppercase">
                    {{ surveillance.travelProfile()?.cdcNoticeLevel }}
                  </span>
                </div>

                <div class="space-y-2 text-[11px]">
                  <div>
                    <span class="text-[10px] font-mono text-zinc-400 font-bold block mb-1">Required / Recommended Vaccines:</span>
                    <div class="flex flex-wrap gap-1">
                      @for (vac of surveillance.travelProfile()?.requiredVaccines; track vac) {
                        <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono text-[10px]">
                          💉 {{ vac }}
                        </span>
                      }
                    </div>
                  </div>

                  <div>
                    <span class="text-[10px] font-mono text-zinc-400 font-bold block mb-1">Vector-Borne Pathogen Risks & Prophylaxis:</span>
                    <ul class="list-disc pl-4 space-y-0.5 text-zinc-300 text-[11px] leading-snug">
                      @for (risk of surveillance.travelProfile()?.vectorRisks; track risk) {
                        <li>{{ risk }}</li>
                      }
                      @for (pro of surveillance.travelProfile()?.prophylacticProtocol; track pro) {
                        <li class="text-teal-300 font-semibold">{{ pro }}</li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>CDC Traveler's Health Network</span>
            <span class="text-teal-400 font-semibold">IHR Protocol Compliant</span>
          </div>
        </div>

        <!-- Mission 3: WHO GLASS Antimicrobial Stewardship & AWaRe (6 cols) -->
        <div class="lg:col-span-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🛡️</span> Mission 3: WHO GLASS Antimicrobial Stewardship
              </h3>
              <span class="text-[10px] font-mono text-zinc-500">WHO AWaRe Triage</span>
            </div>

            @if (surveillance.awareStewardship().length === 0) {
              <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                No active antibiotic or antimicrobial medications on file.
              </div>
            } @else {
              <div class="space-y-3">
                @for (item of surveillance.awareStewardship(); track item.medication + '-' + $index) {
                  <div class="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
                    <div class="flex items-center justify-between mb-1.5">
                      <h4 class="font-bold text-white text-xs">{{ item.medication }}</h4>
                      <span [class]="awareCategoryBadgeClass(item.category)" class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono">
                        {{ item.category }} TIER
                      </span>
                    </div>
                    <p class="text-[11px] text-zinc-400 leading-normal">{{ item.stewardshipNote }}</p>
                    <div class="mt-2 pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span>Regional Resistance Risk</span>
                      <span class="font-bold text-amber-400">{{ item.resistanceRisk }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>WHO GLASS Surveillance</span>
            <span class="text-indigo-400 font-semibold">Access / Watch / Reserve Triage</span>
          </div>
        </div>

        <!-- Mission 4: CDC Environmental & Climate Resilience Shield (6 cols) -->
        <div class="lg:col-span-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/60 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🌡️</span> Mission 4: CDC Environmental Health Shield
              </h3>
              <span class="text-[10px] font-mono text-zinc-500">EPA AQS & CDC Tracking</span>
            </div>

            @if (!surveillance.environmentalIndex()) {
              <div class="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                Environmental sensor telemetry offline.
              </div>
            } @else {
              <div class="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800/60 space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div>
                    <span class="text-[10px] font-mono text-zinc-500 block uppercase">Air Quality Index (AQI)</span>
                    <strong class="text-xl font-extrabold text-white font-mono">{{ surveillance.environmentalIndex()?.aqi }}</strong>
                  </div>
                  <span [class]="surveillance.environmentalRiskTier().bg + ' ' + surveillance.environmentalRiskTier().color" class="px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono border">
                    {{ surveillance.environmentalRiskTier().level }}
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div class="p-2 rounded bg-zinc-900/60 border border-zinc-800/40 text-center">
                    <span class="text-zinc-500 block">PM2.5</span>
                    <strong class="text-zinc-200 text-xs">{{ surveillance.environmentalIndex()?.pm25 }}</strong>
                  </div>
                  <div class="p-2 rounded bg-zinc-900/60 border border-zinc-800/40 text-center">
                    <span class="text-zinc-500 block">Ozone</span>
                    <strong class="text-zinc-200 text-xs">{{ surveillance.environmentalIndex()?.ozone }}</strong>
                  </div>
                  <div class="p-2 rounded bg-zinc-900/60 border border-zinc-800/40 text-center">
                    <span class="text-zinc-500 block">Pollen</span>
                    <strong class="text-amber-300 text-xs">{{ surveillance.environmentalIndex()?.pollenDensity }}</strong>
                  </div>
                </div>

                <div class="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-[11px] text-red-200 leading-relaxed">
                  <span class="font-bold font-mono text-[10px] uppercase text-red-400 block mb-0.5">⚠️ Vulnerability Warning:</span>
                  {{ surveillance.environmentalIndex()?.vulnerabilityWarning }}
                </div>
              </div>
            }
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>CDC Environmental Tracking</span>
            <span class="text-emerald-400 font-semibold">Climate Resilience Engine</span>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: []
})
export class PublicHealthSentinelSuiteComponent {
  protected surveillance = inject(SentinelSurveillanceService);

  riskBadgeClass(risk: string): string {
    switch (risk) {
      case 'Critical':
      case 'High':
        return 'bg-red-500/10 border border-red-500/30 text-red-400';
      case 'Moderate':
        return 'bg-amber-500/10 border border-amber-500/30 text-amber-300';
      case 'Low':
      default:
        return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300';
    }
  }

  awareCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Reserve':
        return 'bg-rose-600 text-white';
      case 'Watch':
        return 'bg-amber-500/20 border border-amber-500/40 text-amber-300';
      case 'Access':
      default:
        return 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300';
    }
  }
}
