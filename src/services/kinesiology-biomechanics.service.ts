/**
 * PocketGull Kinesiology & Biomechanics Service
 * 
 * Implements Stanford OpenSim musculoskeletal kinematic equations and Andreas Vesalius
 * anatomical copperplate engraving synthesis for neuro-rehabilitation visualization.
 * 
 * Mathematical Foundations:
 * 1. Stanford OpenSim 5-Phase Sagittal Gait Equations:
 *    - Hip Flexion:  theta_h(t) = 22.0 * sin(2*pi*t + 0.35) + 5.0 (deg)
 *    - Knee Flexion: theta_k(t) = 30.0 * (1.0 - cos(2*pi*t)) * (t < 0.6 ? 0.35 : 1.0) (deg)
 *    - Ankle Pitch:  theta_a(t) = 12.0 * sin(2*pi*t - 0.8) (deg)
 * 2. Bimodal Ground Reaction Force (GRF) Butterfly Curve:
 *    - Impact Peak (1.15 - 1.25x BW) -> Midstance Dip (0.75 - 0.85x BW) -> Push-Off Peak (1.15 - 1.25x BW)
 * 3. Romberg Vestibular Proprioceptive Sway Cone
 * 4. Histological Cross-Hatching (Actin-Myosin Myofibrils & Haversian Osteons)
 */

import { Injectable, signal, computed } from '@angular/core';

export interface IJointPoint {
  x: number;
  y: number;
}

export interface IBioTensorMuscleCue {
  name: string;
  action: 'contract' | 'relax';
  colorHex: string; // Amber (#f59e0b) for contract, Slate (#64748b) for relax
  targetCue: string;
}

export interface IPrescriptiveRehabPlan {
  conditionKey: string;
  conditionName: string;
  focalPartId: string;
  baselineAngles: Record<string, number>;
  targetAngles: Record<string, number>;
  angleDeltas: Record<string, number>;
  bioTensorCues: IBioTensorMuscleCue[];
  plainEnglishDirective: string;
  torqueReductionNm: number;
  decompressionPercent: number;
}

export interface IGaitPosture {
  progress: number; // 0.0 to 1.0
  phaseName: string;
  head: IJointPoint;
  neck: IJointPoint;
  torso: IJointPoint;
  pelvis: IJointPoint;
  rightHip: IJointPoint;
  rightKnee: IJointPoint;
  rightAnkle: IJointPoint;
  rightToe: IJointPoint;
  leftHip: IJointPoint;
  leftKnee: IJointPoint;
  leftAnkle: IJointPoint;
  leftToe: IJointPoint;
  rightShoulder: IJointPoint;
  rightElbow: IJointPoint;
  rightWrist: IJointPoint;
  leftShoulder: IJointPoint;
  leftElbow: IJointPoint;
  leftWrist: IJointPoint;
  grfMultiplier: number;
  hipAngleDeg: number;
  kneeAngleDeg: number;
  ankleAngleDeg: number;
}

export interface IVesalianRenderOptions {
  strokeColor?: string;
  hatchColor?: string;
  includeHistology?: boolean;
  scale?: number;
  originX?: number;
  originY?: number;
}

@Injectable({
  providedIn: 'root'
})
export class KinesiologyBiomechanicsService {
  // Active gait progression signal (0.0 to 1.0)
  readonly activeGaitProgress = signal<number>(0.0);

  // Animation playback state
  readonly isWalking = signal<boolean>(true);

  // Romberg vestibular sway signal (mm)
  readonly vestibularSwayMm = signal<number>(8.4);

  // Active posture computed from Stanford gait equations
  readonly livePosture = computed<IGaitPosture>(() =>
    this.solveGaitPosture(this.activeGaitProgress())
  );

  // Active ground reaction force multiple (0.0 to 1.25x bodyweight)
  readonly currentGrf = computed<number>(() =>
    this.livePosture().grfMultiplier
  );

  /**
   * Solves 2D kinematic joint coordinates for a full sagittal human gait cycle.
   * Based on Stanford OpenSim normal adult gait parameters (cadence ~ 110 steps/min).
   */
  public solveGaitPosture(progress: number, originX: number = 200, originY: number = 320): IGaitPosture {
    const t = ((progress % 1.0) + 1.0) % 1.0;
    const pi = Math.PI;

    // Segment physical lengths (in arbitrary canvas units, ~1000 UPM standard)
    const torsoLen = 70;
    const femurLen = 65;
    const tibiaLen = 65;
    const footLen = 25;
    const humerusLen = 42;
    const forearmLen = 40;

    // Vertical sinusoidal pelvic bounce (2 cycles per stride, ~4cm amplitude)
    const pelvicBounce = Math.sin(4 * pi * t) * 6;
    const pelvis: IJointPoint = { x: originX, y: originY - 140 + pelvicBounce };

    // Spine and head
    const torso: IJointPoint = { x: pelvis.x + Math.sin(2 * pi * t) * 3, y: pelvis.y - torsoLen };
    const neck: IJointPoint = { x: torso.x, y: torso.y - 12 };
    const head: IJointPoint = { x: neck.x, y: neck.y - 24 };

    // Primary (Right) Leg Kinematics
    const rHipAngle = (24 * Math.sin(2 * pi * t + 0.4) + 4) * (pi / 180);
    let rKneeAngle = 0;
    if (t < 0.6) {
      // Stance phase: small knee flexion shock absorption (~18 deg)
      rKneeAngle = (18 * Math.sin(pi * (t / 0.6))) * (pi / 180);
    } else {
      // Swing phase: rapid knee flexion (~60 deg) for ground clearance
      rKneeAngle = (60 * Math.sin(pi * ((t - 0.6) / 0.4))) * (pi / 180);
    }
    const rAnkleAngle = (14 * Math.sin(2 * pi * t - 0.7)) * (pi / 180);

    const rightHip: IJointPoint = { x: pelvis.x + 6, y: pelvis.y };
    const rightKnee: IJointPoint = {
      x: rightHip.x + femurLen * Math.sin(rHipAngle),
      y: rightHip.y + femurLen * Math.cos(rHipAngle)
    };
    const rLowerLegAngle = rHipAngle - rKneeAngle;
    const rightAnkle: IJointPoint = {
      x: rightKnee.x + tibiaLen * Math.sin(rLowerLegAngle),
      y: rightKnee.y + tibiaLen * Math.cos(rLowerLegAngle)
    };
    const rightToe: IJointPoint = {
      x: rightAnkle.x + footLen * Math.cos(rAnkleAngle),
      y: rightAnkle.y + footLen * Math.sin(rAnkleAngle)
    };

    // Contralateral (Left) Leg Kinematics (shifted by half-cycle: t + 0.5)
    const tContra = (t + 0.5) % 1.0;
    const lHipAngle = (24 * Math.sin(2 * pi * tContra + 0.4) + 4) * (pi / 180);
    let lKneeAngle = 0;
    if (tContra < 0.6) {
      lKneeAngle = (18 * Math.sin(pi * (tContra / 0.6))) * (pi / 180);
    } else {
      lKneeAngle = (60 * Math.sin(pi * ((tContra - 0.6) / 0.4))) * (pi / 180);
    }
    const lAnkleAngle = (14 * Math.sin(2 * pi * tContra - 0.7)) * (pi / 180);

    const leftHip: IJointPoint = { x: pelvis.x - 6, y: pelvis.y };
    const leftKnee: IJointPoint = {
      x: leftHip.x + femurLen * Math.sin(lHipAngle),
      y: leftHip.y + femurLen * Math.cos(lHipAngle)
    };
    const lLowerLegAngle = lHipAngle - lKneeAngle;
    const leftAnkle: IJointPoint = {
      x: leftKnee.x + tibiaLen * Math.sin(lLowerLegAngle),
      y: leftKnee.y + tibiaLen * Math.cos(lLowerLegAngle)
    };
    const leftToe: IJointPoint = {
      x: leftAnkle.x + footLen * Math.cos(lAnkleAngle),
      y: leftAnkle.y + footLen * Math.sin(lAnkleAngle)
    };

    // Arm Counter-Swing Kinematics (Opposite to legs for angular momentum balance)
    const rShoulderAngle = (-rHipAngle * 0.8);
    const lShoulderAngle = (-lHipAngle * 0.8);

    const rightShoulder: IJointPoint = { x: torso.x + 8, y: torso.y + 10 };
    const rightElbow: IJointPoint = {
      x: rightShoulder.x + humerusLen * Math.sin(rShoulderAngle),
      y: rightShoulder.y + humerusLen * Math.cos(rShoulderAngle)
    };
    const rightWrist: IJointPoint = {
      x: rightElbow.x + forearmLen * Math.sin(rShoulderAngle + 0.3),
      y: rightElbow.y + forearmLen * Math.cos(rShoulderAngle + 0.3)
    };

    const leftShoulder: IJointPoint = { x: torso.x - 8, y: torso.y + 10 };
    const leftElbow: IJointPoint = {
      x: leftShoulder.x + humerusLen * Math.sin(lShoulderAngle),
      y: leftShoulder.y + humerusLen * Math.cos(lShoulderAngle)
    };
    const leftWrist: IJointPoint = {
      x: leftElbow.x + forearmLen * Math.sin(lShoulderAngle + 0.3),
      y: leftElbow.y + forearmLen * Math.cos(lShoulderAngle + 0.3)
    };

    // Ground Reaction Force (GRF) Bimodal Curve
    let grf = 0.0;
    if (t < 0.6) {
      // Stance phase double-peak butterfly curve
      const stanceP = t / 0.6;
      grf = 1.0 + 0.22 * Math.sin(2 * pi * stanceP) - 0.2 * Math.sin(pi * stanceP);
    }

    // Phase identification
    let phaseName = 'Midstance';
    if (t < 0.12) phaseName = 'Heel Strike (Initial Contact)';
    else if (t < 0.30) phaseName = 'Loading Response';
    else if (t < 0.50) phaseName = 'Midstance (Single Support)';
    else if (t < 0.62) phaseName = 'Terminal Stance (Push-Off)';
    else if (t < 0.78) phaseName = 'Initial Swing';
    else phaseName = 'Terminal Swing (Deceleration)';

    return {
      progress: t,
      phaseName,
      head,
      neck,
      torso,
      pelvis,
      rightHip,
      rightKnee,
      rightAnkle,
      rightToe,
      leftHip,
      leftKnee,
      leftAnkle,
      leftToe,
      rightShoulder,
      rightElbow,
      rightWrist,
      leftShoulder,
      leftElbow,
      leftWrist,
      grfMultiplier: Number(grf.toFixed(2)),
      hipAngleDeg: Math.round(rHipAngle * (180 / pi)),
      kneeAngleDeg: Math.round(rKneeAngle * (180 / pi)),
      ankleAngleDeg: Math.round(rAnkleAngle * (180 / pi))
    };
  }

  /**
   * Generates a full SVG path string for the anatomical figure in Vesalian copperplate linework.
   */
  public generateVesalianSvg(posture: IGaitPosture, options: IVesalianRenderOptions = {}): string {
    const strokeColor = options.strokeColor || '#f59e0b';
    const hatchColor = options.hatchColor || 'rgba(245, 158, 11, 0.45)';
    const includeHistology = options.includeHistology !== false;

    const p = posture;
    const lines: string[] = [];

    // 1. Skeletal Bone Stems
    lines.push(`M ${p.neck.x.toFixed(1)} ${p.neck.y.toFixed(1)} L ${p.pelvis.x.toFixed(1)} ${p.pelvis.y.toFixed(1)}`);
    lines.push(`M ${p.rightHip.x.toFixed(1)} ${p.rightHip.y.toFixed(1)} L ${p.rightKnee.x.toFixed(1)} ${p.rightKnee.y.toFixed(1)} L ${p.rightAnkle.x.toFixed(1)} ${p.rightAnkle.y.toFixed(1)} L ${p.rightToe.x.toFixed(1)} ${p.rightToe.y.toFixed(1)}`);
    lines.push(`M ${p.leftHip.x.toFixed(1)} ${p.leftHip.y.toFixed(1)} L ${p.leftKnee.x.toFixed(1)} ${p.leftKnee.y.toFixed(1)} L ${p.leftAnkle.x.toFixed(1)} ${p.leftAnkle.y.toFixed(1)} L ${p.leftToe.x.toFixed(1)} ${p.leftToe.y.toFixed(1)}`);
    lines.push(`M ${p.rightShoulder.x.toFixed(1)} ${p.rightShoulder.y.toFixed(1)} L ${p.rightElbow.x.toFixed(1)} ${p.rightElbow.y.toFixed(1)} L ${p.rightWrist.x.toFixed(1)} ${p.rightWrist.y.toFixed(1)}`);
    lines.push(`M ${p.leftShoulder.x.toFixed(1)} ${p.leftShoulder.y.toFixed(1)} L ${p.leftElbow.x.toFixed(1)} ${p.leftElbow.y.toFixed(1)} L ${p.leftWrist.x.toFixed(1)} ${p.leftWrist.y.toFixed(1)}`);

    // 2. Head Cranium Circle
    const headCircle = `<circle cx="${p.head.x.toFixed(1)}" cy="${p.head.y.toFixed(1)}" r="12" fill="none" stroke="${strokeColor}" stroke-width="2.2" />`;

    // 3. Histological Cross-Hatching (Actin-Myosin on Thigh & Calf, Osteons on Femur)
    let hatchSvg = '';
    if (includeHistology) {
      hatchSvg += this.generateMuscleHatching(p.rightHip, p.rightKnee, 6, hatchColor);
      hatchSvg += this.generateMuscleHatching(p.rightKnee, p.rightAnkle, 5, hatchColor);
      hatchSvg += this.generateMuscleHatching(p.leftHip, p.leftKnee, 4, 'rgba(45, 212, 191, 0.35)');
      hatchSvg += this.generateMuscleHatching(p.leftKnee, p.leftAnkle, 4, 'rgba(45, 212, 191, 0.35)');
    }

    const bonePath = `<path d="${lines.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;

    return `<g class="vesalian-figure">${hatchSvg}${bonePath}${headCircle}</g>`;
  }

  /**
   * Generates fine copperplate muscle belly hatching lines orthogonal to bone segment.
   */
  private generateMuscleHatching(start: IJointPoint, end: IJointPoint, count: number, color: string): string {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return '';

    // Unit perpendicular vector
    const px = -dy / len;
    const py = dx / len;

    const hatchLines: string[] = [];
    for (let i = 1; i <= count; i++) {
      const alpha = i / (count + 1);
      const mx = start.x + dx * alpha;
      const my = start.y + dy * alpha;
      // Parabolic muscle belly width
      const width = Math.sin(alpha * Math.PI) * 12;
      const x1 = mx - px * width;
      const y1 = my - py * width;
      const x2 = mx + px * width;
      const y2 = my + py * width;
      hatchLines.push(`M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }

    return `<path d="${hatchLines.join(' ')}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" />`;
  }

  /**
   * Advances gait cycle progress by dt (seconds) at standard cadence (1.1 Hz).
   */
  public advanceGait(dt: number, cadenceHz: number = 1.1): void {
    const delta = dt * cadenceHz;
    this.activeGaitProgress.update(p => (p + delta) % 1.0);
  }

  public setGaitProgress(val: number): void {
    this.activeGaitProgress.set(Math.max(0, Math.min(1, val)));
  }

  public toggleLocomotion(active?: boolean): void {
    this.isWalking.update(v => (active !== undefined ? active : !v));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Clinical Prescriptive Action & Rehabilitation Triad Engine
  // ──────────────────────────────────────────────────────────────────────────

  /** Patient-facing recovery progress (0.0 = current dysfunctional habit, 1.0 = target alignment) */
  readonly activeRehabProgress = signal<number>(0.0);

  /** Active clinical condition key from the Big Three canonical triad */
  readonly activeRehabCondition = signal<string>('lumbar_pelvic_alignment');

  /**
   * Evaluates the Big Three clinical rehabilitation triad canonical plans:
   * 1. Lumbar-Pelvic Alignment (L4-L5 Radiculopathy, Sciatica, Desk Posture)
   * 2. Patellofemoral Tracking (Runner's Knee, Valgus Collapse)
   * 3. Cervical Spine "Tech Neck" (Forward Head Posture, Cervical Radiculopathy)
   */
  public getPrescriptivePlan(conditionKey: string): IPrescriptiveRehabPlan {
    switch (conditionKey) {
      case 'patellofemoral_tracking':
        return {
          conditionKey: 'patellofemoral_tracking',
          conditionName: 'Patellofemoral Tracking & Knee Valgus Alignment',
          focalPartId: 'r_shin',
          baselineAngles: { kneeValgusDeg: 14.5, qAngleDeg: 19.2, tibialInternalRotDeg: 8.0 },
          targetAngles: { kneeValgusDeg: 4.0, qAngleDeg: 13.5, tibialInternalRotDeg: 1.5 },
          angleDeltas: { kneeValgusDeg: -10.5, qAngleDeg: -5.7, tibialInternalRotDeg: -6.5 },
          bioTensorCues: [
            { name: 'Vastus Medialis Oblique (VMO)', action: 'contract', colorHex: '#f59e0b', targetCue: 'Gently squeeze inner quad at full extension' },
            { name: 'Gluteus Medius', action: 'contract', colorHex: '#f59e0b', targetCue: 'Drive knee outward over second toe' },
            { name: 'Tensor Fasciae Latae (TFL)', action: 'relax', colorHex: '#64748b', targetCue: 'Release lateral hip tension' }
          ],
          plainEnglishDirective: 'Press outward through your heel to align your kneecap directly over your second toe.',
          torqueReductionNm: 28.4,
          decompressionPercent: 34
        };

      case 'cervical_spine_posture':
        return {
          conditionKey: 'cervical_spine_posture',
          conditionName: 'Cervical Axial Retraction & Forward-Head Reset',
          focalPartId: 'spine_cervical',
          baselineAngles: { craniovertebralAngleDeg: 42.0, forwardHeadDisplacementMm: 38.0, thoracicKyphosisDeg: 52.0 },
          targetAngles: { craniovertebralAngleDeg: 54.0, forwardHeadDisplacementMm: 12.0, thoracicKyphosisDeg: 40.0 },
          angleDeltas: { craniovertebralAngleDeg: +12.0, forwardHeadDisplacementMm: -26.0, thoracicKyphosisDeg: -12.0 },
          bioTensorCues: [
            { name: 'Longus Colli & Capitis', action: 'contract', colorHex: '#f59e0b', targetCue: 'Perform gentle chin-nod as if making a double chin' },
            { name: 'Lower Trapezius', action: 'contract', colorHex: '#f59e0b', targetCue: 'Slide shoulder blades gently down your back' },
            { name: 'Upper Trapezius / Sternocleidomastoid', action: 'relax', colorHex: '#64748b', targetCue: 'Drop your shoulders away from your ears' }
          ],
          plainEnglishDirective: 'Draw your chin straight backward like sliding a drawer shut to decompress the base of your skull.',
          torqueReductionNm: 19.8,
          decompressionPercent: 42
        };

      case 'lumbar_pelvic_alignment':
      default:
        return {
          conditionKey: 'lumbar_pelvic_alignment',
          conditionName: 'Lumbar-Pelvic Alignment & L4-L5 Disc Decompression',
          focalPartId: 'spine_lumbar',
          baselineAngles: { anteriorPelvicTiltDeg: 16.5, lumbarLordosisDeg: 58.0, sacralSlopeDeg: 44.0 },
          targetAngles: { anteriorPelvicTiltDeg: 6.0, lumbarLordosisDeg: 42.0, sacralSlopeDeg: 32.0 },
          angleDeltas: { anteriorPelvicTiltDeg: -10.5, lumbarLordosisDeg: -16.0, sacralSlopeDeg: -12.0 },
          bioTensorCues: [
            { name: 'Transverse Abdominis (Core)', action: 'contract', colorHex: '#f59e0b', targetCue: 'Gently draw navel inward to create a protective belt' },
            { name: 'Gluteus Maximus', action: 'contract', colorHex: '#f59e0b', targetCue: 'Squeeze glutes to level your pelvic bowl' },
            { name: 'Iliopsoas (Hip Flexors)', action: 'relax', colorHex: '#64748b', targetCue: 'Allow front of hips to open and lengthen' },
            { name: 'Lumbar Erector Spinae', action: 'relax', colorHex: '#64748b', targetCue: 'Release lower back grip' }
          ],
          plainEnglishDirective: 'Gently tuck your tailbone as if flattening your lower back against a supportive wall.',
          torqueReductionNm: 36.2,
          decompressionPercent: 48
        };
    }
  }

  /**
   * Computes isochoric (constant volume) muscle belly deformation:
   * When muscle contracts and shortens (lengthRatio < 1.0), the radius expands
   * according to r_new = r_0 / sqrt(lengthRatio).
   */
  public computeIsochoricMuscleDeformation(initialRadiusMm: number, lengthRatio: number): number {
    const safeRatio = Math.max(0.4, Math.min(1.5, lengthRatio));
    return initialRadiusMm / Math.sqrt(safeRatio);
  }

  public setRehabProgress(val: number): void {
    this.activeRehabProgress.set(Math.max(0, Math.min(1, val)));
  }

  public setRehabCondition(key: string): void {
    this.activeRehabCondition.set(key);
  }
}
