import { Injectable, signal, computed, inject } from '@angular/core';
import { PeerNetworkService, IConnectedPeer } from './peer-network.service';
import { VisualHapticEntrainmentService } from './visual-haptic-entrainment.service';

export interface IAutonomicResonanceSession {
  sessionId: string;
  peerId: string;
  peerName: string;
  selfBpm: number;
  peerBpm: number;
  coherenceScorePercent: number; // 0 - 100%
  synchronizationStatus: 'ENTRAINING' | 'RESONANT_HARMONY' | 'PEAK_COHERENCE';
  durationSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class AutonomicCoherenceBridgeService {
  private peerNetwork = inject(PeerNetworkService);
  private hapticEntrainment = inject(VisualHapticEntrainmentService);

  readonly activeResonanceSession = signal<IAutonomicResonanceSession | null>({
    sessionId: 'session_coherence_01',
    peerId: 'peer-101',
    peerName: 'Maya Lin',
    selfBpm: 68,
    peerBpm: 70,
    coherenceScorePercent: 94,
    synchronizationStatus: 'RESONANT_HARMONY',
    durationSeconds: 180
  });

  readonly isResonanceActive = computed(() => this.activeResonanceSession() !== null);

  readonly resonanceQualityLabel = computed(() => {
    const session = this.activeResonanceSession();
    if (!session) return 'No Active Connection';
    if (session.coherenceScorePercent >= 90) return '✨ Peak Autonomic Coherence & Sympathetic Harmony';
    if (session.coherenceScorePercent >= 75) return '🫀 High Cardiac Entrainment';
    return '🌱 Calibrating Dual Cadence...';
  });

  startResonanceSession(peer: IConnectedPeer, selfBpm = 68, peerBpm = 70): void {
    const diff = Math.abs(selfBpm - peerBpm);
    const coherence = Math.max(60, 100 - diff * 3);

    this.activeResonanceSession.set({
      sessionId: `res_${Date.now()}`,
      peerId: peer.peerId,
      peerName: peer.aliasName,
      selfBpm,
      peerBpm,
      coherenceScorePercent: coherence,
      synchronizationStatus: coherence >= 90 ? 'PEAK_COHERENCE' : 'RESONANT_HARMONY',
      durationSeconds: 0
    });

    // Trigger contactless visual haptic pulse entrainment
    this.hapticEntrainment.startContactlessVisualHapticStream(peer.aliasName);
  }

  endResonanceSession(): void {
    this.activeResonanceSession.set(null);
  }
}
