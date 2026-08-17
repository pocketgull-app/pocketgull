import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyperscalerDeploymentService, HyperscalerVendor } from '../services/hyperscaler-deployment.service';

@Component({
  selector: 'app-hyperscaler-marketplace-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 rounded-2xl border border-sky-900/40 text-gray-100 shadow-2xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">☁️</span>
            <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
              Enterprise Hyperscaler Cloud Marketplace Suite
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Multi-Cloud Orchestrator
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            1-Click Helm & Terraform Deployments for GCP, AWS, Azure & Oracle Cloud Infrastructure.
          </p>
        </div>
      </div>

      <!-- Cloud Provider Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto mb-6 pb-2 border-b border-zinc-800/80">
        @for (provider of providers; track provider) {
          <button 
            (click)="hyperscaler.setActiveProvider(provider)"
            [class.bg-sky-600]="hyperscaler.activeProvider() === provider"
            [class.text-white]="hyperscaler.activeProvider() === provider"
            [class.bg-zinc-900]="hyperscaler.activeProvider() !== provider"
            [class.text-gray-400]="hyperscaler.activeProvider() !== provider"
            class="px-4 py-2 rounded-xl text-xs font-semibold transition border border-zinc-800 hover:border-sky-500/50 whitespace-nowrap">
            {{ provider }}
          </button>
        }
      </div>

      <!-- Provider Overview Card -->
      @let cfg = hyperscaler.selectedConfig();
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-sky-400 font-bold mb-1">Target Cluster Architecture</div>
          <div class="text-sm font-semibold text-gray-200">{{ cfg.clusterType }}</div>
          <div class="text-[10px] text-gray-500 mt-1">Region: {{ cfg.region }}</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-teal-400 font-bold mb-1">Native AI Acceleration Engine</div>
          <div class="text-sm font-semibold text-teal-300">{{ cfg.aiEngine }}</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-emerald-400 font-bold mb-1">Scale-to-Zero Cloud Cost Strategy</div>
          <div class="text-sm font-semibold text-emerald-400 font-mono">Min: {{ cfg.autoScalingMinNodes }} &bull; Max: {{ cfg.autoScalingMaxNodes }} Nodes</div>
          <div class="text-[10px] text-gray-400 mt-1">Est: \${{ cfg.monthlyEstCostUsd.toFixed(2) }}/mo when idle</div>
        </div>
      </div>

      <!-- Compliance & FHIR Integration -->
      <div class="p-4 bg-sky-950/20 rounded-xl border border-sky-800/40 mb-6">
        <div class="text-xs font-bold text-sky-300 mb-2">Native Cloud FHIR Store & Compliance Badges:</div>
        <div class="text-xs font-mono text-gray-300 break-all bg-black/50 p-2.5 rounded border border-zinc-800 mb-3">
          {{ cfg.fhirEndpoint }}
        </div>
        <div class="flex flex-wrap gap-2">
          @for (cert of cfg.complianceCertifications; track cert) {
            <span class="px-2.5 py-1 bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold rounded-lg">
              🛡️ {{ cert }}
            </span>
          }
        </div>
      </div>

      <!-- Generated Helm Manifest Preview -->
      <div class="p-4 bg-black/80 rounded-xl border border-zinc-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-gray-400 font-mono">1-Click Helm Chart values.yaml</span>
          <span class="text-[10px] text-sky-400 font-mono">Ready for kubectl / helm install</span>
        </div>
        <pre class="text-[11px] font-mono text-sky-300 overflow-x-auto p-3 bg-zinc-900 rounded border border-zinc-800/80 leading-relaxed">{{ hyperscaler.generateHelmChartYaml() }}</pre>
      </div>
    </div>
  `
})
export class HyperscalerMarketplacePortalComponent {
  readonly hyperscaler = inject(HyperscalerDeploymentService);

  readonly providers: HyperscalerVendor[] = [
    'Google Cloud Platform (GCP)',
    'Amazon Web Services (AWS)',
    'Microsoft Azure',
    'Oracle Cloud Infrastructure (OCI)'
  ];
}
