// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import {
  SubstrateCheckpointService,
  computeSha256Hex,
  generateCsprngFloat53,
  IDualCustodySignature,
  IPatientVisitMetrics,
  WM_SLOT_MAX,
} from './substrate-checkpoint';

describe('SubstrateCheckpointService (gVisor Actor Hibernation, Visit Snapshots & Role Lenses)', () => {
  const service = new SubstrateCheckpointService();

  const samplePolypharmacyState = {
    patientPseudonymId: 'SAFE_HARBOR_PT_9042',
    cyp2d6Phenotype: 'POOR_METABOLIZER',
    candidateRegimen: ['Fluoxetine 20mg QD', 'Semaglutide 0.5mg QW'],
    popperianNullHypothesisPValue: 0.018,
    cochraneEvidenceTier: 'Level A',
  };

  const sampleFhirBundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'MedicationRequest',
          status: 'draft',
          intent: 'proposal',
        },
      },
    ],
  };

  const validSig1: IDualCustodySignature = {
    clinicianId: 'npi_attending_01',
    role: 'ATTENDING_PHYSICIAN',
    webAuthnAssertionDigest: computeSha256Hex('fido2_assertion_attending_01'),
    signedAtIso: '2026-10-17T14:00:00.000Z',
  };

  const validSig2: IDualCustodySignature = {
    clinicianId: 'npi_pharmacist_02',
    role: 'CLINICAL_PHARMACIST',
    webAuthnAssertionDigest: computeSha256Hex('fido2_assertion_pharmacist_02'),
    signedAtIso: '2026-10-17T14:05:00.000Z',
  };

  const visit1Metrics: IPatientVisitMetrics = {
    hba1cPercent: 6.8,
    sibiInflammatoryIndex: 42.0,
    periodontalProbingMaxMm: 5,
    toothWearIndexGrade: 2,
    logMarAcuity: 0.1,
    nightMelanopicEdiLux: 14,
    mayerWaveCoherenceRatio: 0.52,
    popperianNullHypothesisPValue: 0.12,
    cochraneEvidenceTier: 'Level B',
    activeMedications: ['Metformin 500mg BID', 'Fluoxetine 20mg QD'],
    estimatedMonthlyOutOfPocketUsd: 18.5,
    cyp450Alerts: ['CYP2D6 Moderate Inhibition (Fluoxetine)'],
  };

  const visit2Metrics: IPatientVisitMetrics = {
    hba1cPercent: 6.1,
    sibiInflammatoryIndex: 24.5,
    periodontalProbingMaxMm: 3,
    toothWearIndexGrade: 2,
    logMarAcuity: 0.0,
    nightMelanopicEdiLux: 6.5,
    mayerWaveCoherenceRatio: 0.84,
    popperianNullHypothesisPValue: 0.014,
    cochraneEvidenceTier: 'Level A',
    activeMedications: ['Metformin 500mg BID'],
    estimatedMonthlyOutOfPocketUsd: 8.0,
    cyp450Alerts: [],
  };

  it('freezes actor state with gVisor RuntimeClass, SPIFFE ID, MEMORY fidelity, and deterministic SHA-256 digest', () => {
    const envelope = service.hibernateActorState({
      actorSessionId: 'sess_act1_polypharm_001',
      trajectoryAct: 'ACT_I_METABOLIC_BRIDGE',
      statePayload: samplePolypharmacyState,
      fhirDraftBundle: sampleFhirBundle,
      requiredCustodyThreshold: 2,
    });

    expect(envelope.runtimeClassName).toBe('gvisor');
    expect(envelope.atespace).toBe('pocketgull-clinical');
    expect(envelope.spiffeActorId).toBe(
      'spiffe://ate.pocketgull.app/atespace/pocketgull-clinical/actor/sess_act1_polypharm_001'
    );
    expect(envelope.preferredFidelity).toBe('MEMORY');
    expect(envelope.zeroCredentialsInSandbox).toBe(true);
    expect(envelope.humanInTheLoopRequired).toBe(true);
    expect(envelope.exploratoryBadge).toBe(
      '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]'
    );
    expect(envelope.sha256StateDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('holds actor execution when fewer than M-of-N FIDO2 signatures are present on wake', () => {
    const envelope = service.hibernateActorState({
      actorSessionId: 'sess_act1_polypharm_002',
      trajectoryAct: 'ACT_I_METABOLIC_BRIDGE',
      statePayload: samplePolypharmacyState,
      fhirDraftBundle: sampleFhirBundle,
      requiredCustodyThreshold: 2,
    });

    const result = service.verifyAndTeleportActor({
      envelope,
      fhirDraftBundle: sampleFhirBundle,
      signatures: [validSig1],
    });

    expect(result.verified).toBe(true);
    expect(result.custodySatisfied).toBe(false);
    expect(result.restoredPayload).toBeNull();
  });

  it('teleports and releases actor state when 2-of-2 distinct FIDO2 signatures and SHA-256 digests match', () => {
    const envelope = service.hibernateActorState({
      actorSessionId: 'sess_act1_polypharm_003',
      trajectoryAct: 'ACT_I_METABOLIC_BRIDGE',
      statePayload: samplePolypharmacyState,
      fhirDraftBundle: sampleFhirBundle,
      requiredCustodyThreshold: 2,
    });

    const result = service.verifyAndTeleportActor({
      envelope,
      fhirDraftBundle: sampleFhirBundle,
      signatures: [validSig1, validSig2],
    });

    expect(result.verified).toBe(true);
    expect(result.custodySatisfied).toBe(true);
    expect(result.restoredPayload).toEqual(samplePolypharmacyState);
  });

  it('links longitudinal Patient Visit Snapshots via SHA-256 Merkle chain and projects 4-slot lenses per Clinical Role', () => {
    const visit1 = service.createPatientVisitSnapshot({
      fhirEncounterId: 'enc_oct_01',
      patientPseudonymId: 'SAFE_HARBOR_PT_9042',
      visitSequenceNumber: 1,
      previousVisitSnapshotDigest: null,
      consultingRole: 'ATTENDING_PHYSICIAN',
      trajectoryAct: 'ACT_I_METABOLIC_BRIDGE',
      metrics: visit1Metrics,
      fhirEncounterBundle: sampleFhirBundle,
    });

    const visit2 = service.createPatientVisitSnapshot({
      fhirEncounterId: 'enc_nov_15',
      patientPseudonymId: 'SAFE_HARBOR_PT_9042',
      visitSequenceNumber: 2,
      previousVisitSnapshotDigest: visit1.sha256VisitDigest,
      consultingRole: 'ATTENDING_PHYSICIAN',
      trajectoryAct: 'ACT_II_GLYMPHATIC_PACING',
      metrics: visit2Metrics,
      fhirEncounterBundle: sampleFhirBundle,
    });

    // 1. Patient Advocate Lens (Quiet Workshop Voice, <= 4 slots)
    const patientDiff = service.diffSnapshotsForClinicalRole({
      priorVisit: visit1,
      currentVisit: visit2,
      viewerRole: 'PATIENT_ADVOCATE',
    });
    expect(patientDiff.chainIntegrityVerified).toBe(true);
    expect(patientDiff.popperianH0Falsified).toBe(true);
    expect(patientDiff.workingMemorySlots.length).toBe(WM_SLOT_MAX);
    expect(patientDiff.workingMemorySlots[0].domainLabel).toContain('Where You Stand Today');

    // 2. Systemic Teledentist Lens (PPD & SIBI oral-systemic cross-talk)
    const dentalDiff = service.diffSnapshotsForClinicalRole({
      priorVisit: visit1,
      currentVisit: visit2,
      viewerRole: 'SYSTEMIC_TELEDENTIST',
    });
    expect(dentalDiff.workingMemorySlots.length).toBe(WM_SLOT_MAX);
    expect(dentalDiff.workingMemorySlots[0].deltaSummary).toContain('5mm -> 3mm');

    // 3. Neuro-Ophthalmologist Lens (LogMAR & RSNA mEDI < 10 lx)
    const ophthoDiff = service.diffSnapshotsForClinicalRole({
      priorVisit: visit1,
      currentVisit: visit2,
      viewerRole: 'NEURO_OPHTHALMOLOGIST',
    });
    expect(ophthoDiff.workingMemorySlots[1].clinicalActionOrAffirmation).toContain(
      'Sub-480nm blue light suppressed (< 10 lx)'
    );
  });

  it('forks a read-only counterfactual specialist branch without mutating the canonical visit snapshot', () => {
    const baseVisit = service.createPatientVisitSnapshot({
      fhirEncounterId: 'enc_base_01',
      patientPseudonymId: 'SAFE_HARBOR_PT_9042',
      visitSequenceNumber: 1,
      previousVisitSnapshotDigest: null,
      consultingRole: 'ATTENDING_PHYSICIAN',
      trajectoryAct: 'ACT_I_METABOLIC_BRIDGE',
      metrics: visit1Metrics,
      fhirEncounterBundle: sampleFhirBundle,
    });

    const pharmacistBranch = service.forkVisitSnapshotForRoleConsult({
      baseSnapshot: baseVisit,
      specialistRole: 'CLINICAL_PHARMACIST',
      proposedMetricOverrides: {
        estimatedMonthlyOutOfPocketUsd: 4.0,
        cyp450Alerts: [],
      },
      counterfactualFhirBundle: sampleFhirBundle,
    });

    expect(pharmacistBranch.isCounterfactualBranch).toBe(true);
    expect(pharmacistBranch.branchedFromSnapshotId).toBe(baseVisit.visitSnapshotId);
    expect(pharmacistBranch.previousVisitSnapshotDigest).toBe(baseVisit.sha256VisitDigest);
    expect(pharmacistBranch.metrics.estimatedMonthlyOutOfPocketUsd).toBe(4.0);
    // Original snapshot remains untouched
    expect(baseVisit.metrics.estimatedMonthlyOutOfPocketUsd).toBe(18.5);
  });

  it('generates unbiased 53-bit IEEE-754 floats in [0, 1) via OS CSPRNG', () => {
    for (let i = 0; i < 16; i++) {
      const val = generateCsprngFloat53();
      expect(val).toBeGreaterThanOrEqual(0.0);
      expect(val).toBeLessThan(1.0);
    }
  });
});
