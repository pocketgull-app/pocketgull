import { Injectable, inject } from '@angular/core';
import { IVerificationIssue } from '../components/analysis-report.types';
import { AI_CONFIG } from './ai-provider.types';
import { AiCacheService } from './ai-cache.service';
import { getStoredApiKey } from './secure-key';
import { SecureStorageService } from './secure-storage.service';

@Injectable({
    providedIn: 'root'
})
export class VerifyAiService {
    private config = (() => {
        try {
            return inject(AI_CONFIG);
        } catch (e) {
            return { apiKey: '', verificationModel: { modelId: 'gemini-3.5-flash', temperature: 0.1 } } as any;
        }
    })();
    private _ai: any = null;
    private cache = (() => {
        try {
            return inject(AiCacheService);
        } catch (e) {
            return new AiCacheService();
        }
    })();
    private storage = (() => {
        try {
            return inject(SecureStorageService);
        } catch (e) {
            return new SecureStorageService();
        }
    })();

    private async getAi(): Promise<any> {
        if (!this._ai) {
            let initialKey = (window as any).GEMINI_API_KEY || this.config.apiKey;
            if (!initialKey) {
                try {
                    initialKey = getStoredApiKey(this.storage);
                } catch (e) { console.error("VerifyAiService: storage error", e); }
            }
            if (!initialKey && typeof process !== 'undefined' && process.env) {
                initialKey = process.env.GEMINI_API_KEY;
            }
            if (!initialKey) {
                throw new Error("API key must be set when using the Gemini API. Ensure server injection or environment variable is present.");
            }
            const { GoogleGenAI } = await import('@google/genai');
            this._ai = new GoogleGenAI({ apiKey: initialKey });
        }
        return this._ai;
    }

    /**
     * Verifies a section of the AI report against the source patient data.
     */
    async verifyReportSection(
        sectionTitle: string,
        sectionContent: string,
        sourceTranscript: string
    ): Promise<{ status: 'verified' | 'warning' | 'error', issues: IVerificationIssue[] }> {

        const prompt = `
      You are a Medical Auditor AI. Your task is to verify an AI-generated clinical report section against the source patient transcript.
      
      SOURCE TRANSCRIPT:
      ${sourceTranscript}
      
      REPORT SECTION[${sectionTitle}]:
      ${sectionContent}
      
      INSTRUCTIONS:
      1. Cross-reference every clinical claim in the report with the source transcript.
      2. Identify any:
         - Hallucinations (claims not found in transcript)
         - Inaccuracies (claims that distort transcript facts)
         - Critical Omissions (if the section title implies something that was missed)
      3. Enforce the ACM Code of Ethics Principle 1.3 (Honesty and Trustworthiness - Prohibition of Falsified or Fabricated Data). If the report section contains any fabricated clinical vitals, lab values, or patient history not present in the source transcript, flag them as high-severity data integrity violations. For these violations, start the 'message' with "ACM 1.3 Ethics Violation: ".
      4. Rate the overall verification status as:
         - "verified": All claims are supported by the transcript.
         - "warning": Minor inaccuracies or unsupported claims that don't change clinical intent.
         - "error": Major hallucinations, fabricated data, or contradictory information.
      
      OUTPUT FORMAT:
      Return a JSON object with the following structure:
      {
        "status": "verified" | "warning" | "error",
        "issues": [
          {
            "severity": "low" | "medium" | "high",
            "message": "Description of the issue",
            "suggestedFix": "Corrected text based on transcript",
            "claim": "The exact substring from the generated report that is problematic"
          }
        ]
      }
      
      Return ONLY the JSON.
    `;

        const cacheKey = await this.cache.generateKey([
            sectionTitle,
            sectionContent,
            sourceTranscript,
            this.config.verificationModel.modelId
        ]);

        try {
            const cached = await this.cache.get(cacheKey);
            if (cached) return cached;

            const ai = await this.getAi();
            const response = await ai.models.generateContent({
                model: this.config.verificationModel.modelId,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: 'application/json',
                    temperature: this.config.verificationModel.temperature,
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_LOW_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_LOW_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                            threshold: 'BLOCK_LOW_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_LOW_AND_ABOVE'
                        }
                    ]
                }
            });

            let text = response.text;
            if (text.startsWith('```json')) {
                text = text.replace(/^```json\n?/, '').replace(/```$/, '').trim();
            } else if (text.startsWith('```')) {
                text = text.replace(/^```\n?/, '').replace(/```$/, '').trim();
            }
            
            const result = JSON.parse(text);
            await this.cache.set(cacheKey, result);
            return result;

        } catch (e) {
            console.error('AI Verification failed', e);
            return {
                status: 'warning',
                issues: [{ severity: 'low', message: 'Verification bridge failed. Please manually check transcript.' }]
            };
        }
    }
}
