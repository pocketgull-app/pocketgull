import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImpactPartnerChannelsService, ImpactChannelPlatform } from '../services/impact-partner-channels.service';

@Component({
  selector: 'app-impact-channels-linking-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🌐</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Impact.com Media Partner Channels</h2>
            <p class="text-xs text-gray-400 mt-1">
              Connect social & website channels to maximize revenue potential and get approved faster by LegalZoom & brand partners.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {{ channelsService.totalVerifiedChannelsCount() }} Verified Channels Connected
        </div>
      </div>

      <!-- Profile Description Box for Impact.com Onboarding -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-300 uppercase tracking-wider">Impact.com Partner Profile Description</span>
          <button (click)="copyProfileDescription()" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-mono font-bold transition cursor-pointer">
            📋 Copy Profile Copy
          </button>
        </div>
        <p class="text-xs text-gray-300 leading-relaxed p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 font-mono">
          {{ channelsService.impactProfileDescription() }}
        </p>
      </div>

      <!-- Quick Add Channel Grid -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-3">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Add New Channel for Instant Approval</span>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          @for (p of platforms; track p.key) {
            <button 
              (click)="selectedPlatform = p.key"
              [class.border-purple-500]="selectedPlatform === p.key"
              [class.bg-purple-950\/30]="selectedPlatform === p.key"
              [class.border-zinc-800]="selectedPlatform !== p.key"
              class="p-2.5 rounded-xl border text-center transition-all hover:border-purple-400 cursor-pointer flex flex-col items-center gap-1"
            >
              <span class="text-lg">{{ p.icon }}</span>
              <span class="text-[11px] font-bold text-gray-200">{{ p.label }}</span>
            </button>
          }
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <input [(ngModel)]="newChannelName" placeholder="Channel Name (e.g. Pocketgull Official)" class="text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200" />
          <input [(ngModel)]="newHandleUrl" placeholder="URL or Handle (@pocketgull)" class="text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200" />
          <button (click)="addNewChannel()" class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition">
            + Connect Channel
          </button>
        </div>
      </div>

      <!-- Connected Channels Roster -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-3">
        <h3 class="text-sm font-bold text-gray-200">Connected Media Partner Channels</h3>
        <div class="space-y-2">
          @for (chan of channelsService.connectedChannels(); track chan.id) {
            <div class="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/60 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-lg font-bold text-purple-400">{{ chan.platform }}</span>
                <div>
                  <div class="text-xs font-bold text-gray-200">{{ chan.channelName }}</div>
                  <div class="text-[11px] font-mono text-gray-400">{{ chan.handleOrUrl }}</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ VERIFIED IMPACT CHANNEL
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ImpactChannelsLinkingCardComponent {
  readonly channelsService = inject(ImpactPartnerChannelsService);

  selectedPlatform: ImpactChannelPlatform = 'WEBSITE';
  newChannelName = '';
  newHandleUrl = '';

  readonly platforms: { key: ImpactChannelPlatform; icon: string; label: string }[] = [
    { key: 'INSTAGRAM', icon: '📸', label: 'Instagram' },
    { key: 'TIKTOK', icon: '🎵', label: 'TikTok' },
    { key: 'YOUTUBE', icon: '▶️', label: 'YouTube' },
    { key: 'X', icon: '🐦', label: 'X' },
    { key: 'FACEBOOK', icon: '👤', label: 'Facebook' },
    { key: 'WEBSITE', icon: '🌐', label: 'Website' }
  ];

  copyProfileDescription(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.channelsService.impactProfileDescription());
      alert('Impact.com Profile Description copied to clipboard!');
    }
  }

  addNewChannel(): void {
    if (this.newChannelName.trim() && this.newHandleUrl.trim()) {
      this.channelsService.addChannel(this.selectedPlatform, this.newChannelName.trim(), this.newHandleUrl.trim(), 15000);
      this.newChannelName = '';
      this.newHandleUrl = '';
    }
  }
}
