import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import 'body_viewer_widget.dart';
import 'medical_summary_widget.dart';
import 'patient_history_timeline_widget.dart';
import 'patient_scans_widget.dart';

import 'cgm_time_in_range_widget.dart';

class MedicalChartWidget extends ConsumerStatefulWidget {
  const MedicalChartWidget({super.key});

  @override
  ConsumerState<MedicalChartWidget> createState() => _MedicalChartWidgetState();
}

class _MedicalChartWidgetState extends ConsumerState<MedicalChartWidget> {
  // Store which sections are expanded. 
  // By default, let's expand the 3D Anatomical Map.
  final Map<String, bool> _expandedSections = {
    'map': true,
    'cgm': true,
    'summary': false,
    'history': false,
    'scans': false,
  };

  void _toggleSection(String key) {
    setState(() {
      _expandedSections[key] = !(_expandedSections[key] ?? false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientProvider);
    final scans = state.scans;

    return Column(
          children: [
            _buildAccordionSection(
              key: 'map',
              title: '3D ANATOMICAL MAP',
              icon: Icons.accessibility_new,
              child: const SizedBox(
                height: 400, // Fixed height for 3D viewer
                child: BodyViewerWidget(),
              ),
            ),
            const SizedBox(height: 16),
            _buildAccordionSection(
              key: 'cgm',
              title: 'CONTINUOUS GLUCOSE (CGM)',
              icon: Icons.monitor_weight_outlined,
              child: const CgmTimeInRangeWidget(),
            ),
            const SizedBox(height: 16),
            _buildAccordionSection(
              key: 'summary',
              title: 'MEDICAL SUMMARY',
              icon: Icons.description_outlined,
              child: const MedicalSummaryWidget(),
            ),
            const SizedBox(height: 16),
            _buildAccordionSection(
              key: 'history',
              title: 'RETROSPECTIVE HISTORY',
              icon: Icons.history,
              child: PatientHistoryTimelineWidget(history: const []), // Use state history
            ),
            const SizedBox(height: 16),
            _buildAccordionSection(
              key: 'scans',
              title: 'DIAGNOSTIC SCANS',
              icon: Icons.biotech,
              child: PatientScansWidget(scans: scans),
            ),
          ],
        );
  }

  Widget _buildAccordionSection({
    required String key,
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    final isExpanded = _expandedSections[key] ?? false;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => _toggleSection(key),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  Icon(icon, size: 20, color: const Color(0xFF1C1C1C)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                        color: Color(0xFF1C1C1C),
                      ),
                    ),
                  ),
                  Icon(
                    isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox(width: double.infinity, height: 0),
            secondChild: Container(
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.grey.shade100)),
              ),
              child: child,
            ),
            crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 300),
            sizeCurve: Curves.easeInOut,
          ),
        ],
      ),
    );
  }
}
