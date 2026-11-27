declare const GEMINI_API_KEY: string;

interface IChromeBuiltInAiSession {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming?(input: string, options?: { signal?: AbortSignal }): AsyncIterable<string>;
  destroy?(): void;
}

interface IChromeBuiltInAiLanguageModelFactory {
  availability?(options?: Record<string, unknown>): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable' | string>;
  capabilities?(): Promise<{ available: 'readily' | 'after-download' | 'no' | string }>;
  create(options?: {
    systemPrompt?: string;
    initialPrompts?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    topK?: number;
    signal?: AbortSignal;
    expectedInputs?: Array<{ type: string; languages?: string[] }>;
    expectedOutputs?: Array<{ type: string; languages?: string[] }>;
  }): Promise<IChromeBuiltInAiSession>;
}

interface IChromeBuiltInAiSummarizer {
  summarize(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  destroy?(): void;
}

interface IChromeBuiltInAiSummarizerFactory {
  availability?(): Promise<string>;
  capabilities?(): Promise<{ available: string }>;
  create(options?: {
    type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
    format?: 'markdown' | 'plain-text';
    length?: 'short' | 'medium' | 'long';
    sharedContext?: string;
  }): Promise<IChromeBuiltInAiSummarizer>;
}

interface IChromeBuiltInAiClassifier {
  classify(input: string): Promise<{ topCategory?: string; confidence?: number }>;
  destroy?(): void;
}

interface IChromeBuiltInAiClassifierFactory {
  availability?(): Promise<string>;
  capabilities(): Promise<{ available: 'readily' | 'after-download' | 'no' | string }>;
  create(options?: { categories?: string[] }): Promise<IChromeBuiltInAiClassifier>;
}

interface IChromeBuiltInAiNamespace {
  languageModel?: IChromeBuiltInAiLanguageModelFactory;
  assistant?: IChromeBuiltInAiLanguageModelFactory;
  summarizer?: IChromeBuiltInAiSummarizerFactory;
  classifier?: IChromeBuiltInAiClassifierFactory;
}

interface IWebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (args: Record<string, unknown>, context?: { signal?: AbortSignal }) => Promise<unknown> | unknown;
}

interface IWebMcpModelContext {
  registerTool(tool: IWebMcpToolDefinition, options?: { signal?: AbortSignal }): void;
  unregisterTool?(name: string): void;
  provideContext?(context: { tools: IWebMcpToolDefinition[] }): void;
  clearContext?(): void;
}

interface Window {
  aistudio?: {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  };
  ai?: IChromeBuiltInAiNamespace;
  LanguageModel?: IChromeBuiltInAiLanguageModelFactory;
}

interface Navigator {
  ai?: IChromeBuiltInAiNamespace;
  modelContext?: IWebMcpModelContext;
}

interface Document {
  modelContext?: IWebMcpModelContext;
}

declare namespace NodeJS {
  interface ProcessEnv {
    GEMINI_API_KEY: string;
  }
}
