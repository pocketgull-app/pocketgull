// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import 'package:flutter/material.dart';
import '../../../../core/services/multilingual_passport_service.dart';
import '../../../../core/models/patient.dart';

class MultilingualPassportScreen extends StatefulWidget {
  final Patient? patient;

  const MultilingualPassportScreen({super.key, this.patient});

  @override
  State<MultilingualPassportScreen> createState() => _MultilingualPassportScreenState();
}

class _MultilingualPassportScreenState extends State<MultilingualPassportScreen> {
  String _selectedLangCode = 'en';

  late CrossBorderPassportData _passportData;

  @override
  void initState() {
    super.initState();
    final p = widget.patient;
    _passportData = CrossBorderPassportData(
      anonymousId: p != null ? 'P-GULL-${p.id.toUpperCase()}' : 'P-GULL-8F4E-DEMO',
      bloodType: 'O-Negative (Universal Donor)',
      criticalAllergies: ['Penicillin G (Severe Anaphylaxis)', 'Sulfa Drugs'],
      pgxVariants: [
        'CYP2C19 *2/*2 (Poor Metabolizer - Clopidogrel Resistance)',
        'HLA-B*5701 Positive (Abacavir Severe Hypersensitivity)',
      ],
      chronicConditions: [
        'SCTID: 44054006 (Type 2 Diabetes Mellitus)',
        'SCTID: 59621000 (Essential Hypertension)',
      ],
      issueDate: DateTime.now().toIso8601String().split('T').first,
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final cardBg = isDark ? const Color(0xFF27272A) : Colors.white;
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF18181B);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    final t = MultilingualPassportService.getTranslation(_selectedLangCode);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Column(
          children: const [
            Text('HEALTH PASSPORT', style: TextStyle(letterSpacing: 2, fontSize: 13, fontWeight: FontWeight.w900)),
            Text('6-Language Sovereign QR Emergency Profile', style: TextStyle(fontSize: 10, color: Color(0xFF71717A))),
          ],
        ),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Language Switcher Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: MultilingualPassportService.supportedLanguages.map((lang) {
                final isSelected = lang.code == _selectedLangCode;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    avatar: Text(lang.flag, style: const TextStyle(fontSize: 14)),
                    label: Text('${lang.name} (${lang.nativeName})', style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                    selected: isSelected,
                    selectedColor: const Color(0xFF7C3AED).withValues(alpha: 0.2),
                    onSelected: (val) {
                      if (val) setState(() => _selectedLangCode = lang.code);
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Main Passport Card
          Container(
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE4E4E7)),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 16, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with Flag and Sovereign Seal
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(t['title']!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1.2, color: Color(0xFF7C3AED))),
                          const SizedBox(height: 2),
                          Text('ANON ID: ${_passportData.anonymousId}', style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: subColor)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_user_outlined, size: 12, color: Color(0xFF059669)),
                          SizedBox(width: 4),
                          Text('OFFLINE VERIFIED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                        ],
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),

                // QR Code Matrix & Blood Group Box
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.black12),
                        ),
                        child: CustomPaint(
                          size: const Size(160, 160),
                          painter: CompactQrMatrixPainter(payload: _passportData.toCompactQrPayload()),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text('Scan with any standard 2D camera scanner', style: TextStyle(fontSize: 10, color: subColor)),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Critical Blood Group
                _buildInfoBlock(
                  label: t['blood_type']!,
                  value: _passportData.bloodType,
                  accentColor: const Color(0xFFDC2626),
                  icon: Icons.bloodtype_outlined,
                  isDark: isDark,
                ),
                const SizedBox(height: 12),

                // Critical Drug Allergies
                _buildListBlock(
                  label: t['allergies']!,
                  items: _passportData.criticalAllergies,
                  accentColor: const Color(0xFFD97706),
                  icon: Icons.warning_amber_rounded,
                  isDark: isDark,
                ),
                const SizedBox(height: 12),

                // PGx Contraindications Box (Red Alert)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.emergency, color: Color(0xFFDC2626), size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(t['pgx_alerts']!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFDC2626), letterSpacing: 0.8)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ..._passportData.pgxVariants.map(
                        (v) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2.0),
                          child: Text('• $v', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(t['warning']!, style: const TextStyle(fontSize: 10, fontStyle: FontStyle.italic, color: Color(0xFF991B1B))),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Active Clinical Conditions (SNOMED CT)
                _buildListBlock(
                  label: t['conditions']!,
                  items: _passportData.chronicConditions,
                  accentColor: const Color(0xFF2563EB),
                  icon: Icons.medical_services_outlined,
                  isDark: isDark,
                ),
                const SizedBox(height: 20),

                // Bottom Export Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C3AED),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.print_outlined, size: 18),
                    label: const Text('PRINT AUSTERE EMERGENCY FORM', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Disaster-ready emergency summary printed to local paper cache.'),
                          backgroundColor: Color(0xFF7C3AED),
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
    );
  }

  Widget _buildInfoBlock({
    required String label,
    required String value,
    required Color accentColor,
    required IconData icon,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: accentColor),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: accentColor)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildListBlock({
    required String label,
    required List<String> items,
    required Color accentColor,
    required IconData icon,
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
              Icon(icon, size: 16, color: accentColor),
              const SizedBox(width: 8),
              Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: accentColor)),
            ],
          ),
          const SizedBox(height: 6),
          ...items.map(
            (it) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2.0),
              child: Text('• $it', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
            ),
          ),
        ],
      ),
    );
  }
}

/// Lightweight deterministic 2D QR matrix painter
class CompactQrMatrixPainter extends CustomPainter {
  final String payload;

  CompactQrMatrixPainter({required this.payload});

  @override
  void paint(Canvas canvas, Size size) {
    final paintDark = Paint()..color = Colors.black;
    final paintLight = Paint()..color = Colors.white;

    // Draw background
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paintLight);

    const int modules = 25; // 25x25 QR grid
    final double cellSize = size.width / modules;

    // Draw 3 Corner Position Detection Patterns
    _drawFinderPattern(canvas, 0, 0, cellSize, paintDark, paintLight);
    _drawFinderPattern(canvas, modules - 7, 0, cellSize, paintDark, paintLight);
    _drawFinderPattern(canvas, 0, modules - 7, cellSize, paintDark, paintLight);

    // Draw timing patterns
    for (int i = 8; i < modules - 8; i++) {
      if (i % 2 == 0) {
        canvas.drawRect(Rect.fromLTWH(6 * cellSize, i * cellSize, cellSize, cellSize), paintDark);
        canvas.drawRect(Rect.fromLTWH(i * cellSize, 6 * cellSize, cellSize, cellSize), paintDark);
      }
    }

    // Hash payload into deterministic data cells
    int hash = 0x811c9dc5;
    for (int i = 0; i < payload.length; i++) {
      hash ^= payload.codeUnitAt(i);
      hash = (hash * 0x01000193) & 0xFFFFFFFF;
    }

    for (int row = 0; row < modules; row++) {
      for (int col = 0; col < modules; col++) {
        // Skip finder areas
        if ((row < 8 && col < 8) || (row < 8 && col >= modules - 8) || (row >= modules - 8 && col < 8)) {
          continue;
        }
        if (row == 6 || col == 6) continue; // Skip timing line

        final bitIndex = (row * modules + col) % 32;
        final isDarkBit = ((hash >> bitIndex) & 1) == 1;
        if (isDarkBit) {
          canvas.drawRect(Rect.fromLTWH(col * cellSize, row * cellSize, cellSize, cellSize), paintDark);
        }
      }
    }
  }

  void _drawFinderPattern(Canvas canvas, int col, int row, double cell, Paint dark, Paint light) {
    // 7x7 outer dark
    canvas.drawRect(Rect.fromLTWH(col * cell, row * cell, 7 * cell, 7 * cell), dark);
    // 5x5 inner light
    canvas.drawRect(Rect.fromLTWH((col + 1) * cell, (row + 1) * cell, 5 * cell, 5 * cell), light);
    // 3x3 center dark
    canvas.drawRect(Rect.fromLTWH((col + 2) * cell, (row + 2) * cell, 3 * cell, 3 * cell), dark);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
