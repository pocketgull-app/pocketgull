class HealthTelemetrySyncData {
  final int stepCount;
  final double activeEnergyKcal;
  final int heartRateBpm;
  final double sleepDurationHours;
  final int activeTransitMinutes;
  final double carbonOffsetKgCo2;
  final String syncTimestamp;
  final String syncProvider; // 'HealthKit' or 'Google Fit'

  HealthTelemetrySyncData({
    required this.stepCount,
    required this.activeEnergyKcal,
    required this.heartRateBpm,
    required this.sleepDurationHours,
    required this.activeTransitMinutes,
    required this.carbonOffsetKgCo2,
    required this.syncTimestamp,
    required this.syncProvider,
  });

  factory HealthTelemetrySyncData.initial() {
    return HealthTelemetrySyncData(
      stepCount: 7850,
      activeEnergyKcal: 420.5,
      heartRateBpm: 72,
      sleepDurationHours: 7.8,
      activeTransitMinutes: 35,
      carbonOffsetKgCo2: 0.85,
      syncTimestamp: DateTime.now().toIso8601String(),
      syncProvider: 'HealthKit / Google Fit Sync',
    );
  }

  factory HealthTelemetrySyncData.fromJson(Map<String, dynamic> json) {
    return HealthTelemetrySyncData(
      stepCount: (json['stepCount'] as num?)?.toInt() ?? 0,
      activeEnergyKcal: (json['activeEnergyKcal'] as num?)?.toDouble() ?? 0.0,
      heartRateBpm: (json['heartRateBpm'] as num?)?.toInt() ?? 0,
      sleepDurationHours: (json['sleepDurationHours'] as num?)?.toDouble() ?? 0.0,
      activeTransitMinutes: (json['activeTransitMinutes'] as num?)?.toInt() ?? 0,
      carbonOffsetKgCo2: (json['carbonOffsetKgCo2'] as num?)?.toDouble() ?? 0.0,
      syncTimestamp: json['syncTimestamp'] as String? ?? DateTime.now().toIso8601String(),
      syncProvider: json['syncProvider'] as String? ?? 'HealthKit / Google Fit',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stepCount': stepCount,
      'activeEnergyKcal': activeEnergyKcal,
      'heartRateBpm': heartRateBpm,
      'sleepDurationHours': sleepDurationHours,
      'activeTransitMinutes': activeTransitMinutes,
      'carbonOffsetKgCo2': carbonOffsetKgCo2,
      'syncTimestamp': syncTimestamp,
      'syncProvider': syncProvider,
    };
  }
}
