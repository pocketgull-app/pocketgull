import '@angular/compiler';
import { expect, vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { HsaIncentiveNetworkComponent } from './hsa-incentive-network.component';
import { HsaIncentiveBridgeService } from '../services/hsa-incentive-bridge.service';

describe('HsaIncentiveNetworkComponent Unit Suite', () => {
  let comp: HsaIncentiveNetworkComponent;
  let mockHsa: any;

  beforeEach(() => {
    mockHsa = {
      linkedCard: signal({
        cardId: 'HSA-CARD-7849',
        cardType: 'HSA',
        issuerName: 'HealthEquity',
        maskedPan: '•••• •••• •••• 4821',
        cardholderName: 'Homo Sapiens',
        expiry: '09/29',
        currentHsaBalanceUsd: 1420.50,
        lifetimeRebatesEarnedUsd: 385.00,
        iiasCompliant: true,
        status: 'ACTIVE'
      }),
      transactions: signal([
        {
          id: 'TX-HSA-8821',
          timestamp: '2026-08-20 08:30',
          amountUsd: 15.00,
          adherenceDomain: 'MEDICATION_PDC',
          ruleDescription: 'Morning Metformin',
          stackelbergSubsidyRateRStar: 450.00,
          irsSubstantiationCode: 'IRS-213D-CHRONIC-PDC',
          transactionStatus: 'SETTLED',
          fhirClaimResponseId: 'claim-resp-8821'
        }
      ]),
      totalRebatesSettled: signal(15.00),
      annualCopayInput: signal(480),
      avoidedHospitalizationInput: signal(12500),
      equilibriumResult: signal({
        optimalRebateSubsidyUsd: 450,
        targetPdcPercent: 80,
        patientStrategy: { adherenceEffortPercent: 85, netPatientUtilityUsd: 220 },
        payerStrategy: { netPayerSavingsUsd: 9600, isNashEquilibrium: true },
        gameTheoryDirective: 'NASH EQUILIBRIUM REACHED'
      }),
      disburseAdherenceRebate: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: HsaIncentiveBridgeService, useValue: mockHsa }
      ]
    });

    comp = runInInjectionContext(injector, () => new HsaIncentiveNetworkComponent());
  });

  it('1. Initializes cleanly with linked HSA card view', () => {
    expect(comp).toBeTruthy();
    expect(comp.hsa.linkedCard().cardType).toBe('HSA');
    expect(comp.hsa.linkedCard().currentHsaBalanceUsd).toBe(1420.50);
  });

  it('2. Disburses 1-click adherence rewards to HSA debit network', () => {
    comp.triggerAdherence('MEDICATION_PDC', 15.00, 'Morning Prescription Logged');
    expect(mockHsa.disburseAdherenceRebate).toHaveBeenCalledWith(
      'MEDICATION_PDC',
      15.00,
      'Morning Prescription Logged'
    );
  });
});
