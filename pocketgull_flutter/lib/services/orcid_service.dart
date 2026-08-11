import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../models/orcid_profile.dart';

class OrcidService with ChangeNotifier {
  String? _orcidId;
  OrcidProfile? _profile;
  bool _isLoading = false;
  String? _error;

  String? get orcidId => _orcidId;
  OrcidProfile? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  bool get isConnected => _orcidId != null;

  String _getBaseUrl() {
    if (kIsWeb) {
      final baseUri = Uri.base;
      return '${baseUri.scheme}://${baseUri.host}:${baseUri.port}';
    }
    // If Android emulator, use 10.0.2.2. If iOS/desktop, use localhost.
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:4000';
    }
    return 'http://localhost:4000';
  }

  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedId = prefs.getString('orcid_id');
      if (savedId != null) {
        _orcidId = savedId;
        notifyListeners();
        await _fetchProfile(savedId);
      }
    } catch (e) {
      debugPrint('Failed to initialize OrcidService: $e');
    }
  }

  Future<bool> connectOrcid(String id) async {
    final cleanId = id.trim().replaceAll(RegExp(r'https?://orcid\.org/'), '');
    if (!RegExp(r'^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$').hasMatch(cleanId)) {
      _error = 'Invalid ORCID iD format. Expected: 0000-0002-1825-0097';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final baseUrl = _getBaseUrl();
      final response = await http.get(Uri.parse('$baseUrl/api/orcid/$cleanId'));

      if (response.statusCode == 200) {
        final rawJson = json.decode(response.body);
        final parsed = _parseOrcidData(cleanId, rawJson);

        _orcidId = cleanId;
        _profile = parsed;
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('orcid_id', cleanId);
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        String serverError = 'Failed to fetch profile from ORCID.';
        try {
          final errorJson = json.decode(response.body);
          if (errorJson['error'] != null) {
            serverError = errorJson['error'];
          }
        } catch (_) {}
        _error = serverError;
      }
    } catch (e) {
      debugPrint('Failed to load ORCID profile: $e');
      _error = 'Failed to connect to ORCID server.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  void disconnect() async {
    _orcidId = null;
    _profile = null;
    _error = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('orcid_id');
    } catch (e) {
      debugPrint('Failed to save ORCID disconnect state: $e');
    }
  }

  Future<void> _fetchProfile(String id) async {
    try {
      final baseUrl = _getBaseUrl();
      final response = await http.get(Uri.parse('$baseUrl/api/orcid/$id'));

      if (response.statusCode == 200) {
        final rawJson = json.decode(response.body);
        _profile = _parseOrcidData(id, rawJson);
        notifyListeners();
      } else {
        _error = 'Failed to load saved ORCID profile.';
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to auto-refresh ORCID profile: $e');
      _error = 'Failed to load saved ORCID profile.';
      notifyListeners();
    }
  }

  OrcidProfile _parseOrcidData(String orcidId, Map<String, dynamic> raw) {
    final person = raw['person'];
    final nameMap = person?['name'];
    final givenNames = nameMap?['given-names']?['value'] ?? '';
    final familyName = nameMap?['family-name']?['value'] ?? '';
    final nameList = [givenNames, familyName].where((s) => s.isNotEmpty).toList();
    final name = nameList.isEmpty ? 'Unknown Researcher' : nameList.join(' ');

    // Keywords
    final keywordsRaw = person?['keywords']?['keyword'] ?? [];
    final List<String> keywords = [];
    if (keywordsRaw is List) {
      for (final k in keywordsRaw) {
        final content = k['content'];
        if (content != null && content is String) {
          keywords.add(content);
        }
      }
    }

    // URLs
    final urlsRaw = person?['researcher-urls']?['researcher-url'] ?? [];
    final List<OrcidUrl> urls = [];
    if (urlsRaw is List) {
      for (final u in urlsRaw) {
        final uName = u['url-name'] ?? 'Website';
        final uVal = u['url']?['value'];
        if (uVal != null && uVal is String && uVal.isNotEmpty) {
          urls.add(OrcidUrl(name: uName, url: uVal));
        }
      }
    }

    // Works
    final worksRaw = raw['activities-summary']?['works']?['group'] ?? [];
    final List<OrcidWork> works = [];
    if (worksRaw is List) {
      for (final group in worksRaw) {
        final summaries = group['work-summary'];
        if (summaries is List && summaries.isNotEmpty) {
          final summary = summaries[0];
          final title = summary['title']?['title']?['value'] ?? 'Untitled Work';
          final url = summary['url']?['value'];
          final type = summary['type'];
          final year = summary['publication-date']?['year']?['value'];
          works.add(OrcidWork(
            title: title,
            url: url,
            type: type,
            year: year,
          ));
        }
      }
    }

    return OrcidProfile(
      orcidId: orcidId,
      name: name,
      keywords: keywords,
      works: works,
      urls: urls,
    );
  }
}
