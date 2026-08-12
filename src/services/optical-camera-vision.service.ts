import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type CameraLensMode = 'RPPG_PULSE' | 'DERMA_WOUND' | 'PUPILLOMETRY_NEURO' | 'ODONTOGRAM_ORAL';

export interface IOpticalVisionFrame {
  lensMode: CameraLensMode;
  fps: number;
  detectedBpm?: number;
  pupilDilationMm?: number;
  erythemaIndexPct?: number;
  activeToothFdi?: number;
  privacyShieldActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OpticalCameraVisionService {
  private platformId = (() => {
    try { return inject(PLATFORM_ID); } catch (e) { return 'server'; }
  })();

  readonly currentLens = signal<CameraLensMode>('RPPG_PULSE');
  readonly isCameraActive = signal<boolean>(false);
  
  readonly frameData = signal<IOpticalVisionFrame>({
    lensMode: 'RPPG_PULSE',
    fps: 60,
    detectedBpm: 72,
    pupilDilationMm: 3.5,
    erythemaIndexPct: 12,
    activeToothFdi: 11,
    privacyShieldActive: true
  });

  /**
   * Switch optical camera lens mode
   */
  selectLens(mode: CameraLensMode): void {
    this.currentLens.set(mode);
    this.frameData.update(f => ({
      ...f,
      lensMode: mode,
      detectedBpm: mode === 'RPPG_PULSE' ? 74 : f.detectedBpm,
      pupilDilationMm: mode === 'PUPILLOMETRY_NEURO' ? 3.8 : f.pupilDilationMm
    }));
  }

  /**
   * Start local edge camera vision stream
   */
  startCameraStream(): void {
    this.isCameraActive.set(true);
  }

  stopCameraStream(): void {
    this.isCameraActive.set(false);
  }
}
