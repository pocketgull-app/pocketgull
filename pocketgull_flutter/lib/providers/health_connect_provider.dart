import 'package:equatable/equatable.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/health_connect_bridge_service.dart';

enum HealthConnectStatus {
  initial,
  loading,
  authorized,
  unauthorized,
  synced,
  error,
}

class HealthConnectState extends Equatable {
  final HealthConnectStatus status;
  final HealthConnectBiometrics? biometrics;
  final String? errorMessage;
  final bool isAvailable;

  const HealthConnectState({
    this.status = HealthConnectStatus.initial,
    this.biometrics,
    this.errorMessage,
    this.isAvailable = true,
  });

  HealthConnectState copyWith({
    HealthConnectStatus? status,
    HealthConnectBiometrics? biometrics,
    String? errorMessage,
    bool? isAvailable,
  }) {
    return HealthConnectState(
      status: status ?? this.status,
      biometrics: biometrics ?? this.biometrics,
      errorMessage: errorMessage ?? this.errorMessage,
      isAvailable: isAvailable ?? this.isAvailable,
    );
  }

  @override
  List<Object?> get props => [
    status,
    biometrics,
    errorMessage,
    isAvailable,
  ];
}

class HealthConnectNotifier extends StateNotifier<HealthConnectState> {
  final HealthConnectBridgeService _service;

  HealthConnectNotifier(this._service) : super(const HealthConnectState()) {
    initialize();
  }

  Future<void> initialize() async {
    state = state.copyWith(status: HealthConnectStatus.loading);
    try {
      final available = await _service.isHealthConnectAvailable();
      if (!mounted) return;
      if (!available) {
        state = state.copyWith(
          status: HealthConnectStatus.error,
          isAvailable: false,
          errorMessage: 'Health Connect is not available on this device.',
        );
        return;
      }

      final authorized = await _service.requestPermissions();
      if (!mounted) return;
      if (authorized) {
        final data = await _service.fetchBiometrics();
        if (!mounted) return;
        state = state.copyWith(
          status: HealthConnectStatus.synced,
          biometrics: data,
          isAvailable: true,
        );
      } else {
        state = state.copyWith(
          status: HealthConnectStatus.unauthorized,
          isAvailable: true,
        );
      }
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: HealthConnectStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> syncBiometrics() async {
    state = state.copyWith(status: HealthConnectStatus.loading);
    try {
      final data = await _service.fetchBiometrics();
      if (!mounted) return;
      state = state.copyWith(
        status: HealthConnectStatus.synced,
        biometrics: data,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: HealthConnectStatus.error,
        errorMessage: e.toString(),
      );
    }
  }
}

final healthConnectServiceProvider = Provider<HealthConnectBridgeService>((ref) {
  return HealthConnectBridgeService();
});

final healthConnectProvider = StateNotifierProvider<HealthConnectNotifier, HealthConnectState>((ref) {
  final service = ref.watch(healthConnectServiceProvider);
  return HealthConnectNotifier(service);
});
