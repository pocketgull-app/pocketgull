/// DICOM Study metadata for Tele-Radiology and Multi-Frame Cine Review.
class DicomStudy {
  final String studyInstanceUid;
  final String patientName;
  final String patientId;
  final String studyDate;
  final String studyDescription;
  final List<String> modalities;
  final int frameCount;
  final int frameRateFps;
  final double sliceThicknessMm;
  final String findings;
  final String clinicalImpression;

  const DicomStudy({
    required this.studyInstanceUid,
    required this.patientName,
    required this.patientId,
    required this.studyDate,
    required this.studyDescription,
    required this.modalities,
    required this.frameCount,
    this.frameRateFps = 24,
    this.sliceThicknessMm = 3.0,
    required this.findings,
    required this.clinicalImpression,
  });

  /// Default mock studies aligned with the Pocket-Gull clinical roster.
  static const List<DicomStudy> defaultStudies = [
    DicomStudy(
      studyInstanceUid: '1.2.840.113619.2.134.1.phil.1',
      patientName: 'Phil Gear (Homo Sapiens, Male, 38y)',
      patientId: 'p_default_patient',
      studyDate: '2026-07-16',
      studyDescription: 'Lumbar Spine MRI (L4-L5 herniation check)',
      modalities: ['MR'],
      frameCount: 32,
      frameRateFps: 24,
      sliceThicknessMm: 3.0,
      findings: 'L4-L5 posterior disc protrusion with mild thecal sac impingement. Neural foramina patent bilaterally. Minimal annular fissure noted at midline.',
      clinicalImpression: 'Grade 1 focal herniation. Conservative physical genomics stabilization and posture biomechanics recommended.',
    ),
    DicomStudy(
      studyInstanceUid: '1.2.840.113619.2.134.1.darwin.1',
      patientName: 'Charles Darwin (Male, 73y)',
      patientId: 'p_darwin',
      studyDate: '2026-06-12',
      studyDescription: 'Abdominal CT & Esophageal Motility',
      modalities: ['CT'],
      frameCount: 24,
      frameRateFps: 18,
      sliceThicknessMm: 2.5,
      findings: 'Epigastric mucosal thinning, normal biliary duct caliber. No obstructive nephrolithiasis.',
      clinicalImpression: 'Consistent with systemic neuro-visceral dysautonomia. Hydration and gut microbiome support indicated.',
    ),
    DicomStudy(
      studyInstanceUid: '1.2.840.113619.2.134.1.kahlo.1',
      patientName: 'Frida Kahlo (Female, 47y)',
      patientId: 'p_kahlo',
      studyDate: '2026-05-20',
      studyDescription: 'Spinal Reconstruction CT (T12-L3 Fusion)',
      modalities: ['CT', 'XR'],
      frameCount: 36,
      frameRateFps: 24,
      sliceThicknessMm: 1.5,
      findings: 'Posterior instrumentation T12-L3 intact. Chronic osteophytic bridging at L2-L3. Pelvic asymmetry consistent with prior orthopedic trauma.',
      clinicalImpression: 'Stable hardware. Neuropathic pain management and gentle restorative hydrotherapy advised.',
    ),
  ];
}
