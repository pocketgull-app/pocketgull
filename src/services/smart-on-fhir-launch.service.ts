import { Injectable } from '@angular/core';

export type EhrVendor = 'EPIC' | 'CERNER' | 'ATHENAHEALTH' | 'GENERIC_FHIR';

export interface ISmartLaunchConfig {
  vendor: EhrVendor;
  fhirBaseUrl: string;       // e.g. https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
  clientId: string;           // SMART App Client ID
  redirectUri: string;        // e.g. https://pocketgull.app/launch/callback
  scope?: string;             // e.g. patient/*.read launch/patient openid fhirUser
  launchToken?: string;       // EHR Launch Context Token
}

export interface ISmartAuthUrlResult {
  vendor: EhrVendor;
  authorizationUrl: string;
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  requestedScopes: string;
}

@Injectable({
  providedIn: 'root'
})
export class SmartOnFhirLaunchService {

  private readonly defaultVendorEndpoints: Record<EhrVendor, { authEndpoint: string; defaultBaseUrl: string }> = {
    EPIC: {
      authEndpoint: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      defaultBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
    },
    CERNER: {
      authEndpoint: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/hosts/fhir-myrecord.cerner.com/open/oauth2/authorize',
      defaultBaseUrl: 'https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d'
    },
    ATHENAHEALTH: {
      authEndpoint: 'https://api.platform.athenahealth.com/oauth2/v1/authorize',
      defaultBaseUrl: 'https://api.platform.athenahealth.com/fhir/r4'
    },
    GENERIC_FHIR: {
      authEndpoint: 'https://launch.smarthealthit.org/v/r4/auth/authorize',
      defaultBaseUrl: 'https://launch.smarthealthit.org/v/r4/fhir'
    }
  };

  /**
   * Generates PKCE code verifier string.
   */
  public generateCodeVerifier(): string {
    return 'pg_pkce_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Constructs SMART-on-FHIR OAuth2 Authorization Launch URL.
   */
  public buildAuthorizationUrl(config: ISmartLaunchConfig): ISmartAuthUrlResult {
    const vendorEndpoints = this.defaultVendorEndpoints[config.vendor] || this.defaultVendorEndpoints.GENERIC_FHIR;
    const fhirBaseUrl = config.fhirBaseUrl || vendorEndpoints.defaultBaseUrl;
    const scopes = config.scope || 'patient/*.read launch/patient openid fhirUser';
    const state = 'state_' + Math.random().toString(36).substring(2, 10);
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = 'S256_' + codeVerifier; // Simplified PKCE S256 challenge string

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId || (config.vendor === 'ATHENAHEALTH' ? '0oa13r0te5ag3V2g9298' : config.vendor === 'CERNER' ? '311f9a54-f5b6-4196-b764-8798fd46afb8' : 'pocketgull-smart-client-v1'),
      redirect_uri: config.redirectUri || (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? `${window.location.protocol}//${window.location.host}/launch/callback` 
        : 'https://pocketgull.app/launch/callback'),
      scope: scopes,
      state: state,
      aud: fhirBaseUrl,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    if (config.launchToken) {
      params.set('launch', config.launchToken);
    }

    const authorizationUrl = `${vendorEndpoints.authEndpoint}?${params.toString()}`;

    return {
      vendor: config.vendor,
      authorizationUrl,
      state,
      codeVerifier,
      codeChallenge,
      requestedScopes: scopes
    };
  }

  /**
   * Parses EHR Launch URL params (iss & launch token).
   */
  public parseLaunchParams(urlParams: Record<string, string>): { iss: string | null; launch: string | null } {
    return {
      iss: urlParams['iss'] || null,
      launch: urlParams['launch'] || null
    };
  }

  /**
   * Generates a realistic live FHIR R4 Bundle for instant testing and sandbox demonstration.
   */
  public generateMockEhrBundle(patientName: string = 'Dr. Jane Doe, Ph.D.', hr: number = 74, bpSystolic: number = 118, bpDiastolic: number = 76): any {
    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 5,
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'smart-patient-001',
            name: [{ given: [patientName.split(' ')[0]], family: patientName.split(' ').slice(1).join(' ') }],
            gender: 'female',
            birthDate: '1988-04-12'
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-hr-001',
            code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
            valueQuantity: { value: hr, unit: 'beats/minute', system: 'http://unitsofmeasure.org', code: '/min' }
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-bp-001',
            code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }] },
            component: [
              {
                code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
                valueQuantity: { value: bpSystolic, unit: 'mmHg' }
              },
              {
                code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
                valueQuantity: { value: bpDiastolic, unit: 'mmHg' }
              }
            ]
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-spo2-001',
            code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood' }] },
            valueQuantity: { value: 99, unit: '%', system: 'http://unitsofmeasure.org', code: '%' }
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'cond-001',
            code: {
              coding: [{ system: 'http://snomed.info/sct', code: '38341003', display: 'Hypertensive disorder' }],
              text: 'Essential Hypertension (Stage 1)'
            }
          }
        }
      ]
    };
  }
}
