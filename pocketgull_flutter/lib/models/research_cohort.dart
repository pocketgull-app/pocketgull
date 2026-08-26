/// Research Cohort and Dividend Ledger Data Models for Flutter.
/// Conforms to HIPAA § 164.508 digital authorization.
library;

class ResearchCohort {
  final String id;
  final String title;
  final String category;
  final String description;
  final double compensationPerQueryUsd;
  final int participantCount;
  final int kAnonymityScore;
  final String ethicalPrecedent;
  final bool isEnrolled;

  const ResearchCohort({
    required this.id,
    required this.title,
    required this.category,
    required this.description,
    required this.compensationPerQueryUsd,
    required this.participantCount,
    required this.kAnonymityScore,
    required this.ethicalPrecedent,
    this.isEnrolled = false,
  });

  ResearchCohort copyWith({bool? isEnrolled}) {
    return ResearchCohort(
      id: id,
      title: title,
      category: category,
      description: description,
      compensationPerQueryUsd: compensationPerQueryUsd,
      participantCount: participantCount,
      kAnonymityScore: kAnonymityScore,
      ethicalPrecedent: ethicalPrecedent,
      isEnrolled: isEnrolled ?? this.isEnrolled,
    );
  }

  factory ResearchCohort.fromJson(Map<String, dynamic> json) {
    return ResearchCohort(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      category: json['category'] as String? ?? '',
      description: json['description'] as String? ?? '',
      compensationPerQueryUsd: (json['compensationPerQueryUsd'] as num?)?.toDouble() ?? 0.0,
      participantCount: json['participantCount'] as int? ?? 0,
      kAnonymityScore: json['kAnonymityScore'] as int? ?? 8,
      ethicalPrecedent: json['ethicalPrecedent'] as String? ?? 'nih_all_of_us',
      isEnrolled: json['isEnrolled'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'description': description,
      'compensationPerQueryUsd': compensationPerQueryUsd,
      'participantCount': participantCount,
      'kAnonymityScore': kAnonymityScore,
      'ethicalPrecedent': ethicalPrecedent,
      'isEnrolled': isEnrolled,
    };
  }
}

class DividendLedgerEntry {
  final String id;
  final String cohortTitle;
  final double amountUsd;
  final DateTime timestamp;
  final String transactionHash;

  const DividendLedgerEntry({
    required this.id,
    required this.cohortTitle,
    required this.amountUsd,
    required this.timestamp,
    required this.transactionHash,
  });

  factory DividendLedgerEntry.fromJson(Map<String, dynamic> json) {
    return DividendLedgerEntry(
      id: json['id'] as String? ?? '',
      cohortTitle: json['cohortTitle'] as String? ?? '',
      amountUsd: (json['amountUsd'] as num?)?.toDouble() ?? 0.0,
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ?? DateTime.now(),
      transactionHash: json['transactionHash'] as String? ?? '',
    );
  }
}
