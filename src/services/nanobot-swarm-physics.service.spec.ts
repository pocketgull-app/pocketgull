import { describe, it, expect, beforeEach } from 'vitest';
import { NanobotSwarmPhysicsService, INanobotAgent } from './nanobot-swarm-physics.service';

describe('NanobotSwarmPhysicsService', () => {
  let service: NanobotSwarmPhysicsService;

  beforeEach(() => {
    service = new NanobotSwarmPhysicsService();
  });

  it('should initialize with default swarm of bots and coherent telemetry', () => {
    const bots = service.agents();
    expect(bots.length).toBe(350);
    expect(service.operationalMode()).toBe('ACOUSTIC_DRILL');
    expect(service.targetSite().targetType).toBe('THROMBOSIS');
    expect(service.kuramotoCoherence()).toBeGreaterThanOrEqual(0.0);
    expect(service.kuramotoCoherence()).toBeLessThanOrEqual(1.0);
  });

  it('should calculate Low-Reynolds Purcell helical corkscrew velocity with non-reciprocal forward propulsion', () => {
    // 500 rad/s angular frequency
    const velocity = service.computePurcellHelicalVelocity(500, Math.PI / 4, 0.0015);
    expect(velocity).toBeGreaterThan(0.0);
    // At zero rotation frequency, net propulsion must strictly be zero (Scallop theorem)
    const zeroVelocity = service.computePurcellHelicalVelocity(0, Math.PI / 4, 0.0015);
    expect(zeroVelocity).toBe(0.0);
  });

  it('should compute Kuramoto phase order parameter correctly', () => {
    // 1. Perfectly aligned phase angles -> Coherence should be 1.0
    const alignedBots: INanobotAgent[] = [
      { id: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, phaseAngleRad: 0.5, localPh: 7.4, localStiffnessKpa: 1.0, targetProximityScore: 0, isPayloadUnlocked: false, timeAtTargetMs: 0 },
      { id: 2, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, phaseAngleRad: 0.5, localPh: 7.4, localStiffnessKpa: 1.0, targetProximityScore: 0, isPayloadUnlocked: false, timeAtTargetMs: 0 },
      { id: 3, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, phaseAngleRad: 0.5, localPh: 7.4, localStiffnessKpa: 1.0, targetProximityScore: 0, isPayloadUnlocked: false, timeAtTargetMs: 0 }
    ];
    expect(service.computeKuramotoCoherence(alignedBots)).toBe(1.0);

    // 2. Completely opposing phase angles -> Coherence should be 0.0
    const opposingBots: INanobotAgent[] = [
      { id: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, phaseAngleRad: 0.0, localPh: 7.4, localStiffnessKpa: 1.0, targetProximityScore: 0, isPayloadUnlocked: false, timeAtTargetMs: 0 },
      { id: 2, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, phaseAngleRad: Math.PI, localPh: 7.4, localStiffnessKpa: 1.0, targetProximityScore: 0, isPayloadUnlocked: false, timeAtTargetMs: 0 }
    ];
    expect(service.computeKuramotoCoherence(opposingBots)).toBe(0.0);
  });

  it('should compute Coronagraphic Wavefront SNR Gain with speckle nulling', () => {
    // With 99.9% nulling at 30mm depth
    const highNullingGain = service.computeCoronagraphicSnrGain(30, 99.9);
    const lowNullingGain = service.computeCoronagraphicSnrGain(30, 50.0);

    expect(highNullingGain).toBeGreaterThan(lowNullingGain);
    expect(highNullingGain).toBeGreaterThanOrEqual(25.0); // > 25 dB optical gain
  });

  it('should calculate Durotactic Gradient towards stiff tumor cores (Microlensing Inversion)', () => {
    const target = service.targetSite(); // located at x=4.5, y=0.8, z=-1.2, stiffness=35 kPa
    const duroAtInlet = service.computeDurotacticGradient(0, 0, 0, target);

    // Gradient x-component must point positively towards target x=4.5
    expect(duroAtInlet.gx).toBeGreaterThan(0);
    expect(duroAtInlet.localE).toBeGreaterThanOrEqual(1.2);
    expect(duroAtInlet.localE).toBeLessThanOrEqual(target.stiffnessKpa);
  });

  it('should enforce Poisson triple-coincidence DNA logic locks to prevent premature payload release', () => {
    // 1. All three conditions met: Sustained residence (250ms), Acidic pH (6.4), High stiffness (30 kPa)
    const validUnlock = service.evaluatePoissonTripleCoincidenceGate(250, 6.4, 30.0);
    expect(validUnlock).toBe(true);

    // 2. Insufficient residence time (< 200 ms) -> must remain locked
    const transientGlitch = service.evaluatePoissonTripleCoincidenceGate(80, 6.4, 30.0);
    expect(transientGlitch).toBe(false);

    // 3. Normal physiological pH (7.38) -> must remain locked
    const wrongPh = service.evaluatePoissonTripleCoincidenceGate(250, 7.38, 30.0);
    expect(wrongPh).toBe(false);

    // 4. Soft normal tissue stiffness (2.0 kPa) -> must remain locked
    const softTissue = service.evaluatePoissonTripleCoincidenceGate(250, 6.4, 2.0);
    expect(softTissue).toBe(false);
  });

  it('should step simulation forward and update kinematic states and telemetry', () => {
    const initialBots = service.agents();
    const initialX = initialBots[0].x;

    service.stepSimulation(0.05);

    const updatedBots = service.agents();
    expect(updatedBots.length).toBe(350);
    expect(updatedBots[0].x).not.toBe(initialX);
    expect(service.collectiveThrustNn()).toBeGreaterThan(0);
  });

  it('should update acoustic steering vectors correctly', () => {
    service.updateAcousticSteering(30, 90, 2.0);
    const steering = service.acousticSteering();
    expect(steering.pitchDeg).toBe(30);
    expect(steering.yawDeg).toBe(90);
    expect(steering.acousticPressureMpa).toBe(2.0);
  });
});
