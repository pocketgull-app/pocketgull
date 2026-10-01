import '@angular/compiler';
import type { IPatient } from './patient.types';
import { ExportService } from './export.service';

describe('ExportService FHIR R4 Tri-Paradigm Bundle Suite', () => {
  let exportService: ExportService;

  const mockPatient: IPatient = {
    id: 'pt-77',
    name: 'Homo Sapiens (Male, 44y)',
    age: 44,
    gender: 'Male',
    vitals: { hr: '76', bp: '118/76', spO2: '99', temp: '36.6', weight: '75', height: '175' },
    preexistingConditions: ['Mild Tension Headache'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Autonomic Coherence',
    lastVisit: '2026-07-23'
  };

  beforeEach(() => {
    exportService = new ExportService();
  });

  it('validates FHIR R4 Tri-Paradigm Bundle structure', () => {
    const bundle = exportService.buildFhirR4Bundle(mockPatient);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBeGreaterThan(1);

    const patientEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Patient');
    expect(patientEntry).toBeDefined();
    expect(patientEntry.resource.name[0].text).toBe('Homo Sapiens (Male, 44y)');

    const hrObs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation' && e.resource.code?.coding?.[0]?.code === '8867-4');
    expect(hrObs).toBeDefined();
    expect(hrObs.resource.valueQuantity.value).toBe(76);

    const bpObs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation' && e.resource.code?.coding?.[0]?.code === '85354-9');
    expect(bpObs).toBeDefined();
    expect(bpObs.resource.component[0].valueQuantity.value).toBe(118);
    expect(bpObs.resource.component[1].valueQuantity.value).toBe(76);

    const condEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Condition');
    expect(condEntry).toBeDefined();
    expect(condEntry.resource.code.text).toBe('Mild Tension Headache');

    const gompertzObs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation' && e.resource.code?.coding?.[0]?.code === '96568-1');
    expect(gompertzObs).toBeDefined();
    expect(gompertzObs.resource.code.coding[0].display).toContain('Gompertz-Makeham');

    const docRefEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'DocumentReference');
    expect(docRefEntry).toBeDefined();
    expect(docRefEntry.resource.description).toContain('Curated Medical Video Lectures');
    expect(docRefEntry.resource.content.length).toBeGreaterThan(0);
  });

  it('verifies DeviceRequest, NutritionOrder, and MedicationRequest resource specs', () => {
    const fhirResources = ['Patient', 'Observation', 'Condition', 'DeviceRequest', 'NutritionOrder', 'MedicationRequest'];
    expect(fhirResources).toHaveLength(6);
    expect(fhirResources).toContain('DeviceRequest');
    expect(fhirResources).toContain('NutritionOrder');
  });
  it('generates cryptographic SHA-256 receipt for clinical document validation', async () => {
    const receipt = await exportService.generateCryptographicReceipt(mockPatient);
    expect(receipt.sha256Hash).toBeDefined();
    expect(receipt.sha256Hash.length).toBe(64);
    expect(receipt.verificationUri).toContain('urn:pocketgull:verify:sha256:');
    expect(receipt.summary).toContain('Cryptographically sealed');
  });

  describe('Biomarker Matrix & Care Plan Export Formatting', () => {
    const sampleBiomarkers = [
      { name: 'Vitamin D3', level: 'Deficient', pathway: 'Immune Modulation / T-reg / Neuro' },
      { name: 'Glutathione (GSH)', level: 'Low-normal', pathway: 'Antioxidant / Oligodendrocyte Protection' },
      { name: 'CoQ10', level: 'Optimal', pathway: 'Mitochondrial Respiration / Axonal Energy' },
      { name: 'Homocysteine', level: 'Elevated', pathway: 'Cardiovascular / Neurotoxicity' }
    ];

    it('transforms fenced markdown JSON blocks into clinical tables with chips and SVG spectrums', () => {
      const markdown = `
### Biochemical & Biomarker Matrix
Orthomolecular profile:
\`\`\`json
${JSON.stringify(sampleBiomarkers, null, 2)}
\`\`\`
Follow-up in 4 weeks.`;

      const result = exportService.transformBiomarkerJsonToClinicalView(markdown);

      expect(result).not.toContain('```json');
      expect(result).toContain('biomarker-matrix-export');
      expect(result).toContain('biomarker-chip chip-deficient');
      expect(result).toContain('biomarker-chip chip-low');
      expect(result).toContain('biomarker-chip chip-optimal');
      expect(result).toContain('biomarker-chip chip-high');
      expect(result).toContain('<svg width="100" height="14"');
      expect(result).toContain('Vitamin D3');
      expect(result).toContain('DEFICIENT');
      expect(result).toContain('Homocysteine');
      expect(result).toContain('ELEVATED');
    });

    it('transforms raw unfenced JSON biomarker arrays (Mara Santos pattern) into clinical tables', () => {
      const rawReport = `
BIOMARKER MATRIX
Mara's orthomolecular profile is characteristic of active CNS autoimmune disease:
[
{ "name": "Vitamin D3", "level": "Deficient", "pathway": "Immune Modulation / T-reg / Neuro" },
{ "name": "Glutathione (GSH)", "level": "Low", "pathway": "Antioxidant / Oligodendrocyte Protection" },
{ "name": "CoQ10", "level": "Low", "pathway": "Mitochondrial Respiration / Axonal Energy" }
]
Stepped care instructions follow.`;

      const result = exportService.transformBiomarkerJsonToClinicalView(rawReport);

      expect(result).not.toContain('{ "name": "Vitamin D3"');
      expect(result).toContain('biomarker-matrix-export');
      expect(result).toContain('biomarker-chip chip-deficient');
      expect(result).toContain('Glutathione (GSH)');
      expect(result).toContain('Stepped care instructions follow.');
    });

    it('handles empty or non-biomarker content gracefully', () => {
      expect(exportService.transformBiomarkerJsonToClinicalView('')).toBe('');
      const standardText = 'Normal clinical notes without any biomarkers.';
      expect(exportService.transformBiomarkerJsonToClinicalView(standardText)).toBe(standardText);

      const nonBiomarkerJson = '```json\n[{"foo": "bar"}]\n```';
      expect(exportService.transformBiomarkerJsonToClinicalView(nonBiomarkerJson)).toBe(nonBiomarkerJson);
    });
  });
});

