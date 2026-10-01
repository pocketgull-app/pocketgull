import 'dart:convert';
import 'package:flutter/foundation.dart';

enum CrossDeviceSyncStatus {
  disconnected,
  connecting,
  connected,
  peerSynced,
}

enum SyncPayloadType {
  esiTriageUpdate,
  disasterStartUpdate,
  bedsideTranscriptChunk,
  patientAdmit,
  heartbeat,
}

class SyncDevice {
  final String deviceId;
  final String role;
  final String label;
  final String address;
  final String lastSeen;
  final bool isOnline;

  const SyncDevice({
    required this.deviceId,
    required this.role,
    required this.label,
    required this.address,
    required this.lastSeen,
    this.isOnline = true,
  });

  factory SyncDevice.fromJson(Map<String, dynamic> json) {
    return SyncDevice(
      deviceId: json['deviceId'] as String? ?? 'unknown-dev',
      role: json['role'] as String? ?? 'peer',
      label: json['deviceLabel'] as String? ?? 'Peer Device',
      address: json['ipOrAddress'] as String? ?? '127.0.0.1',
      lastSeen: json['lastSeen'] as String? ?? 'just now',
      isOnline: json['status'] == 'ONLINE',
    );
  }

  Map<String, dynamic> toJson() => {
    'deviceId': deviceId,
    'role': role,
    'deviceLabel': label,
    'ipOrAddress': address,
    'lastSeen': lastSeen,
    'status': isOnline ? 'ONLINE' : 'OFFLINE',
  };
}

class CrossDeviceSyncPayload {
  final String syncId;
  final SyncPayloadType type;
  final String senderDeviceId;
  final String senderRole;
  final String timestamp;
  final Map<String, dynamic> data;

  const CrossDeviceSyncPayload({
    required this.syncId,
    required this.type,
    required this.senderDeviceId,
    required this.senderRole,
    required this.timestamp,
    required this.data,
  });

  factory CrossDeviceSyncPayload.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String? ?? 'HEARTBEAT';
    SyncPayloadType resolvedType;
    switch (typeStr) {
      case 'ESI_TRIAGE_UPDATE':
        resolvedType = SyncPayloadType.esiTriageUpdate;
        break;
      case 'DISASTER_START_UPDATE':
        resolvedType = SyncPayloadType.disasterStartUpdate;
        break;
      case 'BEDSIDE_TRANSCRIPT_CHUNK':
        resolvedType = SyncPayloadType.bedsideTranscriptChunk;
        break;
      case 'PATIENT_ADMIT':
        resolvedType = SyncPayloadType.patientAdmit;
        break;
      default:
        resolvedType = SyncPayloadType.heartbeat;
    }

    return CrossDeviceSyncPayload(
      syncId: json['syncId'] as String? ?? 'sync_${DateTime.now().millisecondsSinceEpoch}',
      type: resolvedType,
      senderDeviceId: json['senderDeviceId'] as String? ?? 'workstation',
      senderRole: json['senderRole'] as String? ?? 'web-workstation',
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      data: (json['data'] as Map<String, dynamic>?) ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    String typeStr;
    switch (type) {
      case SyncPayloadType.esiTriageUpdate:
        typeStr = 'ESI_TRIAGE_UPDATE';
        break;
      case SyncPayloadType.disasterStartUpdate:
        typeStr = 'DISASTER_START_UPDATE';
        break;
      case SyncPayloadType.bedsideTranscriptChunk:
        typeStr = 'BEDSIDE_TRANSCRIPT_CHUNK';
        break;
      case SyncPayloadType.patientAdmit:
        typeStr = 'PATIENT_ADMIT';
        break;
      case SyncPayloadType.heartbeat:
        typeStr = 'HEARTBEAT';
        break;
    }

    return {
      'syncId': syncId,
      'type': typeStr,
      'senderDeviceId': senderDeviceId,
      'senderRole': senderRole,
      'timestamp': timestamp,
      'data': data,
    };
  }
}

class CrossDeviceSyncService extends ChangeNotifier {
  static final CrossDeviceSyncService _instance = CrossDeviceSyncService._internal();
  factory CrossDeviceSyncService() => _instance;

  CrossDeviceSyncService._internal() {
    _initDefaultSimulation();
  }

  CrossDeviceSyncStatus _status = CrossDeviceSyncStatus.disconnected;
  CrossDeviceSyncStatus get status => _status;

  final String localDeviceId = 'pg-flutter-prov-01';
  final String localRole = 'flutter-provider-mobile';
  String roomId = 'er-trauma-pod-1';
  int latencyMs = 18;
  DateTime? lastSyncTime;

  List<SyncDevice> _devices = [];
  List<SyncDevice> get devices => List.unmodifiable(_devices);

  final List<CrossDeviceSyncPayload> _incomingQueue = [];
  List<CrossDeviceSyncPayload> get incomingQueue => List.unmodifiable(_incomingQueue);

  final List<CrossDeviceSyncPayload> _outboxQueue = [];
  List<CrossDeviceSyncPayload> get outboxQueue => List.unmodifiable(_outboxQueue);

  void _initDefaultSimulation() {
    _status = CrossDeviceSyncStatus.peerSynced;
    lastSyncTime = DateTime.now();
    _devices = [
      const SyncDevice(
        deviceId: 'pg-workstation-main',
        role: 'web-workstation',
        label: 'Clinical Workstation (ER Pod 1)',
        address: '192.168.1.100:4200',
        lastSeen: 'Live',
        isOnline: true,
      ),
      const SyncDevice(
        deviceId: 'pg-tab-exam-04',
        role: 'patient-companion-tablet',
        label: 'Exam Room 4 Swivel Tablet',
        address: '192.168.1.189:52402',
        lastSeen: 'Live',
        isOnline: true,
      ),
    ];
  }

  void connectRoom(String id) {
    roomId = id;
    _status = CrossDeviceSyncStatus.connecting;
    notifyListeners();

    // Simulated quick handshake for offline and local testing
    Future.delayed(const Duration(milliseconds: 150), () {
      _status = CrossDeviceSyncStatus.peerSynced;
      lastSyncTime = DateTime.now();
      notifyListeners();
    });
  }

  void disconnect() {
    _status = CrossDeviceSyncStatus.disconnected;
    notifyListeners();
  }

  /// Broadcasts an ESI Triage update from mobile to workstation
  CrossDeviceSyncPayload broadcastEsiTriage({
    required String patientId,
    required String patientName,
    required int acuityLevel,
    required String acuityLabel,
    required String rationale,
  }) {
    final payload = CrossDeviceSyncPayload(
      syncId: 'sync_esi_mob_${DateTime.now().millisecondsSinceEpoch}',
      type: SyncPayloadType.esiTriageUpdate,
      senderDeviceId: localDeviceId,
      senderRole: localRole,
      timestamp: DateTime.now().toIso8601String(),
      data: {
        'patientId': patientId,
        'patientName': patientName,
        'acuityLevel': acuityLevel,
        'acuityLabel': acuityLabel,
        'rationale': rationale,
        'nurseAttestation': true,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );

    _outboxQueue.add(payload);
    lastSyncTime = DateTime.now();
    notifyListeners();
    return payload;
  }

  /// Broadcasts a START disaster triage tag from mobile to workstation
  CrossDeviceSyncPayload broadcastStartDisasterTag({
    required String casualtyId,
    required String tagColor,
    required String category,
    required int respirations,
    required double perfusionSeconds,
  }) {
    final payload = CrossDeviceSyncPayload(
      syncId: 'sync_start_mob_${DateTime.now().millisecondsSinceEpoch}',
      type: SyncPayloadType.disasterStartUpdate,
      senderDeviceId: localDeviceId,
      senderRole: localRole,
      timestamp: DateTime.now().toIso8601String(),
      data: {
        'casualtyId': casualtyId,
        'tagColor': tagColor,
        'triageCategory': category,
        'respirations': respirations,
        'perfusionSeconds': perfusionSeconds,
        'mentalStatus': 'FOLLOWS_COMMANDS',
        'timestamp': DateTime.now().toIso8601String(),
      },
    );

    _outboxQueue.add(payload);
    lastSyncTime = DateTime.now();
    notifyListeners();
    return payload;
  }

  /// Ingests message frame from workstation
  void handleIncomingMessage(String jsonString) {
    try {
      final decoded = jsonDecode(jsonString) as Map<String, dynamic>;
      final payload = CrossDeviceSyncPayload.fromJson(decoded);
      _incomingQueue.insert(0, payload);
      if (_incomingQueue.length > 50) {
        _incomingQueue.removeLast();
      }
      lastSyncTime = DateTime.now();
      notifyListeners();
    } catch (e) {
      debugPrint('[CrossDeviceSyncService] Parse error: $e');
    }
  }

  /// Simulates workstation broadcast arrival for unit testing
  void simulateWorkstationBroadcast(CrossDeviceSyncPayload payload) {
    _incomingQueue.insert(0, payload);
    lastSyncTime = DateTime.now();
    notifyListeners();
  }
}
