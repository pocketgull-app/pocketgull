import 'package:flutter/material.dart';

/// Represents a surveillance/telemetry node in the Sentinel Outbreak network.
class SentinelNode {
  final String id;
  final String name;
  final double x;
  final double y;
  final String status;
  final int latency;
  final int cases;

  const SentinelNode({
    required this.id,
    required this.name,
    required this.x,
    required this.y,
    this.status = 'normal',
    this.latency = 45,
    this.cases = 0,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'x': x,
        'y': y,
        'status': status,
        'latency': latency,
        'cases': cases,
      };

  factory SentinelNode.fromJson(Map<String, dynamic> json) => SentinelNode(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        x: (json['x'] as num?)?.toDouble() ?? 0.0,
        y: (json['y'] as num?)?.toDouble() ?? 0.0,
        status: json['status'] as String? ?? 'normal',
        latency: (json['latency'] as num?)?.toInt() ?? 45,
        cases: (json['cases'] as num?)?.toInt() ?? 0,
      );
}

/// Represents an active animated telemetry data packet in transit.
class SentinelPacket {
  final String fromNodeId;
  double progress;
  double speed;
  final Color color;

  SentinelPacket({
    required this.fromNodeId,
    required this.progress,
    required this.speed,
    required this.color,
  });

  Map<String, dynamic> toJson() => {
        'fromNodeId': fromNodeId,
        'progress': progress,
        'speed': speed,
        'color': color.toARGB32(),
      };
}

/// Default global WHO/CDC/PAHO Sentinel network topology.
List<SentinelNode> defaultSentinelNodes() => [
      const SentinelNode(
        id: 'hub',
        name: 'WHO Global Hub (Geneva)',
        x: 0.50,
        y: 0.48,
        status: 'synced',
        latency: 12,
        cases: 1420,
      ),
      const SentinelNode(
        id: 'node-americas',
        name: 'PAHO / CDC Hub (Atlanta)',
        x: 0.22,
        y: 0.38,
        status: 'normal',
        latency: 38,
        cases: 420,
      ),
      const SentinelNode(
        id: 'node-euro',
        name: 'ECDC Regional (Stockholm)',
        x: 0.58,
        y: 0.28,
        status: 'normal',
        latency: 24,
        cases: 310,
      ),
      const SentinelNode(
        id: 'node-afro',
        name: 'Africa CDC (Addis Ababa)',
        x: 0.62,
        y: 0.62,
        status: 'normal',
        latency: 68,
        cases: 890,
      ),
      const SentinelNode(
        id: 'node-wpro',
        name: 'WPRO Asia-Pacific (Manila)',
        x: 0.82,
        y: 0.55,
        status: 'normal',
        latency: 52,
        cases: 540,
      ),
      const SentinelNode(
        id: 'node-emro',
        name: 'EMRO Eastern Med (Cairo)',
        x: 0.52,
        y: 0.58,
        status: 'normal',
        latency: 44,
        cases: 230,
      ),
    ];

/// Initial telemetry streaming packets.
List<SentinelPacket> defaultSentinelPackets() => [
      SentinelPacket(
        fromNodeId: 'node-americas',
        progress: 0.2,
        speed: 0.008,
        color: const Color(0xFF4285F4),
      ),
      SentinelPacket(
        fromNodeId: 'node-euro',
        progress: 0.6,
        speed: 0.012,
        color: const Color(0xFF34A853),
      ),
      SentinelPacket(
        fromNodeId: 'node-afro',
        progress: 0.4,
        speed: 0.006,
        color: const Color(0xFFFBBC04),
      ),
      SentinelPacket(
        fromNodeId: 'node-wpro',
        progress: 0.8,
        speed: 0.010,
        color: const Color(0xFFEA4335),
      ),
      SentinelPacket(
        fromNodeId: 'node-emro',
        progress: 0.1,
        speed: 0.009,
        color: const Color(0xFFA855F7),
      ),
    ];
