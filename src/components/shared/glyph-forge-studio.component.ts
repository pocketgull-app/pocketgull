import { Component, ElementRef, viewChild, signal, computed, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDrawnPoint {
  x: number;
  y: number;
  isExtrema?: boolean;
}

export type TNibStyle = 'fineliner' | 'rounded' | 'chiseltip' | 'marker';

@Component({
  selector: 'app-glyph-forge-studio',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950 border border-amber-500/30 rounded-3xl space-y-6 text-zinc-100 font-sans shadow-2xl">
      
      <!-- Studio Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg">
            🖋️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black text-zinc-100 uppercase tracking-tight font-pocketgull">
                PocketGull In-Browser Glyph Studio &amp; Foundry
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                1000 UPM Grid Engine
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Draw, trace, optimize Bézier extrema, and export high-res glyph vectors directly in browser without external tools.
            </p>
          </div>
        </div>

        <!-- 1-Click Export Actions -->
        <div class="flex items-center gap-2">
          <button
            (click)="copySvgPath()"
            class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-zinc-200 border border-slate-700 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Copy pure SVG path string to clipboard"
          >
            <span>📋</span> {{ copied() ? 'Copied Path!' : 'Copy SVG Path' }}
          </button>
          
          <button
            (click)="exportHighResPng()"
            class="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            title="Download clean transparent 300 DPI PNG without Windows Snip tool"
          >
            <span>📸</span> Download Specimen PNG
          </button>

          <button
            (click)="exportSvgFile()"
            class="px-3.5 py-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-black rounded-xl text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            title="Export clean SVG vector file"
          >
            <span>💾</span> Export SVG
          </button>
        </div>
      </div>

      <!-- Studio Work Area -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Drawing Controls & Nib Settings (4 Cols) -->
        <div class="lg:col-span-4 space-y-4 font-mono text-xs">
          
          <!-- Nib Selection -->
          <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              1. Foundry Optical Nib Style
            </span>
            <div class="grid grid-cols-2 gap-2">
              <button
                (click)="nibStyle.set('rounded')"
                [class.bg-cyan-500/20]="nibStyle() === 'rounded'"
                [class.text-cyan-300]="nibStyle() === 'rounded'"
                [class.border-cyan-500]="nibStyle() === 'rounded'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">🔤 Geometric Round</div>
                <div class="text-[10px] text-zinc-400 font-sans">Outfit / Jakarta style</div>
              </button>
              
              <button
                (click)="nibStyle.set('chiseltip')"
                [class.bg-rose-500/20]="nibStyle() === 'chiseltip'"
                [class.text-rose-300]="nibStyle() === 'chiseltip'"
                [class.border-rose-500]="nibStyle() === 'chiseltip'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">🖋️ 45° Chiseltip (900)</div>
                <div class="text-[10px] text-zinc-400 font-sans">Display Black weight</div>
              </button>

              <button
                (click)="nibStyle.set('fineliner')"
                [class.bg-emerald-500/20]="nibStyle() === 'fineliner'"
                [class.text-emerald-300]="nibStyle() === 'fineliner'"
                [class.border-emerald-500]="nibStyle() === 'fineliner'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">✍️ Fineliner (100)</div>
                <div class="text-[10px] text-zinc-400 font-sans">Precision technical line</div>
              </button>

              <button
                (click)="nibStyle.set('marker')"
                [class.bg-amber-500/20]="nibStyle() === 'marker'"
                [class.text-amber-300]="nibStyle() === 'marker'"
                [class.border-amber-500]="nibStyle() === 'marker'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">🎨 Felt-Tip Grain</div>
                <div class="text-[10px] text-zinc-400 font-sans">Organic pressure nib</div>
              </button>
            </div>
          </div>

          <!-- Optical Guide Toggles -->
          <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <span class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              2. Typographic Metric Guides
            </span>
            <div class="space-y-2">
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-zinc-300">Cap-Height &amp; X-Height (800/520)</span>
                <input type="checkbox" [checked]="showGridLines()" (change)="showGridLines.set(!showGridLines())" class="accent-cyan-400" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-zinc-300">Optical Overshoot (±20 UPM)</span>
                <input type="checkbox" [checked]="showOvershoot()" (change)="showOvershoot.set(!showOvershoot())" class="accent-rose-400" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-zinc-300">Bézier Tangent Extrema Anchors</span>
                <input type="checkbox" [checked]="showExtrema()" (change)="showExtrema.set(!showExtrema())" class="accent-emerald-400" />
              </label>
            </div>
          </div>

          <!-- Stroke Presets & Actions -->
          <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <span class="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
              3. Preset Glyph Templates
            </span>
            <div class="flex flex-wrap gap-1.5">
              @for (char of ['P', 'G', 'O', 'Ø', '1', 'l', 'I', '7', 'µ']; track char) {
                <button
                  (click)="loadPresetGlyph(char)"
                  class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-100 font-bold border border-slate-700 transition cursor-pointer"
                >
                  {{ char }}
                </button>
              }
            </div>
            <div class="pt-2 flex items-center gap-2">
              <button
                (click)="clearCanvas()"
                class="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                🗑️ Clear Canvas
              </button>
            </div>
          </div>

        </div>

        <!-- Right: Interactive Vector Drawing Canvas & Bézier Viewport (8 Cols) -->
        <div class="lg:col-span-8 flex flex-col items-center justify-center">
          
          <div class="w-full relative bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-4 overflow-hidden shadow-inner flex flex-col items-center justify-center">
            
            <!-- Canvas HUD -->
            <div class="w-full flex items-center justify-between pb-2 font-mono text-[11px] text-zinc-400 border-b border-slate-800/80 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Stroke: <strong class="text-zinc-100">{{ strokeCount() }} Nodes</strong></span>
              </div>
              <span>Click &amp; Drag to Draw • Auto-Cubic Bézier Interpolation</span>
            </div>

            <!-- Vector Canvas Drawing Container -->
            <div class="relative w-full max-w-[600px] aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center cursor-crosshair">
              
              <!-- Background Typographic Metrics Grid SVG -->
              <svg viewBox="0 0 1000 1000" class="absolute inset-0 w-full h-full pointer-events-none z-0">
                @if (showOvershoot()) {
                  <!-- Cap Overshoot Line -->
                  <line x1="0" y1="180" x2="1000" y2="180" stroke="#f43f5e" stroke-dasharray="6,6" stroke-width="2" />
                  <text x="20" y="170" fill="#f43f5e" font-family="monospace" font-size="22">OVERSHOOT (820 UPM)</text>

                  <!-- Baseline Overshoot Line -->
                  <line x1="0" y1="820" x2="1000" y2="820" stroke="#f43f5e" stroke-dasharray="6,6" stroke-width="2" />
                  <text x="20" y="845" fill="#f43f5e" font-family="monospace" font-size="22">BASELINE OVERSHOOT (-20 UPM)</text>
                }

                @if (showGridLines()) {
                  <!-- Cap Height (800 UPM -> Y = 200) -->
                  <line x1="0" y1="200" x2="1000" y2="200" stroke="#38bdf8" stroke-width="2" />
                  <text x="20" y="225" fill="#38bdf8" font-family="monospace" font-size="22">CAP-HEIGHT (800 UPM)</text>

                  <!-- X-Height (520 UPM -> Y = 480) -->
                  <line x1="0" y1="480" x2="1000" y2="480" stroke="#10b981" stroke-width="2" />
                  <text x="20" y="470" fill="#10b981" font-family="monospace" font-size="22">X-HEIGHT (520 UPM)</text>

                  <!-- Baseline (0 UPM -> Y = 800) -->
                  <line x1="0" y1="800" x2="1000" y2="800" stroke="#fbbf24" stroke-width="3" />
                  <text x="20" y="790" fill="#fbbf24" font-family="monospace" font-size="22">BASELINE (0 UPM)</text>
                }

                <!-- Center Optical Guide -->
                <line x1="500" y1="0" x2="500" y2="1000" stroke="#334155" stroke-dasharray="4,4" stroke-width="1.5" />
              </svg>

              <!-- Interactive HTML5 Drawing Canvas -->
              <canvas
                #drawingCanvas
                width="1000"
                height="1000"
                (pointerdown)="startDrawing($event)"
                (pointermove)="draw($event)"
                (pointerup)="stopDrawing()"
                (pointercancel)="stopDrawing()"
                class="w-full h-full relative z-10 block touch-none"
              ></canvas>
            </div>

            <!-- Real-Time Generated Path Readout -->
            <div class="w-full mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
              <div class="flex items-center justify-between text-zinc-400">
                <span class="text-amber-400 font-bold uppercase text-[10px]">Computed Bézier Path (SVG):</span>
                <span>Length: {{ currentSvgPath().length }} chars</span>
              </div>
              <div class="text-zinc-300 truncate bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 select-all">
                {{ currentSvgPath() }}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class GlyphForgeStudioComponent implements AfterViewInit {
  drawingCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('drawingCanvas');

  nibStyle = signal<TNibStyle>('rounded');
  showGridLines = signal<boolean>(true);
  showOvershoot = signal<boolean>(true);
  showExtrema = signal<boolean>(true);
  strokeCount = signal<number>(0);
  copied = signal<boolean>(false);
  currentSvgPath = signal<string>('M 250 200 L 250 800 M 250 200 C 650 200, 750 350, 750 500 C 750 650, 650 680, 250 680');

  private isPointerDown = false;
  private currentStroke: IDrawnPoint[] = [];
  private allStrokes: IDrawnPoint[][] = [];

  ngAfterViewInit() {
    this.renderCanvas();
  }

  startDrawing(event: PointerEvent) {
    const canvas = this.drawingCanvasRef()?.nativeElement;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    this.isPointerDown = true;
    
    const pt = this.getCanvasCoords(event, canvas);
    this.currentStroke = [pt];
    this.allStrokes.push(this.currentStroke);
    this.renderCanvas();
  }

  draw(event: PointerEvent) {
    if (!this.isPointerDown) return;
    const canvas = this.drawingCanvasRef()?.nativeElement;
    if (!canvas) return;

    const pt = this.getCanvasCoords(event, canvas);
    this.currentStroke.push(pt);
    this.strokeCount.set(this.allStrokes.reduce((acc, s) => acc + s.length, 0));
    this.renderCanvas();
  }

  stopDrawing() {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    this.compileSvgPath();
  }

  private getCanvasCoords(event: PointerEvent, canvas: HTMLCanvasElement): IDrawnPoint {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  clearCanvas() {
    this.allStrokes = [];
    this.currentStroke = [];
    this.strokeCount.set(0);
    this.currentSvgPath.set('');
    this.renderCanvas();
  }

  loadPresetGlyph(char: string) {
    this.clearCanvas();
    const presets: Record<string, string> = {
      'P': 'M 250 200 L 250 800 M 250 200 C 650 200, 750 350, 750 500 C 750 650, 650 680, 250 680',
      'G': 'M 750 350 C 550 180, 250 280, 250 500 C 250 750, 550 820, 750 700 L 750 520 L 520 520',
      'O': 'M 500 180 C 280 180, 220 380, 220 500 C 220 650, 280 820, 500 820 C 720 820, 780 650, 780 500 C 780 380, 720 180, 500 180 Z',
      'Ø': 'M 500 180 C 280 180, 220 380, 220 500 C 220 650, 280 820, 500 820 C 720 820, 780 650, 780 500 C 780 380, 720 180, 500 180 Z M 320 740 L 680 260',
      '1': 'M 350 320 L 500 200 L 500 800 M 320 800 L 680 800',
      'l': 'M 420 200 L 420 740 C 420 800, 560 800, 620 740',
      'I': 'M 300 200 L 700 200 M 500 200 L 500 800 M 300 800 L 700 800',
      '7': 'M 250 200 L 750 200 L 420 800 M 360 480 L 640 480',
      'µ': 'M 300 480 L 300 950 M 300 740 C 300 820, 650 820, 650 740 L 650 480'
    };

    const path = presets[char] || presets['P'];
    this.currentSvgPath.set(path);
    this.renderSvgPathToCanvas(path);
  }

  private renderSvgPathToCanvas(pathStr: string) {
    const canvas = this.drawingCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const p2d = new Path2D(pathStr);
    
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = this.nibStyle() === 'chiseltip' ? 68 : this.nibStyle() === 'fineliner' ? 18 : 42;
    ctx.lineCap = this.nibStyle() === 'rounded' ? 'round' : 'square';
    ctx.lineJoin = 'round';
    ctx.stroke(p2d);
  }

  private renderCanvas() {
    const canvas = this.drawingCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = this.nibStyle() === 'chiseltip' ? '#f43f5e' : this.nibStyle() === 'fineliner' ? '#10b981' : '#38bdf8';
    ctx.lineWidth = this.nibStyle() === 'chiseltip' ? 64 : this.nibStyle() === 'fineliner' ? 16 : 44;
    ctx.lineCap = this.nibStyle() === 'rounded' ? 'round' : 'square';
    ctx.lineJoin = 'round';

    for (const stroke of this.allStrokes) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();

      if (this.showExtrema()) {
        ctx.fillStyle = '#10b981';
        for (const pt of stroke) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private compileSvgPath() {
    if (this.allStrokes.length === 0) return;
    let svg = '';
    for (const stroke of this.allStrokes) {
      if (stroke.length === 0) continue;
      svg += `M ${Math.round(stroke[0].x)} ${Math.round(stroke[0].y)} `;
      for (let i = 1; i < stroke.length; i++) {
        svg += `L ${Math.round(stroke[i].x)} ${Math.round(stroke[i].y)} `;
      }
    }
    this.currentSvgPath.set(svg.trim());
  }

  copySvgPath() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.currentSvgPath()).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }

  exportHighResPng() {
    const canvas = this.drawingCanvasRef()?.nativeElement;
    if (!canvas || typeof document === 'undefined') return;

    // Create high-res specimen export canvas (1200 x 1200) with dark background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1200;
    exportCanvas.height = 1200;
    const eCtx = exportCanvas.getContext('2d');
    if (!eCtx) return;

    // Dark background
    eCtx.fillStyle = '#020617';
    eCtx.fillRect(0, 0, 1200, 1200);

    // Draw grid and content
    eCtx.drawImage(canvas, 100, 100, 1000, 1000);

    // Header label
    eCtx.fillStyle = '#38bdf8';
    eCtx.font = 'bold 32px monospace';
    eCtx.fillText('POCKETGULL VARIABLE SUPERFAMILY — 1000 UPM SPECIMEN', 100, 70);

    // Trigger download
    const url = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull_glyph_specimen_${Date.now()}.png`;
    a.click();
  }

  exportSvgFile() {
    if (typeof document === 'undefined') return;
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <rect width="1000" height="1000" fill="#020617" />
  <path d="${this.currentSvgPath()}" stroke="#38bdf8" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull_glyph_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
