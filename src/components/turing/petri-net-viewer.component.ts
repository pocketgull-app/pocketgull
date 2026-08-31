import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

export interface IPetriPlace {
  id: string;
  name: string;
  tokens: number;
  maxCapacity: number;
}

export interface IPetriTransition {
  id: string;
  name: string;
  inputs: { placeId: string; weight: number }[];
  outputs: { placeId: string; weight: number }[];
}

@Component({
  selector: 'app-petri-net-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-cyan-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-cyan-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🕸️</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              Petri Net Concurrent Pathway Analyzer
              @if (patientVitals()) {
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Glucose: {{ patientVitals()?.cgmGlucoseMgDl || 110 }} mg/dL
                </span>
              }
            </h3>
            <p class="text-[10px] text-cyan-400/80">
              Token Flow, Metabolic Concurrency & Clinical Deadlock Prevention
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
                [class.bg-emerald-950]="!isDeadlocked()" [class.text-emerald-400]="!isDeadlocked()"
                [class.bg-rose-950]="isDeadlocked()" [class.text-rose-400]="isDeadlocked()">
            {{ isDeadlocked() ? '⚠️ DEADLOCK DETECTED' : '✅ SYSTEM OK' }}
          </span>
        </div>
      </div>

      <!-- Places & Tokens Visualizer Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        @for (place of places(); track place.id) {
          <div class="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl flex flex-col justify-between">
            <div class="text-[11px] font-bold uppercase text-cyan-300 flex items-center justify-between">
              <span>{{ place.name }}</span>
              <span class="text-cyan-400 font-mono">({{ place.tokens }}/{{ place.maxCapacity }})</span>
            </div>
            <div class="mt-2 flex items-center gap-1 overflow-x-auto py-1">
              @for (t of getTokensArray(place.tokens); track $index) {
                <div class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></div>
              }
              @if (place.tokens === 0) {
                <span class="text-[10px] text-zinc-600 italic">Empty Place</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Interactive Token Injection Perturbations Bar -->
      <div class="mb-3 flex items-center gap-2 overflow-x-auto py-1 border-y border-cyan-900/30">
        <span class="text-[10px] uppercase font-bold text-cyan-400/90 shrink-0">Inject Cofactors:</span>
        <button (click)="injectNadTokens()"
                class="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🧪 + NAD+ Pool (+2)
        </button>
        <button (click)="injectGlutathione()"
                class="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🌿 + Glutathione Reductase
        </button>
        <button (click)="syncPatientMetabolism()"
                class="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          ⚡ Sync Patient Tokens
        </button>
      </div>

      <!-- Enabled Transitions Action Controls -->
      <div class="space-y-2 mb-3">
        <h4 class="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
          Executable Biochemical Transitions
        </h4>
        <div class="flex flex-wrap gap-2">
          @for (trans of transitions; track trans.id) {
            <button (click)="fireTransition(trans)"
                    [disabled]="!canFire(trans)"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border flex items-center gap-1.5"
                    [class.bg-cyan-600]="canFire(trans)"
                    [class.hover:bg-cyan-500]="canFire(trans)"
                    [class.text-white]="canFire(trans)"
                    [class.border-cyan-400]="canFire(trans)"
                    [class.bg-zinc-900]="!canFire(trans)"
                    [class.text-zinc-600]="!canFire(trans)"
                    [class.border-zinc-800]="!canFire(trans)"
                    [class.cursor-not-allowed]="!canFire(trans)">
              ⚡ {{ trans.name }}
            </button>
          }
        </div>
      </div>

      <!-- Controls Footer -->
      <div class="mt-auto flex items-center justify-between pt-2 border-t border-cyan-900/30 text-xs">
        <button (click)="resetNet()" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer">
          🔄 Reset Tokens
        </button>
        <span class="text-[10px] text-zinc-500 font-mono">Turing-Complete Petri Net (Places/Tokens)</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class PetriNetViewerComponent {
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly places = signal<IPetriPlace[]>([
    { id: 'proinflammatory_cytokines', name: 'Cytokine Storm (IL-6)', tokens: 4, maxCapacity: 10 },
    { id: 'endothelial_damage', name: 'Endothelial Lesion', tokens: 2, maxCapacity: 10 },
    { id: 'anti_inflammatory_treg', name: 'T-Reg Restraint Signal', tokens: 3, maxCapacity: 10 }
  ]);

  readonly patientVitals = computed(() => this.patientState?.vitals() || null);
  readonly patientIssues = computed(() => this.patientState?.issues() || {});

  readonly transitions: IPetriTransition[] = [
    {
      id: 't_cascade',
      name: 'Trigger Inflammatory Cascade',
      inputs: [{ placeId: 'proinflammatory_cytokines', weight: 1 }],
      outputs: [{ placeId: 'endothelial_damage', weight: 1 }]
    },
    {
      id: 't_autophagy',
      name: 'Activate Lenten Autophagy',
      inputs: [{ placeId: 'endothelial_damage', weight: 1 }, { placeId: 'anti_inflammatory_treg', weight: 1 }],
      outputs: [{ placeId: 'proinflammatory_cytokines', weight: 0 }]
    },
    {
      id: 't_suppress',
      name: 'T-Reg Immune Resolution',
      inputs: [{ placeId: 'anti_inflammatory_treg', weight: 1 }],
      outputs: [{ placeId: 'proinflammatory_cytokines', weight: 0 }]
    }
  ];

  readonly isDeadlocked = computed(() => {
    return !this.transitions.some(t => this.canFire(t));
  });

  getTokensArray(n: number): number[] {
    return Array.from({ length: Math.min(n, 10) });
  }

  canFire(t: IPetriTransition): boolean {
    const list = this.places();
    return t.inputs.every(inp => {
      const p = list.find(x => x.id === inp.placeId);
      return p ? p.tokens >= inp.weight : false;
    });
  }

  fireTransition(t: IPetriTransition) {
    if (!this.canFire(t)) return;

    const list = this.places().map(p => {
      let tokens = p.tokens;
      const inp = t.inputs.find(x => x.placeId === p.id);
      if (inp) tokens -= inp.weight;

      const out = t.outputs.find(x => x.placeId === p.id);
      if (out) tokens += out.weight;

      tokens = Math.max(0, Math.min(p.maxCapacity, tokens));
      return { ...p, tokens };
    });

    this.places.set(list);
  }

  injectNadTokens() {
    this.places.update(list => list.map(p => {
      if (p.id === 'anti_inflammatory_treg') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 2) };
      }
      return p;
    }));
  }

  injectGlutathione() {
    this.places.update(list => list.map(p => {
      if (p.id === 'endothelial_damage') {
        return { ...p, tokens: Math.max(0, p.tokens - 1) };
      }
      if (p.id === 'proinflammatory_cytokines') {
        return { ...p, tokens: Math.max(0, p.tokens - 1) };
      }
      if (p.id === 'anti_inflammatory_treg') {
        return { ...p, tokens: Math.min(p.maxCapacity, p.tokens + 1) };
      }
      return p;
    }));
  }

  syncPatientMetabolism() {
    const vitals = this.patientVitals();
    const cgm = parseFloat(String(vitals?.cgmGlucoseMgDl || '110'));
    const hasIssues = Object.keys(this.patientIssues()).length > 0;

    let cytokines = 3;
    let lesions = 1;
    let treg = 4;

    if (cgm > 140) {
      cytokines += 2;
      lesions += 2;
      treg = Math.max(1, treg - 1);
    }
    if (hasIssues) {
      lesions += 1;
    }

    this.places.set([
      { id: 'proinflammatory_cytokines', name: 'Cytokine Storm (IL-6)', tokens: Math.min(10, cytokines), maxCapacity: 10 },
      { id: 'endothelial_damage', name: 'Endothelial Lesion', tokens: Math.min(10, lesions), maxCapacity: 10 },
      { id: 'anti_inflammatory_treg', name: 'T-Reg Restraint Signal', tokens: Math.min(10, treg), maxCapacity: 10 }
    ]);
  }

  resetNet() {
    this.places.set([
      { id: 'proinflammatory_cytokines', name: 'Cytokine Storm (IL-6)', tokens: 4, maxCapacity: 10 },
      { id: 'endothelial_damage', name: 'Endothelial Lesion', tokens: 2, maxCapacity: 10 },
      { id: 'anti_inflammatory_treg', name: 'T-Reg Restraint Signal', tokens: 3, maxCapacity: 10 }
    ]);
  }
}
