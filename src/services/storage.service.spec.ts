import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';
import { IPatientState } from './patient.types';

describe('StorageService Hermetic Persistence & In-Memory Fallback Suite', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(StorageService);
  });

  it('1. Initializes storage service cleanly in browser environment', () => {
    expect(service).toBeTruthy();
  });

  it('2. Persists and hydrates patient roster seamlessly via memory fallback when IDB is unavailable', async () => {
    const mockPatient = {
      id: 'pt_test_001',
      name: 'Maria Garcia',
      age: 48,
      gender: 'female'
    };

    await service.savePatient(mockPatient);
    const roster = await service.loadPatients();

    expect(roster).toBeDefined();
    expect(roster.length).toBe(1);
    expect(roster[0].id).toBe('pt_test_001');
    expect(roster[0].name).toBe('Maria Garcia');
  });

  it('3. Updates existing patient record on duplicate savePatient call', async () => {
    const initialPatient = { id: 'pt_002', name: 'John Doe', age: 55 };
    const updatedPatient = { id: 'pt_002', name: 'John Doe', age: 56 };

    await service.savePatient(initialPatient);
    await service.savePatient(updatedPatient);

    const roster = await service.loadPatients();
    expect(roster.length).toBe(1);
    expect(roster[0].age).toBe(56);
  });

  it('4. Deletes patient record accurately from memory store', async () => {
    const patientA = { id: 'pt_a', name: 'Alice' };
    const patientB = { id: 'pt_b', name: 'Bob' };

    await service.savePatient(patientA);
    await service.savePatient(patientB);

    let roster = await service.loadPatients();
    expect(roster.length).toBe(2);

    await service.deletePatient('pt_a');
    roster = await service.loadPatients();
    expect(roster.length).toBe(1);
    expect(roster[0].id).toBe('pt_b');
  });

  it('5. Persists and hydrates clinical patient state and chat history', async () => {
    const mockState = {
      selectedPartId: 'cervical-spine',
      symptoms: ['neck stiffness', 'occipital headache'],
      conditions: ['Cervical Radiculopathy'],
      activePatientSummary: 'Patient reports progressive neck stiffness.',
      vitals: { heartRate: 74, bloodPressure: '122/80' }
    } as unknown as IPatientState;

    const mockChat = [
      { role: 'user', content: 'What helps with cervical stiffness?' },
      { role: 'assistant', content: 'Gentle cervical retraction and posture adjustment.' }
    ];

    await service.saveState('pt_state_001', mockState);
    await service.saveChatHistory('pt_state_001', mockChat);

    const loaded = await service.loadState('pt_state_001');
    expect(loaded).toBeTruthy();
    expect(loaded?.state.selectedPartId).toBe('cervical-spine');
    expect(loaded?.chatHistory.length).toBe(2);
  });
});
