import { Injectable, signal, computed } from '@angular/core';

export type SwarmOperationalMode =
  | 'ACOUSTIC_DRILL'
  | 'CORONAGRAPHIC_TRACKING'
  | 'DUROTACTIC_HOMING'
  | 'SERS_ACIDOSIS';

export interface INanobotAgent {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  phaseAngleRad: number; // For Kuramoto phase-locking
  localPh: number; // 6.2 (tumor acidosis) to 7.4 (healthy physiological)
  localStiffnessKpa: number; // 1 kPa (soft marrow) to 45 kPa (rigid tumor/plaque)
  targetProximityScore: number; // 0.0 to 1.0
  isPayloadUnlocked: boolean;
  timeAtTargetMs: number;
}

export interface ISwarmAcousticVector {
  pitchDeg: number; // -90 to +90
  yawDeg: number; // 0 to 360
  driveFrequencyKhz: number; // 50 to 500 kHz (diagnostic/therapeutic ultrasound)
  acousticPressureMpa: number; // 0.1 to 2.5 MPa
}

export interface INanobotTargetSite {
  name: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  targetType: 'THROMBOSIS' | 'GLIOBLASTOMA_TUMOR' | 'ATHEROSCLEROTIC_PLAQUE';
  stiffnessKpa: number;
  ambientPh: number;
}

export interface ISwarmCoronagraphicTelemetry {
  rawTissueScatterPhotons: number;
  speckleNullingEfficiencyPercent: number; // 0 to 99.99%
  coronagraphicSnrGainDb: number; // e.g. +38 dB
  tissuePenetrationDepthMm: number; // 0 to 60 mm
  trackingFidelityPercent: number;
}

export interface ISwarmPhysicsState {
  agentCount: number;
  kuramotoCoherence: number; // 0.0 (incoherent) to 1.0 (perfectly phase-locked)
  collectiveThrustNn: number; // Nanoforce in nN
  meanReynoldsNumber: number; // ~ 1e-5
  targetCaptureRatePercent: number;
  falseReleaseProbability: number; // e.g. < 1e-7
  coronagraphicTelemetry: ISwarmCoronagraphicTelemetry;
  operationalMode: SwarmOperationalMode;
}

@Injectable({ providedIn: 'root' })
export class NanobotSwarmPhysicsService {
  /** Fluid dynamic constant: human plasma dynamic viscosity (Pa·s) */
  readonly plasmaViscosityPaS = 0.0015; // 1.5 mPa·s at 37°C

  /** Nanobot physical dimensions */
  readonly botRadiusUm = 0.35; // 350 nm radius
  readonly botLengthUm = 1.2; // 1.2 um length
  readonly helixPitchUm = 0.8; // Helical pitch

  /** Reactive State Signals */
  readonly operationalMode = signal<SwarmOperationalMode>('ACOUSTIC_DRILL');
  readonly acousticSteering = signal<ISwarmAcousticVector>({
    pitchDeg: 15,
    yawDeg: 45,
    driveFrequencyKhz: 250,
    acousticPressureMpa: 1.2
  });

  readonly targetSite = signal<INanobotTargetSite>({
    name: 'Microvascular Thrombus (Bifurcation)',
    x: 4.5,
    y: 0.8,
    z: -1.2,
    radius: 1.5,
    targetType: 'THROMBOSIS',
    stiffnessKpa: 35.0,
    ambientPh: 6.4
  });

  readonly agents = signal<INanobotAgent[]>([]);

  /** Derived Telemetry */
  readonly kuramotoCoherence = computed(() => {
    const bots = this.agents();
    return this.computeKuramotoCoherence(bots);
  });

  readonly collectiveThrustNn = computed(() => {
    const coherence = this.kuramotoCoherence();
    const bots = this.agents();
    const acoustic = this.acousticSteering();
    // Non-linear collective amplification: Phase-locked bots draft hydrodynamically
    const singleBotThrustNn = 0.08 * (acoustic.acousticPressureMpa / 1.0);
    const collectiveDraftMultiplier = 1.0 + (bots.length * 0.12 * Math.pow(coherence, 2));
    return parseFloat((bots.length * singleBotThrustNn * collectiveDraftMultiplier).toFixed(2));
  });

  readonly coronagraphicTelemetry = computed<ISwarmCoronagraphicTelemetry>(() => {
    const depthMm = 38.0; // 38 mm deep inside cerebral or microvascular tissue
    const nullingEfficiency = this.operationalMode() === 'CORONAGRAPHIC_TRACKING' ? 99.85 : 45.0;
    const snrGain = this.computeCoronagraphicSnrGain(depthMm, nullingEfficiency);

    return {
      rawTissueScatterPhotons: 1.4e8,
      speckleNullingEfficiencyPercent: nullingEfficiency,
      coronagraphicSnrGainDb: snrGain,
      tissuePenetrationDepthMm: depthMm,
      trackingFidelityPercent: parseFloat(Math.min(99.9, nullingEfficiency * 1.001).toFixed(1))
    };
  });

  readonly targetCaptureRatePercent = computed(() => {
    const bots = this.agents();
    if (bots.length === 0) return 0;
    const captured = bots.filter(b => b.targetProximityScore > 0.75).length;
    return parseFloat(((captured / bots.length) * 100).toFixed(1));
  });

  constructor() {
    this.initializeSwarm(350);
  }

  /**
   * Initializes autonomous nanobot particles in vascular coordinates
   */
  initializeSwarm(count: number): void {
    const initialBots: INanobotAgent[] = [];
    for (let i = 0; i < count; i++) {
      // Gaussian distribution along vascular channel
      const u1 = Math.random();
      const u2 = Math.random();
      const randNorm = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);

      initialBots.push({
        id: i,
        x: (Math.random() - 0.5) * 2.0 - 4.0, // Inlet position
        y: (Math.random() - 0.5) * 1.4,
        z: (Math.random() - 0.5) * 1.4,
        vx: 0.8 + Math.random() * 0.4,
        vy: 0,
        vz: 0,
        phaseAngleRad: Math.random() * 2.0 * Math.PI,
        localPh: 7.38,
        localStiffnessKpa: 1.2,
        targetProximityScore: 0.0,
        isPayloadUnlocked: false,
        timeAtTargetMs: 0
      });
    }
    this.agents.set(initialBots);
  }

  /**
   * Computes Low-Reynolds Purcell helical corkscrew swim velocity (um/s)
   * v = (Δξ · ω · sin(2θ)) / [2(ξ_∥ cos²θ + ξ_⊥ sin²θ)]
   */
  computePurcellHelicalVelocity(
    omegaRadS: number,
    helixAngleRad: number = Math.PI / 4,
    viscosityPaS: number = this.plasmaViscosityPaS
  ): number {
    // Anisotropic Stokes drag coefficients for slender filament
    const xiParallel = (2.0 * Math.PI * viscosityPaS) / Math.log(this.botLengthUm / this.botRadiusUm);
    const xiPerp = 2.0 * xiParallel;
    const deltaXi = xiPerp - xiParallel;

    const numerator = deltaXi * omegaRadS * Math.sin(2.0 * helixAngleRad);
    const denominator = 2.0 * (xiParallel * Math.pow(Math.cos(helixAngleRad), 2) + xiPerp * Math.pow(Math.sin(helixAngleRad), 2));

    const velocityUmS = denominator !== 0 ? (numerator / denominator) * this.helixPitchUm : 0;
    return parseFloat(velocityUmS.toFixed(3));
  }

  /**
   * Computes Kuramoto Phase Order Parameter Φ ∈ [0, 1]
   * Φ = (1 / N) * |Σ exp(i * θ_j)|
   */
  computeKuramotoCoherence(agents: INanobotAgent[]): number {
    if (agents.length === 0) return 0;
    let sumCos = 0;
    let sumSin = 0;

    for (const b of agents) {
      sumCos += Math.cos(b.phaseAngleRad);
      sumSin += Math.sin(b.phaseAngleRad);
    }

    const meanCos = sumCos / agents.length;
    const meanSin = sumSin / agents.length;
    const coherence = Math.sqrt(meanCos * meanCos + meanSin * meanSin);
    return parseFloat(Math.min(1.0, Math.max(0.0, coherence)).toFixed(3));
  }

  /**
   * Computes Coronagraphic Wavefront SNR Gain in dB (Apodized Speckle Nulling)
   * Gain_dB = 10 * log10(1 / (1 - NullingEfficiency)) - OpticalAttenuation(depth)
   */
  computeCoronagraphicSnrGain(tissueDepthMm: number, nullingEfficiencyPercent: number): number {
    const rawEfficiency = Math.min(0.9999, Math.max(0.0, nullingEfficiencyPercent / 100.0));
    // Optical extinction coefficient in human dermis/brain at 850 nm (NIR tissue window) ~ 0.12 mm^-1
    const muExt = 0.12;
    const attenuationDb = 4.343 * muExt * tissueDepthMm;
    const suppressionGainDb = 10.0 * Math.log10(1.0 / (1.0 - rawEfficiency + 1e-6));

    const netGain = Math.max(0, suppressionGainDb - (attenuationDb * 0.25));
    return parseFloat(netGain.toFixed(1));
  }

  /**
   * Computes Durotactic Homing Gradient Tensor (Green's function matrix inversion)
   * Guides agents along extracellular matrix stiffness gradients towards rigid tumor/thrombus cores
   */
  computeDurotacticGradient(
    x: number,
    y: number,
    z: number,
    target: INanobotTargetSite
  ): { gx: number; gy: number; gz: number; localE: number } {
    const dx = target.x - x;
    const dy = target.y - y;
    const dz = target.z - z;
    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq) + 0.001;

    // Gaussian stiffness profile radiating from target center: E(r) = E_base + (E_tumor - E_base) * exp(-r^2 / (2 * R^2))
    const eBase = 1.2; // kPa
    const decayRadius = target.radius * 2.0;
    const expFactor = Math.exp(-distSq / (2.0 * decayRadius * decayRadius));
    const localE = eBase + (target.stiffnessKpa - eBase) * expFactor;

    // Gradient vector ∇E pointing towards peak stiffness
    const gradMagnitude = ((target.stiffnessKpa - eBase) / (decayRadius * decayRadius)) * expFactor;
    return {
      gx: (dx / dist) * gradMagnitude,
      gy: (dy / dist) * gradMagnitude,
      gz: (dz / dist) * gradMagnitude,
      localE: parseFloat(localE.toFixed(2))
    };
  }

  /**
   * Evaluates Poisson Temporal Persistence Gate (DNA Strand-Displacement Logic)
   * Triple Coincidence: Duration at target > 200 ms AND pH < 6.8 AND Stiffness > 20 kPa
   */
  evaluatePoissonTripleCoincidenceGate(
    timeAtTargetMs: number,
    localPh: number,
    localStiffnessKpa: number
  ): boolean {
    const isSustainedResidence = timeAtTargetMs >= 200;
    const isAcidicMicroenvironment = localPh <= 6.75;
    const isPathologicalStiffness = localStiffnessKpa >= 20.0;

    return isSustainedResidence && isAcidicMicroenvironment && isPathologicalStiffness;
  }

  /**
   * Advances simulation physics by dt seconds
   */
  stepSimulation(dt: number = 0.016): void {
    const currentBots = this.agents();
    if (currentBots.length === 0) return;

    const target = this.targetSite();
    const steering = this.acousticSteering();
    const mode = this.operationalMode();

    // Convert acoustic steering to directional unit vector
    const pitchRad = (steering.pitchDeg * Math.PI) / 180;
    const yawRad = (steering.yawDeg * Math.PI) / 180;
    const steerX = Math.cos(pitchRad) * Math.cos(yawRad);
    const steerY = Math.sin(pitchRad);
    const steerZ = Math.cos(pitchRad) * Math.sin(yawRad);

    const updatedBots = currentBots.map(bot => {
      // 1. Durotactic gradient computation
      const duro = this.computeDurotacticGradient(bot.x, bot.y, bot.z, target);
      const distToTarget = Math.sqrt(
        Math.pow(target.x - bot.x, 2) + Math.pow(target.y - bot.y, 2) + Math.pow(target.z - bot.z, 2)
      );

      // 2. Proximity calculation
      const proximity = Math.max(0.0, Math.min(1.0, 1.0 - (distToTarget / 8.0)));
      const atTarget = distToTarget <= target.radius;
      const newTimeAtTarget = atTarget ? bot.timeAtTargetMs + dt * 1000 : Math.max(0, bot.timeAtTargetMs - dt * 200);

      // 3. Local environmental conditions
      const phGradient = 7.38 - (7.38 - target.ambientPh) * Math.exp(-Math.pow(distToTarget, 2) / 6.0);
      const localPh = parseFloat(phGradient.toFixed(2));

      // 4. Force synthesis depending on operational mode
      let fx = steerX * 1.2;
      let fy = steerY * 0.8;
      let fz = steerZ * 0.8;

      if (mode === 'DUROTACTIC_HOMING') {
        // Boost mechanical gradient attraction
        fx += duro.gx * 2.5;
        fy += duro.gy * 2.5;
        fz += duro.gz * 2.5;
      } else if (mode === 'ACOUSTIC_DRILL') {
        // High axial thrust towards target center
        const dx = target.x - bot.x;
        const dy = target.y - bot.y;
        const dz = target.z - bot.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
        fx += (dx / d) * 3.2;
        fy += (dy / d) * 1.5;
        fz += (dz / d) * 1.5;
      }

      // 5. Kuramoto phase evolution
      // Phase aligns towards steering drive frequency
      const naturalFreq = (steering.driveFrequencyKhz / 100.0) * 2.0 * Math.PI;
      const phaseCouplingK = mode === 'ACOUSTIC_DRILL' ? 3.5 : 1.2;
      const dPhase = naturalFreq + phaseCouplingK * Math.sin(yawRad - bot.phaseAngleRad);
      const newPhase = (bot.phaseAngleRad + dPhase * dt) % (2.0 * Math.PI);

      // 6. Kinematic integration with Stokes damping
      const dragFactor = 0.82;
      const newVx = (bot.vx + fx * dt) * dragFactor;
      const newVy = (bot.vy + fy * dt) * dragFactor;
      const newVz = (bot.vz + fz * dt) * dragFactor;

      const newX = bot.x + newVx * dt;
      const newY = Math.max(-2.2, Math.min(2.2, bot.y + newVy * dt));
      const newZ = Math.max(-2.2, Math.min(2.2, bot.z + newVz * dt));

      // 7. DNA logic lock evaluation
      const isUnlocked = this.evaluatePoissonTripleCoincidenceGate(
        newTimeAtTarget,
        localPh,
        duro.localE
      );

      return {
        ...bot,
        x: newX > 7.0 ? -4.5 : newX, // Loop back at vascular outlet
        y: newY,
        z: newZ,
        vx: newVx,
        vy: newVy,
        vz: newVz,
        phaseAngleRad: newPhase,
        localPh,
        localStiffnessKpa: duro.localE,
        targetProximityScore: parseFloat(proximity.toFixed(3)),
        isPayloadUnlocked: isUnlocked,
        timeAtTargetMs: newTimeAtTarget
      };
    });

    this.agents.set(updatedBots);
  }

  /** Mode toggling */
  setOperationalMode(mode: SwarmOperationalMode): void {
    this.operationalMode.set(mode);
  }

  /** Update steering vector */
  updateAcousticSteering(pitchDeg: number, yawDeg: number, pressureMpa?: number): void {
    this.acousticSteering.update(prev => ({
      ...prev,
      pitchDeg,
      yawDeg,
      acousticPressureMpa: pressureMpa !== undefined ? pressureMpa : prev.acousticPressureMpa
    }));
  }
}
