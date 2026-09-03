import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/whispy_bioreactor_model.dart';

class WhispyBioreactorNotifier extends Notifier<AcousticContainmentTelemetry> {
  @override
  AcousticContainmentTelemetry build() {
    return _computeTelemetryForPhase(
      BioreactorPhase.scanIngestion,
      const BioreactorTankConfig(),
      1850,
      'DICOM-SERIES-L5-S1-DEFECT',
    );
  }

  /// Calculates Gor'kov Acoustic Radiation Potential in nanoJoules (nJ)
  double computeGorkovPotential({
    required double pressureMpa,
    required double radiusUm,
  }) {
    final r = radiusUm * 1e-6; // m
    final p0 = pressureMpa * 1e6; // Pa
    const rho0 = 1.204; // kg/m^3
    const c0 = 343.0; // m/s
    const f1 = 1.0;
    const f2 = 0.5;

    final meanPSquared = 0.5 * math.pow(p0, 2);
    final meanVSquared = meanPSquared / math.pow(rho0 * c0, 2);

    final term1 = (meanPSquared / (3.0 * math.pow(rho0 * c0, 2))) * f1;
    final term2 = (meanVSquared / 2.0) * f2;

    final joules = 2.0 * math.pi * math.pow(r, 3) * rho0 * (term1 - term2);
    return (joules.abs() * 1e9); // Convert to nJ
  }

  AcousticContainmentTelemetry _computeTelemetryForPhase(
    BioreactorPhase phase,
    BioreactorTankConfig config,
    int voxels,
    String scanId,
  ) {
    final gorkov = computeGorkovPotential(
      pressureMpa: config.acousticPressureMpa,
      radiusUm: config.dropletRadiusUm,
    );

    switch (phase) {
      case BioreactorPhase.scanIngestion:
        return AcousticContainmentTelemetry(
          phase: phase,
          chamberPressureKpa: 101.3,
          gorkovPotentialNn: 0.0,
          dropletDensityCm3: 0.0,
          gelationFraction: 0.0,
          bioelectricFieldMvMm: 0.0,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 99.8,
          isAcousticFieldLocked: false,
          scanId: scanId,
          config: config,
        );

      case BioreactorPhase.mistInoculation:
        return AcousticContainmentTelemetry(
          phase: phase,
          chamberPressureKpa: 101.8,
          gorkovPotentialNn: double.parse((gorkov * 0.2).toStringAsFixed(2)),
          dropletDensityCm3: 4.5e6,
          gelationFraction: 0.02,
          bioelectricFieldMvMm: 0.0,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 42.0,
          isAcousticFieldLocked: false,
          scanId: scanId,
          config: config,
        );

      case BioreactorPhase.acousticSculpting:
        return AcousticContainmentTelemetry(
          phase: phase,
          chamberPressureKpa: 102.1,
          gorkovPotentialNn: double.parse(gorkov.toStringAsFixed(2)),
          dropletDensityCm3: 8.2e6,
          gelationFraction: 0.15,
          bioelectricFieldMvMm: 15.0,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 88.5,
          isAcousticFieldLocked: true,
          scanId: scanId,
          config: config,
        );

      case BioreactorPhase.solGelCrosslink:
        return AcousticContainmentTelemetry(
          phase: phase,
          chamberPressureKpa: 101.5,
          gorkovPotentialNn: double.parse((gorkov * 0.9).toStringAsFixed(2)),
          dropletDensityCm3: 6.1e6,
          gelationFraction: 0.86,
          bioelectricFieldMvMm: config.bioelectricFieldMvMm,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 96.4,
          isAcousticFieldLocked: true,
          scanId: scanId,
          config: config,
        );

      case BioreactorPhase.bioelectricPolarization:
        return AcousticContainmentTelemetry(
          phase: phase,
          chamberPressureKpa: 101.3,
          gorkovPotentialNn: double.parse((gorkov * 0.7).toStringAsFixed(2)),
          dropletDensityCm3: 2.3e6,
          gelationFraction: 0.98,
          bioelectricFieldMvMm: config.bioelectricFieldMvMm,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 98.9,
          isAcousticFieldLocked: true,
          scanId: scanId,
          config: config,
        );

      case BioreactorPhase.harvestReady:
        return AcousticContainmentTelemetry(
          phase: phase,
          chamberPressureKpa: 98.2, // Vacuum egress
          gorkovPotentialNn: double.parse((gorkov * 0.1).toStringAsFixed(2)),
          dropletDensityCm3: 1.2e4,
          gelationFraction: 1.0,
          bioelectricFieldMvMm: config.bioelectricFieldMvMm,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 99.4,
          isAcousticFieldLocked: false,
          scanId: scanId,
          config: config,
        );
    }
  }

  void advancePhase() {
    const phases = BioreactorPhase.values;
    final nextIndex = (state.phase.index + 1) % phases.length;
    final nextPhase = phases[nextIndex];
    state = _computeTelemetryForPhase(
      nextPhase,
      state.config,
      state.targetVoxelCount,
      state.scanId,
    );
  }

  void setPhase(BioreactorPhase phase) {
    state = _computeTelemetryForPhase(
      phase,
      state.config,
      state.targetVoxelCount,
      state.scanId,
    );
  }

  void resetChamber() {
    state = _computeTelemetryForPhase(
      BioreactorPhase.scanIngestion,
      state.config,
      state.targetVoxelCount,
      state.scanId,
    );
  }

  void loadPatientScan(String scanId, {int? voxelCount}) {
    final voxels = voxelCount ?? 2150;
    state = _computeTelemetryForPhase(
      BioreactorPhase.scanIngestion,
      state.config,
      voxels,
      scanId,
    );
  }

  void updateAcousticPressure(double mpa) {
    final updatedConfig = state.config.copyWith(acousticPressureMpa: mpa);
    state = _computeTelemetryForPhase(
      state.phase,
      updatedConfig,
      state.targetVoxelCount,
      state.scanId,
    );
  }

  void updateTransducerFrequency(double khz) {
    final updatedConfig = state.config.copyWith(transducerFrequencyKhz: khz);
    state = _computeTelemetryForPhase(
      state.phase,
      updatedConfig,
      state.targetVoxelCount,
      state.scanId,
    );
  }

  void updateBioelectricField(double mvMm) {
    final updatedConfig = state.config.copyWith(bioelectricFieldMvMm: mvMm);
    state = _computeTelemetryForPhase(
      state.phase,
      updatedConfig,
      state.targetVoxelCount,
      state.scanId,
    );
  }
}

final whispyBioreactorProvider =
    NotifierProvider<WhispyBioreactorNotifier, AcousticContainmentTelemetry>(() {
  return WhispyBioreactorNotifier();
});
