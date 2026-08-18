import { Component, signal, computed, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

/** Usage snapshot from /api/keys/usage */
interface IUsageResponse {
  tenantId: string;
  tier: string;
  tierLabel: string;
  priceMonthlyUsd: number;
  currentMonth: string;
  usage: Record<string, number>;
  quotas: Record<string, number>;
  remaining: Record<string, number | string>;
  upgradeUrl: string | null;
}

@Component({
  selector: 'app-api-pricing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div class="relative w-full max-w-5xl p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 transition-all max-h-[95vh] overflow-y-auto">
        <!-- Close Button -->
        <button id="api-pricing-close" (click)="close.emit()" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Agentic API Pricing</h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-xl mx-auto">
            Autonomous agent access to clinical discovery, entity resolution, capability probing, and pipeline execution.
          </p>
          @if (currentTier() !== 'none') {
            <div class="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
              {{ currentTier() === 'institution' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700' :
                 currentTier() === 'practitioner' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700' :
                 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700' }}">
              Current: {{ currentTierLabel() }}
            </div>
          }
        </div>

        <!-- Tier Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <!-- Explorer (Free) -->
          <div class="relative p-6 rounded-xl border-2 transition-all
            {{ currentTier() === 'explorer' ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:border-gray-300 dark:hover:border-zinc-600' }}">
            @if (currentTier() === 'explorer') {
              <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[11px] font-bold rounded-full shadow-sm">Current Plan</span>
            }
            <div class="mb-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Explorer</h3>
              <div class="flex items-baseline gap-1 mt-1">
                <span class="text-3xl font-extrabold text-gray-900 dark:text-gray-100">$0</span>
                <span class="text-sm text-gray-500">/month</span>
              </div>
            </div>
            <ul class="space-y-2.5 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Full tool catalog browsing
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Taxonomy &amp; schema discovery
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                50 entity resolutions/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                25 capability probes/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span class="text-gray-400 dark:text-zinc-500">Tool execution</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span class="text-gray-400 dark:text-zinc-500">Pipeline DAGs</span>
              </li>
            </ul>
            <button disabled class="w-full py-2.5 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-default">
              Free Forever
            </button>
          </div>

          <!-- Practitioner -->
          <div class="relative p-6 rounded-xl border-2 transition-all
            {{ currentTier() === 'practitioner' ? 'border-sky-400 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/20' : 'border-sky-200 dark:border-sky-800/60 bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/30 dark:to-zinc-900 hover:border-sky-300 dark:hover:border-sky-600 shadow-lg shadow-sky-100 dark:shadow-sky-900/20' }}">
            @if (currentTier() === 'practitioner') {
              <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-sky-500 text-white text-[11px] font-bold rounded-full shadow-sm">Current Plan</span>
            } @else if (currentTier() !== 'institution') {
              <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-sky-500 text-white text-[11px] font-bold rounded-full shadow-sm animate-pulse">Most Popular</span>
            }
            <div class="mb-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Practitioner</h3>
              <div class="flex items-baseline gap-1 mt-1">
                <span class="text-3xl font-extrabold text-gray-900 dark:text-gray-100">$49</span>
                <span class="text-sm text-gray-500">/month</span>
              </div>
            </div>
            <ul class="space-y-2.5 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>1,000</strong>&nbsp;entity resolutions/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>500</strong>&nbsp;capability probes/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>5,000</strong>&nbsp;tool executions/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Pipeline DAG inspection
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Email support
              </li>
            </ul>
            <button id="api-pricing-subscribe-practitioner" (click)="subscribe('price_1U4M4fJLexbgGCRFzIHyPrzT', 'Practitioner')" [disabled]="isLoading()"
              class="w-full py-2.5 rounded-lg text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50">
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else if (currentTier() === 'practitioner') {
                Current Plan
              } @else {
                Subscribe — $49/mo
              }
            </button>
          </div>

          <!-- Institution -->
          <div class="relative p-6 rounded-xl border-2 transition-all
            {{ currentTier() === 'institution' ? 'border-violet-400 dark:border-violet-500 bg-violet-50/50 dark:bg-violet-950/20' : 'border-violet-200 dark:border-violet-800/60 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-zinc-900 hover:border-violet-300 dark:hover:border-violet-600' }}">
            @if (currentTier() === 'institution') {
              <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-violet-500 text-white text-[11px] font-bold rounded-full shadow-sm">Current Plan</span>
            }
            <div class="mb-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Institution</h3>
              <div class="flex items-baseline gap-1 mt-1">
                <span class="text-3xl font-extrabold text-gray-900 dark:text-gray-100">$299</span>
                <span class="text-sm text-gray-500">/month</span>
              </div>
            </div>
            <ul class="space-y-2.5 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>25,000</strong>&nbsp;entity resolutions/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>10,000</strong>&nbsp;capability probes/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>100,000</strong>&nbsp;tool executions/mo
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Custom pipelines + DAGs
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Priority support + FHIR sync
              </li>
            </ul>
            <button id="api-pricing-subscribe-institution" (click)="subscribe('price_1U4M5MJLexbgGCRFg5LrWabu', 'Institution')" [disabled]="isLoading()"
              class="w-full py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50">
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else if (currentTier() === 'institution') {
                Current Plan
              } @else {
                Subscribe — $299/mo
              }
            </button>
          </div>
        </div>

        <!-- Live Usage Dashboard -->
        @if (usageData()) {
          <div class="p-5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700 mb-6">
            <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              API Usage — {{ usageData()!.currentMonth }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              @for (cat of usageCategories; track cat.key) {
                <div class="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <div class="text-[11px] font-medium text-gray-500 dark:text-zinc-400 mb-1">{{ cat.label }}</div>
                  <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {{ usageData()!.usage[cat.key] || 0 }}
                  </div>
                  <div class="text-[11px] text-gray-400 dark:text-zinc-500">
                    @if (usageData()!.remaining[cat.key] === 'unlimited') {
                      Unlimited
                    } @else {
                      / {{ usageData()!.quotas[cat.key] }} ({{ usageData()!.remaining[cat.key] }} left)
                    }
                  </div>
                  <!-- Usage bar -->
                  @if (usageData()!.quotas[cat.key] > 0) {
                    <div class="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5 mt-2">
                      <div class="h-1.5 rounded-full transition-all duration-500"
                        [class]="getUsageBarColor(usageData()!.usage[cat.key] || 0, usageData()!.quotas[cat.key])"
                        [style.width.%]="getUsagePercent(usageData()!.usage[cat.key] || 0, usageData()!.quotas[cat.key])">
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Agent Integration Snippet -->
        <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold text-zinc-400">Agent Integration</span>
            <span class="text-[11px] text-zinc-500 font-mono">cURL</span>
          </div>
          <pre class="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre"><code [innerText]="curlSnippet"></code></pre>
        </div>
      </div>
    </div>
  `
})
export class ApiPricingComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private http = inject(HttpClient);

  isLoading = signal(false);
  usageData = signal<IUsageResponse | null>(null);

  currentTier = computed(() => this.usageData()?.tier || 'none');
  currentTierLabel = computed(() => this.usageData()?.tierLabel || 'No plan');

  readonly usageCategories = [
    { key: 'discovery_read', label: 'Discovery Reads' },
    { key: 'discovery_resolve', label: 'Resolutions' },
    { key: 'discovery_probe', label: 'Probes' },
    { key: 'tool_execution', label: 'Tool Calls' },
    { key: 'pipeline_graph', label: 'Pipeline DAGs' }
  ];

  readonly curlSnippet = `curl -X POST https://pocketgull.app/v1/discovery/resolve \\
  -H "X-Gemini-API-Key: sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "BRCA1", "domain": "genomics"}'`;

  ngOnInit(): void {
    this.fetchUsage();
  }

  fetchUsage(): void {
    this.http.get<IUsageResponse>('/api/keys/usage').subscribe({
      next: (data) => this.usageData.set(data),
      error: () => {
        // User may not be authenticated — show pricing without usage
        console.info('[ApiPricing] No usage data available (not authenticated).');
      }
    });
  }

  subscribe(priceId: string, tierName: string): void {
    this.isLoading.set(true);
    this.http.post<{ url?: string; message?: string }>('/api/billing/checkout', {
      priceId,
      customerEmail: 'admin@demo-tenant.com',
      itemType: 'agentic_api_tier',
      packageName: `Pocket Gull ${tierName} API`
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.url && typeof window !== 'undefined') {
          window.location.href = res.url;
        } else {
          // Simulated sandbox upgrade for zero-friction local testing
          this.usageData.update(current => current ? { ...current, tier: tierName.toLowerCase(), tierLabel: tierName } : null);
        }
      },
      error: (err) => {
        console.warn('[ApiPricing] Live Stripe redirect fallback active:', err);
        this.isLoading.set(false);
        // Instant simulated sandbox upgrade for demo/pilot verification
        this.usageData.update(current => current ? { ...current, tier: tierName.toLowerCase(), tierLabel: tierName } : null);
      }
    });
  }

  getUsagePercent(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  getUsageBarColor(used: number, limit: number): string {
    const pct = this.getUsagePercent(used, limit);
    if (pct >= 90) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  }
}
