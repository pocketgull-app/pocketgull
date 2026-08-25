import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebLLMProvider } from '../services/ai/webllm.provider';
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
    <div class="w-full p-5 sm:p-7 rounded-3xl bg-zinc-950/95 border border-purple-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl">
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚡</span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-purple-400">
              100% Offline On-Device WebGPU Gemma AI Studio
            </h3>
            <p class="text-[11px] text-zinc-400">
              Air-Gapped Local Neural Inference Engine (gemma-2b-it-q4f32_1-MLC)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border bg-purple-500/20 text-purple-300 border-purple-500/40">
            🔒 Air-Gapped / Zero Egress
          </span>

          <button (click)="initializeEngine()" [disabled]="webLlm.isLoadingProgress()"
            class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50">
            {{ webLlm.isLoadingProgress() ? 'Initializing WebGPU...' : '🚀 Load WebGPU Engine' }}
          </button>
        </div>
      </div>

      <!-- Loading Progress -->
      @if (webLlm.isLoadingProgress()) {
        <div class="mb-5 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs animate-pulse">
          <span class="font-bold text-purple-400 uppercase block mb-1">WebGPU Model Weights Loading...</span>
          <p class="font-mono text-[11px] text-zinc-300">{{ webLlm.loadingProgress() || 'Connecting to WebWorker...' }}</p>
        </div>
      }

      <!-- Chat History Stream -->
      <div class="h-64 overflow-y-auto mb-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 text-xs font-mono">
        @if (messages().length === 0) {
          <div class="h-full flex items-center justify-center text-zinc-500 text-[11px] uppercase tracking-wider font-bold">
            No local offline queries submitted yet. Ask Gemma a clinical question.
          </div>
        }

        @for (msg of messages(); track msg.id) {
          <div [ngClass]="msg.sender === 'user' ? 'text-right' : 'text-left'">
            <div class="inline-block max-w-[85%] p-3 rounded-2xl text-left"
              [ngClass]="msg.sender === 'user' ? 'bg-purple-600 text-white font-bold' : 'bg-zinc-800 text-zinc-100 border border-zinc-700'">
              <div class="text-[9px] opacity-70 uppercase tracking-widest mb-1">
                {{ msg.sender === 'user' ? 'Clinician Prompt' : 'Gemma 2B Local WebGPU' }} • {{ msg.timestamp }}
              </div>
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Input Bar -->
      <div class="flex items-center gap-2">
        <input #promptInput type="text" placeholder="Type offline clinical inquiry (e.g. Compare CYP2D6 dosing guidelines)..."
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

  readonly messages = signal<IChatMessage[]>([]);
  readonly isGenerating = signal<boolean>(false);

  async initializeEngine(): Promise<void> {
    await this.webLlm.loadEngine();
  }

  async sendQuery(prompt: string): Promise<void> {
    if (!prompt.trim() || this.isGenerating()) return;

    const userMsg: IChatMessage = {
      id: `USER-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString()
    };
    this.messages.update(m => [...m, userMsg]);
    this.isGenerating.set(true);

    const gemmaMsgId = `GEMMA-${Date.now()}`;
    const gemmaMsg: IChatMessage = {
      id: gemmaMsgId,
      sender: 'gemma',
      text: '',
      timestamp: new Date().toLocaleTimeString()
    };
    this.messages.update(m => [...m, gemmaMsg]);

    try {
      const activeIssuesCount = this.state?.selectedIssues?.()?.length || 0;
      const patientSummary = `Patient Profile: Homo Sapiens (34y), Active Clinical Issues: ${activeIssuesCount}`;
      const stream = this.webLlm.generateReportStream$(
        patientSummary,
        'Offline Local Consult',
        `You are Gemma, an on-device local clinical AI consultant. Query: ${prompt}`
      );

      let accumulated = '';
      for await (const chunk of stream) {
        accumulated += chunk;
        this.messages.update(msgs =>
          msgs.map(m => m.id === gemmaMsgId ? { ...m, text: accumulated } : m)
        );
      }
    } catch (e: any) {
      this.messages.update(msgs =>
        msgs.map(m => m.id === gemmaMsgId ? { ...m, text: `[WebGPU Execution Note]: ${e?.message || 'Local WebGPU simulated stream response.'}` } : m)
      );
    } finally {
      this.isGenerating.set(false);
    }
  }
}
