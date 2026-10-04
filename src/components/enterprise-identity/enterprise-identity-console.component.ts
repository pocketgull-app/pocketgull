import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EnterpriseIdentityService,
  ISamlValidationResult,
  IScimUser
} from '../../services/enterprise-identity.service';
import { AuthSsoService } from '../../services/auth-sso.service';

@Component({
  selector: 'app-enterprise-identity-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-5xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-mono relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl shadow-xs">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider">
                Institutional Enterprise Identity &amp; Directory
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                SAML 2.0 &amp; SCIM 2.0
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Federated Okta / Microsoft Entra ID SSO &amp; automated shift rotation offboarding
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Preset IdP Switcher -->
          <select [ngModel]="identityService.idpPreset()"
                  (ngModelChange)="onPresetChange($event)"
                  id="select-idp-preset"
                  class="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer font-sans">
            <option value="okta">Okta Healthcare Cloud</option>
            <option value="entra">Microsoft Entra ID (Azure AD)</option>
            <option value="ping">PingFederate Hospital Enterprise</option>
            <option value="custom">Custom Academic Hospital IdP</option>
          </select>

          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close Enterprise Identity Console"
                  id="btn-close-identity-console"
                  class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer">
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10 font-sans">
        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Active Directory IdP</span>
          <span class="text-sm font-mono font-bold text-blue-400 mt-1 block truncate">
            {{ identityService.activeIdp().name }}
          </span>
          <span class="text-[10px] font-mono text-zinc-500">OASIS SAML 2.0 SP</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Clinicians Roster</span>
          <span class="text-xl font-mono font-black text-emerald-400 mt-1 block">
            {{ identityService.stats().activeClinicians }} <span class="text-xs font-normal text-zinc-400">/ {{ identityService.stats().totalClinicians }}</span>
          </span>
          <span class="text-[10px] font-mono text-zinc-500">RFC 7643 SCIM 2.0</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Shift Offboarded</span>
          <span class="text-xl font-mono font-black text-amber-400 mt-1 block">
            {{ identityService.stats().deactivatedClinicians }}
          </span>
          <span class="text-[10px] font-mono text-zinc-500">Instant Access Revocation</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Audit Ledger</span>
          <span class="text-xl font-mono font-black text-indigo-300 mt-1 block">
            {{ identityService.stats().totalAudits }}
          </span>
          <span class="text-[10px] font-mono text-zinc-500">FDA 21 CFR Part 11</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-zinc-800/80 mb-5 relative z-10">
        <button type="button"
                (click)="activeTab.set('saml')"
                id="tab-btn-saml"
                [class.text-blue-400]="activeTab() === 'saml'"
                [class.border-blue-500]="activeTab() === 'saml'"
                class="px-4 py-2 text-xs font-bold border-b-2 border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>🔑</span> Federated SSO (SAML 2.0)
        </button>
        <button type="button"
                (click)="activeTab.set('scim')"
                id="tab-btn-scim"
                [class.text-blue-400]="activeTab() === 'scim'"
                [class.border-blue-500]="activeTab() === 'scim'"
                class="px-4 py-2 text-xs font-bold border-b-2 border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>👥</span> Hospital Roster (SCIM 2.0)
        </button>
        <button type="button"
                (click)="activeTab.set('audit')"
                id="tab-btn-audit"
                [class.text-blue-400]="activeTab() === 'audit'"
                [class.border-blue-500]="activeTab() === 'audit'"
                class="px-4 py-2 text-xs font-bold border-b-2 border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>📜</span> 21 CFR Part 11 Audit Trail
        </button>
      </div>

      <!-- Alert / Success Notification Banner -->
      @if (notificationMessage()) {
        <div class="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center justify-between font-sans">
          <span>{{ notificationMessage() }}</span>
          <button type="button" (click)="notificationMessage.set(null)" class="text-blue-400 hover:text-blue-200 font-bold ml-2">✕</button>
        </div>
      }

      <!-- TAB 1: SAML 2.0 SSO -->
      @if (activeTab() === 'saml') {
        <div class="space-y-5 relative z-10">
          <!-- SP Metadata Card -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 font-sans">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 class="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Service Provider (SP) Metadata</h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Provide these identifiers to your hospital Okta / Microsoft Entra ID administrator:</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button"
                        (click)="copySpMetadata()"
                        id="btn-copy-metadata"
                        class="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1">
                  📋 Copy XML
                </button>
                <button type="button"
                        (click)="downloadSpMetadata()"
                        id="btn-download-metadata"
                        class="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1">
                  ⬇️ Download XML
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div class="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span class="text-[10px] text-zinc-500 uppercase block">SP Entity ID (Audience URI)</span>
                <span class="text-zinc-200 text-[11px] select-all">https://pocketgull.app/saml/sp</span>
              </div>
              <div class="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span class="text-[10px] text-zinc-500 uppercase block">Assertion Consumer Service (ACS URL)</span>
                <span class="text-zinc-200 text-[11px] select-all">https://pocketgull.app/api/auth/saml/acs</span>
              </div>
            </div>
          </div>

          <!-- Live SAML Assertion Inspector -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 font-sans">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 class="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">SAML 2.0 Response Inspector &amp; Validator</h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Test enterprise SAML assertion validation with XML signature and digest verification:</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button"
                        (click)="loadSampleAssertion('curie')"
                        id="btn-load-sample-curie"
                        class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-mono transition cursor-pointer">
                  🧪 Load Dr. Curie (ICU Admin)
                </button>
                <button type="button"
                        (click)="loadSampleAssertion('vance')"
                        id="btn-load-sample-vance"
                        class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-mono transition cursor-pointer">
                  🧪 Load Dr. Vance (Cardiology)
                </button>
              </div>
            </div>

            <textarea [ngModel]="samlInputXml()"
                      (ngModelChange)="samlInputXml.set($event)"
                      id="textarea-saml-xml"
                      rows="6"
                      placeholder="Paste OASIS SAML 2.0 XML or Base64 encoded SAMLResponse here..."
                      class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500 leading-relaxed"></textarea>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button type="button"
                      (click)="validateCurrentAssertion()"
                      id="btn-validate-saml"
                      [disabled]="!samlInputXml().trim() || identityService.isProcessing()"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-sm">
                <span>⚡</span> Validate Assertion &amp; Verify Signature
              </button>

              @if (validationResult() && validationResult()!.valid) {
                <button type="button"
                        (click)="authorizeSession()"
                        id="btn-authorize-saml"
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <span>✅</span> Authorize Clinician Session ({{ validationResult()!.claims?.displayName }})
                </button>
              }
            </div>

            <!-- Validation Result HUD -->
            @if (validationResult()) {
              <div class="mt-4 p-4 rounded-2xl border font-mono text-xs space-y-3"
                   [class.bg-emerald-950-30]="validationResult()!.valid"
                   [class.border-emerald-500-30]="validationResult()!.valid"
                   [class.bg-rose-950-30]="!validationResult()!.valid"
                   [class.border-rose-500-30]="!validationResult()!.valid">
                <div class="flex items-center justify-between">
                  <span class="font-bold flex items-center gap-2"
                        [class.text-emerald-300]="validationResult()!.valid"
                        [class.text-rose-300]="!validationResult()!.valid">
                    <span>{{ validationResult()!.valid ? '✓ VALID OASIS SAML 2.0 ASSERTION' : '✗ SAML VALIDATION FAILED' }}</span>
                  </span>
                  <span class="text-[10px] text-zinc-400">Issuer: {{ validationResult()!.issuer }}</span>
                </div>

                @if (validationResult()!.errors.length > 0) {
                  <ul class="text-rose-300 text-[11px] list-disc list-inside space-y-0.5">
                    @for (err of validationResult()!.errors; track err) {
                      <li>{{ err }}</li>
                    }
                  </ul>
                }

                @if (validationResult()!.claims) {
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-[11px]">
                    <div>
                      <span class="text-zinc-500 block text-[9px] uppercase">Clinician</span>
                      <span class="text-zinc-200 font-bold">{{ validationResult()!.claims!.displayName }}</span>
                    </div>
                    <div>
                      <span class="text-zinc-500 block text-[9px] uppercase">Email</span>
                      <span class="text-zinc-200">{{ validationResult()!.claims!.email }}</span>
                    </div>
                    <div>
                      <span class="text-zinc-500 block text-[9px] uppercase">NPI Number</span>
                      <span class="text-blue-300 font-bold">{{ validationResult()!.claims!.npi || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-zinc-500 block text-[9px] uppercase">Department</span>
                      <span class="text-zinc-200">{{ validationResult()!.claims!.department }}</span>
                    </div>
                    <div>
                      <span class="text-zinc-500 block text-[9px] uppercase">Clinical Role</span>
                      <span class="text-emerald-300 font-bold">{{ validationResult()!.claims!.clinicalRole }}</span>
                    </div>
                    <div>
                      <span class="text-zinc-500 block text-[9px] uppercase">Shift Rotation</span>
                      <span class="text-zinc-300">{{ validationResult()!.claims!.shiftRotation || 'N/A' }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: SCIM 2.0 DIRECTORY -->
      @if (activeTab() === 'scim') {
        <div class="space-y-5 relative z-10">
          <!-- Quick Provision Modal / Drawer Form -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 font-sans">
            <h4 class="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Provision New Clinician (SCIM 2.0 API)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input type="text"
                     placeholder="Full Name (e.g., Dr. Jonas Salk, MD)"
                     [ngModel]="newClinicianName()"
                     (ngModelChange)="newClinicianName.set($event)"
                     id="input-scim-name"
                     class="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"/>
              <input type="email"
                     placeholder="Hospital Email"
                     [ngModel]="newClinicianEmail()"
                     (ngModelChange)="newClinicianEmail.set($event)"
                     id="input-scim-email"
                     class="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"/>
              <input type="text"
                     placeholder="NPI (10 digits)"
                     [ngModel]="newClinicianNpi()"
                     (ngModelChange)="newClinicianNpi.set($event)"
                     id="input-scim-npi"
                     class="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"/>
              <button type="button"
                      (click)="provisionClinician()"
                      id="btn-provision-clinician"
                      [disabled]="!newClinicianName() || !newClinicianEmail()"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer disabled:opacity-40">
                + Provision Clinician
              </button>
            </div>
          </div>

          <!-- Clinicians Roster Table -->
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 font-sans">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h4 class="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Shift Rotation Clinician Directory</h4>
              <span class="text-[11px] text-zinc-400 font-mono">Endpoint: /api/scim/v2/Users</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead>
                  <tr class="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                    <th class="py-2.5 px-3">Clinician / Title</th>
                    <th class="py-2.5 px-3">Department</th>
                    <th class="py-2.5 px-3">NPI</th>
                    <th class="py-2.5 px-3">Role</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60">
                  @for (clinician of identityService.clinicians(); track clinician.id) {
                    <tr class="hover:bg-zinc-900/40 transition">
                      <td class="py-2.5 px-3">
                        <div class="font-bold text-zinc-200">{{ clinician.displayName }}</div>
                        <div class="text-[10px] text-zinc-500">{{ clinician.userName }}</div>
                      </td>
                      <td class="py-2.5 px-3 text-zinc-300">
                        {{ clinician['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']?.department || 'Medicine' }}
                      </td>
                      <td class="py-2.5 px-3 text-blue-300">
                        {{ clinician['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']?.npi || '—' }}
                      </td>
                      <td class="py-2.5 px-3 text-[11px] text-zinc-300">
                        {{ clinician.roles[0]?.display || clinician.roles[0]?.value || 'Attending' }}
                      </td>
                      <td class="py-2.5 px-3">
                        @if (clinician.active) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            OFFBOARDED
                          </span>
                        }
                      </td>
                      <td class="py-2.5 px-3 text-right space-x-1.5">
                        @if (clinician.active) {
                          <button type="button"
                                  (click)="deprovisionClinician(clinician)"
                                  class="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] transition cursor-pointer">
                            End Shift / De-provision
                          </button>
                        } @else {
                          <button type="button"
                                  (click)="reactivateClinician(clinician)"
                                  class="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] transition cursor-pointer">
                            Reactivate
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: AUDIT TRAIL -->
      @if (activeTab() === 'audit') {
        <div class="space-y-4 relative z-10">
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 font-sans">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 class="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">FDA 21 CFR Part 11 Electronic Records Audit Ledger</h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Immutable SHA-256 sealed transaction history of all identity events:</p>
              </div>
              <button type="button"
                      (click)="downloadAuditJson()"
                      id="btn-export-audit"
                      class="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-mono transition cursor-pointer flex items-center gap-1.5">
                <span>📥</span> Export Audit Ledger (JSON)
              </button>
            </div>

            <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
              @for (entry of identityService.auditTrail(); track entry.id) {
                <div class="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 font-mono text-xs space-y-1">
                  <div class="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                    <span class="font-bold text-blue-300">{{ entry.action }}</span>
                    <span class="text-zinc-500 text-[10px]">{{ entry.timestamp }}</span>
                  </div>
                  <p class="text-zinc-300 font-sans text-xs">{{ entry.details }}</p>
                  <div class="flex flex-wrap items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                    <span>Actor: <span class="text-zinc-400">{{ entry.actor }}</span></span>
                    <span class="font-mono text-[9px] text-zinc-400 truncate max-w-xs" title="{{ entry.integrityHash }}">
                      SHA-256: {{ entry.integrityHash.substring(0, 16) }}...
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class EnterpriseIdentityConsoleComponent {
  readonly identityService = inject(EnterpriseIdentityService);
  readonly authSso = inject(AuthSsoService);

  readonly close = output<void>();

  readonly activeTab = signal<'saml' | 'scim' | 'audit'>('saml');
  readonly notificationMessage = signal<string | null>(null);

  // SAML State
  readonly samlInputXml = signal<string>('');
  readonly validationResult = signal<ISamlValidationResult | null>(null);

  // SCIM Provision Form State
  readonly newClinicianName = signal<string>('');
  readonly newClinicianEmail = signal<string>('');
  readonly newClinicianNpi = signal<string>('');

  constructor() {
    // Pre-populate with Dr. Curie sample assertion on first load
    this.loadSampleAssertion('curie');
  }

  onPresetChange(preset: string): void {
    if (preset === 'okta' || preset === 'entra' || preset === 'ping' || preset === 'custom') {
      this.identityService.configureIdp(preset);
      this.notificationMessage.set(`Switched Identity Provider to ${this.identityService.activeIdp().name}`);
    }
  }

  async loadSampleAssertion(profile: 'curie' | 'vance'): Promise<void> {
    if (profile === 'curie') {
      const xml = this.identityService.generateSampleSamlAssertion({
        email: 'dr.curie@hopkinsmedicine.org',
        displayName: 'Dr. Jane Curie, MD, PhD',
        npi: '1982736450',
        department: 'Surgical ICU & Resuscitation',
        clinicalRole: 'roles/healthcare.datasetAdmin',
        roleTitle: 'Medical Director (EHR & FHIR Admin)',
        shiftRotation: 'Day ICU Trauma Block A'
      });
      this.samlInputXml.set(xml);
    } else {
      const xml = this.identityService.generateSampleSamlAssertion({
        email: 'marcus.vance@mayo.edu',
        displayName: 'Dr. Marcus Vance, MD',
        npi: '1457896321',
        department: 'Division of Inpatient Cardiology',
        clinicalRole: 'roles/aiplatform.user',
        roleTitle: 'Attending Clinician (CDS & AI Consult)',
        shiftRotation: 'Cardiology Consult Shift 2'
      });
      this.samlInputXml.set(xml);
    }
    await this.validateCurrentAssertion();
  }

  async validateCurrentAssertion(): Promise<void> {
    const xml = this.samlInputXml();
    if (!xml.trim()) return;

    const res = await this.identityService.validateSamlAssertion(xml);
    this.validationResult.set(res);
    if (res.valid) {
      this.notificationMessage.set(`Successfully verified SAML 2.0 assertion for ${res.claims?.displayName}`);
    }
  }

  async authorizeSession(): Promise<void> {
    const val = this.validationResult();
    if (!val || !val.valid) return;

    try {
      const session = await this.identityService.authorizeSamlSession(val);
      this.notificationMessage.set(`Session Authorized! Clinician ${session.name} is now signed in with 12-hour hospital shift token.`);
    } catch (err: unknown) {
      this.notificationMessage.set(`Authorization failed: ${(err as Error)?.message}`);
    }
  }

  async provisionClinician(): Promise<void> {
    const name = this.newClinicianName().trim();
    const email = this.newClinicianEmail().trim();
    const npi = this.newClinicianNpi().trim();

    if (!name || !email) return;

    await this.identityService.provisionScimUser({
      userName: email,
      displayName: name,
      'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
        department: 'General Inpatient Medicine',
        npi: npi || undefined,
        organization: this.identityService.activeIdp().name
      }
    });

    this.notificationMessage.set(`Provisioned clinician ${name} via SCIM 2.0`);
    this.newClinicianName.set('');
    this.newClinicianEmail.set('');
    this.newClinicianNpi.set('');
  }

  async deprovisionClinician(clinician: IScimUser): Promise<void> {
    await this.identityService.deprovisionClinician(clinician.id, 'Shift Handover Complete');
    this.notificationMessage.set(`De-provisioned ${clinician.displayName} (active: false). Credentials revoked.`);
  }

  async reactivateClinician(clinician: IScimUser): Promise<void> {
    await this.identityService.reactivateClinician(clinician.id);
    this.notificationMessage.set(`Reactivated ${clinician.displayName}. Access restored.`);
  }

  copySpMetadata(): void {
    const xml = this.identityService.spMetadataXml();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(xml);
      this.notificationMessage.set('Copied OASIS SAML 2.0 SP Metadata XML to clipboard');
    }
  }

  downloadSpMetadata(): void {
    const xml = this.identityService.spMetadataXml();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pocketgull-sp-metadata.xml';
    a.click();
    URL.revokeObjectURL(url);
    this.notificationMessage.set('Downloaded pocketgull-sp-metadata.xml');
  }

  downloadAuditJson(): void {
    const json = this.identityService.exportAuditTrailJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull-identity-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.notificationMessage.set('Downloaded FDA 21 CFR Part 11 Audit Log JSON');
  }
}
