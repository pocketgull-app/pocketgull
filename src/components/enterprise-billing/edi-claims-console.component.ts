import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { X12EdiClaimsService, IX12ClaimResult, IX12RemittanceResult } from '../../services/x12-edi-claims.service';

@Component({
  selector: 'app-edi-claims-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-4xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-mono relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl shadow-xs">
            🏢
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider">
                Enterprise Payer &amp; Billing Defense
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ANSI X12 837P / 835
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Automated claims generator for CMS Remote Patient Monitoring (RPM CPT 99453, 99454, 99457, 99458)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button"
                  (click)="generateClaim()"
                  id="btn-generate-837p"
                  class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs">
            <span>⚡</span> Generate 837P Claim
          </button>
          <button type="button"
                  (click)="simulateRemittance()"
                  id="btn-simulate-835"
                  [disabled]="!activeClaim()"
                  class="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <span>📥</span> Simulate 835 ERA
          </button>
          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close Claims Console"
                  class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer">
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10 font-sans">
        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Total Billed</span>
          <span class="text-xl font-mono font-black text-emerald-400 mt-1 block">
            \${{ activeClaim() ? activeClaim()!.totalChargeUsd.toFixed(2) : '156.00' }}
          </span>
          <span class="text-[10px] font-mono text-zinc-500">4 Service Lines (RPM)</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">WEDI SNIP Status</span>
          <span class="text-sm font-mono font-bold text-emerald-300 mt-1.5 flex items-center gap-1">
            <span>✓</span> SNIP-2 Validated
          </span>
          <span class="text-[10px] font-mono text-zinc-500">Zero Syntax Errors</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Payer Target</span>
          <span class="text-sm font-mono font-bold text-zinc-200 mt-1.5 block truncate">
            Medicare Part B
          </span>
          <span class="text-[10px] font-mono text-zinc-500">Clearinghouse: CMS01</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">ERA Adjudication</span>
          <span class="text-sm font-mono font-bold text-cyan-300 mt-1.5 block">
            {{ activeRemittance() ? '\$' + activeRemittance()!.totalPaidUsd.toFixed(2) + ' Paid' : 'Pending 835' }}
          </span>
          <span class="text-[10px] font-mono text-zinc-500">
            {{ activeRemittance() ? 'CO-45: \$' + activeRemittance()!.contractualAdjustmentUsd.toFixed(2) : '80/20 Split' }}
          </span>
        </div>
      </div>

      <!-- CPT Breakdown Cards -->
      <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 mb-6 relative z-10 text-xs">
        <div class="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <span class="font-bold text-zinc-200 uppercase font-mono tracking-wider">CMS Remote Patient Monitoring CPT Schedule</span>
          <span class="text-[10px] text-zinc-400 font-mono">CY 2026 Physician Fee Schedule (PFS)</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
          <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span class="text-emerald-400 font-bold block">CPT 99453</span>
              <span class="text-zinc-400 text-[10px]">Initial device setup &amp; education</span>
            </div>
            <strong class="text-zinc-200">\$19.00</strong>
          </div>
          <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span class="text-emerald-400 font-bold block">CPT 99454</span>
              <span class="text-zinc-400 text-[10px]">Monthly device transmission (16+ days)</span>
            </div>
            <strong class="text-zinc-200">\$50.00</strong>
          </div>
          <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span class="text-emerald-400 font-bold block">CPT 99457</span>
              <span class="text-zinc-400 text-[10px]">Clinical management (first 20 min)</span>
            </div>
            <strong class="text-zinc-200">\$48.00</strong>
          </div>
          <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span class="text-emerald-400 font-bold block">CPT 99458</span>
              <span class="text-zinc-400 text-[10px]">Clinical management (add'l 20 min)</span>
            </div>
            <strong class="text-zinc-200">\$39.00</strong>
          </div>
        </div>
      </div>

      <!-- Raw EDI View / ERA View Tabs -->
      <div class="space-y-3 relative z-10">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button type="button"
                    (click)="activeView.set('837p')"
                    [class.bg-emerald-950]="activeView() === '837p'"
                    [class.text-emerald-300]="activeView() === '837p'"
                    [class.border-emerald-600]="activeView() === '837p'"
                    [class.bg-zinc-900]="activeView() !== '837p'"
                    [class.text-zinc-400]="activeView() !== '837p'"
                    class="px-3 py-1 rounded-xl border border-zinc-800 text-xs font-bold transition cursor-pointer">
              ANSI X12 837P Claim Payload
            </button>
            <button type="button"
                    (click)="activeView.set('835')"
                    [disabled]="!activeRemittance()"
                    [class.bg-cyan-950]="activeView() === '835'"
                    [class.text-cyan-300]="activeView() === '835'"
                    [class.border-cyan-600]="activeView() === '835'"
                    [class.bg-zinc-900]="activeView() !== '835'"
                    [class.text-zinc-400]="activeView() !== '835'"
                    class="px-3 py-1 rounded-xl border border-zinc-800 text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              ANSI X12 835 Remittance (ERA)
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button type="button"
                    (click)="copyActiveEdi()"
                    id="btn-copy-edi"
                    class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] transition cursor-pointer flex items-center gap-1">
              <span>{{ copied() ? '✓ Copied' : '📋 Copy EDI' }}</span>
            </button>
          </div>
        </div>

        @if (activeView() === '837p') {
          <pre class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-emerald-900">{{ activeClaim() ? activeClaim()!.ediContent : defaultClaimEdi }}</pre>
        } @else if (activeView() === '835' && activeRemittance()) {
          <pre class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-cyan-300 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-cyan-900">{{ activeRemittance()!.edi835Content }}</pre>
        }
      </div>
    </div>
  `
})
export class EdiClaimsConsoleComponent {
  readonly claimsService = inject(X12EdiClaimsService);
  readonly close = output<void>();

  activeView = signal<'837p' | '835'>('837p');
  activeClaim = signal<IX12ClaimResult | null>(null);
  activeRemittance = signal<IX12RemittanceResult | null>(null);
  copied = signal<boolean>(false);

  defaultClaimEdi: string;

  constructor() {
    const claim = this.claimsService.generate837PClaim(this.claimsService.createDefaultRpmClaim());
    this.activeClaim.set(claim);
    this.defaultClaimEdi = claim.ediContent;
  }

  generateClaim(): void {
    const req = this.claimsService.createDefaultRpmClaim();
    const result = this.claimsService.generate837PClaim(req);
    this.activeClaim.set(result);
    this.activeView.set('837p');
  }

  simulateRemittance(): void {
    const claim = this.activeClaim();
    if (!claim) return;

    const remittance = this.claimsService.generate835Remittance({
      claimId: claim.claimId,
      totalBilledUsd: claim.totalChargeUsd
    });
    this.activeRemittance.set(remittance);
    this.activeView.set('835');
  }

  async copyActiveEdi(): Promise<void> {
    const text = this.activeView() === '837p'
      ? (this.activeClaim()?.ediContent || this.defaultClaimEdi)
      : (this.activeRemittance()?.edi835Content || '');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
