import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISheetNote, IGleeTrackFull } from '../services/actuarial-glee-audio.service';

@Component({
  selector: 'app-sheet-music-notation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl font-mono relative overflow-hidden">
      
      <!-- Sheet Music Header (Dieter Rams Braun Minimalist Style) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-200 flex items-center justify-center text-sm font-bold shadow-inner">
            🎼
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Notation & Pitch Score
              </h4>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 font-mono">
                {{ track().keySignature }} • {{ track().timeSignature }} • {{ track().bpm }} BPM
              </span>
            </div>
            <p class="text-[11px] font-sans text-zinc-400 mt-0.5">
              Precision 5-Line Grand Staff Instrumentation
            </p>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-3 text-[10px] shrink-0 font-mono">
          <span class="flex items-center gap-1.5 text-sky-400">
            <span class="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> Lead (A)
          </span>
          <span class="flex items-center gap-1.5 text-emerald-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Harmony (B)
          </span>
          <span class="flex items-center gap-1.5 text-orange-400">
            <span class="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> Duet Both
          </span>
        </div>
      </div>

      <!-- 5-Line Musical Staff SVG Container -->
      <div class="relative w-full h-36 bg-zinc-900/90 rounded-xl border border-zinc-800/90 p-3 flex items-center overflow-x-auto">
        <svg class="w-full h-full min-w-[500px]" viewBox="0 0 600 120" preserveAspectRatio="none">
          
          <!-- 5 Staff Lines -->
          <line x1="10" y1="30" x2="590" y2="30" stroke="#3f3f46" stroke-width="1.5" />
          <line x1="10" y1="45" x2="590" y2="45" stroke="#3f3f46" stroke-width="1.5" />
          <line x1="10" y1="60" x2="590" y2="60" stroke="#3f3f46" stroke-width="1.5" />
          <line x1="10" y1="75" x2="590" y2="75" stroke="#3f3f46" stroke-width="1.5" />
          <line x1="10" y1="90" x2="590" y2="90" stroke="#3f3f46" stroke-width="1.5" />

          <!-- Measure Bar Lines -->
          <line x1="60" y1="30" x2="60" y2="90" stroke="#71717a" stroke-width="2" />
          <line x1="200" y1="30" x2="200" y2="90" stroke="#52525b" stroke-width="1.5" stroke-dasharray="3,3" />
          <line x1="380" y1="30" x2="380" y2="90" stroke="#52525b" stroke-width="1.5" stroke-dasharray="3,3" />
          <line x1="560" y1="30" x2="560" y2="90" stroke="#71717a" stroke-width="2.5" />

          <!-- Treble Clef Symbol -->
          <text x="20" y="75" fill="#71717a" font-size="38" font-family="serif" font-weight="bold">🎼</text>

          <!-- Key / Time Signature Marks -->
          <text x="68" y="55" fill="#f97316" font-size="13" font-family="monospace" font-weight="bold">4</text>
          <text x="68" y="75" fill="#f97316" font-size="13" font-family="monospace" font-weight="bold">4</text>

          <!-- Render Musical Notes -->
          @for (note of renderedNotes(); track $index) {
            @let isCurrent = activeNoteIndex() === $index;
            
            <g class="transition-all duration-300">
              
              <!-- Ledger line if below or above staff -->
              @if (note.staffStep <= 0) {
                <line [attr.x1]="note.x - 12" [attr.y1]="note.y" [attr.x2]="note.x + 12" [attr.y2]="note.y" stroke="#71717a" stroke-width="1.5" />
              }

              <!-- Braun Signal Orange Active Cursor Ring -->
              @if (isCurrent && isPlaying()) {
                <circle [attr.cx]="note.x" [attr.cy]="note.y" r="14" fill="none" stroke="#f97316" stroke-width="2" class="animate-ping" />
                <circle [attr.cx]="note.x" [attr.cy]="note.y" r="16" fill="none" stroke="#f97316" stroke-width="1.5" />
              }

              <!-- Note Stem -->
              <line [attr.x1]="note.x + 6" [attr.y1]="note.y" [attr.x2]="note.x + 6" [attr.y2]="note.y - 24" [attr.stroke]="note.color" stroke-width="2" />

              <!-- Note Head -->
              <ellipse [attr.cx]="note.x" [attr.cy]="note.y" rx="7.5" ry="5.5" [attr.fill]="note.color" transform="rotate(-20)" [attr.transform-origin]="note.x + ' ' + note.y" />

              <!-- Pitch Text Label Below -->
              <text [attr.x]="note.x" y="112" fill="#a1a1aa" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">
                {{ note.pitch }}
              </text>
            </g>
          }

        </svg>
      </div>

      <!-- Biological Mechanism Liner Notes -->
      <div class="mt-3.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-sans text-zinc-300 leading-relaxed flex items-start gap-2.5">
        <span class="text-sm shrink-0">🔬</span>
        <div>
          <span class="font-bold font-mono text-[10px] uppercase text-orange-400 block mb-0.5">Biological Mechanism & QALY Horizon</span>
          {{ track().biologicalMechanism }}
        </div>
      </div>

    </div>
  `
})
export class SheetMusicNotationComponent {
  track = input.required<IGleeTrackFull>();
  activeNoteIndex = input<number>(0);
  isPlaying = input<boolean>(false);

  renderedNotes = computed(() => {
    const notes = this.track().sheetNotes;
    const startX = 100;
    const spacingX = Math.min(65, 460 / Math.max(1, notes.length));

    const baseY = 90;

    return notes.map((n, i) => {
      const x = startX + i * spacingX;
      const y = baseY - n.staffStep * 7.5;
      
      let color = '#f97316'; // Duet Both (Braun Signal Orange)
      if (n.role === 'A') color = '#38bdf8'; // Singer A (Sky Blue)
      if (n.role === 'B') color = '#34d399'; // Singer B (Mint)

      return {
        ...n,
        x,
        y,
        color
      };
    });
  });
}
