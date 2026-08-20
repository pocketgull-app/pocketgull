class SentinelNode {
  final String id;
  final String name;
  final double x;
  final double y;
  final String status;
  final String type;

  const SentinelNode({
    required this.id,
    required this.name,
    required this.x,
    required this.y,
    this.status = 'active',
    this.type = 'clinic',
  });

  factory SentinelNode.fromJson(Map<String, dynamic> json) {
    return SentinelNode(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      x: (json['x'] as num?)?.toDouble() ?? 0.5,
      y: (json['y'] as num?)?.toDouble() ?? 0.5,
      status: json['status'] as String? ?? 'active',
      type: json['type'] as String? ?? 'clinic',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'x': x,
      'y': y,
      'status': status,
      'type': type,
    };
  }
}

class SentinelPacket {
  final String fromNodeId;
  final String color;
  double progress;
  double speed;

  SentinelPacket({
    required this.fromNodeId,
    required this.color,
    this.progress = 0.0,
    this.speed = 0.005,
  });

  factory SentinelPacket.fromJson(Map<String, dynamic> json) {
    return SentinelPacket(
      fromNodeId: json['fromNodeId'] as String? ?? 'hub',
      color: json['color'] as String? ?? '#4285F4',
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
      speed: (json['speed'] as num?)?.toDouble() ?? 0.005,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fromNodeId': fromNodeId,
      'color': color,
      'progress': progress,
      'speed': speed,
    };
  }
}

List<SentinelNode> defaultSentinelNodes() {
  return const [
    SentinelNode(id: 'hub', name: 'WHO Central Hub', x: 0.5, y: 0.5, type: 'hub'),
    SentinelNode(id: 'node1', name: 'Pacific North Clinic', x: 0.2, y: 0.25, type: 'clinic'),
    SentinelNode(id: 'node2', name: 'Urban General Hospital', x: 0.8, y: 0.22, type: 'hospital'),
    SentinelNode(id: 'node3', name: 'Regional Virology Lab', x: 0.85, y: 0.75, type: 'lab'),
    SentinelNode(id: 'node4', name: 'Coastal Surveillance', x: 0.18, y: 0.78, type: 'clinic'),
    SentinelNode(id: 'node5', name: 'Mobile Field Unit Alpha', x: 0.5, y: 0.88, type: 'mobile'),
  ];
}

List<SentinelPacket> defaultSentinelPackets() {
  return [
    SentinelPacket(fromNodeId: 'node1', color: '#4285F4', progress: 0.1, speed: 0.004),
    SentinelPacket(fromNodeId: 'node2', color: '#34A853', progress: 0.35, speed: 0.005),
    SentinelPacket(fromNodeId: 'node3', color: '#FBBC05', progress: 0.6, speed: 0.0035),
    SentinelPacket(fromNodeId: 'node4', color: '#EA4335', progress: 0.2, speed: 0.006),
    SentinelPacket(fromNodeId: 'node5', color: '#8AB4F8', progress: 0.8, speed: 0.0045),
  ];
}
