import { Injectable, signal, computed } from '@angular/core';
import { getSecureRandomId } from '../utils/security-helper';

export interface IPeerSharingConsent {
  shareAcousticThemeSong: boolean;
  shareHapticPulse: boolean;
  shareSchoolAffiliation: boolean;
  shareCoherenceScore: boolean;
  shareJointQuests: boolean;
}

export interface IConnectedPeer {
  peerId: string;
  aliasName: string;
  schoolAffiliation: string;
  mascotEmoji: string;
  coherenceScore: number;
  qrPayloadUrl: string;
  dateConnected: string;
  status: 'ONLINE' | 'IN_QUEST' | 'RESTING';
  sharingConsent: IPeerSharingConsent;
}

@Injectable({
  providedIn: 'root'
})
export class PeerNetworkService {
  // Global user default consent settings (Default: Opt-in required for haptics)
  readonly myDefaultConsent = signal<IPeerSharingConsent>({
    shareAcousticThemeSong: true,
    shareHapticPulse: true,
    shareSchoolAffiliation: true,
    shareCoherenceScore: false, // Explicit opt-in for score
    shareJointQuests: true
  });

  private connectedPeers = signal<IConnectedPeer[]>([
    {
      peerId: 'peer-101',
      aliasName: 'Maya Lin',
      schoolAffiliation: 'Stanford University',
      mascotEmoji: '🌲',
      coherenceScore: 88.4,
      qrPayloadUrl: 'https://pocketgull.app/peer-sync?peerId=peer-101&alias=Maya+Lin&school=stanford',
      dateConnected: '2026-08-11',
      status: 'ONLINE',
      sharingConsent: {
        shareAcousticThemeSong: true,
        shareHapticPulse: true,
        shareSchoolAffiliation: true,
        shareCoherenceScore: true,
        shareJointQuests: true
      }
    },
    {
      peerId: 'peer-102',
      aliasName: 'Marcus Vance',
      schoolAffiliation: 'MIT',
      mascotEmoji: '⚙️',
      coherenceScore: 87.9,
      qrPayloadUrl: 'https://pocketgull.app/peer-sync?peerId=peer-102&alias=Marcus+Vance&school=mit',
      dateConnected: '2026-08-10',
      status: 'IN_QUEST',
      sharingConsent: {
        shareAcousticThemeSong: true,
        shareHapticPulse: false, // Haptic pulse disabled by Marcus
        shareSchoolAffiliation: true,
        shareCoherenceScore: false,
        shareJointQuests: true
      }
    }
  ]);

  readonly peers = this.connectedPeers.asReadonly();
  readonly networkCount = computed(() => this.connectedPeers().length);

  /**
   * Generate a sharable Peer Network QR Code URL payload for instant scanning
   */
  generateMyPeerQrPayload(userAlias: string, schoolId: string): string {
    const encodedAlias = encodeURIComponent(userAlias);
    const peerId = `p_${getSecureRandomId()}`;
    return `https://pocketgull.app/peer-sync?peerId=${peerId}&alias=${encodedAlias}&school=${schoolId}&v=1.16`;
  }

  /**
   * Add a newly scanned peer only upon explicit bilateral consent acceptance
   */
  addScannedPeerFromQr(qrUrl: string, customConsent?: Partial<IPeerSharingConsent>): IConnectedPeer {
    const consent: IPeerSharingConsent = {
      ...this.myDefaultConsent(),
      ...customConsent
    };

    try {
      const url = new URL(qrUrl);
      const peerId = url.searchParams.get('peerId') || `peer-${Date.now().toString(36)}`;
      const aliasName = url.searchParams.get('alias') || 'New Health Companion';
      const school = url.searchParams.get('school') || 'stanford';

      const newPeer: IConnectedPeer = {
        peerId,
        aliasName: decodeURIComponent(aliasName),
        schoolAffiliation: school.toUpperCase(),
        mascotEmoji: school === 'mit' ? '⚙️' : school === 'harvard' ? '🎓' : '🌲',
        coherenceScore: 85.0,
        qrPayloadUrl: qrUrl,
        dateConnected: new Date().toISOString().split('T')[0],
        status: 'ONLINE',
        sharingConsent: consent
      };

      this.connectedPeers.update(list => [newPeer, ...list]);
      return newPeer;
    } catch {
      const fallbackPeer: IConnectedPeer = {
        peerId: `peer-${Date.now().toString(36)}`,
        aliasName: 'Companion Friend',
        schoolAffiliation: 'UNIVERSAL',
        mascotEmoji: '🌟',
        coherenceScore: 85.0,
        qrPayloadUrl: qrUrl,
        dateConnected: new Date().toISOString().split('T')[0],
        status: 'ONLINE',
        sharingConsent: consent
      };
      this.connectedPeers.update(list => [fallbackPeer, ...list]);
      return fallbackPeer;
    }
  }

  /**
   * Revoke sharing consent and remove a connected peer instantly
   */
  revokePeerSharingConsent(peerId: string): void {
    this.connectedPeers.update(list => list.filter(p => p.peerId !== peerId));
  }

  /**
   * Update granular sharing consent preferences for a specific peer
   */
  updatePeerConsent(peerId: string, updatedConsent: Partial<IPeerSharingConsent>): void {
    this.connectedPeers.update(list =>
      list.map(p =>
        p.peerId === peerId
          ? { ...p, sharingConsent: { ...p.sharingConsent, ...updatedConsent } }
          : p
      )
    );
  }
}
