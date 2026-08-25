import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YogaAsanaCoachingService, IYogaAsanaPose } from '../services/yoga-asana-coaching.service';
import { DictationService } from '../services/dictation.service';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';
import { ClinicalIconComponent } from './shared/clinical-icon.component';

@Component({
  selector: 'app-yoga-asana-3d-coach',
  standalone: true,
  imports: [CommonModule, ClinicalIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-teal-500/40 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold shadow-inner">
            <app-clinical-icon name="YinYang" size="md" theme="tcm"></app-clinical-icon>
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              3D Somatic Yoga Asana & Movement Coach
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">SIGCHI AAA ACCESSIBLE</span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Interactive 3D skeletal pose animation, voice-guided breathing timing, and vagal decompression for spinal pain.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="selectCategory('all')"
                  [class.bg-teal-600]="categoryFilter() === 'all'"
                  [class.text-white]="categoryFilter() === 'all'"
                  [class.bg-gray-100]="categoryFilter() !== 'all'"
                  [class.dark:bg-zinc-800]="categoryFilter() !== 'all'"
                  [class.text-gray-700]="categoryFilter() !== 'all'"
                  [class.dark:text-zinc-300]="categoryFilter() !== 'all'"
                  class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center">
            All ({{ poses.length }})
          </button>
          <button (click)="selectCategory('yoga')"
                  [class.bg-teal-600]="categoryFilter() === 'yoga'"
                  [class.text-white]="categoryFilter() === 'yoga'"
                  [class.bg-gray-100]="categoryFilter() !== 'yoga'"
                  [class.dark:bg-zinc-800]="categoryFilter() !== 'yoga'"
                  [class.text-gray-700]="categoryFilter() !== 'yoga'"
                  [class.dark:text-zinc-300]="categoryFilter() !== 'yoga'"
                  class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1.5">
            <app-clinical-icon name="TridoshaVata" size="xs" theme="ayurvedic"></app-clinical-icon>
            Yoga Asanas
          </button>
          <button (click)="selectCategory('pt')"
                  [class.bg-teal-600]="categoryFilter() === 'pt'"
                  [class.text-white]="categoryFilter() === 'pt'"
                  [class.bg-gray-100]="categoryFilter() !== 'pt'"
                  [class.dark:bg-zinc-800]="categoryFilter() !== 'pt'"
                  [class.text-gray-700]="categoryFilter() !== 'pt'"
                  [class.dark:text-zinc-300]="categoryFilter() !== 'pt'"
                  class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1.5">
            <app-clinical-icon name="Stethoscope" size="xs" theme="western"></app-clinical-icon>
            Physical Therapy
          </button>
          <button (click)="categoryFilter.set('pilates')"
                  [class.bg-teal-600]="categoryFilter() === 'pilates'"
                  [class.text-white]="categoryFilter() === 'pilates'"
                  [class.bg-gray-100]="categoryFilter() !== 'pilates'"
                  [class.dark:bg-zinc-800]="categoryFilter() !== 'pilates'"
                  [class.text-gray-700]="categoryFilter() !== 'pilates'"
                  [class.dark:text-zinc-300]="categoryFilter() !== 'pilates'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
            🤸 Clinical Pilates
          </button>
          <button (click)="categoryFilter.set('procedural')"
                  [class.bg-teal-600]="categoryFilter() === 'procedural'"
                  [class.text-white]="categoryFilter() === 'procedural'"
                  [class.bg-gray-100]="categoryFilter() !== 'procedural'"
                  [class.dark:bg-zinc-800]="categoryFilter() !== 'procedural'"
                  [class.text-gray-700]="categoryFilter() !== 'procedural'"
                  [class.dark:text-zinc-300]="categoryFilter() !== 'procedural'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
            🧬 Procedural 245-Matrix
          </button>
        </div>
      </div>

      <!-- Procedural Asana Builder Panel -->
      <div *ngIf="categoryFilter() === 'procedural'" class="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl space-y-3 text-xs font-mono">
        <div class="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
          <span>🧬 245-Combinatorial 3D Biomechanical Pose Generator</span>
          <span class="text-[10px] text-teal-600 dark:text-teal-400">Procedural Mesh Synthesis Active</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] text-gray-500 dark:text-zinc-400 uppercase font-bold mb-1">Foundation Stance:</label>
            <select (change)="updateStance($event)" [value]="procStance()" class="w-full p-2 bg-white dark:bg-zinc-900 border border-teal-500/40 rounded-lg text-xs font-bold text-gray-800 dark:text-zinc-200">
              <option value="standing">Standing</option>
              <option value="seated">Seated</option>
              <option value="supine">Supine (Lying Back)</option>
              <option value="prone">Prone (Lying Belly)</option>
              <option value="kneeling">Kneeling</option>
              <option value="inversion">Inversion (Headstand)</option>
              <option value="tabletop">Tabletop</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] text-gray-500 dark:text-zinc-400 uppercase font-bold mb-1">Spinal Plane Action:</label>
            <select (change)="updateSpinalAction($event)" [value]="procSpine()" class="w-full p-2 bg-white dark:bg-zinc-900 border border-teal-500/40 rounded-lg text-xs font-bold text-gray-800 dark:text-zinc-200">
              <option value="flexion">Flexion (Forward Fold)</option>
              <option value="extension">Extension (Backbend)</option>
              <option value="sidebend">Sidebend (Lateral Flexion)</option>
              <option value="twist">Twist (Spinal Rotation)</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] text-gray-500 dark:text-zinc-400 uppercase font-bold mb-1">Arm / Leg Config:</label>
            <select (change)="updateArmLegConfig($event)" [value]="procLimb()" class="w-full p-2 bg-white dark:bg-zinc-900 border border-teal-500/40 rounded-lg text-xs font-bold text-gray-800 dark:text-zinc-200">
              <option value="overhead">Overhead Reach</option>
              <option value="eagle">Eagle Wrap</option>
              <option value="bound">Bound Arms</option>
              <option value="lotus">Lotus Crossing</option>
              <option value="wide">Wide Stance</option>
              <option value="single_leg">Single Leg Balance</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pose Selection Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <button *ngFor="let pose of filteredPoses()" 
                (click)="selectPose(pose)"
                [class.bg-teal-600]="selectedPose()?.id === pose.id"
                [class.text-white]="selectedPose()?.id === pose.id"
                [class.bg-teal-500\/5]="selectedPose()?.id !== pose.id"
                [class.text-gray-800]="selectedPose()?.id !== pose.id"
                [class.dark:text-zinc-200]="selectedPose()?.id !== pose.id"
                class="p-3.5 border border-teal-500/30 rounded-xl text-left transition cursor-pointer space-y-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <div class="flex justify-between items-center">
            <span class="font-black text-sm">{{ pose.name }}</span>
            <span class="text-[10px] font-mono opacity-80"><em>{{ pose.sanskritName }}</em></span>
          </div>
          <p class="text-[11px] opacity-90 leading-tight">
            {{ pose.primaryBenefit }}
          </p>
        </button>
      </div>

      <!-- Active Pose 3D Instructions & Voice Guide -->
      <div *ngIf="selectedPose() as pose" class="p-4 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-zinc-700 pb-3">
          <div>
            <h4 class="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              {{ pose.name }} ({{ pose.sanskritName }}) — 3D Joint Transformation
            </h4>
            <span class="text-xs text-teal-600 dark:text-teal-400 font-mono">
              Spine Angle: +{{ pose.jointTransformations.spineCurvatureDeg }}&deg; &bull; Hip Flexion: {{ pose.jointTransformations.hipFlexionDeg }}&deg;
            </span>
          </div>

          <button (click)="narrateInstructions(pose)" aria-label="Narrate yoga pose instructions aloud" class="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500">
            <span>🔊 Narrate Pose Aloud</span>
          </button>
        </div>

        <!-- Step-by-Step Instructions -->
        <div class="space-y-2 text-xs">
          <div class="font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
            Step-by-Step Somatic Instructions:
          </div>
          <ol class="list-decimal list-inside space-y-1 text-gray-800 dark:text-zinc-200 font-medium">
            <li *ngFor="let step of pose.instructions">{{ step }}</li>
          </ol>
        </div>

        <!-- Breath Rhythm Box with Bio-Haptic Feedback -->
        <div class="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-teal-900 dark:text-teal-300">
              🌬️ Guided Breath Cycle Timing:
            </span>
            <div class="font-mono text-teal-700 dark:text-teal-300 font-bold space-x-2">
              <span>Inhale {{ pose.breathTimingSec.inhale }}s</span> &bull;
              <span>Hold {{ pose.breathTimingSec.hold }}s</span> &bull;
              <span>Exhale {{ pose.breathTimingSec.exhale }}s</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="bioHaptic.playSolfeggioTone(528, 2500)" class="px-2.5 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 rounded font-mono text-[11px] font-bold hover:bg-amber-500/30 transition cursor-pointer">
              🎵 Play 528 Hz Solfeggio Tone
            </button>
            <button (click)="bioHaptic.triggerHapticPulse('inhale')" class="px-2.5 py-1 bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 rounded font-mono text-[11px] font-bold hover:bg-teal-500/30 transition cursor-pointer">
              📳 Haptic Breath Pulse
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class YogaAsana3dCoachComponent {
  private asanaService = inject(YogaAsanaCoachingService);
  private dictation = inject(DictationService);
  protected bioHaptic = inject(BioHapticFeedbackService);

  readonly poses: IYogaAsanaPose[] = this.asanaService.curatedAsanaLibrary;
  readonly selectedPose = signal<IYogaAsanaPose>(this.poses[0]);
  readonly categoryFilter = signal<'all' | 'yoga' | 'pt' | 'pilates' | 'procedural'>('all');

  readonly procStance = signal<'standing' | 'seated' | 'supine' | 'prone' | 'kneeling' | 'inversion' | 'tabletop'>('standing');
  readonly procSpine = signal<'flexion' | 'extension' | 'sidebend' | 'twist' | 'neutral'>('twist');
  readonly procLimb = signal<'overhead' | 'eagle' | 'bound' | 'lotus' | 'wide' | 'single_leg'>('overhead');

  readonly filteredPoses = computed(() => {
    const filter = this.categoryFilter();
    if (filter === 'yoga') return this.poses.filter((p: IYogaAsanaPose) => p.sanskritName !== 'Physical Therapy (PT)' && p.sanskritName !== 'Clinical Pilates');
    if (filter === 'pt') return this.poses.filter((p: IYogaAsanaPose) => p.sanskritName === 'Physical Therapy (PT)');
    if (filter === 'pilates') return this.poses.filter((p: IYogaAsanaPose) => p.sanskritName === 'Clinical Pilates');
    return this.poses;
  });

  updateStance(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.procStance.set(val);
    this.recomputeProceduralPose();
  }

  updateSpinalAction(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.procSpine.set(val);
    this.recomputeProceduralPose();
  }

  updateArmLegConfig(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.procLimb.set(val);
    this.recomputeProceduralPose();
  }

  private recomputeProceduralPose(): void {
    const pose = this.asanaService.generateProceduralAsana(
      this.procStance(),
      this.procSpine(),
      this.procLimb()
    );
    this.selectedPose.set(pose);
  }

  selectCategory(cat: 'all' | 'yoga' | 'pt' | 'pilates' | 'procedural'): void {
    this.categoryFilter.set(cat);
    this.bioHaptic.triggerHapticPulse('hold');
  }

  selectPose(pose: IYogaAsanaPose): void {
    this.selectedPose.set(pose);
    this.bioHaptic.triggerHapticPulse('inhale');
  }

  narrateInstructions(pose: IYogaAsanaPose): void {
    const text = `Guiding ${pose.name}, ${pose.sanskritName}. ${pose.instructions.join(' ')}`;
    this.dictation.speakResponse(text);
  }
}
