// SPDX-License-Identifier: Apache-2.0
import { Injectable } from '@angular/core';
import { computeFipsSha256Bytes } from './clinical-defense-guard.service';

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
   * Generates PKCE code verifier string using OS CSPRNG cryptographic entropy.
   * Fails closed if Web/Node Crypto CSPRNG is unavailable.
   */
  public generateCodeVerifier(): string {
    if (typeof globalThis === 'undefined' || typeof globalThis.crypto?.getRandomValues !== 'function') {
      throw new Error('NIST SP 800-90A CSPRNG unavailable: cannot generate PKCE code_verifier.');
    }
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return 'pg_pkce_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Computes genuine RFC 7636 S256 PKCE code_challenge: BASE64URL(SHA256(ASCII(code_verifier))).
   */
  public computePkceCodeChallengeS256(codeVerifier: string): string {
    const digest = computeFipsSha256Bytes(codeVerifier);
    let binary = '';
    for (let i = 0; i < digest.byteLength; i++) {
      binary += String.fromCharCode(digest[i]);
    }
    const base64 = typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(digest).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Constructs SMART-on-FHIR OAuth2 Authorization Launch URL.
   */
  public buildAuthorizationUrl(config: ISmartLaunchConfig): ISmartAuthUrlResult {
    const vendorEndpoints = this.defaultVendorEndpoints[config.vendor] || this.defaultVendorEndpoints.GENERIC_FHIR;
    const fhirBaseUrl = config.fhirBaseUrl || vendorEndpoints.defaultBaseUrl;
    const scopes = config.scope || 'patient/*.read launch/patient openid fhirUser';
    if (typeof globalThis === 'undefined' || typeof globalThis.crypto?.getRandomValues !== 'function') {
      throw new Error('NIST SP 800-90A CSPRNG unavailable: cannot generate OAuth2 anti-CSRF state nonce.');
    }
    const stateArray = new Uint8Array(16);
    globalThis.crypto.getRandomValues(stateArray);
    const state = 'state_' + Array.from(stateArray, b => b.toString(16).padStart(2, '0')).join('');
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.computePkceCodeChallengeS256(codeVerifier);

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
}
