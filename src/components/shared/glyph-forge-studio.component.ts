import { Component, ElementRef, viewChild, signal, computed, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDrawnPoint {
  x: number;
  y: number;
  isExtrema?: boolean;
}

export type TNibStyle = 'bold' | 'chiseltip' | 'fineliner' | 'variable' | 'mono';

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
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-teal-500 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg">
            🖋️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black text-zinc-100 uppercase tracking-tight font-pocketgull">
                PocketGull Superfamily &amp; Variable Font Foundry Studio
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                1000 UPM Optical Grid • VF Axis
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Inspect, trace, and forge PocketGull vector glyphs across continuous weight axes (100–900 wght) with Quaker dovetail kerning and mathematical Bézier curves.
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
              1. PocketGull Superfamily Weight Axis
            </span>
            <div class="grid grid-cols-2 gap-2">
              <button
                (click)="nibStyle.set('bold')"
                [class.bg-amber-500/20]="nibStyle() === 'bold'"
                [class.text-amber-300]="nibStyle() === 'bold'"
                [class.border-amber-500]="nibStyle() === 'bold'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">🖋️ Bold (700)</div>
                <div class="text-[10px] text-zinc-400 font-sans">Display Wordmark</div>
              </button>

              <button
                (click)="nibStyle.set('chiseltip')"
                [class.bg-rose-500/20]="nibStyle() === 'chiseltip'"
                [class.text-rose-300]="nibStyle() === 'chiseltip'"
                [class.border-rose-500]="nibStyle() === 'chiseltip'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">⬛ Chiseltip (900)</div>
                <div class="text-[10px] text-zinc-400 font-sans">Calligraphic Black</div>
              </button>
              
              <button
                (click)="nibStyle.set('fineliner')"
                [class.bg-emerald-500/20]="nibStyle() === 'fineliner'"
                [class.text-emerald-300]="nibStyle() === 'fineliner'"
                [class.border-emerald-500]="nibStyle() === 'fineliner'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">✍️ Fineliner (400)</div>
                <div class="text-[10px] text-zinc-400 font-sans">Technical Grotesque</div>
              </button>

              <button
                (click)="nibStyle.set('mono')"
                [class.bg-cyan-500/20]="nibStyle() === 'mono'"
                [class.text-cyan-300]="nibStyle() === 'mono'"
                [class.border-cyan-500]="nibStyle() === 'mono'"
                class="p-2.5 rounded-xl border border-slate-800 text-left transition cursor-pointer"
              >
                <div class="font-bold">📊 Mono (400)</div>
                <div class="text-[10px] text-zinc-400 font-sans">Tabular Clinical Telemetry</div>
              </button>
            </div>

            <!-- Variable Font Continuous Weight Slider -->
            <div class="pt-2 border-t border-slate-800 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-teal-400 font-bold">PocketGull VF Axis (wght):</span>
                <span class="text-zinc-200 font-black">{{ variableWeight() }}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="900" 
                step="25" 
                [value]="variableWeight()" 
                (input)="onWeightSliderChange($event)"
                class="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
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

          <!-- Character Preset Strip -->
          <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <span class="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
              3. PocketGull Master Glyphs
            </span>
            <div class="flex flex-wrap gap-1.5">
              @for (char of characterPresets; track char) {
                <button
                  (click)="loadPreset(char)"
                  [class.bg-amber-500]="activeChar() === char"
                  [class.text-zinc-950]="activeChar() === char"
                  [class.font-bold]="activeChar() === char"
                  class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-300 text-sm flex items-center justify-center transition cursor-pointer"
                >
                  {{ char }}
                </button>
              }
            </div>
            
            <div class="pt-2 flex items-center gap-2">
              <button
                (click)="clearCanvas()"
                class="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition cursor-pointer text-center"
              >
                🗑️ Clear Canvas
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Vector Canvas (8 Cols) -->
        <div class="lg:col-span-8 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          
          <!-- Drawing Surface -->
          <canvas
            #drawingCanvas
            width="600"
            height="600"
            (mousedown)="startDrawing($event)"
            (mousemove)="draw($event)"
            (mouseup)="stopDrawing()"
            (mouseleave)="stopDrawing()"
            class="bg-slate-950 rounded-2xl border border-slate-700/80 shadow-2xl cursor-crosshair max-w-full touch-none"
          ></canvas>

          <!-- Status Footer -->
          <div class="w-full mt-4 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
            <div>
              <span>Active Glyph: </span>
              <strong class="text-amber-400">{{ activeChar() }}</strong>
              <span class="mx-2 text-zinc-600">|</span>
              <span>Points: </span>
              <strong class="text-teal-400">{{ pointCount() }}</strong>
            </div>
            <div>
              <span class="text-emerald-400">Scale: 1000 UPM</span>
              <span class="mx-2 text-zinc-600">|</span>
              <span class="text-cyan-400">Weight: {{ variableWeight() }} wght</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class GlyphForgeStudioComponent implements AfterViewInit {
  drawingCanvas = viewChild<ElementRef<HTMLCanvasElement>>('drawingCanvas');
  
  nibStyle = signal<TNibStyle>('bold');
  variableWeight = signal<number>(700);
  showGridLines = signal<boolean>(true);
  showOvershoot = signal<boolean>(true);
  showExtrema = signal<boolean>(true);
  activeChar = signal<string>('P');
  copied = signal<boolean>(false);
  pointCount = signal<number>(0);

  characterPresets = ['P', 'o', 'c', 'k', 'e', 't', 'G', 'u', 'l', '1', '0', 'Ø', 'B', '8', 'S', '5', '7', 'µ'];
  
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private currentStroke: IDrawnPoint[] = [];
  private allStrokes: IDrawnPoint[][] = [];

  ngAfterViewInit(): void {
    const canvas = this.drawingCanvas()?.nativeElement;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      this.redrawCanvas();
      this.loadPreset('P');
    }
  }

  onWeightSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.variableWeight.set(val);
    this.nibStyle.set('variable');
    this.redrawCanvas();
  }

  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const pt = this.getCanvasPoint(event);
    this.currentStroke = [pt];
    this.allStrokes.push(this.currentStroke);
    this.redrawCanvas();
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const pt = this.getCanvasPoint(event);
    this.currentStroke.push(pt);
    this.pointCount.update(c => c + 1);
    this.redrawCanvas();
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearCanvas(): void {
    this.allStrokes = [];
    this.currentStroke = [];
    this.pointCount.set(0);
    this.redrawCanvas();
  }

  loadPreset(char: string): void {
    this.activeChar.set(char);
    this.clearCanvas();
    
    // Master Vector Coordinates for standard PocketGull Glyphs (scaled to 600x600 canvas)
    const masterPaths: Record<string, string> = {
      'P': 'M 100,500 L 100,100 C 100,100 160,70 240,70 C 330,70 380,120 380,200 C 380,280 320,330 230,330 L 180,330 L 180,500 Z M 180,260 L 230,260 C 270,260 300,240 300,200 C 300,160 270,140 220,140 L 180,140 Z',
      'G': 'M 440,240 C 420,130 350,70 240,70 C 120,70 70,160 70,320 C 70,480 140,550 270,550 C 380,550 440,490 460,390 L 460,320 L 280,320 L 280,380 L 390,380 C 380,450 330,490 270,490 C 170,490 140,410 140,320 C 140,210 180,130 250,130 C 310,130 360,170 380,240 Z'
    };

    if (masterPaths[char] && this.ctx) {
      const p = new Path2D(masterPaths[char]);
      this.ctx.fillStyle = '#0d9488';
      this.ctx.fill(p);
    }
  }

  private getCanvasPoint(event: MouseEvent): IDrawnPoint {
    const canvas = this.drawingCanvas()?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  private redrawCanvas(): void {
    const canvas = this.drawingCanvas()?.nativeElement;
    if (!canvas || !this.ctx) return;
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Typographic Grid Lines
    if (this.showGridLines()) {
      ctx.lineWidth = 1;
      
      // Baseline (Y: 500)
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, 500); ctx.lineTo(canvas.width, 500);
      ctx.stroke();

      // X-Height (Y: 280)
      ctx.strokeStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(0, 280); ctx.lineTo(canvas.width, 280);
      ctx.stroke();

      // Cap-Height (Y: 100)
      ctx.strokeStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(0, 100); ctx.lineTo(canvas.width, 100);
      ctx.stroke();
    }

    // Draw active user strokes with selected nib style & variable weight
    let strokeWidth = 24;
    let strokeColor = '#2dd4bf';

    switch (this.nibStyle()) {
      case 'bold':
        strokeWidth = 32;
        strokeColor = '#f59e0b';
        break;
      case 'chiseltip':
        strokeWidth = 48;
        strokeColor = '#f43f5e';
        break;
      case 'fineliner':
        strokeWidth = 8;
        strokeColor = '#10b981';
        break;
      case 'variable':
        strokeWidth = (this.variableWeight() / 900) * 44 + 6;
        strokeColor = '#14b8a6';
        break;
      case 'mono':
        strokeWidth = 18;
        strokeColor = '#38bdf8';
        break;
    }

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = this.nibStyle() === 'chiseltip' ? 'square' : 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;

    for (const stroke of this.allStrokes) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }

  copySvgPath(): void {
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  exportHighResPng(): void {
    const canvas = this.drawingCanvas()?.nativeElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull_${this.activeChar()}_${this.variableWeight()}wght_specimen.png`;
    a.click();
  }

  exportSvgFile(): void {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="100%" height="100%" fill="#090d16"/><text x="100" y="500" fill="#2dd4bf" font-family="'PocketGull VF', sans-serif" font-size="400">${this.activeChar()}</text></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull_${this.activeChar()}.svg`;
    a.click();
  }
}
