import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/services_providers.dart';
import '../services/skeptical_epistemology_service.dart';

class SkepticalEpistemologyCardWidget extends ConsumerStatefulWidget {
  const SkepticalEpistemologyCardWidget({super.key});

  @override
  ConsumerState<SkepticalEpistemologyCardWidget> createState() => _SkepticalEpistemologyCardWidgetState();
}

class _SkepticalEpistemologyCardWidgetState extends ConsumerState<SkepticalEpistemologyCardWidget> {
  int _selectedOptionIndex = -1;
  bool _submitted = false;

  final _sampleChallenge = const SocraticChallenge(
    id: 'socratic-01',
    lensName: 'Evidence Literacy',
    question: 'A clinical study reports p = 0.04. What does this outcome mathematically demonstrate under Popperian falsification?',
    options: [
      'There is a 96% probability that the medical treatment is effective',
      'If the null hypothesis (H0) were true, there is a 4% chance of observing data this extreme',
      'The clinical trial result will replicate 96% of the time in broad populations',
      'The study confirms a direct causal relationship between intervention and outcome'
    ],
    correctIndex: 1,
    explanation: 'A p-value measures probability under H0. p = 0.04 allows rejection of H0 at alpha = 0.05, but does NOT measure effect size, replication probability, or direct causation.',
    difficulty: 'critical',
    epistemicTag: 'P-Value Falsification',
  );

  @override
  Widget build(BuildContext context) {
    final service = ref.watch(skepticalEpistemologyProvider);
    final eval = service.evaluateNullHypothesis(
      metricName: 'Systemic Inflammatory Burden Index',
      observedValue: 'SIBI 68',
      pValue: 0.012,
      nullHypothesisH0: 'SIBI elevation equals population baseline mean',
    );

    final cochrane = service.assessCochraneRiskOfBias(
      citationId: 'JCP-2025-PARO-091',
      randomizationBias: CochraneRiskOfBiasLevel.lowRisk,
      deviationFromInterventionBias: CochraneRiskOfBiasLevel.lowRisk,
      missingDataBias: CochraneRiskOfBiasLevel.lowRisk,
      measurementBias: CochraneRiskOfBiasLevel.lowRisk,
    );

    return ListenableBuilder(
      listenable: service,
      builder: (context, _) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Expanded(
                    child: Row(
                      children: [
                        Icon(Icons.psychology, color: Color(0xFF7C3AED), size: 20),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'EPISTEMIC FALSIFICATION & ROB 2',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF1F2937)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3E8FF),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFDDD6FE)),
                    ),
                    child: Text(
                      'H0 p=${eval.pValue.toStringAsFixed(3)}',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B21A8)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Popperian H0 & Cochrane RoB Badges
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  Chip(
                    avatar: Icon(eval.isFalsified ? Icons.check_circle : Icons.warning, size: 14, color: eval.isFalsified ? Colors.green : Colors.amber),
                    label: Text(
                      eval.isFalsified ? 'H0 Falsified (p < 0.05)' : 'H0 Retained',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    backgroundColor: eval.isFalsified ? const Color(0xFFF0FDF4) : const Color(0xFFFFFBEB),
                  ),
                  Chip(
                    avatar: const Icon(Icons.verified, size: 14, color: Color(0xFF7C3AED)),
                    label: Text(
                      'RoB 2: ${cochrane.overallRiskOfBias.label}',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF5B21B6)),
                    ),
                    backgroundColor: const Color(0xFFF3E8FF),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Socratic Challenge Question Box
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text('SOCRATIC EVIDENCE CHALLENGE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.purple.shade700, letterSpacing: 0.8), overflow: TextOverflow.ellipsis)),
                        const SizedBox(width: 8),
                        Text(_sampleChallenge.difficulty.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _sampleChallenge.question,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF1F2937)),
                    ),
                    const SizedBox(height: 8),

                    // Options List
                    ...List.generate(_sampleChallenge.options.length, (idx) {
                      final option = _sampleChallenge.options[idx];
                      final isSelected = _selectedOptionIndex == idx;
                      final isCorrect = idx == _sampleChallenge.correctIndex;

                      Color tileBg = Colors.white;
                      BorderSide border = const BorderSide(color: Color(0xFFE5E7EB));

                      if (_submitted) {
                        if (isCorrect) {
                          tileBg = const Color(0xFFF0FDF4);
                          border = const BorderSide(color: Color(0xFF86EFAC));
                        } else if (isSelected) {
                          tileBg = const Color(0xFFFEF2F2);
                          border = const BorderSide(color: Color(0xFFFCA5A5));
                        }
                      } else if (isSelected) {
                        tileBg = const Color(0xFFF3E8FF);
                        border = const BorderSide(color: Color(0xFFC084FC));
                      }

                      return InkWell(
                        onTap: _submitted ? null : () => setState(() => _selectedOptionIndex = idx),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: tileBg,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.fromBorderSide(border),
                          ),
                          child: Row(
                            children: [
                              Text('${String.fromCharCode(65 + idx)}.', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              const SizedBox(width: 8),
                              Expanded(child: Text(option, style: const TextStyle(fontSize: 10, color: Color(0xFF374151)))),
                            ],
                          ),
                        ),
                      );
                    }),

                    const SizedBox(height: 8),
                    if (!_submitted)
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton(
                          onPressed: _selectedOptionIndex == -1
                              ? null
                              : () {
                                  setState(() => _submitted = true);
                                  service.recordSocraticAnswer(_sampleChallenge, _selectedOptionIndex);
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C3AED),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: const Text('Submit Challenge', style: TextStyle(fontSize: 11, color: Colors.white)),
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Text(
                          _sampleChallenge.explanation,
                          style: const TextStyle(fontSize: 10, color: Color(0xFF166534)),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
