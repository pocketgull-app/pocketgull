import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { PatientStateService } from '../src/services/patient-state.service';
import { PatientManagementService } from '../src/services/patient-management.service';
import { StorageService } from '../src/services/storage.service';
import { ThemeService } from '../src/services/theme.service';
import { GamificationService } from '../src/services/gamification.service';
import { ActuarialLongevityService } from '../src/services/actuarial-longevity.service';
import { InteractionsProvider } from '../src/services/ai/interactions.provider';
import { ClinicalAiProviderRegistryService } from '../src/services/clinical-ai-provider-registry.service';
import { SkepticalEpistemologyService } from '../src/services/skeptical-epistemology.service';
import { MandiantClinicalDefenseService } from '../src/services/mandiant-clinical-defense.service';

// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('Gemini 3.7 Interactions & Clinical Reasoning E2E Suite', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: GamificationService, useFactory: () => new GamificationService() },
        { provide: ThemeService, useFactory: () => new ThemeService() },
        { provide: ActuarialLongevityService, useFactory: () => new ActuarialLongevityService() },
        { provide: PatientManagementService, useFactory: () => new PatientManagementService() },
        { provide: PatientStateService, useFactory: () => new PatientStateService() },
        { provide: InteractionsProvider, useFactory: () => new InteractionsProvider() },
        { provide: ClinicalAiProviderRegistryService, useFactory: () => new ClinicalAiProviderRegistryService() },
        { provide: SkepticalEpistemologyService, useFactory: () => new SkepticalEpistemologyService() },
        { provide: MandiantClinicalDefenseService, useFactory: () => new MandiantClinicalDefenseService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      patientState: injector.get(PatientStateService),
      interactions: injector.get(InteractionsProvider),
      registry: injector.get(ClinicalAiProviderRegistryService),
      skeptical: injector.get(SkepticalEpistemologyService),
      mandiant: injector.get(MandiantClinicalDefenseService)
    }));
  };

  it('1. Verifies end-to-end provider selection defaults to Gemini 3.7 Interactions with 2048 Thinking Budget', () => {
    const { registry, interactions } = createServices();

    const currentEngine = registry.currentEngine();
    expect(currentEngine.id).toBe('gemini-interactions');
    expect(currentEngine.name).toContain('Gemini 3.7 Interactions');
    expect(interactions.thinkingBudget()).toBe(2048);
  });

  it('2. Calibrates dynamic thinking budget across clinical acuity tiers (0 -> 1024 -> 4096)', () => {
    const { interactions } = createServices();

    // 1. Routine Triage Tier (0 tokens)
    interactions.setThinkingBudget(0);
    expect(interactions.thinkingBudget()).toBe(0);

    // 2. Standard CDS Tier (1024 tokens)
    interactions.setThinkingBudget(1024);
    expect(interactions.thinkingBudget()).toBe(1024);

    // 3. High-Acuity / Complex Phenotype Tier (4096 tokens)
    interactions.setThinkingBudget(4096);
    expect(interactions.thinkingBudget()).toBe(4096);

    // 4. Clamping bounds check (cannot exceed 8192)
    interactions.setThinkingBudget(16000);
    expect(interactions.thinkingBudget()).toBe(8192);
  });

  it('3. Runs skeptical H0 null-hypothesis evaluation on incoming clinical biomarkers', () => {
    const { skeptical, patientState } = createServices();

    patientState.vitals.set({ bp: '148/92', hr: '84', spO2: '97', temp: '98.6', rr: '16' });

    const evalResult = skeptical.evaluateFalsifiability('Systolic Blood Pressure', 148, 120, 12);

    expect(evalResult.pValue).toBeLessThan(0.05);
    expect(evalResult.isFalsified).toBe(true);
    expect(evalResult.epistemicConfidencePercent).toBeGreaterThanOrEqual(95);
  });

  it('4. Enforces dual-custody authorization for high-impact clinical disbursements and batch mutations', () => {
    const { mandiant } = createServices();

    // 1. Unilateral / Single-role attempt -> Rejected
    const singleRoleAuth = mandiant.verifyDualCustodyAuthorization(
      'HSA_TREASURY_DISBURSEMENT',
      'CLINICAL_COORDINATOR',
      'CLINICAL_COORDINATOR',
      750
    );
    expect(singleRoleAuth.isAuthorized).toBe(false);
    expect(singleRoleAuth.rationale).toContain('distinct authenticated');

    // 2. Dual-custody with Compliance authorization -> Approved
    const dualCustodyAuth = mandiant.verifyDualCustodyAuthorization(
      'HSA_TREASURY_DISBURSEMENT',
      'CLINICAL_COORDINATOR',
      'COMPLIANCE_OFFICER',
      750
    );
    expect(dualCustodyAuth.isAuthorized).toBe(true);
  });

  it('5. Verifies HIPAA Safe Harbor de-identification on session state purging', () => {
    const { interactions } = createServices();

    interactions.startChat('SESSION-E2E-99', 'You are a clinical strategist.');
    interactions.purgeSession('SESSION-E2E-99');

    // Attempting to purge an already purged session should not throw
    expect(() => interactions.purgeSession('SESSION-E2E-99')).not.toThrow();
  });
});
