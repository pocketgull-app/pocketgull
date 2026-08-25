import 'package:equatable/equatable.dart';

// ---------------------------------------------------------------------------
// Body Part Constants (parity with Angular BODY_PART_NAMES / BODY_PART_MAPPING)
// ---------------------------------------------------------------------------

/// Human-readable labels for each canonical body part ID.
const Map<String, String> bodyPartNames = {
  'head': 'Head & Neck',
  'chest': 'Chest & Upper Torso',
  'abdomen': 'Abdomen & Stomach',
  'pelvis': 'Pelvis & Hips',
  'r_shoulder': 'Right Shoulder',
  'r_arm': 'Right Arm',
  'r_hand': 'Right Hand & Wrist',
  'l_shoulder': 'Left Shoulder',
  'l_arm': 'Left Arm',
  'l_hand': 'Left Hand & Wrist',
  'r_thigh': 'Right Thigh',
  'r_shin': 'Right Lower Leg',
  'r_foot': 'Right Foot',
  'l_thigh': 'Left Thigh',
  'l_shin': 'Left Lower Leg',
  'l_foot': 'Left Foot',
};

/// Maps natural-language body part strings to canonical body part IDs.
const Map<String, String> bodyPartMapping = {
  'head': 'head',
  'skull': 'head',
  'face': 'head',
  'neck': 'head',
  'chest': 'chest',
  'torso': 'chest',
  'stomach': 'abdomen',
  'abdomen': 'abdomen',
  'belly': 'abdomen',
  'hips': 'pelvis',
  'pelvis': 'pelvis',
  'groin': 'pelvis',
  'right shoulder': 'r_shoulder',
  'right arm': 'r_arm',
  'right bicep': 'r_arm',
  'right elbow': 'r_arm',
  'right forearm': 'r_arm',
  'right hand': 'r_hand',
  'right wrist': 'r_hand',
  'right fingers': 'r_fingers',
  'right thumb': 'r_fingers',
  'left shoulder': 'l_shoulder',
  'left arm': 'l_arm',
  'left bicep': 'l_arm',
  'left elbow': 'l_arm',
  'left forearm': 'l_arm',
  'left hand': 'l_hand',
  'left wrist': 'l_hand',
  'left fingers': 'l_fingers',
  'left thumb': 'l_fingers',
  'right thigh': 'r_thigh',
  'right upper leg': 'r_thigh',
  'right knee': 'r_shin',
  'right shin': 'r_shin',
  'right calf': 'r_shin',
  'right lower leg': 'r_shin',
  'right ankle': 'r_foot',
  'right foot': 'r_foot',
  'right toes': 'r_toes',
  'left thigh': 'l_thigh',
  'left upper leg': 'l_thigh',
  'left knee': 'l_shin',
  'left shin': 'l_shin',
  'left calf': 'l_shin',
  'left lower leg': 'l_shin',
  'left ankle': 'l_foot',
  'left foot': 'l_foot',
  'left toes': 'l_toes',
  'upper back': 'upper_back',
  'lower back': 'lower_back',
  'spine': 'upper_back',
  'back': 'upper_back',
  'glutes': 'glutes',
  'buttocks': 'glutes',
  'bottom': 'glutes',
};

// ---------------------------------------------------------------------------
// Core Clinical Types
// ---------------------------------------------------------------------------

class PatientSymptom extends Equatable {
  final String name;
  final String? type;
  final bool? verified;
  final String? timeline;
  final Map<String, dynamic> extra;

  const PatientSymptom({
    required this.name,
    this.type,
    this.verified,
    this.timeline,
    this.extra = const {},
  });

  @override
  List<Object?> get props => [name, type, verified, timeline, extra];
}

class BodyPartIssue extends Equatable {
  final String id;
  final String noteId;
  final String name;
  final int painLevel;
  final String description;
  final List<dynamic> symptoms; // Can be String or PatientSymptom
  final String? recommendation;
  final String? date;

  // Trajectory fields
  final String? trajectory;
  final String? deltaSummary;
  final bool escalationFlag;

  // Tri-Paradigm Diagnostic Matrix (TDM) Extensions
  final String? tcmPattern;
  final String? ayurvedicImbalance;

  const BodyPartIssue({
    required this.id,
    required this.noteId,
    required this.name,
    required this.painLevel,
    required this.description,
    required this.symptoms,
    this.recommendation,
    this.date,
    this.trajectory,
    this.deltaSummary,
    this.escalationFlag = false,
    this.tcmPattern,
    this.ayurvedicImbalance,
  });

  @override
  List<Object?> get props => [
        id, noteId, name, painLevel, description, symptoms, recommendation, date,
        trajectory, deltaSummary, escalationFlag, tcmPattern, ayurvedicImbalance,
      ];
}

class PatientVitals extends Equatable {
  final String bp;
  final String hr;
  final String temp;
  final String spO2;
  final String weight;
  final String height;
  // Biochemical Telemetry
  final String? vitC;
  final String? vitD3;
  final String? magnesium;
  final String? zinc;
  final String? b12;

  const PatientVitals({
    required this.bp,
    required this.hr,
    required this.temp,
    required this.spO2,
    required this.weight,
    required this.height,
    this.vitC,
    this.vitD3,
    this.magnesium,
    this.zinc,
    this.b12,
  });

  @override
  List<Object?> get props => [bp, hr, temp, spO2, weight, height, vitC, vitD3, magnesium, zinc, b12];

  factory PatientVitals.empty() {
    return const PatientVitals(bp: '', hr: '', temp: '', spO2: '', weight: '', height: '');
  }
}

// ---------------------------------------------------------------------------
// Dynamic Markers & Biometrics
// ---------------------------------------------------------------------------

class DynamicMarker extends Equatable {
  final String id;
  final String name;
  final String value;

  const DynamicMarker({required this.id, required this.name, required this.value});

  @override
  List<Object?> get props => [id, name, value];
}

class BiometricEntry extends Equatable {
  final String timestamp;
  final String type; // bp, hr, temp, spO2, weight, height, pain, hrv, coherence, breathing
  final dynamic value; // String or num
  final String? unit;
  final String? source;

  const BiometricEntry({
    required this.timestamp,
    required this.type,
    required this.value,
    this.unit,
    this.source,
  });

  @override
  List<Object?> get props => [timestamp, type, value, unit, source];
}

// ---------------------------------------------------------------------------
// Clinical Notes, Scans & Checklists
// ---------------------------------------------------------------------------

class DiagnosticScan extends Equatable {
  final String id;
  final String type;
  final String title;
  final String date;
  final String? bodyPartId;
  final String description;
  final String status;
  final String? imageUrl;

  const DiagnosticScan({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    this.bodyPartId,
    required this.description,
    required this.status,
    this.imageUrl,
  });

  @override
  List<Object?> get props => [id, type, title, date, bodyPartId, description, status, imageUrl];
}

class ClinicalNote extends Equatable {
  final String id;
  final String text;
  final String sourceLens;
  final String date;

  const ClinicalNote({
    required this.id,
    required this.text,
    required this.sourceLens,
    required this.date,
  });

  @override
  List<Object?> get props => [id, text, sourceLens, date];
}

enum AnatomicalViewMode { standard, orthomolecular, muscular, skeletal, vascular }

enum BracketingState { normal, added, removed }

class ChecklistItem extends Equatable {
  final String id;
  final String text;
  final BracketingState status;

  const ChecklistItem({
    required this.id,
    required this.text,
    this.status = BracketingState.normal,
  });

  ChecklistItem copyWith({String? text, BracketingState? status}) {
    return ChecklistItem(
      id: id,
      text: text ?? this.text,
      status: status ?? this.status,
    );
  }

  @override
  List<Object?> get props => [id, text, status];
}

class DraftSummaryItem extends Equatable {
  final String id;
  final String text;

  const DraftSummaryItem({required this.id, required this.text});

  @override
  List<Object?> get props => [id, text];
}

class ShoppingListItem extends Equatable {
  final String id;
  final String name;
  final bool completed;
  final String? category;
  final String? referenceNotion;

  const ShoppingListItem({
    required this.id,
    required this.name,
    this.completed = false,
    this.category,
    this.referenceNotion,
  });

  @override
  List<Object?> get props => [id, name, completed, category, referenceNotion];
}

// ---------------------------------------------------------------------------
// Ayurvedic Types
// ---------------------------------------------------------------------------

enum Prakriti { vata, pitta, kapha, vataPitta, pittaKapha, vataKapha, tridosha }

enum AgniStatus { sama, vishama, tikshna, manda }

enum AmaStatus { nirama, sama }

enum Dhatu { rasa, rakta, mamsa, medas, asthi, majja, shukra }

class AyurvedicStatus extends Equatable {
  final Prakriti? prakriti;
  final String? vikriti;
  final AgniStatus? agniStatus;
  final AmaStatus? amaStatus;
  final List<Dhatu>? affectedDhatus;
  final List<String>? blockedSrotas;
  final List<String>? dominantGunas;

  const AyurvedicStatus({
    this.prakriti,
    this.vikriti,
    this.agniStatus,
    this.amaStatus,
    this.affectedDhatus,
    this.blockedSrotas,
    this.dominantGunas,
  });

  @override
  List<Object?> get props => [prakriti, vikriti, agniStatus, amaStatus, affectedDhatus, blockedSrotas, dominantGunas];
}

// ---------------------------------------------------------------------------
// Trauma Safety & AVS Protocol
// ---------------------------------------------------------------------------

/// Trauma safety flags â€” gates AVS protocol selection.
class TraumaFlags extends Equatable {
  final bool hasPtsd;
  final bool hasSeizureDisorder;
  final bool hasDissociativeEpisodes;
  final bool hasCombatTrauma;
  final bool hasActivePsychosis;
  final bool hasPhotosensitivity;
  final bool hasStimulantMedication;
  final bool acuteSuicidality;
  final List<String> knownTriggers;

  const TraumaFlags({
    this.hasPtsd = false,
    this.hasSeizureDisorder = false,
    this.hasDissociativeEpisodes = false,
    this.hasCombatTrauma = false,
    this.hasActivePsychosis = false,
    this.hasPhotosensitivity = false,
    this.hasStimulantMedication = false,
    this.acuteSuicidality = false,
    this.knownTriggers = const [],
  });

  @override
  List<Object?> get props => [
        hasPtsd, hasSeizureDisorder, hasDissociativeEpisodes, hasCombatTrauma,
        hasActivePsychosis, hasPhotosensitivity, hasStimulantMedication,
        acuteSuicidality, knownTriggers,
      ];
}

enum AvsWave { delta, theta, alpha, beta }

enum AvsColorPalette { emerald, blue, violet, amber, roseEarth }

enum AvsNoiseType { brown, pink, white }

/// Gemini-generated AVS co-regulation protocol.
class AvsProtocol extends Equatable {
  final AvsWave wave;
  final int breathingBpm;
  final AvsColorPalette colorPalette;
  final AvsNoiseType noiseType;
  final Map<String, int> breathRatio; // inhale, hold, exhale
  final String sessionIntent;
  final String patientMessage;
  final List<String> safetyFlags;
  final List<String> contraindications;
  final int generatedAt;
  final String contextHash;

  const AvsProtocol({
    required this.wave,
    required this.breathingBpm,
    required this.colorPalette,
    required this.noiseType,
    required this.breathRatio,
    required this.sessionIntent,
    required this.patientMessage,
    this.safetyFlags = const [],
    this.contraindications = const [],
    required this.generatedAt,
    required this.contextHash,
  });

  @override
  List<Object?> get props => [
        wave, breathingBpm, colorPalette, noiseType, breathRatio,
        sessionIntent, patientMessage, safetyFlags, contraindications,
        generatedAt, contextHash,
      ];
}

// ---------------------------------------------------------------------------
// DOC (Disorders of Consciousness) Types
// ---------------------------------------------------------------------------

enum DocLevel { coma, vsUws, mcsMinus, mcsPlus, emcs, lockedIn }

class DocProfile extends Equatable {
  final int gcsScore;
  final DocLevel docLevel;
  final int daysPostOnset;
  final String etiology;
  final bool hasAutonomicStorming;
  final String preferredMusic;
  final bool familyVoiceAvailable;
  final bool hasHearingAid;
  final bool hasPhotosensitivity;
  final bool activeIcpMonitor;

  const DocProfile({
    required this.gcsScore,
    required this.docLevel,
    required this.daysPostOnset,
    required this.etiology,
    this.hasAutonomicStorming = false,
    this.preferredMusic = '',
    this.familyVoiceAvailable = false,
    this.hasHearingAid = false,
    this.hasPhotosensitivity = false,
    this.activeIcpMonitor = false,
  });

  @override
  List<Object?> get props => [
        gcsScore, docLevel, daysPostOnset, etiology, hasAutonomicStorming,
        preferredMusic, familyVoiceAvailable, hasHearingAid, hasPhotosensitivity,
        activeIcpMonitor,
      ];
}

class DocStimBlock extends Equatable {
  final String label;
  final int durationMin;
  final String modality;
  final double? frequencyHz;
  final String instruction;
  final String rationale;
  final List<String> contraindications;

  const DocStimBlock({
    required this.label,
    required this.durationMin,
    required this.modality,
    this.frequencyHz,
    required this.instruction,
    required this.rationale,
    this.contraindications = const [],
  });

  @override
  List<Object?> get props => [label, durationMin, modality, frequencyHz, instruction, rationale, contraindications];
}

class DocStimulationSession extends Equatable {
  final DocProfile profile;
  final List<DocStimBlock> schedule;
  final int totalDurationMin;
  final int sessionsPerDay;
  final String clinicianNote;
  final List<String> safetyWarnings;
  final List<String> familyGuidance;
  final List<String> evidenceReferences;

  const DocStimulationSession({
    required this.profile,
    required this.schedule,
    required this.totalDurationMin,
    required this.sessionsPerDay,
    required this.clinicianNote,
    this.safetyWarnings = const [],
    this.familyGuidance = const [],
    this.evidenceReferences = const [],
  });

  @override
  List<Object?> get props => [
        profile, schedule, totalDurationMin, sessionsPerDay, clinicianNote,
        safetyWarnings, familyGuidance, evidenceReferences,
      ];
}

// ---------------------------------------------------------------------------
// Athletic Performance Types
// ---------------------------------------------------------------------------

enum AthleticState { priming, flow, recovery, phaseShift }

class AthleticProfile extends Equatable {
  final AthleticState state;
  final String sportType;
  final int? timeToEventMin;
  final int? targetTimezoneOffset;
  final String preferredMusic;

  const AthleticProfile({
    required this.state,
    required this.sportType,
    this.timeToEventMin,
    this.targetTimezoneOffset,
    this.preferredMusic = '',
  });

  @override
  List<Object?> get props => [state, sportType, timeToEventMin, targetTimezoneOffset, preferredMusic];
}

class AthleticStimBlock extends Equatable {
  final String label;
  final int durationMin;
  final String modality;
  final double? frequencyHz;
  final String instruction;
  final String rationale;

  const AthleticStimBlock({
    required this.label,
    required this.durationMin,
    required this.modality,
    this.frequencyHz,
    required this.instruction,
    required this.rationale,
  });

  @override
  List<Object?> get props => [label, durationMin, modality, frequencyHz, instruction, rationale];
}

class AthleticSession extends Equatable {
  final AthleticProfile profile;
  final List<AthleticStimBlock> schedule;
  final int totalDurationMin;
  final String coachNote;
  final List<String> athleteGuidance;
  final List<String> evidenceReferences;

  const AthleticSession({
    required this.profile,
    required this.schedule,
    required this.totalDurationMin,
    required this.coachNote,
    this.athleteGuidance = const [],
    this.evidenceReferences = const [],
  });

  @override
  List<Object?> get props => [profile, schedule, totalDurationMin, coachNote, athleteGuidance, evidenceReferences];
}

// ---------------------------------------------------------------------------
// Lifestyle Context & Recommendations
// ---------------------------------------------------------------------------

class LifestyleContext extends Equatable {
  final bool hasCaffeine;
  final bool hasAlcohol;
  final bool inAlcoholRecovery;
  final bool isSmoker;
  final bool isCannabisUser;
  final bool usesCbd;
  final bool isDiabetic;
  final bool isPreDiabetic;
  final bool hasCaffeineWithinSession;
  final List<String> notes;

  const LifestyleContext({
    this.hasCaffeine = false,
    this.hasAlcohol = false,
    this.inAlcoholRecovery = false,
    this.isSmoker = false,
    this.isCannabisUser = false,
    this.usesCbd = false,
    this.isDiabetic = false,
    this.isPreDiabetic = false,
    this.hasCaffeineWithinSession = false,
    this.notes = const [],
  });

  @override
  List<Object?> get props => [
        hasCaffeine, hasAlcohol, inAlcoholRecovery, isSmoker, isCannabisUser,
        usesCbd, isDiabetic, isPreDiabetic, hasCaffeineWithinSession, notes,
      ];
}

class SessionRecommendation extends Equatable {
  final String category; // beverage, timing, avs-adjustment, caution, wind-down
  final String title;
  final String detail;
  final String emoji;
  final Map<String, dynamic>? avsAdjust;

  const SessionRecommendation({
    required this.category,
    required this.title,
    required this.detail,
    required this.emoji,
    this.avsAdjust,
  });

  @override
  List<Object?> get props => [category, title, detail, emoji, avsAdjust];
}

class LifestyleAdjunct extends Equatable {
  final LifestyleContext context;
  final List<SessionRecommendation> recommendations;
  final String clinicianNote;

  const LifestyleAdjunct({
    required this.context,
    required this.recommendations,
    required this.clinicianNote,
  });

  @override
  List<Object?> get props => [context, recommendations, clinicianNote];
}

// ---------------------------------------------------------------------------
// Medical Philosophy
// ---------------------------------------------------------------------------

enum MedicalPhilosophy { western, eastern, ayurvedic }

// ---------------------------------------------------------------------------
// Patient State (central state model)
// ---------------------------------------------------------------------------

class PatientState extends Equatable {
  final String name;
  final Map<String, List<BodyPartIssue>> issues;
  final String patientGoals;
  final PatientVitals vitals;
  final List<DiagnosticScan> scans;
  final String? selectedPartId;
  final String? selectedNoteId;
  final String? viewingPastVisitDate;
  final List<ClinicalNote>? clinicalNotes;
  final List<ChecklistItem>? checklist;
  final List<ShoppingListItem>? shoppingList;
  final bool isLiveAgentActive;
  final bool isResearchFrameVisible;
  final AnatomicalViewMode viewMode;

  // Extended state fields (parity with Angular IPatientState)
  final AyurvedicStatus? ayurvedicStatus;
  final List<DynamicMarker>? dynamicNutrients;
  final List<DynamicMarker>? oxidativeStressMarkers;
  final List<DynamicMarker>? antioxidantSources;
  final List<DynamicMarker>? medications;
  final List<BiometricEntry>? biometricHistory;
  final String? occupation;
  final String? reasonForVisit;
  final String? dietaryProtocol;
  final TraumaFlags? traumaFlags;
  final AvsProtocol? avsProtocol;
  final MedicalPhilosophy? activePhilosophy;

  final List<GeneticVariant>? genomicVariants;
  final List<BiochemicalPathway>? biochemicalPathways;
  final List<PharmacokineticInteraction>? pkInteractions;
  final List<EwarsOutbreakAlert>? ewarsAlerts;
  final TravelMedicineProfile? travelProfile;
  final List<WhoAwareClassification>? awareStewardship;
  final EnvironmentalHealthIndex? environmentalIndex;
  final GodelIncompletenessBound? godelBound;
  final BachCrabCanonTrack? crabCanonTrack;
  final List<SpatialLesionModel> spatialLesions;

  const PatientState({
    this.name = 'Selected Patient',
    required this.issues,
    required this.patientGoals,
    required this.vitals,
    this.scans = const [],
    this.selectedPartId,
    this.selectedNoteId,
    this.viewingPastVisitDate,
    this.clinicalNotes = const [],
    this.checklist = const [],
    this.shoppingList = const [],
    this.isLiveAgentActive = false,
    this.isResearchFrameVisible = false,
    this.viewMode = AnatomicalViewMode.standard,
    this.ayurvedicStatus,
    this.dynamicNutrients,
    this.oxidativeStressMarkers,
    this.antioxidantSources,
    this.medications,
    this.biometricHistory,
    this.occupation,
    this.reasonForVisit,
    this.dietaryProtocol,
    this.traumaFlags,
    this.avsProtocol,
    this.activePhilosophy,
    this.genomicVariants,
    this.biochemicalPathways,
    this.pkInteractions,
    this.ewarsAlerts,
    this.travelProfile,
    this.awareStewardship,
    this.environmentalIndex,
    this.godelBound,
    this.crabCanonTrack,
    this.spatialLesions = const [],
  });

  @override
  List<Object?> get props => [
        name, issues, patientGoals, vitals, scans, selectedPartId, selectedNoteId,
        viewingPastVisitDate, clinicalNotes, checklist, shoppingList,
        isLiveAgentActive, isResearchFrameVisible, viewMode,
        ayurvedicStatus, dynamicNutrients, oxidativeStressMarkers,
        antioxidantSources, medications, biometricHistory,
        occupation, reasonForVisit, dietaryProtocol,
        traumaFlags, avsProtocol, activePhilosophy,
        genomicVariants, biochemicalPathways, pkInteractions,
        ewarsAlerts, travelProfile, awareStewardship, environmentalIndex,
        godelBound, crabCanonTrack, spatialLesions,
      ];

  PatientState copyWith({
    String? name,
    Map<String, List<BodyPartIssue>>? issues,
    String? patientGoals,
    PatientVitals? vitals,
    List<DiagnosticScan>? scans,
    String? selectedPartId,
    String? selectedNoteId,
    String? viewingPastVisitDate,
    List<ClinicalNote>? clinicalNotes,
    List<ChecklistItem>? checklist,
    List<ShoppingListItem>? shoppingList,
    bool? isLiveAgentActive,
    bool? isResearchFrameVisible,
    AnatomicalViewMode? viewMode,
    AyurvedicStatus? ayurvedicStatus,
    List<DynamicMarker>? dynamicNutrients,
    List<DynamicMarker>? oxidativeStressMarkers,
    List<DynamicMarker>? antioxidantSources,
    List<DynamicMarker>? medications,
    List<BiometricEntry>? biometricHistory,
    String? occupation,
    String? reasonForVisit,
    String? dietaryProtocol,
    TraumaFlags? traumaFlags,
    AvsProtocol? avsProtocol,
    MedicalPhilosophy? activePhilosophy,
    List<SpatialLesionModel>? spatialLesions,
  }) {
    return PatientState(
      name: name ?? this.name,
      issues: issues ?? this.issues,
      patientGoals: patientGoals ?? this.patientGoals,
      vitals: vitals ?? this.vitals,
      scans: scans ?? this.scans,
      selectedPartId: selectedPartId ?? this.selectedPartId,
      selectedNoteId: selectedNoteId ?? this.selectedNoteId,
      viewingPastVisitDate: viewingPastVisitDate ?? this.viewingPastVisitDate,
      clinicalNotes: clinicalNotes ?? this.clinicalNotes,
      checklist: checklist ?? this.checklist,
      shoppingList: shoppingList ?? this.shoppingList,
      isLiveAgentActive: isLiveAgentActive ?? this.isLiveAgentActive,
      isResearchFrameVisible: isResearchFrameVisible ?? this.isResearchFrameVisible,
      viewMode: viewMode ?? this.viewMode,
      ayurvedicStatus: ayurvedicStatus ?? this.ayurvedicStatus,
      dynamicNutrients: dynamicNutrients ?? this.dynamicNutrients,
      oxidativeStressMarkers: oxidativeStressMarkers ?? this.oxidativeStressMarkers,
      antioxidantSources: antioxidantSources ?? this.antioxidantSources,
      medications: medications ?? this.medications,
      biometricHistory: biometricHistory ?? this.biometricHistory,
      occupation: occupation ?? this.occupation,
      reasonForVisit: reasonForVisit ?? this.reasonForVisit,
      dietaryProtocol: dietaryProtocol ?? this.dietaryProtocol,
      traumaFlags: traumaFlags ?? this.traumaFlags,
      avsProtocol: avsProtocol ?? this.avsProtocol,
      activePhilosophy: activePhilosophy ?? this.activePhilosophy,
      spatialLesions: spatialLesions ?? this.spatialLesions,
    );
  }
}

// ---------------------------------------------------------------------------
// Bookmarks & History
// ---------------------------------------------------------------------------

class Bookmark extends Equatable {
  final String title;
  final String url;
  final String? authors;
  final String? doi;
  final String? publicationDate;
  final String? publisher;
  final bool? isPeerReviewed;
  final bool? cited;
  final List<String>? paradigms; // western, eastern, ayurvedic
  final List<String>? tcmMeridians;
  final List<String>? ayurvedicDoshas;

  const Bookmark({
    required this.title,
    required this.url,
    this.authors,
    this.doi,
    this.publicationDate,
    this.publisher,
    this.isPeerReviewed,
    this.cited,
    this.paradigms,
    this.tcmMeridians,
    this.ayurvedicDoshas,
  });

  factory Bookmark.fromJson(Map<String, dynamic> json) {
    return Bookmark(
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      authors: json['authors'],
      doi: json['doi'],
      publicationDate: json['publicationDate'],
      publisher: json['publisher'],
      isPeerReviewed: json['isPeerReviewed'],
      cited: json['cited'],
      paradigms: (json['paradigms'] as List<dynamic>?)?.cast<String>(),
      tcmMeridians: (json['tcmMeridians'] as List<dynamic>?)?.cast<String>(),
      ayurvedicDoshas: (json['ayurvedicDoshas'] as List<dynamic>?)?.cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'url': url,
      if (authors != null) 'authors': authors,
      if (doi != null) 'doi': doi,
      if (publicationDate != null) 'publicationDate': publicationDate,
      if (publisher != null) 'publisher': publisher,
      if (isPeerReviewed != null) 'isPeerReviewed': isPeerReviewed,
      if (cited != null) 'cited': cited,
      if (paradigms != null) 'paradigms': paradigms,
      if (tcmMeridians != null) 'tcmMeridians': tcmMeridians,
      if (ayurvedicDoshas != null) 'ayurvedicDoshas': ayurvedicDoshas,
    };
  }

  @override
  List<Object?> get props => [
        title, url, authors, doi, publicationDate, publisher, isPeerReviewed,
        cited, paradigms, tcmMeridians, ayurvedicDoshas,
      ];
}

sealed class HistoryEntry extends Equatable {
  final String type;
  final String date;
  final String summary;

  const HistoryEntry({
    required this.type,
    required this.date,
    required this.summary,
  });

  factory HistoryEntry.fromJson(Map<String, dynamic> json) {
    final type = json['type'] as String;
    switch (type) {
      case 'BookmarkAdded':
        return BookmarkAddedHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          bookmark: Bookmark.fromJson(json['bookmark'] ?? {}),
        );
      case 'NoteCreated':
        return NoteCreatedHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          partId: json['partId'] ?? '',
          noteId: json['noteId'] ?? '',
        );
      case 'NoteDeleted':
        return NoteDeletedHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          partId: json['partId'] ?? '',
          noteId: json['noteId'] ?? '',
        );
      case 'Y-BOCsAssessment':
        return YbocsAssessmentHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          assessment: json['assessment'],
        );
      default:
        return _GenericHistoryEntry(
          type: type,
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
        );
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'type': type,
      'date': date,
      'summary': summary,
    };

    if (this is BookmarkAddedHistoryEntry) {
      data['bookmark'] = (this as BookmarkAddedHistoryEntry).bookmark.toJson();
    } else if (this is NoteCreatedHistoryEntry) {
      data['partId'] = (this as NoteCreatedHistoryEntry).partId;
      data['noteId'] = (this as NoteCreatedHistoryEntry).noteId;
    } else if (this is NoteDeletedHistoryEntry) {
      data['partId'] = (this as NoteDeletedHistoryEntry).partId;
      data['noteId'] = (this as NoteDeletedHistoryEntry).noteId;
    } else if (this is YbocsAssessmentHistoryEntry) {
      data['assessment'] = (this as YbocsAssessmentHistoryEntry).assessment;
    }
    return data;
  }

  @override
  List<Object?> get props => [type, date, summary];
}

class _GenericHistoryEntry extends HistoryEntry {
  const _GenericHistoryEntry({required super.type, required super.date, required super.summary});
}

class VisitHistoryEntry extends HistoryEntry {
  final PatientState state;

  const VisitHistoryEntry({
    required super.date,
    required super.summary,
    required this.state,
  }) : super(type: 'Visit');

  @override
  List<Object?> get props => [...super.props, state];
}

class ChartArchivedHistoryEntry extends HistoryEntry {
  final PatientState state;

  const ChartArchivedHistoryEntry({
    required super.date,
    required super.summary,
    required this.state,
  }) : super(type: 'ChartArchived');

  @override
  List<Object?> get props => [...super.props, state];
}

class PatientSummaryUpdateHistoryEntry extends HistoryEntry {
  const PatientSummaryUpdateHistoryEntry({
    required super.date,
    required super.summary,
  }) : super(type: 'PatientSummaryUpdate');
}

class BookmarkAddedHistoryEntry extends HistoryEntry {
  final Bookmark bookmark;

  const BookmarkAddedHistoryEntry({
    required super.date,
    required super.summary,
    required this.bookmark,
  }) : super(type: 'BookmarkAdded');

  @override
  List<Object?> get props => [...super.props, bookmark];
}

class NoteCreatedHistoryEntry extends HistoryEntry {
  final String partId;
  final String noteId;

  const NoteCreatedHistoryEntry({
    required super.date,
    required super.summary,
    required this.partId,
    required this.noteId,
  }) : super(type: 'NoteCreated');

  @override
  List<Object?> get props => [...super.props, partId, noteId];
}

class NoteDeletedHistoryEntry extends HistoryEntry {
  final String partId;
  final String noteId;

  const NoteDeletedHistoryEntry({
    required super.date,
    required super.summary,
    required this.partId,
    required this.noteId,
  }) : super(type: 'NoteDeleted');

  @override
  List<Object?> get props => [...super.props, partId, noteId];
}

class AnalysisRunHistoryEntry extends HistoryEntry {
  final Map<String, String> report;

  const AnalysisRunHistoryEntry({
    required super.date,
    required super.summary,
    required this.report,
  }) : super(type: 'AnalysisRun');

  @override
  List<Object?> get props => [...super.props, report];
}

class FinalizedPatientSummaryHistoryEntry extends HistoryEntry {
  final Map<String, String> report;
  final Map<String, dynamic> annotations;

  const FinalizedPatientSummaryHistoryEntry({
    required super.date,
    required super.summary,
    required this.report,
    required this.annotations,
  }) : super(type: 'FinalizedPatientSummary');

  @override
  List<Object?> get props => [...super.props, report, annotations];
}

class YbocsAssessmentHistoryEntry extends HistoryEntry {
  final dynamic assessment;

  const YbocsAssessmentHistoryEntry({
    required super.date,
    required super.summary,
    required this.assessment,
  }) : super(type: 'Y-BOCsAssessment');

  @override
  List<Object?> get props => [...super.props, assessment];
}

// ---------------------------------------------------------------------------
// Patient (top-level entity extending PatientState)
// ---------------------------------------------------------------------------

class Patient extends PatientState {
  final String id;
  final int age;
  final String gender;
  final String lastVisit;
  final List<String> preexistingConditions;
  final List<HistoryEntry> history;
  final List<Bookmark> bookmarks;
  final int triageScore;
  final String kaizenColor;
  final int? activeTimerSeconds;
  final List<Map<String, String>> recommendedGuidelines;

  const Patient({
    required this.id,
    required super.name,
    required this.age,
    required this.gender,
    required this.lastVisit,
    required this.preexistingConditions,
    this.history = const [],
    this.bookmarks = const [],
    this.triageScore = 0,
    this.kaizenColor = 'green',
    this.activeTimerSeconds,
    this.recommendedGuidelines = const [],
    required super.issues,
    required super.patientGoals,
    required super.vitals,
    super.scans = const [],
    super.viewMode = AnatomicalViewMode.standard,
    super.occupation,
    super.reasonForVisit,
    super.genomicVariants,
    super.biochemicalPathways,
    super.pkInteractions,
    super.ewarsAlerts,
    super.travelProfile,
    super.awareStewardship,
    super.environmentalIndex,
  });

  @override
  List<Object?> get props => [
        id, name, age, gender, lastVisit, preexistingConditions, history,
        bookmarks, triageScore, kaizenColor, activeTimerSeconds,
        recommendedGuidelines, ...super.props,
      ];
}

class GeneticVariant extends Equatable {
  final String rsId;
  final String gene;
  final String chromosome;
  final String position;
  final String genotype;
  final String clinicalSignificance;
  final String pathogenicity;

  const GeneticVariant({
    required this.rsId,
    required this.gene,
    required this.chromosome,
    required this.position,
    required this.genotype,
    required this.clinicalSignificance,
    required this.pathogenicity,
  });

  factory GeneticVariant.fromJson(Map<String, dynamic> json) {
    return GeneticVariant(
      rsId: json['rsId'] ?? '',
      gene: json['gene'] ?? '',
      chromosome: json['chromosome'] ?? '',
      position: json['position'] ?? '',
      genotype: json['genotype'] ?? '',
      clinicalSignificance: json['clinicalSignificance'] ?? '',
      pathogenicity: json['pathogenicity'] ?? 'VUS',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rsId': rsId,
      'gene': gene,
      'chromosome': chromosome,
      'position': position,
      'genotype': genotype,
      'clinicalSignificance': clinicalSignificance,
      'pathogenicity': pathogenicity,
    };
  }

  @override
  List<Object?> get props => [rsId, gene, chromosome, position, genotype, clinicalSignificance, pathogenicity];
}

class BiochemicalPathway extends Equatable {
  final String id;
  final String name;
  final String status;
  final List<String> activeEnzymes;
  final List<String> blocks;

  const BiochemicalPathway({
    required this.id,
    required this.name,
    required this.status,
    required this.activeEnzymes,
    required this.blocks,
  });

  factory BiochemicalPathway.fromJson(Map<String, dynamic> json) {
    return BiochemicalPathway(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      status: json['status'] ?? 'Sub-optimal',
      activeEnzymes: List<String>.from(json['activeEnzymes'] ?? []),
      blocks: List<String>.from(json['blocks'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'activeEnzymes': activeEnzymes,
      'blocks': blocks,
    };
  }

  @override
  List<Object?> get props => [id, name, status, activeEnzymes, blocks];
}

class PharmacokineticInteraction extends Equatable {
  final String agent;
  final String target;
  final String affinity;
  final String effect;
  final String riskLevel;

  const PharmacokineticInteraction({
    required this.agent,
    required this.target,
    required this.affinity,
    required this.effect,
    required this.riskLevel,
  });

  factory PharmacokineticInteraction.fromJson(Map<String, dynamic> json) {
    return PharmacokineticInteraction(
      agent: json['agent'] ?? '',
      target: json['target'] ?? '',
      affinity: json['affinity'] ?? '',
      effect: json['effect'] ?? '',
      riskLevel: json['riskLevel'] ?? 'Low',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'agent': agent,
      'target': target,
      'affinity': affinity,
      'effect': effect,
      'riskLevel': riskLevel,
    };
  }

  @override
  List<Object?> get props => [agent, target, affinity, effect, riskLevel];
}

class EwarsOutbreakAlert extends Equatable {
  final String id;
  final String pathogen;
  final String viralCopyCount;
  final String surgeStatus;
  final String whoBulletin;
  final String riskToPatient;

  const EwarsOutbreakAlert({
    required this.id,
    required this.pathogen,
    required this.viralCopyCount,
    required this.surgeStatus,
    required this.whoBulletin,
    required this.riskToPatient,
  });

  factory EwarsOutbreakAlert.fromJson(Map<String, dynamic> json) {
    return EwarsOutbreakAlert(
      id: json['id'] ?? '',
      pathogen: json['pathogen'] ?? '',
      viralCopyCount: json['viralCopyCount'] ?? '',
      surgeStatus: json['surgeStatus'] ?? 'Baseline',
      whoBulletin: json['whoBulletin'] ?? '',
      riskToPatient: json['riskToPatient'] ?? 'Low',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'pathogen': pathogen,
      'viralCopyCount': viralCopyCount,
      'surgeStatus': surgeStatus,
      'whoBulletin': whoBulletin,
      'riskToPatient': riskToPatient,
    };
  }

  @override
  List<Object?> get props => [id, pathogen, viralCopyCount, surgeStatus, whoBulletin, riskToPatient];
}

class TravelMedicineProfile extends Equatable {
  final String destination;
  final String departureDate;
  final String cdcNoticeLevel;
  final List<String> requiredVaccines;
  final List<String> vectorRisks;
  final List<String> prophylacticProtocol;

  const TravelMedicineProfile({
    required this.destination,
    required this.departureDate,
    required this.cdcNoticeLevel,
    required this.requiredVaccines,
    required this.vectorRisks,
    required this.prophylacticProtocol,
  });

  factory TravelMedicineProfile.fromJson(Map<String, dynamic> json) {
    return TravelMedicineProfile(
      destination: json['destination'] ?? '',
      departureDate: json['departureDate'] ?? '',
      cdcNoticeLevel: json['cdcNoticeLevel'] ?? 'Level 1 - Watch',
      requiredVaccines: List<String>.from(json['requiredVaccines'] ?? []),
      vectorRisks: List<String>.from(json['vectorRisks'] ?? []),
      prophylacticProtocol: List<String>.from(json['prophylacticProtocol'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'destination': destination,
      'departureDate': departureDate,
      'cdcNoticeLevel': cdcNoticeLevel,
      'requiredVaccines': requiredVaccines,
      'vectorRisks': vectorRisks,
      'prophylacticProtocol': prophylacticProtocol,
    };
  }

  @override
  List<Object?> get props => [destination, departureDate, cdcNoticeLevel, requiredVaccines, vectorRisks, prophylacticProtocol];
}

class WhoAwareClassification extends Equatable {
  final String medication;
  final String category;
  final String resistanceRisk;
  final String stewardshipNote;

  const WhoAwareClassification({
    required this.medication,
    required this.category,
    required this.resistanceRisk,
    required this.stewardshipNote,
  });

  factory WhoAwareClassification.fromJson(Map<String, dynamic> json) {
    return WhoAwareClassification(
      medication: json['medication'] ?? '',
      category: json['category'] ?? 'Access',
      resistanceRisk: json['resistanceRisk'] ?? 'Low',
      stewardshipNote: json['stewardshipNote'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'medication': medication,
      'category': category,
      'resistanceRisk': resistanceRisk,
      'stewardshipNote': stewardshipNote,
    };
  }

  @override
  List<Object?> get props => [medication, category, resistanceRisk, stewardshipNote];
}

class EnvironmentalHealthIndex extends Equatable {
  final int aqi;
  final String pm25;
  final String ozone;
  final String pollenDensity;
  final String heatIndex;
  final String vulnerabilityWarning;

  const EnvironmentalHealthIndex({
    required this.aqi,
    required this.pm25,
    required this.ozone,
    required this.pollenDensity,
    required this.heatIndex,
    required this.vulnerabilityWarning,
  });

  factory EnvironmentalHealthIndex.fromJson(Map<String, dynamic> json) {
    return EnvironmentalHealthIndex(
      aqi: json['aqi'] ?? 0,
      pm25: json['pm25'] ?? '',
      ozone: json['ozone'] ?? '',
      pollenDensity: json['pollenDensity'] ?? 'Low',
      heatIndex: json['heatIndex'] ?? '',
      vulnerabilityWarning: json['vulnerabilityWarning'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'aqi': aqi,
      'pm25': pm25,
      'ozone': ozone,
      'pollenDensity': pollenDensity,
      'heatIndex': heatIndex,
      'vulnerabilityWarning': vulnerabilityWarning,
    };
  }

  @override
  List<Object?> get props => [aqi, pm25, ozone, pollenDensity, heatIndex, vulnerabilityWarning];
}

class GodelIncompletenessBound extends Equatable {
  final String formalSystemProofStatus;
  final List<String> unprovableAssumptions;
  final String epistemologicalBoundNotice;
  final List<String> missingGroundTruthTelemetry;

  const GodelIncompletenessBound({
    this.formalSystemProofStatus = 'INCOMPLETE_CONSISTENT',
    required this.unprovableAssumptions,
    required this.epistemologicalBoundNotice,
    required this.missingGroundTruthTelemetry,
  });

  factory GodelIncompletenessBound.fromJson(Map<String, dynamic> json) {
    return GodelIncompletenessBound(
      formalSystemProofStatus: json['formalSystemProofStatus'] as String? ?? 'INCOMPLETE_CONSISTENT',
      unprovableAssumptions: (json['unprovableAssumptions'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      epistemologicalBoundNotice: json['epistemologicalBoundNotice'] as String? ?? '',
      missingGroundTruthTelemetry: (json['missingGroundTruthTelemetry'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
    'formalSystemProofStatus': formalSystemProofStatus,
    'unprovableAssumptions': unprovableAssumptions,
    'epistemologicalBoundNotice': epistemologicalBoundNotice,
    'missingGroundTruthTelemetry': missingGroundTruthTelemetry,
  };

  @override
  List<Object?> get props => [formalSystemProofStatus, unprovableAssumptions, epistemologicalBoundNotice, missingGroundTruthTelemetry];
}

class BachCrabCanonTrack extends Equatable {
  final int trackNumber;
  final String title;
  final String subtitle;
  final double voice1CarrierHz;
  final double voice2RetrogradeHz;
  final double vagalLfoBpm;

  const BachCrabCanonTrack({
    this.trackNumber = 13,
    this.title = 'The Bach Crab Canon Entrainment',
    this.subtitle = 'Polyphonic Counterpoint & Vagal Retrograde Loop',
    this.voice1CarrierHz = 528.0,
    this.voice2RetrogradeHz = 432.0,
    this.vagalLfoBpm = 6.0,
  });

  factory BachCrabCanonTrack.fromJson(Map<String, dynamic> json) {
    return BachCrabCanonTrack(
      trackNumber: json['trackNumber'] as int? ?? 13,
      title: json['title'] as String? ?? 'The Bach Crab Canon Entrainment',
      subtitle: json['subtitle'] as String? ?? '',
      voice1CarrierHz: (json['voice1CarrierHz'] as num?)?.toDouble() ?? 528.0,
      voice2RetrogradeHz: (json['voice2RetrogradeHz'] as num?)?.toDouble() ?? 432.0,
      vagalLfoBpm: (json['vagalLfoBpm'] as num?)?.toDouble() ?? 6.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'trackNumber': trackNumber,
    'title': title,
    'subtitle': subtitle,
    'voice1CarrierHz': voice1CarrierHz,
    'voice2RetrogradeHz': voice2RetrogradeHz,
    'vagalLfoBpm': vagalLfoBpm,
  };

  @override
  List<Object?> get props => [trackNumber, title, subtitle, voice1CarrierHz, voice2RetrogradeHz, vagalLfoBpm];
}

class PubGemmaConfig extends Equatable {
  final String modelId;
  final bool isLocalEdge;
  final bool pubMedMeshGrounding;

  const PubGemmaConfig({
    this.modelId = 'pubgemma-7b',
    this.isLocalEdge = true,
    this.pubMedMeshGrounding = true,
  });

  factory PubGemmaConfig.fromJson(Map<String, dynamic> json) {
    return PubGemmaConfig(
      modelId: json['modelId'] as String? ?? 'pubgemma-7b',
      isLocalEdge: json['isLocalEdge'] as bool? ?? true,
      pubMedMeshGrounding: json['pubMedMeshGrounding'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'modelId': modelId,
    'isLocalEdge': isLocalEdge,
    'pubMedMeshGrounding': pubMedMeshGrounding,
  };

  @override
  List<Object?> get props => [modelId, isLocalEdge, pubMedMeshGrounding];
}

class ClinicalBiochemistryResult extends Equatable {
  final double calculatedPh;
  final String bufferState;
  final int osmolalityMOsmKg;
  final String tonicityStatus;
  final double gshGssgRatio;
  final String cellularOxidativeState;

  const ClinicalBiochemistryResult({
    this.calculatedPh = 7.40,
    this.bufferState = 'Normal Homeostasis',
    this.osmolalityMOsmKg = 285,
    this.tonicityStatus = 'Isotonic',
    this.gshGssgRatio = 100.0,
    this.cellularOxidativeState = 'Optimal Anti-Oxidant Reserve',
  });

  factory ClinicalBiochemistryResult.fromJson(Map<String, dynamic> json) {
    return ClinicalBiochemistryResult(
      calculatedPh: (json['calculatedPh'] as num?)?.toDouble() ?? 7.40,
      bufferState: json['bufferState'] as String? ?? 'Normal Homeostasis',
      osmolalityMOsmKg: json['osmolalityMOsmKg'] as int? ?? 285,
      tonicityStatus: json['tonicityStatus'] as String? ?? 'Isotonic',
      gshGssgRatio: (json['gshGssgRatio'] as num?)?.toDouble() ?? 100.0,
      cellularOxidativeState: json['cellularOxidativeState'] as String? ?? 'Optimal Anti-Oxidant Reserve',
    );
  }

  Map<String, dynamic> toJson() => {
    'calculatedPh': calculatedPh,
    'bufferState': bufferState,
    'osmolalityMOsmKg': osmolalityMOsmKg,
    'tonicityStatus': tonicityStatus,
    'gshGssgRatio': gshGssgRatio,
    'cellularOxidativeState': cellularOxidativeState,
  };

  @override
  List<Object?> get props => [calculatedPh, bufferState, osmolalityMOsmKg, tonicityStatus, gshGssgRatio, cellularOxidativeState];
}

class PhysicsBiophysicsResult extends Equatable {
  final double totalActionFrictionScore;
  final int variationalFreeEnergyScore;
  final int negentropicHomeostasisScore;
  final String markovBlanketStatus;
  final double circadianNoetherSymmetryPercent;

  const PhysicsBiophysicsResult({
    this.totalActionFrictionScore = 1.62,
    this.variationalFreeEnergyScore = 20,
    this.negentropicHomeostasisScore = 80,
    this.markovBlanketStatus = 'Intact & Exporting',
    this.circadianNoetherSymmetryPercent = 92.0,
  });

  factory PhysicsBiophysicsResult.fromJson(Map<String, dynamic> json) {
    return PhysicsBiophysicsResult(
      totalActionFrictionScore: (json['totalActionFrictionScore'] as num?)?.toDouble() ?? 1.62,
      variationalFreeEnergyScore: json['variationalFreeEnergyScore'] as int? ?? 20,
      negentropicHomeostasisScore: json['negentropicHomeostasisScore'] as int? ?? 80,
      markovBlanketStatus: json['markovBlanketStatus'] as String? ?? 'Intact & Exporting',
      circadianNoetherSymmetryPercent: (json['circadianNoetherSymmetryPercent'] as num?)?.toDouble() ?? 92.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'totalActionFrictionScore': totalActionFrictionScore,
    'variationalFreeEnergyScore': variationalFreeEnergyScore,
    'negentropicHomeostasisScore': negentropicHomeostasisScore,
    'markovBlanketStatus': markovBlanketStatus,
    'circadianNoetherSymmetryPercent': circadianNoetherSymmetryPercent,
  };

  @override
  List<Object?> get props => [totalActionFrictionScore, variationalFreeEnergyScore, negentropicHomeostasisScore, markovBlanketStatus, circadianNoetherSymmetryPercent];
}

class SkepticalEpistemologyReport extends Equatable {
  final String metricName;
  final double pValue;
  final bool isFalsified;
  final int epistemicConfidencePercent;
  final String overallRiskOfBias;

  const SkepticalEpistemologyReport({
    this.metricName = 'Vagal RSA Deceleration',
    this.pValue = 0.02,
    this.isFalsified = true,
    this.epistemicConfidencePercent = 98,
    this.overallRiskOfBias = 'Low Risk of Bias',
  });

  factory SkepticalEpistemologyReport.fromJson(Map<String, dynamic> json) {
    return SkepticalEpistemologyReport(
      metricName: json['metricName'] as String? ?? 'Vagal RSA Deceleration',
      pValue: (json['pValue'] as num?)?.toDouble() ?? 0.02,
      isFalsified: json['isFalsified'] as bool? ?? true,
      epistemicConfidencePercent: json['epistemicConfidencePercent'] as int? ?? 98,
      overallRiskOfBias: json['overallRiskOfBias'] as String? ?? 'Low Risk of Bias',
    );
  }

  Map<String, dynamic> toJson() => {
    'metricName': metricName,
    'pValue': pValue,
    'isFalsified': isFalsified,
    'epistemicConfidencePercent': epistemicConfidencePercent,
    'overallRiskOfBias': overallRiskOfBias,
  };

  @override
  List<Object?> get props => [metricName, pValue, isFalsified, epistemicConfidencePercent, overallRiskOfBias];
}

class Fhir7BundleMeta extends Equatable {
  final String fhirVersion;
  final String postQuantumEncryption;
  final String securityLabel;

  const Fhir7BundleMeta({
    this.fhirVersion = '7.0.0-horizon',
    this.postQuantumEncryption = 'NIST ML-KEM-1024 / Dilithium-5',
    this.securityLabel = 'HIPAA-ZKP-ZERO-KNOWLEDGE',
  });

  factory Fhir7BundleMeta.fromJson(Map<String, dynamic> json) {
    return Fhir7BundleMeta(
      fhirVersion: json['fhirVersion'] as String? ?? '7.0.0-horizon',
      postQuantumEncryption: json['postQuantumEncryption'] as String? ?? 'NIST ML-KEM-1024 / Dilithium-5',
      securityLabel: json['securityLabel'] as String? ?? 'HIPAA-ZKP-ZERO-KNOWLEDGE',
    );
  }

  Map<String, dynamic> toJson() => {
    'fhirVersion': fhirVersion,
    'postQuantumEncryption': postQuantumEncryption,
    'securityLabel': securityLabel,
  };

  @override
  List<Object?> get props => [fhirVersion, postQuantumEncryption, securityLabel];
}

class SpatialLesionModel extends Equatable {
  final String id;
  final String label;
  final String partId;
  final double x;
  final double y;
  final double z;
  final String severity; // 'mild' | 'moderate' | 'critical'
  final String morphology;
  final String clinicalNotes;
  final String snomedCode;
  final DateTime createdAt;

  const SpatialLesionModel({
    required this.id,
    required this.label,
    required this.partId,
    required this.x,
    required this.y,
    required this.z,
    required this.severity,
    required this.morphology,
    required this.clinicalNotes,
    required this.snomedCode,
    required this.createdAt,
  });

  factory SpatialLesionModel.fromJson(Map<String, dynamic> json) {
    final pos = json['position'] as Map<String, dynamic>?;
    return SpatialLesionModel(
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? '',
      partId: json['partId'] as String? ?? '',
      x: (pos?['x'] as num?)?.toDouble() ?? (json['x'] as num?)?.toDouble() ?? 0.0,
      y: (pos?['y'] as num?)?.toDouble() ?? (json['y'] as num?)?.toDouble() ?? 0.0,
      z: (pos?['z'] as num?)?.toDouble() ?? (json['z'] as num?)?.toDouble() ?? 0.0,
      severity: json['severity'] as String? ?? 'moderate',
      morphology: json['morphology'] as String? ?? 'inflammation',
      clinicalNotes: json['clinicalNotes'] as String? ?? '',
      snomedCode: json['snomedCode'] as String? ?? '404684003',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'label': label,
    'partId': partId,
    'position': {'x': x, 'y': y, 'z': z},
    'severity': severity,
    'morphology': morphology,
    'clinicalNotes': clinicalNotes,
    'snomedCode': snomedCode,
    'createdAt': createdAt.toIso8601String(),
  };

  @override
  List<Object?> get props => [
        id,
        label,
        partId,
        x,
        y,
        z,
        severity,
        morphology,
        clinicalNotes,
        snomedCode,
        createdAt,
      ];
}

