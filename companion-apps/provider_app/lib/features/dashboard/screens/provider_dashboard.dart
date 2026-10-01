import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/models/patient.dart';
import '../../../../core/services/triage_cache_service.dart';
import 'triage_command_board.dart';

class ProviderDashboard extends StatefulWidget {
  const ProviderDashboard({super.key});

  @override
  State<ProviderDashboard> createState() => _ProviderDashboardState();
}

class _ProviderDashboardState extends State<ProviderDashboard> {
  final ApiClient _apiClient = ApiClient();
  List<Patient> _patients = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final data = await _apiClient.fetchPatients();
    setState(() {
      final loaded = data.map((json) => Patient.fromJson(json)).toList();
      _patients = loaded.isNotEmpty ? loaded : TriageCacheService.fallbackPatients;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);

    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final bool isWatch = screenWidth < 240 || screenHeight < 320;
    final double appBarTitleFontSize = isWatch ? 11.0 : 13.0;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Column(
          children: [
            Text(
              'POCKETGULL CLINICAL COMMAND',
              style: TextStyle(letterSpacing: 1.5, fontSize: appBarTitleFontSize, fontWeight: FontWeight.w900),
            ),
            const Text(
              'ESI Triage Matrix & Sparse MoE Router',
              style: TextStyle(fontSize: 10, color: Color(0xFF71717A)),
            ),
          ],
        ),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        actions: [
          IconButton(
            iconSize: isWatch ? 16 : 22,
            icon: const Icon(Icons.refresh),
            tooltip: 'Sync Live Triage Telemetry',
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TriageCommandBoard(
              initialPatients: _patients,
              onRefresh: _loadData,
            ),
    );
  }
}

String getPatientInitials(String name) {
  if (name.isEmpty) return '';
  final parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

Color getPatientAvatarColor(String id, bool isDark) {
  final int hash = id.hashCode;
  final List<Color> darkColors = [
    const Color(0xFF1E3A8A), // Blue
    const Color(0xFF065F46), // Green
    const Color(0xFF701A75), // Purple
    const Color(0xFF7C2D12), // Orange/Rust
    const Color(0xFF1F2937), // Dark Gray
  ];
  final List<Color> lightColors = [
    const Color(0xFFDBEAFE), // Light Blue
    const Color(0xFFD1FAE5), // Light Green
    const Color(0xFFF3E8FF), // Light Purple
    const Color(0xFFFFEDD5), // Light Orange
    const Color(0xFFF3F4F6), // Light Gray
  ];
  final list = isDark ? darkColors : lightColors;
  return list[hash.abs() % list.length];
}

Color getPatientAvatarTextColor(String id, bool isDark) {
  final int hash = id.hashCode;
  final List<Color> darkTextColors = [
    const Color(0xFF93C5FD),
    const Color(0xFF6EE7B7),
    const Color(0xFFF5D0FE),
    const Color(0xFFFDBA74),
    const Color(0xFFE5E7EB),
  ];
  final List<Color> lightTextColors = [
    const Color(0xFF1E40AF),
    const Color(0xFF065F46),
    const Color(0xFF6B21A8),
    const Color(0xFF9A3412),
    const Color(0xFF374151),
  ];
  final list = isDark ? darkTextColors : lightTextColors;
  return list[hash.abs() % list.length];
}
