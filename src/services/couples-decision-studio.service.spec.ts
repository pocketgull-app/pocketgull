import { describe, it, expect, beforeEach } from 'vitest';
import { CouplesDecisionStudioService, IValuesDimension } from './couples-decision-studio.service';

describe('CouplesDecisionStudioService', () => {
  let service: CouplesDecisionStudioService;

  beforeEach(() => {
    service = new CouplesDecisionStudioService();
  });

  describe('getDefaultValuesDimensions', () => {
    it('should return 5 core values dimensions with default scores and weights', () => {
      const dimensions = service.getDefaultValuesDimensions();
      expect(dimensions.length).toBe(5);
      expect(dimensions.map(d => d.id)).toContain('autonomic_stability');
      expect(dimensions.map(d => d.id)).toContain('financial_runway');
      expect(dimensions.map(d => d.id)).toContain('relational_intimacy');
    });
  });

  describe('evaluateValuesAlignment', () => {
    it('should report harmonious alignment when partner scores are identical', () => {
      const dimensions: IValuesDimension[] = [
        { id: '1', name: 'Dimension 1', description: '', scorePartnerA: 8, scorePartnerB: 8, weight: 2 },
        { id: '2', name: 'Dimension 2', description: '', scorePartnerA: 7, scorePartnerB: 7, weight: 1 }
      ];

      const result = service.evaluateValuesAlignment(dimensions);
      expect(result.overallAlignmentPercentage).toBe(100);
      expect(result.divergenceLevel).toBe('HARMONIOUS');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect high friction risk when there is a major gap in a high-weight dimension', () => {
      const dimensions: IValuesDimension[] = [
        { id: '1', name: 'Financial Buffer', description: '', scorePartnerA: 10, scorePartnerB: 2, weight: 3 },
        { id: '2', name: 'Autonomy', description: '', scorePartnerA: 5, scorePartnerB: 5, weight: 1 }
      ];

      const result = service.evaluateValuesAlignment(dimensions);
      expect(result.divergenceLevel).toBe('HIGH_FRICTION_RISK');
      expect(result.highestTensionDimension).toBe('Financial Buffer');
      expect(result.overallAlignmentPercentage).toBeLessThan(70);
      expect(result.recommendations[0]).toContain('Critical divergence');
    });

    it('should handle empty dimension lists gracefully', () => {
      const result = service.evaluateValuesAlignment([]);
      expect(result.overallAlignmentPercentage).toBe(100);
      expect(result.divergenceLevel).toBe('HARMONIOUS');
    });
  });

  describe('evaluateReversibilityGate', () => {
    it('should mandate Type 1 One-Way Door and 48-hour cooling off for irreversible or high-cost decisions', () => {
      const gate = service.evaluateReversibilityGate({
        category: 'RELOCATION_HOUSING',
        isEasilyReversible: false,
        financialCostThresholdExceeded: true,
        isPartnerHungryOrTired: false,
        isHeartRateElevatedOrSympathetic: false
      });

      expect(gate.doorType).toBe('TYPE_1_ONE_WAY_DOOR');
      expect(gate.coolingOffPeriodHours).toBe(48);
      expect(gate.haltRuleCheckPassed).toBe(true);
      expect(gate.autonomicReadiness).toBe('READY_TO_DELIBERATE');
      expect(gate.safeToTestExperiment).toContain('Airbnb or short-term sublet');
    });

    it('should activate HALT cooldown when hunger, fatigue or elevated HR is present', () => {
      const gate = service.evaluateReversibilityGate({
        category: 'CAREER_PIVOT_EDUCATION',
        isEasilyReversible: true,
        financialCostThresholdExceeded: false,
        isPartnerHungryOrTired: true,
        isHeartRateElevatedOrSympathetic: true
      });

      expect(gate.haltRuleCheckPassed).toBe(false);
      expect(gate.autonomicReadiness).toBe('HALT_ACTIVATED_COOLDOWN_MANDATED');
      expect(gate.coolingOffPeriodHours).toBeGreaterThan(0);
      expect(gate.safeToTestExperiment).toContain('pilot project');
    });
  });

  describe('generatePreMortem', () => {
    it('should generate pre-mortem scenarios with root causes, contingency triggers, and circuit breakers', () => {
      const preMortem = service.generatePreMortem(
        'Relocating to Pacific Northwest',
        'RELOCATION_HOUSING',
        3
      );

      expect(preMortem.decisionTitle).toBe('Relocating to Pacific Northwest');
      expect(preMortem.projectedFutureYears).toBe(3);
      expect(preMortem.projectedFailureScenario).toContain('3 years from now');
      expect(preMortem.rootCauses.length).toBeGreaterThanOrEqual(2);
      expect(preMortem.contingencyTrigger).toBeDefined();
      expect(preMortem.circuitBreakerCondition).toBeDefined();
    });
  });

  describe('getDefaultFairPlayTasks', () => {
    it('should provide default household domains with CPE tracking', () => {
      const tasks = service.getDefaultFairPlayTasks();
      expect(tasks.length).toBeGreaterThanOrEqual(3);
      expect(tasks[0].conceptionOwner).toBeDefined();
      expect(tasks[0].planningOwner).toBeDefined();
      expect(tasks[0].executionOwner).toBeDefined();
    });
  });
});
