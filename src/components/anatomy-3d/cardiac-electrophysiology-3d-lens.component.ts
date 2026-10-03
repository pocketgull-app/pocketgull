import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import { createCardiacElectrophysiologyMaterial, updateCardiacUniforms } from '../../shaders/cardiac-electrophysiology.shader';

export type CardiacElectrophysiologyMode = 'normal_sinus' | 'drug_induced_long_qtc' | 'severe_torsades_de_pointes' | 'hypokalemia_arrhythmia';

export interface ICardiacTelemetry {
  heartRateBpm: number;
  qtcIntervalMs: number;
  qtcStatus: 'Normal (< 440ms)' | 'Borderline (440 - 480ms)' | 'Prolonged (480 - 500ms)' | 'Critical QTc (> 500ms)';
  conductionVelocityMs: number;
  eadInstabilityPercent: number;
  arrhythmiaRiskTier: 'Quiescent Sinus Homeostasis' | 'Vulnerable Repolarization Window' | 'Critical Torsades de Pointes Hazard';
  dominantIonPhase: 'Phase 0 (I_Na Inward Upstroke)' | 'Phase 2 (I_Ca,L Plateau)' | 'Phase 3 (I_Kr/I_Ks Repolarization)' | 'Phase 4 (Diastolic Rest)';
}

@Component({
  selector: 'app-cardiac-electrophysiology-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-rose-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>⚡</span>
              <span>3D Cardiac Electrophysiology & Action Potential Conduction Lens (Visual Model V6)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              5-Phase Action Potential (I_Na, I_to, I_Ca,L, I_Kr/I_Ks, I_K1) • Drug-Induced Long QTc & EAD Oscillations • Torsades de Pointes Hazard
            </p>
          </div>
        </div>

        <!-- Presets Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button type="button" (click)="setRegime('normal_sinus')"
                  [class]="regime() === 'normal_sinus' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🟢</span>
            <span>Normal Sinus</span>
          </button>
          <button type="button" (click)="setRegime('drug_induced_long_qtc')"
                  [class]="regime() === 'drug_induced_long_qtc' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>💊</span>
            <span>Long QTc (hERG Block)</span>
          </button>
          <button type="button" (click)="setRegime('severe_torsades_de_pointes')"
                  [class]="regime() === 'severe_torsades_de_pointes' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🚨</span>
            <span>Torsades de Pointes</span>
          </button>
          <button type="button" (click)="setRegime('hypokalemia_arrhythmia')"
                  [class]="regime() === 'hypokalemia_arrhythmia' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🧪</span>
            <span>Hypokalemic EAD</span>
          </button>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div class="relative w-full h-[450px] bg-zinc-950 overflow-hidden">
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Playback & View Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 text-xs">
          <button (click)="togglePlay()" type="button"
                  class="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30 transition cursor-pointer">
            {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="toggleSpeed()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            {{ flowSpeed() }}x Speed
          </button>
          <button (click)="resetCamera()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            🎯 Reset Camera
          </button>
        </div>

        <!-- Floating Cardiac Telemetry HUD (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800/80 text-xs space-y-2 max-w-xs shadow-xl pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-rose-400">Ventricular Electrophysiology</span>
            <span class="text-[10px] font-mono text-zinc-400">{{ telemetry().heartRateBpm }} BPM</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <!-- QTc Interval -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">QTc Interval</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().qtcIntervalMs > 500 ? 'text-red-400' : (telemetry().qtcIntervalMs > 460 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().qtcIntervalMs }} ms
              </span>
            </div>

            <!-- EAD Instability -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">EAD Oscillation</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().eadInstabilityPercent > 50 ? 'text-red-400' : (telemetry().eadInstabilityPercent > 10 ? 'text-amber-400' : 'text-cyan-400')">
                {{ telemetry().eadInstabilityPercent }}%
              </span>
            </div>

            <!-- Conduction Velocity -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Velocity (Purkinje)</span>
              <span class="text-sm font-black font-sans text-zinc-200">
                {{ telemetry().conductionVelocityMs }} m/s
              </span>
            </div>

            <!-- QTc Clinical Tier -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">QTc Staging</span>
              <span class="text-[10px] font-bold font-sans block truncate"
                    [ngClass]="telemetry().qtcIntervalMs > 500 ? 'text-red-400' : (telemetry().qtcIntervalMs > 460 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().qtcStatus }}
              </span>
            </div>
          </div>

          <!-- Arrhythmia Risk Tier -->
          <div class="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
            <span class="text-zinc-400">Arrhythmia Hazard:</span>
            <span class="font-bold"
                  [ngClass]="telemetry().arrhythmiaRiskTier.includes('Critical') ? 'text-red-400 animate-pulse' : (telemetry().arrhythmiaRiskTier.includes('Vulnerable') ? 'text-amber-400' : 'text-emerald-400')">
              {{ telemetry().arrhythmiaRiskTier }}
            </span>
          </div>
        </div>

        <!-- Integrated Live ECG Strip HUD (Bottom Center) -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center bg-zinc-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-800 text-[10px] shadow-lg pointer-events-none sm:pointer-events-auto max-w-md w-full">
          <div class="flex items-center justify-between w-full text-zinc-400 text-[9px] uppercase font-bold border-b border-zinc-800 pb-1 mb-1">
            <span>Synchronized Lead II Rhythm Strip</span>
            <span [class.text-red-400]="telemetry().qtcIntervalMs > 500">
              {{ telemetry().qtcIntervalMs > 500 ? '⚠️ PROLONGED REPOLARIZATION' : 'PRISTINE ISOELECTRIC' }}
            </span>
          </div>

          <!-- Color Voltage Legend -->
          <div class="flex items-center gap-3 text-[10px] flex-wrap justify-center">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#26f2ff]"></span>
              <span class="text-zinc-300">Phase 0 (I_Na)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#fca826]"></span>
              <span class="text-zinc-300">Phase 2 (I_Ca,L)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#a633e6]"></span>
              <span class="text-zinc-300">Phase 3 (I_Kr)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#fa2640] animate-pulse"></span>
              <span class="text-zinc-300">EAD / TdP Risk</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Clinical & Biophysical Explainer -->
      <div class="p-4 bg-zinc-900 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans text-zinc-300">
        
        <!-- Phase 0: Rapid I_Na Upstroke -->
        <div class="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400 font-bold text-sm">01</span>
            <h4 class="font-bold text-zinc-100 text-xs">Phase 0 Sodium Upstroke</h4>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            Opening of voltage-gated Nav1.5 channels drives rapid sodium influx (dV/dt &gt; 250 V/s), rapidly shifting transmembrane potential from -90 mV to +25 mV to trigger coordinated mechanical systole.
          </p>
        </div>

        <!-- Phase 2: Calcium Plateau & Contraction -->
        <div class="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-amber-400 font-bold text-sm">02</span>
            <h4 class="font-bold text-zinc-100 text-xs">Phase 2 Calcium Plateau</h4>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            Inward L-type calcium current (Cav1.2) balances outward delayed rectifier potassium currents, sustaining depolarization for 250–350 ms and triggering Calcium-Induced Calcium Release (RyR2).
          </p>
        </div>

        <!-- Phase 3 & hERG Drug Vulnerability -->
        <div class="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-rose-400 font-bold text-sm">03</span>
            <h4 class="font-bold text-zinc-100 text-xs">hERG (I_Kr) Blockade & TdP</h4>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            Psychotropics and antiarrhythmics blocking the hERG pore delay repolarization (QTc &gt; 500 ms). Reactivated L-type calcium channels produce Early Afterdepolarizations (EADs), risking fatal Torsades de Pointes.
          </p>
        </div>

      </div>

    </div>
  `
})
export class CardiacElectrophysiology3dLensComponent implements AfterViewInit, OnDestroy {
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  // Simulation Controls & Reactive Signals
  readonly regime = signal<CardiacElectrophysiologyMode>('normal_sinus');
  readonly isPlaying = signal<boolean>(true);
  readonly flowSpeed = signal<number>(1.0);

  // Three.js Runtime References
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animFrameId?: number;
  private cardiacMaterial?: THREE.ShaderMaterial;
  private ventricleMesh?: THREE.Mesh;
  private lastTime = typeof performance !== 'undefined' ? performance.now() : 0;
  private getDelta(): number {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    return delta;
  }

  // Active Biophysical Parameters
  readonly currentHeartRate = signal<number>(72.0); // BPM
  readonly currentQtc = signal<number>(410.0);      // ms
  readonly currentVelocity = signal<number>(1.0);   // m/s
  readonly currentEad = signal<number>(0.0);        // 0.0 - 1.0
  readonly isLongQtcActive = signal<boolean>(false);

  readonly telemetry = computed<ICardiacTelemetry>(() => {
    const hr = this.currentHeartRate();
    const qtc = this.currentQtc();
    const vel = this.currentVelocity();
    const ead = this.currentEad();

    let qtcStatus: ICardiacTelemetry['qtcStatus'] = 'Normal (< 440ms)';
    if (qtc > 500) qtcStatus = 'Critical QTc (> 500ms)';
    else if (qtc >= 480) qtcStatus = 'Prolonged (480 - 500ms)';
    else if (qtc >= 440) qtcStatus = 'Borderline (440 - 480ms)';

    let arrhythmiaRiskTier: ICardiacTelemetry['arrhythmiaRiskTier'] = 'Quiescent Sinus Homeostasis';
    if (ead >= 0.7 || qtc > 540) {
      arrhythmiaRiskTier = 'Critical Torsades de Pointes Hazard';
    } else if (ead >= 0.2 || qtc >= 480) {
      arrhythmiaRiskTier = 'Vulnerable Repolarization Window';
    }

    return {
      heartRateBpm: Math.round(hr),
      qtcIntervalMs: Math.round(qtc),
      qtcStatus,
      conductionVelocityMs: Math.round(vel * 10) / 10,
      eadInstabilityPercent: Math.round(ead * 100),
      arrhythmiaRiskTier,
      dominantIonPhase: qtc > 500 ? 'Phase 3 (I_Kr/I_Ks Repolarization)' : 'Phase 2 (I_Ca,L Plateau)'
    };
  });

  ngAfterViewInit(): void {
    this.initThreeScene();
    this.setRegime('normal_sinus');
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  public setRegime(mode: CardiacElectrophysiologyMode): void {
    this.regime.set(mode);

    switch (mode) {
      case 'normal_sinus':
        this.currentHeartRate.set(72.0);
        this.currentQtc.set(410.0);
        this.currentVelocity.set(1.0);
        this.currentEad.set(0.0);
        this.isLongQtcActive.set(false);
        break;

      case 'drug_induced_long_qtc':
        this.currentHeartRate.set(76.0);
        this.currentQtc.set(510.0);
        this.currentVelocity.set(0.85);
        this.currentEad.set(0.35);
        this.isLongQtcActive.set(true);
        break;

      case 'severe_torsades_de_pointes':
        this.currentHeartRate.set(145.0);
        this.currentQtc.set(560.0);
        this.currentVelocity.set(0.65);
        this.currentEad.set(0.85);
        this.isLongQtcActive.set(true);
        break;

      case 'hypokalemia_arrhythmia':
        this.currentHeartRate.set(88.0);
        this.currentQtc.set(530.0);
        this.currentVelocity.set(0.75);
        this.currentEad.set(0.65);
        this.isLongQtcActive.set(true);
        break;
    }

    if (this.cardiacMaterial) {
      updateCardiacUniforms(this.cardiacMaterial, 0, {
        heartRateBpm: this.currentHeartRate(),
        qtcIntervalMs: this.currentQtc(),
        conductionVelocity: this.currentVelocity(),
        eadInstability: this.currentEad(),
        isLongQtcActive: this.isLongQtcActive()
      });
    }
  }

  public togglePlay(): void {
    this.isPlaying.update(p => !p);
  }

  public toggleSpeed(): void {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(this.flowSpeed()) + 1) % speeds.length;
    this.flowSpeed.set(speeds[nextIdx]);
  }

  public resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.8, 5.2);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  private initThreeScene(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    try {
      // 1. Scene & Camera Setup
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x09090b);

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 450;
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 2.8, 5.2);

      // 2. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(this.renderer.domElement);

      // 3. OrbitControls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 14;
      this.controls.minDistance = 2;

      // 4. Procedural Ventricle Geometry
      // Ventricular cone/ellipsoid geometry with apex at bottom
      const ventricleGeo = new THREE.ConeGeometry(1.7, 4.5, 64, 64, true);
      this.cardiacMaterial = createCardiacElectrophysiologyMaterial({
        heartRateBpm: this.currentHeartRate(),
        qtcIntervalMs: this.currentQtc(),
        conductionVelocity: this.currentVelocity(),
        eadInstability: this.currentEad(),
        isLongQtcActive: this.isLongQtcActive()
      });

      this.ventricleMesh = new THREE.Mesh(ventricleGeo, this.cardiacMaterial);
      this.ventricleMesh.rotation.x = Math.PI; // Invert cone so apex points down
      this.scene.add(this.ventricleMesh);

      // 5. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xf43f5e, 0.7);
      dirLight.position.set(2, 4, 3);
      this.scene.add(dirLight);

      // 6. Animation Loop
      this.animate();

    } catch (err) {
      console.warn('WebGL initialization skipped in headless context:', err);
    }
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.getDelta();

    if (this.isPlaying()) {
      const effectiveDelta = delta * this.flowSpeed();

      if (this.cardiacMaterial) {
        updateCardiacUniforms(this.cardiacMaterial, effectiveDelta);
      }

      if (this.ventricleMesh) {
        // Slow gentle yaw rotation for 360-degree spatial depth
        this.ventricleMesh.rotation.y += effectiveDelta * 0.2;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
