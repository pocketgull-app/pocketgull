import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/models/patient.dart';

class PatientDashboard extends StatefulWidget {
  final Patient patient;
  const PatientDashboard({super.key, required this.patient});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  final ApiClient _apiClient = ApiClient();
  late Patient _currentPatient;
  bool _isLoading = false;
  String _syncStatus = 'idle'; // 'idle', 'syncing', 'success', 'error'

  @override
  void initState() {
    super.initState();
    _currentPatient = widget.patient;
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final data = await _apiClient.fetchPatients();
    if (data.isNotEmpty && mounted) {
      final matching = data.where((json) => json['id'] == _currentPatient.id);
      if (matching.isNotEmpty) {
        setState(() {
          _currentPatient = Patient.fromJson(matching.first);
        });
      }
    }
    setState(() => _isLoading = false);
  }

  Future<void> _simulateHealthSync() async {
    if (_syncStatus != 'idle') return;
    setState(() => _syncStatus = 'syncing');

    // Simulate connecting to Apple Health / Health Connect
    // and pushing new vitals back to the web API
    final newVitals = {
      'hr': '72 bpm',
      'bp': '118/75',
      'steps': '6,240',
      'lastSync': DateTime.now().toIso8601String(),
    };

    // Keep existing state, just update vitals
    final fullState = _currentPatient.state.toJson();
    fullState['vitals'] = {..._currentPatient.state.vitals, ...newVitals};

    final success = await _apiClient.syncPatientData(_currentPatient.id, {
      'vitals': fullState['vitals'],
    });

    if (mounted) {
      setState(() {
        _syncStatus = success ? 'success' : 'error';
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success 
            ? 'Successfully synced biometrics with Pocket Gull.' 
            : 'Failed to sync data.'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );

      if (success) {
        _loadData(); // Reload to show updated data
      }

      // Revert back to idle after 2.5 seconds
      Future.delayed(const Duration(milliseconds: 2500), () {
        if (mounted) {
          setState(() => _syncStatus = 'idle');
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final cardColor = isDark ? const Color(0xFF27272A) : Colors.white;
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final bool isWatch = screenWidth < 240 || screenHeight < 320;
    final bool isSmallPhone = screenWidth < 360 || screenHeight < 640;

    final double outerPadding = isWatch ? 8.0 : (isSmallPhone ? 16.0 : 24.0);
    final double welcomeFontSize = isWatch ? 16.0 : (isSmallPhone ? 22.0 : 28.0);
    final double subtitleFontSize = isWatch ? 10.0 : (isSmallPhone ? 13.0 : 16.0);
    final double sectionTitleFontSize = isWatch ? 9.0 : 12.0;
    final double sectionSpacing = isWatch ? 16.0 : (isSmallPhone ? 24.0 : 32.0);
    final double cardPadding = isWatch ? 10.0 : (isSmallPhone ? 12.0 : 16.0);
    final double infoFontSize = isWatch ? 10.0 : 14.0;
    final double buttonVerticalPadding = isWatch ? 10.0 : (isSmallPhone ? 12.0 : 16.0);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text('MY CARE PLAN', style: TextStyle(letterSpacing: 2, fontSize: isWatch ? 11 : 14)),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: EdgeInsets.all(outerPadding),
                children: [
                  Text(
                    'Hello, ${_currentPatient.name.split(' ').first}',
                    style: TextStyle(fontSize: welcomeFontSize, fontWeight: FontWeight.bold, color: textColor),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Here is your latest clinical summary.',
                    style: TextStyle(fontSize: subtitleFontSize, color: subColor),
                  ),
                  SizedBox(height: sectionSpacing),
                  
                  // Active Issues
                  _buildSectionTitle('ACTIVE CONCERNS', textColor, sectionTitleFontSize),
                  const SizedBox(height: 16),
                  ..._currentPatient.state.issues.entries.toList().asMap().entries.map((item) {
                    final index = item.key;
                    final entry = item.value;
                    return StaggeredEntrance(
                      delay: Duration(milliseconds: index * 120),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: EdgeInsets.all(cardPadding),
                        decoration: BoxDecoration(
                          color: cardColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.key.toUpperCase(),
                              style: TextStyle(fontSize: isWatch ? 9.0 : 12.0, fontWeight: FontWeight.bold, letterSpacing: 1, color: subColor),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${entry.value.length} flagged node(s)',
                              style: TextStyle(color: textColor, fontSize: infoFontSize),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),

                  SizedBox(height: sectionSpacing),

                  // Chart Update Recommendations (Patient Nudges)
                  _buildSectionTitle('RECOMMENDED ACTIONS', textColor, sectionTitleFontSize),
                  const SizedBox(height: 16),
                  Container(
                    padding: EdgeInsets.all(isWatch ? 12.0 : 20.0),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF27272A).withValues(alpha: 0.5) : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.favorite_border, color: textColor, size: isWatch ? 16 : 20),
                            SizedBox(width: isWatch ? 8 : 12),
                            Expanded(
                              child: Text(
                                'Connect Health App',
                                style: TextStyle(fontWeight: FontWeight.bold, color: textColor, fontSize: infoFontSize),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Your doctor lacks recent activity data. Sync Apple Health or Google Health Connect to update your clinical chart automatically.',
                          style: TextStyle(height: 1.5, color: subColor, fontSize: isWatch ? 9 : 14),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _syncStatus == 'success'
                                  ? Colors.green
                                  : (_syncStatus == 'error'
                                      ? Colors.red
                                      : (_syncStatus == 'syncing'
                                          ? textColor.withValues(alpha: 0.7)
                                          : textColor)),
                              foregroundColor: (_syncStatus == 'success' || _syncStatus == 'error')
                                  ? Colors.white
                                  : bgColor,
                              padding: EdgeInsets.symmetric(vertical: buttonVerticalPadding),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            ),
                            onPressed: _syncStatus == 'idle' ? _simulateHealthSync : null,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (_syncStatus == 'syncing') ...[
                                  SizedBox(
                                    height: 16,
                                    width: 16,
                                    child: CircularProgressIndicator(
                                      color: bgColor,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                ] else if (_syncStatus == 'success') ...[
                                  const Icon(Icons.check, size: 16),
                                  const SizedBox(width: 8),
                                ] else if (_syncStatus == 'error') ...[
                                  const Icon(Icons.close, size: 16),
                                  const SizedBox(width: 8),
                                ],
                                Text(
                                  _syncStatus == 'success'
                                      ? 'BIOMETRICS SYNCED'
                                      : (_syncStatus == 'error'
                                          ? 'SYNC FAILED'
                                          : (_syncStatus == 'syncing'
                                              ? 'SYNCING DATA...'
                                              : 'SYNC BIOMETRICS')),
                                  style: TextStyle(
                                    fontSize: isWatch ? 10 : 12,
                                    letterSpacing: 1.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      ],
                    ),
                  ),

                  SizedBox(height: sectionSpacing),

                  // Bio-Network & Solfeggio Theme Studio Card
                  _buildSectionTitle('BIO-NETWORK & THEME STUDIO', textColor, sectionTitleFontSize),
                  const SizedBox(height: 16),
                  Container(
                    padding: EdgeInsets.all(isWatch ? 12.0 : 20.0),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF27272A).withValues(alpha: 0.5) : const Color(0xFFF5F3FF),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isDark ? const Color(0xFF6B21A8) : const Color(0xFFDDD6FE)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.qr_code_2, color: Colors.purple.shade400, size: isWatch ? 16 : 22),
                            SizedBox(width: isWatch ? 8 : 12),
                            Expanded(
                              child: Text(
                                'Sharable Bio-Network QR',
                                style: TextStyle(fontWeight: FontWeight.bold, color: textColor, fontSize: infoFontSize),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Sharable QR payload, Solfeggio 528Hz entrance theme song, and real-time haptic pulse entrainment.',
                          style: TextStyle(height: 1.5, color: subColor, fontSize: isWatch ? 9 : 13),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.purple.shade400,
                              side: BorderSide(color: Colors.purple.shade400),
                              padding: EdgeInsets.symmetric(vertical: buttonVerticalPadding),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            ),
                            icon: const Icon(Icons.music_note, size: 16),
                            label: Text(
                              'SHOW MY BIO-NETWORK QR',
                              style: TextStyle(
                                fontSize: isWatch ? 10 : 12,
                                letterSpacing: 1.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('📱 Playing 528Hz Entrance Solfeggio Chime & Haptic Pulse!'),
                                  backgroundColor: Colors.purple,
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title, Color color, double fontSize) {
    return Text(
      title,
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
        color: color,
      ),
    );
  }
}

class StaggeredEntrance extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const StaggeredEntrance({
    super.key,
    required this.child,
    required this.delay,
  });

  @override
  State<StaggeredEntrance> createState() => _StaggeredEntranceState();
}

class _StaggeredEntranceState extends State<StaggeredEntrance>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<double> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _slideAnimation = Tween<double>(begin: 15.0, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );

    Future.delayed(widget.delay, () {
      if (mounted) {
        _controller.forward();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: child,
          ),
        );
      },
      child: widget.child,
    );
  }
}
