/**
 * HSA / FSA Clinical Incentive & Game Theory Rebate Bridge
 *
 * Direct integration of Stackelberg / Nash equilibrium adherence rebates (r*)
 * with IRS §223(c)(2) and §213(d) qualified medical expense HSA/FSA debit cards.
 *
 * @module services/hsa-incentive-bridge.service
 */
import { Injectable, signal, computed, inject } from '@angular/core';
import { ClinicalGameTheoryService, IClinicalGameTheoryResult } from './clinical-game-theory.service';
import { PatientStateService } from './patient-state.service';

export interface IHsaCardDetails {
  cardId: string;
  cardType: 'HSA' | 'FSA' | 'HRA';
  issuerName: string; // e.g. "HealthEquity", "Optum Bank", "Fidelity HSA", "WEX"
  maskedPan: string; // e.g. "•••• •••• •••• 4821"
  cardholderName: string;
  expiry: string; // "12/28"
  currentHsaBalanceUsd: number;
  lifetimeRebatesEarnedUsd: number;
  iiasCompliant: boolean; // Inventory Information Approval System for IRS §223
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'LOCKED';
}

export interface IHsaRebateTransaction {
  id: string;
  timestamp: string;
  amountUsd: number;
  adherenceDomain: 'MEDICATION_PDC' | 'BP_HOMEOSTASIS' | 'ZONE2_ACTIVITY' | 'CHRONO_FASTING';
  ruleDescription: string;
  stackelbergSubsidyRateRStar: number;
  irsSubstantiationCode: string; // e.g. "IRS-213D-PREVENTIVE-RX"
  transactionStatus: 'SETTLED' | 'PENDING' | 'CLEARED_TO_HSA';
  fhirClaimResponseId: string;
}

@Injectable({
  providedIn: 'root'
})
export class HsaIncentiveBridgeService {
  private gameTheory = inject(ClinicalGameTheoryService);
  private patientState = inject(PatientStateService, { optional: true });

  // Active Linked Card Signal
  readonly linkedCard = signal<IHsaCardDetails>({
    cardId: 'HSA-CARD-7849',
    cardType: 'HSA',
    issuerName: 'HealthEquity / PocketGull Direct',
    maskedPan: '•••• •••• •••• 4821',
    cardholderName: 'Homo Sapiens (Member #PG-9082)',
    expiry: '09/29',
    currentHsaBalanceUsd: 1420.50,
    lifetimeRebatesEarnedUsd: 385.00,
    iiasCompliant: true,
    status: 'ACTIVE'
  });

  // Real-time Ledger of Stackelberg Rebates
  readonly transactions = signal<IHsaRebateTransaction[]>([
    {
      id: 'TX-HSA-8821',
      timestamp: '2026-08-20 08:30',
      amountUsd: 15.00,
      adherenceDomain: 'MEDICATION_PDC',
      ruleDescription: 'Morning Metformin & Lisinopril adherence verified via SMS bridge',
      stackelbergSubsidyRateRStar: 450.00,
      irsSubstantiationCode: 'IRS-213D-CHRONIC-PDC',
      transactionStatus: 'SETTLED',
      fhirClaimResponseId: 'claim-resp-8821'
    },
    {
      id: 'TX-HSA-8820',
      timestamp: '2026-08-19 18:00',
      amountUsd: 10.00,
      adherenceDomain: 'ZONE2_ACTIVITY',
      ruleDescription: 'Zone 2 aerobic biogenesis target reached (45 mins continuous)',
      stackelbergSubsidyRateRStar: 450.00,
      irsSubstantiationCode: 'IRS-223C-PREVENTIVE-WELLNESS',
      transactionStatus: 'SETTLED',
      fhirClaimResponseId: 'claim-resp-8820'
    },
    {
      id: 'TX-HSA-8819',
      timestamp: '2026-08-18 07:45',
      amountUsd: 20.00,
      adherenceDomain: 'BP_HOMEOSTASIS',
      ruleDescription: 'Blood pressure maintained in target optimal corridor (<125/82)',
      stackelbergSubsidyRateRStar: 450.00,
      irsSubstantiationCode: 'IRS-213D-VASCULAR-MONITOR',
      transactionStatus: 'SETTLED',
      fhirClaimResponseId: 'claim-resp-8819'
    }
  ]);

  // Dynamic game-theoretic calculation
  readonly annualCopayInput = signal<number>(480);
  readonly avoidedHospitalizationInput = signal<number>(12500);
  readonly effortFrictionInput = signal<number>(200);

  readonly equilibriumResult = computed<IClinicalGameTheoryResult>(() => {
    return this.gameTheory.calculateOptimalAdherenceIncentive({
      patientId: this.patientState?.asPatientSnapshot()?.id || 'P001',
      conditionName: 'Cardiometabolic & Vascular Optimization',
      annualCopayCostUsd: this.annualCopayInput(),
      estAnnualHospitalizationRiskUsd: this.avoidedHospitalizationInput(),
      patientEffortFrictionFactor: this.effortFrictionInput()
    });
  });

  readonly totalRebatesSettled = computed(() => {
    return this.transactions().reduce((acc, t) => acc + t.amountUsd, 0);
  });

  /**
   * Disburses an adherence milestone reward to the linked HSA card
   */
  public disburseAdherenceRebate(
    domain: IHsaRebateTransaction['adherenceDomain'],
    amount: number,
    description: string
  ): IHsaRebateTransaction {
    const txId = 'TX-HSA-' + Date.now().toString(36).toUpperCase();
    const rStar = this.equilibriumResult().optimalRebateSubsidyUsd;

    const newTx: IHsaRebateTransaction = {
      id: txId,
      timestamp: new Date().toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      amountUsd: amount,
      adherenceDomain: domain,
      ruleDescription: description,
      stackelbergSubsidyRateRStar: rStar,
      irsSubstantiationCode: 'IRS-213D-POCKETGULL-CDS',
      transactionStatus: 'SETTLED',
      fhirClaimResponseId: `claim-resp-${txId.toLowerCase()}`
    };

    // Update state signals
    this.transactions.update(txs => [newTx, ...txs]);
    this.linkedCard.update(c => ({
      ...c,
      currentHsaBalanceUsd: Math.round((c.currentHsaBalanceUsd + amount) * 100) / 100,
      lifetimeRebatesEarnedUsd: Math.round((c.lifetimeRebatesEarnedUsd + amount) * 100) / 100
    }));

    return newTx;
  }

  /**
   * Updates linked card PAN or Issuer
   */
  public linkNewHsaCard(issuer: string, cardType: 'HSA' | 'FSA' | 'HRA', last4: string): void {
    this.linkedCard.update(c => ({
      ...c,
      issuerName: issuer,
      cardType,
      maskedPan: `•••• •••• •••• ${last4}`,
      status: 'ACTIVE'
    }));
  }
}
