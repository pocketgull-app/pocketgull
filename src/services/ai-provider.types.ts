import { InjectionToken } from '@angular/core';

export type AiModelId =
    | 'gemini-3.5-flash'
    | 'gemini-3.6-flash'
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
