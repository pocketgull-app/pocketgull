import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutonomicCoherenceBridgeService } from '../services/autonomic-coherence-bridge.service';
import { PeerNetworkService } from '../services/peer-network.service';

@Component({
  selector: 'app-autonomic-coherence-bridge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-rose-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-rose-950/80 via-zinc-900 to-purple-950/80 border border-rose-500/40">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🫀</span>
            <div>
              <h2 class="text-xl font-bold text-gray-100">Dual Cardiac Autonomic Coherence Bridge</h2>
              <p class="text-xs text-gray-400 mt-1">
                Real-time human-to-human pulse synchronization & haptic bio-resonance entrainment bound by bilateral consent.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {{ coherenceService.resonanceQualityLabel() }}
          </div>
        </div>
      </div>

      <!-- Active Dual Resonance HUD -->
      @if (coherenceService.activeResonanceSession(); as session) {
        <div class="p-6 bg-zinc-900/80 rounded-2xl border border-rose-500/30 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <!-- Self Pulse -->
            <div class="p-5 bg-zinc-800/40 rounded-xl border border-rose-500/20 text-center space-y-2">
              <span class="text-xs font-mono uppercase font-bold text-rose-400">Your Pulse</span>
              <div class="text-4xl font-extrabold text-white font-mono animate-pulse">{{ session.selfBpm }} <span class="text-xs text-gray-400 font-sans">BPM</span></div>
              <div class="text-[11px] text-gray-400">rPPG Optical Camera Sensor</div>
            </div>

            <!-- Peer Pulse -->
            <div class="p-5 bg-zinc-800/40 rounded-xl border border-purple-500/20 text-center space-y-2">
              <span class="text-xs font-mono uppercase font-bold text-purple-400">{{ session.peerName }}</span>
              <div class="text-4xl font-extrabold text-white font-mono animate-pulse">{{ session.peerBpm }} <span class="text-xs text-gray-400 font-sans">BPM</span></div>
              <div class="text-[11px] text-gray-400">Dual Haptic Cadence Synced</div>
            </div>
          </div>

          <!-- Coherence Meter -->
          <div class="space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <span class="text-gray-300 font-bold">Autonomic Coherence Index</span>
              <span class="text-emerald-400 font-bold">{{ session.coherenceScorePercent }}% Resonant Harmony</span>
            </div>
            <div class="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
              <div 
                class="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700"
                [style.width.%]="session.coherenceScorePercent"
              ></div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-gray-400">🤝 Bilateral Consent Enforced &bull; Ephemeral Edge Storage</span>
            <button (click)="coherenceService.endResonanceSession()" class="px-4 py-2 bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 border border-rose-500/30 rounded-lg text-xs font-bold transition">
              Disconnect Session
            </button>
          </div>
        </div>
      } @else {
        <!-- Peer Connection List -->
        <div class="p-6 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
          <h3 class="text-sm font-bold text-gray-200">Connect with a Peer for Dual Cardiac Entrainment</h3>
          <p class="text-xs text-gray-400">Select a connected peer from your scannable SMART-on-FHIR QR network to initiate real-time haptic pulse synchronization.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (peer of peerNetwork.peers(); track peer.peerId) {
              <div class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-gray-200">{{ peer.mascotEmoji }} {{ peer.aliasName }}</div>
                  <div class="text-[11px] text-gray-400">{{ peer.schoolAffiliation }}</div>
                </div>
                <button 
                  (click)="coherenceService.startResonanceSession(peer)" 
                  class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                >
                  🫀 Connect Pulse
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AutonomicCoherenceBridgeComponent {
  readonly coherenceService = inject(AutonomicCoherenceBridgeService);
  readonly peerNetwork = inject(PeerNetworkService);
}
