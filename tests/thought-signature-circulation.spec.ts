import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiProvider } from '../src/services/ai/gemini.provider';
import { AI_CONFIG } from '../src/services/ai-provider.types';
import { VerifyAiService } from '../src/services/verify-ai.service';
import { AiCacheService } from '../src/services/ai-cache.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('Gemini 3.5 / 3.6 GA Migration & Thought Signature Circulation', () => {
  let provider: GeminiProvider;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        {
          provide: AI_CONFIG,
          useValue: {
            apiKey: 'test-api-key',
            defaultModel: { modelId: 'gemini-3.5-flash', temperature: 0.1 },
            verificationModel: { modelId: 'gemini-3.5-flash', temperature: 0.0 }
          }
        },
        { provide: AiCacheService, useFactory: () => new AiCacheService() },
        { provide: VerifyAiService, useFactory: () => new VerifyAiService() },
        { provide: GeminiProvider, useFactory: () => new GeminiProvider() }
      ]
    });

    provider = runInInjectionContext(injector, () => injector.get(GeminiProvider));
  });

  it('should route heavy synthesis lenses to gemini-3.6-flash and standard lenses to gemini-3.5-flash', async () => {
    let capturedBody: any = null;

    // Spy on fetchWithRetry
    (provider as any).fetchWithRetry = async (_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return new Response(new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"candidates":[{"content":{"parts":[{"text":"Gemini 3 streamed response"}]}}]}\n\ndata: [DONE]\n\n'));
          controller.close();
        }
      }));
    };

    // 1. Heavy synthesis lens -> gemini-3.6-flash
    const streamPro = provider.generateReportStream$('Patient Data', 'Functional Protocols', 'Sys Inst');
    for await (const chunk of streamPro) {}
    expect(capturedBody.model).toBe('gemini-3.6-flash');

    // 2. Standard formatting lens -> gemini-2.5-flash
    const streamFlash = provider.generateReportStream$('Patient Data', 'Precision Nutrients', 'Sys Inst');
    for await (const chunk of streamFlash) {}
    expect(capturedBody.model).toBe('gemini-2.5-flash');
  });

  it('should capture and circulate thought signatures in multi-turn chat history', async () => {
    let capturedChatBody: any = null;

    (provider as any).fetchWithRetry = async (url: string, init: RequestInit) => {
      if (url.includes('/chat/start')) {
        return new Response(JSON.stringify({ success: true, sessionId: 'session-123' }), { status: 200 });
      }
      if (url.includes('/chat/message')) {
        capturedChatBody = JSON.parse(init.body as string);
        return new Response(JSON.stringify({
          text: 'Clinical reasoning response',
          thoughtSignature: 'sig_gemini_3_reasoning_token_xyz987'
        }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    };

    await provider.startChat('Patient Intake: HR 72', 'Clinical Co-Pilot Context');
    const response = await provider.sendMessage('Evaluate cardiac risk', [], true);

    expect(response).toBe('Clinical reasoning response');
    expect(capturedChatBody.sessionId).toBeDefined();
  });
});
