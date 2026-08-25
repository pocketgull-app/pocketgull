import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private patientState = inject(PatientStateService);
  
  /**
   * Dispatches an immutable Cloud Audit Log metric containing the current action 
   * and the affected PHI Patient ID.
   */
  logAction(action: string, patientId: string | null = null, details?: any) {
     if (this.patientState.isEmergencyMode()) {
       console.info('[Audit] Telemetry suppressed in Emergency Mode.');
       return;
     }

     fetch('/api/audit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           action,
           userId: 'clinical-auth-user', // Mocked user until enterprise auth
           patientId,
           details
        })
     }).catch(e => console.error('[Audit] Telemetry failed to stream', e));
  }
}
