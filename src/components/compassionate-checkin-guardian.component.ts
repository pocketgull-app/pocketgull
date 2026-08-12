import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompassionateCheckInGuardianService, PeerWellBeingStatus } from '../services/compassionate-checkin-guardian.service';

@Component({
  selector: 'app-compassionate-checkin-guardian',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-purple-950/80 border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">💚</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Compassionate Peer Check-In Guardian</h2>
            <p class="text-xs text-gray-400 mt-1">
              Checking up on friends, elders, and mentors to make sure everyone is doing okay.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {{ checkinService.activeCheckInPromptsCount() }} Peers Seeking Outreach
        </div>
      </div>

      <!-- My Current Well-Being Status Selector -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-3">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Personal Well-Being Status</span>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          @for (st of statusOptions; track st.key) {
            <button
              (click)="checkinService.setMyStatus(st.key)"
              [class.border-emerald-500]="checkinService.myStatus() === st.key"
              [class.bg-emerald-950\/30]="checkinService.myStatus() === st.key"
              [class.border-zinc-800]="checkinService.myStatus() !== st.key"
              class="p-3 rounded-xl border text-left transition-all hover:border-emerald-400 cursor-pointer flex flex-col justify-between"
            >
              <span class="text-xl mb-1">{{ st.icon }}</span>
              <div class="text-xs font-bold text-gray-200 leading-tight">{{ st.label }}</div>
            </button>
          }
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input 
            [(ngModel)]="myCustomNote" 
            placeholder="Add a gentle note (e.g. Ready for morning walk)..." 
            class="flex-1 text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200" 
          />
          <button (click)="updateNote()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition">
            Update Note
          </button>
        </div>
      </div>

      <!-- Peer Check-In Feed -->
      <div class="p-6 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
        <h3 class="text-sm font-bold text-gray-200">Peer & Loved Ones Well-Being Radar</h3>

        <div class="space-y-3">
          @for (peer of checkinService.peerCheckIns(); track peer.id) {
            <div 
              [class.border-purple-500\/50]="peer.status === 'WANTS_TALK'"
              [class.bg-purple-950\/20]="peer.status === 'WANTS_TALK'"
              class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-gray-200">{{ peer.peerName }}</span>
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {{ peer.status }}
                  </span>
                </div>
                <p class="text-xs text-gray-300 mt-1">"{{ peer.gentleNote }}"</p>
                <div class="text-[10px] font-mono text-zinc-500 mt-1">Last active {{ peer.lastActive }}</div>
              </div>

              <div class="flex items-center gap-2">
                <input 
                  #pingMsg 
                  placeholder="Send a warm note..." 
                  class="text-xs p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 w-44" 
                />
                <button 
                  (click)="checkinService.sendCompassionatePing(peer.peerId, pingMsg.value); pingMsg.value = ''"
                  class="px-3 py-2 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs transition cursor-pointer whitespace-nowrap"
                >
                  💌 Check In
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CompassionateCheckInGuardianComponent {
  readonly checkinService = inject(CompassionateCheckInGuardianService);

  myCustomNote = 'Doing great and ready for morning walking!';

  readonly statusOptions: { key: PeerWellBeingStatus; icon: string; label: string }[] = [
    { key: 'ENERGIZED', icon: '💚', label: 'Energized & Great' },
    { key: 'RESTING', icon: '🌿', label: 'Resting & Recharging' },
    { key: 'WANTS_TALK', icon: '🤝', label: 'Would Love a Talk' },
    { key: 'NEED_SUPPORT', icon: '🚨', label: 'Need Support' }
  ];

  updateNote(): void {
    if (this.myCustomNote.trim()) {
      this.checkinService.setMyStatus(this.checkinService.myStatus(), this.myCustomNote.trim());
    }
  }
}
