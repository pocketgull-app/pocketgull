import { Injectable, signal, inject } from '@angular/core';
import { IntelligenceProviderToken } from './ai/intelligence.provider.token';

export interface InsightNode {
  id: string;
  title: string;
  content: string;
  type: 'Urgent Signal' | 'Action Item' | 'Context' | 'Unknown';
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class KnowledgeSynthesisService {
  readonly isProcessing = signal(false);
  readonly hasSynthesizedData = signal(false);
  readonly insights = signal<InsightNode[]>([]);
  readonly error = signal<string | null>(null);

  private intelligenceProvider = inject(IntelligenceProviderToken);

  async synthesize(inputText: string) {
    if (!inputText.trim()) return;
    
    this.isProcessing.set(true);
    this.error.set(null);
    this.hasSynthesizedData.set(false);

    try {
      const data = await this.intelligenceProvider.synthesizeKnowledge(inputText);
      
      this.insights.set(data || []);
      
      this.hasSynthesizedData.set(true);
    } catch (e: any) {
      this.error.set('Failed to synthesize knowledge. Please try again.');
      console.error(e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  reset() {
    this.isProcessing.set(false);
    this.hasSynthesizedData.set(false);
    this.insights.set([]);
    this.error.set(null);
  }
}
