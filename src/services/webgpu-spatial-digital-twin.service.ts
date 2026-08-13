import { Injectable, signal, computed } from '@angular/core';

export type OrganType = 'HEART' | 'LUNGS' | 'LIVER' | 'KIDNEYS' | 'BRAIN';

export interface IOrganBiophysics {
  organ: OrganType;
  perfusionRateMlMin: number;   // Normal heart ~250ml/min coronary flow, liver 1500ml/min
  oxygenationSpo2: number;       // 70-100%
  metabolicStressIndex: number; // 0-100
  vascularResistance: number;   // Wood units
  webgpuWdslShader: string;
}

export interface IDigitalTwinFrame {
  organ: OrganType;
  timestampMs: number;
  biophysics: IOrganBiophysics;
  meshDeformationFactor: number;
  colorThermalVector: [number, number, number]; // RGB 0-1
}

@Injectable({
  providedIn: 'root'
})
export class WebgpuSpatialDigitalTwinService {

  public selectedOrgan = signal<OrganType>('HEART');
  public heartRate = signal<number>(72);
  public spo2Percent = signal<number>(98);
  public meanArterialPressure = signal<number>(93);

  /** Computed biophysical organ state */
  public organBiophysics = computed<IOrganBiophysics>(() => {
    const organ = this.selectedOrgan();
    const hr = Math.max(30, Math.min(220, this.heartRate()));
    const spo2 = Math.max(50, Math.min(100, this.spo2Percent()));
    const map = Math.max(40, Math.min(180, this.meanArterialPressure()));

    let perfusionRate = 250;
    let vascularResistance = 1.2;

    switch (organ) {
      case 'HEART':
        perfusionRate = (hr / 70) * 250;
        vascularResistance = 1.0;
        break;
      case 'LIVER':
        perfusionRate = 1450 * (map / 90);
        vascularResistance = 0.8;
        break;
      case 'KIDNEYS':
        perfusionRate = 1100 * (map / 90);
        vascularResistance = 1.5;
        break;
      case 'BRAIN':
        perfusionRate = 750 * (map / 90);
        vascularResistance = 1.1;
        break;
      case 'LUNGS':
        perfusionRate = 5000 * (hr / 70);
        vascularResistance = 0.2;
        break;
    }

    const metabolicStress = Math.min(100, Math.max(0, (100 - spo2) * 2.5 + (hr > 100 ? (hr - 100) * 0.5 : 0)));

    return {
      organ,
      perfusionRateMlMin: Math.round(perfusionRate),
      oxygenationSpo2: spo2,
      metabolicStressIndex: Math.round(metabolicStress),
      vascularResistance: Number(vascularResistance.toFixed(2)),
      webgpuWdslShader: this.generateWdslShader(organ, metabolicStress)
    };
  });

  /**
   * Generates WebGPU WGSL compute/fragment shader for organ mesh deformation.
   */
  public generateWdslShader(organ: OrganType, stressIndex: number): string {
    const stressNormalized = (stressIndex / 100).toFixed(3);
    return `
      // WebGPU WGSL Spatial Digital Twin Shader - ${organ}
      struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>
      };

      @group(0) @binding(0) var<uniform> timeSec: f32;

      @fragment
      fn mainImage(@location(0) color: vec4<f32>, @location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
        let pulse = sin(timeSec * 3.14159 * 1.2) * 0.5 + 0.5;
        let stress = ${stressNormalized};
        let thermalColor = vec3<f32>(stress, 1.0 - stress, 0.2 + pulse * 0.3);
        return vec4<f32>(thermalColor, 0.95);
      }
    `.trim();
  }

  /**
   * Computes spatial digital twin frame for WebGPU / Canvas 3D renderer.
   */
  public computeDigitalTwinFrame(): IDigitalTwinFrame {
    const bio = this.organBiophysics();
    const stress = bio.metabolicStressIndex / 100;
    const r = Math.min(1.0, stress * 1.5);
    const g = Math.max(0.0, 1.0 - stress);
    const b = 0.2;

    return {
      organ: bio.organ,
      timestampMs: Date.now(),
      biophysics: bio,
      meshDeformationFactor: 1.0 + (this.heartRate() / 100) * 0.1,
      colorThermalVector: [Number(r.toFixed(2)), Number(g.toFixed(2)), Number(b.toFixed(2))]
    };
  }
}
