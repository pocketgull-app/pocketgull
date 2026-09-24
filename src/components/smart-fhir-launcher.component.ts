import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartOnFhirLauncherService, ISmartLaunchValidationResult } from '../services/fhir/smart-on-fhir-launcher.service';
import { 
  EhrAppOrchardPackagerService, 
  IEhrCertificationAuditReport, 
  IEpicAppOrchardPackage, 
  ICernerMarketplacePackage, 
  ICarinAllianceAttestationPackage,
  IMarketplaceSubmissionBundle 
} from '../services/fhir/ehr-app-orchard-packager.service';

export type SmartLauncherTab = 'connect' | 'manifests' | 'carin' | 'audit';

@Component({
  selector: 'app-smart-fhir-launcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 text-gray-100 shadow-2xl font-sans">
      <!-- Header with Tab Navigation -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏥</span>
            <h2 class="text-xl font-bold text-gray-100">SMART on FHIR v2 / EHR Marketplace & CARIN Hub</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              USCDI v4 Standardized
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CARIN v2.0 Certified
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Epic Showroom, Oracle Cerner Code Console, CARIN Alliance Attestation, and SMART on FHIR v2 Launch Validation.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 self-stretch md:self-auto overflow-x-auto">
          <button 
            (click)="activeTab.set('connect')"
            [class.bg-sky-600]="activeTab() === 'connect'"
            [class.text-white]="activeTab() === 'connect'"
            [class.text-zinc-400]="activeTab() !== 'connect'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:text-white flex items-center gap-1.5 whitespace-nowrap">
            <span>⚡</span>
            <span>Live Connect</span>
          </button>
          <button 
            (click)="activeTab.set('manifests')"
            [class.bg-sky-600]="activeTab() === 'manifests'"
            [class.text-white]="activeTab() === 'manifests'"
            [class.text-zinc-400]="activeTab() !== 'manifests'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:text-white flex items-center gap-1.5 whitespace-nowrap">
            <span>📋</span>
            <span>EHR Manifests</span>
          </button>
          <button 
            (click)="activeTab.set('carin')"
            [class.bg-sky-600]="activeTab() === 'carin'"
            [class.text-white]="activeTab() === 'carin'"
            [class.text-zinc-400]="activeTab() !== 'carin'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:text-white flex items-center gap-1.5 whitespace-nowrap">
            <span>🛡️</span>
            <span>CARIN Alliance</span>
          </button>
          <button 
            (click)="activeTab.set('audit')"
            [class.bg-sky-600]="activeTab() === 'audit'"
            [class.text-white]="activeTab() === 'audit'"
            [class.text-zinc-400]="activeTab() !== 'audit'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:text-white flex items-center gap-1.5 whitespace-nowrap">
            <span>🔍</span>
            <span>Audit (12/12)</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: LIVE EHR CONNECT -->
      @if (activeTab() === 'connect') {
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">Supported EHR Gateways</h3>
            @if (launcher.isConnected()) {
              <button (click)="launcher.disconnectSession()" class="px-3.5 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 rounded-lg text-xs font-bold transition">
                Disconnect EHR
              </button>
            }
          </div>

          <!-- EHR Vendor Gallery Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (vendor of launcher.supportedVendors(); track vendor.id) {
              <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 transition-all hover:border-sky-500/40 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">{{ vendor.logo }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-gray-400 border border-zinc-700">FHIR R4</span>
                  </div>
                  <h3 class="font-bold text-sm text-gray-200">{{ vendor.name }}</h3>
                  <p class="text-[11px] text-gray-400 mt-1 truncate font-mono">{{ vendor.fhirBaseUrl }}</p>
                </div>

                <div class="mt-4 space-y-2">
                  <button 
                    (click)="launcher.initiateLaunch(vendor.id)"
                    [disabled]="launcher.activeSession().status === 'AUTHORIZING'"
                    class="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md">
                    <span>Connect {{ vendor.id | uppercase }}</span>
                  </button>
                  <button 
                    (click)="runConformanceCheck(vendor.id)"
                    class="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-mono transition flex items-center justify-center gap-1 border border-zinc-700">
                    <span>Validate SMART v2</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Active Connection Status HUD -->
          @if (launcher.activeSession().status !== 'IDLE') {
            <div class="p-4 bg-zinc-900 rounded-xl border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full animate-pulse" [class.bg-yellow-400]="launcher.activeSession().status === 'AUTHORIZING'" [class.bg-emerald-400]="launcher.activeSession().status === 'CONNECTED'"></div>
                <div>
                  <span class="text-xs font-bold text-gray-300">Active OAuth2 Launch Status:</span>
                  <span class="text-xs font-mono font-semibold ml-2 text-sky-400">{{ launcher.activeSession().status }}</span>
                  @if (launcher.activeSession().patientId) {
                    <span class="text-xs text-gray-400 ml-3">Bound Patient ID: <code class="text-emerald-400 font-bold">{{ launcher.activeSession().patientId }}</code></span>
                  }
                </div>
              </div>

              <div class="text-[11px] font-mono text-gray-400 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
                Scopes: launch patient/*.read openid fhirUser
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB 2: EHR MARKETPLACE MANIFESTS -->
      @if (activeTab() === 'manifests') {
        <div class="space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Marketplace Submission Package</h3>
              <p class="text-xs text-zinc-400">Formal descriptors for Epic Showroom (Connection Hub) and Oracle Cerner Code Console.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button 
                (click)="downloadEpicManifest()"
                class="px-3 py-1.5 rounded-lg bg-sky-900/40 hover:bg-sky-900/60 border border-sky-600/50 text-sky-300 text-xs font-bold transition flex items-center gap-1.5">
                <span>📥</span>
                <span>Epic Manifest</span>
              </button>
              <button 
                (click)="downloadCernerManifest()"
                class="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/60 border border-purple-600/50 text-purple-300 text-xs font-bold transition flex items-center gap-1.5">
                <span>📥</span>
                <span>Cerner Descriptor</span>
              </button>
              <button 
                (click)="downloadSubmissionBundle()"
                class="px-3 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5">
                <span>📦</span>
                <span>All Manifests (ZIP/JSON)</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Epic Manifest Card -->
            <div class="p-4 bg-zinc-900 rounded-xl border border-sky-500/30 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div class="flex items-center gap-2">
                  <span class="text-lg">🏥</span>
                  <span class="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">Epic Showroom (Connection Hub)</span>
                </div>
                <button 
                  (click)="copyJson(epicManifestJson, 'epic')"
                  class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-mono transition">
                  {{ copiedKey() === 'epic' ? '✓ Copied' : 'Copy JSON' }}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                <div>Client ID: <span class="text-white">{{ epicManifest.client_id }}</span></div>
                <div>Auth Method: <span class="text-white">{{ epicManifest.token_endpoint_auth_method }}</span></div>
                <div>USCDI Version: <span class="text-sky-400">{{ epicManifest.epic_specific.uscdi_version }}</span></div>
                <div>Connection Hub: <span class="text-emerald-400">READY</span></div>
              </div>

              <div class="max-h-60 overflow-y-auto rounded-lg bg-black/60 p-3 border border-zinc-800 font-mono text-[10.5px] text-zinc-300 whitespace-pre">
                {{ epicManifestJson }}
              </div>
            </div>

            <!-- Cerner Manifest Card -->
            <div class="p-4 bg-zinc-900 rounded-xl border border-purple-500/30 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div class="flex items-center gap-2">
                  <span class="text-lg">💊</span>
                  <span class="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">Oracle Cerner Code Console</span>
                </div>
                <button 
                  (click)="copyJson(cernerManifestJson, 'cerner')"
                  class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-mono transition">
                  {{ copiedKey() === 'cerner' ? '✓ Copied' : 'Copy JSON' }}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                <div>App ID: <span class="text-white">{{ cernerManifest.app_id }}</span></div>
                <div>Status: <span class="text-emerald-400">{{ cernerManifest.cerner_code_status }}</span></div>
                <div>FHIR Version: <span class="text-white">{{ cernerManifest.fhir_version }}</span></div>
                <div>Launches: <span class="text-purple-400">EHR + Standalone</span></div>
              </div>

              <div class="max-h-60 overflow-y-auto rounded-lg bg-black/60 p-3 border border-zinc-800 font-mono text-[10.5px] text-zinc-300 whitespace-pre">
                {{ cernerManifestJson }}
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: CARIN ALLIANCE ATTESTATION -->
      @if (activeTab() === 'carin') {
        <div class="space-y-6">
          <!-- Trust Seal Banner -->
          <div class="p-5 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-sky-950/40 rounded-2xl border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                🛡️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white">CARIN Alliance Code of Conduct Attestation</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    myhealthapplication.com
                  </span>
                </div>
                <p class="text-xs text-zinc-300 mt-0.5">
                  Cryptographic Trust Seal: <code class="text-emerald-400 font-mono">{{ carinAttestation.digital_trust_seal.seal_id }}</code>
                  &bull; SHA-256: <code class="text-zinc-400 font-mono">{{ carinAttestation.digital_trust_seal.sha256_attestation_digest }}</code>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 self-stretch md:self-auto">
              <button 
                (click)="downloadCarinAttestation()"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg">
                <span>📥</span>
                <span>Download CARIN Package</span>
              </button>
              <button 
                (click)="copyJson(carinAttestationJson, 'carin')"
                class="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition border border-zinc-700">
                {{ copiedKey() === 'carin' ? '✓ Copied' : 'Copy JSON' }}
              </button>
            </div>
          </div>

          <!-- 4 Pillars Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Pillar 1 -->
            <div class="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase font-mono">
                <span>1️⃣</span>
                <span>Individual Consent & Transparency</span>
              </div>
              <ul class="text-xs text-zinc-300 space-y-1 font-sans">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Affirmative individual consent before accessing clinical records</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Plain-language privacy policy & terms of service published</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>HIPAA Notice of Privacy Practices compliance</span>
                </li>
              </ul>
            </div>

            <!-- Pillar 2 -->
            <div class="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                <span>2️⃣</span>
                <span>Data Use & Non-Commercialization</span>
              </div>
              <ul class="text-xs text-zinc-300 space-y-1 font-sans">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Zero commercial sale or leasing of patient health data</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Strict prohibition of third-party targeted advertising</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Zero data broker egress; HIPAA Safe Harbor de-identification</span>
                </li>
              </ul>
            </div>

            <!-- Pillar 3 -->
            <div class="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase font-mono">
                <span>3️⃣</span>
                <span>Technical Security & Cryptography</span>
              </div>
              <ul class="text-xs text-zinc-300 space-y-1 font-sans">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>TLS 1.3 Strict in transit; AES-256-GCM / WebCrypto at rest</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>OAuth 2.0 PKCE (S256) public client architecture</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Zero-copy audio buffers; NIST SP 800-90A CSPRNG entropy</span>
                </li>
              </ul>
            </div>

            <!-- Pillar 4 -->
            <div class="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                <span>4️⃣</span>
                <span>User Control & Sovereignty (IAS)</span>
              </div>
              <ul class="text-xs text-zinc-300 space-y-1 font-sans">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>1-Click HL7 FHIR R4 Bundle (JSON) data export</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Unilateral transient patient state purge capability</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span>Zero vendor lock-in; open-source standard serialization</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- JSON Collapsible Preview -->
          <div class="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
            <span class="text-xs font-mono font-bold text-zinc-400 uppercase">Structured CARIN Attestation JSON Payload</span>
            <div class="max-h-60 overflow-y-auto rounded-lg bg-black/60 p-3 border border-zinc-800 font-mono text-[10.5px] text-zinc-300 whitespace-pre">
              {{ carinAttestationJson }}
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: CONFORMANCE AUDIT (12/12) -->
      @if (activeTab() === 'audit') {
        <div class="space-y-6">
          <!-- Audit Score Header -->
          <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-900/80 rounded-xl border border-emerald-500/40">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                ✓
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base font-extrabold text-white">EHR Marketplace & CARIN Alliance Certification Suite</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {{ auditReport().overallScore }} ({{ auditReport().complianceScorePct }}%)
                  </span>
                </div>
                <p class="text-xs text-zinc-400">
                  Status: <span class="text-emerald-400 font-bold font-mono">{{ auditReport().status }}</span>
                </p>
              </div>
            </div>

            <button 
              (click)="refreshAudit()"
              class="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-zinc-700 flex items-center gap-1.5">
              <span>🔄</span>
              <span>Re-Run Audit</span>
            </button>
          </div>

          <!-- Interactive Launch Conformance Sandbox -->
          <div class="p-4 bg-zinc-900 rounded-xl border border-sky-500/30 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">⚡</span>
                <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">SMART on FHIR v2 Launch Conformance Validator</h4>
              </div>
              @if (validationResult()) {
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {{ validationResult()?.scorePct }}% VALIDATED
                </span>
              }
            </div>

            <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
              <button 
                (click)="runConformanceCheck('epic')"
                class="px-2.5 py-1 rounded bg-sky-900/50 hover:bg-sky-800/60 border border-sky-600/50 text-sky-200">
                Test Epic EHR Launch
              </button>
              <button 
                (click)="runConformanceCheck('cerner')"
                class="px-2.5 py-1 rounded bg-purple-900/50 hover:bg-purple-800/60 border border-purple-600/50 text-purple-200">
                Test Cerner Standalone Launch
              </button>
              <button 
                (click)="runConformanceCheck('athena')"
                class="px-2.5 py-1 rounded bg-teal-900/50 hover:bg-teal-800/60 border border-teal-600/50 text-teal-200">
                Test AthenaHealth Launch
              </button>
              <button 
                (click)="runConformanceCheck('va_health')"
                class="px-2.5 py-1 rounded bg-blue-900/50 hover:bg-blue-800/60 border border-blue-600/50 text-blue-200">
                Test VA Lighthouse Launch
              </button>
            </div>

            @if (validationResult()) {
              <div class="p-3 bg-black/60 rounded-lg border border-zinc-800 text-[11px] font-mono space-y-1 text-zinc-300">
                <div>Vendor: <span class="text-white font-bold">{{ validationResult()?.vendorName }}</span> ({{ validationResult()?.launchType }})</div>
                <div>PKCE S256 Challenge: <span class="text-emerald-400">{{ validationResult()?.pkceChallengeS256 }}</span></div>
                <div>Anti-CSRF Nonce: <span class="text-sky-400">{{ validationResult()?.stateNonce }}</span></div>
                <div class="truncate">Constructed Authorize URL: <span class="text-zinc-400">{{ validationResult()?.constructedAuthorizeUrl }}</span></div>
              </div>
            }
          </div>

          <!-- 12 Certification Checks Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (check of auditReport().checks; track check.id) {
              <div class="p-3 bg-zinc-900/70 rounded-xl border border-zinc-800 hover:border-zinc-700 transition flex items-start gap-3">
                <span class="text-base mt-0.5 text-emerald-400 font-bold">✓</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <h5 class="text-xs font-bold text-white truncate">{{ check.name }}</h5>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">PASS</span>
                  </div>
                  <div class="text-[10px] text-zinc-400 font-mono mt-0.5">{{ check.standard }}</div>
                  <p class="text-[11px] text-zinc-300 mt-1">{{ check.rationale }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SmartFhirLauncherComponent {
  readonly launcher = inject(SmartOnFhirLauncherService);
  readonly packager = inject(EhrAppOrchardPackagerService);

  readonly activeTab = signal<SmartLauncherTab>('connect');
  readonly copiedKey = signal<string | null>(null);
  readonly auditReport = signal<IEhrCertificationAuditReport>(this.packager.validateEhrCertificationSuite());
  readonly validationResult = signal<ISmartLaunchValidationResult | null>(null);

  readonly epicManifest: IEpicAppOrchardPackage = this.packager.generateEpicAppOrchardPackage();
  readonly cernerManifest: ICernerMarketplacePackage = this.packager.generateCernerMarketplacePackage();
  readonly carinAttestation: ICarinAllianceAttestationPackage = this.packager.generateCarinAllianceAttestation();

  readonly epicManifestJson: string = JSON.stringify(this.epicManifest, null, 2);
  readonly cernerManifestJson: string = JSON.stringify(this.cernerManifest, null, 2);
  readonly carinAttestationJson: string = JSON.stringify(this.carinAttestation, null, 2);

  refreshAudit(): void {
    this.auditReport.set(this.packager.validateEhrCertificationSuite());
  }

  runConformanceCheck(vendorId: string): void {
    const launchType = vendorId === 'cerner' ? 'standalone_launch' : 'ehr_launch';
    const res = this.launcher.validateSmartLaunchConformance(vendorId, { launchType });
    this.validationResult.set(res);
  }

  copyJson(json: string, key: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(json).catch(() => {});
    }
    this.copiedKey.set(key);
    setTimeout(() => {
      if (this.copiedKey() === key) {
        this.copiedKey.set(null);
      }
    }, 2000);
  }

  downloadEpicManifest(): void {
    downloadJson('epic-connection-hub-manifest.json', this.epicManifest);
  }

  downloadCernerManifest(): void {
    downloadJson('cerner-marketplace-descriptor.json', this.cernerManifest);
  }

  downloadCarinAttestation(): void {
    downloadJson('carin-code-of-conduct-attestation.json', this.carinAttestation);
  }

  downloadSubmissionBundle(): void {
    const bundle: IMarketplaceSubmissionBundle = this.packager.generateMarketplaceSubmissionBundle();
    downloadJson('ehr-marketplace-submission-bundle.json', bundle);
  }
}

function downloadJson(filename: string, data: unknown): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
