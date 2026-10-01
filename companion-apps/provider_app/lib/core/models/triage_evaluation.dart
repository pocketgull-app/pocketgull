enum EsiLevel {
  esi1Stat,
  esi2Emergent,
  esi3Urgent,
  esi4LessUrgent,
  esi5NonUrgent;

  String get label {
    switch (this) {
      case EsiLevel.esi1Stat:
        return 'ESI-1 STAT';
      case EsiLevel.esi2Emergent:
        return 'ESI-2 Emergent';
      case EsiLevel.esi3Urgent:
        return 'ESI-3 Urgent';
      case EsiLevel.esi4LessUrgent:
        return 'ESI-4 Less Urgent';
      case EsiLevel.esi5NonUrgent:
        return 'ESI-5 Non-Urgent';
    }
  }

  int get levelNumber {
    switch (this) {
      case EsiLevel.esi1Stat:
        return 1;
      case EsiLevel.esi2Emergent:
        return 2;
      case EsiLevel.esi3Urgent:
        return 3;
      case EsiLevel.esi4LessUrgent:
        return 4;
      case EsiLevel.esi5NonUrgent:
        return 5;
    }
  }
}

class SmoeExpertSlot {
  final String category;
  final String name;
  final String icon;
  final int probabilityPercent;

  const SmoeExpertSlot({
    required this.category,
    required this.name,
    required this.icon,
    required this.probabilityPercent,
  });

  Map<String, dynamic> toJson() => {
    'category': category,
    'name': name,
    'icon': icon,
    'probabilityPercent': probabilityPercent,
  };
}

class CrossAttentionSynapse {
  final String title;
  final String description;
  final String sourceExpert;
  final String targetExpert;

  const CrossAttentionSynapse({
    required this.title,
    required this.description,
    required this.sourceExpert,
    required this.targetExpert,
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'description': description,
    'sourceExpert': sourceExpert,
    'targetExpert': targetExpert,
  };
}

class VitalsSummary {
  final String bp;
  final String hr;
  final String spO2;
  final String temp;
  final List<String> criticalOutliers;
  final bool hasCriticalOutlier;

  const VitalsSummary({
    required this.bp,
    required this.hr,
    required this.spO2,
    required this.temp,
    required this.criticalOutliers,
    required this.hasCriticalOutlier,
  });

  Map<String, dynamic> toJson() => {
    'bp': bp,
    'hr': hr,
    'spO2': spO2,
    'temp': temp,
    'criticalOutliers': criticalOutliers,
    'hasCriticalOutlier': hasCriticalOutlier,
  };
}

class AccompaniedStatus {
  final String role;
  final String label;

  const AccompaniedStatus({
    required this.role,
    required this.label,
  });

  Map<String, dynamic> toJson() => {
    'role': role,
    'label': label,
  };
}

class LanguageAccessStatus {
  final String preferredLanguage;
  final bool interpreterNeeded;
  final String modality;

  const LanguageAccessStatus({
    required this.preferredLanguage,
    required this.interpreterNeeded,
    required this.modality,
  });

  Map<String, dynamic> toJson() => {
    'preferredLanguage': preferredLanguage,
    'interpreterNeeded': interpreterNeeded,
    'modality': modality,
  };
}

class PatientTriageEvaluation {
  final String patientId;
  final String patientName;
  final int age;
  final String gender;
  final EsiLevel esiLevel;
  final int news2Score;
  final VitalsSummary vitalsSummary;
  final List<SmoeExpertSlot> predictedTopExperts;
  final CrossAttentionSynapse? crossAttentionSynapse;
  final String priorityRationale;
  final int targetMaxWaitMinutes;
  final AccompaniedStatus? accompaniedBy;
  final LanguageAccessStatus? languageAccess;

  const PatientTriageEvaluation({
    required this.patientId,
    required this.patientName,
    required this.age,
    required this.gender,
    required this.esiLevel,
    required this.news2Score,
    required this.vitalsSummary,
    required this.predictedTopExperts,
    this.crossAttentionSynapse,
    required this.priorityRationale,
    required this.targetMaxWaitMinutes,
    this.accompaniedBy,
    this.languageAccess,
  });

  String get esiLabel => esiLevel.label;

  Map<String, dynamic> toJson() => {
    'patientId': patientId,
    'patientName': patientName,
    'age': age,
    'gender': gender,
    'esiLevel': esiLevel.levelNumber,
    'esiLabel': esiLabel,
    'news2Score': news2Score,
    'vitalsSummary': vitalsSummary.toJson(),
    'predictedTopExperts': predictedTopExperts.map((e) => e.toJson()).toList(),
    'crossAttentionSynapse': crossAttentionSynapse?.toJson(),
    'priorityRationale': priorityRationale,
    'targetMaxWaitMinutes': targetMaxWaitMinutes,
    'accompaniedBy': accompaniedBy?.toJson(),
    'languageAccess': languageAccess?.toJson(),
  };
}
