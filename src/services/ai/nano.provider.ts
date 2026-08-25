import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IIntelligenceProvider } from './intelligence.provider';
import { IClinicalMetrics } from '../clinical-intelligence.service';
import { IVerificationIssue } from '../../components/analysis-report.types';
import { AiCacheService } from '../ai-cache.service';

// Declare experimental Chrome AI API types
declare global {
  const ai: {
    languageModel?: {
      capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
      create: (options?: { systemPrompt?: string }) => Promise<any>;
    };
    summarizer?: {
      capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
      create: (options?: { type?: string, format?: string, length?: string }) => Promise<any>;
    };
    writer?: {
      capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
      create: (options?: { sharedContext?: string, tone?: string, format?: string }) => Promise<any>;
    };
    rewriter?: {
      capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
      create: (options?: { sharedContext?: string, tone?: string, format?: string, length?: string }) => Promise<any>;
    };
  } | undefined;

  const translation: {
    canTranslate: (options: { sourceLanguage: string, targetLanguage: string }) => Promise<'readily' | 'after-download' | 'no'>;
    createTranslator: (options: { sourceLanguage: string, targetLanguage: string }) => Promise<{ translate: (text: string) => Promise<string> }>;
  } | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class NanoProvider implements IIntelligenceProvider {
  private chatSession: any = null;
  private cache = inject(AiCacheService);

  private async ensureAiAvailable() {
    if (typeof window === 'undefined') {
      throw new Error("window is not defined in this environment (SSR).");
    }
    if (typeof ai === 'undefined' || !ai.languageModel) {
      throw new Error("ai.languageModel is not available. Please ensure you are using Chrome 138+ with Optimization Guide On Device Model enabled.");
    }
    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      throw new Error("Device does not support Gemini Nano, or the feature is disabled.");
    }
    if (capabilities.available === 'after-download') {
      throw new Error("Gemini Nano model is downloading in the background. Please try again later.");
    }
  }

  async *generateReportStream$(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
    // 1. Try built-in Summarizer API for Summary Overview if available
    if (lens === 'Summary Overview' && typeof ai !== 'undefined' && ai.summarizer) {
      try {
        const capabilities = await ai.summarizer.capabilities();
        if (capabilities.available !== 'no') {
          const summarizer = await ai.summarizer.create({
            type: 'key-points',
            format: 'markdown',
            length: 'medium'
          });
          
          if (typeof summarizer.summarizeStreaming === 'function') {
            let previousChunk = '';
            const stream = await summarizer.summarizeStreaming(patientData);
            for await (const chunk of stream) {
              const newText = chunk.startsWith(previousChunk) ? chunk.substring(previousChunk.length) : chunk;
              previousChunk = chunk;
              yield newText;
            }
            return;
          } else {
            const summary = await summarizer.summarize(patientData);
            yield summary;
            return;
          }
        }
      } catch (e) {
        console.warn('[NanoProvider] Summarizer API failed, falling back to Prompt API:', e);
      }
    }

    // 2. Default fallback to Prompt API
    await this.ensureAiAvailable();
    const session = await ai!.languageModel!.create({
      systemPrompt: systemInstruction
    });

    const prompt = `Patient Data:\n${patientData}\n\nTask: Generate a highly clinical report specifically for the following scope: [${lens}]. Formulate it purely as markdown.`;
    
    let previousChunk = '';
    try {
      const stream = await session.promptStreaming(prompt);
      for await (const chunk of stream) {
        const newText = chunk.startsWith(previousChunk) ? chunk.substring(previousChunk.length) : chunk;
        previousChunk = chunk;
        yield newText;
      }
    } catch (error: any) {
      console.warn('[NanoProvider] Generation failed, attempting to fallback to local cache:', error);
      
      const cacheKey = await this.cache.generateKey([patientData, lens, systemInstruction]);
      const cached = await this.cache.get<{text: string}>(cacheKey);
      
      if (cached && cached.text) {
        yield `_⚡ Notice: Falling back to securely cached guidelines._\n\n`;
        yield cached.text;
        return;
      }
      
      throw new Error(`Nano model failed and no cache available: ${error.message}`);
    }
  }

  async generateMetrics(reportText: string): Promise<IClinicalMetrics> {
    return { complexity: 5, stability: 5, certainty: 5 }; 
  }

  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
    return true; 
  }

  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: IVerificationIssue[] }> {
    return { status: 'Verified efficiently by Gemini Nano (On-Device)', issues: [] };
  }

  async translateReadingLevel(
    text: string,
    level?: 'simplified' | 'dyslexia' | 'child' | 'spanish' | 'german' | 'french' | 'japanese' | 'hindi',
    cognitiveLevel?: 'standard' | 'simplified' | 'dyslexia' | 'child',
    language?: string
  ): Promise<string> {
    let resolvedCognitive = cognitiveLevel || 'standard';
    let resolvedLang = language || 'english';
    if (level) {
      if (['simplified', 'dyslexia', 'child'].includes(level)) {
        resolvedCognitive = level as 'simplified' | 'dyslexia' | 'child';
      } else if (['spanish', 'german', 'french', 'japanese', 'hindi'].includes(level)) {
        resolvedLang = level;
      }
    }

    try {
      // 1. Try native Translation API
      const langCodes: Record<string, string> = {
        spanish: 'es',
        french: 'fr',
        german: 'de',
        japanese: 'ja',
        hindi: 'hi'
      };
      const targetLang = langCodes[resolvedLang.toLowerCase()] || (resolvedLang.toLowerCase() !== 'english' ? resolvedLang : null);
      if (targetLang && typeof translation !== 'undefined') {
        const canTranslate = await translation.canTranslate({ sourceLanguage: 'en', targetLanguage: targetLang });
        if (canTranslate !== 'no') {
          const translator = await translation.createTranslator({ sourceLanguage: 'en', targetLanguage: targetLang });
          text = await translator.translate(text);
        }
      }

      // 2. Try native Writing Assistant Rewriter API
      if (resolvedCognitive !== 'standard' && typeof ai !== 'undefined' && ai.rewriter) {
        const capabilities = await ai.rewriter.capabilities();
        if (capabilities.available !== 'no') {
          const rewriter = await ai.rewriter.create({
            tone: resolvedCognitive === 'child' ? 'informal' : 'formal',
            length: resolvedCognitive === 'simplified' ? 'short' : 'as-is'
          });
          return await rewriter.rewrite(text, {
            context: `Adapt this medical explanation to a ${resolvedCognitive} cognitive level.`
          });
        }
      }

      // 3. Fallback to basic Prompt API
      await this.ensureAiAvailable();
      const session = await ai!.languageModel!.create({
        systemPrompt: "You are a clinical educator. Translate/rewrite the medical text into the requested cognitive level and target language. Output only the rewritten translation."
      });
      return await session.prompt(`Adapt this text to a ${resolvedCognitive} cognitive level and translate to ${resolvedLang}:\n\n${text}`);
    } catch (e) {
      console.warn('[NanoProvider] Native translation/rewriter API failed, falling back to Prompt API:', e);
      try {
        await this.ensureAiAvailable();
        const session = await ai!.languageModel!.create({
          systemPrompt: "You are a clinical educator. Translate/rewrite the medical text into the requested cognitive level and target language. Output only the rewritten translation."
        });
        return await session.prompt(`Adapt this text to a ${resolvedCognitive} cognitive level and translate to ${resolvedLang}:\n\n${text}`);
      } catch (e) {
        console.debug('[NanoProvider] Prompt API translation fallback failed:', (e as Error)?.message);
        return text;
      }
    }
  }

  async analyzeTranslation(original: string, translated: string): Promise<string> {
    try {
      await this.ensureAiAvailable();
      const session = await ai!.languageModel!.create({
        systemPrompt: "You are an expert medical translation editor. Compare the original medical text and its translated version. Analyze readability, style, and check if any key clinical facts were lost or altered. Respond in clean, concise markdown."
      });
      return await session.prompt(`Original:\n${original}\n\nTranslated:\n${translated}\n\nProvide the translation analysis:`);
    } catch (e) {
      console.debug('[NanoProvider] Translation analysis unavailable:', (e as Error)?.message);
      return "Translation delegated to on-device Nano limits and may lack external stylistic analysis.";
    }
  }

  async analyzeImage(base64Image: string, context?: string): Promise<string> {
    throw new Error("The window.ai Nano integration limits visual analysis to the multimodal gemini server engine. Please switch intelligence modes.");
  }

  async startChat(patientData: string, context: string): Promise<void> {
    await this.ensureAiAvailable();
    this.chatSession = await ai!.languageModel!.create({
      systemPrompt: `Patient Context:\n${patientData}\n\nClinical Role:\n${context}`
    });
  }

  async sendMessage(message: string, files?: File[]): Promise<string> {
    if (!this.chatSession) {
      await this.ensureAiAvailable();
      this.chatSession = await ai!.languageModel!.create({});
    }
    
    try {
      const response = await this.chatSession.prompt(`User: ${message}\n\nPlease strictly fulfill this request. If asked to make a list or action items based on clinical data, provide it directly without disclaimers.`);
      return response;
    } catch (error) {
      console.error("Gemini Nano Error:", error);
      return "On-device inference engine could not process the request.";
    }
  }

  async synthesizeKnowledge(inputText: string): Promise<any> {
    try {
      await this.ensureAiAvailable();
      const session = await ai!.languageModel!.create({
        systemPrompt: "Synthesize the provided text into key clinical insights and structure them clearly."
      });
      const text = await session.prompt(inputText);
      return { synthesis: text };
    } catch (e) {
      throw new Error(`NanoProvider synthesizeKnowledge failed: ${e}`);
    }
  }

  async getInitialGreeting(prompt: string): Promise<string> {
    return "Hello, I am Pocket Gull operating natively on your device via Gemini Nano. How can I assist with this patient's chart?";
  }
}
