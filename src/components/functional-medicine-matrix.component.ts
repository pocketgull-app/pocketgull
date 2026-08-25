import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-functional-medicine-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-emerald-500/20 shadow-2xl mb-8 font-mono text-zinc-100 relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"></span>
            <h3 class="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
              <span>🧬</span> Functional Medicine 7-Node Matrix & Systemic Telemetry
            </h3>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
              IFM Matrix Framework
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Multidimensional functional mapping across mitochondrial energetics, systemic inflammation, and mucosal intestinal barrier integrity.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-emerald-300">
            Node Active: {{ selectedIfmNode() }}
          </span>
        </div>
      </div>

      <!-- 3 Primary Functional Telemetry Cards with 3D Double-Click Flip State Machines -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10 font-sans">
        
        <!-- 1. Systemic Inflammatory Burden Card -->
        @let isInflamFlipped = isCardFlipped('inflam');
        <div (dblclick)="toggleCardFlip('inflam'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer h-64"
             title="Double-click to flip over for Anti-Inflammatory Protocol & Micro-Habit">
          
          <div [class.rotate-y-180]="isInflamFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
              <div>
                <div class="flex justify-between items-start mb-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Systemic Inflammatory Burden</span>
                    <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      dblclick 🔄
                    </span>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Cytokine Cascade
                  </span>
                </div>

                <div class="flex items-baseline gap-2 mb-3 font-mono">
                  <span class="text-3xl font-black text-rose-400">{{ inflammatory().score }}</span>
                  <span class="text-xs text-zinc-500">/ 100 Burden Index</span>
                </div>

                <div class="space-y-1.5 mb-3 font-mono text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">hs-CRP Estimate:</span>
                    <span class="font-bold text-rose-300">{{ inflammatory().hsCrpEstimate }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">Inflammatory Cascade:</span>
                    <span class="font-bold text-rose-400 text-[11px] truncate">{{ inflammatory().status }}</span>
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-zinc-400 leading-relaxed">
                Evaluates pro-inflammatory TNF-α, IL-6, and NF-κB transcriptional activation against systemic anti-inflammatory reserves.
              </p>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 bg-rose-950 text-white border border-rose-500/40 rounded-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-2xl text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-rose-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-rose-300 font-bold uppercase flex items-center gap-1">
                    <span>🌶️</span> Anti-Inflammatory Habit
                  </span>
                  <span class="text-rose-400 font-mono text-[10px]">dblclick flip</span>
                </div>
                <div class="space-y-1.5 text-rose-100">
                  <p><strong>Everyday Meaning:</strong> Your immune system is {{ inflammatory().score < 30 ? 'quiet and balanced' : 'mildly hyperactive' }}.</p>
                  <p><strong>Action Tip:</strong> Include polyphenols (turmeric/curcumin, green tea, wild berries) and Omega-3 fats to quiet NF-κB signaling.</p>
                </div>
              </div>
              <div class="pt-1.5 border-t border-rose-900 font-mono text-[9px] text-rose-400 flex justify-between">
                <span>Cytokine Shield Active</span>
                <span>Double-click to return</span>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. Mitochondrial Bio-Energetics Card -->
        @let isMitoFlipped = isCardFlipped('mito');
        <div (dblclick)="toggleCardFlip('mito'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer h-64"
             title="Double-click to flip over for Cellular Energy Protocol">
          
          <div [class.rotate-y-180]="isMitoFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
              <div>
                <div class="flex justify-between items-start mb-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mitochondrial Bio-Energetics</span>
                    <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      dblclick 🔄
                    </span>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    OxPhos ATP
                  </span>
                </div>

                <div class="flex items-baseline gap-2 mb-3 font-mono">
                  <span class="text-3xl font-black text-amber-400">{{ mitochondrial().efficiencyPct }}%</span>
                  <span class="text-xs text-zinc-500">Coupling Efficiency</span>
                </div>

                <div class="space-y-1.5 mb-3 font-mono text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">NAD+/NADH Ratio:</span>
                    <span class="font-bold text-amber-300">{{ mitochondrial().nadNadhRatio }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">ATP Output Index:</span>
                    <span class="font-bold text-amber-400 text-[11px] truncate">{{ mitochondrial().atpTurnoverIndex }}</span>
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-zinc-400 leading-relaxed">
                Measures electron transport chain complexes I-IV efficiency and mitochondrial ROS quenching capacity.
              </p>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 bg-amber-950 text-white border border-amber-500/40 rounded-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-2xl text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-amber-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-amber-300 font-bold uppercase flex items-center gap-1">
                    <span>⚡</span> ATP Boost Protocol
                  </span>
                  <span class="text-amber-400 font-mono text-[10px]">dblclick flip</span>
                </div>
                <div class="space-y-1.5 text-amber-100">
                  <p><strong>Everyday Meaning:</strong> Your cellular power plants are running at {{ mitochondrial().efficiencyPct }}% efficiency.</p>
                  <p><strong>Action Tip:</strong> CoQ10, Alpha-Lipoic Acid, and PQQ support electron flow and stimulate mitochondrial biogenesis.</p>
                </div>
              </div>
              <div class="pt-1.5 border-t border-amber-900 font-mono text-[9px] text-amber-400 flex justify-between">
                <span>Mito-Energetic Shield Active</span>
                <span>Double-click to return</span>
              </div>
            </div>

          </div>
        </div>

        <!-- 3. Gut-Brain Axis & Intestinal Barrier Card -->
        @let isGutFlipped = isCardFlipped('gut');
        <div (dblclick)="toggleCardFlip('gut'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer h-64"
             title="Double-click to flip over for Mucosal Barrier Protocol">
          
          <div [class.rotate-y-180]="isGutFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
              <div>
                <div class="flex justify-between items-start mb-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gut-Brain Axis Integrity</span>
                    <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      dblclick 🔄
                    </span>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Vagus & SCFA
                  </span>
                </div>

                <div class="flex items-baseline gap-2 mb-3 font-mono">
                  <span class="text-3xl font-black text-emerald-400">{{ gutBrain().permeabilityIndex }}</span>
                  <span class="text-xs text-zinc-500">/ 100 Permeability Index</span>
                </div>

                <div class="space-y-1.5 mb-3 font-mono text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">SCFA Butyrate Level:</span>
                    <span class="font-bold text-emerald-300 truncate">{{ gutBrain().butyrateSynthesis }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">Zonulin Barrier Status:</span>
                    <span class="font-bold text-emerald-400 text-[11px] truncate">{{ gutBrain().zonulinStatus }}</span>
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-zinc-400 leading-relaxed">
                Monitors tight-junction claudin/occludin integrity and short-chain fatty acid microbiome neuro-protection.
              </p>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 bg-emerald-950 text-white border border-emerald-500/40 rounded-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-2xl text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-emerald-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                    <span>🫄</span> Microbiome Support
                  </span>
                  <span class="text-emerald-400 font-mono text-[10px]">dblclick flip</span>
                </div>
                <div class="space-y-1.5 text-emerald-100">
                  <p><strong>Everyday Meaning:</strong> Your gut lining and brain communicate constantly through the vagus nerve.</p>
                  <p><strong>Action Tip:</strong> Fermented foods (kefir, sauerkraut) and L-Glutamine support tight-junction gut mucosal lining repair.</p>
                </div>
              </div>
              <div class="pt-1.5 border-t border-emerald-900 font-mono text-[9px] text-emerald-400 flex justify-between">
                <span>Gut-Brain Shield Active</span>
                <span>Double-click to return</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- IFM 7-Node Interactive Matrix Rail -->
      <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 relative z-10 font-mono">
        <div class="flex items-center justify-between gap-2 mb-3 border-b border-zinc-800 pb-3">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            🕸️ IFM 7-Node Web Matrix (Select Node to Inspect):
          </span>
          <span class="text-xs text-zinc-400 font-sans">Interactive Functional Nodes</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          @for (node of ifmNodes; track node.id) {
            <button type="button" (click)="selectedIfmNode.set(node.name)"
                    [class]="selectedIfmNode() === node.name ? 'bg-emerald-500 text-zinc-950 font-black border-emerald-400 shadow-md' : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900'"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
              <span>{{ node.icon }}</span>
              <span>{{ node.name }}</span>
            </button>
          }
        </div>

        @let activeNodeData = getActiveNodeData();
        <div class="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-sans text-xs text-zinc-300">
          <div class="flex items-center gap-2 font-bold font-mono text-emerald-400 mb-1">
            <span>{{ activeNodeData.icon }}</span>
            <span class="uppercase tracking-wider">{{ activeNodeData.name }} System Node</span>
          </div>
          <p class="leading-relaxed text-zinc-400">
            {{ activeNodeData.description }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class FunctionalMedicineMatrixComponent {
  private patientState = inject(PatientStateService);

  readonly inflammatory = this.patientState.systemicInflammatoryBurden;
  readonly mitochondrial = this.patientState.mitochondrialEfficiencyScore;
  readonly gutBrain = this.patientState.gutBrainAxisScore;

  readonly flippedCards = signal<Set<string>>(new Set());

  private lastFlipTimeMap = new Map<string, number>();

  toggleCardFlip(id: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    const last = this.lastFlipTimeMap.get(id) || 0;
    if (now - last < 200) return;
    this.lastFlipTimeMap.set(id, now);
    const current = new Set(this.flippedCards());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.flippedCards.set(current);
  }

  isCardFlipped(id: string): boolean {
    return this.flippedCards().has(id);
  }

  readonly selectedIfmNode = signal<string>('Assimilation');

  readonly ifmNodes = [
    { id: 'assimilation', name: 'Assimilation', icon: '🍲', description: 'Digestion, absorption, microbiome balance, and GI tract barrier function.' },
    { id: 'defense', name: 'Defense & Repair', icon: '🛡️', description: 'Immune response, inflammatory cascade, infection control, and wound healing.' },
    { id: 'energy', name: 'Energy Production', icon: '⚡', description: 'Mitochondrial OxPhos, ATP turnover, citric acid cycle, and redox balance.' },
    { id: 'biotransformation', name: 'Biotransformation', icon: '🧪', description: 'Phase I/II hepatic detoxification, heavy metal excretion, and metabolic clearing.' },
    { id: 'communication', name: 'Communication', icon: '📡', description: 'Endocrine hormones, neurotransmitters, and cell signaling networks.' },
    { id: 'transport', name: 'Transport', icon: '🫀', description: 'Cardiovascular circulation, lymphatic drainage, and microvascular perfusion.' },
    { id: 'structural', name: 'Structural Integrity', icon: '🦴', description: 'Musculoskeletal framework, extracellular matrix, and cell membrane stability.' }
  ];

  getActiveNodeData() {
    const found = this.ifmNodes.find(n => n.name === this.selectedIfmNode());
    return found || this.ifmNodes[0];
  }
}
