/**
 * Universal WGSL Shader for 3D Cardiac Electrophysiology & Action Potential Conduction
 * 
 * Implements:
 * 1. 5-Phase Ventricular Action Potential (Phase 0 upstroke, Phase 2 plateau, EAD flutter).
 * 2. Coupled electromechanical systolic contraction along normal vectors.
 * 3. Dual-output rasterization: Target 0 (Screen Color) + Target 1 (Offscreen 32-bit uint part ID).
 */

export const CARDIAC_ELECTROPHYSIOLOGY_WGSL = /* wgsl */ `
struct FrameUniforms {
  viewProjMatrix: mat4x4<f32>,
  modelMatrix: mat4x4<f32>,
  cameraPos: vec3<f32>,
  timeSec: f32,
  heartRateBpm: f32,
  conductionVelocity: f32,
  qtcIntervalMs: f32,
  eadInstability: f32,
  meshPartId: u32,
  padding: vec3<f32>,
};

@group(0) @binding(0) var<uniform> u: FrameUniforms;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
};

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) uv: vec2<f32>,
  @location(3) actionPotential: f32,
};

struct FragmentOutput {
  @location(0) color: vec4<f32>,
  @location(1) pickId: u32,
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  let cycleFreq = u.heartRateBpm / 60.0;
  let cycleTime = fract(u.timeSec * cycleFreq);

  // Longitudinal apex-to-base conduction wavefront propagation (Y axis)
  let waveDist = in.position.y * 0.25 + 0.5;
  let wavePhase = fract(cycleTime - waveDist * (1.0 / max(0.2, u.conductionVelocity)));

  // Phase 0: Rapid inward I_Na depolarization upstroke
  let upstroke = smoothstep(0.0, 0.04, wavePhase) * (1.0 - smoothstep(0.04, 0.08, wavePhase));

  // Phase 2: L-type I_Ca,L plateau prolonged by QTc
  let plateauNorm = clamp((u.qtcIntervalMs - 380.0) / 220.0, 0.0, 1.0);
  let plateauDuration = mix(0.25, 0.45, plateauNorm);
  let plateau = smoothstep(0.04, 0.08, wavePhase) * (1.0 - smoothstep(plateauDuration, plateauDuration + 0.15, wavePhase));

  // Early Afterdepolarization (EAD) voltage flutter in Phase 2/3
  var eadFlutter: f32 = 0.0;
  if (u.eadInstability > 0.05) {
    let inWindow = step(0.15, wavePhase) * (1.0 - step(plateauDuration + 0.1, wavePhase));
    eadFlutter = sin(u.timeSec * 45.0 + in.position.y * 12.0) * u.eadInstability * inWindow * 0.15;
  }

  let vm = clamp(upstroke * 1.2 + plateau * 0.85 + eadFlutter, 0.0, 1.2);
  out.actionPotential = vm;

  // Electromechanical systolic contraction coupled to calcium plateau
  let contraction = plateau * 0.06;
  let displacedPos = in.position - in.normal * contraction;

  let worldPos4 = u.modelMatrix * vec4<f32>(displacedPos, 1.0);
  out.worldPos = worldPos4.xyz;
  out.worldNormal = normalize((u.modelMatrix * vec4<f32>(in.normal, 0.0)).xyz);
  out.uv = in.uv;
  out.clipPos = u.viewProjMatrix * worldPos4;

  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> FragmentOutput {
  var out: FragmentOutput;

  let viewDir = normalize(u.cameraPos - in.worldPos);
  let fresnel = pow(1.0 - max(dot(viewDir, in.worldNormal), 0.0), 3.0);

  // Action Potential Voltage Color Mapping
  // Resting (-90mV) = Dark Obsidian Blue (0.04, 0.08, 0.16)
  // Depolarized (+25mV) = Radiant Rose (0.96, 0.25, 0.35)
  // EAD Oscillatory Hazard = Saffron Gold (1.0, 0.85, 0.2)
  let restColor = vec3<f32>(0.04, 0.08, 0.16);
  let depolarizedColor = vec3<f32>(0.96, 0.25, 0.35);
  let eadSpikeColor = vec3<f32>(1.0, 0.85, 0.2);

  var finalColor = mix(restColor, depolarizedColor, in.actionPotential);
  if (in.actionPotential > 1.0) {
    finalColor = mix(finalColor, eadSpikeColor, in.actionPotential - 1.0);
  }

  // Emissive Fresnel border
  finalColor += vec3<f32>(0.1, 0.75, 0.95) * fresnel * 0.55;

  out.color = vec4<f32>(finalColor, 0.95);
  out.pickId = u.meshPartId;

  return out;
}
`;
