import React, { useState } from 'react';
import { UsaBanner } from './UsaBanner.js';
import { UsaHeader } from './UsaHeader.js';
import { UsaStepIndicator } from './UsaStepIndicator.js';
import { VaNexusOpinionCard } from './VaNexusOpinionCard.js';
import { UsaSummaryBox } from './UsaSummaryBox.js';
import { UsaAlert } from './UsaAlert.js';
import { UsaFhirMatrix } from './UsaFhirMatrix.js';
import { FederalBannerMode, VaPatientProfile, MedicalNexusOpinion, FhirRow, StepItem } from './types.js';

export interface FederalWorkstationProps {
  initialMode?: FederalBannerMode;
  patient?: VaPatientProfile;
  nexusOpinion?: MedicalNexusOpinion;
  fhirRows?: FhirRow[];
  onExit?: () => void;
  className?: string;
}

const DEFAULT_PATIENT: VaPatientProfile = {
  id: 'VA-77042',
  code: 'VET-8831',
  name: 'Sgt. Marcus Vance (De-identified)',
  age: 44,
  gender: 'Male',
  branch: 'US Army (OIF / OEF Veteran)',
  serviceEra: 'Post-9/11 (2003–2011)',
  theater: 'Balad AB & Camp Anaconda, Iraq (Burn Pit Proximity)',
  pactActPresumptive: true,
  chiefComplaint: 'Chronic constrictive bronchiolitis, blast-related bilateral sensorineural hearing loss, and patellofemoral pain syndrome',
  vaDisabilityRating: '70% Combined Service-Connected',
  vitals: {
    bp: '128/82 mmHg',
    hr: '68 bpm',
    spo2: '97% on room air',
    bmi: '26.4 kg/m²',
  },
  conditions: [
    'Constrictive Bronchiolitis (38 U.S.C. § 1119 Presumptive)',
    'Sensorineural Hearing Loss (38 CFR § 4.87)',
    'Patellofemoral Pain Syndrome (Left Knee)',
  ],
};

const DEFAULT_NEXUS: MedicalNexusOpinion = {
  condition: 'Constrictive Bronchiolitis & Bilateral Sensorineural Hearing Loss',
  serviceConnectionLikelihood: 'At least as likely as not (50% or greater probability)',
  statutoryStandard: '38 CFR § 4.87 & PACT Act Presumptive Standards (38 U.S.C. § 1119)',
  objectiveEvidence: [
    'High-resolution expiratory CT confirming mosaic attenuation and air trapping',
    'Audiometric evaluation showing bilateral 4000 Hz notch at 55 dB',
    'Documented DD-214 service record verifying 14 months at Balad Air Base burn pit perimeter',
  ],
  rationale:
    'Based on the Veteran’s documented military MOS, prolonged burn pit proximity at Balad Air Base, and the absence of pre-service pulmonary pathology, it is at least as likely as not that the diagnosed constrictive bronchiolitis and sensorineural hearing loss are etiologically related to active military service.',
  sha256Attestation: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
};

const DEFAULT_STEPS: StepItem[] = [
  { id: 1, label: 'Chief Complaint', status: 'complete' },
  { id: 2, label: 'Symptom Onset', status: 'current' },
  { id: 3, label: 'Exposure Screening', status: 'incomplete' },
  { id: 4, label: 'Clinician Attestation', status: 'incomplete' },
];

const DEFAULT_FHIR: FhirRow[] = [
  {
    resourceType: 'Patient',
    profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
    element: 'identifier[mrn]',
    value: 'VA-77042',
    codingSystem: 'urn:oid:2.16.840.1.113883.4.349',
    code: 'MRN',
  },
  {
    resourceType: 'Condition',
    profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-problems-health-concerns',
    element: 'code',
    value: 'Constrictive Bronchiolitis',
    codingSystem: 'http://snomed.info/sct',
    code: '4481000119102',
  },
  {
    resourceType: 'MedicationRequest',
    profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest',
    element: 'medicationCodeableConcept',
    value: 'Lisinopril 10 mg daily',
    codingSystem: 'http://www.nlm.nih.gov/research/umls/rxnorm',
    code: '314076',
  },
];

export const FederalWorkstation: React.FC<FederalWorkstationProps> = ({
  initialMode = 'community-partner',
  patient = DEFAULT_PATIENT,
  nexusOpinion = DEFAULT_NEXUS,
  fhirRows = DEFAULT_FHIR,
  onExit,
  className = '',
}) => {
  const [mode, setMode] = useState<FederalBannerMode>(initialMode);
  const [activeTab, setActiveTab] = useState<'plan' | 'intake' | 'fhir' | 'audit'>('plan');
  const [currentStep, setCurrentStep] = useState(2);
  const [steps, setSteps] = useState<StepItem[]>(DEFAULT_STEPS);
  const [attested, setAttested] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`federal-workstation-container bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 ${className}`}>
      {/* 1. USWDS Accessible Banner (Suppressed on print) */}
      <div className="print:hidden">
        <UsaBanner mode={mode} onModeChange={setMode} />
      </div>

      {/* 2. Print-Only Clinical Letterhead */}
      <div id="print-clinical-letterhead" className="hidden print:block p-6 border-b-2 border-zinc-900 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              {mode === 'official-gov'
                ? 'Department of Veterans Affairs &bull; Veterans Health Administration'
                : 'VA Community Care Network (CCN) &bull; Private Practice Care Plan'}
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Clinical Decision Support &amp; Medical Nexus Statement &bull; 38 CFR § 4.87 / 38 U.S.C. § 1119
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div>Patient: {patient.id}</div>
            <div>Date: {new Date().toLocaleDateString('en-US')}</div>
          </div>
        </div>
      </div>

      {/* 3. Header Bar */}
      <UsaHeader
        title={mode === 'official-gov' ? 'VA Boston Healthcare System' : 'Beacon Hill Community Health &bull; VA CCN'}
        agency={mode === 'official-gov' ? 'Veterans Health Administration' : 'Independent Healthcare Practice (18 U.S.C. § 701)'}
        mode={mode}
        onExit={onExit}
      />

      {/* 4. Perspective Mode Switcher Bar (Screen only) */}
      <div className="print:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Workstation View:
            </span>
            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-800">
              <button
                type="button"
                id="btn-mode-community-partner"
                onClick={() => setMode('community-partner')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'community-partner'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                ⚕️ Private Practice (VA CCN)
              </button>
              <button
                type="button"
                id="btn-mode-official-gov"
                onClick={() => setMode('official-gov')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'official-gov'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                🏛️ Official Federal Host (.gov)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              🖨️ Print Plan (Letterhead)
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Navigation Tabs (Screen only) */}
      <nav className="print:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'plan'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            📋 Veteran CDS Care Plan &amp; Nexus
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intake')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'intake'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            📝 Clinical Intake &amp; Triage Steps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fhir')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'fhir'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            ⚡ FHIR US Core R4 Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            🛡️ Section 508 &amp; IDEA Act Audit
          </button>
        </div>
      </nav>

      {/* 6. Body Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Patient Summary Card */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Veteran Subject #{patient.id}
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {patient.name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {patient.vaDisabilityRating}
              </span>
              {patient.pactActPresumptive && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  PACT Act Toxic Exposure Presumptive
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block">Branch &amp; Era:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{patient.branch}</span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block">Primary Vitals:</span>
              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                BP <span className="whitespace-nowrap">{patient.vitals.bp}</span> &bull; HR {patient.vitals.hr}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block">Theater Location:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{patient.theater}</span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block">Medication:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                <span className="whitespace-nowrap">Lisinopril 10 mg daily</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: Plan & Nexus */}
        {(activeTab === 'plan' || typeof window === 'undefined') && (
          <div className="space-y-6">
            <VaNexusOpinionCard opinion={nexusOpinion} mode={mode} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Act 1: Past Hurdles
                </h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-wrap-pretty">
                  Prolonged burn pit inhalation and IED blast concussion during active deployment in Al-Anbar.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                  Act 2: Today&apos;s Baseline
                </h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-wrap-pretty">
                  Resting vitals stable; intermittent dyspnea upon physical exertion managed with daily therapy.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
                  Act 3: 90-Day Vitality Roadmap
                </h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-wrap-pretty">
                  Target 20% improvement in 6-minute walk distance and restorative sleep duration.
                </p>
              </div>
            </div>

            {/* Print Attestation Block */}
            <div className="p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                Attending Clinician Signature &amp; Part 11 Attestation
              </span>
              <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                I hereby certify under penalty of law that the findings recorded herein represent my independent medical judgment based upon direct clinical examination.
              </p>
              <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="font-mono text-zinc-500">Digital Seal: SHA256:{nexusOpinion.sha256Attestation.substring(0, 16)}...</div>
                  <div className="text-zinc-700 dark:text-zinc-300 font-medium mt-1">Verified via FDA 21 CFR Part 11 Digital Signature</div>
                </div>
                <div className="text-right">
                  <div className="border-b border-zinc-400 w-48 mb-1" />
                  <div className="text-zinc-500">Attending Physician / CCN Provider</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Intake */}
        {activeTab === 'intake' && (
          <div className="space-y-6">
            <UsaStepIndicator
              currentStep={currentStep}
              steps={steps}
              headingText="Step 2: Approximate Date of Symptom Onset"
            />

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Clinical Chief Complaint &amp; History
              </h3>
              <textarea
                id="complaint-input"
                defaultValue={patient.chiefComplaint}
                rows={3}
                className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="text-right text-[11px] text-zinc-400">
                420 characters remaining
              </div>

              <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next Step →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: FHIR */}
        {activeTab === 'fhir' && (
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <UsaFhirMatrix rows={fhirRows} />
          </div>
        )}

        {/* Tab 4: Section 508 Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <UsaAlert type="success" heading="100% AUDIT PASS: Section 508 &amp; 21st Century IDEA Act">
              This federal edition strictly complies with Section 508 of the Rehabilitation Act, OMB Memorandum M-23-22, and WCAG 2.1 Level AAA optotypic legibility.
            </UsaAlert>

            <UsaSummaryBox heading="Statutory Demarcation &amp; Safe Harbor Verification">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>18 U.S.C. § 701 Safe Harbor:</strong> Non-governmental civilian demarcation active by default.</li>
                <li><strong>VA MISSION Act (P.L. 115-182):</strong> Full interoperability with VA Community Care Network.</li>
                <li><strong>38 U.S.C. § 1119 (PACT Act):</strong> Automatic toxic exposure presumptive screening engine.</li>
                <li><strong>Typography Physics:</strong> Non-breaking dosage formatting and print-isolated letterhead stationery.</li>
              </ul>
            </UsaSummaryBox>
          </div>
        )}
      </main>
    </div>
  );
};
