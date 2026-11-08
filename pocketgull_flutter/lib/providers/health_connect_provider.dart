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

class HealthConnectNotifier extends Notifier<HealthConnectState> {
  late HealthConnectBridgeService _service;
  bool _disposed = false;

  @override
  HealthConnectState build() {
    _service = ref.watch(healthConnectServiceProvider);
    _disposed = false;
    ref.onDispose(() {
      _disposed = true;
    });
    Future.microtask(initialize);
    return const HealthConnectState();
  }

  Future<void> initialize() async {
    if (_disposed) return;
    state = state.copyWith(status: HealthConnectStatus.loading);
    try {
      final available = await _service.isHealthConnectAvailable();
      if (_disposed) return;
      if (!available) {
        state = state.copyWith(
          status: HealthConnectStatus.error,
          isAvailable: false,
          errorMessage: 'Health Connect is not available on this device.',
        );
        return;
      }

      final authorized = await _service.requestPermissions();
      if (_disposed) return;
      if (authorized) {
        final data = await _service.fetchBiometrics();
        if (_disposed) return;
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
      if (_disposed) return;
      state = state.copyWith(
        status: HealthConnectStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> syncBiometrics() async {
    if (_disposed) return;
    state = state.copyWith(status: HealthConnectStatus.loading);
    try {
      final data = await _service.fetchBiometrics();
      if (_disposed) return;
      state = state.copyWith(
        status: HealthConnectStatus.synced,
        biometrics: data,
      );
    } catch (e) {
      if (_disposed) return;
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

final healthConnectProvider = NotifierProvider<HealthConnectNotifier, HealthConnectState>(
  HealthConnectNotifier.new,
);
