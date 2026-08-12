import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { PeerNetworkService } from './peer-network.service';

describe('PeerNetworkService (Scannable Peer Network & Bilateral Granular Consent)', () => {
  let service: PeerNetworkService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PeerNetworkService]
    });
    service = runInInjectionContext(injector, () => injector.get(PeerNetworkService));
  });

  it('1. Initializes default connected peers and consent settings', () => {
    const peers = service.peers();
    expect(peers.length).toBe(2);
    expect(service.networkCount()).toBe(2);
    expect(peers[0].sharingConsent.shareAcousticThemeSong).toBe(true);
    expect(peers[1].sharingConsent.shareHapticPulse).toBe(false);
  });

  it('2. Adds a new peer with custom granular sharing consent settings', () => {
    const scannedUrl = 'https://pocketgull.app/peer-sync?peerId=p_999&alias=Dr.%20Elena&school=oxford';
    const newPeer = service.addScannedPeerFromQr(scannedUrl, { shareHapticPulse: false });
    expect(newPeer.aliasName).toBe('Dr. Elena');
    expect(newPeer.sharingConsent.shareHapticPulse).toBe(false);
    expect(service.networkCount()).toBe(3);
  });

  it('3. Revokes peer sharing consent and removes connected peer instantly', () => {
    service.revokePeerSharingConsent('peer-101');
    expect(service.networkCount()).toBe(1);
    expect(service.peers().some(p => p.peerId === 'peer-101')).toBe(false);
  });
});
