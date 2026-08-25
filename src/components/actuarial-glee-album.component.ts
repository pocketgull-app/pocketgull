import { Component, ChangeDetectionStrategy, signal, computed, output, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { PatientStateService } from '../services/patient-state.service';
import { ActuarialGleeAudioService, IGleeTrackFull } from '../services/actuarial-glee-audio.service';
import { SheetMusicNotationComponent } from './sheet-music-notation.component';

export type IGleeTrack = IGleeTrackFull;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-actuarial-glee-album',
  standalone: true,
  imports: [
    CommonModule,
    PocketGullButtonComponent,
    PocketGullBadgeComponent,
    SheetMusicNotationComponent
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in">
      
      <!-- Dieter Rams Braun Functional Shell -->
      <div class="w-full max-w-6xl max-h-[94vh] bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col font-['Inter']">
        
        <!-- Header -->
        <div class="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
              🎵
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-lg font-black tracking-tight text-zinc-100 uppercase font-mono">Actuarial Glee: Progressive Regeneration</h2>
                <pocket-gull-badge label="12-Track Duet Singalong" severity="warning"></pocket-gull-badge>
              </div>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">Braun Functional Instrumentation Console • Multi-Paradigm Epigenetic Healthspan</p>
            </div>
          </div>

          <div class="flex items-center gap-3 font-mono">
            <!-- Score & QALY Meter -->
            <div class="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold">
              <span class="text-zinc-500">Glee Score:</span>
              <span class="text-sm font-black text-orange-400">{{ gleeScore() }}</span>
              <span class="text-[10px] text-zinc-400">(+{{ totalQalyGain().toFixed(1) }} QALYs)</span>
            </div>

            <button (click)="closeAlbum()" class="text-zinc-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer transition">
              &times;
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 p-6 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col md:flex-row gap-6">
          
          <!-- Left Column: 12 Tracklist Navigation -->
          <div class="w-full md:w-80 flex flex-col space-y-2.5 border-r border-zinc-800/80 pr-0 md:pr-4">
            <h3 class="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">12-Track Regeneration Index</h3>
            
            <div class="flex-1 overflow-y-auto space-y-2 max-h-[62vh] pr-1 font-mono">
              @for (track of orderedTracks(); track track.trackNumber; let i = $index) {
                @let isSelected = selectedTrackIndex() === i;
                <button (click)="selectTrack(i)"
                  [class]="isSelected
                    ? 'w-full text-left p-3 rounded-xl border-2 border-orange-500 bg-zinc-900 text-orange-400 transition-all shadow-md cursor-pointer flex items-center justify-between group'
                    : 'w-full text-left p-3 rounded-xl border border-zinc-800/90 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 transition flex items-center justify-between group cursor-pointer text-zinc-300'"
                  [attr.aria-pressed]="isSelected">
                  
                  <div class="flex items-center gap-3 min-w-0">
                    <span [class]="isSelected ? 'text-xs font-extrabold text-orange-400' : 'text-xs font-bold text-zinc-500 group-hover:text-zinc-300'">
                      #{{ track.trackNumber }}
                    </span>
                    <div class="min-w-0">
                      <div [class]="isSelected ? 'text-xs font-extrabold text-white truncate' : 'text-xs font-bold text-zinc-200 truncate group-hover:text-white'">
                        {{ track.icon }} {{ track.title }}
                      </div>
                      <div class="text-[10px] text-zinc-400 truncate font-sans">{{ track.subtitle }}</div>
                    </div>
                  </div>

                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-orange-400 shrink-0 border border-zinc-800">
                    +{{ track.qalyBonus }}y
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- Right Column: Interactive Singalong & Sheet Music Player -->
          <div class="flex-1 flex flex-col space-y-6">
            
            @if (activeTrack(); as track) {
              <!-- Player Banner -->
              <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div>
                  <div class="flex items-center gap-2.5 mb-1">
                    <span class="text-2xl">{{ track.icon }}</span>
                    <div>
                      <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400">Track {{ track.trackNumber }} • {{ track.keySignature }} • {{ track.bpm }} BPM</span>
                      <h3 class="text-lg font-black text-white leading-snug font-mono">{{ track.title }}</h3>
                    </div>
                  </div>
                  <p class="text-xs text-zinc-400 font-sans mt-0.5">{{ track.subtitle }}</p>
                </div>

                <!-- Game Controls & Mute Audio Toggle -->
                <div class="flex items-center gap-2.5 shrink-0">
                  
                  <!-- Mute / Sound Toggle Button -->
                  <button (click)="audioService.toggleMute()" 
                    [class]="audioService.isMuted()
                      ? 'px-3.5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono text-xs font-bold transition cursor-pointer hover:bg-orange-500/30'
                      : 'px-3.5 py-2.5 rounded-xl bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono text-xs font-bold transition cursor-pointer hover:bg-zinc-850'"
                    [attr.aria-label]="audioService.isMuted() ? 'Unmute Audio' : 'Mute Audio'">
                    <span>{{ audioService.isMuted() ? '🔇 Audio Muted' : '🔊 Sound On' }}</span>
                  </button>

                  @if (!audioService.isPlaying()) {
                    <button (click)="togglePlay()" 
                      class="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 border border-orange-400/50">
                      <span>▶ Play Singalong</span>
                    </button>
                  } @else {
                    <button (click)="togglePlay()" 
                      class="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 border border-zinc-700">
                      <span>⏸ Pause Singalong</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Interactive Duet Roles Banner -->
              <div class="grid grid-cols-2 gap-4 text-center font-mono">
                <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div class="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Singer A (Lead)</div>
                  <div class="text-xs font-bold text-zinc-200 mt-1 font-sans">{{ track.duetRoles.roleA }}</div>
                </div>

                <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Singer B (Harmony)</div>
                  <div class="text-xs font-bold text-zinc-200 mt-1 font-sans">{{ track.duetRoles.roleB }}</div>
                </div>
              </div>

              <!-- Interactive Synchronized Lyric Display -->
              <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center space-y-4 relative overflow-hidden min-h-[190px]">
                
                <div class="flex items-center justify-center text-2xl animate-bounce">
                  🕊️
                </div>

                <!-- Active Lyric Prompt -->
                <div class="text-center space-y-2 max-w-xl">
                  <div class="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded bg-zinc-950 border border-zinc-800 inline-block font-bold text-orange-400">
                    Role: {{ currentRole() === 'A' ? 'Singer A (Lead)' : (currentRole() === 'B' ? 'Singer B (Harmony)' : 'DUET HARMONY (BOTH)') }}
                  </div>

                  <p class="text-base md:text-lg font-bold font-mono leading-relaxed text-white">
                    "{{ currentLyricText() }}"
                  </p>
                </div>

                <!-- Progress Bar -->
                <div class="w-full max-w-md h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div class="h-full bg-orange-500 transition-all duration-300" [style.width.%]="songProgress()"></div>
                </div>
              </div>

              <!-- Backing Sheet Music Notation SVG Staff Component -->
              <app-sheet-music-notation 
                [track]="track" 
                [activeNoteIndex]="audioService.currentNoteIndex()"
                [isPlaying]="audioService.isPlaying()">
              </app-sheet-music-notation>

            }

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Co-regulates autonomic vagal tone (+12.0 QALYs total recovery)</span>
          <pocket-gull-button (click)="closeAlbum()" variant="secondary" size="sm">
            Close Singalong Game
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ActuarialGleeAlbumComponent implements OnDestroy {
  closeModal = output<void>();

  audioService = inject(ActuarialGleeAudioService);
  state = inject(PatientStateService);

  selectedTrackIndex = signal<number>(0);
  currentLyricIndex = signal<number>(0);
  gleeScore = signal<number>(450);

  orderedTracks = computed(() => {
    const philosophy = this.state.activePhilosophy();
    return [...this.audioService.gleeTracks].sort((a, b) => {
      if (a.paradigm === philosophy && b.paradigm !== philosophy) return -1;
      if (b.paradigm === philosophy && a.paradigm !== philosophy) return 1;
      return a.trackNumber - b.trackNumber;
    });
  });

  activeTrack = computed(() => this.orderedTracks()[this.selectedTrackIndex()] || this.audioService.gleeTracks[0]);
  totalQalyGain = computed(() => this.audioService.gleeTracks.reduce((acc, t) => acc + t.qalyBonus, 0));

  currentLyricText = computed(() => {
    const track = this.activeTrack();
    const idx = this.currentLyricIndex();
    return track.lyrics[idx]?.text || track.lyrics[0].text;
  });

  currentRole = computed(() => {
    const track = this.activeTrack();
    const idx = this.currentLyricIndex();
    return track.lyrics[idx]?.role || 'Both';
  });

  songProgress = computed(() => {
    const track = this.activeTrack();
    return ((this.currentLyricIndex() + 1) / track.lyrics.length) * 100;
  });

  selectTrack(index: number) {
    this.selectedTrackIndex.set(index);
    this.currentLyricIndex.set(0);
    if (this.audioService.isPlaying()) {
      this.audioService.playTrack(this.activeTrack());
    }
  }

  togglePlay() {
    if (this.audioService.isPlaying()) {
      this.audioService.stopTrack();
    } else {
      this.gleeScore.update(s => s + 50);
      this.audioService.playTrack(this.activeTrack());
    }
  }

  closeAlbum() {
    this.audioService.stopTrack();
    this.closeModal.emit();
  }

  ngOnDestroy() {
    this.audioService.stopTrack();
  }
}
