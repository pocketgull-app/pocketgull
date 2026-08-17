import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZenSanctuaryService, IHealingPostcard } from '../services/zen-sanctuary.service';

@Component({
  selector: 'app-zen-sanctuary-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (zenService.isSanctuaryActive()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-2xl transition-all duration-700 animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sanctuary-title">
        
        <div class="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-900/90 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/40 text-stone-100 overflow-hidden">
          
          <!-- Sanctuary Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-stone-800 bg-stone-950/40">
            <div class="flex items-center gap-3">
              <span class="text-2xl animate-pulse">🕯️</span>
              <div>
                <h2 id="sanctuary-title" class="text-xl font-medium tracking-wide text-amber-200">The Zen Sanctuary & Healing Commons</h2>
                <p class="text-xs text-stone-400">Rest, breathe, and connect across the quiet pier.</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button 
                (click)="zenService.playTempleBell()"
                class="px-3 py-1.5 text-xs font-medium bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border border-amber-700/50 rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Ring 432Hz Tibetan Temple Bell">
                <span>🔔</span>
                <span>Ring Bell (432Hz)</span>
              </button>

              <button 
                (click)="zenService.toggleKintsugiGlow()"
                [class.bg-amber-500]="zenService.isKintsugiGlowActive()"
                [class.text-stone-950]="zenService.isKintsugiGlowActive()"
                [class.bg-stone-800]="!zenService.isKintsugiGlowActive()"
                [class.text-stone-300]="!zenService.isKintsugiGlowActive()"
                class="px-3 py-1.5 text-xs font-medium rounded-full border border-amber-600/40 transition-all active:scale-95"
                title="Toggle Kintsugi Gold Veins">
                ✨ Kintsugi Gold
              </button>

              <button 
                (click)="zenService.closeSanctuary()"
                class="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-full transition-all"
                aria-label="Close Sanctuary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Main Sanctuary Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            <!-- 1. Parasympathetic Breath Pacer (4-7-8) -->
            <div class="flex flex-col items-center justify-center p-8 bg-stone-950/60 rounded-2xl border border-stone-800 text-center relative overflow-hidden">
              <div 
                [class.ring-4]="zenService.isKintsugiGlowActive()"
                class="w-32 h-32 rounded-full border-2 border-amber-400/50 flex flex-col items-center justify-center bg-amber-950/20 ring-amber-400/30 transition-all duration-1000 transform hover:scale-105 shadow-inner">
                <span class="text-3xl animate-bounce">🌊</span>
                <span class="text-sm font-semibold text-amber-200 mt-1">4-7-8 Breath</span>
                <span class="text-[10px] text-stone-400">Vagal Reset</span>
              </div>

              <h3 class="text-lg font-medium text-stone-200 mt-4">"When the mind is quiet, the body begins to heal."</h3>
              <p class="text-xs text-stone-400 max-w-md mt-1">Inhale for 4 seconds through the nose, hold gently for 7, and exhale with a soft sigh for 8.</p>
            </div>

            <!-- 2. Postcards on the Pier Gallery -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-lg">📬</span>
                  <h3 class="text-sm font-medium text-amber-200 uppercase tracking-wider">Postcards on the Pier (Peer Commons)</h3>
                </div>
                <button 
                  (click)="isComposing.set(!isComposing())"
                  class="text-xs text-amber-400 hover:text-amber-300 underline font-medium">
                  {{ isComposing() ? 'Cancel' : '+ Write a Quiet Postcard' }}
                </button>
              </div>

              <!-- Compose Card Box -->
              @if (isComposing()) {
                <div class="p-4 mb-6 bg-stone-950/80 border border-amber-600/40 rounded-2xl space-y-3 animate-fadeIn">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-stone-400 block mb-1">Your General Location (e.g. Coastal Maine, Tokyo)</label>
                      <input 
                        [(ngModel)]="newLocation" 
                        placeholder="e.g. Pacific Northwest"
                        class="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label class="text-xs text-stone-400 block mb-1">Theme / Journey</label>
                      <input 
                        [(ngModel)]="newTopic" 
                        placeholder="e.g. Post-Op Knee Rehab, Sleep Recovery"
                        class="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>

                  <div>
                    <label class="text-xs text-stone-400 block mb-1">Encouraging Note</label>
                    <textarea 
                      [(ngModel)]="newMessage" 
                      rows="2"
                      placeholder="Share a moment of peace, victory, or warmth..."
                      class="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"></textarea>
                  </div>

                  <div class="flex justify-end gap-2">
                    <button 
                      (click)="submitPostcard()"
                      class="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-all active:scale-95 shadow-sm">
                      Send to the Pier
                    </button>
                  </div>
                </div>
              }

              <!-- Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (card of zenService.postcards(); track card.id) {
                  <div 
                    [class.border-amber-500-50]="zenService.isKintsugiGlowActive()"
                    class="p-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl flex flex-col justify-between hover:border-amber-600/40 transition-all shadow-sm">
                    <div>
                      <div class="flex items-center justify-between text-xs text-stone-400 mb-2">
                        <span class="font-medium text-amber-300/80">📍 {{ card.senderLocation }}</span>
                        <span class="text-[10px] text-stone-500">{{ card.timestamp }}</span>
                      </div>
                      <span class="inline-block px-2 py-0.5 text-[10px] font-medium bg-stone-900 text-stone-300 rounded mb-2 border border-stone-800">
                        {{ card.recoveryTopic }}
                      </span>
                      <p class="text-xs text-stone-200 leading-relaxed font-serif italic">
                        "{{ card.message }}"
                      </p>
                    </div>

                    <div class="flex items-center justify-between mt-4 pt-3 border-t border-stone-900">
                      <span class="text-[10px] text-stone-500">Anonymous Peer Encouragement</span>
                      <button 
                        (click)="zenService.clapForPostcard(card.id)"
                        class="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-stone-900 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-700/50 rounded-full transition-all text-amber-300">
                        <span>👏</span>
                        <span class="font-medium">{{ card.clapsCount }}</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

          </div>

          <!-- Sanctuary Footer -->
          <div class="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-[11px] text-stone-500">
            <span>🌿 Pocket-Gull Kintsugi Sanctuary • Non-Surveillance Peer Commons</span>
            <span>Press <kbd class="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-stone-300">ESC</kbd> to return</span>
          </div>

        </div>
      </div>
    }
  `
})
export class ZenSanctuaryModalComponent {
  public readonly zenService = inject(ZenSanctuaryService);

  public readonly isComposing = signal<boolean>(false);
  public newLocation = '';
  public newTopic = '';
  public newMessage = '';

  public submitPostcard(): void {
    if (!this.newMessage.trim()) return;
    this.zenService.sendPostcard({
      senderLocation: this.newLocation.trim() || 'Everywhere',
      recoveryTopic: this.newTopic.trim() || 'Healing & Renewal',
      message: this.newMessage.trim(),
      artworkStyle: 'golden_kintsugi'
    });

    this.newLocation = '';
    this.newTopic = '';
    this.newMessage = '';
    this.isComposing.set(false);
  }
}
