import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorTemperature, SOLFEGGIO_CATALOG, ISolfeggioTone } from './avs.constants';
import { AvsUiService } from '../services/avs-ui.service';

@Component({
  selector: 'app-circadian-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-950/20 via-zinc-900/10 to-transparent border border-indigo-500/15 space-y-4">
      <div class="flex items-center justify-between border-b border-gray-200/50 dark:border-zinc-800/50 pb-2">
        <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
          Circadian Tuning &amp; Harmonic Carrier Dashboard
        </span>
        <span class="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Visual &amp; Audio Pacing</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Frequency Slider -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-baseline">
            <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">Light Modulation Speed</label>
            <span class="text-xs font-bold text-indigo-400 font-mono">{{ targetBrainwaveFrequencyHz().toFixed(1) }} Hz</span>
          </div>
          <input type="range" min="1.0" max="30.0" step="0.5"
                 [value]="targetBrainwaveFrequencyHz()"
                 (input)="onFrequencyChange($event)"
                 class="w-full accent-indigo-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer">
          <div class="flex justify-between text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
            <span>Delta: 2-4Hz</span>
            <span>Theta: 4-8Hz</span>
            <span>Alpha: 8-12Hz</span>
            <span>Beta: 12-30Hz</span>
          </div>
        </div>

        <!-- Color Temperature Presets -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase block">Circadian Color Temperature</label>
          <div class="grid grid-cols-2 gap-2">
            @for (preset of presets; track preset) {
              <button (click)="onSelectColor(preset)"
                      class="p-2 rounded border text-center transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                      [class.bg-indigo-500/15]="colorTemp() === preset && preset === 'indigo'"
                      [class.border-indigo-500]="colorTemp() === preset && preset === 'indigo'"
                      [class.text-indigo-400]="colorTemp() === preset && preset === 'indigo'"
                      [class.bg-emerald-500/15]="colorTemp() === preset && preset === 'emerald'"
                      [class.border-emerald-500]="colorTemp() === preset && preset === 'emerald'"
                      [class.text-emerald-400]="colorTemp() === preset && preset === 'emerald'"
                      [class.bg-violet-500/15]="colorTemp() === preset && preset === 'violet'"
                      [class.border-violet-500]="colorTemp() === preset && preset === 'violet'"
                      [class.text-violet-400]="colorTemp() === preset && preset === 'violet'"
                      [class.bg-rose-500/15]="colorTemp() === preset && preset === 'rose-earth'"
                      [class.border-rose-500]="colorTemp() === preset && preset === 'rose-earth'"
                      [class.text-rose-400]="colorTemp() === preset && preset === 'rose-earth'"
                      [class.shadow-sm]="colorTemp() === preset"
                      [class.bg-white]="colorTemp() !== preset"
                      [class.dark:bg-zinc-950/20]="colorTemp() !== preset"
                      [class.border-gray-200]="colorTemp() !== preset"
                      [class.dark:border-zinc-800]="colorTemp() !== preset"
                      [class.text-gray-500]="colorTemp() !== preset"
                      [class.dark:text-zinc-400]="colorTemp() !== preset"
                      [class.hover:border-indigo-500/30]="colorTemp() !== preset">
                <span class="w-2.5 h-2.5 rounded-full" [class]="getDotClass(preset)"></span>
                {{ preset === 'rose-earth' ? 'Rose Earth' : preset | titlecase }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Sacred Solfeggio Harmonic Carrier Tone Selector -->
      <div class="pt-3 border-t border-gray-200/50 dark:border-zinc-800/50 space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase block">
            Harmonic Solfeggio Carrier Frequencies
          </label>
          <span class="text-[9px] font-mono text-indigo-400 font-bold">
            Carrier: {{ activeCarrierHz() }} Hz
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          @for (tone of solfeggioCatalog; track tone.hz) {
            <button (click)="onSelectCarrier(tone.hz)"
                    class="p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer"
                    [class.border-indigo-400]="activeCarrierHz() === tone.hz"
                    [class.bg-indigo-500/20]="activeCarrierHz() === tone.hz"
                    [class.border-zinc-800]="activeCarrierHz() !== tone.hz"
                    [class.bg-zinc-950/30]="activeCarrierHz() !== tone.hz"
                    [class.hover:border-indigo-500/40]="activeCarrierHz() !== tone.hz"
                    [title]="tone.description">
              <div class="text-[10px] font-extrabold font-mono text-zinc-100 flex items-center justify-between">
                <span>{{ tone.name }}</span>
                <span class="w-2 h-2 rounded-full" [style.background-color]="tone.colorHex"></span>
              </div>
              <div class="text-[8.5px] text-zinc-400 truncate mt-0.5">{{ tone.chakra }}</div>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class CircadianDashboardComponent {
  readonly targetBrainwaveFrequencyHz = input<number>(6.0);
  readonly colorTemp = input<ColorTemperature>('indigo');
  readonly activeCarrierHz = input<number>(432);

  readonly frequencyChange = output<number>();
  readonly colorTempChange = output<ColorTemperature>();
  readonly carrierChange = output<number>();

  readonly presets: ColorTemperature[] = ['indigo', 'emerald', 'violet', 'rose-earth'];
  readonly solfeggioCatalog: ISolfeggioTone[] = SOLFEGGIO_CATALOG;
  private readonly avsUi = inject(AvsUiService);

  onFrequencyChange(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.frequencyChange.emit(value);
  }

  onSelectColor(preset: ColorTemperature) {
    this.avsUi.playToggle();
    this.colorTempChange.emit(preset);
  }

  onSelectCarrier(hz: number) {
    this.avsUi.playSuccess();
    this.carrierChange.emit(hz);
  }

  getDotClass(preset: ColorTemperature): string {
    switch (preset) {
      case 'indigo': return 'bg-indigo-500';
      case 'emerald': return 'bg-emerald-500';
      case 'violet': return 'bg-violet-500';
      case 'rose-earth': return 'bg-rose-500';
      default: return '';
    }
  }
}
