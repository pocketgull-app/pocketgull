import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebLLMProvider, AVAILABLE_GEMMA_MODELS, IGemmaModelInfo, IOfflineEmergencyProtocol } from '../services/ai/webllm.provider';
import { PatientStateService } from '../services/patient-state.service';

interface IChatMessage {
  id: string;
  sender: 'user' | 'gemma';
  text: string;
  timestamp: string;
  protocolBadge?: string;
}

@Component({
  selector: 'app-local-gemma-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 sm:p-7 rounded-3xl bg-zinc-950/95 border border-purple-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-6">
      <!-- Top Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl shadow-inner">
            ⚡
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-black uppercase tracking-wider text-purple-400">
                100% Offline Local Gemma 3 Edge AI Studio
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero Cloud Egress
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              Air-Gapped In-Browser WebGPU/WASM Neural Engine for Remote Maritime, Disaster Response &amp; Rural Clinics
            </p>
          </div>
        </div>

        <!-- Telemetry & Action Badges -->
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] flex items-center gap-2">
            <span class="text-zinc-400">Speed:</span>
            <span class="font-bold text-amber-400">{{ webLlm.tokensPerSecond() > 0 ? (webLlm.tokensPerSecond() + ' tok/s') : 'Idle' }}</span>
          </div>

          <div class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] flex items-center gap-2">
            <span class="text-zinc-400">VRAM Est:</span>
            <span class="font-bold text-purple-300">{{ webLlm.estimatedVramUsageMb() }} MB</span>
          </div>

          <button (click)="initializeEngine()" [disabled]="webLlm.isLoadingProgress()"
            class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
            <span>{{ webLlm.isLoadingProgress() ? 'Initializing WebGPU...' : (webLlm.isEngineReady() ? '🟢 Engine Active' : '🚀 Warmup WebGPU') }}</span>
          </button>
        </div>
      </div>

      <!-- Model Selector Bar -->
      <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">Select Quantized Gemma Architecture:</span>
          <span class="text-purple-400 text-[10px]">{{ webLlm.currentModel().description }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          @for (model of availableModels; track model.id) {
            <button 
              (click)="onSelectModel(model.id)"
              [disabled]="isGenerating() || webLlm.isLoadingProgress()"
              [ngClass]="webLlm.selectedModelId() === model.id ? 'bg-purple-600/30 border-purple-500 text-white shadow-md' : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'"
              class="p-3 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs">{{ model.name }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{{ model.parameterSize }}</span>
              </div>
              <div class="text-[10px] text-zinc-400 line-clamp-1 font-sans">{{ model.recommendedFor }}</div>
            </button>
          }
        </div>
      </div>

      <!-- Quick Disaster & Emergency Presets -->
      <div class="space-y-2">
        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <span>🚨 Quick Emergency Protocols (Zero Network Required):</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button (click)="triggerDisasterPreset('maritime')" 
            class="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer">
            <span>⚓</span> Maritime Hypothermia &amp; Immersion
          </button>

          <button (click)="triggerDisasterPreset('start_triage')" 
            class="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer">
            <span>🏷️</span> Mass Casualty START Triage
          </button>

          <button (click)="triggerDisasterPreset('wilderness_trauma')" 
            class="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer">
            <span>🩹</span> Wilderness Trauma &amp; Splinting
          </button>

          <button (click)="triggerDisasterPreset('pharmacogenomics')" 
            class="px-3 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer">
            <span>🧬</span> Offline Drug-Gene Safety Audit
          </button>
        </div>
      </div>

      <!-- Loading Progress Indicator -->
      @if (webLlm.isLoadingProgress()) {
        <div class="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs animate-pulse space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-300 uppercase">Loading Neural Model Weights into WebGPU Memory...</span>
            <span class="text-[10px] text-zinc-400">IndexedDB Cache Stream</span>
          </div>
          <p class="font-mono text-[11px] text-zinc-300">{{ webLlm.loadingProgress() || 'Compiling WGSL shaders...' }}</p>
        </div>
      }

      <!-- Chat History Stream -->
      <div class="h-80 overflow-y-auto p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3.5 text-xs font-mono">
        @if (messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-zinc-500 text-center space-y-2">
            <span class="text-3xl opacity-40">🔒</span>
            <div class="text-[11px] uppercase tracking-wider font-bold text-zinc-400">
              Offline Neural Sandbox Ready
            </div>
            <p class="text-[11px] max-w-md text-zinc-500 font-sans">
              Type an offline clinical inquiry or click an emergency disaster preset above. All inference runs 100% locally on your device's WebGPU.
            </p>
          </div>
        }

        @for (msg of messages(); track msg.id) {
          <div [ngClass]="msg.sender === 'user' ? 'text-right' : 'text-left'">
            <div class="inline-block max-w-[90%] p-4 rounded-2xl text-left shadow-lg"
              [ngClass]="msg.sender === 'user' ? 'bg-purple-600 text-white font-bold' : 'bg-zinc-950 text-zinc-100 border border-zinc-800'">
              
              <div class="flex items-center justify-between gap-3 text-[9px] opacity-75 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">
                <span>{{ msg.sender === 'user' ? 'Clinician Command' : (webLlm.currentModel().name + ' (Local WebGPU)') }}</span>
                <span>{{ msg.timestamp }}</span>
              </div>

              @if (msg.protocolBadge) {
                <div class="inline-block mb-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {{ msg.protocolBadge }}
                </div>
              }

              <div class="whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-[13px]">{{ msg.text }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Input Bar -->
      <div class="flex items-center gap-2 pt-1">
        <input #promptInput type="text" 
          placeholder="Type offline clinical inquiry (e.g. Compare CYP2D6 dosing guidelines or field hypothermia rewarming)..."
          (keyup.enter)="sendQuery(promptInput.value); promptInput.value = ''"
          class="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono shadow-inner" />

        <button (click)="sendQuery(promptInput.value); promptInput.value = ''" [disabled]="isGenerating()"
          class="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-lg">
          {{ isGenerating() ? 'Inferring...' : 'Execute' }}
        </button>
      </div>
    </div>
  `
})
export class LocalGemmaStudioComponent {
  readonly webLlm = inject(WebLLMProvider);
  readonly state = inject(PatientStateService);

  readonly availableModels: IGemmaModelInfo[] = AVAILABLE_GEMMA_MODELS;
  readonly messages = signal<IChatMessage[]>([]);
  readonly isGenerating = signal<boolean>(false);

  onSelectModel(modelId: string): void {
    this.webLlm.setModel(modelId);
  }

  async initializeEngine(): Promise<void> {
    await this.webLlm.loadEngine();
  }

  triggerDisasterPreset(type: 'maritime' | 'start_triage' | 'wilderness_trauma' | 'pharmacogenomics'): void {
    if (type === 'maritime') {
      const proto = this.webLlm.generateEmergencyProtocol('maritime');
      this.addProtocolToChat('⚓ Offshore Immersion Hypothermia Protocol', proto);
    } else if (type === 'start_triage') {
      const proto = this.webLlm.generateEmergencyProtocol('start_triage');
      this.addProtocolToChat('🏷️ Mass Casualty START Triage Algorithm', proto);
    } else if (type === 'wilderness_trauma') {
      const proto = this.webLlm.generateEmergencyProtocol('trauma');
      this.addProtocolToChat('🩹 Wilderness Trauma & Splinting Guide', proto);
    } else if (type === 'pharmacogenomics') {
      this.sendQuery('Evaluate Clopidogrel vs Prasugrel in patient with CYP2C19 loss-of-function (*2/*3) allele in offline setting.');
    }
  }

  private addProtocolToChat(title: string, proto: IOfflineEmergencyProtocol): void {
    const formatted = `### ${proto.scenario}\n\n**Immediate Interventions:**\n${proto.immediateActions.map(a => `• ${a}`).join('\n')}\n\n**Vital Signs Target:**\n${proto.vitalTargets}\n\n**Critical Red Flags:**\n${proto.redFlags.map(r => `⚠️ ${r}`).join('\n')}`;
    
    this.messages.update(m => [
      ...m,
      {
        id: `USER-${Date.now()}`,
        sender: 'user',
        text: `Execute Offline Emergency Protocol: ${title}`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: `GEMMA-${Date.now()}`,
        sender: 'gemma',
        text: formatted,
        timestamp: new Date().toLocaleTimeString(),
        protocolBadge: proto.category
      }
    ]);
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
        `You are Google Gemma 3, an on-device local clinical AI consultant running entirely in the client WebGPU. Provide structured, concise, evidence-based guidance. Query: ${prompt}`
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

