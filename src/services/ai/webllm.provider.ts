import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { IIntelligenceProvider } from './intelligence.provider';
import { IClinicalMetrics } from '../clinical-intelligence.service';
import { IVerificationIssue } from '../../components/analysis-report.types';
import { SecureStorageService } from '../secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebLLMProvider implements IIntelligenceProvider {
  private engine: import('@mlc-ai/web-llm').WebWorkerMLCEngine | null = null;
  private isLoaded = false;
  private platformId = (() => { try { return inject(PLATFORM_ID); } catch (e) { return 'browser'; } })();
  private storage = (() => { try { return inject(SecureStorageService); } catch (e) { return null; } })();
  
  readonly loadingProgress = signal<string>('');
  readonly isLoadingProgress = signal<boolean>(false);
  
  async loadEngine() {
      if (!isPlatformBrowser(this.platformId)) return;
      if (typeof navigator !== 'undefined' && (navigator.webdriver || (typeof window !== 'undefined' && (window as any).PLAYWRIGHT_TESTING))) {
          return;
      }
      if (this.isLoaded && this.engine) return;
      
      this.isLoadingProgress.set(true);
      console.log('[WebLLM] Initializing WebGPU Local Inference Engine via WebWorker...');
      try {
        const webllm = await import('@mlc-ai/web-llm');
        
        this.engine = await webllm.CreateWebWorkerMLCEngine(
          new Worker(new URL('../../workers/webllm.worker', import.meta.url), { type: 'module' }),
          "gemma-2b-it-q4f32_1-MLC",
          {
             initProgressCallback: (progress) => {
               console.log('[WebLLM Sync]', progress.text);
               this.loadingProgress.set(progress.text);
             }
           }
        );
        this.isLoaded = true;
        console.log('[WebLLM] Engine Ready.');
      } catch (err) {
        console.warn('[WebLLM] Failed to initialize WebLLM engine (WebGPU unavailable):', err);
        this.engine = null;
      } finally {
        this.isLoadingProgress.set(false);
      }
  }

  async *generateReportStream$(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
    await this.loadEngine();
    if (!this.engine) throw new Error("WebLLM Engine failed to initialize required hardware context.");
    
    const messages: import('@mlc-ai/web-llm').ChatCompletionMessageParam[] = [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Patient Data:\n${patientData}\n\nLens:\n${lens}` }
    ];
    
    const requestTemp = Number(this.storage?.getItem('preferredModelTemperature')) || 0.5;

    const chunks = await this.engine.chat.completions.create({ 
        messages, 
        stream: true,
        temperature: requestTemp || 0.2
    });
    
    for await (const chunk of chunks) {
        if (chunk.choices[0]?.delta?.content) {
            yield chunk.choices[0].delta.content;
        }
    }
  }

  async generateMetrics(reportText: string): Promise<IClinicalMetrics> {
      await this.loadEngine();
      if (!this.engine) throw new Error("WebLLM Engine failed to initialize.");
      
      const messages: import('@mlc-ai/web-llm').ChatCompletionMessageParam[] = [
          { role: "system", content: "Extract clinical metrics as valid JSON." },
          { role: "user", content: reportText }
      ];
      
      const res = await this.engine.chat.completions.create({ messages, stream: false, response_format: { type: "json_object" } });
      const content = res.choices[0]?.message?.content || "{}";
      
      try {
          return JSON.parse(content) as IClinicalMetrics;
      } catch (e) {
          throw new Error('WebGPU metric parse failure.');
      }
  }
  
  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> { 
      await this.loadEngine();
      const res = await this.engine!.chat.completions.create({
          messages: [{role: 'user', content: 'Did clinical changes occur?'}]
      });
      return res.choices[0]?.message?.content?.toLowerCase().includes('yes') || false;
  }
  
  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: IVerificationIssue[] }> { 
      throw new Error("WebGPU verification payload too large for current configuration. Deferring downward."); 
  }
  
  async translateReadingLevel(
      text: string,
      level?: 'simplified' | 'dyslexia' | 'child' | 'spanish' | 'german' | 'french' | 'japanese' | 'hindi',
      cognitiveLevel?: 'standard' | 'simplified' | 'dyslexia' | 'child',
      language?: string
  ): Promise<string> { 
      throw new Error("WebGPU explicit tuning deferred downward."); 
  }
  
  async analyzeTranslation(original: string, translated: string): Promise<string> { 
      throw new Error("WebGPU translation analysis deferred downward."); 
  }
  
  async analyzeImage(base64Image: string, context?: string): Promise<string> { 
      throw new Error("WebGPU Multimodal vision not supported in Llama3 8B. Deferring to Gemini."); 
  }
  
  async startChat(patientData: string, context: string): Promise<void> {
      await this.loadEngine();
  }
  
  async sendMessage(message: string, files?: File[]): Promise<string> { 
      if (files && files.length > 0) throw new Error("WebLLM does not support local multimodal documents.");
      await this.loadEngine();
      
      const res = await this.engine!.chat.completions.create({
          messages: [{ role: 'user', content: message }],
          stream: false
      });
      return res.choices[0]?.message?.content || "Offline mode inference error.";
  }
  
  async synthesizeKnowledge(inputText: string): Promise<any> {
    throw new Error("WebGPU synthesis deferred downward.");
  }

  async getInitialGreeting(prompt: string): Promise<string> { 
      return "Hello, I am processing securely within your local hardware using WebGPU. How can I assist you with this protocol?"; 
  }
}
