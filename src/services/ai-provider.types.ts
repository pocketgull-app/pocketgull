import { InjectionToken } from '@angular/core';

export type AiModelId =
    | 'gemini-2.5-flash'
    | 'gemini-2.5-pro'
    | 'gemini-2.0-flash'
    | 'gemini-1.5-flash'
    | 'gemini-1.5-pro'
    | 'gemini-3.5-flash'
    | 'gemini-3.1-flash-lite'
    | 'pubgemma-7b'
    | 'pubgemma-12b'
    | 'pubgemma-27b'
    | 'medgemma-27b'
    | 'medgemma-3-27b';

export interface IAiModelConfig {
    modelId: AiModelId;
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
}

export interface IAiProviderConfig {
    apiKey: string;
    defaultModel: IAiModelConfig;
    verificationModel: IAiModelConfig;
}

export const AI_CONFIG = new InjectionToken<IAiProviderConfig>('AI_CONFIG');
