import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Encrypted persistent storage — Flutter parity with Angular `storage.service.ts`.
///
/// Uses Hive as the local persistence layer, with native AES-256 encryption
/// via keys stored securely in the platform's hardware Keystore/Keychain
/// via `flutter_secure_storage`.
class StorageService {
  static const String _boxName = 'pocketgull_vault';
  static const String _rosterBoxName = 'pocketgull_roster';
  static const String _secureKeyName = 'pocketgull_db_key';

  Box<Map<dynamic, dynamic>>? _box;
  Box<Map<dynamic, dynamic>>? _rosterBox;

  /// Initialize Hive storage with native AES encryption. Call once at app startup.
  Future<void> init() async {
    await Hive.initFlutter();

    const secureStorage = FlutterSecureStorage();
    // Retrieve or generate the AES database key
    final containsEncryptionKey = await secureStorage.containsKey(key: _secureKeyName);
    List<int> encryptionKey;

    if (!containsEncryptionKey) {
      final key = Hive.generateSecureKey();
      await secureStorage.write(key: _secureKeyName, value: base64UrlEncode(key));
      encryptionKey = key;
    } else {
      final keyStr = await secureStorage.read(key: _secureKeyName);
      encryptionKey = base64Url.decode(keyStr!);
    }

    final cipher = HiveAesCipher(encryptionKey);
    _box = await Hive.openBox<Map<dynamic, dynamic>>(_boxName, encryptionCipher: cipher);
    _rosterBox = await Hive.openBox<Map<dynamic, dynamic>>(_rosterBoxName, encryptionCipher: cipher);
  }

  /// Encrypt helper (legacy interface support)
  Map<dynamic, dynamic> _encrypt(Map<String, dynamic> data) => data;

  /// Decrypt helper (legacy interface support)
  Map<String, dynamic>? _decrypt(Map<dynamic, dynamic> data) => Map<String, dynamic>.from(data);

  // ---------------------------------------------------------------------------
  // Patient State Operations
  // ---------------------------------------------------------------------------

  /// Save a patient's clinical state to encrypted local storage.
  Future<void> saveState(String id, Map<String, dynamic> state) async {
    try {
      final existing = _loadRaw(id);
      final data = existing ?? <String, dynamic>{'state': null, 'chatHistory': <dynamic>[]};
      data['state'] = state;
      _box?.put(id, _encrypt(data));
    } catch (e) {
      debugPrint('[Storage] Save state skipped: $e');
    }
  }

  /// Save chat history for a patient.
  Future<void> saveChatHistory(String id, List<dynamic> chatHistory) async {
    try {
      final existing = _loadRaw(id);
      final data = existing ?? <String, dynamic>{'state': null, 'chatHistory': <dynamic>[]};
      data['chatHistory'] = chatHistory;
      _box?.put(id, _encrypt(data));
    } catch (e) {
      debugPrint('[Storage] Chat save skipped: $e');
    }
  }

  /// Load a patient's full state + chat history from storage.
  Map<String, dynamic>? loadState(String id) {
    return _loadRaw(id);
  }

  Map<String, dynamic>? _loadRaw(String id) {
    try {
      final raw = _box?.get(id);
      if (raw == null) return null;
      return _decrypt(raw);
    } catch (e) {
      debugPrint('[Storage] Load state failed: $e');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Patient Roster Operations
  // ---------------------------------------------------------------------------

  /// Load all patients from the encrypted roster.
  List<Map<String, dynamic>> loadPatients() {
    try {
      final results = <Map<String, dynamic>>[];
      for (final key in _rosterBox?.keys ?? []) {
        final raw = _rosterBox?.get(key);
        if (raw != null) {
          final decrypted = _decrypt(raw);
          if (decrypted != null) results.add(decrypted);
        }
      }
      return results;
    } catch (e) {
      debugPrint('[Storage] Roster load skipped: $e');
      return [];
    }
  }

  /// Save or update a patient in the roster.
  Future<void> savePatient(Map<String, dynamic> patient) async {
    try {
      final id = patient['id'] as String;
      _rosterBox?.put(id, _encrypt(patient));
    } catch (e) {
      debugPrint('[Storage] Roster save skipped: $e');
    }
  }

  /// Delete a patient from the roster.
  Future<void> deletePatient(String id) async {
    try {
      await _rosterBox?.delete(id);
    } catch (e) {
      debugPrint('[Storage] Roster delete skipped: $e');
    }
  }

  /// Clear all stored data (for logout / data wipe).
  Future<void> clearAll() async {
    await _box?.clear();
    await _rosterBox?.clear();
  }
}
