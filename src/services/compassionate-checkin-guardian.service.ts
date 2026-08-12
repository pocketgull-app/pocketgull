import { Injectable, signal, computed, inject } from '@angular/core';
import { PeerNetworkService, IConnectedPeer } from './peer-network.service';

export type PeerWellBeingStatus = 'ENERGIZED' | 'RESTING' | 'WANTS_TALK' | 'NEED_SUPPORT';

export interface ICompassionateCheckIn {
  id: string;
  peerId: string;
  peerName: string;
  status: PeerWellBeingStatus;
  lastActive: string;
  hasUnreadCheckInPrompt: boolean;
  gentleNote?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompassionateCheckInGuardianService {
  private peerNetwork = inject(PeerNetworkService);

  readonly myStatus = signal<PeerWellBeingStatus>('ENERGIZED');
  readonly myCustomNote = signal<string>('Doing well today! Ready for morning forest walking.');

  readonly peerCheckIns = signal<ICompassionateCheckIn[]>([
    {
      id: 'chk_001',
      peerId: 'peer-101',
      peerName: 'Maya Lin',
      status: 'RESTING',
      lastActive: '3 hours ago',
      hasUnreadCheckInPrompt: false,
      gentleNote: 'Recharging after a busy week of research.'
    },
    {
      id: 'chk_002',
      peerId: 'peer-102',
      peerName: 'Dr. Marcus Vance',
      status: 'WANTS_TALK',
      lastActive: '1 day ago',
      hasUnreadCheckInPrompt: true,
      gentleNote: 'Would love a quick 10-minute audio catchup or 528Hz bio-theme session.'
    }
  ]);

  readonly activeCheckInPromptsCount = computed(() => {
    return this.peerCheckIns().filter(p => p.hasUnreadCheckInPrompt || p.status === 'WANTS_TALK' || p.status === 'NEED_SUPPORT').length;
  });

  setMyStatus(status: PeerWellBeingStatus, note?: string): void {
    this.myStatus.set(status);
    if (note) this.myCustomNote.set(note);
  }

  sendCompassionatePing(peerId: string, message: string): void {
    this.peerCheckIns.update(list =>
      list.map(p => p.peerId === peerId ? { ...p, hasUnreadCheckInPrompt: false, gentleNote: `Sent check-in note: "${message}"` } : p)
    );
  }
}
