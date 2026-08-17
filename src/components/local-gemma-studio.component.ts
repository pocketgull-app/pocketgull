import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebLLMProvider, LOCAL_GEMMA_MODELS, ILocalGemmaModel } from '../services/ai/webllm.provider';
import { PatientStateService } from '../services/patient-state.service';

interface IChatMessage {
  id: string;
  sender: 'user' | 'gemma';
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-local-gemma-studio',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 sm:p-7 rounded-3xl bg-zinc-950/95 border border-purple-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-4">
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">⚡</span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-purple-400">
              100% Offline Local Gemma 3 Edge AI Studio
            </h3>
            <p class="text-[11px] text-zinc-400">
              Quantized WebGPU Air-Gapped Neural Inference • Zero Network Egress • Rural & Disaster Telemedicine
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Model Selection Dropdown -->
          <select [value]="webLlm.selectedModelId()"
            (change)="onModelChange($event)"
            class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono focus:outline-none cursor-pointer">
            @for (m of availableModels; track m.id) {
              <option [value]="m.id">{{ m.displayName }} ({{ m.vramRequirementGb }} GB VRAM)</option>
            }
          </select>

          <span class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border bg-purple-500/20 text-purple-300 border-purple-500/40">
            🔒 Air-Gapped / Zero Egress
          </span>

          <button (click)="initializeEngine()" [disabled]="webLlm.isLoadingProgress()"
            class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50">
            {{ webLlm.isLoadingProgress() ? 'Initializing WebGPU...' : '🚀 Load WebGPU Engine' }}
          </button>
        </div>
      </div>

      <!-- Telemetry Hardware Badges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <span class="text-zinc-500 text-[9px] uppercase font-bold block">Active Model</span>
          <span class="font-bold text-zinc-200 truncate block">{{ webLlm.activeModelName() }}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <span class="text-zinc-500 text-[9px] uppercase font-bold block">Quantization</span>
          <span class="font-bold text-emerald-400 block">{{ currentModel()?.quantization || 'q4f16_1' }}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <span class="text-zinc-500 text-[9px] uppercase font-bold block">Est. Throughput</span>
          <span class="font-bold text-purple-300 block">{{ webLlm.tokenThroughput() }} tok/sec</span>
        </div>
        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <span class="text-zinc-500 text-[9px] uppercase font-bold block">VRAM Footprint</span>
          <span class="font-bold text-blue-400 block">{{ currentModel()?.vramRequirementGb || 1.6 }} GB VRAM</span>
        </div>
      </div>

      <!-- Loading Progress -->
      @if (webLlm.isLoadingProgress()) {
        <div class="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs animate-pulse">
          <span class="font-bold text-purple-400 uppercase block mb-1">WebGPU Model Weights Loading into Browser Cache...</span>
          <p class="font-mono text-[11px] text-zinc-300">{{ webLlm.loadingProgress() || 'Allocating WebGPU shaders...' }}</p>
        </div>
      }

      <!-- Emergency Quick-Starter Prompts -->
      <div class="space-y-1.5">
        <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Offline Emergency Protocol Quick-Starters</span>
        <div class="flex flex-wrap gap-2">
          <button (click)="sendQuery('Evaluate ACOG AIM postpartum preeclampsia triage criteria for BP 162/112 mmHg.')"
            class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 cursor-pointer transition">
            🚨 ACOG Postpartum Preeclampsia
          </button>
          <button (click)="sendQuery('Compare CYP2D6 metabolizer status impact on Codeine vs Tramadol analgesia.')"
            class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 cursor-pointer transition">
            🧬 CYP2D6 Pharmacogenomics
          </button>
          <button (click)="sendQuery('Recommend evidence-based galactagogues for early postpartum lactation support.')"
            class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 cursor-pointer transition">
            🌿 Lactation & Galactagogues
          </button>
          <button (click)="sendQuery('Emergency field protocol for rural anaphylaxis when epinephrine autoinjector is expired.')"
            class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 cursor-pointer transition">
            🌲 Rural Anaphylaxis Protocol
          </button>
        </div>
      </div>

      <!-- Chat History Stream -->
      <div class="h-64 overflow-y-auto p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 text-xs font-mono">
        @if (messages().length === 0) {
          <div class="h-full flex items-center justify-center text-zinc-500 text-[11px] uppercase tracking-wider font-bold">
            No local offline queries submitted yet. Ask Gemma 3 a clinical inquiry above.
          </div>
        }

        @for (msg of messages(); track msg.id) {
          <div [ngClass]="msg.sender === 'user' ? 'text-right' : 'text-left'">
            <div class="inline-block max-w-[85%] p-3 rounded-2xl text-left"
              [ngClass]="msg.sender === 'user' ? 'bg-purple-600 text-white font-bold' : 'bg-zinc-800 text-zinc-100 border border-zinc-700'">
              <div class="text-[9px] opacity-70 uppercase tracking-widest mb-1">
                {{ msg.sender === 'user' ? 'Clinician Prompt' : 'Gemma 3 Local Edge AI' }} • {{ msg.timestamp }}
              </div>
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Input Bar -->
      <div class="flex items-center gap-2">
        <input #promptInput type="text" placeholder="Type offline clinical inquiry (e.g. ACOG AIM preeclampsia protocol)..."
          (keyup.enter)="sendQuery(promptInput.value); promptInput.value = ''"
          class="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono" />

        <button (click)="sendQuery(promptInput.value); promptInput.value = ''" [disabled]="isGenerating()"
          class="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50">
          {{ isGenerating() ? 'Generating...' : 'Send' }}
        </button>
      </div>
    </div>
  `
})
export class LocalGemmaStudioComponent {
  readonly webLlm = inject(WebLLMProvider);
  readonly state = inject(PatientStateService);

  readonly availableModels = LOCAL_GEMMA_MODELS;
  readonly messages = signal<IChatMessage[]>([]);
  readonly isGenerating = signal<boolean>(false);

  currentModel(): ILocalGemmaModel | undefined {
    return this.availableModels.find(m => m.id === this.webLlm.selectedModelId());
  }

  onModelChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      this.webLlm.setModel(target.value);
    }
  }

  async initializeEngine(): Promise<void> {
    await this.webLlm.loadEngine();
  }

  async sendQuery(prompt: string): Promise<void> {
    if (!prompt.trim() || this.isGenerating()) return;

    const userMsg: IChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: prompt.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    this.messages.update(curr => [...curr, userMsg]);
    this.isGenerating.set(true);

    try {
      const response = await this.webLlm.sendMessage(prompt);
      const gemmaMsg: IChatMessage = {
        id: `msg-${Date.now()}-gemma`,
        sender: 'gemma',
        text: response,
        timestamp: new Date().toLocaleTimeString()
      };
      this.messages.update(curr => [...curr, gemmaMsg]);
    } catch (e: any) {
      const errorMsg: IChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'gemma',
        text: `[Offline Local Fallback]: ${e?.message || 'WebGPU context initialized.'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      this.messages.update(curr => [...curr, errorMsg]);
    } finally {
      this.isGenerating.set(false);
    }
  }
}
