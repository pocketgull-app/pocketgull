import { Component, ChangeDetectionStrategy, inject, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhysioNetAcousticService, AuscultationSite } from '../services/physionet-acoustic.service';

@Component({
  selector: 'app-physionet-acoustic-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-rose-500/30 shadow-2xl font-mono text-zinc-100 relative overflow-hidden my-6">
      <!-- Ambient glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-rose-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header & Auscultation Site Selector -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse"></span>
            <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <span>🩺</span> PhysioNet MedGemma Acoustic PCG Stethoscope AI
            </h3>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 uppercase">
              20Hz-400Hz PCG Bandpass
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Phonocardiogram (PCG) acoustic wave envelope segmentation & MedGemma valvular murmur classifier.
          </p>
        </div>

        <!-- Auscultation Site Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap">
          @for (site of sites; track site) {
            <button (click)="selectSite(site)" type="button"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer"
                    [ngClass]="{
                      'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]': acousticService.activeSite() === site,
                      'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800': acousticService.activeSite() !== site
                    }">
              {{ site }}
            </button>
          }
        </div>
      </div>

      <!-- 60 FPS Phonocardiogram (PCG) Canvas Oscilloscope -->
      <div class="relative mb-6 z-10">
        <div class="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
          <span>Phonocardiogram (PCG) Acoustic Audio Envelope</span>
          <span class="text-rose-400 font-bold">S1 Peak: {{ acousticService.lastAnalysis().s1PeakFrequencyHz }}Hz | S2 Peak: {{ acousticService.lastAnalysis().s2PeakFrequencyHz }}Hz</span>
        </div>
        <div class="h-44 w-full bg-black rounded-2xl border border-zinc-800/80 overflow-hidden relative shadow-inner">
          <canvas #pcgCanvas class="w-full h-full block"></canvas>
          <div class="absolute top-2 left-3 text-[10px] font-mono text-zinc-500">
            Trace: PCG Phonocardiogram [20-400Hz] | Gain: 1.0x
          </div>
        </div>
      </div>

      <!-- Metrics Breakdown & Diagnostic Panel -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10 font-sans">
        
        <!-- 1. Murmur Presence & Grade -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Murmur Classification</span>
          <div class="mt-2 flex items-baseline gap-2 font-mono">
            <span class="text-xl font-black" [ngClass]="{
              'text-emerald-400': acousticService.lastAnalysis().presence === 'Absent',
              'text-rose-400 animate-pulse': acousticService.lastAnalysis().presence === 'Present'
            }">
              {{ acousticService.lastAnalysis().presence }}
            </span>
            <span class="text-xs font-bold text-zinc-400">({{ acousticService.lastAnalysis().grade }})</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2 font-mono">
            Timing: {{ acousticService.lastAnalysis().timing }}
          </span>
        </div>

        <!-- 2. Heart Rate & Confidence -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">MedGemma Confidence</span>
          <div class="mt-2 flex items-baseline gap-2 font-mono">
            <span class="text-xl font-black text-rose-300">
              {{ (acousticService.lastAnalysis().confidenceScore * 100).toFixed(1) }}%
            </span>
            <span class="text-xs text-zinc-400">HR {{ acousticService.lastAnalysis().heartRateBpm }} bpm</span>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2 font-mono">
            Model: MedGemma PCG Embedding v2
          </span>
        </div>

        <!-- 3. Simulation Controls -->
        <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Acoustic Sound Simulator</span>
          <div class="mt-2 flex items-center gap-2">
            <button (click)="runAnalysis(false)" type="button"
                    class="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition cursor-pointer">
              Normal PCG
            </button>
            <button (click)="runAnalysis(true)" type="button"
                    class="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono transition cursor-pointer">
              Murmur PCG
            </button>
          </div>
          <span class="text-[11px] text-zinc-500 mt-2 font-mono">
            Site: {{ acousticService.activeSite() }}
          </span>
        </div>

      </div>

      <!-- MedGemma Diagnostic Interpretation Box -->
      <div class="bg-zinc-900/70 rounded-2xl p-5 border border-zinc-800/80 relative z-10">
        <h4 class="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>🧠</span> MedGemma Electrophysiology & Murmur Diagnosis
        </h4>
        <p class="text-xs font-mono text-rose-200/90 leading-relaxed">
          {{ acousticService.lastAnalysis().diagnosticInterpretation }}
        </p>
      </div>
    </div>
  `
})
export class PhysioNetAcousticHudComponent implements AfterViewInit, OnDestroy {
  acousticService = inject(PhysioNetAcousticService);

  @ViewChild('pcgCanvas') pcgCanvasRef!: ElementRef<HTMLCanvasElement>;

  readonly sites: AuscultationSite[] = ['Aortic', 'Pulmonic', 'Tricuspid', 'Mitral/Apex'];

  private animFrameId: number | null = null;
  private step = 0;

  ngAfterViewInit() {
    this.startCanvasAnimation();
  }

  ngOnDestroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  selectSite(site: AuscultationSite) {
    this.acousticService.analyzeAcousticPcgStream(site, false);
  }

  runAnalysis(simulatedMurmur: boolean) {
    this.acousticService.analyzeAcousticPcgStream(this.acousticService.activeSite(), simulatedMurmur);
  }

  private startCanvasAnimation() {
    const canvas = this.pcgCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      this.step++;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 180);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // PCG Sound Envelope Draw
      const hasMurmur = this.acousticService.lastAnalysis().presence === 'Present';
      ctx.strokeStyle = hasMurmur ? '#f43f5e' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerY = height / 2;
      const period = 90;

      for (let x = 0; x < width; x++) {
        const phase = (x + this.step * 2) % period;
        let yOffset = 0;

        // S1 (lub, ~50 Hz peak)
        if (phase >= 10 && phase < 22) {
          yOffset = Math.sin(((phase - 10) / 12) * Math.PI) * 45;
        } 
        // S2 (dub, ~70 Hz peak)
        else if (phase >= 45 && phase < 54) {
          yOffset = Math.sin(((phase - 45) / 9) * Math.PI) * 35;
        }
        // Systolic Murmur Turbulence Energy Spectrum
        else if (hasMurmur && phase >= 22 && phase < 45) {
          yOffset = (Math.random() - 0.5) * 28;
        }

        const y = centerY - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }
}
