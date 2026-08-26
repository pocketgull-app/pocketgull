import { inject, Injectable, signal } from '@angular/core';
import { IIntelligenceProvider } from './intelligence.provider';
import { AI_CONFIG } from '../ai-provider.types';
import { IClinicalMetrics } from '../clinical-intelligence.service';
import { IVerificationIssue } from '../../components/analysis-report.types';
import { VerifyAiService } from '../verify-ai.service';
import { SecureStorageService } from '../secure-storage.service';
import { getStoredApiKey } from '../secure-key';

export interface IInteractionSessionConfig {
    model?: string;
    thinkingBudget?: number;
    temperature?: number;
    tools?: any[];
    systemInstruction?: string;
}

export interface IStreamChunkMetrics {
    totalTokens?: number;
    thoughtContent?: string;
    textContent: string;
}

@Injectable({
    providedIn: 'root'
})
export class InteractionsProvider implements IIntelligenceProvider {
    private config = (() => {
        try {
            return inject(AI_CONFIG, { optional: true }) || {
                defaultModel: { modelId: 'gemini-3.7-flash', temperature: 0.1 }
            };
        } catch {
            return {
                defaultModel: { modelId: 'gemini-3.7-flash', temperature: 0.1 }
            };
        }
    })();

    private verifier = (() => {
        try {
            return inject(VerifyAiService, { optional: true }) || new VerifyAiService();
        } catch {
            return new VerifyAiService();
        }
    })();

    private storage = (() => {
        try {
            return inject(SecureStorageService, { optional: true }) || new SecureStorageService();
        } catch {
            return new SecureStorageService();
        }
    })();

    // Signals for reactive tracking
    readonly isConnected = signal<boolean>(true);
    readonly activeModel = signal<string>('gemini-3.7-flash');
    readonly thinkingBudget = signal<number>(2048);
    readonly lastError = signal<string | null>(null);

    // Active session identifier
    private activeSessionId: string | null = null;
    private readonly activeSessions = new Map<string, { systemInstruction: string; history: any[] }>();

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
     * Executes HTTP requests with exponential backoff and jitter.
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

    /**
     * Updates the thinking budget for clinical differential diagnoses.
     */
    setThinkingBudget(budget: number): void {
        this.thinkingBudget.set(Math.max(0, budget));
    }

    /**
     * Generates a clinical report stream using the Interactions API backend endpoint.
     */
    async *generateReportStream$(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
        const routingModelId = (lens === 'Summary Overview' || lens === 'Functional Protocols')
            ? 'gemini-3.7-flash'
            : 'gemini-2.5-flash';

        const budget = (lens === 'Summary Overview' || lens === 'Functional Protocols')
            ? this.thinkingBudget()
            : 0;

        const response = await this.fetchWithRetry('/api/ai/stream', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                patientData,
                systemInstruction,
                model: routingModelId,
                temperature: this.config.defaultModel.temperature,
                thinkingBudget: budget,
                lens: lens
            })
        });

        if (!response.ok || !response.body) {
            const err = await response.text();
            throw new Error(err || 'Interactions stream request failed');
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

                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || parsed.text;
                    if (text) {
                        yield text;
                    } else if (parsed.toolCall) {
                        yield `__TOOL_CALL__:${JSON.stringify(parsed.toolCall)}`;
                    }
                } catch (e: any) {
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
        } catch {
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
        level?: 'simplified' | 'dyslexia' | 'child' | 'spanish' | 'german' | 'french' | 'mandarin' | 'japanese' | 'hindi',
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
        return data.analysis || data.text;
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
        this.activeSessionId = `interaction_${Date.now()}_${randomPart}`;

        this.activeSessions.set(this.activeSessionId, {
            systemInstruction,
            history: []
        });

        const response = await this.fetchWithRetry('/api/ai/chat/start', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                sessionId: this.activeSessionId,
                systemInstruction,
                model: this.activeModel(),
                temperature: this.config.defaultModel.temperature
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to start interaction session');
        }
    }

    async sendMessage(message: string, files?: File[], enableGrounding?: boolean): Promise<string> {
        if (!this.activeSessionId) {
            await this.startChat('', 'Clinical interaction consult context');
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
                sessionId: this.activeSessionId,
                message,
                files: encodedFiles,
                enableGrounding
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to send interaction message');
        }
        const data = await response.json();
        return data.text;
    }

    async getInitialGreeting(prompt: string): Promise<string> {
        return this.sendMessage(prompt);
    }

    /**
     * Purges an interaction session for HIPAA Safe Harbor compliance.
     */
    purgeSession(sessionId?: string): void {
        const id = sessionId || this.activeSessionId;
        if (id) {
            this.activeSessions.delete(id);
            if (this.activeSessionId === id) {
                this.activeSessionId = null;
            }
        }
    }

    /**
     * Purges all active interaction sessions.
     */
    purgeAllSessions(): void {
        this.activeSessions.clear();
        this.activeSessionId = null;
    }
}
