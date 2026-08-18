import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

/// Service handling native biometric authentication (FaceID, TouchID, Android Fingerprint/Biometrics)
class BiometricAuthService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<Map<String, dynamic>> checkBiometricsAvailability() async {
    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _auth.isDeviceSupported();
      final List<BiometricType> availableBiometrics = await _auth.getAvailableBiometrics();

      return {
        'available': canAuthenticate,
        'types': availableBiometrics.map((e) => e.name).toList(),
      };
    } on PlatformException catch (e) {
      return {
        'available': false,
        'types': <String>[],
        'error': e.message,
      };
    } catch (e) {
      return {
        'available': false,
        'types': <String>[],
        'error': e.toString(),
      };
    }
  }

  Future<Map<String, dynamic>> authenticate({String reason = 'Authenticate to access clinical records'}) async {
    try {
      final bool authenticated = await _auth.authenticate(
        localizedReason: reason,
      );

      return {
        'authenticated': authenticated,
      };
    } on PlatformException catch (e) {
      return {
        'authenticated': false,
        'error': e.message,
        'code': e.code,
      };
    } catch (e) {
      return {
        'authenticated': false,
        'error': e.toString(),
      };
    }
  }
}
