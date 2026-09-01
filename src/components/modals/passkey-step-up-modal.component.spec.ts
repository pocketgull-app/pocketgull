import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PasskeyStepUpModalComponent } from './passkey-step-up-modal.component';
import { WebauthnPasskeyService } from '../../services/webauthn-passkey.service';

describe('PasskeyStepUpModalComponent Unit Suite', () => {
  let component: PasskeyStepUpModalComponent;
  let service: WebauthnPasskeyService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PasskeyStepUpModalComponent, WebauthnPasskeyService]
    });
    component = runInInjectionContext(injector, () => injector.get(PasskeyStepUpModalComponent));
    service = injector.get(WebauthnPasskeyService);
  });

  it('1. Initializes cleanly with injected WebauthnPasskeyService', () => {
    expect(component).toBeTruthy();
    expect(component.passkeyService).toBe(service);
  });

  it('2. Authenticates pending challenge and triggers verification', async () => {
    service.pendingChallenge.set({
      actionDescription: 'Export Bulk Records',
      requiredRole: 'CLINICIAN',
      riskCategory: 'BULK_RECORD_EXPORT',
      minimumAal: 'AAL-2'
    });

    await component.authenticate();
    expect(service.lastVerifiedAttestation()).toBeTruthy();
    expect(service.lastVerifiedAttestation()?.aalLevel).toBe('AAL-2');
  });

  it('3. Cancels pending challenge when cancel() is invoked', () => {
    service.pendingChallenge.set({
      actionDescription: 'Delete State',
      requiredRole: 'EXECUTIVE',
      riskCategory: 'STATE_DELETION',
      minimumAal: 'AAL-3'
    });

    component.cancel();
    expect(service.pendingChallenge()).toBeNull();
  });
});
