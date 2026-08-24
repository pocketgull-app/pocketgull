/// Standardized Kaggle Tagging Taxonomy for Pocketgull (Dart)
///
/// Defines a curated, high-relevance taxonomy of tags and keywords for Kaggle Models,
/// Datasets, Kernels, and Utility Scripts to maximize discoverability and achieve 10/10 usability.

enum TagCategory { all, clinical, aiMl, project }

const List<String> clinicalTags = [
  'healthcare',
  'medical-imaging',
  'dicom',
  'mri',
  'fhir',
  'hipaa-safe-harbor',
  'clinical-cds',
  'biomedical',
  'synthetic',
];

const List<String> aiMlTags = [
  'gemini',
  'agentic-ai',
  'pytorch',
  'onnx',
  'deep-learning',
  'computer-vision',
  'asymmetric-loss',
  'group-kfold',
  'socratic-reasoning',
];

const List<String> projectTags = [
  'pocketgull',
  'med-skeptic',
  'rsna',
  'physionet',
];

List<String> getStandardTags({
  TagCategory category = TagCategory.all,
  List<String>? extraTags,
}) {
  final baseList = switch (category) {
    TagCategory.clinical => [...clinicalTags],
    TagCategory.aiMl => [...aiMlTags],
    TagCategory.project => [...projectTags],
    TagCategory.all => {
        ...clinicalTags,
        ...aiMlTags,
        ...projectTags,
      }.toList()
      ..sort(),
  };

  if (extraTags != null) {
    baseList.addAll(extraTags);
  }

  final seen = <String>{};
  final cleaned = <String>[];

  for (final raw in baseList) {
    final formatted = raw.trim().toLowerCase().replaceAll(' ', '-');
    if (formatted.isNotEmpty && seen.add(formatted)) {
      cleaned.add(formatted);
    }
  }

  return cleaned;
}

void main() {
  final all = getStandardTags();
  print('\n🏷️  Pocket-Gull Standard Kaggle Tag Taxonomy (${all.length} tags):\n');
  print('  ${all.join(', ')}\n');
}
