import 'dart:async';
import 'package:flutter/material.dart';
import '../models/patient_types.dart';
import '../services/patient_management_service.dart';
import '../widgets/native_body_viewer.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import 'home_screen.dart';

class TriageBoardScreen extends ConsumerStatefulWidget {
  const TriageBoardScreen({super.key});

  @override
  ConsumerState<TriageBoardScreen> createState() => _TriageBoardScreenState();
}

class _TriageBoardScreenState extends ConsumerState<TriageBoardScreen> with SingleTickerProviderStateMixin {
  final PatientManagementService _service = PatientManagementService();
  List<Patient> _patients = [];
  bool _isLoading = true;
  Timer? _ticker;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  AnatomicalViewMode _currentViewMode = AnatomicalViewMode.standard;

  @override
  void initState() {
    super.initState();
    _loadPatients();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4), // 1s per phase
    )..repeat();

    _pulseAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)), weight: 1), // Inhale
      TweenSequenceItem(tween: ConstantTween<double>(1.0), weight: 1), // Hold
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeInOut)), weight: 1), // Exhale
      TweenSequenceItem(tween: ConstantTween<double>(0.0), weight: 1), // Hold
    ]).animate(_pulseController);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _loadPatients() async {
    final patients = await _service.loadPatients();
    
    patients.sort((a, b) {
      final colorWeight = _getColorWeight(a.kaizenColor).compareTo(_getColorWeight(b.kaizenColor));
      if (colorWeight != 0) return colorWeight;
      return b.triageScore.compareTo(a.triageScore);
    });

    setState(() {
      _patients = patients;
      _isLoading = false;
    });
  }

  int _getColorWeight(String color) {
    switch (color.toLowerCase()) {
      case 'red': return 1;
      case 'yellow': return 2;
      case 'blue': return 3;
      case 'green': return 4;
      default: return 5;
    }
  }

  Color _getKaizenColor(String color) {
    switch (color.toLowerCase()) {
      case 'red': return const Color(0xFFEF4444); // Vibrant Red
      case 'yellow': return const Color(0xFFF59E0B); // Amber
      case 'blue': return const Color(0xFF3B82F6); // Blue
      case 'green': return const Color(0xFF10B981); // Emerald
      default: return const Color(0xFF6B7280); // Gray
    }
  }

  String _formatTimer(int? seconds) {
    if (seconds == null) return '';
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Widget _buildVitalBox(String label, String value, IconData icon, Color color) {
    return Container(
      width: 85,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        border: Border.all(color: color.withValues(alpha: 0.15)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, size: 24, color: color),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
          const SizedBox(height: 4),
          Text(value.isEmpty ? '--' : value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1F2937))),
        ],
      ),
    );
  }

  Widget _buildViewModeToggle() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
      color: Colors.white,
      child: Row(
        children: [
          const Text('CLINICAL MESH LAYER:', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.grey, letterSpacing: 1.5)),
          const SizedBox(width: 16),
          SegmentedButton<AnatomicalViewMode>(
            segments: const [
              ButtonSegment(value: AnatomicalViewMode.standard, label: Text('Standard')),
              ButtonSegment(value: AnatomicalViewMode.orthomolecular, label: Text('Orthomolecular')),
              ButtonSegment(value: AnatomicalViewMode.vascular, label: Text('Vascular')),
              ButtonSegment(value: AnatomicalViewMode.muscular, label: Text('Muscular')),
              ButtonSegment(value: AnatomicalViewMode.skeletal, label: Text('Skeletal')),
            ],
            selected: {_currentViewMode},
            onSelectionChanged: (Set<AnatomicalViewMode> newSelection) {
              setState(() {
                _currentViewMode = newSelection.first;
              });
              ref.read(patientProvider.notifier).changeAnatomicalViewMode(newSelection.first);
            },
            style: ButtonStyle(
              textStyle: WidgetStateProperty.all(const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6), // Premium light gray background
      appBar: AppBar(
        title: const Text('KAIZEN TRIAGE DASHBOARD', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 16, color: Color(0xFF111827))),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF111827)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.grey),
            onPressed: () {
              setState(() => _isLoading = true);
              _loadPatients();
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          _buildViewModeToggle(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              itemCount: _patients.length,
              itemBuilder: (context, index) {
          final patient = _patients[index];
          final color = _getKaizenColor(patient.kaizenColor);
          final isRed = patient.kaizenColor.toLowerCase() == 'red';
          
          return AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              final pulse = isRed ? _pulseAnimation.value : 0.0;
              
              return GestureDetector(
                onTap: () {
                  ref.read(patientProvider.notifier).loadPatient(patient);
                  Navigator.push(
                    context,
                    MaterialPageRoute<void>(builder: (context) => const HomeScreen()),
                  );
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: isRed 
                          ? color.withValues(alpha: 0.15 + (pulse * 0.15))
                          : Colors.black.withValues(alpha: 0.04),
                      blurRadius: isRed ? 24 + (pulse * 12) : 12,
                      spreadRadius: isRed ? (pulse * 6) : 0,
                      offset: const Offset(0, 8),
                    )
                  ],
                  border: Border.all(
                    color: isRed 
                        ? color.withValues(alpha: 0.4 + (pulse * 0.4)) 
                        : Colors.grey.withValues(alpha: 0.1),
                    width: isRed ? 2 : 1,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column: Pictures & Mannequin
                        SizedBox(
                          width: 160,
                          child: Column(
                            children: [
                              // Avatar / ID
                              Container(
                                height: 80,
                                width: 80,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: color.withValues(alpha: 0.1),
                                  border: Border.all(color: color.withValues(alpha: 0.3), width: 2),
                                ),
                                child: Icon(Icons.person_outline, size: 40, color: color),
                              ),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF3F4F6),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text('ID: ${patient.id}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0)),
                              ),
                              const SizedBox(height: 24),
                              
                              // Native Body Viewer Mannequin
                              Container(
                                height: 260,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF9FAFB),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(16),
                                  child: NativeBodyViewer(
                                    staticPatient: patient.copyWith(viewMode: _currentViewMode),
                                    interactive: false,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 32),
                        
                        // Right Column: Comprehensive Data
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(patient.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 32, color: Color(0xFF111827))),
                                      const SizedBox(height: 4),
                                      Text('${patient.gender}, ${patient.age} years old', style: const TextStyle(color: Color(0xFF6B7280), fontSize: 16, fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                  if (patient.activeTimerSeconds != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                      decoration: BoxDecoration(
                                        gradient: isRed 
                                          ? LinearGradient(colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)])
                                          : null,
                                        color: isRed ? null : color.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(16),
                                        border: isRed ? Border.all(color: color.withValues(alpha: 0.3)) : null,
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(Icons.timer_outlined, color: color, size: 24),
                                          const SizedBox(width: 12),
                                          Text(
                                            _formatTimer(patient.activeTimerSeconds),
                                            style: TextStyle(
                                              color: color,
                                              fontWeight: FontWeight.w900,
                                              fontSize: 28,
                                              fontFeatures: const [FontFeature.tabularFigures()],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 24),
                              
                              // Triage Score Bar
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: color,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text('MEWS SCORE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                                  ),
                                  const SizedBox(width: 12),
                                  Text('${patient.triageScore}', style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 24)),
                                  const Spacer(),
                                  Row(
                                    children: [
                                      const Icon(Icons.height, size: 16, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Text(patient.vitals.height.isEmpty ? 'N/A' : patient.vitals.height, style: const TextStyle(color: Color(0xFF4B5563), fontWeight: FontWeight.w600)),
                                      const SizedBox(width: 24),
                                      const Icon(Icons.scale, size: 16, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Text(patient.vitals.weight.isEmpty ? 'N/A' : patient.vitals.weight, style: const TextStyle(color: Color(0xFF4B5563), fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              
                              // Conditions
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF9FAFB),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.medical_information_outlined, size: 20, color: Color(0xFF6B7280)),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('PRE-EXISTING CONDITIONS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF9CA3AF), letterSpacing: 1.0)),
                                          const SizedBox(height: 4),
                                          Text(
                                            patient.preexistingConditions.isEmpty ? 'None documented' : patient.preexistingConditions.join(', '), 
                                            style: const TextStyle(color: Color(0xFF1F2937), fontSize: 15, fontWeight: FontWeight.w500)
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 24),
                              
                              // Vitals Grid
                              Wrap(
                                spacing: 16,
                                runSpacing: 16,
                                children: [
                                  _buildVitalBox('HR', patient.vitals.hr, Icons.favorite_border, color),
                                  _buildVitalBox('SpO2', patient.vitals.spO2, Icons.air, color),
                                  _buildVitalBox('BP', patient.vitals.bp, Icons.monitor_heart_outlined, color),
                                  _buildVitalBox('TEMP', patient.vitals.temp, Icons.thermostat_outlined, color),
                                ],
                              ),
                              
                              // PubMed Protocols
                              if (isRed && patient.recommendedGuidelines.isNotEmpty) ...[
                                const SizedBox(height: 32),
                                Container(
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    boxShadow: [
                                      BoxShadow(
                                        color: color.withValues(alpha: 0.2 + (pulse * 0.1)),
                                        blurRadius: 16,
                                        spreadRadius: pulse * 4,
                                        offset: const Offset(0, 4),
                                      )
                                    ],
                                  ),
                                  child: ElevatedButton(
                                    onPressed: () {
                                      showDialog<void>(
                                        context: context,
                                        builder: (ctx) => AlertDialog(
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                          title: Row(
                                            children: [
                                              Icon(Icons.library_books, color: color),
                                              const SizedBox(width: 12),
                                              const Text('Emergency Protocols', style: TextStyle(fontWeight: FontWeight.bold)),
                                            ],
                                          ),
                                          content: SizedBox(
                                            width: 500,
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              children: patient.recommendedGuidelines.map((g) {
                                                return Container(
                                                  margin: const EdgeInsets.only(bottom: 8),
                                                  decoration: BoxDecoration(
                                                    color: Colors.grey.shade50,
                                                    borderRadius: BorderRadius.circular(12),
                                                    border: Border.all(color: Colors.grey.shade200),
                                                  ),
                                                  child: ListTile(
                                                    leading: Icon(Icons.article_outlined, color: color),
                                                    title: Text(g['title'] ?? 'Guideline', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                                    subtitle: Text('PMID: ${g['id']}', style: const TextStyle(color: Colors.grey)),
                                                  ),
                                                );
                                              }).toList(),
                                            ),
                                          ),
                                          actions: [
                                            TextButton(
                                              onPressed: () => Navigator.pop(ctx),
                                              child: const Text('CLOSE', style: TextStyle(fontWeight: FontWeight.bold)),
                                            )
                                          ],
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: color,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      padding: const EdgeInsets.symmetric(vertical: 20),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.auto_awesome, size: 20),
                                        const SizedBox(width: 12),
                                        Text('VIEW ${patient.recommendedGuidelines.length} NIH PROTOCOLS', 
                                          style: const TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900, fontSize: 14)
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                ),
              );
            },
          );
        },
      ),
          ),
        ],
      ),
    );
  }
}
