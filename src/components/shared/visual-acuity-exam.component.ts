import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualAcuityService, IOptotypeLine, TumblingEDirection, IExamResult, IIshiharaPlate } from '../../services/visual-acuity.service';

type ExamStage = 'CALIBRATION' | 'ACUITY' | 'ASTIGMATISM' | 'AMSLER' | 'ISHIHARA' | 'RESULTS';

@Component({
  selector: 'app-visual-acuity-exam',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl border border-teal-500/30 bg-zinc-950/95 backdrop-blur-2xl p-6 shadow-2xl text-zinc-100 font-sans max-w-2xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xl">
            👁️
          </div>
          <div>
            <h3 class="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Clinical Visual Acuity &amp; Eye Exam</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                LogMAR / ETDRS
              </span>
            </h3>
            <span class="text-xs text-zinc-400 font-mono">
              ISO 8596:2017 &bull; Snellen &bull; Amsler Grid &bull; Ishihara
            </span>
          </div>
        </div>

        <button 
          (click)="restartExam()"
          class="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 transition"
        >
          ↺ Reset
        </button>
      </div>

      <!-- ══ STAGE 1: CALIBRATION ══════════════════════════════════════════════ -->
      @if (stage() === 'CALIBRATION') {
        <div class="space-y-5">
          <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h4 class="text-sm font-bold text-amber-400 flex items-center gap-2">
              <span>📏 Step 1: Screen Calibration</span>
            </h4>
            <p class="text-xs text-zinc-300 leading-relaxed">
              To ensure 100% optical accuracy (1 arcminute stroke width at your viewing distance), place a standard bank card or ID against the blue box below and adjust the slider until they match exactly.
            </p>

            <!-- Card Calibration Box -->
            <div class="flex justify-center py-2">
              <div 
                [style.width.px]="cardWidthPx()"
                style="height: 54px;" 
                class="border-2 border-dashed border-teal-400 rounded-xl bg-teal-500/10 flex items-center justify-center text-xs font-mono text-teal-300 transition-all duration-75 shadow-inner"
              >
                Standard Card Width (85.6 mm)
              </div>
            </div>

            <!-- Slider -->
            <div class="flex items-center gap-4">
              <span class="text-xs text-zinc-400 font-mono">Smaller</span>
              <input 
                type="range" 
                min="200" 
                max="450" 
                [value]="cardWidthPx()" 
                (input)="onCardWidthChange($event)"
                class="w-full accent-teal-400 cursor-pointer"
              />
              <span class="text-xs text-zinc-400 font-mono">Larger</span>
            </div>

            <!-- Distance & Eye Selector -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="space-y-1">
                <label class="text-[11px] font-mono text-zinc-400">Viewing Distance</label>
                <div class="flex gap-2">
                  <button 
                    (click)="distanceCm.set(50)"
                    [class.border-teal-400]="distanceCm() === 50"
                    [class.bg-teal-500-10]="distanceCm() === 50"
                    class="flex-1 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 font-mono"
                  >
                    50 cm (Arm)
                  </button>
                  <button 
                    (click)="distanceCm.set(100)"
                    [class.border-teal-400]="distanceCm() === 100"
                    [class.bg-teal-500-10]="distanceCm() === 100"
                    class="flex-1 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 font-mono"
                  >
                    100 cm (1m)
                  </button>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-mono text-zinc-400">Testing Eye</label>
                <div class="flex gap-2">
                  <button 
                    (click)="testedEye.set('OU')"
                    [class.border-teal-400]="testedEye() === 'OU'"
                    class="flex-1 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 font-mono"
                  >
                    Both (OU)
                  </button>
                  <button 
                    (click)="testedEye.set('OD')"
                    [class.border-teal-400]="testedEye() === 'OD'"
                    class="flex-1 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 font-mono"
                  >
                    Right (OD)
                  </button>
                  <button 
                    (click)="testedEye.set('OS')"
                    [class.border-teal-400]="testedEye() === 'OS'"
                    class="flex-1 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 font-mono"
                  >
                    Left (OS)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button 
            (click)="startAcuityTest()"
            class="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20"
          >
            <span>Begin Visual Acuity Exam</span>
            <span>→</span>
          </button>
        </div>
      }

      <!-- ══ STAGE 2: TUMBLING E ACUITY ═══════════════════════════════════════ -->
      @if (stage() === 'ACUITY') {
        <div class="space-y-5 text-center">
          
          <!-- Progress & Snellen Line Info -->
          <div class="flex justify-between items-center text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Line: <strong class="text-teal-400">{{ currentLine().snellenFraction }}</strong> (LogMAR {{ currentLine().logMarScore.toFixed(1) }})</span>
            <span>Progress: {{ currentQuestionIndex() + 1 }} / {{ totalQuestionsInLine }}</span>
          </div>

          <!-- The Optotype Display Box -->
          <div class="h-64 bg-white rounded-2xl flex items-center justify-center p-6 shadow-inner relative select-none">
            <!-- Vector Tumbling E -->
            <svg 
              [style.width.px]="currentOptotypeHeightPx()"
              [style.height.px]="currentOptotypeHeightPx()"
              viewBox="0 0 100 100" 
              class="transition-transform duration-150"
              [style.transform]="getRotationTransform(currentDirection())"
            >
              <!-- Standard 5x5 Grid E (1 arcmin stroke, 1 arcmin gap) -->
              <rect x="0" y="0" width="20" height="100" fill="#09090b" />
              <rect x="20" y="0" width="80" height="20" fill="#09090b" />
              <rect x="20" y="40" width="70" height="20" fill="#09090b" />
              <rect x="20" y="80" width="80" height="20" fill="#09090b" />
            </svg>
          </div>

          <p class="text-xs text-zinc-400 font-mono">
            Which direction are the prongs of the "E" pointing? (Use buttons or Arrow keys)
          </p>

          <!-- Interactive Direction Buttons -->
          <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div></div>
            <button 
              (click)="submitAnswer('UP')"
              class="py-3 bg-zinc-800 hover:bg-teal-500 hover:text-zinc-950 rounded-xl font-bold text-lg border border-zinc-700 transition"
            >
              ↑ Up
            </button>
            <div></div>

            <button 
              (click)="submitAnswer('LEFT')"
              class="py-3 bg-zinc-800 hover:bg-teal-500 hover:text-zinc-950 rounded-xl font-bold text-lg border border-zinc-700 transition"
            >
              ← Left
            </button>
            <button 
              (click)="submitAnswer('DOWN')"
              class="py-3 bg-zinc-800 hover:bg-teal-500 hover:text-zinc-950 rounded-xl font-bold text-lg border border-zinc-700 transition"
            >
              ↓ Down
            </button>
            <button 
              (click)="submitAnswer('RIGHT')"
              class="py-3 bg-zinc-800 hover:bg-teal-500 hover:text-zinc-950 rounded-xl font-bold text-lg border border-zinc-700 transition"
            >
              → Right
            </button>
          </div>
        </div>
      }

      <!-- ══ STAGE 3: ASTIGMATISM CLOCK DIAL ═══════════════════════════════════ -->
      @if (stage() === 'ASTIGMATISM') {
        <div class="space-y-5 text-center">
          <div class="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            Step 2: Astigmatism Dial Screen
          </div>
          <h4 class="text-sm font-bold text-white">Look at the center of the clock dial below.</h4>
          <p class="text-xs text-zinc-300 max-w-md mx-auto">
            Do all the radial lines appear equally dark and sharp, or do some lines appear darker, thicker, or blurry compared to others?
          </p>

          <!-- Astigmatism Clock Dial SVG -->
          <div class="h-64 bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner">
            <svg viewBox="0 0 200 200" class="w-56 h-56">
              <!-- Center Fixation Dot -->
              <circle cx="100" cy="100" r="4" fill="#ef4444" />
              <!-- 12 Meridians (Every 30 degrees) -->
              @for (angle of [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]; track angle) {
                <line 
                  x1="100" y1="100" 
                  [attr.x2]="100 + 80 * getCos(angle)" 
                  [attr.y2]="100 + 80 * getSin(angle)" 
                  stroke="#09090b" 
                  stroke-width="2.5" 
                />
              }
            </svg>
          </div>

          <div class="flex gap-3 justify-center">
            <button 
              (click)="submitAstigmatism(false)"
              class="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold transition"
            >
              ✓ All Lines Look Equally Sharp
            </button>
            <button 
              (click)="submitAstigmatism(true)"
              class="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition"
            >
              ⚠️ Some Lines Look Darker / Blurry
            </button>
          </div>
        </div>
      }

      <!-- ══ STAGE 4: AMSLER GRID ══════════════════════════════════════════════ -->
      @if (stage() === 'AMSLER') {
        <div class="space-y-5 text-center">
          <div class="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
            Step 3: Amsler Grid (Macula &amp; Retina Screen)
          </div>
          <h4 class="text-sm font-bold text-white">Focus on the center black dot.</h4>
          <p class="text-xs text-zinc-300 max-w-md mx-auto">
            While looking at the center dot, do any grid lines look wavy, distorted, bent, or are any areas dark/missing?
          </p>

          <!-- Amsler Grid SVG -->
          <div class="h-64 bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner">
            <svg viewBox="0 0 200 200" class="w-56 h-56">
              <!-- Grid Background -->
              <rect width="200" height="200" fill="#ffffff" />
              <!-- Grid lines -->
              @for (x of [20, 40, 60, 80, 100, 120, 140, 160, 180]; track x) {
                <line [attr.x1]="x" y1="10" [attr.x2]="x" y2="190" stroke="#09090b" stroke-width="1" />
                <line x1="10" [attr.y1]="x" x2="190" [attr.y2]="x" stroke="#09090b" stroke-width="1" />
              }
              <!-- Center Fixation Dot -->
              <circle cx="100" cy="100" r="3.5" fill="#09090b" />
            </svg>
          </div>

          <div class="flex gap-3 justify-center">
            <button 
              (click)="nextToIshihara()"
              class="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold transition"
            >
              ✓ Grid is Completely Straight &amp; Clear
            </button>
            <button 
              (click)="nextToIshihara()"
              class="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-bold transition"
            >
              ⚠️ Wavy / Distorted Lines Detected
            </button>
          </div>
        </div>
      }

      <!-- ══ STAGE 5: ISHIHARA COLOR VISION ════════════════════════════════════ -->
      @if (stage() === 'ISHIHARA') {
        <div class="space-y-5 text-center">
          <div class="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
            Step 4: Ishihara Red-Green Color Vision Plate
          </div>
          <h4 class="text-sm font-bold text-white">What number do you see in the circle below?</h4>

          <!-- Plate Visual Representation -->
          <div class="h-60 bg-zinc-900 rounded-2xl flex items-center justify-center p-4 border border-zinc-800">
            <div class="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-600 via-lime-500 to-green-700 flex items-center justify-center shadow-inner relative overflow-hidden">
              <span class="text-5xl font-black text-orange-500 tracking-tight select-none opacity-90 drop-shadow-md">
                {{ currentIshiharaPlate().correctAnswer }}
              </span>
            </div>
          </div>

          <!-- Multiple Choice Options -->
          <div class="flex flex-wrap justify-center gap-3">
            @for (opt of [currentIshiharaPlate().correctAnswer, '3', '70', 'Nothing']; track opt) {
              <button 
                (click)="submitIshihara(opt)"
                class="px-6 py-2 rounded-xl bg-zinc-800 hover:bg-teal-500 hover:text-zinc-950 border border-zinc-700 font-mono text-sm font-bold transition"
              >
                {{ opt }}
              </button>
            }
          </div>
        </div>
      }

      <!-- ══ STAGE 6: RESULTS & SCORECARD ══════════════════════════════════════ -->
      @if (stage() === 'RESULTS' && result(); as res) {
        <div class="space-y-5">
          <div class="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-teal-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
            
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span class="text-xs font-mono text-zinc-400">Eye Tested</span>
                <div class="text-base font-black text-white">
                  {{ res.eye === 'OU' ? 'Both Eyes (OU)' : res.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)' }}
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-mono text-zinc-400">Snellen Visual Acuity</span>
                <div class="text-2xl font-black text-teal-300 font-mono">
                  {{ res.snellenFraction }}
                </div>
              </div>
            </div>

            <!-- Quantitative Metrics Grid -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div class="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span class="text-zinc-400 block text-[10px]">LogMAR Score</span>
                <strong class="text-white text-sm">{{ res.logMar.toFixed(1) }}</strong>
              </div>
              <div class="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span class="text-zinc-400 block text-[10px]">ETDRS Points</span>
                <strong class="text-amber-300 text-sm">{{ res.etdrsScore }}/85</strong>
              </div>
              <div class="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span class="text-zinc-400 block text-[10px]">Accuracy</span>
                <strong class="text-teal-300 text-sm">{{ res.accuracyPercentage }}%</strong>
              </div>
            </div>

            <!-- Plain English Translation -->
            <div class="bg-zinc-950/80 p-4 rounded-xl border border-teal-500/30 space-y-2">
              <h5 class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>✨ Plain English Summary</span>
              </h5>
              <p class="text-xs text-zinc-300 leading-relaxed">
                {{ res.plainEnglishSummary }}
              </p>
            </div>

            <!-- Recommendations -->
            <div class="space-y-1.5">
              <span class="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                Clinical Recommendations:
              </span>
              <ul class="text-xs text-zinc-300 space-y-1 pl-4 list-disc">
                @for (rec of res.clinicalRecommendations; track rec) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>

          </div>

          <div class="flex gap-3">
            <button 
              (click)="restartExam()"
              class="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700"
            >
              ↺ Test Other Eye
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class VisualAcuityExamComponent {
  private acuityService = new VisualAcuityService();

  readonly stage = signal<ExamStage>('CALIBRATION');
  readonly cardWidthPx = signal<number>(320);
  readonly distanceCm = signal<number>(50);
  readonly testedEye = signal<'OD' | 'OS' | 'OU'>('OU');

  // Optotype Testing State
  readonly currentLineIndex = signal<number>(0);
  readonly currentQuestionIndex = signal<number>(0);
  readonly correctInLine = signal<number>(0);
  readonly currentDirection = signal<TumblingEDirection>('RIGHT');
  readonly totalQuestionsInLine = 4;

  // Screening States
  readonly astigmatismNoted = signal<boolean>(false);
  readonly colorDeficiencyNoted = signal<boolean>(false);
  readonly result = signal<IExamResult | null>(null);

  readonly currentLine = computed(() => this.acuityService.OPTOTYPE_LINES[this.currentLineIndex()] || this.acuityService.OPTOTYPE_LINES[0]);
  readonly currentIshiharaPlate = computed(() => this.acuityService.ISHIHARA_PLATES[0]);

  readonly currentOptotypeHeightPx = computed(() => {
    // Standard credit card width = 85.60 mm
    const pixelsPerMm = this.cardWidthPx() / 85.60;
    return this.acuityService.calculateOptotypePixelHeight(this.currentLine(), this.distanceCm(), pixelsPerMm);
  });

  onCardWidthChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.cardWidthPx.set(val);
  }

  startAcuityTest() {
    this.currentLineIndex.set(0);
    this.currentQuestionIndex.set(0);
    this.correctInLine.set(0);
    this.generateNewDirection();
    this.stage.set('ACUITY');
  }

  private generateNewDirection() {
    const directions: TumblingEDirection[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const idx = Math.floor(Math.random() * directions.length);
    this.currentDirection.set(directions[idx]);
  }

  submitAnswer(chosen: TumblingEDirection) {
    const isCorrect = chosen === this.currentDirection();
    if (isCorrect) {
      this.correctInLine.update(c => c + 1);
    }

    const nextQ = this.currentQuestionIndex() + 1;
    if (nextQ < this.totalQuestionsInLine) {
      this.currentQuestionIndex.set(nextQ);
      this.generateNewDirection();
    } else {
      // Evaluate line passing (>= 3 out of 4 correct)
      const passed = this.correctInLine() >= 3;
      if (passed && this.currentLineIndex() < this.acuityService.OPTOTYPE_LINES.length - 1) {
        // Advance to smaller line
        this.currentLineIndex.update(i => i + 1);
        this.currentQuestionIndex.set(0);
        this.correctInLine.set(0);
        this.generateNewDirection();
      } else {
        // Acuity finished, move to Astigmatism
        this.stage.set('ASTIGMATISM');
      }
    }
  }

  submitAstigmatism(noted: boolean) {
    this.astigmatismNoted.set(noted);
    this.stage.set('AMSLER');
  }

  nextToIshihara() {
    this.stage.set('ISHIHARA');
  }

  submitIshihara(selected: string) {
    const isCorrect = selected === this.currentIshiharaPlate().correctAnswer;
    this.colorDeficiencyNoted.set(!isCorrect);

    const evaluated = this.acuityService.evaluateResults(
      this.testedEye(),
      this.currentLineIndex(),
      this.correctInLine(),
      this.totalQuestionsInLine,
      this.astigmatismNoted(),
      this.colorDeficiencyNoted()
    );
    this.result.set(evaluated);
    this.stage.set('RESULTS');
  }

  restartExam() {
    this.stage.set('CALIBRATION');
    this.result.set(null);
  }

  getRotationTransform(dir: TumblingEDirection): string {
    switch (dir) {
      case 'RIGHT': return 'rotate(0deg)';
      case 'DOWN': return 'rotate(90deg)';
      case 'LEFT': return 'rotate(180deg)';
      case 'UP': return 'rotate(270deg)';
    }
  }

  getCos(deg: number): number {
    return Math.cos((deg * Math.PI) / 180);
  }

  getSin(deg: number): number {
    return Math.sin((deg * Math.PI) / 180);
  }
}
