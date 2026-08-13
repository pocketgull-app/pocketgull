import * as fs from 'fs';
import * as path from 'path';

export interface IFineTuningRecord {
  instruction: string;
  input: string;
  output: string;
  chosen?: string;
  rejected?: string;
}

export function generateSyntheticClinicalDataset(): IFineTuningRecord[] {
  const dataset: IFineTuningRecord[] = [
    {
      instruction: "Calculate Medicare IRMAA surcharges and evaluate Form SSA-44 Life-Changing Event appeal savings.",
      input: JSON.stringify({ magiUsd: 105000, filingStatus: 'single', activeEvents: ['RETIREMENT'] }, null, 2),
      output: JSON.stringify({
        tier: "Tier 1",
        partBMonthlySurchargeUsd: 70.00,
        partDMonthlySurchargeUsd: 13.70,
        annualTotalSurchargeUsd: 1004.40,
        appealEligible: true,
        recommendedForm: "SSA-44",
        qualifyingEvents: ["Work Stoppage / Retirement"],
        estimatedAnnualSavingsUsd: 1004.40
      }, null, 2),
      chosen: "Patient qualifies for Form SSA-44 appeal due to Work Stoppage. Estimated annual savings: $1,004.40. Baseline income falls under standard tier post-appeal.",
      rejected: "Patient income is over threshold. Pay surcharge directly without appeal."
    },
    {
      instruction: "Initiate SMART-on-FHIR OAuth2 launch parameters with PKCE S256 challenge for Epic MyChart EHR.",
      input: JSON.stringify({ vendor: 'EPIC', iss: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4' }, null, 2),
      output: JSON.stringify({
        vendor: "EPIC",
        authorizationUrl: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize",
        codeChallengeMethod: "S256",
        scope: "launch/patient patient/Patient.read patient/Condition.read openid fhirUser",
        pkceSupported: true
      }, null, 2),
      chosen: "Generates cryptographic high-entropy S256 code challenge and PKCE verifier for Epic MyChart EHR launch.",
      rejected: "Uses plain text OAuth state without PKCE verification."
    },
    {
      instruction: "Render WebGPU 3D biophysical organ digital twin frame vectors and WGSL shader parameters.",
      input: JSON.stringify({ organ: 'HEART', heartRateBpm: 80, perfusionMlMin: 250 }, null, 2),
      output: JSON.stringify({
        organ: "HEART",
        perfusionMlMin: 250,
        meshDisplacementVector: [0.12, 0.05, 0.08],
        cellularMetabolicStressScore: 32,
        wgslShaderUniforms: { u_perfusionRate: 250.0, u_heartBeatScale: 1.05 }
      }, null, 2),
      chosen: "Computes 3D ventricular mesh displacement and WGSL fragment shader uniform parameters for WebGPU cardiac rendering.",
      rejected: "Returns static 2D image without 3D spatial biophysics."
    },
    {
      instruction: "Prescribe evidence-based clinical musicology and micro-flourishing daily activity.",
      input: JSON.stringify({ permaScore: 68, activeStressors: ['work fatigue'] }, null, 2),
      output: JSON.stringify({
        title: "🎼 Acoustic Neuro-Rhythm & Harmonic Entrainment",
        durationMinutes: 10,
        mechanism: "60 BPM acoustic classical entrainment (Bach/Mozart)",
        alphaWaveSynchronization: "8-12 Hz thalamocortical alpha-wave sync",
        salivaryCortisolReductionPct: 22
      }, null, 2),
      chosen: "Prescribes 10-minute 60 BPM acoustic neuro-rhythms to promote thalamocortical alpha-wave synchronization and reduce salivary cortisol by 22%.",
      rejected: "Recommends generic uncalibrated background noise."
    }
  ];

  return dataset;
}

function main() {
  const dataset = generateSyntheticClinicalDataset();
  const outputDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'fine_tuning_clinical_dataset.jsonl');
  const jsonlContent = dataset.map(record => JSON.stringify(record)).join('\n');
  fs.writeFileSync(outputPath, jsonlContent, 'utf-8');

  console.log(`✅ Exported ${dataset.length} fine-tuning records to ${outputPath}`);
}

main();
