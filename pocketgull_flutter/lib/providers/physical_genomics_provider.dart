import 'package:equatable/equatable.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/physical_genomics_model.dart';
import '../services/physical_genomics_mobile_service.dart';
import '../services/health_connect_bridge_service.dart';

/// Riverpod Physical Genomics State & Notifier (Flutter Companion)

class PhysicalGenomicsUiState extends Equatable {
  final PhysicalGenomicsRequest request;
  final AsyncValue<PhysicalGenomicsPrediction> prediction;
  final String activeParadigm;
  final bool isDualView;
  final String comparisonTarget;

  const PhysicalGenomicsUiState({
    this.request = const PhysicalGenomicsRequest(),
    this.prediction = const AsyncValue.loading(),
    this.activeParadigm = 'chromatin',
    this.isDualView = false,
    this.comparisonTarget = 'MUTANT_PATHOLOGY',
  });

  PhysicalGenomicsUiState copyWith({
    PhysicalGenomicsRequest? request,
    AsyncValue<PhysicalGenomicsPrediction>? prediction,
    String? activeParadigm,
    bool? isDualView,
    String? comparisonTarget,
  }) {
    return PhysicalGenomicsUiState(
      request: request ?? this.request,
      prediction: prediction ?? this.prediction,
      activeParadigm: activeParadigm ?? this.activeParadigm,
      isDualView: isDualView ?? this.isDualView,
      comparisonTarget: comparisonTarget ?? this.comparisonTarget,
    );
  }

  @override
  List<Object?> get props => [
    request,
    prediction,
    activeParadigm,
    isDualView,
    comparisonTarget,
  ];
}

class PhysicalGenomicsNotifier extends StateNotifier<PhysicalGenomicsUiState> {
  final PhysicalGenomicsMobileService _service;

  PhysicalGenomicsNotifier(this._service) : super(const PhysicalGenomicsUiState()) {
    evaluatePrediction();
  }

  Future<void> evaluatePrediction() async {
    state = state.copyWith(prediction: const AsyncValue.loading());
    try {
      final result = await _service.evaluatePhysicalGenomics(state.request);
      if (!mounted) return;
      state = state.copyWith(prediction: AsyncValue.data(result));
    } catch (e, st) {
      if (!mounted) return;
      state = state.copyWith(prediction: AsyncValue.error(e, st));
    }
  }

  void setActiveParadigm(String paradigm) {
    state = state.copyWith(activeParadigm: paradigm);
  }

  void toggleDualView() {
    state = state.copyWith(isDualView: !state.isDualView);
  }

  void setComparisonTarget(String target) {
    state = state.copyWith(comparisonTarget: target);
  }

  void updateParameters({
    double? ecmStiffnessKpa,
    double? actinTensionNn,
    String? epigeneticState,
    double? med1ConcUm,
    double? brd4ConcUm,
    bool? hasCtcfMutation,
    String? crisprGuideRna,
    String? crisprTargetDna,
  }) {
    final updatedReq = state.request.copyWith(
      ecmStiffnessKpa: ecmStiffnessKpa,
      actinTensionNn: actinTensionNn,
      epigeneticState: epigeneticState,
      med1ConcUm: med1ConcUm,
      brd4ConcUm: brd4ConcUm,
      hasCtcfMutation: hasCtcfMutation,
      crisprGuideRna: crisprGuideRna,
      crisprTargetDna: crisprTargetDna,
    );
    state = state.copyWith(request: updatedReq);
    evaluatePrediction();
  }

  /// Couples Wearable Health Connect Telemetry to Cellular Biophysics
  void synchronizeWithHealthConnect(HealthConnectBiometrics biometrics) {
    final tension = biometrics.biomechanicalLoadingScore;
    final ecmStiffness = 8.5 * (biometrics.restingHeartRateBpm / 60.0).clamp(0.8, 1.4);

    updateParameters(
      actinTensionNn: tension,
      ecmStiffnessKpa: double.parse(ecmStiffness.toStringAsFixed(2)),
    );
  }
}

final physicalGenomicsServiceProvider = Provider<PhysicalGenomicsMobileService>((ref) {
  return PhysicalGenomicsMobileService();
});

final physicalGenomicsProvider =
    StateNotifierProvider<PhysicalGenomicsNotifier, PhysicalGenomicsUiState>((ref) {
  final service = ref.watch(physicalGenomicsServiceProvider);
  return PhysicalGenomicsNotifier(service);
});
