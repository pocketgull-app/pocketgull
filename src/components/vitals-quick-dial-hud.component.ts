import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

type VitalTarget = 'hr' | 'bp_sys' | 'bp_dia' | 'temp' | 'spO2';

@Component({
  selector: 'app-vitals-quick-dial-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 bg-zinc-950/95 text-zinc-100 rounded-3xl border border-rose-500/30 shadow-2xl font-sans relative overflow-hidden backdrop-blur-md">
      
      <!-- Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-4 font-mono relative z-10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <h3 class="text-sm font-black text-white uppercase tracking-wider">🎯 1-Thumb Vitals Quick-Dial HUD</h3>
        </div>
        <span class="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 text-rose-400 border border-rose-900/60 font-bold uppercase tracking-widest">Tactile Entry</span>
      </div>

      <!-- Vital Selection Tabs -->
      <div class="grid grid-cols-5 gap-1.5 mb-5 font-mono text-xs relative z-10">
        <button (click)="activeTarget.set('hr')" [class.bg-rose-600]="activeTarget() === 'hr'" [class.text-white]="activeTarget() === 'hr'" class="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer text-center">
          💓 HR
        </button>
        <button (click)="activeTarget.set('bp_sys')" [class.bg-rose-600]="activeTarget() === 'bp_sys'" [class.text-white]="activeTarget() === 'bp_sys'" class="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer text-center">
          🩺 SYS
        </button>
        <button (click)="activeTarget.set('bp_dia')" [class.bg-rose-600]="activeTarget() === 'bp_dia'" [class.text-white]="activeTarget() === 'bp_dia'" class="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer text-center">
          🩺 DIA
        </button>
        <button (click)="activeTarget.set('temp')" [class.bg-rose-600]="activeTarget() === 'temp'" [class.text-white]="activeTarget() === 'temp'" class="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer text-center">
          🌡️ Temp
        </button>
        <button (click)="activeTarget.set('spO2')" [class.bg-rose-600]="activeTarget() === 'spO2'" [class.text-white]="activeTarget() === 'spO2'" class="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer text-center">
          🫁 SpO2
        </button>
      </div>

      <!-- Main Value Dial HUD Display -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative z-10">
        
        <!-- Large Numeric Display -->
        <div class="flex items-baseline gap-2 font-mono">
          <span class="text-4xl sm:text-5xl font-black text-rose-400 font-mono tracking-tight">{{ currentValue() }}</span>
          <span class="text-xs text-zinc-400 font-bold uppercase tracking-wider">{{ currentUnit() }}</span>
        </div>

        <!-- Touch Stepper & Quick Adjustment Controls -->
        <div class="flex items-center gap-2">
          <button (click)="adjustValue(-5)" class="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-lg transition cursor-pointer flex items-center justify-center border border-zinc-700 shadow-sm">-5</button>
          <button (click)="adjustValue(-1)" class="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-lg transition cursor-pointer flex items-center justify-center border border-zinc-700 shadow-sm">-1</button>
          <button (click)="adjustValue(1)" class="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-lg transition cursor-pointer flex items-center justify-center border border-zinc-700 shadow-sm">+1</button>
          <button (click)="adjustValue(5)" class="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-lg transition cursor-pointer flex items-center justify-center border border-zinc-700 shadow-sm">+5</button>
        </div>

        <!-- Commit & Somatic Grounding Buttons -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button (click)="commitActiveVital()" class="flex-1 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg border border-emerald-400 flex items-center justify-center gap-1.5">
            <span>✅ Commit Vital</span>
          </button>
          <button (click)="triggerSomaticGrounding()" title="Open Somatic Grounding Box Breathing" class="px-4 py-3.5 rounded-2xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/50 text-teal-300 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1">
            <span>🧘</span>
            <span class="hidden sm:inline">Grounding</span>
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class VitalsQuickDialHudComponent {
  private patientState = inject(PatientStateService);

  triggerSomaticGrounding(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somatic-grounding-activate'));
    }
  }

  readonly activeTarget = signal<VitalTarget>('hr');
  
  readonly tempHr = signal<number>(72);
  readonly tempSys = signal<number>(120);
  readonly tempDia = signal<number>(80);
  readonly tempTemperature = signal<number>(98.6);
  readonly tempSpO2 = signal<number>(98);

  readonly currentValue = computed(() => {
    switch (this.activeTarget()) {
      case 'hr': return this.tempHr();
      case 'bp_sys': return this.tempSys();
      case 'bp_dia': return this.tempDia();
      case 'temp': return this.tempTemperature();
      case 'spO2': return this.tempSpO2();
    }
  });

  readonly currentUnit = computed(() => {
    switch (this.activeTarget()) {
      case 'hr': return 'bpm';
      case 'bp_sys': return 'mmHg (systolic)';
      case 'bp_dia': return 'mmHg (diastolic)';
      case 'temp': return '°F';
      case 'spO2': return '%';
    }
  });

  adjustValue(delta: number) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12); // Haptic feedback on mobile browsers
    }

    switch (this.activeTarget()) {
      case 'hr':
        this.tempHr.set(Math.max(30, Math.min(240, this.tempHr() + delta)));
        break;
      case 'bp_sys':
        this.tempSys.set(Math.max(60, Math.min(260, this.tempSys() + delta)));
        break;
      case 'bp_dia':
        this.tempDia.set(Math.max(30, Math.min(160, this.tempDia() + delta)));
        break;
      case 'temp':
        this.tempTemperature.set(Math.max(90.0, Math.min(108.0, Math.round((this.tempTemperature() + delta * 0.2) * 10) / 10)));
        break;
      case 'spO2':
        this.tempSpO2.set(Math.max(50, Math.min(100, this.tempSpO2() + delta)));
        break;
    }
  }

  commitActiveVital() {
    switch (this.activeTarget()) {
      case 'hr':
        this.patientState.updateVital('hr', String(this.tempHr()));
        break;
      case 'bp_sys':
      case 'bp_dia':
        this.patientState.updateVital('bp', `${this.tempSys()}/${this.tempDia()}`);
        break;
      case 'temp':
        this.patientState.updateVital('temp', `${this.tempTemperature()}°F`);
        break;
      case 'spO2':
        this.patientState.updateVital('spO2', `${this.tempSpO2()}%`);
        break;
    }
  }
}
