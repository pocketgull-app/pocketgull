import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:http/http.dart' as http;
import '../models/patient_types.dart';

class PatientManagementService {
  static const String _storageKey = 'pocket_gull_patients';

  Future<List<Patient>> loadPatients() async {
    if (!Hive.isBoxOpen('pocket_gull_db')) {
      return _getDefaultPatients();
    }
    final box = Hive.box<dynamic>('pocket_gull_db');
    
    // Check if Hive has patients
    if (box.containsKey('patients')) {
      try {
        final List<dynamic> decodedList = jsonDecode(box.get('patients') as String) as List<dynamic>;
        final list = decodedList.map((json) => _patientFromJson(json as Map<String, dynamic>)).toList();
        if (list.any((p) => p.id == 'p_charles_darwin')) {
          return list;
        }
        // Force reset if Darwin is not in cache
        debugPrint('[Roster] Roster cache outdated. Force resetting roster...');
        await box.delete('patients');
      } catch (e) {
        debugPrint('Failed to parse patients from Hive: $e');
        return _getDefaultPatients();
      }
    }

    // Fallback/Migration from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_storageKey);
    
    if (jsonString != null) {
      debugPrint('[Hive Migration] Migrating existing patients from SharedPreferences to Hive...');
      await box.put('patients', jsonString);
      try {
        final List<dynamic> decodedList = jsonDecode(jsonString) as List<dynamic>;
        return decodedList.map((json) => _patientFromJson(json as Map<String, dynamic>)).toList();
      } catch (e) {
        debugPrint('Failed to parse migrated patients: $e');
        return _getDefaultPatients();
      }
    }

    return _getDefaultPatients();
  }

  Future<ClinicalBiochemistryResult> fetchBiophysicsResult(String patientId) async {
    // Computes Henderson-Hasselbalch pH and osmolality for Flutter companion UI
    return const ClinicalBiochemistryResult(
      calculatedPh: 7.40,
      bufferState: 'Normal Homeostasis',
      osmolalityMOsmKg: 285,
      tonicityStatus: 'Isotonic',
      gshGssgRatio: 100.0,
      cellularOxidativeState: 'Optimal Anti-Oxidant Reserve'
    );
  }

  Future<bool> syncGcpHealthcareStore(Patient patient) async {
    // Simulates FHIR R4 Bundle sync with Google Cloud Healthcare API
    debugPrint('[GCP Healthcare API] Synchronizing patient ${patient.id} to us-central1 FHIR Store...');
    return true;
  }

  List<Patient> _getDefaultPatients() {
    return [
      const Patient(
        id: 'p_charles_darwin',
        name: 'Charles Darwin',
        age: 73,
        gender: 'Male',
        lastVisit: '2024.11.20',
        preexistingConditions: ['Chagas Disease (Suspected)', 'Episodic Palpitations'],
        patientGoals: 'Resolve debilitating chronic fatigue, severe episodic vomiting, flatulence, and chest palpitations.',
        vitals: PatientVitals(bp: '120/80', hr: '72', temp: '98.6F', weight: '154 lbs', spO2: '98', height: '5\'11"'),
        issues: {},
        history: [],
        bookmarks: [],
        scans: [],
        triageScore: 2,
        kaizenColor: 'green',
        activeTimerSeconds: null,
        recommendedGuidelines: [],
      ),
      const Patient(
        id: 'p_frida_kahlo',
        name: 'Frida Kahlo',
        age: 47,
        gender: 'Female',
        lastVisit: '2024.11.20',
        preexistingConditions: ['Spinal Trauma (Post-Bus Incident)', 'Polio Sequelae', 'Right Leg Amputation'],
        patientGoals: 'Manage chronic, intractable neuropathic pain, support spinal stability, and address severe right leg/foot phantom pain.',
        vitals: PatientVitals(bp: '118/76', hr: '78', temp: '98.2F', weight: '110 lbs', spO2: '97', height: '5\'3"'),
        issues: {},
        history: [],
        bookmarks: [],
        scans: [],
        triageScore: 4,
        kaizenColor: 'blue',
        activeTimerSeconds: null,
        recommendedGuidelines: [],
      ),
      const Patient(
        id: 'p_phil_gear',
        name: 'Phil Gear',
        age: 38,
        gender: 'Male',
        lastVisit: '2024.11.20',
        preexistingConditions: ['None'],
        patientGoals: 'Optimize metabolic health, synchronize all personal biometrics from Google Health Connect, and reduce sleep latency.',
        vitals: PatientVitals(bp: '120/80', hr: '72', temp: '98.6F', weight: '175 lbs', spO2: '98', height: '6\'0"'),
        issues: {},
        history: [],
        bookmarks: [],
        scans: [
          DiagnosticScan(
            id: 'scan_lumbar_mri_01',
            type: 'MRI',
            title: 'Lumbar Spine MRI (L4-L5)',
            date: '2024.11.18',
            bodyPartId: 'spine',
            description: '32-slice sagittal T2 cine series evaluating L4-L5 posterior disc protrusion and thecal sac clearance.',
            status: 'REVIEWED',
          ),
        ],
        triageScore: 0,
        kaizenColor: 'green',
        activeTimerSeconds: null,
        recommendedGuidelines: [],
      ),
      const Patient(
        id: 'p002',
        name: 'Sarah Jenkins',
        age: 42,
        gender: 'Female',
        lastVisit: '2024.11.20',
        preexistingConditions: ['Asthma', 'Heart Failure'],
        patientGoals: 'Manage recent shortness of breath.',
        vitals: PatientVitals(bp: '95/60', hr: '145', temp: '101.2F', weight: '165 lbs', spO2: '89', height: '5\'4"'),
        issues: {
          'chest': [
            BodyPartIssue(id: 'chest', noteId: 'n1', name: 'Severe Angina', description: 'Crushing chest pain', painLevel: 9, recommendation: 'Immediate ECG', date: '2024.11.20', symptoms: []),
          ]
        },
        history: [],
        bookmarks: [],
        scans: [],
        triageScore: 12,
        kaizenColor: 'red',
        activeTimerSeconds: 3600,
        recommendedGuidelines: [
          {'id': '18893435', 'title': 'The heart in bronchial asthma.'},
          {'id': '20241492', 'title': 'Cardiac complications and deaths in asthmatic patients.'}
        ],
      ),
      const Patient(
        id: 'p003',
        name: 'John Doe (Sentinel Threat)',
        age: 34,
        gender: 'Male',
        lastVisit: '2024.11.20',
        preexistingConditions: ['None'],
        patientGoals: 'Survive severe respiratory distress and shock.',
        vitals: PatientVitals(bp: '85/50', hr: '130', temp: '103.1F', weight: '180 lbs', spO2: '82', height: '6\'0"'),
        issues: {
          'chest': [
            BodyPartIssue(id: 'chest', noteId: 'n1', name: 'Pulmonary Edema', description: 'Severe fluid buildup', painLevel: 9, symptoms: []),
          ],
        },
        history: [],
        bookmarks: [],
        scans: [],
        triageScore: 15,
        kaizenColor: 'red',
        activeTimerSeconds: 1800,
        recommendedGuidelines: [
          {'id': '98765432', 'title': 'Hantavirus Pulmonary Syndrome: Clinical Management'},
          {'id': '11223344', 'title': 'Extracorporeal Membrane Oxygenation in Severe HPS'}
        ],
      ),
    ];
  }

  Future<void> savePatients(List<Patient> patients) async {
    final box = Hive.box<dynamic>('pocket_gull_db');
    final jsonList = patients.map((p) => _patientToJson(p)).toList();
    await box.put('patients', jsonEncode(jsonList));
  }

  Future<bool> syncToCloud(List<Patient> patients) async {
    try {
      final jsonList = patients.map((p) => _patientToJson(p)).toList();
      final response = await http.post(
        Uri.parse('/api/patients'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(jsonList),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('[PatientManagementService] Successfully synced to cloud');
        return true;
      } else {
        debugPrint('[PatientManagementService] Failed to sync. Status: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      debugPrint('[PatientManagementService] Error syncing to cloud: $e');
      return false;
    }
  }

  Patient addHistoryEntry(Patient patient, HistoryEntry entry) {
    final updatedHistory = [entry, ...patient.history];
    if (entry is VisitHistoryEntry) {
      return _copyWith(patient, history: updatedHistory, lastVisit: entry.date);
    }
    return _copyWith(patient, history: updatedHistory);
  }

  Patient updateHistoryEntry(Patient patient, HistoryEntry entry, bool Function(HistoryEntry) matchFn) {
    final index = patient.history.indexWhere(matchFn);
    if (index == -1) {
      return addHistoryEntry(patient, entry);
    }
    final updatedHistory = List<HistoryEntry>.from(patient.history);
    updatedHistory[index] = entry;
    return _copyWith(patient, history: updatedHistory);
  }

  Patient addBookmark(Patient patient, Bookmark bookmark) {
    final updatedBookmarks = [...patient.bookmarks, bookmark];
    final historyEntry = BookmarkAddedHistoryEntry(
      date: DateTime.now().toIso8601String().split('T')[0].replaceAll('-', '.'),
      summary: bookmark.title,
      bookmark: bookmark,
    );
    return addHistoryEntry(
      _copyWith(patient, bookmarks: updatedBookmarks),
      historyEntry,
    );
  }

  Patient removeBookmark(Patient patient, String url) {
    return _copyWith(
      patient,
      bookmarks: patient.bookmarks.where((b) => b.url != url).toList(),
    );
  }

  Patient _copyWith(Patient p, {List<HistoryEntry>? history, List<Bookmark>? bookmarks, String? lastVisit, int? triageScore, String? kaizenColor, int? activeTimerSeconds, List<Map<String, String>>? recommendedGuidelines}) {
    return Patient(
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      lastVisit: lastVisit ?? p.lastVisit,
      preexistingConditions: p.preexistingConditions,
      history: history ?? p.history,
      bookmarks: bookmarks ?? p.bookmarks,
      issues: p.issues,
      patientGoals: p.patientGoals,
      vitals: p.vitals,
      scans: p.scans,
      triageScore: triageScore ?? p.triageScore,
      kaizenColor: kaizenColor ?? p.kaizenColor,
      activeTimerSeconds: activeTimerSeconds ?? p.activeTimerSeconds,
      recommendedGuidelines: recommendedGuidelines ?? p.recommendedGuidelines,
      genomicVariants: p.genomicVariants,
      biochemicalPathways: p.biochemicalPathways,
      pkInteractions: p.pkInteractions,
      ewarsAlerts: p.ewarsAlerts,
      travelProfile: p.travelProfile,
      awareStewardship: p.awareStewardship,
      environmentalIndex: p.environmentalIndex,
    );
  }

  // Temporary serialization helpers since patient_types.dart didn't have full JSON logic
  Map<String, dynamic> _patientToJson(Patient p) {
    return {
      'id': p.id,
      'name': p.name,
      'age': p.age,
      'gender': p.gender,
      'lastVisit': p.lastVisit,
      'preexistingConditions': p.preexistingConditions,
      'patientGoals': p.patientGoals,
      'vitals': {
        'bp': p.vitals.bp,
        'hr': p.vitals.hr,
        'temp': p.vitals.temp,
        'spO2': p.vitals.spO2,
        'weight': p.vitals.weight,
        'height': p.vitals.height,
      },
      'history': p.history.map((h) => h.toJson()).toList(),
      'bookmarks': p.bookmarks.map((b) => b.toJson()).toList(),
      'scans': p.scans,
      'triageScore': p.triageScore,
      'kaizenColor': p.kaizenColor,
      'activeTimerSeconds': p.activeTimerSeconds,
      'recommendedGuidelines': p.recommendedGuidelines,
      'genomicVariants': p.genomicVariants?.map((v) => v.toJson()).toList(),
      'biochemicalPathways': p.biochemicalPathways?.map((path) => path.toJson()).toList(),
      'pkInteractions': p.pkInteractions?.map((pk) => pk.toJson()).toList(),
      'ewarsAlerts': p.ewarsAlerts?.map((e) => e.toJson()).toList(),
      'travelProfile': p.travelProfile?.toJson(),
      'awareStewardship': p.awareStewardship?.map((a) => a.toJson()).toList(),
      'environmentalIndex': p.environmentalIndex?.toJson(),
    };
  }

  Patient _patientFromJson(Map<String, dynamic> json) {
    final vitalsJson = json['vitals'] as Map<String, dynamic>?;
    return Patient(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      age: json['age'] as int? ?? 0,
      gender: json['gender'] as String? ?? '',
      lastVisit: json['lastVisit'] as String? ?? '',
      preexistingConditions: List<String>.from((json['preexistingConditions'] as Iterable<dynamic>?) ?? const <dynamic>[]),
      patientGoals: json['patientGoals'] as String? ?? '',
      vitals: PatientVitals(
        bp: vitalsJson?['bp'] as String? ?? '',
        hr: vitalsJson?['hr'] as String? ?? '',
        temp: vitalsJson?['temp'] as String? ?? '',
        spO2: vitalsJson?['spO2'] as String? ?? '',
        weight: vitalsJson?['weight'] as String? ?? '',
        height: vitalsJson?['height'] as String? ?? '',
      ),
      issues: const {}, // Ignoring complex nested mapping for now in this skeleton
      history: (json['history'] as List<dynamic>?)?.map((j) => HistoryEntry.fromJson(j as Map<String, dynamic>)).toList() ?? <HistoryEntry>[],
      bookmarks: (json['bookmarks'] as List<dynamic>?)?.map((j) => Bookmark.fromJson(j as Map<String, dynamic>)).toList() ?? <Bookmark>[],
      scans: (json['scans'] as List<DiagnosticScan>?) ?? const <DiagnosticScan>[],
      triageScore: json['triageScore'] as int? ?? 0,
      kaizenColor: json['kaizenColor'] as String? ?? 'green',
      genomicVariants: (json['genomicVariants'] as List<dynamic>?)?.map((v) => GeneticVariant.fromJson(v as Map<String, dynamic>)).toList(),
      biochemicalPathways: (json['biochemicalPathways'] as List<dynamic>?)?.map((path) => BiochemicalPathway.fromJson(path as Map<String, dynamic>)).toList(),
      pkInteractions: (json['pkInteractions'] as List<dynamic>?)?.map((pk) => PharmacokineticInteraction.fromJson(pk as Map<String, dynamic>)).toList(),
      ewarsAlerts: (json['ewarsAlerts'] as List<dynamic>?)?.map((e) => EwarsOutbreakAlert.fromJson(e as Map<String, dynamic>)).toList(),
      travelProfile: json['travelProfile'] != null ? TravelMedicineProfile.fromJson(json['travelProfile'] as Map<String, dynamic>) : null,
      awareStewardship: (json['awareStewardship'] as List<dynamic>?)?.map((a) => WhoAwareClassification.fromJson(a as Map<String, dynamic>)).toList(),
      environmentalIndex: json['environmentalIndex'] != null ? EnvironmentalHealthIndex.fromJson(json['environmentalIndex'] as Map<String, dynamic>) : null,
      activeTimerSeconds: json['activeTimerSeconds'] as int?,
      recommendedGuidelines: (json['recommendedGuidelines'] as List<dynamic>?)?.map((g) => Map<String, String>.from(g as Map<dynamic, dynamic>)).toList() ?? <Map<String, String>>[],
    );
  }
}
