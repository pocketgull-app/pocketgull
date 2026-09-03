import { describe, it, expect, beforeEach } from 'vitest';
import { ProtacContextScrubberService, IContextMessage } from './protac-context-scrubber.service';

describe('ProtacContextScrubberService', () => {
  let service: ProtacContextScrubberService;

  beforeEach(() => {
    service = new ProtacContextScrubberService();
  });

  describe('Prompt Hook Effect Evaluation', () => {
    it('should calculate low Hook effect risk when prompt density is optimal', () => {
      const result = service.evaluatePromptHookEffect('You are a clinical AI.', 300);
      expect(result.hookEffectRisk).toBe(false);
      expect(result.saturationFactor).toBeLessThan(1.45);
    });

    it('should flag Hook effect risk when prompt density is excessively saturated', () => {
      const massivePrompt = 'A'.repeat(6000); // ~1500 tokens
      const result = service.evaluatePromptHookEffect(massivePrompt, 500);
      expect(result.hookEffectRisk).toBe(true);
      expect(result.saturationFactor).toBeGreaterThan(1.45);
    });
  });

  describe('Catalytic Context Scrubbing', () => {
    it('should scrub internal thinking blocks and verbose tables while protecting ISMP dosages', () => {
      const history: IContextMessage[] = [
        {
          role: 'user',
          content: 'What is the dosage for Lisinopril?'
        },
        {
          role: 'assistant',
          content: '[THINKING]Checking FDA label and renal creatinine clearance...[/THINKING] Prescribe Lisinopril 10 mg PO daily. Patient is allergic to Penicillin.'
        },
        {
          role: 'user',
          content: 'Can you show me a detailed table of lab trends?'
        },
        {
          role: 'assistant',
          content: '| Parameter | Value | Reference |\n|:--- |:--- |:--- |\n| SBP | 134 mmHg | <120 |\n| HR | 76 bpm | 60-100 |\n| Glucose | 110 mg/dL | 70-99 |\n' + 'Filler note text '.repeat(25)
        },
        {
          role: 'user',
          content: 'How is the heart rate today?'
        },
        {
          role: 'assistant',
          content: 'Heart rate is stable at 72 bpm.'
        }
      ];

      const result = service.catalyticScrub(history, 'System directive', 1);

      expect(result.originalTokens).toBeGreaterThan(result.scrubbedTokens);
      expect(result.tokensScrubbed).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeLessThan(1.0);
      expect(result.ubiquitinatedTracesCount).toBeGreaterThan(0);

      // Verify ISMP dosage Lisinopril 10 mg and allergy were preserved in scrubbed history
      const scrubbedText = result.scrubbedHistory.map(m => m.content).join(' ');
      expect(scrubbedText).toContain('Lisinopril 10 mg');
      expect(scrubbedText).toContain('allergic to Penicillin');
    });

    it('should preserve recent turns intact without degradation', () => {
      const history: IContextMessage[] = [
        { role: 'user', content: 'Turn 1' },
        { role: 'assistant', content: 'Response 1' },
        { role: 'user', content: 'Recent turn' },
        { role: 'assistant', content: 'Recent response' }
      ];

      const result = service.catalyticScrub(history, '', 1);
      const lastMsg = result.scrubbedHistory[result.scrubbedHistory.length - 1];
      expect(lastMsg.content).toBe('Recent response');
    });
  });
});
