import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/patient_provider.dart';
import '../../models/patient_types.dart';
import '../camera_pulse_widget.dart';

/// Lean Vitals & Symptoms Tab: Clean, optotypic biometric dials and anatomical symptom logging.
class LeanVitalsTab extends ConsumerStatefulWidget {
  const LeanVitalsTab({super.key});

  @override
  ConsumerState<LeanVitalsTab> createState() => _LeanVitalsTabState();
}

class _LeanVitalsTabState extends ConsumerState<LeanVitalsTab> {
  String _selectedBodyRegion = 'head';
  final TextEditingController _symptomTextController = TextEditingController();
  int _painLevel = 2; // 0 to 10
  bool _showCameraPulseScanner = false;

  final Map<String, String> _bodyRegions = const {
    'head': 'Head & Neck',
    'chest': 'Chest & Lungs',
    'abdomen': 'Abdomen & Gut',
    'upper_back': 'Spine & Back',
    'r_shin': 'Knees & Joints',
    'r_arm': 'Arms & Shoulders',
  };

  @override
  void dispose() {
    _symptomTextController.dispose();
    super.dispose();
  }

  void _logSymptom() {
    final text = _symptomTextController.text.trim();
    if (text.isEmpty) return;

    final noteId = 'symptom_${DateTime.now().millisecondsSinceEpoch}';
    final issue = BodyPartIssue(
      id: noteId,
      noteId: noteId,
      name: _bodyRegions[_selectedBodyRegion] ?? 'General Symptom',
      painLevel: _painLevel,
      description: text,
      symptoms: [text],
      date: DateTime.now().toIso8601String().substring(0, 10),
    );

    ref.read(patientProvider.notifier).addIssue(_selectedBodyRegion, issue);
    _symptomTextController.clear();
    FocusScope.of(context).unfocus();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Logged symptom for ${_bodyRegions[_selectedBodyRegion]}'),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF047857),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientProvider);
    final vitals = state.vitals;

    final hr = vitals.hr.isNotEmpty ? vitals.hr : '72';
    final bp = vitals.bp.isNotEmpty ? vitals.bp : '118/76';
    final spO2 = vitals.spO2.isNotEmpty ? vitals.spO2 : '98';
    final temp = vitals.temp.isNotEmpty ? vitals.temp : '98.4';

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      children: [
        // 1. Biometric Telemetry Dials
        _buildSectionHeader('BIOMETRIC TELEMETRY (LIVE)', Icons.monitor_heart_outlined),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildBiometricCard(
                title: 'HEART RATE',
                value: hr,
                unit: 'bpm',
                status: 'Normal Rest',
                statusColor: const Color(0xFF047857),
                icon: Icons.favorite,
                iconColor: const Color(0xFFE11D48),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildBiometricCard(
                title: 'BLOOD PRESSURE',
                value: bp,
                unit: 'mmHg',
                status: 'Optimal Tier',
                statusColor: const Color(0xFF047857),
                icon: Icons.speed,
                iconColor: const Color(0xFF2563EB),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildBiometricCard(
                title: 'BLOOD OXYGEN',
                value: '$spO2%',
                unit: 'SpO2',
                status: 'Ambient Norm',
                statusColor: const Color(0xFF047857),
                icon: Icons.air,
                iconColor: const Color(0xFF0284C7),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildBiometricCard(
                title: 'BODY TEMP',
                value: '$temp°',
                unit: 'Fahrenheit',
                status: 'Afebrile',
                statusColor: const Color(0xFF047857),
                icon: Icons.thermostat,
                iconColor: const Color(0xFFD97706),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // 2. Camera Pulse PPG Scanner Trigger
        _buildCameraPulseActionCard(),
        if (_showCameraPulseScanner) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'OPTICAL PPG SENSOR ACTIVE',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.greenAccent),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white, size: 18),
                      onPressed: () => setState(() => _showCameraPulseScanner = false),
                    ),
                  ],
                ),
                const CameraPulseWidget(),
              ],
            ),
          ),
        ],
        const SizedBox(height: 24),

        // 3. Quick Anatomical Symptom Logger
        _buildSectionHeader('LOG SYMPTOM BY BODY REGION', Icons.accessibility_new_outlined),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Region',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF374151)),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _bodyRegions.entries.map((entry) {
                  final isSelected = _selectedBodyRegion == entry.key;
                  return ChoiceChip(
                    label: Text(
                      entry.value,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? Colors.white : const Color(0xFF374151),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: const Color(0xFF047857),
                    backgroundColor: const Color(0xFFF3F4F6),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedBodyRegion = entry.key);
                      }
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Discomfort / Pain (0–10):',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF374151)),
                  ),
                  Text(
                    '$_painLevel / 10',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _painLevel > 5 ? const Color(0xFFDC2626) : const Color(0xFF047857),
                    ),
                  ),
                ],
              ),
              Slider(
                value: _painLevel.toDouble(),
                min: 0,
                max: 10,
                divisions: 10,
                activeColor: _painLevel > 5 ? const Color(0xFFDC2626) : const Color(0xFF047857),
                inactiveColor: const Color(0xFFE5E7EB),
                onChanged: (val) => setState(() => _painLevel = val.toInt()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _symptomTextController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'Describe sensation, trigger, or duration...',
                  hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                  contentPadding: const EdgeInsets.all(12),
                  filled: true,
                  fillColor: const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton.icon(
                  onPressed: _logSymptom,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('LOG SYMPTOM NOTE'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF047857),
                    foregroundColor: Colors.white,
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // 4. Active Logged Issues
        if (state.issues.isNotEmpty) ...[
          _buildSectionHeader('CURRENTLY LOGGED REGIONS', Icons.format_list_bulleted),
          const SizedBox(height: 8),
          ...state.issues.entries.expand((entry) => entry.value).map((issue) {
            return _buildLoggedIssueCard(issue);
          }),
        ],
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildBiometricCard({
    required String title,
    required String value,
    required String unit,
    required String status,
    required Color statusColor,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [
          BoxShadow(color: Color(0x06000000), blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B7280), letterSpacing: 0.8),
              ),
              Icon(icon, size: 16, color: iconColor),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
              const SizedBox(width: 4),
              Text(
                unit,
                style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF), fontWeight: FontWeight.w500),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
              Text(
                status,
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: statusColor),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCameraPulseActionCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Color(0xFF047857),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.camera_alt, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Optical PPG Pulse Sensor',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                ),
                Text(
                  'Measure heart rate and HRV via camera index finger contact',
                  style: TextStyle(fontSize: 11, color: Color(0xFF047857)),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => setState(() => _showCameraPulseScanner = !_showCameraPulseScanner),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF047857),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              elevation: 0,
            ),
            child: Text(_showCameraPulseScanner ? 'CLOSE' : 'SCAN'),
          ),
        ],
      ),
    );
  }

  Widget _buildLoggedIssueCard(BodyPartIssue issue) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: issue.painLevel > 5 ? const Color(0xFFFEE2E2) : const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Center(
              child: Text(
                '${issue.painLevel}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: issue.painLevel > 5 ? const Color(0xFFDC2626) : const Color(0xFF4B5563),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  issue.name,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF111827)),
                ),
                Text(
                  issue.description,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF047857)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
            color: Color(0xFF374151),
          ),
        ),
      ],
    );
  }
}
