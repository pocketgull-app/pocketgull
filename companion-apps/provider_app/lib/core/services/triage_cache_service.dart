import 'dart:convert';
import '../models/patient.dart';
import '../models/triage_evaluation.dart';
import 'triage_evaluator.dart';

class TriageCacheService {
  static List<Patient> _cachedPatients = [];
  static final List<PatientTriageEvaluation> _cachedEvaluations = [];

  /// In-memory & fallback mock patients for offline resilience
  static List<Patient> get fallbackPatients {
    return [
      Patient(
        id: 'emergency_casualty',
        name: 'Emergency Patient (STAT Trauma)',
        age: 34,
        gender: 'Other',
        lastVisit: '2026-10-01',
        preexistingConditions: const ['Blunt Thoracic Trauma', 'Hypovolemic Shock'],
        state: PatientState(
          vitals: const {
            'bp': '72/48',
            'hr': '152',
            'spO2': '84',
            'temp': '35.1',
          },
          patientGoals: 'Immediate resuscitation, arterial line placement, and blood transfusion.',
          issues: const {
            'chest': 'Bilateral flail chest with severe hypoxemia',
          },
        ),
      ),
      Patient(
        id: 'p_srinivasa_ramanujan',
        name: 'Srinivasa Ramanujan',
        age: 32,
        gender: 'Male',
        lastVisit: '2026-09-28',
        preexistingConditions: const ['Hepatic Amoebiasis', 'Severe Chronic Dysentery', 'Severe Malnutrition'],
        state: PatientState(
          vitals: const {
            'bp': '94/62',
            'hr': '124',
            'spO2': '91',
            'temp': '39.1',
          },
          patientGoals: 'Nutritional stabilization, hepatic parasite eradication, and electrolyte correction.',
          issues: const {
            'abdomen': 'Right upper quadrant hepatic tenderness with pyrexia and hemoptysis',
          },
        ),
      ),
      Patient(
        id: 'p_frida_kahlo',
        name: 'Frida Kahlo',
        age: 47,
        gender: 'Female',
        lastVisit: '2026-09-29',
        preexistingConditions: const ['Post-Traumatic Pelvic Fracture', 'Spinal Dysraphism', 'Chronic Intractable Pain', 'Post-Polio Syndrome'],
        state: PatientState(
          vitals: const {
            'bp': '142/90',
            'hr': '88',
            'spO2': '97',
            'temp': '36.9',
          },
          patientGoals: 'Somatic grounding, neuro-biomechanical pain management, and orthopedic stabilization.',
          issues: const {
            'spine': 'Severe neuropathic spinal radiculopathy with lower extremity hyperalgesia',
          },
        ),
      ),
      Patient(
        id: 'p_charles_darwin',
        name: 'Charles Darwin',
        age: 50,
        gender: 'Male',
        lastVisit: '2026-09-30',
        preexistingConditions: const ['Dyspepsia', 'Palpitations', 'Exhaustion', 'Psychogenic Eczema'],
        state: PatientState(
          vitals: const {
            'bp': '128/82',
            'hr': '78',
            'spO2': '98',
            'temp': '36.7',
          },
          patientGoals: 'Autonomic nervous system balancing and elimination of gastric distress.',
          issues: const {
            'stomach': 'Chronic postprandial nausea and autonomic palpitations',
          },
        ),
      ),
      Patient(
        id: 'p_marie_curie',
        name: 'Marie Curie',
        age: 66,
        gender: 'Female',
        lastVisit: '2026-09-27',
        preexistingConditions: const ['Aplastic Anemia', 'Chronic Radium Exposure', 'Radiation Dermatitis'],
        state: PatientState(
          vitals: const {
            'bp': '106/68',
            'hr': '96',
            'spO2': '94',
            'temp': '37.8',
          },
          patientGoals: 'Bone marrow protective support and reduction of oxidative cellular damage.',
          issues: const {
            'bone_marrow': 'Pancytopenia with severe fatigue and microvascular petechiae',
          },
        ),
      ),
      Patient(
        id: 'p_poms_adolescent',
        name: 'Alex Rivera (POMS Adolescent)',
        age: 14,
        gender: 'Female',
        lastVisit: '2026-09-26',
        preexistingConditions: const ['Pediatric-Onset Multiple Sclerosis', 'Optic Neuritis'],
        state: PatientState(
          vitals: const {
            'bp': '112/74',
            'hr': '82',
            'spO2': '99',
            'temp': '36.6',
          },
          patientGoals: 'Preserve visual acuity, prevent demyelinating flares, and pediatric neuro-rehab.',
          issues: const {
            'eyes': 'Subacute unilateral retrobulbar optic neuritis with relative afferent pupillary defect',
          },
        ),
      ),
      Patient(
        id: 'p_mara_santos',
        name: 'Mara Santos',
        age: 38,
        gender: 'Female',
        lastVisit: '2026-09-25',
        preexistingConditions: const ['Gestational Hypertension', 'Postpartum Cardiomyopathy Screening'],
        state: PatientState(
          vitals: const {
            'bp': '158/98',
            'hr': '102',
            'spO2': '96',
            'temp': '36.8',
          },
          patientGoals: 'Vascular stabilization, blood pressure titration, and postpartum maternal monitoring.',
          issues: const {
            'cardiovascular': 'Persistent systolic elevation with bilateral ankle pitting edema',
          },
        ),
      ),
    ];
  }

  /// Load patients, utilizing fallback if input is empty
  static List<PatientTriageEvaluation> loadTriageEvaluations(List<Patient> patients) {
    _cachedPatients = patients.isNotEmpty ? patients : fallbackPatients;
    _cachedEvaluations.clear();
    for (final p in _cachedPatients) {
      _cachedEvaluations.add(TriageEvaluator.evaluate(p));
    }
    // Sort primarily by ESI Level (1 to 5), secondarily by NEWS2 Score (highest first)
    _cachedEvaluations.sort((a, b) {
      final cmp = a.esiLevel.levelNumber.compareTo(b.esiLevel.levelNumber);
      if (cmp != 0) return cmp;
      return b.news2Score.compareTo(a.news2Score);
    });
    return List.unmodifiable(_cachedEvaluations);
  }

  /// Export current triage dataset into FHIR R4 Bundle JSON format
  static String exportToFhirR4Bundle() {
    final entries = <Map<String, dynamic>>[];

    for (final t in _cachedEvaluations) {
      // 1. Patient Resource
      entries.add({
        'fullUrl': 'urn:uuid:${t.patientId}',
        'resource': {
          'resourceType': 'Patient',
          'id': t.patientId,
          'name': [
            {'text': t.patientName}
          ],
          'gender': t.gender.toLowerCase(),
          'extension': [
            {
              'url': 'http://pocketgull.app/fhir/StructureDefinition/esi-acuity',
              'valueInteger': t.esiLevel.levelNumber,
            },
            {
              'url': 'http://pocketgull.app/fhir/StructureDefinition/news2-score',
              'valueInteger': t.news2Score,
            },
            if (t.accompaniedBy != null)
              {
                'url': 'http://pocketgull.app/fhir/StructureDefinition/accompanied-by',
                'valueString': t.accompaniedBy!.label,
              },
            if (t.languageAccess != null)
              {
                'url': 'http://pocketgull.app/fhir/StructureDefinition/language-access',
                'valueCodeableConcept': {
                  'text': t.languageAccess!.preferredLanguage,
                  'coding': [
                    {
                      'system': 'http://pocketgull.app/fhir/language-access',
                      'code': t.languageAccess!.interpreterNeeded ? 'INTERPRETER_REQUIRED' : 'DIRECT_COMMUNICATION',
                      'display': t.languageAccess!.modality,
                    }
                  ]
                }
              },
          ]
        }
      });

      // 2. NEWS2 Observation Resource
      entries.add({
        'fullUrl': 'urn:uuid:${t.patientId}-news2',
        'resource': {
          'resourceType': 'Observation',
          'id': '${t.patientId}-news2',
          'status': 'final',
          'code': {
            'coding': [
              {
                'system': 'http://loinc.org',
                'code': '96552-5',
                'display': 'National Early Warning Score 2 (NEWS2)',
              }
            ]
          },
          'subject': {'reference': 'Patient/${t.patientId}'},
          'valueInteger': t.news2Score,
        }
      });
    }

    final bundle = {
      'resourceType': 'Bundle',
      'id': 'pocketgull-triage-bundle-${DateTime.now().millisecondsSinceEpoch}',
      'type': 'searchset',
      'total': entries.length,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
      'entry': entries,
    };

    return const JsonEncoder.withIndent('  ').convert(bundle);
  }
}
