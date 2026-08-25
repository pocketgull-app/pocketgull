import { Component, ChangeDetectionStrategy, signal, computed, inject, ElementRef, viewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-phantom-limb-mirror-therapy',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-10 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-purple-500/30 shadow-2xl font-sans relative overflow-hidden transition-all duration-500">
      
      <!-- Ambient Purple/Indigo Holographic Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-2 text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">
            <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            🪞 Neuromodulation & Rehabilitation Module
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Phantom Limb AVS Mirror Therapy
          </h2>
        </div>

        <div class="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <button (click)="targetLimb.set('r_arm')" [class.bg-purple-600]="targetLimb() === 'r_arm'" [class.text-white]="targetLimb() === 'r_arm'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            Right Arm
          </button>
          <button (click)="targetLimb.set('l_arm')" [class.bg-purple-600]="targetLimb() === 'l_arm'" [class.text-white]="targetLimb() === 'l_arm'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            Left Arm
          </button>
          <button (click)="targetLimb.set('r_leg')" [class.bg-purple-600]="targetLimb() === 'r_leg'" [class.text-white]="targetLimb() === 'r_leg'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            Right Leg
          </button>
        </div>
      </div>

      <!-- Main Grid: 3D Mirror Canvas + Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        <!-- Left 7 Cols: 3D Ghost Mirror Canvas -->
        <div class="lg:col-span-7 h-[380px] relative bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
          <div #rendererContainer class="w-full h-full"></div>

          <!-- Overlay HUD Controls -->
          <div class="absolute top-3 right-3 flex items-center gap-2 font-mono text-xs z-20">
            <button (click)="toggleMirrorAnimation()" [class.bg-purple-500]="isMirrorActive()" class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 font-bold border border-purple-500/40 transition cursor-pointer flex items-center gap-1.5">
              <span>{{ isMirrorActive() ? '⏸ Pause Motion' : '▶ Mirror Motion' }}</span>
            </button>
          </div>

          <div class="absolute bottom-3 left-3 font-mono text-[10.5px] text-zinc-400 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800">
            <span class="text-purple-300 font-bold">Ghost Limb Mesh:</span> Translucent Phantom Wireframe (174 Hz Resonance)
          </div>
        </div>

        <!-- Right 5 Cols: Web Audio AVS Synthesizer & Pain Tracker -->
        <div class="lg:col-span-5 space-y-4 font-mono flex flex-col justify-between">
          
          <!-- AVS Audio Control Box -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span>🎧</span> 174 Hz Anxiolytic Solfeggio Deck
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-bold">
                10 Hz Alpha
              </span>
            </div>

            <p class="text-xs text-zinc-300 font-sans leading-relaxed">
              Synthesizes a dual-channel 174 Hz Solfeggio carrier frequency with 10 Hz binaural beats to soothe parietal cortex phantom pain signals during visual mirror therapy.
            </p>

            <button (click)="toggleAvsAudio()" 
              [class.bg-purple-600]="isAvsAudioActive()"
              [class.hover:bg-purple-500]="isAvsAudioActive()"
              [class.bg-zinc-800]="!isAvsAudioActive()"
              [class.hover:bg-zinc-700]="!isAvsAudioActive()"
              class="w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-lg border border-purple-400/30">
              <span>{{ isAvsAudioActive() ? '🔊 Stop 174 Hz AVS Stream' : '🎧 Start 174 Hz Solfeggio AVS Stream' }}</span>
            </button>
          </div>

          <!-- Pain Severity Tracker Slider -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-400 font-bold">Phantom Pain Intensity:</span>
              <span class="text-rose-400 font-bold text-sm">{{ painLevel() }} / 10</span>
            </div>

            <input type="range" min="0" max="10" [value]="painLevel()" (input)="onPainChange($event)"
              class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500" />

            <div class="flex justify-between text-[9.5px] text-zinc-500 uppercase tracking-widest">
              <span>0 (Comfort)</span>
              <span>5 (Moderate)</span>
              <span>10 (Severe Pain)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class PhantomLimbMirrorTherapyComponent implements AfterViewInit, OnDestroy {
  private readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer');
  private readonly patientState = inject(PatientStateService);
  protected readonly themeService = inject(ThemeService);

  readonly targetLimb = signal<'r_arm' | 'l_arm' | 'r_leg'>('r_arm');
  readonly isMirrorActive = signal<boolean>(true);
  readonly isAvsAudioActive = signal<boolean>(false);
  readonly painLevel = signal<number>(6);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private ghostMeshGroup!: THREE.Group;
  private animationFrameId?: number;

  // Web Audio API Dual Oscillator
  private audioCtx?: AudioContext;
  private carrierOsc?: OscillatorNode;
  private binauralOsc?: OscillatorNode;

  ngAfterViewInit() {
    this.init3DMirrorCanvas();
  }

  private init3DMirrorCanvas() {
    const el = this.rendererContainer()?.nativeElement;
    if (!el) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.2, 2.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const pointLight = new THREE.PointLight(0xa855f7, 2, 10);
    pointLight.position.set(2, 3, 2);
    this.scene.add(ambientLight, pointLight);

    // Procedural Ghost Limb Wireframe Group
    this.ghostMeshGroup = new THREE.Group();

    // Normal Intact Limb (Solid Mesh)
    const intactGeo = new THREE.CylinderGeometry(0.12, 0.09, 1.2, 16);
    const intactMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
    const intactMesh = new THREE.Mesh(intactGeo, intactMat);
    intactMesh.position.set(-0.6, 0.8, 0);

    // Phantom Ghost Limb (Glowing Translucent Wireframe)
    const ghostGeo = new THREE.CylinderGeometry(0.12, 0.09, 1.2, 16);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.4 });
    const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
    ghostMesh.position.set(0.6, 0.8, 0);

    this.ghostMeshGroup.add(intactMesh, ghostMesh);
    this.scene.add(this.ghostMeshGroup);

    this.animate();
  }

  toggleMirrorAnimation() {
    this.isMirrorActive.set(!this.isMirrorActive());
  }

  toggleAvsAudio() {
    if (this.isAvsAudioActive()) {
      this.stopAvsAudio();
    } else {
      this.startAvsAudio();
    }
  }

  private startAvsAudio() {
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const carrierHz = 174; // Anxiolytic Solfeggio
      const binauralBeat = 10; // Alpha relaxation

      const merger = this.audioCtx.createChannelMerger(2);

      this.carrierOsc = this.audioCtx.createOscillator();
      this.carrierOsc.frequency.setValueAtTime(carrierHz, this.audioCtx.currentTime);

      this.binauralOsc = this.audioCtx.createOscillator();
      this.binauralOsc.frequency.setValueAtTime(carrierHz + binauralBeat, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      this.carrierOsc.connect(merger, 0, 0);
      this.binauralOsc.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(this.audioCtx.destination);

      this.carrierOsc.start();
      this.binauralOsc.start();
      this.isAvsAudioActive.set(true);
    } catch (e) {
      console.warn('Audio Context failed to initialize', e);
    }
  }

  private stopAvsAudio() {
    if (this.carrierOsc) { this.carrierOsc.stop(); this.carrierOsc.disconnect(); }
    if (this.binauralOsc) { this.binauralOsc.stop(); this.binauralOsc.disconnect(); }
    if (this.audioCtx) { this.audioCtx.close(); }
    this.isAvsAudioActive.set(false);
  }

  onPainChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.painLevel.set(val);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (this.isMirrorActive() && this.ghostMeshGroup) {
      const time = Date.now() * 0.003;
      const angle = Math.sin(time) * 0.25;
      this.ghostMeshGroup.children[0].rotation.z = angle;
      this.ghostMeshGroup.children[1].rotation.z = -angle; // Mirrored movement!
    }
    if (this.controls) this.controls.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.stopAvsAudio();
    if (this.renderer) this.renderer.dispose();
    if (this.controls) this.controls.dispose();
  }
}
