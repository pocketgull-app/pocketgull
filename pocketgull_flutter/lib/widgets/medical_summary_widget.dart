import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../providers/risk_score_provider.dart';
import '../services/clinical_risk_calculator.dart';
import '../services/fhir_service.dart';

class MedicalSummaryWidget extends ConsumerStatefulWidget {
  const MedicalSummaryWidget({super.key});

  @override
  ConsumerState<MedicalSummaryWidget> createState() => _MedicalSummaryWidgetState();
}

class _MedicalSummaryWidgetState extends ConsumerState<MedicalSummaryWidget> {
  final TextEditingController _orcidController = TextEditingController();

  @override
  void dispose() {
    _orcidController.dispose();
    super.dispose();
  }

  void _showFhirBundleDialog(BuildContext context) {
    final patientState = ref.read(patientProvider);
    final fhirService = ref.read(fhirServiceProvider);
    final fhirJson = fhirService.exportPatientToFhirJson(patientState);

    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.code_rounded, color: Color(0xFF416B1F)),
              SizedBox(width: 8),
              Text('FHIR R4 BUNDLE EXPORT', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            ],
          ),
          content: SizedBox(
            width: 500,
            height: 400,
            child: SingleChildScrollView(
              child: SelectableText(
                fhirJson,
                style: const TextStyle(fontFamily: 'PocketGullMono', fontSize: 11, color: Color(0xFF1E293B)),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                Clipboard.setData(ClipboardData(text: fhirJson));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('FHIR R4 Bundle copied to clipboard!')),
                );
                Navigator.pop(context);
              },
              icon: const Icon(Icons.copy, size: 14),
              label: const Text('Copy FHIR JSON'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF416B1F),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      header: true,
      label: 'Medical Summary & Patient Strategy Overview',
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context),
            const SizedBox(height: 24),
            _buildSectionTitle(context, 'Current Visit / Chief Complaint'),
            _buildChiefComplaint(context),
            const SizedBox(height: 24),
            _buildSectionTitle(context, 'Biometric Telemetry'),
            _buildVitalsGrid(context),
            _buildClinicalRiskCard(context, ref),
            const SizedBox(height: 24),
            _buildSectionTitle(context, 'Active Strategy Overview'),
            _buildActiveCarePlan(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final today = DateTime.now();
    final patientState = ref.watch(patientProvider);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                patientState.name,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w300,
                  color: Color(0xFF1C1C1C),
                  letterSpacing: -0.5,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                '${today.year}.${today.month.toString().padLeft(2, '0')}.${today.day.toString().padLeft(2, '0')}',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                  letterSpacing: 2.0,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Row(
          children: [
            OutlinedButton.icon(
              onPressed: () => _showFhirBundleDialog(context),
              icon: const Icon(Icons.share, size: 14, color: Color(0xFF416B1F)),
              label: const Text('FHIR R4 Export', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF416B1F))),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF416B1F)),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.archive, size: 16),
              label: const Text('Finalize & Archive'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1C1C1C),
                foregroundColor: Colors.white,
                textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildChiefComplaint(BuildContext context) {
    final patientState = ref.watch(patientProvider);
    final issues = patientState.issues.values.expand((element) => element).toList();
    final primaryIssue = issues.isNotEmpty ? issues.first.name : 'Routine Checkup';
    final notes = issues.map((i) => i.description).join('\n');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            primaryIssue,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1C1C1C)),
          ),
          const SizedBox(height: 8),
          Text(
            notes.isNotEmpty ? notes : 'No active notes specified for current visit.',
            style: const TextStyle(fontSize: 13, color: Colors.black87, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalsGrid(BuildContext context) {
    final patientState = ref.watch(patientProvider);
    final vitals = patientState.vitals;

    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 2.2,
      children: [
        _buildVitalCard('Blood Pressure', vitals.bp.isEmpty ? '--' : vitals.bp, 'mmHg'),
        _buildVitalCard('Heart Rate', vitals.hr.isEmpty ? '--' : vitals.hr, 'bpm'),
        _buildVitalCard('SpO2', vitals.spO2.isEmpty ? '--' : vitals.spO2, '%'),
        _buildVitalCard('Temperature', vitals.temp.isEmpty ? '--' : vitals.temp, 'F'),
        _buildVitalCard('Weight', vitals.weight.isEmpty ? '--' : vitals.weight, 'lbs'),
        _buildVitalCard('Height', vitals.height.isEmpty ? '--' : vitals.height, 'in'),
      ],
    );
  }

  Widget _buildVitalCard(String label, String value, String unit) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1C1C1C))),
              const SizedBox(width: 4),
              Text(unit, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildClinicalRiskCard(BuildContext context, WidgetRef ref) {
    final risk = ref.watch(riskScoreProvider);
    final categoryColor = (risk.riskLevel == RiskLevel.critical || risk.riskLevel == RiskLevel.high)
        ? const Color(0xFFEF4444)
        : (risk.riskLevel == RiskLevel.moderate ? const Color(0xFFF59E0B) : const Color(0xFF10B981));

    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: categoryColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: categoryColor.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.shield_outlined, color: categoryColor, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CLINICAL RISK TIER: ${risk.riskLevel.name.toUpperCase()}',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: categoryColor, letterSpacing: 1.0),
                ),
                const SizedBox(height: 2),
                Text(
                  'Risk Score: ${(risk.score * 100).toStringAsFixed(1)}% — ${risk.note}',
                  style: const TextStyle(fontSize: 11, color: Colors.black87),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveCarePlan(BuildContext context) {
    final patientState = ref.watch(patientProvider);
    final dynamic rawGoalsObj = patientState.patientGoals;

    final String rawGoalsStr = rawGoalsObj is List
        ? rawGoalsObj.join('\n')
        : (rawGoalsObj?.toString() ?? '');

    final List<String> goals = rawGoalsStr.trim().isNotEmpty
        ? rawGoalsStr.split(RegExp(r'\n|;')).map((e) => e.trim()).where((e) => e.isNotEmpty).toList()
        : [];

    if (goals.isEmpty) {
      return const Text('No active care plan goals established for this patient.', style: TextStyle(fontSize: 12, color: Colors.grey));
    }

    return Column(
      children: goals.map((goal) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Row(
            children: [
              const Icon(Icons.check_circle_outline, size: 16, color: Color(0xFF416B1F)),
              const SizedBox(width: 8),
              Expanded(child: Text(goal, style: const TextStyle(fontSize: 12, color: Colors.black87))),
            ],
          ),
        );
      }).toList(),
    );
  }
}
