import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotPulseAgentService } from '../services/pivot-pulse-agent.service';
import { PartnerEcosystemService } from '../services/partner-ecosystem.service';
import { AvsEngineService } from '../services/avs-engine.service';

export interface IClinicalMission {
  id: string;
  title: string;
  category: 'GROUNDING' | 'VITALITY' | 'FLOW_STATE' | 'SELF_ACTUALIZATION';
  emojiBadge: string;
  xpReward: number;
  isCompleted: boolean;
  assignedPersona: string;
  description: string;
}

@Component({
  selector: 'app-clinical-mission-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      <!-- Header HUD Banner -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🦅</span>
          <div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Peregrine Pivot & Pulse Mission HUD
            </h2>
            <p class="text-xs text-slate-400">Human Potential & Lifespan Optimization Matrix</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold rounded-full">
            Pulse Momentum: {{ pulseMomentumPct() }}%
          </span>
          <span class="px-3 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs font-semibold rounded-full">
            Regimen: {{ pivotService.regimen() }}
          </span>
        </div>
      </div>

      <!-- Peregrine Pivot Alert Banner (if pivoted) -->
      @if (pivotService.pivotDecision().shouldPivot) {
        <div class="p-4 bg-amber-950/60 border border-amber-500/40 rounded-xl flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h4 class="text-sm font-semibold text-amber-300">Peregrine Dynamic Regimen Pivot Triggered</h4>
            <p class="text-xs text-amber-200/80 mt-1">{{ pivotService.pivotDecision().pivotRationale }}</p>
          </div>
        </div>
      }

      <!-- Missions Grid -->
      <div>
        <h3 class="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span>🎯 Active Healthcare & Lifespan Quests</span>
          <span class="text-xs font-normal text-slate-500">({{ completedMissionsCount() }}/{{ missions().length }} Completed)</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (mission of missions(); track mission.id) {
            <div 
              class="p-4 rounded-xl border transition-all cursor-pointer"
              [class.bg-slate-900]="!mission.isCompleted"
              [class.border-slate-800]="!mission.isCompleted"
              [class.bg-emerald-950\/40]="mission.isCompleted"
              [class.border-emerald-500\/40]="mission.isCompleted"
              (click)="toggleMission(mission.id)">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">{{ mission.emojiBadge }}</span>
                  <div>
                    <h4 class="text-sm font-medium text-slate-200">{{ mission.title }}</h4>
                    <span class="text-[10px] text-slate-400">{{ mission.assignedPersona }}</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                  +{{ mission.xpReward }} XP
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-2">{{ mission.description }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Partner Exploration Ecosystem -->
      <div class="border-t border-slate-800 pt-4">
        <h3 class="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span>🤝 Enabled Partner Ecosystem (Google, Amazon, Wearables)</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (partner of partnerService.partners(); track partner.id) {
            <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
              <span class="text-xl">{{ partner.iconEmoji }}</span>
              <div>
                <h5 class="text-xs font-semibold text-slate-200">{{ partner.name }}</h5>
                <p class="text-[10px] text-slate-400">{{ partner.lifespanImpact }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ClinicalMissionHudComponent {
  readonly pivotService = inject(PivotPulseAgentService);
  readonly partnerService = inject(PartnerEcosystemService);
  readonly avsService = inject(AvsEngineService);

  readonly missions = signal<IClinicalMission[]>([
    {
      id: 'm-001',
      title: 'Autonomic Baseline Audit',
      category: 'GROUNDING',
      emojiBadge: '🪵⚓🩸',
      xpReward: 50,
      isCompleted: true,
      assignedPersona: '🕊️ Nightingale',
      description: 'Sync 2 biometric pulse checks before 10 AM to verify parasympathetic recovery.'
    },
    {
      id: 'm-002',
      title: 'Glycemic Shield Mastery',
      category: 'VITALITY',
      emojiBadge: '⚡🔋',
      xpReward: 75,
      isCompleted: false,
      assignedPersona: '🦅 Peregrine',
      description: 'Maintain glucose curve in 70-140 mg/dL range following lunch.'
    },
    {
      id: 'm-003',
      title: '528Hz Solfeggio Somatic Reset',
      category: 'FLOW_STATE',
      emojiBadge: '🧠🌊💎',
      xpReward: 100,
      isCompleted: false,
      assignedPersona: '🦉 Dr. Gulliver',
      description: 'Complete 10-minute binaural Theta entrainment for Heart-Brain coherence.'
    },
    {
      id: 'm-004',
      title: 'Grow-Thyself Epigenetic Flourishing',
      category: 'SELF_ACTUALIZATION',
      emojiBadge: '🌟🌳🦅',
      xpReward: 150,
      isCompleted: false,
      assignedPersona: '🐧 Professor Puffin',
      description: 'Engage Socratic health literacy quest exploring circadian sleep & cellular autophagy.'
    }
  ]);

  readonly pulseMomentumPct = computed(() => Math.round(this.pivotService.pulse().pulseMomentum * 100));
  readonly completedMissionsCount = computed(() => this.missions().filter(m => m.isCompleted).length);

  toggleMission(missionId: string): void {
    this.missions.update(list =>
      list.map(m => (m.id === missionId ? { ...m, isCompleted: !m.isCompleted } : m))
    );
  }
}
