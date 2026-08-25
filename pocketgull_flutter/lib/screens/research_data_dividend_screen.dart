/// Accessible WCAG AAA Research Data Dividend Screen for Flutter Companion App.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/research_consent_provider.dart';

class ResearchDataDividendScreen extends ConsumerWidget {
  const ResearchDataDividendScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(researchConsentProvider);
    final notifier = ref.read(researchConsentProvider.notifier);

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF18181B),
        title: const Text(
          '🧬 Research Data Dividend',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              state.isStreamingTelemetry
                  ? Icons.sensors
                  : Icons.sensors_off,
              color: state.isStreamingTelemetry
                  ? const Color(0xFF14B8A6)
                  : Colors.grey,
            ),
            tooltip: 'Toggle Encrypted Biosignal Stream',
            onPressed: () => notifier.toggleTelemetryStream(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Balance Card
            Container(
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                color: const Color(0xFF18181B),
                borderRadius: BorderRadius.circular(16.0),
                border: Border.all(color: const Color(0xFF27272A)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'AVAILABLE DIVIDEND BALANCE',
                    style: TextStyle(
                      color: Color(0xFFA1A1AA),
                      fontSize: 12,
                      letterSpacing: 1.0,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$${state.availableBalanceUsd.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Color(0xFF2DD4BF),
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          fontFeatures: [FontFeature.tabularFigures()],
                        ),
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0D9488),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(120, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Icons.account_balance_wallet, size: 18),
                        label: const Text('Cash Out'),
                        onPressed: state.availableBalanceUsd > 0
                            ? () {
                                notifier.cashOutBalance();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Stripe Connect payout transfer initiated!'),
                                    backgroundColor: Color(0xFF0D9488),
                                  ),
                                );
                              }
                            : null,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Lifetime Earnings: \$${state.lifetimeEarningsUsd.toStringAsFixed(2)} • 85% Patient Revenue Share',
                    style: const TextStyle(
                      color: Color(0xFF71717A),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Ethical Precedent Banner
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: const Color(0xFF134E4A).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12.0),
                border: Border.all(color: const Color(0xFF0D9488).withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.verified_user, color: Color(0xFF2DD4BF), size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Governed by NIH "All of Us" and LunaDNA Public Benefit Standards. All shared research vectors are HIPAA Safe Harbor de-identified.',
                      style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 13, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Cohort Switchboard
            const Text(
              'ACTIVE DISEASE RESEARCH COHORTS',
              style: TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 13,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 12),

            ...state.cohorts.map((cohort) {
              return Card(
                color: const Color(0xFF18181B),
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: cohort.isEnrolled
                        ? const Color(0xFF0D9488)
                        : const Color(0xFF27272A),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              cohort.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Switch(
                            value: cohort.isEnrolled,
                            activeThumbColor: const Color(0xFF2DD4BF),
                            onChanged: (_) =>
                                notifier.toggleCohortEnrollment(cohort.id),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cohort.description,
                        style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF042F2E),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '+\$${cohort.compensationPerQueryUsd.toStringAsFixed(2)} / query',
                              style: const TextStyle(
                                color: Color(0xFF2DD4BF),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'k-Anonymity: ${cohort.kAnonymityScore}',
                            style: const TextStyle(
                              color: Color(0xFF71717A),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
