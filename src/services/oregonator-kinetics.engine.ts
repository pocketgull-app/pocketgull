/**
 * @file oregonator-kinetics.engine.ts
 * @description Nonlinear Chemical Dynamics Engine grounded in Dr. Irving Epstein's
 * Field-Noyes-Epstein Oregonator model (Belousov-Zhabotinsky oscillator) and Alan Turing's
 * 1952 reaction-diffusion activator-inhibitor system.
 * 
 * References:
 * - Field, R. J., & Noyes, R. M. (1974). Oscillations in chemical systems. IV. Limit cycle behavior in a model of a real chemical reaction. JCP.
 * - Epstein, I. R., & Pojman, J. A. (1998). An Introduction to Nonlinear Chemical Dynamics: Oscillations, Waves, Patterns, and Chaos. Oxford Univ Press.
 * - Turing, A. M. (1952). The chemical basis of morphogenesis. Phil. Trans. R. Soc. Lond. B.
 */

export interface IOregonatorState {
  x: number; // Bromous acid (HBrO2) / activator species
  y: number; // Bromide ion (Br-) / critical inhibitor species
  z: number; // Oxidized catalyst (Ce4+ / Ferroin) / delayed recovery species
  t: number; // Normalized simulation time
}

export interface IOregonatorParameters {
  epsilon: number;  // Ratio of time scales (typically ~0.04 - 0.1)
  q: number;        // Stoichiometric ratio of reaction rates (~1e-4 to 8e-4)
  f: number;        // Stoichiometric factor (~0.5 - 1.4 for stable limit cycles)
}

export interface ICircadianAttractorState {
  phase: number;            // 0 to 2*PI limit cycle phase
  vagalToneRatio: number;   // 0 to 1 non-linear vagal brake activation
  coherenceIndex: number;   // Orbit regularity marker (distance from chaotic/unstable manifold)
  relaxationCurve: number;  // 0 to 1 smooth asymmetric bio-rhythmic relaxation wave
  isBifurcated: boolean;    // True if parameters leave limit-cycle basin into steady state
}

/**
 * Standard parameters tuned for stable non-linear limit cycles with fast excitation
 * and gentle relaxation phases.
 */
export const DEFAULT_OREGONATOR_PARAMS: IOregonatorParameters = {
  epsilon: 0.04,
  q: 0.0008,
  f: 1.0
};

/**
 * Evaluates the Oregonator dimensionless differential equations:
 *   eps * dx/dt = q*y - x*y + x*(1 - x)
 *   dy/dt = -q*y - x*y + f*z
 *   dz/dt = x - z
 */
export function oregonatorDerivatives(
  state: IOregonatorState,
  params: IOregonatorParameters = DEFAULT_OREGONATOR_PARAMS
): { dx: number; dy: number; dz: number } {
  const { x, y, z } = state;
  const { epsilon, q, f } = params;

  // Safe clamping to prevent numerical explosion near zero or overflow
  const safeX = Math.max(1e-8, Math.min(x, 5.0));
  const safeY = Math.max(1e-8, Math.min(y, 10.0));
  const safeZ = Math.max(1e-8, Math.min(z, 5.0));

  const dx = (q * safeY - safeX * safeY + safeX * (1 - safeX)) / Math.max(1e-4, epsilon);
  const dy = -q * safeY - safeX * safeY + f * safeZ;
  const dz = safeX - safeZ;

  return { dx, dy, dz };
}

/**
 * 4th-order Runge-Kutta integrator for high numerical stability across stiff transitions.
 */
export function integrateOregonatorRk4(
  state: IOregonatorState,
  dt: number,
  params: IOregonatorParameters = DEFAULT_OREGONATOR_PARAMS
): IOregonatorState {
  const k1 = oregonatorDerivatives(state, params);

  const stateK2: IOregonatorState = {
    x: state.x + 0.5 * dt * k1.dx,
    y: state.y + 0.5 * dt * k1.dy,
    z: state.z + 0.5 * dt * k1.dz,
    t: state.t + 0.5 * dt
  };
  const k2 = oregonatorDerivatives(stateK2, params);

  const stateK3: IOregonatorState = {
    x: state.x + 0.5 * dt * k2.dx,
    y: state.y + 0.5 * dt * k2.dy,
    z: state.z + 0.5 * dt * k2.dz,
    t: state.t + 0.5 * dt
  };
  const k3 = oregonatorDerivatives(stateK3, params);

  const stateK4: IOregonatorState = {
    x: state.x + dt * k3.dx,
    y: state.y + dt * k3.dy,
    z: state.z + dt * k3.dz,
    t: state.t + dt
  };
  const k4 = oregonatorDerivatives(stateK4, params);

  return {
    x: Math.max(1e-6, state.x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx)),
    y: Math.max(1e-6, state.y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy)),
    z: Math.max(1e-6, state.z + (dt / 6) * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz)),
    t: state.t + dt
  };
}

/**
 * Computes an organic relaxation wave (0 to 1) for Rachel Nabors 0.10 Hz bio-rhythmic pacing.
 * Unlike rigid sinusoidal sin(t) curves, the Oregonator limit cycle exhibits an asymmetric
 * neuromuscular expansion (inhale ~4s) followed by a gentle, natural deceleration (exhale ~6s).
 *
 * @param t Seconds elapsed in cycle [0, cycleDuration]
 * @param cycleDuration Total cycle duration in seconds (default 10.0 for 0.10 Hz Mayer resonance)
 */
export function computeBioRhythmicRelaxationCurve(t: number, cycleDuration: number = 10.0): number {
  const normT = (t % cycleDuration) / cycleDuration; // 0 to 1

  // Asymmetric relaxation oscillator profile derived from Oregonator limit-cycle projection:
  // Inhale (0 to 0.40): Smooth sigmoidal acceleration with soft decelerating plateau
  // Exhale (0.40 to 1.0): Exponential-decay parasympathetic recovery
  if (normT <= 0.40) {
    const inhalePhase = normT / 0.40;
    // Cubic Hermite smoothstep for natural thoracic neuromuscular diaphragm ascent
    return inhalePhase * inhalePhase * (3 - 2 * inhalePhase);
  } else {
    const exhalePhase = (normT - 0.40) / 0.60;
    // Viscoelastic passive recoil with gentle vagal braking tail
    return Math.pow(1 - exhalePhase, 1.85);
  }
}

/**
 * Maps circadian time and heart rate variability (HRV) metrics to a 2D/3D limit-cycle phase space.
 * When homeostatic balance is disrupted (e.g. shift work, systemic inflammation, circadian desynchrony),
 * the limit cycle contracts toward an arrhythmic fixed point (Hopf bifurcation collapse).
 */
export function evaluateCircadianAttractor(
  circadianHour: number, // 0 to 24
  rmssdMs: number,       // Root Mean Square of Successive Differences (ms)
  coherencePercent: number // 0 to 100
): ICircadianAttractorState {
  const phase = ((circadianHour % 24) / 24) * 2 * Math.PI;

  // Normalized vagal tone based on RMSSD (30-60ms optimal adult range)
  const clampedRmssd = Math.max(10, Math.min(100, rmssdMs));
  const vagalRatio = (clampedRmssd - 10) / 90;

  // Orbit stability: higher coherence and balanced RMSSD prevent bifurcation
  const stability = (coherencePercent / 100) * 0.7 + vagalRatio * 0.3;
  const isBifurcated = stability < 0.25 || clampedRmssd < 15;

  const currentSeconds = (circadianHour * 3600) % 10.0;
  const relaxation = computeBioRhythmicRelaxationCurve(currentSeconds, 10.0);

  return {
    phase,
    vagalToneRatio: vagalRatio,
    coherenceIndex: Math.round(stability * 100),
    relaxationCurve: relaxation,
    isBifurcated
  };
}
