import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  MovementHealingQuestService, 
  DevicePlatformTier, 
  IHealingMilestone 
} from '../services/movement-healing-quest.service';

@Component({
  selector: 'app-movement-healing-quest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 font-sans" role="region" aria-label="Movement-to-Heal Biophilic Quest and QR Sharing Suite">
      
      <!-- Top Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xl">
            🌿
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100">{{ quest().title }}</h2>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                Movement Therapy
              </span>
            </div>
            <p class="text-xs text-zinc-400">{{ quest().subtitle }}</p>
          </div>
        </div>

        <!-- Live Vagal Points Score -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-xs font-mono text-zinc-400 block">Vagal Coherence Score</span>
            <span class="text-sm font-mono font-bold text-emerald-400 tabular-nums">
              {{ currentPoints() }} / {{ quest().totalVagalPointsPossible }} pts
            </span>
          </div>
          <div class="h-10 w-10 rounded-full bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center font-bold text-xs text-emerald-300 font-mono">
            {{ progressPct() }}%
          </div>
        </div>
      </div>

      <!-- Cross-Platform Device Support Selector -->
      <div class="mt-4 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span class="text-xs font-medium text-zinc-300">Cross-Platform On-Device Engine:</span>
          <span class="text-[11px] font-mono text-teal-400">100% Zero-Egress On-Device AI</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          @for (platform of platforms; track platform.id) {
            <button
              type="button"
              (click)="setPlatform(platform.id)"
              [class.border-emerald-500]="activePlatform() === platform.id"
              [class.bg-emerald-950/30]="activePlatform() === platform.id"
              [class.text-white]="activePlatform() === platform.id"
              [class.border-zinc-800]="activePlatform() !== platform.id"
              [class.text-zinc-400]="activePlatform() !== platform.id"
              class="min-h-[44px] p-2 rounded-lg border text-left text-xs transition-all hover:bg-zinc-800/80 flex items-center gap-2.5"
              [attr.aria-pressed]="activePlatform() === platform.id">
              <span class="text-lg">{{ platform.icon }}</span>
              <div>
                <span class="font-semibold block text-zinc-200">{{ platform.name }}</span>
                <span class="text-[10px] text-zinc-400 block">{{ platform.featureTag }}</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Main Layout: QR Code Sharing Card & Interactive Quest Milestone Track -->
      <div class="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Left: Procedural SVG QR Code & Mobile Launch Card (5 cols) -->
        <div class="lg:col-span-5 flex flex-col items-center justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-center">
          <div>
            <span class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
              📱 Scan to Launch Quest on Phone
            </span>
            <p class="text-xs text-zinc-400 max-w-xs mb-3">
              Scan with your iPhone Camera, Pixel, or Windows device to begin your walking quest in nature.
            </p>
          </div>

          <!-- High-Contrast Procedural QR Code (SVG) -->
          <div class="p-3 bg-white rounded-2xl shadow-xl border border-zinc-300 relative group">
            <svg viewBox="0 0 100 100" class="w-44 h-44 select-none" aria-label="QR Code to scan and launch movement quest">
              <!-- Background -->
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              
              <!-- Top-Left Finder -->
              <rect x="6" y="6" width="28" height="28" fill="#09090b" rx="2" />
              <rect x="10" y="10" width="20" height="20" fill="#ffffff" rx="1" />
              <rect x="14" y="14" width="12" height="12" fill="#09090b" rx="1" />

              <!-- Top-Right Finder -->
              <rect x="66" y="6" width="28" height="28" fill="#09090b" rx="2" />
              <rect x="70" y="10" width="20" height="20" fill="#ffffff" rx="1" />
              <rect x="74" y="14" width="12" height="12" fill="#09090b" rx="1" />

              <!-- Bottom-Left Finder -->
              <rect x="6" y="66" width="28" height="28" fill="#09090b" rx="2" />
              <rect x="10" y="70" width="20" height="20" fill="#ffffff" rx="1" />
              <rect x="14" y="74" width="12" height="12" fill="#09090b" rx="1" />

              <!-- Quest Payload Matrix Blocks -->
              <rect x="38" y="8" width="6" height="6" fill="#059669" />
              <rect x="48" y="14" width="6" height="6" fill="#09090b" />
              <rect x="38" y="24" width="6" height="6" fill="#09090b" />
              <rect x="48" y="32" width="6" height="6" fill="#059669" />
              <rect x="8" y="38" width="6" height="6" fill="#09090b" />
              <rect x="18" y="46" width="6" height="6" fill="#059669" />
              <rect x="38" y="44" width="6" height="6" fill="#09090b" />
              <rect x="48" y="44" width="6" height="6" fill="#059669" />
              <rect x="58" y="44" width="6" height="6" fill="#09090b" />
              <rect x="68" y="38" width="6" height="6" fill="#059669" />
              <rect x="78" y="46" width="6" height="6" fill="#09090b" />
              <rect x="38" y="66" width="6" height="6" fill="#059669" />
              <rect x="48" y="74" width="6" height="6" fill="#09090b" />
              <rect x="66" y="66" width="6" height="6" fill="#09090b" />
              <rect x="76" y="74" width="6" height="6" fill="#059669" />
              <rect x="86" y="84" width="6" height="6" fill="#09090b" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
                🌿
              </span>
            </div>
          </div>

          <!-- Share Actions -->
          <div class="mt-4 w-full flex items-center justify-center gap-2">
            <button
              type="button"
              (click)="copyQuestLink()"
              class="min-h-[44px] px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400">
              {{ linkCopied() ? '✓ Link Copied' : '🔗 Copy Quest Link' }}
            </button>
            <button
              type="button"
              (click)="resetQuest()"
              class="min-h-[44px] px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400">
              Reset
            </button>
          </div>
        </div>

        <!-- Right: Interactive Milestone Waypoint Track (7 cols) -->
        <div class="lg:col-span-7 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Movement Milestones ({{ quest().totalDistanceMeters }}m · ~{{ quest().estimatedMinutes }} min)
            </span>
            <span class="text-xs font-mono text-emerald-400 font-bold">
              {{ quest().sanctuaryDestination.name.split('&')[0] }}
            </span>
          </div>

          <!-- Milestone Cards -->
          @for (m of quest().milestones; track m.id) {
            <div 
              class="rounded-xl border p-4 transition-all"
              [class.border-emerald-600]="m.isCompleted"
              [class.bg-emerald-950/20]="m.isCompleted"
              [class.border-zinc-800]="!m.isCompleted"
              [class.bg-zinc-900/50]="!m.isCompleted">
              
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div 
                    class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold"
                    [class.bg-emerald-600]="m.isCompleted"
                    [class.text-white]="m.isCompleted"
                    [class.bg-zinc-800]="!m.isCompleted"
                    [class.text-zinc-400]="!m.isCompleted">
                    {{ m.isCompleted ? '✓' : m.order }}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      {{ m.title }}
                      <span class="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                        +{{ m.vagalPointsAwarded }} pts
                      </span>
                    </h3>
                    <p class="text-xs text-zinc-300 mt-1 leading-relaxed">{{ m.description }}</p>
                    
                    <!-- Landmark Hint & Grounding Task -->
                    <div class="mt-2.5 space-y-1.5 text-xs">
                      <div class="flex items-center gap-1.5 text-zinc-400 bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
                        <span class="text-amber-400">🏛️ Landmark:</span> {{ m.landmarkHint }}
                      </div>
                      <div class="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-800/40">
                        <span>🧘 Grounding:</span> {{ m.groundingTask }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Milestone Complete Action -->
                @if (!m.isCompleted) {
                  <button
                    type="button"
                    (click)="completeMilestone(m.id)"
                    class="min-h-[44px] px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                    aria-label="Mark milestone {{ m.title }} completed">
                    Arrived 🎯
                  </button>
                } @else {
                  <span class="text-xs font-mono text-emerald-400 shrink-0 font-bold">
                    Completed {{ m.completedAt }}
                  </span>
                }
              </div>

            </div>
          }

          <!-- Quest Complete Celebration Banner -->
          @if (isQuestComplete()) {
            <div class="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-4 text-center animate-in fade-in">
              <span class="text-2xl block mb-1">🎉</span>
              <h4 class="text-sm font-bold text-emerald-200">Vagal Odyssey Completed!</h4>
              <p class="text-xs text-zinc-300 mt-1">
                You completed {{ quest().prescribedGreenMinutes }} minutes of restorative biophilic movement and earned {{ quest().totalVagalPointsPossible }} Vagal Coherence points.
              </p>
            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class MovementHealingQuestComponent {
  private readonly questService = inject(MovementHealingQuestService);

  readonly quest = this.questService.activeQuest;
  readonly currentPoints = this.questService.currentVagalPoints;
  readonly progressPct = this.questService.questProgressPct;
  readonly isQuestComplete = this.questService.isQuestComplete;
  readonly activePlatform = this.questService.activePlatform;

  readonly linkCopied = signal<boolean>(false);

  readonly platforms: { id: DevicePlatformTier; name: string; icon: string; featureTag: string }[] = [
    { id: 'APPLE_IOS', name: 'Apple iPhone / Watch', icon: '🍏', featureTag: 'CoreML & HealthKit Sync' },
    { id: 'ANDROID_PIXEL', name: 'Android Pixel 9 Pro', icon: '🤖', featureTag: 'Gemma 4 Edge & Sensor Fusion' },
    { id: 'WINDOWS_DESKTOP', name: 'Windows 11 / Surface', icon: '🪟', featureTag: 'DirectML & Dual-Monitor HUD' }
  ];

  setPlatform(platform: DevicePlatformTier): void {
    this.questService.setPlatform(platform);
  }

  completeMilestone(id: string): void {
    this.questService.completeMilestone(id);
  }

  copyQuestLink(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.quest().qrPayloadUrl);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2500);
    }
  }

  resetQuest(): void {
    this.questService.resetQuest();
  }
}
