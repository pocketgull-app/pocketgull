import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoveryCompanionModalComponent } from './recovery-companion-modal.component';
import { RecoveryCompanionService } from '../../services/recovery-companion.service';
import { EhrWritebackService } from '../../services/fhir/ehr-writeback.service';
import { PatientStateService } from '../../services/patient-state.service';
import { signal } from '@angular/core';

describe('RecoveryCompanionModalComponent', () => {
  let component: RecoveryCompanionModalComponent;
  let fixture: ComponentFixture<RecoveryCompanionModalComponent>;
  let companionService: RecoveryCompanionService;

  beforeEach(async () => {
    const mockPatientState = {
      asPatientSnapshot: () => ({ id: 'p001', name: 'Marcus Davis' }),
      vitals: signal({})
    };

    const mockEhrWriteback = {
      executeWriteback: vi.fn().mockResolvedValue({
        batchId: 'batch_test_modal_999',
        ehrVendor: 'EPIC',
        timestamp: new Date().toISOString(),
        authMethod: 'private_key_jwt (RFC 7523)',
        receipts: [{
          resourceType: 'Observation',
          fhirId: 'obs-modal-999',
          loincCode: '80290-0',
          httpStatus: 201
        }],
        overallStatus: 'SUCCESS_FILED_TO_EHR'
      })
    };

    await TestBed.configureTestingModule({
      imports: [RecoveryCompanionModalComponent],
      providers: [
        RecoveryCompanionService,
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: EhrWritebackService, useValue: mockEhrWriteback }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecoveryCompanionModalComponent);
    component = fixture.componentInstance;
    companionService = TestBed.inject(RecoveryCompanionService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('1. Initializes and renders modal with title and controls', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Daily Patient Recovery Check-In');
    expect(component.cravingScore()).toBe(2);
    expect(component.acuityTier()).toBe('STABLE_FLOURISHING');
  });

  it('2. Updates craving score and displays updated tier', async () => {
    await component.setCravingScore(5);
    fixture.detectChanges();

    expect(component.cravingScore()).toBe(5);
    expect(component.acuityTier()).toBe('MILD_STRAIN');
  });

  it('3. Renders crisis banner when craving score is severe (>= 8)', async () => {
    await component.setCravingScore(8);
    fixture.detectChanges();

    expect(component.acuityTier()).toBe('CRITICAL_INTERRUPT');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Urgent Recovery Support Active');
    expect(compiled.textContent).toContain('Call 988 Lifeline');
  });

  it('4. Simulates wearable sleep sync and updates telemetry values', async () => {
    await component.simulateWearableSync();
    fixture.detectChanges();

    expect(component.sleepTelemetry().source).toBe('Google Health Connect');
    expect(component.sleepTelemetry().totalSleepHours).toBe(6.8);
    expect(component.sleepTelemetry().deepSleepPercent).toBe(21);
  });

  it('5. Updates Bristol stool form type and recalculates enteric guidance', async () => {
    await component.setBristolType(1); // Severe OIBD constipation
    fixture.detectChanges();

    expect(component.bristolType()).toBe(1);
    expect(component.checkInResult()?.entericInterventions.some(i => i.includes('OIBD') || i.includes('PEG-3350'))).toBe(true);
  });

  it('6. Files daily check-in to EHR and renders confirmation badge', async () => {
    await component.setCravingScore(2);
    fixture.detectChanges();

    await component.fileToEhr();
    fixture.detectChanges();

    expect(component.writebackReceipt()).toBeDefined();
    expect(component.writebackReceipt()?.ehrVendor).toBe('EPIC');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('✓ Filed to EHR (EPIC)');
  });

  it('7. Emits close event when close button is clicked', () => {
    let emitted = false;
    component.close.subscribe(() => {
      emitted = true;
    });

    component.closeModal();
    expect(emitted).toBe(true);
  });
});
