import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface IFloatingWord {
  id: string;
  text: string;
  category: 'neurotransmitter' | 'frequency' | 'affirmation' | 'botanical';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  vx: number;
  vy: number;
  scale: number;
  phase: number;
  emoji: string;
  details: string;
}

export interface IFloatingIsland {
  id: string;
  name: string;
  stateId: 'focus' | 'calm' | 'sleep' | 'creativity' | 'grounding';
  emoji: string;
  x: number;
  y: number;
  color: string;
  freq: string;
  targetOrganId: string;
}

@Component({
  selector: 'app-floating-water-consciousness',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-[480px] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl font-mono select-none">
      
      <!-- Interactive Water Fluid Canvas -->
      <canvas #waterCanvas (click)="onCanvasClick($event)" (mousemove)="onCanvasMouseMove($event)"
        class="absolute inset-0 w-full h-full cursor-crosshair z-0"></canvas>

      <!-- Glassmorphic Water Overlay & Ambient Light -->
      <div class="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/80 pointer-events-none z-10"></div>

      <!-- Section Header Overlay (Dieter Rams Braun Style) -->
      <div class="absolute top-5 left-6 right-6 flex items-center justify-between z-20 pointer-events-none font-mono">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"></span>
            <h3 class="text-xs font-black uppercase tracking-widest text-zinc-100">
              🌊 Aquatic Consciousness & Floating Archipelagos
            </h3>
          </div>
          <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
            Click anywhere on the fluid surface to cast water ripples. Interactive words float in real-time buoyancy.
          </p>
        </div>

        <div class="hidden sm:flex items-center gap-2 font-mono text-[10px]">
          <span class="px-2.5 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
            Fluid Hydrodynamics: Active
          </span>
        </div>
      </div>

      <!-- Floating City Islands / Archipelagos -->
      <div class="absolute inset-0 z-20 pointer-events-none">
        @for (island of islands; track island.id) {
          <div (click)="selectIsland(island)"
            class="absolute pointer-events-auto transition-transform duration-500 hover:scale-110 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
            [style.left.%]="island.x" [style.top.%]="island.y">
            
            <!-- Island Ring & Pulsing Ripple -->
            <div class="relative flex flex-col items-center">
              <div class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md flex flex-col items-center justify-center backdrop-blur-md transition group-hover:border-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <span class="text-xl group-hover:scale-125 transition-transform duration-300">{{ island.emoji }}</span>
              </div>
              
              <!-- Floating Island Title Label -->
              <div class="mt-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-center shadow-lg backdrop-blur-sm">
                <span class="text-[10px] font-bold text-zinc-200 block uppercase tracking-wider font-mono">{{ island.name }}</span>
                <span class="text-[8.5px] text-orange-400 block font-mono">{{ island.freq }}</span>
              </div>
            </div>

          </div>
        }
      </div>

      <!-- Buoyant Floating Interactive Words -->
      <div class="absolute inset-0 z-30 pointer-events-none">
        @for (word of floatingWords(); track word.id) {
          <div (click)="onWordClick(word)"
            class="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group"
            [style.left.%]="word.x" [style.top.%]="word.y"
            [style.transform]="'translate(-50%, -50%) translateY(' + (Math.sin(word.phase) * 6) + 'px)'">
            
            <div class="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 text-xs font-sans flex items-center gap-2 shadow-xl backdrop-blur-md group-hover:border-orange-500 group-hover:text-orange-400 group-hover:scale-110 transition-all duration-200">
              <span class="text-sm group-hover:rotate-12 transition-transform">{{ word.emoji }}</span>
              <span class="font-semibold text-[11px] font-mono tracking-tight">{{ word.text }}</span>
            </div>

          </div>
        }
      </div>

      <!-- Active Floating Word Details Modal Overlay -->
      @if (selectedWord(); as word) {
        <div class="absolute bottom-4 left-6 right-6 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-lg z-40 flex items-center justify-between gap-4 font-sans animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl shrink-0">
              {{ word.emoji }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold font-mono uppercase text-orange-400 tracking-wider">{{ word.text }}</h4>
                <span class="text-[9px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 font-mono uppercase border border-zinc-800">{{ word.category }}</span>
              </div>
              <p class="text-xs text-zinc-300 mt-0.5 leading-relaxed font-mono">
                {{ word.details }}
              </p>
            </div>
          </div>

          <button (click)="selectedWord.set(null)"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-mono text-xs font-bold transition cursor-pointer shrink-0 border border-zinc-800">
            ✕ Close
          </button>
        </div>
      }

    </div>
  `
})
export class FloatingWaterConsciousnessComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waterCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  patientState = inject(PatientStateService);
  Math = Math;

  islands: IFloatingIsland[] = [
    { id: 'isl-1', name: 'Gamma Sanctuary', stateId: 'focus', emoji: '⚡', x: 20, y: 35, color: 'indigo', freq: '40 Hz Gamma', targetOrganId: 'brain' },
    { id: 'isl-2', name: 'Alpha Lagoon', stateId: 'calm', emoji: '🧘', x: 50, y: 25, color: 'emerald', freq: '10 Hz Alpha', targetOrganId: 'heart' },
    { id: 'isl-3', name: 'Delta Atoll', stateId: 'sleep', emoji: '🌙', x: 80, y: 35, color: 'purple', freq: '2 Hz Delta', targetOrganId: 'head' },
    { id: 'isl-4', name: 'Theta Archipelago', stateId: 'creativity', emoji: '🎨', x: 35, y: 70, color: 'amber', freq: '6 Hz Theta', targetOrganId: 'brain' },
    { id: 'isl-5', name: 'Grounding Isle', stateId: 'grounding', emoji: '🛡️', x: 65, y: 70, color: 'rose', freq: '8 Hz Low Alpha', targetOrganId: 'stomach' }
  ];

  floatingWords = signal<IFloatingWord[]>([
    { id: 'w-1', text: '528 Hz Solfeggio', category: 'frequency', x: 28, y: 48, vx: 0.03, vy: 0.02, scale: 1, phase: 0, emoji: '🎵', details: 'Transformation frequency promoting vagal tone and cellular DNA harmony.' },
    { id: 'w-2', text: 'GABA-A Receptor', category: 'neurotransmitter', x: 58, y: 42, vx: -0.02, vy: 0.03, scale: 1, phase: 1.5, emoji: '🧬', details: 'Primary inhibitory neurotransmitter driving parasympathetic emotional calmness.' },
    { id: 'w-3', text: 'Anandamide Bliss', category: 'neurotransmitter', x: 42, y: 82, vx: 0.02, vy: -0.02, scale: 1, phase: 3, emoji: '✨', details: 'Endocannabinoid molecule associated with creative hypnagogic reverie.' },
    { id: 'w-4', text: 'Shen Anchored', category: 'affirmation', x: 72, y: 55, vx: -0.03, vy: -0.02, scale: 1, phase: 4.5, emoji: '☯️', details: 'TCM energetic state where spirit rests in the Heart Blood without agitation.' },
    { id: 'w-5', text: 'Glymphatic Rest', category: 'affirmation', x: 88, y: 48, vx: 0.01, vy: 0.03, scale: 1, phase: 2, emoji: '🌊', details: 'Parenchymal metabolic waste clearance triggered during deep slow-wave sleep.' },
    { id: 'w-6', text: 'Ashwagandha KSM-66', category: 'botanical', x: 15, y: 55, vx: 0.02, vy: -0.01, scale: 1, phase: 1, emoji: '🌱', details: 'Adaptogenic withanolides that blunt HPA-axis cortisol hyper-secretion.' },
    { id: 'w-7', text: 'Acetylcholine Flow', category: 'neurotransmitter', x: 25, y: 22, vx: -0.01, vy: 0.02, scale: 1, phase: 2.5, emoji: '⚡', details: 'Cholinergic synaptic neurotransmitter supporting prefrontal executive clarity.' }
  ]);

  selectedWord = signal<IFloatingWord | null>(null);

  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private ripples: Array<{ x: number; y: number; radius: number; maxRadius: number; opacity: number }> = [];

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }

  private onResize = () => {
    this.resizeCanvas();
  };

  private resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 480;
  }

  onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.ripples.push({ x, y, radius: 5, maxRadius: 140, opacity: 0.8 });

    const words = this.floatingWords();
    const updated = words.map(w => {
      const wx = (w.x / 100) * rect.width;
      const wy = (w.y / 100) * rect.height;
      const dx = wx - x;
      const dy = wy - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = (150 - dist) / 150;
        return {
          ...w,
          vx: w.vx + (dx / dist) * force * 0.15,
          vy: w.vy + (dy / dist) * force * 0.15
        };
      }
      return w;
    });
    this.floatingWords.set(updated);
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (Math.random() < 0.15) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.ripples.push({ x, y, radius: 2, maxRadius: 50, opacity: 0.3 });
    }
  }

  onWordClick(word: IFloatingWord) {
    this.selectedWord.set(word);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${word.text}. ${word.details}`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  selectIsland(island: IFloatingIsland) {
    this.patientState.selectedPartId.set(island.targetOrganId);
    this.patientState.anatomyViewMode.set('organs');
  }

  private animate = () => {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(9, 9, 11, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 1.5;
      r.opacity *= 0.96;

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(249, 115, 22, ${r.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (r.opacity < 0.01 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    const words = this.floatingWords();
    const updated = words.map(w => {
      let x = w.x + w.vx * 0.1;
      let y = w.y + w.vy * 0.1;
      let vx = w.vx * 0.99;
      let vy = w.vy * 0.99;

      if (x < 10 || x > 90) vx *= -1;
      if (y < 15 || y > 85) vy *= -1;

      return {
        ...w,
        x,
        y,
        vx,
        vy,
        phase: w.phase + 0.03
      };
    });
    this.floatingWords.set(updated);

    this.animFrameId = requestAnimationFrame(this.animate);
  };
}
