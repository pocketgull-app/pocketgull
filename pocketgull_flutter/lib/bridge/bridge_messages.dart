import 'dart:convert';

/// Actions supported by the Pocket-Gull Native JavaScript Bridge
enum NativeBridgeAction {
  getBiometricAuth('GET_BIOMETRIC_AUTH'),
  getSecureToken('GET_SECURE_TOKEN'),
  setSecureToken('SET_SECURE_TOKEN'),
  deleteSecureToken('DELETE_SECURE_TOKEN'),
  getHealthKitVitals('GET_HEALTHKIT_VITALS'),
  triggerHaptic('TRIGGER_HAPTIC'),
  getDeviceTelemetry('GET_DEVICE_TELEMETRY'),
  openExternalUrl('OPEN_EXTERNAL_URL'),
  shareFhirRecord('SHARE_FHIR_RECORD'),
  unknown('UNKNOWN');

  final String value;
  const NativeBridgeAction(this.value);

  static NativeBridgeAction fromString(String action) {
    return NativeBridgeAction.values.firstWhere(
      (e) => e.value.toUpperCase() == action.toUpperCase(),
      orElse: () => NativeBridgeAction.unknown,
    );
  }
}

/// Incoming request message envelope from Angular Web App
class NativeBridgeRequest {
  final String id;
  final NativeBridgeAction action;
  final Map<String, dynamic> payload;

  const NativeBridgeRequest({
    required this.id,
    required this.action,
    this.payload = const {},
  });

  factory NativeBridgeRequest.fromJsonString(String rawJson) {
    final decoded = jsonDecode(rawJson) as Map<String, dynamic>;
    return NativeBridgeRequest(
      id: decoded['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      action: NativeBridgeAction.fromString(decoded['action']?.toString() ?? ''),
      payload: (decoded['payload'] is Map<String, dynamic>)
          ? decoded['payload'] as Map<String, dynamic>
          : {},
    );
  }
}

/// Outgoing response message envelope sent back to Angular Web App
class NativeBridgeResponse {
  final String id;
  final bool success;
  final dynamic data;
  final String? error;

  const NativeBridgeResponse({
    required this.id,
    required this.success,
    this.data,
    this.error,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'success': success,
        if (data != null) 'data': data,
        if (error != null) 'error': error,
      };

  String toJsonString() => jsonEncode(toJson());
}
