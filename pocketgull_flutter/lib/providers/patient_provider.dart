import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/patient_types.dart';

const String _storageKey = 'pocketgull_patient_state';

class PatientNotifier extends Notifier<PatientState> {
  @override
  PatientState build() {
    _loadFromPrefs();
    return PatientState(
      issues: const {},
      patientGoals: '',
      vitals: PatientVitals.empty(),
    );
  }

  void loadPatient(PatientState patient) {
    state = patient;
    _saveToPrefs(patient);
  }

  void updateVitals(PatientVitals vitals) {
    state = state.copyWith(vitals: vitals);
    _saveToPrefs(state);
  }

  void addIssue(String partId, BodyPartIssue issue) {
    final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
    updatedIssues.putIfAbsent(partId, () => []);
    updatedIssues[partId] = List.from(updatedIssues[partId]!)..add(issue);
    
    state = state.copyWith(issues: updatedIssues);
    _saveToPrefs(state);
  }

  void updateGoals(String goals) {
    state = state.copyWith(patientGoals: goals);
    _saveToPrefs(state);
  }

  void addNote(String text) {
    final noteId = 'note_${DateTime.now().millisecondsSinceEpoch}';
    final newIssue = BodyPartIssue(
      id: noteId,
      noteId: noteId,
      name: 'General Clinical Note',
      painLevel: 1,
      description: text,
      symptoms: [text],
    );
    addIssue('general', newIssue);
  }



  void selectPart(String? partId) {
    state = state.copyWith(selectedPartId: partId);
  }

  void toggleLiveAgent(bool isActive) {
    state = state.copyWith(isLiveAgentActive: isActive);
  }

  void toggleResearchFrame(bool isVisible) {
    state = state.copyWith(isResearchFrameVisible: isVisible);
  }

  void selectNote(String? noteId) {
    state = state.copyWith(selectedNoteId: noteId);
  }

  void updateIssue(String partId, BodyPartIssue issue) {
    final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
    if (!updatedIssues.containsKey(partId)) {
      updatedIssues[partId] = [issue];
    } else {
      final list = List<BodyPartIssue>.from(updatedIssues[partId]!);
      final index = list.indexWhere((i) => i.noteId == issue.noteId);
      if (index != -1) {
        list[index] = issue;
      } else {
        list.add(issue);
      }
      updatedIssues[partId] = list;
    }
    state = state.copyWith(
      issues: updatedIssues,
      selectedNoteId: state.selectedNoteId ?? issue.noteId,
    );
    _saveToPrefs(state);
  }

  void deleteNote(String partId, String noteId) {
    final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
    if (updatedIssues.containsKey(partId)) {
      final list = List<BodyPartIssue>.from(updatedIssues[partId]!);
      list.removeWhere((i) => i.noteId == noteId);
      updatedIssues[partId] = list;
      
      String? nextNoteId;
      if (list.isNotEmpty) {
        nextNoteId = list.first.noteId;
      }

      state = state.copyWith(
        issues: updatedIssues,
        selectedNoteId: state.selectedNoteId == noteId ? nextNoteId : state.selectedNoteId,
      );
      _saveToPrefs(state);
    }
  }

  void setViewingPastVisitDate(String? date) {
    state = state.copyWith(viewingPastVisitDate: date);
  }

  void toggleChecklistStatus(String itemId) {
    final updatedChecklist = state.checklist?.map((item) {
      if (item.id == itemId) {
        final nextStatus = switch (item.status) {
          BracketingState.normal => BracketingState.added,
          BracketingState.added => BracketingState.removed,
          BracketingState.removed => BracketingState.normal,
        };
        return item.copyWith(status: nextStatus);
      }
      return item;
    }).toList();

    state = state.copyWith(checklist: updatedChecklist);
    _saveToPrefs(state);
  }

  void changeAnatomicalViewMode(AnatomicalViewMode viewMode) {
    state = state.copyWith(viewMode: viewMode);
    _saveToPrefs(state);
  }

  void updateOccupation(String occupation) {
    state = state.copyWith(occupation: occupation);
    _saveToPrefs(state);
  }

  void updateReasonForVisit(String reason) {
    state = state.copyWith(reasonForVisit: reason);
    _saveToPrefs(state);
  }

  void updateDietaryProtocol(String protocol) {
    state = state.copyWith(dietaryProtocol: protocol);
    _saveToPrefs(state);
  }

  void updateActivePhilosophy(MedicalPhilosophy philosophy) {
    state = state.copyWith(activePhilosophy: philosophy);
    _saveToPrefs(state);
  }

  void updateAyurvedicStatus(AyurvedicStatus status) {
    state = state.copyWith(ayurvedicStatus: status);
    _saveToPrefs(state);
  }

  void updateTraumaFlags(TraumaFlags flags) {
    state = state.copyWith(traumaFlags: flags);
    _saveToPrefs(state);
  }

  void updateAvsProtocol(AvsProtocol? protocol) {
    state = state.copyWith(avsProtocol: protocol);
    _saveToPrefs(state);
  }

  void addBiometricEntry(BiometricEntry entry) {
    final updated = List<BiometricEntry>.from(state.biometricHistory ?? [])..add(entry);
    state = state.copyWith(biometricHistory: updated);
    _saveToPrefs(state);
  }

  void updateMedications(List<DynamicMarker> medications) {
    state = state.copyWith(medications: medications);
    _saveToPrefs(state);
  }

  void addScan(DiagnosticScan scan) {
    final updated = List<DiagnosticScan>.from(state.scans)..add(scan);
    state = state.copyWith(scans: updated);
    _saveToPrefs(state);
  }

  void addClinicalNote(ClinicalNote note) {
    final updated = List<ClinicalNote>.from(state.clinicalNotes ?? [])..add(note);
    state = state.copyWith(clinicalNotes: updated);
    _saveToPrefs(state);
  }

  void addShoppingListItem(ShoppingListItem item) {
    final updated = List<ShoppingListItem>.from(state.shoppingList ?? [])..add(item);
    state = state.copyWith(shoppingList: updated);
    _saveToPrefs(state);
  }

  void toggleShoppingListItem(String itemId) {
    final updated = state.shoppingList?.map((item) {
      if (item.id == itemId) {
        return ShoppingListItem(
          id: item.id,
          name: item.name,
          completed: !item.completed,
          category: item.category,
          referenceNotion: item.referenceNotion,
        );
      }
      return item;
    }).toList();
    state = state.copyWith(shoppingList: updated);
    _saveToPrefs(state);
  }

  void clearState() {
    state = PatientState(
      issues: const {},
      patientGoals: '',
      vitals: PatientVitals.empty(),
    );
    _saveToPrefs(state);
  }

  void addSpatialLesion(SpatialLesionModel lesion) {
    final updated = List<SpatialLesionModel>.from(state.spatialLesions)..add(lesion);
    state = state.copyWith(spatialLesions: updated);
    _saveToPrefs(state);
  }

  void removeSpatialLesion(String id) {
    final updated = List<SpatialLesionModel>.from(state.spatialLesions)
      ..removeWhere((l) => l.id == id);
    state = state.copyWith(spatialLesions: updated);
    _saveToPrefs(state);
  }

  void clearSpatialLesions() {
    state = state.copyWith(spatialLesions: const []);
    _saveToPrefs(state);
  }

  void hydrateFromFhirR4(Map<String, dynamic> fhirBundleJson, dynamic fhirService) {
    final parsed = fhirService.parseFhirR4Bundle(fhirBundleJson);
    final vitalsMap = (parsed['vitals'] as Map<String, dynamic>?) ?? {};
    
    final updatedVitals = PatientVitals(
      bp: vitalsMap['bp'] as String? ?? state.vitals.bp,
      hr: vitalsMap['hr'] as String? ?? state.vitals.hr,
      temp: vitalsMap['temp'] as String? ?? state.vitals.temp,
      spO2: vitalsMap['spO2'] as String? ?? state.vitals.spO2,
      weight: state.vitals.weight,
      height: state.vitals.height,
    );

    state = state.copyWith(
      name: parsed['name'] as String? ?? state.name,
      vitals: updatedVitals,
      spatialLesions: parsed['lesions'] as List<SpatialLesionModel>? ?? state.spatialLesions,
      issues: parsed['issues'] as Map<String, List<BodyPartIssue>>? ?? state.issues,
    );
    _saveToPrefs(state);
  }

  Future<void> _saveToPrefs(PatientState currentState) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final data = {
        'name': currentState.name,
        'patientGoals': currentState.patientGoals,
        'vitals': {
          'bp': currentState.vitals.bp,
          'hr': currentState.vitals.hr,
          'temp': currentState.vitals.temp,
          'spO2': currentState.vitals.spO2,
          'weight': currentState.vitals.weight,
          'height': currentState.vitals.height,
        },
        'issues': currentState.issues.map((key, value) => MapEntry(
          key, 
          value.map((i) => {
            'noteId': i.noteId,
            'name': i.name,
            'description': i.description,
            'painLevel': i.painLevel,
            'recommendation': i.recommendation,
            'date': i.date,
          }).toList(),
        )),
        'checklist': currentState.checklist?.map((i) => {
          'id': i.id,
          'text': i.text,
          'status': i.status.index,
        }).toList(),
        'spatialLesions': currentState.spatialLesions.map((l) => l.toJson()).toList(),
        'viewMode': currentState.viewMode.index,
      };
      
      await prefs.setString(_storageKey, jsonEncode(data));
    } catch (e) {
      debugPrint('Failed to save state: $e');
    }
  }

  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dataStr = prefs.getString(_storageKey);
      if (dataStr != null && state.issues.isEmpty && state.patientGoals.isEmpty && state.vitals.hr.isEmpty) {
        final data = jsonDecode(dataStr);
        final vitalsData = data['vitals'];
        
        final loadedState = PatientState(
          name: data['name'] ?? 'Selected Patient',
          patientGoals: data['patientGoals'] ?? '',
          vitals: PatientVitals(
            bp: vitalsData['bp'] ?? '',
            hr: vitalsData['hr'] ?? '',
            temp: vitalsData['temp'] ?? '',
            spO2: vitalsData['spO2'] ?? '',
            weight: vitalsData['weight'] ?? '',
            height: vitalsData['height'] ?? '',
          ),
          issues: (data['issues'] as Map).map((key, value) => MapEntry(
            key as String,
            (value as List).map((i) => BodyPartIssue(
              id: key,
              noteId: i['noteId'],
              name: i['name'],
              description: i['description'],
              painLevel: i['painLevel'],
              recommendation: i['recommendation'],
              date: i['date'],
              symptoms: const [],
            )).toList(),
          )),
          checklist: (data['checklist'] as List?)?.map((i) => ChecklistItem(
            id: i['id'],
            text: i['text'],
            status: BracketingState.values[i['status'] ?? 0],
          )).toList() ?? [],
          spatialLesions: (data['spatialLesions'] as List?)?.map((l) => SpatialLesionModel.fromJson(l as Map<String, dynamic>)).toList() ?? const [],
          viewMode: AnatomicalViewMode.values[data['viewMode'] ?? 0],
        );
        state = loadedState;
      }
    } catch (e) {
      debugPrint('Failed to load state: $e');
    }
  }
}

final patientProvider = NotifierProvider<PatientNotifier, PatientState>(() {
  return PatientNotifier();
});
