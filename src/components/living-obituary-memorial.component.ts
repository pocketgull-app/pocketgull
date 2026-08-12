import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LivingObituaryMemorialService } from '../services/living-obituary-memorial.service';
import { LegacySwarmAgentsService } from '../services/ai/legacy-swarm-agents.service';

@Component({
  selector: 'app-living-obituary-memorial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
      <!-- Top Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-emerald-950/80 border border-purple-500/40 text-center space-y-3">
        <div class="inline-block p-3 rounded-full bg-purple-900/40 border border-purple-500/30 text-3xl">🕊️</div>
        <div>
          <span class="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">Living Bio-Resonant Obituary</span>
          <h2 class="text-2xl font-extrabold text-white mt-1">{{ memorialService.activeMemorial().fullName }}</h2>
          <p class="text-sm font-serif italic text-emerald-400 mt-0.5">{{ memorialService.activeMemorial().lifespanYears }}</p>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {{ memorialService.activeMemorial().archetypeTitle }}
        </span>
      </div>

      <!-- Bio-Theme Sound & Haptic Pulse Ignition Button -->
      <div class="p-5 bg-gradient-to-r from-purple-900/30 to-emerald-900/30 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎵</span>
          <div>
            <h3 class="text-sm font-bold text-gray-100">Signature Bio-Theme Fanfare & Pulse Cadence</h3>
            <p class="text-xs text-gray-400">Play 528Hz Solfeggio bio-theme synchronized to {{ memorialService.activeMemorial().baselineBpm }} BPM heartbeat haptics.</p>
          </div>
        </div>

        <button 
          (click)="memorialService.playMemorialBioTheme()"
          class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-lg flex items-center gap-2 whitespace-nowrap"
        >
          <span>▶️ Play Bio-Theme & Haptics</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Biography & Principles -->
        <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">📜</span>
            <h3 class="text-sm font-bold text-gray-200">Life's Work & Guiding Principles</h3>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">{{ memorialService.activeMemorial().biographySummary }}</p>

          <div class="space-y-2 pt-2">
            <span class="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Curated Core Principles</span>
            @for (principle of memorialService.activeMemorial().curatedPrinciples; track principle) {
              <div class="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50 text-xs font-serif italic text-gray-300">
                "{{ principle }}"
              </div>
            }
          </div>
        </div>

        <!-- Open-Science Impact & Forest Memorial Tree -->
        <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">🧬</span>
              <h3 class="text-sm font-bold text-gray-200">Open-Science Medical Roll of Honor</h3>
            </div>

            <div class="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div class="text-2xl font-extrabold text-emerald-400 font-mono">{{ memorialService.activeMemorial().openScienceContributionsCount }}</div>
                <div class="text-xs text-gray-300 mt-0.5">De-Identified FHIR Telemetry Points Donated</div>
              </div>
              <span class="text-3xl">🏅</span>
            </div>

            <div class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50 space-y-1">
              <div class="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <span>🌲 Physical Memorial Forest Tree Coordinates</span>
              </div>
              <p class="text-xs font-mono text-gray-300">{{ memorialService.activeMemorial().memorialTreeCoordinates }}</p>
              <p class="text-[11px] text-gray-400 mt-1">Scan QR at location for forest bathing phytoncide exposure maps.</p>
            </div>
          </div>

          <div class="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span class="text-xs text-gray-400">👍 {{ memorialService.activeMemorial().peerTributesCount }} Peer Tributes</span>
            <button (click)="memorialService.addPeerTribute()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition">
              🙏 Leave Peer Tribute
            </button>
          </div>
        </div>
      </div>

      <!-- Socratic Wisdom Avatar Consultation -->
      <div class="p-5 bg-purple-950/20 rounded-2xl border border-purple-800/30 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏛️</span>
            <h3 class="text-sm font-bold text-purple-300">Consult Ancestral Wisdom Avatar (Aeneas Legacy Agent)</h3>
          </div>
          <span class="text-xs font-mono text-emerald-400">🔐 Private Key Encrypted</span>
        </div>
        <p class="text-xs text-gray-300">
          Descendants and family members can interactively consult Dr. Eleanor Vance's wisdom avatar to receive advice grounded in her lifelong clinical recordings and principles.
        </p>
      </div>
    </div>
  `
})
export class LivingObituaryMemorialComponent {
  readonly memorialService = inject(LivingObituaryMemorialService);
  readonly agentService = inject(LegacySwarmAgentsService);
}
