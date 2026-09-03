/// Walkthrough Tour Service — guided onboarding flow.
///
/// Flutter parity with Angular `walkthrough-tour.service.ts` (148 lines).
/// Step-by-step spotlight tour that highlights key UI regions.
/// Uses overlay entries positioned relative to target GlobalKeys.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TourStep {
  final String targetId;
  final String title;
  final String body;
  final String position; // top, bottom, left, right

  const TourStep({
    required this.targetId,
    required this.title,
    required this.body,
    required this.position,
  });
}

class WalkthroughTourState {
  final int currentStep; // -1 = inactive
  final List<TourStep> steps;

  const WalkthroughTourState({
    this.currentStep = -1,
    this.steps = const [],
  });

  bool get isActive => currentStep >= 0;
  int get totalSteps => steps.length;
  TourStep? get activeStep =>
      isActive && currentStep < steps.length ? steps[currentStep] : null;

  WalkthroughTourState copyWith({int? currentStep, List<TourStep>? steps}) =>
      WalkthroughTourState(
        currentStep: currentStep ?? this.currentStep,
        steps: steps ?? this.steps,
      );
}

const _tourSeenKey = 'pg_tour_seen';

class WalkthroughTourNotifier extends Notifier<WalkthroughTourState> {
  @override
  WalkthroughTourState build() {
    return WalkthroughTourState(steps: _buildSteps());
  }

  List<TourStep> _buildSteps() {
    return const [
      TourStep(
        targetId: 'tour-body-chart',
        title: 'Every journey starts with the body.',
        body: 'Tap any region on the anatomical chart to focus our intelligence on a specific system.',
        position: 'right',
      ),
      TourStep(
        targetId: 'tour-patient-dropdown',
        title: 'Meet your patient.',
        body: 'The patient\'s story lives here — history, vitals, prior visits. Sentinel patients feature amber outlines for containment workflows.',
        position: 'bottom',
      ),
      TourStep(
        targetId: 'tour-intake-form',
        title: 'The intake is where the story begins.',
        body: 'Review or edit the patient\'s chief complaint, vitals, and conditions. Our intelligence engine analyzes every detail.',
        position: 'left',
      ),
      TourStep(
        targetId: 'tour-generate-btn',
        title: 'One tap. Five lenses. A complete care plan.',
        body: 'Press this button — Gemini synthesizes the full chart into a structured, multi-lens care plan.',
        position: 'bottom',
      ),
      TourStep(
        targetId: 'tour-lens-tabs',
        title: 'See the plan from every angle.',
        body: 'Each tab is a different clinical lens: Overview, Interventions, Nutrition, Monitoring, Patient Education.',
        position: 'bottom',
      ),
      TourStep(
        targetId: 'tour-report-node',
        title: 'Drill deeper and refine tasks.',
        body: 'Every recommendation is alive. Tap for Evidence Focus. Double-tap to cycle verification state.',
        position: 'left',
      ),
      TourStep(
        targetId: 'tour-epistemic-drawer',
        title: 'Challenge Before You Commit',
        body: 'Prevent confirmation bias: Review 3 orthogonal counter-hypotheses and perform bedside disconfirming exams before sealing your diagnostic assertion.',
        position: 'left',
      ),
      TourStep(
        targetId: 'tour-voice-assistant',
        title: 'Voice & Consult Assistant',
        body: 'Engage in real-time clinical chat. Ask questions, log feedback, or trigger hands-free dictation.',
        position: 'left',
      ),
      TourStep(
        targetId: 'tour-finalize-btn',
        title: 'When you\'re satisfied — commit it.',
        body: 'Archive the finalized plan. Adjust reading level for patient copy: simplified, dyslexia-friendly, or pediatric.',
        position: 'bottom',
      ),
    ];
  }

  Future<void> start() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(_tourSeenKey) == true) return;
    state = state.copyWith(currentStep: 0);
  }

  void forceStart() {
    state = state.copyWith(currentStep: 0);
  }

  void next() {
    if (!state.isActive) return;
    if (state.currentStep >= state.totalSteps - 1) {
      dismiss();
    } else {
      state = state.copyWith(currentStep: state.currentStep + 1);
    }
  }

  void prev() {
    if (state.currentStep > 0) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  Future<void> dismiss() async {
    state = state.copyWith(currentStep: -1);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_tourSeenKey, true);
  }
}

final walkthroughTourProvider =
    NotifierProvider<WalkthroughTourNotifier, WalkthroughTourState>(() {
  return WalkthroughTourNotifier();
});
