import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { KinesiologyBiomechanicsService } from './kinesiology-biomechanics.service';

describe('KinesiologyBiomechanicsService', () => {
  let service: KinesiologyBiomechanicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KinesiologyBiomechanicsService]
    });
    service = TestBed.inject(KinesiologyBiomechanicsService);
  });

  it('should initialize with baseline gait cycle at progress 0.0', () => {
    expect(service.activeGaitProgress()).toBe(0.0);
    expect(service.isWalking()).toBe(true);
    expect(service.vestibularSwayMm()).toBe(8.4);
  });

  it('should solve anatomical joint coordinates for all limbs across the gait cycle', () => {
    const posture = service.solveGaitPosture(0.0);

    // Verify all primary skeletal landmarks exist
    expect(posture.head).toBeDefined();
    expect(posture.neck).toBeDefined();
    expect(posture.torso).toBeDefined();
    expect(posture.pelvis).toBeDefined();
    expect(posture.rightHip).toBeDefined();
    expect(posture.rightKnee).toBeDefined();
    expect(posture.rightAnkle).toBeDefined();
    expect(posture.rightToe).toBeDefined();
    expect(posture.leftHip).toBeDefined();
    expect(posture.leftKnee).toBeDefined();
    expect(posture.leftAnkle).toBeDefined();
    expect(posture.leftToe).toBeDefined();
    expect(posture.rightShoulder).toBeDefined();
    expect(posture.rightElbow).toBeDefined();
    expect(posture.rightWrist).toBeDefined();

    // Verify head sits above pelvis
    expect(posture.head.y).toBeLessThan(posture.pelvis.y);
    // Verify feet sit below pelvis
    expect(posture.rightAnkle.y).toBeGreaterThan(posture.pelvis.y);
  });

  it('should identify clinical gait phases correctly across progress 0 to 1', () => {
    const heelStrike = service.solveGaitPosture(0.05);
    expect(heelStrike.phaseName).toContain('Heel Strike');

    const loadingResponse = service.solveGaitPosture(0.20);
    expect(loadingResponse.phaseName).toContain('Loading Response');

    const midstance = service.solveGaitPosture(0.40);
    expect(midstance.phaseName).toContain('Midstance');

    const pushOff = service.solveGaitPosture(0.55);
    expect(pushOff.phaseName).toContain('Terminal Stance');

    const swing = service.solveGaitPosture(0.85);
    expect(swing.phaseName).toContain('Swing');
  });

  it('should model Stanford bimodal ground reaction force during stance and zero during swing', () => {
    const stance = service.solveGaitPosture(0.25);
    expect(stance.grfMultiplier).toBeGreaterThan(0.5);

    const swing = service.solveGaitPosture(0.85);
    expect(swing.grfMultiplier).toBe(0.0);
  });

  it('should generate valid Vesalian copperplate SVG paths with histological muscle hatching', () => {
    const posture = service.solveGaitPosture(0.35);
    const svg = service.generateVesalianSvg(posture, { includeHistology: true });

    expect(svg).toContain('<g class="vesalian-figure">');
    expect(svg).toContain('<path d="M');
    expect(svg).toContain('<circle cx="');
    expect(svg).toContain('stroke="#f59e0b"');
  });

  it('should advance gait progress smoothly with cadence', () => {
    service.setGaitProgress(0.1);
    expect(service.activeGaitProgress()).toBe(0.1);

    service.advanceGait(0.1, 1.0); // 0.1s at 1.0 Hz -> +0.1 progress
    expect(service.activeGaitProgress()).toBeCloseTo(0.2, 5);
  });

  it('should return canonical Big Three prescriptive plans with bio-tensor cues', () => {
    const lumbar = service.getPrescriptivePlan('lumbar_pelvic_alignment');
    expect(lumbar.conditionKey).toBe('lumbar_pelvic_alignment');
    expect(lumbar.focalPartId).toBe('spine_lumbar');
    expect(lumbar.angleDeltas['anteriorPelvicTiltDeg']).toBe(-10.5);
    expect(lumbar.bioTensorCues.length).toBeGreaterThanOrEqual(3);
    expect(lumbar.plainEnglishDirective).toContain('tuck your tailbone');

    const knee = service.getPrescriptivePlan('patellofemoral_tracking');
    expect(knee.conditionKey).toBe('patellofemoral_tracking');
    expect(knee.focalPartId).toBe('r_shin');
    expect(knee.angleDeltas['kneeValgusDeg']).toBe(-10.5);
    expect(knee.bioTensorCues.some(c => c.action === 'contract')).toBe(true);

    const cervical = service.getPrescriptivePlan('cervical_spine_posture');
    expect(cervical.conditionKey).toBe('cervical_spine_posture');
    expect(cervical.focalPartId).toBe('spine_cervical');
    expect(cervical.plainEnglishDirective).toContain('chin straight backward');
  });

  it('should compute isochoric muscle belly expansion under contraction', () => {
    const r0 = 20.0; // 20mm baseline muscle radius
    // When muscle shortens to 80% length (contraction), radius must expand to conserve volume
    const contractedRadius = service.computeIsochoricMuscleDeformation(r0, 0.80);
    expect(contractedRadius).toBeGreaterThan(r0);
    expect(contractedRadius).toBeCloseTo(22.36, 1);

    // When muscle lengthens to 120% length, radius must thin
    const stretchedRadius = service.computeIsochoricMuscleDeformation(r0, 1.20);
    expect(stretchedRadius).toBeLessThan(r0);
  });

  it('should update rehab recovery progress signal within 0 to 1', () => {
    service.setRehabProgress(0.65);
    expect(service.activeRehabProgress()).toBe(0.65);

    service.setRehabProgress(1.5);
    expect(service.activeRehabProgress()).toBe(1.0);

    service.setRehabProgress(-0.5);
    expect(service.activeRehabProgress()).toBe(0.0);
  });
});
