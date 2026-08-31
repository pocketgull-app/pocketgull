import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IIntelligenceProvider } from './intelligence.provider';
import { AI_CONFIG } from '../ai-provider.types';
import { IClinicalMetrics } from '../clinical-intelligence.service';
import { IVerificationIssue } from '../../components/analysis-report.types';
import { VerifyAiService } from '../verify-ai.service';
import { SecureStorageService } from '../secure-storage.service';
import { getStoredApiKey } from '../secure-key';


@Injectable({
    providedIn: 'root'
})
export class GeminiProvider implements IIntelligenceProvider {
    private config = inject(AI_CONFIG);
    private verifier = inject(VerifyAiService);
    private storage = (() => {
        try { return inject(SecureStorageService); } catch (e) { return new SecureStorageService(); }
    })();

    // Chat session ID for server-side session management
    private chatSessionId: string | null = null;

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        const userKey = this.storage.getItem('GEMINI_API_KEY') || getStoredApiKey(this.storage);
        if (userKey) {
            headers['X-Gemini-API-Key'] = userKey.trim();
        }
        return headers;
    }

    /**
     * Executes HTTP requests with exponential backoff, jitter, and automatic retry on 429/5xx status codes.
     */
    private async fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
        let attempts = 0;
        let delay = 1000;

        while (true) {
            try {
                attempts++;
                const response = await fetch(url, options);
                if (response.ok) {
                    return response;
                }

                const isTransient = response.status === 429 || response.status >= 500;
                if (isTransient && attempts < maxRetries) {
                    const jitter = Math.floor(Math.random() * 250);
                    await new Promise(r => setTimeout(r, delay + jitter));
                    delay *= 2;
                    continue;
                }

                return response;
            } catch (err) {
                if (attempts < maxRetries) {
                    const jitter = Math.floor(Math.random() * 250);
                    await new Promise(r => setTimeout(r, delay + jitter));
                    delay *= 2;
                    continue;
                }
                throw err;
            }
        }
    }

    async *generateReportStream$(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
        // Hybrid Routing Strategy (Google Cloud Gemini 3 GA Migration):
        // Use gemini-3.7-flash for heavy reasoning/synthesis lenses,
        // and gemini-3.7-flash for formatting/educational/structured lenses.
        const routingModelId = (lens === 'Summary Overview' || lens === 'Functional Protocols')
            ? 'gemini-3.7-flash'
            : 'gemini-3.7-flash';

        const response = await this.fetchWithRetry('/api/ai/stream', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                patientData,
                systemInstruction,
                model: routingModelId,
                temperature: this.config.defaultModel.temperature,
                lens: lens
            })
        });

        if (!response.ok || !response.body) {
            const err = await response.text();
            throw new Error(err || 'Stream request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                
                const data = trimmedLine.slice(6).trim();
                if (data === '[DONE]') {
                    return;
                }
                
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        throw new Error(typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error));
                    }
                    
                    const geminiText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (geminiText) {
                        yield geminiText;
                    } else if (parsed.toolCall) {
                        yield `__TOOL_CALL__:${JSON.stringify(parsed.toolCall)}`;
                    } else if (parsed.text) {
                        // Custom/Legacy wrapper shape
                        yield parsed.text;
                    }
                } catch (e: any) {
                    console.error("GeminiProvider: Error parsing SSE chunk", e, data);
                    if (data.includes('"error"')) throw e;
                }
            }
        }
    }

    async generateMetrics(reportText: string): Promise<IClinicalMetrics> {
        const response = await this.fetchWithRetry('/api/ai/metrics', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ text: reportText })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();

        try {
            if (
                typeof data === 'object' && data !== null &&
                typeof data.complexity === 'number' &&
                typeof data.stability === 'number' &&
                typeof data.certainty === 'number'
            ) {
                return {
                    complexity: Math.max(0, Math.min(10, data.complexity)),
                    stability: Math.max(0, Math.min(10, data.stability)),
                    certainty: Math.max(0, Math.min(10, data.certainty))
                };
            }
            throw new Error('Invalid metrics payload');
        } catch (err) {
            console.warn('[GeminiProvider] metrics validation bypassed or failed, using fallback parsing:', err);
            return {
                complexity: Math.max(0, Math.min(10, Number(data?.complexity ?? 5))),
                stability: Math.max(0, Math.min(10, Number(data?.stability ?? 5))),
                certainty: Math.max(0, Math.min(10, Number(data?.certainty ?? 5))),
            };
        }
    }

    async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
        const response = await this.fetchWithRetry('/api/ai/changes', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ oldData, newData })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.significant;
    }

    async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: IVerificationIssue[] }> {
        return await this.verifier.verifyReportSection(lens as any, content, sourceData);
    }

    async translateReadingLevel(
        text: string,
        level?: 'simplified' | 'dyslexia' | 'child' | 'spanish' | 'german' | 'french' | 'japanese' | 'hindi',
        cognitiveLevel?: 'standard' | 'simplified' | 'dyslexia' | 'child',
        language?: string
    ): Promise<string> {
        const response = await this.fetchWithRetry('/api/ai/translate', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ text, level, cognitiveLevel, language })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.text;
    }

    async analyzeTranslation(original: string, translated: string): Promise<string> {
        const response = await this.fetchWithRetry('/api/ai/analyze-translation', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ original, translated })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.analysis || data.text; // Support either return shape from backend
    }

    async analyzeImage(base64Image: string, context?: string): Promise<string> {
        const response = await this.fetchWithRetry('/api/ai/analyze-image', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ base64Image, context })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.analysis;
    }

    async scanDocument(base64Image: string, context?: string): Promise<any> {
        const response = await this.fetchWithRetry('/api/ai/scan-document', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ base64Image, context })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    async synthesizeKnowledge(inputText: string): Promise<any> {
        const response = await this.fetchWithRetry('/api/ai/synthesize', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ text: inputText })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data;
    }

    async startChat(patientData: string, context: string): Promise<void> {
        const systemInstruction = `${context}\n\nPatient Data:\n${patientData}`;
        const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().slice(0, 8)
            : Array.from(crypto.getRandomValues(new Uint8Array(4)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        this.chatSessionId = `chat_${Date.now()}_${randomPart}`;

        const response = await this.fetchWithRetry('/api/ai/chat/start', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                sessionId: this.chatSessionId,
                systemInstruction,
                model: this.config.defaultModel.modelId,
                temperature: this.config.defaultModel.temperature
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to start chat session');
        }
    }

    async sendMessage(message: string, files?: File[], enableGrounding?: boolean): Promise<string> {
        if (!this.chatSessionId) {
            await this.startChat('', 'Clinical consult context');
        }

        const encodedFiles = await Promise.all((files || []).map(async f => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ name: f.name, type: f.type, data: (e.target?.result as string).split(',')[1] });
                reader.readAsDataURL(f);
            });
        }));

        const response = await this.fetchWithRetry('/api/ai/chat/message', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                sessionId: this.chatSessionId,
                message,
                files: encodedFiles,
                enableGrounding
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to send message');
        }
        const data = await response.json();
        return data.text;
    }

    async getInitialGreeting(prompt: string): Promise<string> {
        return this.sendMessage(prompt);
    }
}
