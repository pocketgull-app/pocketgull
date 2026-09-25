import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrustedCommonsFederationService, ICommonsFederationNode } from '../../services/trusted-commons-federation.service';

@Component({
  selector: 'app-trusted-commons-federation-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-teal-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-xl">
            🌐
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              Trusted Commons Federation Mesh
              <span class="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-800 dark:text-teal-300 font-mono font-bold">
                Ostrom Principle #8: Polycentricity
              </span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Decentralized peer-to-peer federation linking independent clinics, learning pods, and food forests. Air-gapped cryptographic provenance without cloud dependencies.
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs font-bold">
          <button
            type="button"
            (click)="activeTab.set('peers')"
            [class.bg-white]="activeTab() === 'peers'"
            [class.dark:bg-zinc-700]="activeTab() === 'peers'"
            [class.shadow-sm]="activeTab() === 'peers'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🤝 Peer Nodes ({{ fedService.verifiedPartnersCount() }} Verified)
          </button>
          <button
            type="button"
            (click)="activeTab.set('bundles')"
            [class.bg-white]="activeTab() === 'bundles'"
            [class.dark:bg-zinc-700]="activeTab() === 'bundles'"
            [class.shadow-sm]="activeTab() === 'bundles'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            📦 Air-Gapped Bundles ({{ fedService.totalFederatedKnowledgeAssets() }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('identity')"
            [class.bg-white]="activeTab() === 'identity'"
            [class.dark:bg-zinc-700]="activeTab() === 'identity'"
            [class.shadow-sm]="activeTab() === 'identity'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🔑 Local Cryptographic Node
          </button>
        </div>
      </div>

      <!-- Tab 1: Peer Nodes & Web of Trust -->
      @if (activeTab() === 'peers') {
        <div class="space-y-4">
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-600 dark:text-zinc-400">
              Federated network of sovereign community nodes exchanging clinical protocols and agronomic data.
            </span>
            <span class="font-mono text-[11px] text-teal-700 dark:text-teal-300 font-bold">
              Zero Centralized Master Server
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (peer of fedService.peerNodes(); track peer.did) {
              <div class="p-4 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-2.5 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {{ peer.name }}
                      </h4>
                      <div class="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                        {{ peer.locationDescriptor }}
                      </div>
                    </div>
                    <span
                      class="px-2 py-0.5 rounded font-mono text-[9px] font-bold"
                      [class.bg-emerald-500/20]="peer.trustStatus === 'VERIFIED_MUTUAL_PARTNER'"
                      [class.text-emerald-800]="peer.trustStatus === 'VERIFIED_MUTUAL_PARTNER'"
                      [class.dark:text-emerald-300]="peer.trustStatus === 'VERIFIED_MUTUAL_PARTNER'"
                      [class.bg-blue-500/20]="peer.trustStatus === 'OBSERVER_AFFILIATE'"
                      [class.text-blue-800]="peer.trustStatus === 'OBSERVER_AFFILIATE'"
                      [class.dark:text-blue-300]="peer.trustStatus === 'OBSERVER_AFFILIATE'"
                      [class.bg-amber-500/20]="peer.trustStatus === 'PENDING_ATTESTATION'"
                      [class.text-amber-800]="peer.trustStatus === 'PENDING_ATTESTATION'"
                      [class.dark:text-amber-300]="peer.trustStatus === 'PENDING_ATTESTATION'"
                      [class.bg-red-500/20]="peer.trustStatus === 'REVOKED_SANCTIONED'"
                      [class.text-red-800]="peer.trustStatus === 'REVOKED_SANCTIONED'"
                      [class.dark:text-red-300]="peer.trustStatus === 'REVOKED_SANCTIONED'"
                    >
                      {{ peer.trustStatus }}
                    </span>
                  </div>

                  <p class="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {{ peer.activeCovenantSummary }}
                  </p>

                  <div class="mt-2 flex flex-wrap gap-1.5">
                    @for (domain of peer.sharedResourceDomains; track domain) {
                      <span class="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-[9px] font-mono">
                        {{ domain }}
                      </span>
                    }
                  </div>
                </div>

                <div class="pt-2 border-t border-gray-200 dark:border-zinc-700/60 flex items-center justify-between">
                  <span class="text-[9px] font-mono text-gray-400 truncate max-w-[150px]">
                    {{ peer.publicVerificationKey }}
                  </span>
                  <button
                    type="button"
                    (click)="downloadTreaty(peer.did)"
                    class="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold transition-all shadow-sm"
                  >
                    📜 Export Covenant
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 2: Air-Gapped Bundles & Optical Sync -->
      @if (activeTab() === 'bundles') {
        <div class="space-y-4">
          <div class="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex justify-between items-center text-xs">
            <div>
              <div class="font-bold text-indigo-900 dark:text-indigo-300">
                Air-Gapped Cryptographic Provenance
              </div>
              <div class="text-[11px] text-gray-600 dark:text-zinc-400">
                All bundles are signed with Ed25519 signatures. Can be exported as high-density QR codes or JSON for USB sneakernet transfer.
              </div>
            </div>
            <button
              type="button"
              (click)="exportSampleProtocol()"
              class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              📤 Sign & Export Protocol
            </button>
          </div>

          <div class="space-y-3">
            @for (bundle of fedService.incomingBundles(); track bundle.bundleId) {
              <div class="p-3.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-1.5 text-xs">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ bundle.title }}</span>
                    <div class="text-[10px] text-gray-500 dark:text-zinc-400">
                      Origin: <strong class="text-teal-700 dark:text-teal-400">{{ bundle.originNodeName }}</strong> • {{ bundle.bundleType }}
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-bold">
                    ✓ {{ bundle.verificationStatus }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed">
                  {{ bundle.payloadSummary }}
                </p>
                <div class="text-[9px] font-mono text-gray-400 pt-1 border-t border-gray-200 dark:border-zinc-700/60">
                  Signature: {{ bundle.cryptographicSignature }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Local Cryptographic Node Identity -->
      @if (activeTab() === 'identity') {
        <div class="p-4 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-3 text-xs">
          <div>
            <div class="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {{ fedService.localNodeName() }}
            </div>
            <div class="text-[11px] text-gray-500 dark:text-zinc-400">
              {{ fedService.localNodeCategory() }} • {{ fedService.localNodeLocation() }}
            </div>
          </div>

          <div class="space-y-1 font-mono text-[11px]">
            <div class="text-gray-500 dark:text-zinc-400">Decentralized Identifier (DID):</div>
            <div class="p-2 bg-white dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-700 text-teal-700 dark:text-teal-400 select-all">
              {{ fedService.localDid() }}
            </div>
          </div>

          <div class="space-y-1 font-mono text-[11px]">
            <div class="text-gray-500 dark:text-zinc-400">Public Verification Key:</div>
            <div class="p-2 bg-white dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 select-all truncate">
              {{ fedService.localPublicKey() }}
            </div>
          </div>

          <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300">
            🔒 <strong>Zero Telemetry Invariant:</strong> This node keypair is stored in local client-side memory. Zero private keys are ever transmitted to any cloud server.
          </div>
        </div>
      }
    </div>
  `
})
export class TrustedCommonsFederationCardComponent {
  readonly fedService = inject(TrustedCommonsFederationService);
  readonly activeTab = signal<'peers' | 'bundles' | 'identity'>('peers');

  downloadTreaty(peerDid: string): void {
    const treaty = this.fedService.generateFederationCovenant(peerDid);
    const blob = new Blob([treaty], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Federation_Covenant_${peerDid.replace(/[:\/]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportSampleProtocol(): void {
    const sample = this.fedService.exportSignedResourceBundle(
      'FHIR_CLINICAL_PROTOCOL',
      'Cascadia Acute Dehydration & Electrolyte Repletion Protocol',
      {
        indication: 'Pediatric/Adult Dehydration',
        osmolarityTarget: '245 mOsm/L (WHO Standard)',
        composition: 'Sodium chloride 2.6g/L, Glucose anhydrous 13.5g/L, Potassium chloride 1.5g/L, Trisodium citrate 2.9g/L'
      }
    );
    const blob = new Blob([sample], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Signed_Resource_Bundle_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
