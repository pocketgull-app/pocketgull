import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/epistemic_models.dart';

/// Active clinical state for the Anti-Confirmation Bias & Socratic Falsification Envelope.
class EpistemicAssertionState {
  final GroundedClinicalAssertion assertion;
  final Set<String> completedExams;
  final bool isAttested;
  final String? attestationDigest;

  const EpistemicAssertionState({
    required this.assertion,
    this.completedExams = const {},
    this.isAttested = false,
    this.attestationDigest,
  });

  /// True if every required bedside physical exam maneuver has been completed.
  bool get allExamsCompleted =>
      assertion.disconfirmingPhysicalExams.isNotEmpty &&
      completedExams.length >= assertion.disconfirmingPhysicalExams.length;

  /// Progress ratio (0.0 to 1.0) of completed disconfirming tests.
  double get completionRatio => assertion.disconfirmingPhysicalExams.isEmpty
      ? 0.0
      : (completedExams.length / assertion.disconfirmingPhysicalExams.length).clamp(0.0, 1.0);

  EpistemicAssertionState copyWith({
    GroundedClinicalAssertion? assertion,
    Set<String>? completedExams,
    bool? isAttested,
    String? attestationDigest,
  }) {
    return EpistemicAssertionState(
      assertion: assertion ?? this.assertion,
      completedExams: completedExams ?? this.completedExams,
      isAttested: isAttested ?? this.isAttested,
      attestationDigest: attestationDigest ?? this.attestationDigest,
    );
  }
}

/// StateNotifier controlling interactive bedside falsification and Part 11 digital seals.
class EpistemicAssertionNotifier extends StateNotifier<EpistemicAssertionState> {
  EpistemicAssertionNotifier()
      : super(EpistemicAssertionState(assertion: GroundedClinicalAssertion.defaultForPatient1()));

  /// Toggles completion status of a specific disconfirming bedside physical exam.
  void toggleExam(String exam) {
    final next = Set<String>.from(state.completedExams);
    if (next.contains(exam)) {
      next.remove(exam);
    } else {
      next.add(exam);
    }
    state = state.copyWith(
      completedExams: next,
      isAttested: false, // Reset attestation if exams change
      attestationDigest: null,
    );
  }

  /// Digitally attests that all 3 disconfirming tests were completed, producing a SHA-256 seal.
  void attestClinicalFalsification(String clinicianOrPatient) {
    if (!state.allExamsCompleted) return;

    final timestamp = DateTime.now().toUtc().toIso8601String();
    final raw =
        '${state.assertion.hypothesis}|$clinicianOrPatient|$timestamp|${state.completedExams.join(',')}';
    final digest = sha256.convert(utf8.encode(raw)).toString();

    state = state.copyWith(
      isAttested: true,
      attestationDigest: digest.substring(0, 16).toUpperCase(),
    );
  }

  /// Resets back to the clean Patient 1 default state.
  void reset() {
    state = EpistemicAssertionState(assertion: GroundedClinicalAssertion.defaultForPatient1());
  }
}

/// Global provider for EpistemicAssertionNotifier.
final epistemicAssertionProvider =
    StateNotifierProvider<EpistemicAssertionNotifier, EpistemicAssertionState>((ref) {
  return EpistemicAssertionNotifier();
});
