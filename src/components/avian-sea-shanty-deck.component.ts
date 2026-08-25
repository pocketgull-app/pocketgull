import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvianSeaShantyService, ISeaShantyTrack } from '../services/avian-sea-shanty.service';

@Component({
  selector: 'app-avian-sea-shanty-deck',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-teal-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-lg">
            🎵
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Multimodal Avian Sea Shanty Vagal Co-Singing Deck
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              60 BPM rhythm sea shanties with Swoop & Gulliver for vagal nerve diaphragmatic stimulation & HRV power boost.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold font-mono">
            60 BPM Baroreflex Entrainment Active
          </span>
        </div>
      </div>

      <!-- Track Selector Tabs -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        @for (track of shanty.tracks(); track track.id) {
          <button
            (click)="shanty.selectTrack(track.id)"
            [class.bg-teal-600]="shanty.activeTrackId() === track.id"
            [class.text-white]="shanty.activeTrackId() === track.id"
            [class.text-gray-700]="shanty.activeTrackId() !== track.id"
            [class.dark:text-zinc-300]="shanty.activeTrackId() !== track.id"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
            <span>⚓</span>
            <span>{{ track.title }}</span>
          </button>
        }
      </div>

      <!-- Live Avian Co-Singers Stage Card -->
      @let track = shanty.activeTrack();
      @let lyric = shanty.currentLyric();
      <div class="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-teal-950/40 to-zinc-950 border border-teal-500/40 shadow-2xl space-y-5 text-zinc-100 font-mono relative overflow-hidden">
        <!-- Floating Co-Singers Avatars -->
        <div class="flex items-center justify-between border-b border-teal-500/20 pb-3">
          <!-- Swoop Avatar -->
          <div class="flex items-center gap-3 bg-zinc-900/80 p-2.5 px-4 rounded-xl border border-zinc-800">
            <span class="text-3xl animate-bounce">🦤</span>
            <div>
              <span class="font-bold text-teal-400 text-xs font-sans">Swoop (The Pelican)</span>
              <span class="text-[10px] text-zinc-400 block font-mono">Deep Bass & Baritone Line</span>
            </div>
          </div>

          <!-- Central Play / Pause Button -->
          <button
            (click)="shanty.togglePlay()"
            class="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-teal-500/30 flex items-center gap-2 uppercase tracking-wide">
            <span>{{ shanty.isPlaying() ? '⏸ PAUSE SHANTY' : '▶ START CO-SINGING' }}</span>
          </button>

          <!-- Gulliver Avatar -->
          <div class="flex items-center gap-3 bg-zinc-900/80 p-2.5 px-4 rounded-xl border border-zinc-800">
            <div class="text-right">
              <span class="font-bold text-cyan-400 text-xs font-sans">Gulliver (Pocket Gull)</span>
              <span class="text-[10px] text-zinc-400 block font-mono">High Tenor & Breath Guide</span>
            </div>
            <span class="text-3xl animate-bounce">🕊️</span>
          </div>
        </div>

        <!-- Live Karaoké Breath Cue & Lyrics Display -->
        <div class="p-6 bg-black/60 rounded-xl border border-teal-500/30 text-center space-y-3 font-sans relative">
          <!-- Respiratory Cue Banner -->
          <div class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-md"
            [class.bg-emerald-500\/20]="lyric.breathCue.includes('INHALE')"
            [class.text-emerald-300]="lyric.breathCue.includes('INHALE')"
            [class.border-emerald-500\/40]="lyric.breathCue.includes('INHALE')"
            [class.bg-teal-500\/20]="lyric.breathCue.includes('EXHALE')"
            [class.text-teal-300]="lyric.breathCue.includes('EXHALE')"
            [class.border-teal-500\/40]="lyric.breathCue.includes('EXHALE')"
            [class.bg-amber-500\/20]="lyric.breathCue.includes('HOLD')"
            [class.text-amber-300]="lyric.breathCue.includes('HOLD')"
            [class.border-amber-500\/40]="lyric.breathCue.includes('HOLD')">
            🫁 RESPIRATORY CUE: {{ lyric.breathCue }}
          </div>

          <!-- Current Shanty Lyric Line -->
          <h2 class="text-xl font-black text-white italic tracking-wide animate-in fade-in duration-300">
            "{{ lyric.line }}"
          </h2>

          <div class="text-xs text-teal-400 font-mono pt-1">
            🎙️ Active Vocal Lead: <span class="font-bold text-white">{{ lyric.singer }}</span>
          </div>
        </div>

        <!-- Vagal Telemetry HUD Breakdown -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs font-mono pt-2 border-t border-zinc-800">
          <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <span class="text-[10px] text-zinc-400 block uppercase">Vagal Target Branch</span>
            <span class="font-bold text-teal-300">{{ track.vagalTargetBranch }}</span>
          </div>
          <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <span class="text-[10px] text-zinc-400 block uppercase">HF-HRV Power Boost</span>
            <span class="font-bold text-emerald-400">+{{ track.hfHrvBoostPercentage }}% Vagal Gain</span>
          </div>
          <div class="p-3 bg-zinc-900/80 rounded-xl border border-teal-500/30">
            <span class="text-[10px] text-zinc-400 block uppercase">Vagal Tone Score</span>
            <span class="text-lg font-black text-amber-400">{{ shanty.vagalToneScore() }} / 100</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class AvianSeaShantyDeckComponent {
  readonly shanty = inject(AvianSeaShantyService);
}
