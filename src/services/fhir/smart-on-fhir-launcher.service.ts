import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from '../patient-state.service';

export interface ISmartEhrVendor {
  id: string;
  name: string;
  logo: string;
  authorizeUrl: string;
  tokenUrl: string;
  fhirBaseUrl: string;
  supportedScopes: string[];
}

export interface ISmartLaunchSession {
  vendorId: string;
  clientId: string;
  launchToken?: string;
  accessToken?: string;
  idToken?: string;
  patientId?: string;
  encounterId?: string;
  status: 'IDLE' | 'AUTHORIZING' | 'CONNECTED' | 'ERROR';
  uscdiVersion: 'v1' | 'v2' | 'v3' | 'v4';
}

@Injectable({
  providedIn: 'root'
})
export class SmartOnFhirLauncherService {
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly supportedVendors = signal<ISmartEhrVendor[]>([
    {
      id: 'epic',
      name: 'Epic Hyperspace / MyChart',
      logo: '🏥',
      authorizeUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
      supportedScopes: ['launch', 'openid', 'fhirUser', 'patient/*.read', 'user/*.read']
    },
    {
      id: 'cerner',
      name: 'Oracle Cerner PowerChart',
      logo: '💊',
      authorizeUrl: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/provider/authorize',
      tokenUrl: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token',
      fhirBaseUrl: 'https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d',
      supportedScopes: ['launch', 'patient/Patient.read', 'patient/Observation.read', 'patient/Condition.read']
    },
    {
      id: 'athena',
      name: 'AthenaHealth EHR',
      logo: '⚡',
      authorizeUrl: 'https://api.platform.athenahealth.com/oauth2/v1/authorize',
      tokenUrl: 'https://api.platform.athenahealth.com/oauth2/v1/token',
      fhirBaseUrl: 'https://api.platform.athenahealth.com/fhir/r4',
      supportedScopes: ['launch', 'patient/*.read']
    },
    {
      id: 'va_health',
      name: 'VA Lighthouse Health API',
      logo: '🇺🇸',
      authorizeUrl: 'https://sandbox-api.va.gov/oauth2/health/v1/v2/authorization',
      tokenUrl: 'https://sandbox-api.va.gov/oauth2/health/v1/v2/token',
      fhirBaseUrl: 'https://sandbox-api.va.gov/services/fhir/v1/r4',
      supportedScopes: ['launch', 'openid', 'profile', 'offline_access', 'patient/Patient.read']
    }
  ]);

  readonly activeSession = signal<ISmartLaunchSession>({
    vendorId: 'epic',
    clientId: 'pocketgull-smart-app-v1',
    status: 'IDLE',
    uscdiVersion: 'v4'
  });

  readonly isConnected = computed(() => this.activeSession().status === 'CONNECTED');

  initiateLaunch(vendorId: string, launchToken?: string): void {
    const vendor = this.supportedVendors().find(v => v.id === vendorId);
    if (!vendor) return;

    this.activeSession.set({
      vendorId: vendor.id,
      clientId: 'pocketgull-smart-app-v1',
      launchToken: launchToken || 'simulated-epic-launch-token-88f92a',
      status: 'AUTHORIZING',
      uscdiVersion: 'v4'
    });

    // Simulate SMART v2 OAuth2 token exchange & USCDI v4 FHIR patient import
    setTimeout(() => {
      this.activeSession.update(session => ({
        ...session,
        accessToken: 'smart-v2-access-token-epic-P001',
        idToken: 'smart-v2-id-token-dr-gear',
        patientId: 'P001',
        encounterId: 'ENC-2026-0811',
        status: 'CONNECTED'
      }));

      // Hydrate PatientStateService if available
      if (this.patientState) {
        console.log('[SMART on FHIR] Ingested USCDI v4 Patient Context for P001');
      }
    }, 800);
  }

  disconnectSession(): void {
    this.activeSession.set({
      vendorId: 'epic',
      clientId: 'pocketgull-smart-app-v1',
      status: 'IDLE',
      uscdiVersion: 'v4'
    });
  }
}
