import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/biometric_auth_service.dart';
import '../services/secure_storage_service.dart';
import '../services/healthkit_vitals_service.dart';
import 'bridge_messages.dart';

/// Central Controller for two-way communication between Angular Web Client and Flutter Host Shell
class NativeBridgeController {
  final WebViewController webViewController;
  final BiometricAuthService _biometrics = BiometricAuthService();
  final SecureStorageService _secureStorage = SecureStorageService();
  final HealthKitVitalsService _healthKit = HealthKitVitalsService();

  NativeBridgeController({required this.webViewController});

  /// Handles incoming JavaScript messages sent via `window.PocketGullNativeBridge.postMessage(...)`
  Future<void> handleMessage(JavaScriptMessage message) async {
    try {
      final request = NativeBridgeRequest.fromJsonString(message.message);
      final response = await _dispatchAction(request);
      await _sendResponse(response);
    } catch (e, stack) {
      debugPrint('[NativeBridge] Error handling message: $e\n$stack');
      final errorResponse = NativeBridgeResponse(
        id: 'unknown',
        success: false,
        error: e.toString(),
      );
      await _sendResponse(errorResponse);
    }
  }

  Future<NativeBridgeResponse> _dispatchAction(NativeBridgeRequest request) async {
    switch (request.action) {
      case NativeBridgeAction.getBiometricAuth:
        final reason = request.payload['reason']?.toString() ?? 'Authenticate to unlock clinical records';
        final result = await _biometrics.authenticate(reason: reason);
        return NativeBridgeResponse(
          id: request.id,
          success: result['authenticated'] == true,
          data: result,
          error: result['error'],
        );

      case NativeBridgeAction.getSecureToken:
        final key = request.payload['key']?.toString() ?? '';
        if (key.isEmpty) {
          return NativeBridgeResponse(id: request.id, success: false, error: 'Key cannot be empty');
        }
        final token = await _secureStorage.read(key);
        return NativeBridgeResponse(id: request.id, success: true, data: {'key': key, 'token': token});

      case NativeBridgeAction.setSecureToken:
        final key = request.payload['key']?.toString() ?? '';
        final value = request.payload['value']?.toString() ?? '';
        if (key.isEmpty) {
          return NativeBridgeResponse(id: request.id, success: false, error: 'Key cannot be empty');
        }
        await _secureStorage.write(key, value);
        return NativeBridgeResponse(id: request.id, success: true, data: {'key': key, 'stored': true});

      case NativeBridgeAction.deleteSecureToken:
        final key = request.payload['key']?.toString() ?? '';
        if (key.isNotEmpty) {
          await _secureStorage.delete(key);
        }
        return NativeBridgeResponse(id: request.id, success: true, data: {'key': key, 'deleted': true});

      case NativeBridgeAction.getHealthKitVitals:
        final days = (request.payload['days'] is int) ? request.payload['days'] as int : 1;
        final vitals = await _healthKit.getLatestVitals(days: days);
        return NativeBridgeResponse(id: request.id, success: true, data: vitals);

      case NativeBridgeAction.triggerHaptic:
        final type = request.payload['type']?.toString().toLowerCase() ?? 'light';
        _triggerHapticFeedback(type);
        return NativeBridgeResponse(id: request.id, success: true, data: {'haptic': type});

      case NativeBridgeAction.getDeviceTelemetry:
        final telemetry = {
          'platform': kIsWeb ? 'web' : Platform.operatingSystem,
          'isMobile': !kIsWeb && (Platform.isIOS || Platform.isAndroid),
          'clientVersion': '2.0.0 (Hybrid-Shell)',
          'timestamp': DateTime.now().toIso8601String(),
        };
        return NativeBridgeResponse(id: request.id, success: true, data: telemetry);

      case NativeBridgeAction.openExternalUrl:
        final urlStr = request.payload['url']?.toString() ?? '';
        final uri = Uri.tryParse(urlStr);
        if (uri != null && await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          return NativeBridgeResponse(id: request.id, success: true, data: {'launched': urlStr});
        }
        return NativeBridgeResponse(id: request.id, success: false, error: 'Invalid URL: $urlStr');

      case NativeBridgeAction.shareFhirRecord:
        // Trigger system clipboard / share for FHIR exports
        final content = request.payload['content']?.toString() ?? '';
        if (content.isNotEmpty) {
          await Clipboard.setData(ClipboardData(text: content));
        }
        return NativeBridgeResponse(id: request.id, success: true, data: {'shared': true});

      case NativeBridgeAction.unknown:
        return NativeBridgeResponse(
          id: request.id,
          success: false,
          error: 'Unrecognized action',
        );
    }
  }

  void _triggerHapticFeedback(String type) {
    switch (type) {
      case 'heavy':
        HapticFeedback.heavyImpact();
        break;
      case 'medium':
        HapticFeedback.mediumImpact();
        break;
      case 'selection':
        HapticFeedback.selectionClick();
        break;
      case 'vibrate':
        HapticFeedback.vibrate();
        break;
      case 'light':
      default:
        HapticFeedback.lightImpact();
        break;
    }
  }

  Future<void> _sendResponse(NativeBridgeResponse response) async {
    final jsonSafe = response.toJsonString();
    final jsCode = 'if (window.onPocketGullNativeResponse) { window.onPocketGullNativeResponse($jsonSafe); }';
    await webViewController.runJavaScript(jsCode);
  }
}
