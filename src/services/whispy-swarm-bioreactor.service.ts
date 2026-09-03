import { Injectable, signal, computed } from '@angular/core';

export type BioreactorPhase =
  | 'SCAN_INGESTION'
  | 'MIST_INOCULATION'
  | 'ACOUSTIC_SCULPTING'
  | 'SOL_GEL_CROSSLINK'
  | 'BIOELECTRIC_POLARIZATION'
  | 'HARVEST_READY';

export interface IChamberTelemetry {
  readonly phase: BioreactorPhase;
  readonly chamberPressureKpa: number;
  readonly gorkovPotentialStrength: number; // nanoJoules (nJ)
  readonly dropletDensityCm3: number;
  readonly gelationFraction: number; // 0.0 to 1.0
  readonly bioelectricFieldMvMm: number; // 40 - 100 mV/mm
  readonly targetVoxelCount: number;
  readonly structuralFidelityPercent: number;
  readonly isAcousticFieldLocked: boolean;
}

export interface IBioreactorControlParams {
  transducerFrequencyKhz: number;
  acousticPressureMpa: number;
  bioelectricFieldMvMm: number;
  calciumConcentrationMm: number;
  dropletRadiusUm: number;
}

@Injectable({
  providedIn: 'root'
})
export class WhispySwarmBioreactorService {
  readonly currentPhase = signal<BioreactorPhase>('SCAN_INGESTION');

  readonly controls = signal<IBioreactorControlParams>({
    transducerFrequencyKhz: 250.0,
    acousticPressureMpa: 1.2,
    bioelectricFieldMvMm: 80.0,
    calciumConcentrationMm: 3.5,
    dropletRadiusUm: 1.8
  });

  readonly patientScanId = signal<string>('DICOM-SERIES-L5-S1-DEFECT');
  readonly targetVoxelCount = signal<number>(1850);

  /**
   * Gor'kov Acoustic Radiation Potential:
   * U = 2 * pi * r^3 * rho_0 * [ <p^2> / (3 * rho_0^2 * c_0^2) * f_1 - <v^2> / 2 * f_2 ]
   * Trapping stability requires deep negative potential wells (U < 0).
   */
  readonly gorkovPotentialNn = computed(() => {
    const ctrl = this.controls();
    const r = ctrl.dropletRadiusUm * 1e-6; // m
    const p0 = ctrl.acousticPressureMpa * 1e6; // Pa
    const rho0 = 1.204; // air density kg/m^3
    const c0 = 343.0; // speed of sound m/s
    const f1 = 1.0; // monopole acoustic contrast factor
    const f2 = 0.5; // dipole acoustic contrast factor

    // Acoustic energy density approximation in standing wave
    const meanPSquared = 0.5 * Math.pow(p0, 2);
    const meanVSquared = meanPSquared / Math.pow(rho0 * c0, 2);

    const term1 = (meanPSquared / (3.0 * Math.pow(rho0 * c0, 2))) * f1;
    const term2 = (meanVSquared / 2.0) * f2;

    const potentialJoules = 2.0 * Math.PI * Math.pow(r, 3) * rho0 * (term1 - term2);
    // Convert to nanoJoules for clinical telemetry display
    return Math.abs(potentialJoules * 1e9);
  });

  readonly chamberTelemetry = computed<IChamberTelemetry>(() => {
    const phase = this.currentPhase();
    const gorkov = this.gorkovPotentialNn();
    const ctrl = this.controls();
    const voxels = this.targetVoxelCount();

    switch (phase) {
      case 'SCAN_INGESTION':
        return {
          phase,
          chamberPressureKpa: 101.3,
          gorkovPotentialStrength: 0.0,
          dropletDensityCm3: 0,
          gelationFraction: 0.0,
          bioelectricFieldMvMm: 0.0,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 99.8,
          isAcousticFieldLocked: false
        };

      case 'MIST_INOCULATION':
        return {
          phase,
          chamberPressureKpa: 101.8,
          gorkovPotentialStrength: Number((gorkov * 0.2).toFixed(2)),
          dropletDensityCm3: 4.5e6,
          gelationFraction: 0.02,
          bioelectricFieldMvMm: 0.0,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 42.0,
          isAcousticFieldLocked: false
        };

      case 'ACOUSTIC_SCULPTING':
        return {
          phase,
          chamberPressureKpa: 102.1,
          gorkovPotentialStrength: Number(gorkov.toFixed(2)),
          dropletDensityCm3: 8.2e6,
          gelationFraction: 0.15,
          bioelectricFieldMvMm: 15.0,
          targetVoxelCount: voxels,
          structuralFidelityPercent: 88.5,
          isAcousticFieldLocked: true
        };

      case 'SOL_GEL_CROSSLINK':
        return {
          phase,
          chamberPressureKpa: 101.5,
          gorkovPotentialStrength: Number((gorkov * 0.9).toFixed(2)),
          dropletDensityCm3: 6.1e6,
          gelationFraction: 0.86,
          bioelectricFieldMvMm: Number(ctrl.bioelectricFieldMvMm.toFixed(1)),
          targetVoxelCount: voxels,
          structuralFidelityPercent: 96.4,
          isAcousticFieldLocked: true
        };

      case 'BIOELECTRIC_POLARIZATION':
        return {
          phase,
          chamberPressureKpa: 101.3,
          gorkovPotentialStrength: Number((gorkov * 0.7).toFixed(2)),
          dropletDensityCm3: 2.3e6,
          gelationFraction: 0.98,
          bioelectricFieldMvMm: Number(ctrl.bioelectricFieldMvMm.toFixed(1)),
          targetVoxelCount: voxels,
          structuralFidelityPercent: 98.9,
          isAcousticFieldLocked: true
        };

      case 'HARVEST_READY':
        return {
          phase,
          chamberPressureKpa: 98.2, // slight negative pressure for vacuum transfer
          gorkovPotentialStrength: Number((gorkov * 0.1).toFixed(2)),
          dropletDensityCm3: 1.2e4,
          gelationFraction: 1.0,
          bioelectricFieldMvMm: Number(ctrl.bioelectricFieldMvMm.toFixed(1)),
          targetVoxelCount: voxels,
          structuralFidelityPercent: 99.4,
          isAcousticFieldLocked: false
        };
    }
  });

  advancePhase(): BioreactorPhase {
    const sequence: BioreactorPhase[] = [
      'SCAN_INGESTION',
      'MIST_INOCULATION',
      'ACOUSTIC_SCULPTING',
      'SOL_GEL_CROSSLINK',
      'BIOELECTRIC_POLARIZATION',
      'HARVEST_READY'
    ];
    const currentIndex = sequence.indexOf(this.currentPhase());
    const nextIndex = (currentIndex + 1) % sequence.length;
    const nextPhase = sequence[nextIndex];
    this.currentPhase.set(nextPhase);
    return nextPhase;
  }

  setPhase(phase: BioreactorPhase): void {
    this.currentPhase.set(phase);
  }

  resetChamber(): void {
    this.currentPhase.set('SCAN_INGESTION');
  }

  updateControls(updates: Partial<IBioreactorControlParams>): void {
    this.controls.update(prev => ({ ...prev, ...updates }));
  }

  loadPatientScan(scanId: string, voxelCount: number = 1850): void {
    this.patientScanId.set(scanId);
    this.targetVoxelCount.set(voxelCount);
    this.currentPhase.set('SCAN_INGESTION');
  }
}
