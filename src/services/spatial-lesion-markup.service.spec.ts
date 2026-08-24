import { SpatialLesionMarkupService } from './spatial-lesion-markup.service';

describe('SpatialLesionMarkupService Unit Suite', () => {
  let service: SpatialLesionMarkupService;

  beforeEach(() => {
    service = new SpatialLesionMarkupService();
  });

  it('1. Initializes with empty active lesions and disabled markup mode', () => {
    expect(service.activeLesions().length).toBe(0);
    expect(service.isMarkupMode()).toBe(false);
    expect(service.selectedLesionId()).toBeNull();
    expect(service.selectedLesion()).toBeNull();
  });

  it('2. Toggles markup mode state reactively', () => {
    service.toggleMarkupMode(true);
    expect(service.isMarkupMode()).toBe(true);

    service.toggleMarkupMode(false);
    expect(service.isMarkupMode()).toBe(false);

    service.toggleMarkupMode();
    expect(service.isMarkupMode()).toBe(true);
  });

  it('3. Adds 3D lesion marker and computes reactive counts by severity', () => {
    const lesion1 = service.addLesion({
      label: 'L4/L5 Disc Degeneration',
      partId: 'spine_lumbar',
      position: { x: 0, y: 1.1, z: -0.2 },
      severity: 'critical',
      morphology: 'calcification',
      clinicalNotes: 'Severe axial loading stenosis with radiculopathy'
    });

    expect(lesion1.id).toBeDefined();
    expect(lesion1.snomedCode).toBe('89100005');
    expect(service.activeLesions().length).toBe(1);
    expect(service.selectedLesionId()).toBe(lesion1.id);
    expect(service.selectedLesion()?.label).toBe('L4/L5 Disc Degeneration');

    service.addLesion({
      label: 'Right Patellar Tendonitis',
      partId: 'r_knee',
      position: { x: 0.2, y: 0.5, z: 0.1 },
      severity: 'moderate',
      morphology: 'inflammation',
      clinicalNotes: 'Mild effusion upon flexion'
    });

    service.addLesion({
      label: 'Superficial Forearm Abrasion',
      partId: 'r_arm',
      position: { x: 0.4, y: 1.2, z: 0.0 },
      severity: 'mild',
      morphology: 'erythema',
      clinicalNotes: 'Minor surface friction burn'
    });

    const counts = service.lesionCountBySeverity();
    expect(counts.critical).toBe(1);
    expect(counts.moderate).toBe(1);
    expect(counts.mild).toBe(1);
  });

  it('4. Updates existing lesion attributes and timestamps', () => {
    const lesion = service.addLesion({
      label: 'Thyroid Nodule',
      partId: 'thyroid',
      position: { x: 0, y: 1.5, z: 0.1 },
      severity: 'moderate',
      morphology: 'nodule',
      clinicalNotes: 'TI-RADS 3 finding'
    });

    service.updateLesion(lesion.id, {
      severity: 'critical',
      clinicalNotes: 'TI-RADS 4 suspicious nodule with micro-calcifications'
    });

    const updated = service.activeLesions().find(l => l.id === lesion.id);
    expect(updated?.severity).toBe('critical');
    expect(updated?.clinicalNotes).toContain('TI-RADS 4');
  });

  it('5. Removes individual lesion and clears selection', () => {
    const l1 = service.addLesion({
      label: 'Lesion 1',
      partId: 'head',
      position: { x: 0, y: 1.8, z: 0 },
      severity: 'mild',
      morphology: 'rash',
      clinicalNotes: 'Contact dermatitis'
    });

    expect(service.selectedLesionId()).toBe(l1.id);
    service.removeLesion(l1.id);

    expect(service.activeLesions().length).toBe(0);
    expect(service.selectedLesionId()).toBeNull();
  });

  it('6. Exports active lesions to standardized FHIR R4 3D Spatial Observation bundles', () => {
    service.addLesion({
      label: 'Left Biceps Laceration',
      partId: 'l_arm',
      position: { x: -0.35, y: 1.3, z: 0.05 },
      severity: 'critical',
      morphology: 'laceration',
      clinicalNotes: 'Deep fascial laceration requiring suturing'
    });

    const fhirObservations = service.exportAsFhirObservations('pt-spatial-01');
    expect(fhirObservations.length).toBe(1);

    const obs = fhirObservations[0];
    expect(obs.resourceType).toBe('Observation');
    expect(obs.status).toBe('final');
    expect(obs.subject.reference).toBe('Patient/pt-spatial-01');
    expect(obs.code.coding[0].system).toBe('http://snomed.info/sct');
    expect(obs.code.coding[0].code).toBe('312608009'); // Laceration SNOMED
    expect(obs.interpretation[0].coding[0].code).toBe('AA'); // Critical
    expect(obs.extension[0].url).toContain('spatial-coordinates-3d');
    expect(obs.extension[0].extension.find((e: any) => e.url === 'x').valueDecimal).toBe(-0.35);
  });

  it('7. Recommends therapeutic Solfeggio harmonic based on lesion morphology', () => {
    const l1 = service.addLesion({
      label: 'Patellar Tendonitis',
      partId: 'r_knee',
      position: { x: 0.2, y: 0.5, z: 0.1 },
      severity: 'moderate',
      morphology: 'inflammation',
      clinicalNotes: 'Inflammatory swelling'
    });

    expect(service.selectedLesionId()).toBe(l1.id);
    const harmonic1 = service.recommendedLesionHarmonic();
    expect(harmonic1).toBeDefined();
    expect(harmonic1?.hz).toBe(528);
    expect(harmonic1?.name).toContain('528Hz');

    const l2 = service.addLesion({
      label: 'L4/L5 Calcification',
      partId: 'spine_lumbar',
      position: { x: 0, y: 1.1, z: -0.2 },
      severity: 'critical',
      morphology: 'calcification',
      clinicalNotes: 'Dense osteophyte'
    });

    expect(service.selectedLesionId()).toBe(l2.id);
    const harmonic2 = service.recommendedLesionHarmonic();
    expect(harmonic2?.hz).toBe(174);
  });

  it('8. Toggles 3D acoustic pinning and pins lesion coordinates', () => {
    expect(service.isAcousticPinningActive()).toBe(false);

    const active = service.toggleAcousticPinning();
    expect(active).toBe(true);
    expect(service.isAcousticPinningActive()).toBe(true);

    service.toggleAcousticPinning(false);
    expect(service.isAcousticPinningActive()).toBe(false);
  });
});
