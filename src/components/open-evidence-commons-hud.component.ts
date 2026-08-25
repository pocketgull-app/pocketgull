import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpenEvidenceCommonsService, IEvidenceNode, IMerkleProof, IAttestationReceipt } from '../services/open-evidence-commons.service';

@Component({
  selector: 'app-open-evidence-commons-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100 font-pocketgull-sans-clinical">Open Evidence Commons & Cryptographic Attestation</h2>
              <span class="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-mono font-medium text-purple-300 border border-purple-500/40">
                SHA-256 Merkle Provenance
              </span>
            </div>
            <p class="text-xs text-zinc-400">Decentralized peer-reviewed clinical knowledge graph • Quadratic voting consensus (>66.7% supermajority)</p>
          </div>
        </div>

        <!-- Issue Attestation Receipt Button -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="generateReceipt()"
            [disabled]="isAttesting()"
            class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-purple-900/30 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 touch-manipulation"
          >
            @if (isAttesting()) {
              <svg class="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Attesting Root...</span>
            } @else {
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Issue Block Attestation</span>
            }
          </button>
        </div>
      </div>

      <!-- Merkle Root & Governance Metrics -->
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <!-- Merkle Root Badge -->
        <div class="col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-zinc-400">Current Cryptographic Merkle Root</span>
            <span class="text-[10px] text-purple-400 font-mono">Block #{{ commonsService.latestReceipt()?.blockHeight || 28491 }}</span>
          </div>
          <code class="mt-1 block truncate rounded bg-zinc-950 p-1.5 text-[11px] font-mono text-purple-300 border border-zinc-800/80 select-all">
            {{ commonsService.merkleRoot() }}
          </code>
        </div>

        <!-- Supermajority Passed -->
        <div class="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <span class="text-[11px] font-medium text-zinc-400">Consensus Supermajority</span>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="text-xl font-bold tabular-nums text-emerald-400 font-mono">
              {{ commonsService.supermajorityPassedCount() }} / {{ commonsService.totalEvidenceCount() }}
            </span>
            <span class="text-[11px] text-zinc-500">Passed</span>
          </div>
        </div>

        <!-- Total Quadratic Stake -->
        <div class="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <span class="text-[11px] font-medium text-zinc-400">Quadratic Stake Weight</span>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="text-xl font-bold tabular-nums text-amber-400 font-mono">
              {{ commonsService.totalQuadraticStake() | number:'1.0-0' }}
            </span>
            <span class="text-[11px] text-zinc-500">Credits</span>
          </div>
        </div>
      </div>

      <!-- Evidence Ledger Table -->
      <div class="mt-5 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/20">
        <div class="border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5 flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-pocketgull-sans-clinical">
            Peer-Reviewed Clinical Evidence Nodes
          </h3>
          <span class="text-xs text-zinc-500 font-mono">5 Landmark RCTs & Cohorts</span>
        </div>

        <div class="divide-y divide-zinc-800/60">
          @for (node of commonsService.evidenceNodes(); track node.id) {
            <div class="p-4 transition-colors hover:bg-zinc-900/40">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-200 font-mono">
                      {{ node.conditionCode }}
                    </span>
                    <h4 class="text-sm font-medium text-zinc-100">{{ node.title }}</h4>
                  </div>
                  <p class="text-xs text-zinc-400">
                    <strong class="text-zinc-300">Reference:</strong> {{ node.trialReference }} • 
                    <strong class="text-zinc-300">N:</strong> {{ node.sampleSize | number }} • 
                    <strong class="text-zinc-300">p:</strong> <span class="font-mono text-emerald-400">{{ node.pValue }}</span> • 
                    <strong class="text-zinc-300">Cochrane RoB:</strong> 
                    <span [class.text-emerald-400]="node.cochraneRiskOfBias === 'Low Risk'"
                          [class.text-amber-400]="node.cochraneRiskOfBias === 'Some Concerns'">
                      {{ node.cochraneRiskOfBias }}
                    </span>
                  </p>
                  <p class="text-[11px] text-zinc-500 font-mono">
                    Node Hash: <span class="text-purple-300/80">{{ node.sha256Hash.slice(0, 24) }}...</span>
                  </p>
                </div>

                <!-- Consensus & Actions -->
                <div class="flex shrink-0 flex-wrap items-center gap-3">
                  <div class="text-right">
                    <div class="flex items-center gap-1.5 justify-end">
                      <span class="text-xs font-mono font-bold"
                            [class.text-emerald-400]="node.consensusScore >= 66.7"
                            [class.text-amber-400]="node.consensusScore < 66.7">
                        {{ node.consensusScore }}%
                      </span>
                      <span class="text-[10px] text-zinc-500 font-mono">({{ node.affirmativeVotes }}/{{ node.totalVotes }})</span>
                    </div>
                    <span class="text-[10px] text-zinc-500 font-mono">Stake: {{ node.quadraticStakeScore }}</span>
                  </div>

                  <!-- Proof Inspector Button -->
                  <button
                    type="button"
                    (click)="inspectProof(node.id)"
                    class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 touch-manipulation"
                  >
                    Merkle Proof
                  </button>

                  <!-- Vote Button -->
                  <button
                    type="button"
                    (click)="voteAffirmative(node.id)"
                    class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 touch-manipulation"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    +25 Quad Vote
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Merkle Proof Modal / Inspection Panel -->
      @if (activeProof(); as proof) {
        <div class="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 transition-all">
          <div class="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div class="flex items-center gap-2">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">✓</span>
              <h4 class="text-xs font-semibold text-purple-200">Cryptographic Merkle Inclusion Proof (Verified)</h4>
            </div>
            <button
              type="button"
              (click)="activeProof.set(null)"
              class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div class="mt-3 space-y-2 text-xs">
            <div>
              <span class="text-zinc-400">Leaf Node ID:</span>
              <code class="ml-2 font-mono text-purple-300">{{ proof.leafId }}</code>
            </div>
            <div>
              <span class="text-zinc-400">Leaf SHA-256:</span>
              <code class="ml-2 font-mono text-zinc-300 select-all">{{ proof.leafHash }}</code>
            </div>
            <div>
              <span class="text-zinc-400">Sibling Path Proof Length:</span>
              <span class="ml-2 font-mono text-emerald-400">{{ proof.siblings.length }} Levels Verified</span>
            </div>
            <div>
              <span class="text-zinc-400">Evaluated Root:</span>
              <code class="ml-2 font-mono text-purple-300 select-all">{{ proof.rootHash }}</code>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OpenEvidenceCommonsHudComponent {
  readonly commonsService = inject(OpenEvidenceCommonsService);
  readonly isAttesting = signal(false);
  readonly activeProof = signal<IMerkleProof | null>(null);

  async generateReceipt(): Promise<void> {
    this.isAttesting.set(true);
    try {
      await this.commonsService.generateAttestationReceipt();
    } finally {
      this.isAttesting.set(false);
    }
  }

  async inspectProof(nodeId: string): Promise<void> {
    const proof = await this.commonsService.generateMerkleProof(nodeId);
    this.activeProof.set(proof);
  }

  async voteAffirmative(nodeId: string): Promise<void> {
    await this.commonsService.castConsensusVote(nodeId, 'clinician-active-peer', true, 25);
  }
}
