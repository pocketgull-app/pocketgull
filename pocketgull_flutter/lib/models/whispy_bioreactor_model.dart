/// Whispy Healing Swarm Acoustic Holographic Bioreactor Models.
///
/// Models the closed-loop containment chamber, Gor'kov acoustic potential,
/// in-flight sol-to-gel crosslinking, and bioelectric galvanotaxic fields.
library;

enum BioreactorPhase {
  scanIngestion,
  mistInoculation,
  acousticSculpting,
  solGelCrosslink,
  bioelectricPolarization,
  harvestReady;

  String get label => switch (this) {
        BioreactorPhase.scanIngestion => '1. Scan Ingestion',
        BioreactorPhase.mistInoculation => '2. Mist Inoculation',
        BioreactorPhase.acousticSculpting => '3. Acoustic Sculpting',
        BioreactorPhase.solGelCrosslink => '4. Sol-Gel Crosslinking',
        BioreactorPhase.bioelectricPolarization => '5. Bioelectric Polarization',
        BioreactorPhase.harvestReady => '6. Ready for Egress',
      };

  String get icon => switch (this) {
        BioreactorPhase.scanIngestion => '📁',
        BioreactorPhase.mistInoculation => '💨',
        BioreactorPhase.acousticSculpting => '🔊',
        BioreactorPhase.solGelCrosslink => '🧬',
        BioreactorPhase.bioelectricPolarization => '⚡',
        BioreactorPhase.harvestReady => '🧪',
      };
}

class BioreactorTankConfig {
  final double transducerFrequencyKhz;
  final double acousticPressureMpa;
  final double bioelectricFieldMvMm;
  final double calciumConcentrationMm;
  final double dropletRadiusUm;

  const BioreactorTankConfig({
    this.transducerFrequencyKhz = 250.0,
    this.acousticPressureMpa = 1.2,
    this.bioelectricFieldMvMm = 80.0,
    this.calciumConcentrationMm = 3.5,
    this.dropletRadiusUm = 1.8,
  });

  BioreactorTankConfig copyWith({
    double? transducerFrequencyKhz,
    double? acousticPressureMpa,
    double? bioelectricFieldMvMm,
    double? calciumConcentrationMm,
    double? dropletRadiusUm,
  }) {
    return BioreactorTankConfig(
      transducerFrequencyKhz:
          transducerFrequencyKhz ?? this.transducerFrequencyKhz,
      acousticPressureMpa: acousticPressureMpa ?? this.acousticPressureMpa,
      bioelectricFieldMvMm:
          bioelectricFieldMvMm ?? this.bioelectricFieldMvMm,
      calciumConcentrationMm:
          calciumConcentrationMm ?? this.calciumConcentrationMm,
      dropletRadiusUm: dropletRadiusUm ?? this.dropletRadiusUm,
    );
  }

  Map<String, dynamic> toJson() => {
        'transducerFrequencyKhz': transducerFrequencyKhz,
        'acousticPressureMpa': acousticPressureMpa,
        'bioelectricFieldMvMm': bioelectricFieldMvMm,
        'calciumConcentrationMm': calciumConcentrationMm,
        'dropletRadiusUm': dropletRadiusUm,
      };

  factory BioreactorTankConfig.fromJson(Map<String, dynamic> json) =>
      BioreactorTankConfig(
        transducerFrequencyKhz:
            (json['transducerFrequencyKhz'] as num?)?.toDouble() ?? 250.0,
        acousticPressureMpa:
            (json['acousticPressureMpa'] as num?)?.toDouble() ?? 1.2,
        bioelectricFieldMvMm:
            (json['bioelectricFieldMvMm'] as num?)?.toDouble() ?? 80.0,
        calciumConcentrationMm:
            (json['calciumConcentrationMm'] as num?)?.toDouble() ?? 3.5,
        dropletRadiusUm: (json['dropletRadiusUm'] as num?)?.toDouble() ?? 1.8,
      );
}

class AcousticContainmentTelemetry {
  final BioreactorPhase phase;
  final double chamberPressureKpa;
  final double gorkovPotentialNn; // nanoJoules (nJ)
  final double dropletDensityCm3;
  final double gelationFraction; // 0.0 to 1.0
  final double bioelectricFieldMvMm;
  final int targetVoxelCount;
  final double structuralFidelityPercent;
  final bool isAcousticFieldLocked;
  final String scanId;
  final BioreactorTankConfig config;

  const AcousticContainmentTelemetry({
    this.phase = BioreactorPhase.scanIngestion,
    this.chamberPressureKpa = 101.3,
    this.gorkovPotentialNn = 18.5,
    this.dropletDensityCm3 = 0.0,
    this.gelationFraction = 0.0,
    this.bioelectricFieldMvMm = 0.0,
    this.targetVoxelCount = 1850,
    this.structuralFidelityPercent = 99.8,
    this.isAcousticFieldLocked = false,
    this.scanId = 'DICOM-SERIES-L5-S1-DEFECT',
    this.config = const BioreactorTankConfig(),
  });

  AcousticContainmentTelemetry copyWith({
    BioreactorPhase? phase,
    double? chamberPressureKpa,
    double? gorkovPotentialNn,
    double? dropletDensityCm3,
    double? gelationFraction,
    double? bioelectricFieldMvMm,
    int? targetVoxelCount,
    double? structuralFidelityPercent,
    bool? isAcousticFieldLocked,
    String? scanId,
    BioreactorTankConfig? config,
  }) {
    return AcousticContainmentTelemetry(
      phase: phase ?? this.phase,
      chamberPressureKpa: chamberPressureKpa ?? this.chamberPressureKpa,
      gorkovPotentialNn: gorkovPotentialNn ?? this.gorkovPotentialNn,
      dropletDensityCm3: dropletDensityCm3 ?? this.dropletDensityCm3,
      gelationFraction: gelationFraction ?? this.gelationFraction,
      bioelectricFieldMvMm: bioelectricFieldMvMm ?? this.bioelectricFieldMvMm,
      targetVoxelCount: targetVoxelCount ?? this.targetVoxelCount,
      structuralFidelityPercent:
          structuralFidelityPercent ?? this.structuralFidelityPercent,
      isAcousticFieldLocked:
          isAcousticFieldLocked ?? this.isAcousticFieldLocked,
      scanId: scanId ?? this.scanId,
      config: config ?? this.config,
    );
  }

  Map<String, dynamic> toJson() => {
        'phase': phase.name,
        'chamberPressureKpa': chamberPressureKpa,
        'gorkovPotentialNn': gorkovPotentialNn,
        'dropletDensityCm3': dropletDensityCm3,
        'gelationFraction': gelationFraction,
        'bioelectricFieldMvMm': bioelectricFieldMvMm,
        'targetVoxelCount': targetVoxelCount,
        'structuralFidelityPercent': structuralFidelityPercent,
        'isAcousticFieldLocked': isAcousticFieldLocked,
        'scanId': scanId,
        'config': config.toJson(),
      };
}
