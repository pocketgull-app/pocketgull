// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import 'package:flutter/material.dart';
import '../../../../core/services/backpack_dispensary_service.dart';

class BackpackDispensaryScreen extends StatefulWidget {
  const BackpackDispensaryScreen({super.key});

  @override
  State<BackpackDispensaryScreen> createState() => _BackpackDispensaryScreenState();
}

class _BackpackDispensaryScreenState extends State<BackpackDispensaryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedProtocolKey = 'severe_malaria';
  
  // MUAC Calculator State
  double _muacMm = 110.0;
  bool _edemaPresent = false;
  bool _passedAppetiteTest = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final cardBg = isDark ? const Color(0xFF27272A) : Colors.white;
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF18181B);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Column(
          children: const [
            Text('BACKPACK DISPENSARY', style: TextStyle(letterSpacing: 2, fontSize: 13, fontWeight: FontWeight.w900)),
            Text('100% Offline WHO EML & MSF Field Formulary', style: TextStyle(fontSize: 10, color: Color(0xFF71717A))),
          ],
        ),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF059669),
          labelColor: const Color(0xFF059669),
          unselectedLabelColor: subColor,
          tabs: const [
            Tab(icon: Icon(Icons.medication_liquid_outlined), text: 'WHO EML Formularies'),
            Tab(icon: Icon(Icons.child_care), text: 'MUAC Triage Tool'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFormularyTab(isDark, cardBg, textColor, subColor),
          _buildMuacTab(isDark, cardBg, textColor, subColor),
        ],
      ),
    );
  }

  Widget _buildFormularyTab(bool isDark, Color cardBg, Color textColor, Color subColor) {
    final protocol = BackpackDispensaryService.protocols[_selectedProtocolKey]!;

    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        // Protocol Selector Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: BackpackDispensaryService.protocols.keys.map((key) {
              final isSelected = key == _selectedProtocolKey;
              final p = BackpackDispensaryService.protocols[key]!;
              final shortTitle = p.condition.split('(').first.trim();
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: FilterChip(
                  label: Text(shortTitle, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                  selected: isSelected,
                  selectedColor: const Color(0xFF059669).withValues(alpha: 0.2),
                  checkmarkColor: const Color(0xFF059669),
                  onSelected: (val) {
                    if (val) setState(() => _selectedProtocolKey = key);
                  },
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 16),

        // Protocol Card
        Container(
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.emergency_outlined, color: Color(0xFF059669), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(protocol.condition, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: textColor)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF18181B) : const Color(0xFFF4F4F5),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('WHO EML § ${protocol.whoEmlSection}', style: const TextStyle(fontSize: 10, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // First Line Treatment Box
              _buildDetailSection(
                title: 'FIRST-LINE REGIMEN (EML ESSENTIAL)',
                content: protocol.firstLine,
                icon: Icons.check_circle_outline,
                accentColor: const Color(0xFF059669),
                isDark: isDark,
              ),
              const SizedBox(height: 14),

              // Bedside Test or Antidote if applicable
              if (protocol.bedsideTest != null) ...[
                _buildDetailSection(
                  title: 'BEDSIDE TEST (ZERO LAB REQUIRED)',
                  content: protocol.bedsideTest!,
                  icon: Icons.biotech_outlined,
                  accentColor: const Color(0xFFD97706),
                  isDark: isDark,
                ),
                const SizedBox(height: 14),
              ],

              if (protocol.antidoteRequired != null) ...[
                _buildDetailSection(
                  title: 'MANDATORY RESCUE ANTIDOTE AT BEDSIDE',
                  content: protocol.antidoteRequired!,
                  icon: Icons.warning_amber_rounded,
                  accentColor: const Color(0xFFDC2626),
                  isDark: isDark,
                ),
                const SizedBox(height: 14),
              ],

              // Thermostability
              _buildDetailSection(
                title: 'AUSTERE STORAGE & THERMOSTABILITY',
                content: protocol.thermostability,
                icon: Icons.thermostat_outlined,
                accentColor: const Color(0xFF0284C7),
                isDark: isDark,
              ),
              const SizedBox(height: 14),

              // Harmful practices warning
              if (protocol.harmfulPracticesToReject.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.block, color: Color(0xFFDC2626), size: 16),
                          SizedBox(width: 8),
                          Text('HARMFUL PRACTICES TO STRICTLY REJECT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1, color: Color(0xFFDC2626))),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ...protocol.harmfulPracticesToReject.map(
                        (h) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2.0),
                          child: Text('• $h', style: const TextStyle(fontSize: 11, color: Color(0xFFDC2626))),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Rationale
              Text(
                protocol.clinicalRationale,
                style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: subColor),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMuacTab(bool isDark, Color cardBg, Color textColor, Color subColor) {
    final result = BackpackDispensaryService.calculatePediatricMuac(
      muacMm: _muacMm,
      edemaPresent: _edemaPresent,
      passedAppetiteTest: _passedAppetiteTest,
    );

    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        Container(
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('PEDIATRIC MUAC TRIAGE EVALUATOR', style: TextStyle(fontSize: 13, letterSpacing: 1.5, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              Text('MSF & WHO Community Malnutrition Management (CMAM)', style: TextStyle(fontSize: 11, color: subColor)),
              const SizedBox(height: 20),

              // MUAC Slider
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Mid-Upper Arm Circumference (MUAC):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  Text('${_muacMm.toStringAsFixed(1)} mm', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _muacMm < 115 ? Colors.red : (_muacMm < 125 ? Colors.amber : Colors.green))),
                ],
              ),
              Slider(
                value: _muacMm,
                min: 80.0,
                max: 160.0,
                divisions: 80,
                activeColor: _muacMm < 115 ? Colors.red : (_muacMm < 125 ? Colors.amber : Colors.green),
                onChanged: (val) => setState(() => _muacMm = val),
              ),
              const SizedBox(height: 12),

              // Toggles
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Bilateral Pitting Edema (++ / +++)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                subtitle: Text('Presence of fluid retention in feet/ankles automatically indicates SAM', style: TextStyle(fontSize: 10, color: subColor)),
                value: _edemaPresent,
                activeColor: Colors.red,
                onChanged: (val) => setState(() => _edemaPresent = val),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Passed Appetite Test with RUTF', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                subtitle: Text('Child eats at least 1/4 sachet of Plumpy\'Nut within 30 min', style: TextStyle(fontSize: 10, color: subColor)),
                value: _passedAppetiteTest,
                activeColor: const Color(0xFF059669),
                onChanged: (val) => setState(() => _passedAppetiteTest = val),
              ),
              const SizedBox(height: 20),

              // Result Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: (result.isEmergency ? Colors.red : (_muacMm < 125 ? Colors.amber : Colors.green)).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: result.isEmergency ? Colors.red : (_muacMm < 125 ? Colors.amber : Colors.green)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(result.classification.toUpperCase(), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: result.isEmergency ? Colors.red : (_muacMm < 125 ? Colors.amber[800] : Colors.green[800]))),
                    const SizedBox(height: 4),
                    Text('Triage Destination: ${result.triageLocation}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('• Initial Nutrition: ${result.initialNutrition}', style: const TextStyle(fontSize: 11)),
                    if (result.antibiotic != null)
                      Text('• Routine Antibiotic: ${result.antibiotic}', style: const TextStyle(fontSize: 11)),
                    const SizedBox(height: 8),
                    Text(result.rationale, style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic, color: subColor)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailSection({
    required String title,
    required String content,
    required IconData icon,
    required Color accentColor,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: accentColor),
              const SizedBox(width: 6),
              Text(title, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1, color: accentColor)),
            ],
          ),
          const SizedBox(height: 6),
          Text(content, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
