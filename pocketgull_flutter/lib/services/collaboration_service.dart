import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'dart:developer' as developer;

class CollaborationNote {
  final String id;
  final String clinicianName;
  final String text;
  final String timestamp;

  CollaborationNote({
    required this.id,
    required this.clinicianName,
    required this.text,
    required this.timestamp,
  });

  factory CollaborationNote.fromJson(Map<String, dynamic> json) {
    return CollaborationNote(
      id: json['id'] as String,
      clinicianName: json['clinicianName'] as String,
      text: json['text'] as String,
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'clinicianName': clinicianName,
      'text': text,
      'timestamp': timestamp,
    };
  }
}

class CollaborationService {
  io.Socket? _socket;
  final String _sessionRoomId = 'global-clinical-room';

  // In a real app, you'd want these to be StateNotifiers or similar via Riverpod.
  // For simplicity, we expose a stream of incoming notes and vitals.

  void connect(String serverUrl) {
    if (_socket != null) return;

    _socket = io.io(serverUrl, io.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .disableReconnection()
      .build());

    _socket!.connect();

    _socket!.onConnect((_) {
      developer.log('[CollaborationService] Connected to real-time sync.');
      _joinRoom();
    });

    _socket!.onConnectError((err) {
      developer.log('[CollaborationService] Connection error (offline fallback active): $err');
    });

    _socket!.onError((err) {
      developer.log('[CollaborationService] Socket error (offline fallback active): $err');
    });

    _socket!.onDisconnect((_) {
      developer.log('[CollaborationService] Disconnected.');
    });

    _socket!.on('vitals_updated', (data) {
      developer.log('[CollaborationService] Received vitals update: $data');
      // Pass this to a Riverpod provider or state manager
    });

    _socket!.on('note_received', (data) {
      developer.log('[CollaborationService] Note received: $data');
      // Pass this to a Riverpod provider or state manager
    });
  }

  void _joinRoom() {
    if (_socket == null) return;
    _socket!.emit('join_patient_room', _sessionRoomId);
    
    _socket!.emit('presence_update', {
      'patientId': _sessionRoomId,
      'clinician': 'Flutter Companion App',
    });
  }

  void sendNote(String text) {
    if (_socket == null) return;

    final newNote = CollaborationNote(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      clinicianName: 'Flutter Companion App',
      text: text,
      timestamp: DateTime.now().toIso8601String(),
    );

    _socket!.emit('send_note', {
      'patientId': _sessionRoomId,
      'note': newNote.toJson(),
    });
  }

  void syncVitals(Map<String, dynamic> vitals) {
    if (_socket == null) return;

    _socket!.emit('sync_vitals', {
      'patientId': _sessionRoomId,
      'vitals': vitals,
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}

final collaborationServiceProvider = Provider<CollaborationService>((ref) {
  return CollaborationService();
});
