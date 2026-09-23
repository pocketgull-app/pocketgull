import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/patient_provider.dart';

/// Lean Care Plan Tab: Clear, high-utility view of the patient's active health plan.
class LeanCarePlanTab extends ConsumerStatefulWidget {
  const LeanCarePlanTab({super.key});

  @override
  ConsumerState<LeanCarePlanTab> createState() => _LeanCarePlanTabState();
}

class _LeanCarePlanTabState extends ConsumerState<LeanCarePlanTab> {
  // Local state for daily checklist items (in real-world backed by Hive/Riverpod)
  final List<Map<String, dynamic>> _dailyActions = [
    {
      'title': 'Morning Parasympathetic Box Breathing',
      'detail': '4-4-4-4 cadence (5 minutes) before morning cortisol peak',
      'done': true,
      'category': 'Vagal Tone',
    },
    {
      'title': 'Hydration with Electrolyte Matrix',
      'detail': '500 mL water with 250 mg sodium & 100 mg potassium',
      'done': true,
      'category': 'Metabolic',
    },
    {
      'title': '20-Minute Zone 2 Brisk Walk',
      'detail': 'Post-prandial glucose blunting; target HR 105–115 bpm',
      'done': false,
      'category': 'Movement',
    },
    {
      'title': 'Evening Magnesium Glycinate',
      'detail': '200 mg with dinner for restorative delta-wave sleep',
      'done': false,
      'category': 'Supplement',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientProvider);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      children: [
        // 1. Patient Profile Header Card
        _buildPatientBanner(state),
        const SizedBox(height: 16),

        // 2. 3-Act Trajectory (Pocket-Gull Standard)
        _buildThreeActTrajectoryCard(state),
        const SizedBox(height: 20),

        // 3. Daily Action Checklist
        _buildSectionHeader('TODAY\'S ACTION PLAN', Icons.check_circle_outline),
        const SizedBox(height: 8),
        ..._dailyActions.asMap().entries.map((entry) {
          final idx = entry.key;
          final item = entry.value;
          return _buildChecklistCard(item, idx);
        }),
        const SizedBox(height: 20),

        // 4. Active Medications & Supplements
        _buildSectionHeader('ACTIVE MEDICATIONS & SUPPLEMENTS', Icons.medication_outlined),
        const SizedBox(height: 8),
        _buildMedicationCard(
          name: 'Metformin HCl',
          dosage: '500 mg',
          instructions: 'Oral • Twice daily with meals',
          purpose: 'Glycemic sensitivity & AMPK activation',
          verified: true,
        ),
        const SizedBox(height: 8),
        _buildMedicationCard(
          name: 'Vitamin D3 (Cholecalciferol)',
          dosage: '2000 IU',
          instructions: 'Oral • Daily morning with fat-soluble meal',
          purpose: 'Immunomodulatory baseline support',
          verified: true,
        ),
        const SizedBox(height: 8),
        _buildMedicationCard(
          name: 'Omega-3 Fish Oil (EPA/DHA)',
          dosage: '1000 mg (600 mg EPA / 400 mg DHA)',
          instructions: 'Oral • Daily with food',
          purpose: 'Cardiovascular endothelial stabilization',
          verified: true,
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildPatientBanner(dynamic state) {
    final patientName = (state.name != null && state.name.isNotEmpty) ? state.name : 'Active Patient';
    final goals = (state.patientGoals != null && state.patientGoals.isNotEmpty)
        ? state.patientGoals
        : 'Optimize metabolic resilience, reduce resting pulse, and sustain restorative sleep.';

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B), // Obsidian slate
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: const BoxDecoration(
                  color: Color(0xFF047857), // Clinical deep emerald
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      patientName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'CARE PLAN STRATEGY • ACTIVE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF34D399), // Emerald accent
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'FHIR R4',
                  style: TextStyle(fontSize: 10, color: Color(0xFFA1A1AA), fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFF27272A), height: 1),
          const SizedBox(height: 12),
          Text(
            'Primary Focus: $goals',
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFFD4D4D8),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThreeActTrajectoryCard(dynamic state) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [
          BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'CLINICAL TRAJECTORY',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: Color(0xFF6B7280),
            ),
          ),
          const SizedBox(height: 14),
          _buildTrajectoryAct(
            actNumber: '1',
            title: 'Where You\'ve Been',
            subtitle: 'Baseline metabolic stress, post-prandial glucose swings, and intermittent sleep disruption.',
            icon: Icons.history,
            color: const Color(0xFF6B7280),
          ),
          const SizedBox(height: 12),
          _buildTrajectoryAct(
            actNumber: '2',
            title: 'Where You Stand Today',
            subtitle: 'Vitals stable. Resting HR: 72 bpm, BP: 118/76 mmHg. HRV rebounding (+14ms).',
            icon: Icons.my_location,
            color: const Color(0xFF047857),
          ),
          const SizedBox(height: 12),
          _buildTrajectoryAct(
            actNumber: '3',
            title: 'Where You\'re Going (30-Day)',
            subtitle: 'HbA1c target < 5.4%, fasting glucose < 92 mg/dL, sustained morning readiness score > 85.',
            icon: Icons.flag_outlined,
            color: const Color(0xFF2563EB),
          ),
        ],
      ),
    );
  }

  Widget _buildTrajectoryAct({
    required String actNumber,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(icon, size: 16, color: color),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF4B5563),
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChecklistCard(Map<String, dynamic> item, int idx) {
    final bool isDone = item['done'] as bool;
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDone ? const Color(0xFFA7F3D0) : const Color(0xFFE5E7EB),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: CheckboxListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          activeColor: const Color(0xFF047857),
          value: isDone,
          onChanged: (val) {
            setState(() {
              _dailyActions[idx]['done'] = val ?? false;
            });
          },
          title: Text(
            item['title'] as String,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDone ? const Color(0xFF9CA3AF) : const Color(0xFF1F2937),
              decoration: isDone ? TextDecoration.lineThrough : null,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 2.0),
            child: Text(
              item['detail'] as String,
              style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMedicationCard({
    required String name,
    required String dosage,
    required String instructions,
    required String purpose,
    required bool verified,
  }) {
    return Container(
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.medication, size: 20, color: Color(0xFF374151)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '$name $dosage',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827),
                        ),
                      ),
                    ),
                    if (verified)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'ISMP SAFE',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  instructions,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF4B5563)),
                ),
                const SizedBox(height: 2),
                Text(
                  purpose,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
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
