/// Riverpod State Management for Patient Research Consent & Data Dividends.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/research_cohort.dart';

class ResearchConsentState {
  final double lifetimeEarningsUsd;
  final double availableBalanceUsd;
  final List<ResearchCohort> cohorts;
  final List<DividendLedgerEntry> ledger;
  final bool isAuthorized;
  final bool isStreamingTelemetry;

  const ResearchConsentState({
    this.lifetimeEarningsUsd = 125.00,
    this.availableBalanceUsd = 75.00,
    this.cohorts = const [],
    this.ledger = const [],
    this.isAuthorized = true,
    this.isStreamingTelemetry = true,
  });

  ResearchConsentState copyWith({
    double? lifetimeEarningsUsd,
    double? availableBalanceUsd,
    List<ResearchCohort>? cohorts,
    List<DividendLedgerEntry>? ledger,
    bool? isAuthorized,
    bool? isStreamingTelemetry,
  }) {
    return ResearchConsentState(
      lifetimeEarningsUsd: lifetimeEarningsUsd ?? this.lifetimeEarningsUsd,
      availableBalanceUsd: availableBalanceUsd ?? this.availableBalanceUsd,
      cohorts: cohorts ?? this.cohorts,
      ledger: ledger ?? this.ledger,
      isAuthorized: isAuthorized ?? this.isAuthorized,
      isStreamingTelemetry: isStreamingTelemetry ?? this.isStreamingTelemetry,
    );
  }
}

class ResearchConsentNotifier extends StateNotifier<ResearchConsentState> {
  ResearchConsentNotifier() : super(const ResearchConsentState()) {
    _loadInitialCohorts();
  }

  void _loadInitialCohorts() {
    final initialCohorts = [
      const ResearchCohort(
        id: 'cohort_diabetes_cgm',
        title: 'Type 2 Diabetes & Glucose Dynamics',
        category: 'Metabolic',
        description: 'Longitudinal continuous glucose monitoring (CGM) & HbA1c trajectory.',
        compensationPerQueryUsd: 25.00,
        participantCount: 1420,
        kAnonymityScore: 12,
        ethicalPrecedent: 'nih_all_of_us',
        isEnrolled: true,
      ),
      const ResearchCohort(
        id: 'cohort_oncology_biomarkers',
        title: 'Oncology Epigenetic Biomarkers',
        category: 'Genomics',
        description: 'De-identified genomic variant crosswalks & longevity trajectories.',
        compensationPerQueryUsd: 50.00,
        participantCount: 680,
        kAnonymityScore: 8,
        ethicalPrecedent: 'ciitizen_rare_disease',
        isEnrolled: true,
      ),
      const ResearchCohort(
        id: 'cohort_long_covid_autonomic',
        title: 'Long-COVID & Autonomic HRV',
        category: 'Autonomic',
        description: 'Post-viral dysautonomia & orthostatic heart rate variability telemetry.',
        compensationPerQueryUsd: 30.00,
        participantCount: 950,
        kAnonymityScore: 15,
        ethicalPrecedent: 'luna_dna_public_benefit',
        isEnrolled: false,
      ),
    ];

    state = state.copyWith(cohorts: initialCohorts);
  }

  void toggleCohortEnrollment(String cohortId) {
    final updated = state.cohorts.map((c) {
      if (c.id == cohortId) {
        return c.copyWith(isEnrolled: !c.isEnrolled);
      }
      return c;
    }).toList();

    state = state.copyWith(cohorts: updated);
  }

  void cashOutBalance() {
    if (state.availableBalanceUsd <= 0) return;

    final entry = DividendLedgerEntry(
      id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
      cohortTitle: 'Stripe Express Payout Transfer',
      amountUsd: state.availableBalanceUsd,
      timestamp: DateTime.now(),
      transactionHash: 'tr_strp_${DateTime.now().millisecondsSinceEpoch}',
    );

    state = state.copyWith(
      availableBalanceUsd: 0.0,
      ledger: [entry, ...state.ledger],
    );
  }

  void toggleTelemetryStream() {
    state = state.copyWith(isStreamingTelemetry: !state.isStreamingTelemetry);
  }
}

final researchConsentProvider =
    StateNotifierProvider<ResearchConsentNotifier, ResearchConsentState>((ref) {
  return ResearchConsentNotifier();
});
