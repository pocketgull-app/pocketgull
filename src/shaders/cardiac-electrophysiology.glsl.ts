/**
 * GLSL ES 3.00 Shader for WebGL 2.0 Fallback Tier
 * 
 * Provides 100% feature and visual parity with the WGSL pipeline:
 * - 5-phase action potential
 * - Apex-to-base conduction wavefront
 * - Systolic contraction deformation
 * - MRT (Multiple Render Targets): location 0 = color, location 1 = uint pickId
 */

export const CARDIAC_ELECTROPHYSIOLOGY_GLSL_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

uniform mat4 uViewProjMatrix;
uniform mat4 uModelMatrix;
uniform float uTimeSec;
uniform float uHeartRateBpm;
uniform float uConductionVelocity;
uniform float uQtcIntervalMs;
uniform float uEadInstability;

out vec3 vWorldPos;
out vec3 vWorldNormal;
out vec2 vUv;
out float vActionPotential;

void main() {
    float cycleFreq = uHeartRateBpm / 60.0;
    float cycleTime = fract(uTimeSec * cycleFreq);

    float waveDist = aPosition.y * 0.25 + 0.5;
    float wavePhase = fract(cycleTime - waveDist * (1.0 / max(0.2, uConductionVelocity)));

    float upstroke = smoothstep(0.0, 0.04, wavePhase) * (1.0 - smoothstep(0.04, 0.08, wavePhase));

    float plateauNorm = clamp((uQtcIntervalMs - 380.0) / 220.0, 0.0, 1.0);
    float plateauDuration = mix(0.25, 0.45, plateauNorm);
    float plateau = smoothstep(0.04, 0.08, wavePhase) * (1.0 - smoothstep(plateauDuration, plateauDuration + 0.15, wavePhase));

    float eadFlutter = 0.0;
    if (uEadInstability > 0.05) {
        float inWindow = step(0.15, wavePhase) * (1.0 - step(plateauDuration + 0.1, wavePhase));
        eadFlutter = sin(uTimeSec * 45.0 + aPosition.y * 12.0) * uEadInstability * inWindow * 0.15;
    }

    float vm = clamp(upstroke * 1.2 + plateau * 0.85 + eadFlutter, 0.0, 1.2);
    vActionPotential = vm;

    float contraction = plateau * 0.06;
    vec3 displaced = aPosition - aNormal * contraction;

    vec4 worldPos = uModelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize((uModelMatrix * vec4(aNormal, 0.0)).xyz);
    vUv = aUv;

    gl_Position = uViewProjMatrix * worldPos;
}
`;

export const CARDIAC_ELECTROPHYSIOLOGY_GLSL_FS = `#version 300 es
precision highp float;
precision highp int;

in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec2 vUv;
in float vActionPotential;

uniform vec3 uCameraPos;
uniform uint uMeshPartId;
uniform float uTimeSec;
uniform float uCircadianTone;
uniform float uVagalResonance;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out uint pickId;

void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 3.0);

    // Neuro-Ergonomic & Circadian Color Temperature Mapping (RSNA Standard):
    vec3 dayRestColor = vec3(0.04, 0.08, 0.16);
    vec3 nightRestColor = vec3(0.12, 0.07, 0.02);
    vec3 restColor = mix(dayRestColor, nightRestColor, uCircadianTone);

    vec3 dayDepolarized = vec3(0.96, 0.25, 0.35);
    vec3 nightDepolarized = vec3(0.98, 0.46, 0.14);
    vec3 depolarizedColor = mix(dayDepolarized, nightDepolarized, uCircadianTone);

    vec3 eadSpikeColor = mix(vec3(1.0, 0.85, 0.2), vec3(1.0, 0.65, 0.1), uCircadianTone);

    vec3 finalColor = mix(restColor, depolarizedColor, vActionPotential);
    if (vActionPotential > 1.0) {
        finalColor = mix(finalColor, eadSpikeColor, vActionPotential - 1.0);
    }

    // 0.1 Hz Vagal Parasympathetic Rhythm Modulation
    float vagalWave = sin(uTimeSec * 0.628318) * 0.5 + 0.5;
    float vagalGlow = vagalWave * uVagalResonance * 0.12;
    finalColor += vec3(0.15, 0.42, 0.22) * vagalGlow;

    // Emissive Fresnel border: softened in night mode
    vec3 fresnelColor = mix(vec3(0.1, 0.75, 0.95), vec3(0.85, 0.60, 0.20), uCircadianTone);
    float fresnelStrength = mix(0.55, 0.22, uCircadianTone);
    finalColor += fresnelColor * fresnel * fresnelStrength;

    // Blue Wavelength (480nm) Attenuation
    if (uCircadianTone > 0.15) {
        float blueAtten = 1.0 - (uCircadianTone - 0.15) * 0.82;
        finalColor.z *= clamp(blueAtten, 0.15, 1.0);
    }

    fragColor = vec4(finalColor, 0.95);
    pickId = uMeshPartId;
}
`;
