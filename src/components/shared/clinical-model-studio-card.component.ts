import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalFineTuningOrchestratorService, FineTuningParadigmId } from '../../services/clinical-fine-tuning-orchestrator.service';

@Component({
  selector: 'app-clinical-model-studio-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl">🤖</span>
            <h2 class="text-xl font-bold tracking-tight text-white">Clinical Model Studio & LoRA/DPO Fine-Tuning Hub</h2>
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Gemma 3 & Unsloth QLoRA
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Explore and train specialized clinical model adapters across all 7 paradigms with DPO preference alignment, on-device GGUF quantization, and FHIR interoperability.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="onDownloadDataset()"
            class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span>📥</span>
            <span>Export 7-Paradigm JSONL</span>
          </button>
          @if (downloadSuccess()) {
            <span class="text-xs font-medium text-emerald-400 animate-pulse">✓ Downloaded!</span>
          }
        </div>
      </div>

      <!-- Paradigm Selector Pills -->
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select Fine-Tuning Paradigm ({{ orchestrator.totalParadigms() }})</label>
        <div class="flex flex-wrap gap-2">
          @for (p of orchestrator.paradigms(); track p.id) {
            <button
              type="button"
              (click)="orchestrator.selectParadigm(p.id)"
              [class]="orchestrator.selectedParadigmId() === p.id 
                ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-md border border-purple-400/40 transition-all cursor-pointer' 
                : 'px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer'"
            >
              {{ p.name }}
            </button>
          }
        </div>
      </div>

      <!-- Active Paradigm Overview Card -->
      @let current = orchestrator.activeParadigm();
      <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white">{{ current.name }}</h3>
              <span class="px-2 py-0.5 text-2xs font-semibold rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {{ current.category }}
              </span>
              <span class="px-2 py-0.5 text-2xs font-semibold rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                🌐 {{ current.targetDomain }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">{{ current.description }}</p>
          </div>

          <!-- Specs Badge Matrix -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <div class="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
              <span class="text-zinc-500">Base Model:</span>
              <span class="font-mono text-zinc-200 ml-1 font-semibold">{{ current.recommendedBaseModel }}</span>
            </div>
            <div class="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
              <span class="text-zinc-500">Trainer:</span>
              <span [class]="current.defaultTrainer === 'DPO' ? 'font-mono text-purple-400 font-bold ml-1' : 'font-mono text-cyan-400 font-bold ml-1'">{{ current.defaultTrainer }}</span>
            </div>
            <div class="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
              <span class="text-zinc-500">Quantization:</span>
              <span class="font-mono text-emerald-400 font-semibold ml-1">{{ current.quantizationTarget }}</span>
            </div>
            <div class="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
              <span class="text-zinc-500">Est. VRAM:</span>
              <span class="font-mono text-amber-400 font-semibold ml-1">~{{ current.estimatedVramGb }} GB</span>
            </div>
          </div>
        </div>

        <!-- Clinical Impact Box -->
        <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-start gap-2.5 text-xs text-emerald-300">
          <span class="text-base leading-none">🏥</span>
          <div>
            <strong class="text-emerald-200">Clinical & Operational Impact:</strong>
            <span class="ml-1 text-emerald-300/90">{{ current.clinicalImpact }}</span>
          </div>
        </div>
      </div>

      <!-- Studio Sub-Tabs -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            type="button"
            (click)="activeSubTab.set('dpo')"
            [class]="activeSubTab() === 'dpo' 
              ? 'px-3 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200'"
          >
            ⚖️ DPO Preference Alignment
          </button>
          <button
            type="button"
            (click)="activeSubTab.set('io')"
            [class]="activeSubTab() === 'io' 
              ? 'px-3 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200'"
          >
            📄 Sample Input / Target Output
          </button>
          <button
            type="button"
            (click)="activeSubTab.set('cli')"
            [class]="activeSubTab() === 'cli' 
              ? 'px-3 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200'"
          >
            💻 CLI Training
          </button>
          <button
            type="button"
            (click)="activeSubTab.set('modelGarden')"
            [class]="activeSubTab() === 'modelGarden' 
              ? 'px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200'"
          >
            🌐 Vertex AI Model Garden
          </button>
        </div>

        <!-- Sub-Tab 1: DPO Preference Comparison -->
        @if (activeSubTab() === 'dpo') {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Chosen Response -->
            <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ CHOSEN (Ground Truth / Aligned)
                </span>
                <span class="text-xs text-emerald-400 font-mono">Loss Weight: 1.0</span>
              </div>
              <p class="text-xs text-zinc-200 leading-relaxed font-sans bg-zinc-950/60 p-3 rounded-lg border border-emerald-900/30">
                {{ current.chosenPreference }}
              </p>
              <div class="text-2xs text-emerald-400/80 flex items-center gap-1">
                <span>🛡️</span>
                <span>Enforces strict guideline concordance & Popperian H0 testability.</span>
              </div>
            </div>

            <!-- Rejected Response -->
            <div class="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-2xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ✗ REJECTED (Hallucination / Ungrounded)
                </span>
                <span class="text-xs text-rose-400 font-mono">DPO Penalty Target</span>
              </div>
              <p class="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-950/60 p-3 rounded-lg border border-rose-900/30">
                {{ current.rejectedPreference }}
              </p>
              <div class="text-2xs text-rose-400/80 flex items-center gap-1">
                <span>⚠️</span>
                <span>Flagged for overconfidence, unsupported cure claims, or missing safety bounds.</span>
              </div>
            </div>
          </div>
        }

        <!-- Sub-Tab 2: Input / Target Output -->
        @if (activeSubTab() === 'io') {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-2xs font-semibold uppercase text-zinc-400">Prompt / Patient Context Input</label>
              <pre class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-64 whitespace-pre-wrap">{{ current.sampleInput }}</pre>
            </div>
            <div class="space-y-1.5">
              <label class="text-2xs font-semibold uppercase text-zinc-400">Structured Target Output (SFT Ground Truth)</label>
              <pre class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-64 whitespace-pre-wrap">{{ current.sampleOutput }}</pre>
            </div>
          </div>
        }

        <!-- Sub-Tab 3: CLI Training Command -->
        @if (activeSubTab() === 'cli') {
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-300">Run Fine-Tuning Locally or on GPU Cluster:</span>
              <button
                type="button"
                (click)="onCopyCommand()"
                class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 cursor-pointer"
              >
                {{ copied() ? '✓ Copied' : '📋 Copy Command' }}
              </button>
            </div>
            <pre class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono text-purple-300 overflow-x-auto whitespace-pre-wrap">{{ orchestrator.generateCliCommand(current.id) }}</pre>
            <p class="text-2xs text-zinc-500">
              💡 Supports automatic Unsloth 4-bit acceleration on CUDA GPUs and universal fallback to standard Hugging Face PEFT + TRL.
            </p>
          </div>
        }

        <!-- Sub-Tab 4: Vertex AI Model Garden & Endpoint Serving -->
        @if (activeSubTab() === 'modelGarden') {
          <div class="space-y-4">
            
            <!-- Model Garden Info & Publisher Badge -->
            <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-emerald-300">🌐 Google Cloud Vertex AI Model Garden & Model Registry</span>
                  <span class="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Publisher: PocketGull / GEARARTS</span>
                </div>
                <p class="text-zinc-400 text-2xs">
                  GCP Project: <code class="text-emerald-400">gen-lang-client-0540208645</code> &bull; Region: <code class="text-emerald-400">us-central1</code> &bull; Min Scale: <code class="text-emerald-400">0 (Scale to Zero)</code>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="onCopyModelGardenUpload()"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-2xs cursor-pointer shadow-xs transition"
                >
                  {{ copiedGarden() ? '✓ Copied Upload' : '📋 Copy gcloud Model Upload' }}
                </button>
              </div>
            </div>

            <!-- Two Column Grid for Commands & Model Card -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Left: Model Upload & Deploy Snippets -->
              <div class="space-y-3">
                <div class="space-y-1.5">
                  <label class="text-2xs font-semibold uppercase text-zinc-400">1. Upload to Vertex AI Model Registry</label>
                  <pre class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-2xs font-mono text-emerald-300 overflow-x-auto max-h-36 whitespace-pre-wrap">{{ orchestrator.generateVertexModelGardenUploadCommand(current.id) }}</pre>
                </div>
                <div class="space-y-1.5">
                  <label class="text-2xs font-semibold uppercase text-zinc-400">2. Deploy to Vertex Endpoint (Scale-to-Zero)</label>
                  <pre class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-2xs font-mono text-cyan-300 overflow-x-auto max-h-36 whitespace-pre-wrap">{{ orchestrator.generateVertexEndpointDeployCommand(current.id) }}</pre>
                </div>
              </div>

              <!-- Right: Model Card YAML Preview -->
              <div class="space-y-1.5">
                <label class="text-2xs font-semibold uppercase text-zinc-400">Vertex AI Model Card &amp; Open Science Metadata</label>
                <pre class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-2xs font-mono text-amber-300 overflow-x-auto max-h-80 whitespace-pre-wrap">{{ orchestrator.generateVertexModelCardYaml(current.id) }}</pre>
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class ClinicalModelStudioCardComponent {
  readonly orchestrator = inject(ClinicalFineTuningOrchestratorService);

  readonly activeSubTab = signal<'dpo' | 'io' | 'cli' | 'modelGarden'>('dpo');
  readonly downloadSuccess = signal(false);
  readonly copied = signal(false);
  readonly copiedGarden = signal(false);

  onDownloadDataset(): void {
    const jsonl = this.orchestrator.exportDatasetJsonl();
    const blob = new Blob([jsonl], { type: 'application/jsonl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pocketgull_11paradigms_dataset.jsonl';
    link.click();
    URL.revokeObjectURL(url);

    this.downloadSuccess.set(true);
    setTimeout(() => this.downloadSuccess.set(false), 3000);
  }

  onCopyCommand(): void {
    const cmd = this.orchestrator.generateCliCommand(this.orchestrator.selectedParadigmId());
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  onCopyModelGardenUpload(): void {
    const cmd = this.orchestrator.generateVertexModelGardenUploadCommand(this.orchestrator.selectedParadigmId());
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      this.copiedGarden.set(true);
      setTimeout(() => this.copiedGarden.set(false), 2000);
    }
  }
}
