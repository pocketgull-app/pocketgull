import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IReceptorChannel {
  channel: string;
  stimulus: string;
  location: string;
  physiologicalRole: string;
}

@Component({
  selector: 'app-piezo-mechanoreceptor-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-rose-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-rose-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚡</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-rose-300">
              PIEZO1/2 & TRPV1 Mechanosensory Matrix (Julius Model)
            </h3>
            <p class="text-[10px] text-rose-400/80">
              Lasker & Breakthrough Prize — Ion Channels Sensing Touch & Temperature
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-950 border border-rose-700/60 text-rose-300">
          Ion Channel
        </span>
      </div>

      <!-- Channels List -->
      <div class="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        @for (ch of channels; track ch.channel) {
          <div class="p-2.5 bg-rose-950/30 border border-rose-800/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] font-bold text-rose-200 flex items-center gap-2">
                <span>{{ ch.channel }}</span>
                <span class="text-[9px] px-1.5 py-0.5 bg-rose-900/60 border border-rose-700/40 rounded text-rose-300">{{ ch.stimulus }}</span>
              </div>
              <p class="text-[10px] text-zinc-400 font-sans mt-0.5">{{ ch.physiologicalRole }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] font-bold text-rose-300 block">{{ ch.location }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-rose-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Kavli Prize & Breakthrough Prize in Life Sciences</span>
        <span>Cationic Influx Transduction</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class PiezoMechanoreceptorMatrixComponent {
  readonly channels: IReceptorChannel[] = [
    {
      channel: 'PIEZO1',
      stimulus: 'Vascular Fluid Shear Stress',
      location: 'Endothelial Blood Vessels',
      physiologicalRole: 'Senses arterial blood pressure & vascular wall stretch.'
    },
    {
      channel: 'PIEZO2',
      stimulus: 'Tactile Touch & Proprioception',
      location: 'Merkel Discs & Joint Capsule',
      physiologicalRole: 'Senses body position in 3D space & light touch.'
    },
    {
      channel: 'TRPV1',
      stimulus: 'Noxious Heat (>43°C) & Capsaicin',
      location: 'Nociceptive C-Fibers',
      physiologicalRole: 'Transduces inflammatory thermal pain & tissue damage.'
    },
    {
      channel: 'TRPM8',
      stimulus: 'Cooling Temperatures & Menthol',
      location: 'A-delta Sensory Fibers',
      physiologicalRole: 'Transduces cold sensation & analgesic cooling feedback.'
    }
  ];
}
