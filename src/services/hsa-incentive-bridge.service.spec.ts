import '@angular/compiler';
import { expect } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { HsaIncentiveBridgeService } from './hsa-incentive-bridge.service';
import { ClinicalGameTheoryService } from './clinical-game-theory.service';
import { PatientStateService } from './patient-state.service';

describe('HsaIncentiveBridgeService Unit Suite', () => {
  let service: HsaIncentiveBridgeService;
  let gameTheory: ClinicalGameTheoryService;

  beforeEach(() => {
    gameTheory = new ClinicalGameTheoryService();
    const injector = Injector.create({
      providers: [
        { provide: ClinicalGameTheoryService, useValue: gameTheory },
        { provide: PatientStateService, useValue: null }
      ]
    });
    service = runInInjectionContext(injector, () => new HsaIncentiveBridgeService());
  });

  it('1. Initializes with active linked HSA card and historical transactions', () => {
    const card = service.linkedCard();
    expect(card.cardType).toBe('HSA');
    expect(card.currentHsaBalanceUsd).toBeGreaterThan(1000);
    expect(card.iiasCompliant).toBe(true);
    expect(service.transactions().length).toBeGreaterThanOrEqual(3);
  });

  it('2. Computes Stackelberg / Nash equilibrium r* for cardiometabolic condition', () => {
    const result = service.equilibriumResult();
    expect(result.optimalRebateSubsidyUsd).toBeGreaterThan(0);
    expect(result.patientStrategy.adherenceEffortPercent).toBeGreaterThanOrEqual(80);
    expect(result.payerStrategy.isNashEquilibrium).toBe(true);
  });

  it('3. Disburses adherence rebate directly to HSA balance and records transaction', () => {
    const initialBalance = service.linkedCard().currentHsaBalanceUsd;
    const initialTxs = service.transactions().length;

    const tx = service.disburseAdherenceRebate('MEDICATION_PDC', 25.00, 'Test Adherence Reward');
    expect(tx.amountUsd).toBe(25.00);
    expect(tx.transactionStatus).toBe('SETTLED');
    expect(service.linkedCard().currentHsaBalanceUsd).toBe(initialBalance + 25.00);
    expect(service.transactions().length).toBe(initialTxs + 1);
  });

  it('4. Updates card metadata when linking a new HSA card', () => {
    service.linkNewHsaCard('Optum Bank', 'HSA', '9912');
    expect(service.linkedCard().issuerName).toBe('Optum Bank');
    expect(service.linkedCard().maskedPan).toContain('9912');
  });
});
