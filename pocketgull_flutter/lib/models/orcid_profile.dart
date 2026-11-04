class OrcidWork {
  final String title;
  final String? url;
  final String? type;
  final String? year;

  const OrcidWork({
    required this.title,
    this.url,
    this.type,
    this.year,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'url': url,
        'type': type,
        'year': year,
      };

  factory OrcidWork.fromJson(Map<String, dynamic> json) => OrcidWork(
        title: json['title'] as String? ?? 'Untitled Work',
        url: json['url'] as String?,
        type: json['type'] as String?,
        year: json['year'] as String?,
      );
}

class OrcidUrl {
  final String name;
  final String url;

  const OrcidUrl({
    required this.name,
    required this.url,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'url': url,
      };

  factory OrcidUrl.fromJson(Map<String, dynamic> json) => OrcidUrl(
        name: json['name'] as String? ?? 'Website',
        url: json['url'] as String? ?? '',
      );
}

class OrcidProfile {
  final String orcidId;
  final String name;
  final List<String> keywords;
  final List<OrcidWork> works;
  final List<OrcidUrl> urls;

  const OrcidProfile({
    required this.orcidId,
    required this.name,
    required this.keywords,
    required this.works,
    required this.urls,
  });

  Map<String, dynamic> toJson() => {
        'orcidId': orcidId,
        'name': name,
        'keywords': keywords,
        'works': works.map((w) => w.toJson()).toList(),
        'urls': urls.map((u) => u.toJson()).toList(),
      };

  factory OrcidProfile.fromJson(Map<String, dynamic> json) {
    final keywordsList = json['keywords'] != null
        ? List<String>.from(json['keywords'] as Iterable<dynamic>)
        : <String>[];

    final worksList = json['works'] != null
        ? (json['works'] as List<dynamic>)
            .map((w) => OrcidWork.fromJson(w as Map<String, dynamic>))
            .toList()
        : <OrcidWork>[];

    final urlsList = json['urls'] != null
        ? (json['urls'] as List<dynamic>)
            .map((u) => OrcidUrl.fromJson(u as Map<String, dynamic>))
            .toList()
        : <OrcidUrl>[];

    return OrcidProfile(
      orcidId: json['orcidId'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown Researcher',
      keywords: keywordsList,
      works: worksList,
      urls: urlsList,
    );
  }
}
