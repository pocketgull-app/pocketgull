import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../providers/bionic_reading_provider.dart';
import 'body_viewer_widget.dart';
import 'medical_summary_widget.dart';
import 'patient_history_timeline_widget.dart';
import 'patient_scans_widget.dart';
import 'cgm_time_in_range_widget.dart';
import 'orp_foveal_reticle_widget.dart';
import 'anti_confirmation_bias_widget.dart';

class MedicalChartWidget extends ConsumerStatefulWidget {
  const MedicalChartWidget({super.key});

  @override
  ConsumerState<MedicalChartWidget> createState() => _MedicalChartWidgetState();
}

class _MedicalChartWidgetState extends ConsumerState<MedicalChartWidget> {
  // Store which sections are expanded. 
  // By default, let's expand the 3D Anatomical Map and Diagnostic Scans.
  final Map<String, bool> _expandedSections = {
    'map': true,
    'cgm': true,
    'summary': false,
    'history': false,
    'scans': true,
    'epistemic': true,
  };

  void _toggleSection(String key) {
    setState(() {
      _expandedSections[key] = !(_expandedSections[key] ?? false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientProvider);
    final bionicState = ref.watch(bionicReadingProvider);
    final bionicNotifier = ref.read(bionicReadingProvider.notifier);
    final scans = state.scans;

    return Column(
      children: [
        // Bionic Reading & Rapid Visual Telemetry Control Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF09090B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF27272A)),
            boxShadow: const [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 6,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.remove_red_eye_outlined, size: 16, color: Color(0xFF38BDF8)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        bionicState.isBionicEnabled ? 'BIONIC MODE' : 'BIONIC OFF',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: bionicState.isBionicEnabled ? const Color(0xFF38BDF8) : Colors.grey,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Switch(
                    value: bionicState.isBionicEnabled,
                    onChanged: (_) => bionicNotifier.toggleBionicMode(),
                    activeThumbColor: const Color(0xFF38BDF8),
                  ),
                  const SizedBox(width: 6),
                  ElevatedButton.icon(
                    onPressed: () {
                      final summaryText = 'Patient ${state.name}. '
                          'Chief Goal: ${state.patientGoals}. '
                          'Vitals: BP ${state.vitals.bp}, Heart Rate ${state.vitals.hr} bpm. '
                          'Active Telemetry: Lumbar spine MRI demonstrates L4-L5 posterior disc protrusion. '
                          'Clinical Recommendation: Conservative physical genomics biomechanics, gentle core neuromuscular stabilization, and Health Connect circadian cadence synchronization.';
                      bionicNotifier.loadText(summaryText);
                      showDialog(
                        context: context,
                        builder: (context) => Dialog(
                          backgroundColor: Colors.transparent,
                          insetPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 24),
                          child: const SingleChildScrollView(child: OrpFovealReticleWidget()),
                        ),
                      );
                    },
                    icon: const Icon(Icons.bolt, size: 14),
                    label: const Text('RSVP 600 WPM'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      textStyle: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

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
          key: 'scans',
          title: 'DIAGNOSTIC SCANS & TELE-RADIOLOGY',
          icon: Icons.biotech,
          child: PatientScansWidget(scans: scans),
        ),
        const SizedBox(height: 16),
        _buildAccordionSection(
          key: 'epistemic',
          title: 'ANTI-CONFIRMATION BIAS & FALSIFICATION',
          icon: Icons.shield_outlined,
          child: const AntiConfirmationBiasWidget(),
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
                        letterSpacing: 1.5,
                        color: Color(0xFF1C1C1C),
                      ),
                    ),
                  ),
                  Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                    size: 20,
                    color: Colors.grey.shade600,
                  ),
                ],
              ),
            ),
          ),
          if (isExpanded) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: child,
            ),
          ],
        ],
      ),
    );
  }
}
