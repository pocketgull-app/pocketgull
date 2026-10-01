import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CrossDeviceSyncService } from './cross-device-sync.service';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';

describe('CrossDeviceSyncService', () => {
  let service: CrossDeviceSyncService;
  let mockPatientState: any;
  let mockPatientMgmt: any;

  beforeEach(() => {
    mockPatientState = {
      addClinicalNote: vi.fn(),
      vitals: signal({}),
      issues: signal({})
    };
    mockPatientMgmt = {
      selectedPatientId: signal('p_curie'),
      selectedPatient: signal({ name: 'Marie Curie', id: 'p_curie' })
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        CrossDeviceSyncService
      ]
    });

    service = runInInjectionContext(injector, () => injector.get(CrossDeviceSyncService));
  });

  it('1. Initializes with connected peer sync status and active room', () => {
    expect(service).toBeTruthy();
    expect(service.roomId()).toBe('er-trauma-pod-1');
    expect(service.isPeerSynced()).toBe(true);
    expect(service.onlineDeviceCount()).toBeGreaterThan(0);
    expect(service.latencyMs()).toBeGreaterThan(0);
  });

  it('2. Broadcasts ESI triage updates to connected devices', () => {
    service.broadcastEsiTriage({
      patientId: 'p_curie',
      patientName: 'Marie Curie',
      acuityLevel: 2,
      acuityLabel: 'EMERGENT',
      nurseAttestation: true,
      rationale: 'Severe acute radiation dermatitis with hemodynamic instability',
      timestamp: new Date().toISOString()
    });

    expect(service.pendingOutboxQueue().length).toBeGreaterThan(0);
    const queued = service.pendingOutboxQueue()[service.pendingOutboxQueue().length - 1];
    expect(queued.type).toBe('ESI_TRIAGE_UPDATE');
    expect(queued.data.acuityLevel).toBe(2);
    expect(queued.senderRole).toBe('web-workstation');
  });

  it('3. Broadcasts START disaster triage tags across devices', () => {
    service.broadcastStartDisasterTag({
      casualtyId: 'CAS-101',
      tagColor: 'RED',
      triageCategory: 'IMMEDIATE',
      respirations: 34,
      perfusionSeconds: 3.5,
      mentalStatus: 'UNRESPONSIVE',
      timestamp: new Date().toISOString()
    });

    expect(service.pendingOutboxQueue().length).toBeGreaterThan(0);
    const queued = service.pendingOutboxQueue()[service.pendingOutboxQueue().length - 1];
    expect(queued.type).toBe('DISASTER_START_UPDATE');
    expect(queued.data.tagColor).toBe('RED');
  });

  it('4. Ingests simulated remote update from Flutter provider mobile', () => {
    service.simulateRemoteMobileSync('ESI_TRIAGE_UPDATE', {
      patientId: 'p_curie',
      patientName: 'Marie Curie',
      acuityLevel: 1,
      acuityLabel: 'RESUSCITATION',
      nurseAttestation: true,
      rationale: 'Imminent respiratory collapse noted on mobile bedside exam',
      timestamp: new Date().toISOString()
    });

    expect(service.incomingSyncQueue().length).toBeGreaterThan(0);
    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
    const noteCall = mockPatientState.addClinicalNote.mock.calls[0][0];
    expect(noteCall.text).toContain('MOBILE SYNC: ESI 1 - RESUSCITATION');
    expect(noteCall.text).toContain('flutter-provider-mobile');
  });

  it('5. Ingests simulated disaster START tag from mobile provider app', () => {
    service.simulateRemoteMobileSync('DISASTER_START_UPDATE', {
      casualtyId: 'CAS-102',
      tagColor: 'YELLOW',
      triageCategory: 'DELAYED',
      respirations: 22,
      perfusionSeconds: 1.8,
      mentalStatus: 'FOLLOWS_COMMANDS',
      timestamp: new Date().toISOString()
    });

    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
    const noteCall = mockPatientState.addClinicalNote.mock.calls[0][0];
    expect(noteCall.text).toContain('MOBILE DISASTER SYNC: YELLOW TAG');
    expect(noteCall.text).toContain('CAS-102');
  });
});
