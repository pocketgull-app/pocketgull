/// Social & environmental gravitational vector models for behavioral health.
class SocialVector {
  final String id;
  final String name;
  final String category;
  final String type;
  final int coherenceMatchPercent;
  final double distanceMiles;
  final String emoji;
  final String biomarkerImpact;
  final String energeticRationale;
  final String tcmAyurvedicMatch;
  final String locationName;

  const SocialVector({
    required this.id,
    required this.name,
    required this.category,
    required this.type,
    required this.coherenceMatchPercent,
    required this.distanceMiles,
    required this.emoji,
    required this.biomarkerImpact,
    required this.energeticRationale,
    required this.tcmAyurvedicMatch,
    required this.locationName,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'category': category,
        'type': type,
        'coherenceMatchPercent': coherenceMatchPercent,
        'distanceMiles': distanceMiles,
        'emoji': emoji,
        'biomarkerImpact': biomarkerImpact,
        'energeticRationale': energeticRationale,
        'tcmAyurvedicMatch': tcmAyurvedicMatch,
        'locationName': locationName,
      };

  factory SocialVector.fromJson(Map<String, dynamic> json) => SocialVector(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        category: json['category'] as String? ?? '',
        type: json['type'] as String? ?? '',
        coherenceMatchPercent:
            (json['coherenceMatchPercent'] as num?)?.toInt() ?? 0,
        distanceMiles: (json['distanceMiles'] as num?)?.toDouble() ?? 0.0,
        emoji: json['emoji'] as String? ?? '',
        biomarkerImpact: json['biomarkerImpact'] as String? ?? '',
        energeticRationale: json['energeticRationale'] as String? ?? '',
        tcmAyurvedicMatch: json['tcmAyurvedicMatch'] as String? ?? '',
        locationName: json['locationName'] as String? ?? '',
      );
}

/// Hobby prescription model for neuroplasticity and wellness.
class HobbyVector {
  final String id;
  final String name;
  final String emoji;
  final String timeCommitment;
  final String difficulty;
  final String characterTrait;
  final String clinicalBenefits;
  final String energeticSynergy;

  const HobbyVector({
    required this.id,
    required this.name,
    required this.emoji,
    required this.timeCommitment,
    required this.difficulty,
    required this.characterTrait,
    required this.clinicalBenefits,
    required this.energeticSynergy,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'emoji': emoji,
        'timeCommitment': timeCommitment,
        'difficulty': difficulty,
        'characterTrait': characterTrait,
        'clinicalBenefits': clinicalBenefits,
        'energeticSynergy': energeticSynergy,
      };

  factory HobbyVector.fromJson(Map<String, dynamic> json) => HobbyVector(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        emoji: json['emoji'] as String? ?? '',
        timeCommitment: json['timeCommitment'] as String? ?? '',
        difficulty: json['difficulty'] as String? ?? '',
        characterTrait: json['characterTrait'] as String? ?? '',
        clinicalBenefits: json['clinicalBenefits'] as String? ?? '',
        energeticSynergy: json['energeticSynergy'] as String? ?? '',
      );
}
