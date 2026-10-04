import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EhrWritebackConsoleComponent } from './ehr-writeback-console.component';
import { EhrWritebackService } from '../../services/fhir/ehr-writeback.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EhrWritebackConsoleComponent', () => {
  let component: EhrWritebackConsoleComponent;
  let fixture: ComponentFixture<EhrWritebackConsoleComponent>;
  let service: EhrWritebackService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EhrWritebackConsoleComponent],
      providers: [EhrWritebackService]
    }).compileComponents();

    fixture = TestBed.createComponent(EhrWritebackConsoleComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(EhrWritebackService);
    fixture.detectChanges();
  });

  it('should create the component successfully with EPIC as default vendor', () => {
    expect(component).toBeTruthy();
    expect(component.activeVendor()).toBe('EPIC');
    expect(component.activeVendorName()).toBe('Epic Hyperspace');
  });

  it('should switch vendors between EPIC, CERNER, ATHENA, and GENERIC_FHIR', () => {
    component.setVendor('CERNER');
    expect(component.activeVendor()).toBe('CERNER');
    expect(component.activeVendorName()).toBe('Cerner PowerChart');
    expect(service.activeVendor()).toBe('CERNER');

    component.setVendor('ATHENA');
    expect(component.activeVendor()).toBe('ATHENA');
    expect(component.activeVendorName()).toBe('Athenahealth');
  });

  it('should toggle public JWKS modal and provide valid RFC 7517 JSON', () => {
    expect(component.showJwksModal()).toBe(false);
    component.showJwksModal.set(true);
    expect(component.showJwksModal()).toBe(true);

    const jwks = JSON.parse(component.jwksJson());
    expect(jwks.keys).toBeDefined();
    expect(jwks.keys.length).toBeGreaterThan(0);
    expect(jwks.keys[0].kty).toBe('RSA');
    expect(jwks.keys[0].alg).toBe('RS384');
  });

  it('should execute automated system writeback and update last batch result', async () => {
    expect(service.lastBatchResult()).toBeNull();
    await component.executeWriteback();

    const batch = service.lastBatchResult();
    expect(batch).toBeDefined();
    expect(batch?.overallStatus).toBe('SUCCESS_FILED_TO_EHR');
    expect(batch?.receipts.length).toBe(3);
    expect(batch?.receipts.some(r => r.resourceType === 'DocumentReference')).toBe(true);
    expect(batch?.receipts.some(r => r.resourceType === 'CarePlan')).toBe(true);
    expect(batch?.receipts.some(r => r.resourceType === 'Observation')).toBe(true);
  });

  it('should switch preview tabs between DocumentReference, CarePlan, Observation, and JWT', async () => {
    await component.executeWriteback();

    component.activePreviewTab.set('DOCREF');
    expect(component.currentPreviewJson()).toContain('DocumentReference');

    component.activePreviewTab.set('CAREPLAN');
    expect(component.currentPreviewJson()).toContain('CarePlan');

    component.activePreviewTab.set('OBSERVATION');
    expect(component.currentPreviewJson()).toContain('Observation');

    component.activePreviewTab.set('JWT');
    expect(component.currentPreviewJson()).toContain('RS384');
  });

  it('should simulate ADT events and update real-time subscription monitor', async () => {
    expect(component.subscriptionEvents().length).toBe(0);

    await component.simulateAdtEvent('ADT_ADMISSION');
    expect(component.subscriptionEvents().length).toBe(1);
    expect(component.subscriptionEvents()[0].eventType).toBe('ADT_ADMISSION');
    expect(component.subscriptionEvents()[0].clinicalDecisionTriggered.actionSummary).toContain('Conformal Sepsis');

    await component.simulateAdtEvent('ADT_DISCHARGE');
    expect(component.subscriptionEvents().length).toBe(2);
    expect(component.subscriptionEvents()[0].eventType).toBe('ADT_DISCHARGE');
  });

  it('should emit close output when requested', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.close.emit();
    expect(closed).toBe(true);
  });
});
