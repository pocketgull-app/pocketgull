declare const GEMINI_API_KEY: string;

interface Window {
  aistudio: {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    GEMINI_API_KEY: string;
  }
}

declare module '@angular/elements' {
  export function createCustomElement(component: any, config?: any): any;
}

declare module '@genkit-ai/google-genai' {
  export function googleAI(config?: any): any;
}

