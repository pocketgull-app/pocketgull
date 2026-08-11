import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/services_providers.dart';
import '../services/teledentistry_service.dart';

class TeledentistryOdontogramWidget extends ConsumerStatefulWidget {
  const TeledentistryOdontogramWidget({super.key});

  @override
  ConsumerState<TeledentistryOdontogramWidget> createState() => _TeledentistryOdontogramWidgetState();
}

class _TeledentistryOdontogramWidgetState extends ConsumerState<TeledentistryOdontogramWidget> {
  int _selectedToothId = 16;

  @override
  Widget build(BuildContext context) {
    final service = ref.watch(teledentistryProvider);
    final teeth = service.teeth;
    final selectedTooth = teeth.firstWhere(
      (t) => t.fdiNumber == _selectedToothId,
      orElse: () => teeth.first,
    );

    final sibi = service.sibiScore;
    final cvRisk = service.cvRiskMultiplier;
    final hba1cElev = service.predictedHbA1cElevation;
    final deepPockets = service.deepPocketsCount;
    final bopPct = service.bleedingPercentage;

    return ListenableBuilder(
      listenable: service,
      builder: (context, _) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Expanded(
                    child: Row(
                      children: [
                        Icon(Icons.health_and_safety, color: Color(0xFF0284C7), size: 20),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'FDI 32-TOOTH ODONTOGRAM & SIBI BRIDGE',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF1F2937)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: sibi > 50 ? const Color(0xFFFEF2F2) : const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: sibi > 50 ? const Color(0xFFFCA5A5) : const Color(0xFFBBF7D0)),
                    ),
                    child: Text(
                      'SIBI $sibi / 100',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: sibi > 50 ? const Color(0xFF991B1B) : const Color(0xFF166534),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Upper Arch (18..11, 21..28)
              const Text('Maxillary Arch (Upper Teeth 18-28)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 4),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(16, (index) {
                    final toothNum = index < 8 ? (18 - index) : (21 + (index - 8));
                    final isSelected = _selectedToothId == toothNum;
                    final tooth = teeth.firstWhere((t) => t.fdiNumber == toothNum, orElse: () => ToothState(fdiNumber: toothNum, name: '', quadrant: 1));
                    final hasPpdAlert = tooth.probingDepthMm >= 4.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: ChoiceChip(
                        label: Text(
                          '#$toothNum${hasPpdAlert ? '⚡' : ''}',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : (hasPpdAlert ? const Color(0xFFDC2626) : const Color(0xFF374151)),
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: const Color(0xFF0284C7),
                        backgroundColor: hasPpdAlert ? const Color(0xFFFEF2F2) : const Color(0xFFF3F4F6),
                        onSelected: (_) => setState(() => _selectedToothId = toothNum),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 8),

              // Lower Arch (48..41, 31..38)
              const Text('Mandibular Arch (Lower Teeth 48-38)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 4),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(16, (index) {
                    final toothNum = index < 8 ? (48 - index) : (31 + (index - 8));
                    final isSelected = _selectedToothId == toothNum;
                    final tooth = teeth.firstWhere((t) => t.fdiNumber == toothNum, orElse: () => ToothState(fdiNumber: toothNum, name: '', quadrant: 4));
                    final hasPpdAlert = tooth.probingDepthMm >= 4.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: ChoiceChip(
                        label: Text(
                          '#$toothNum${hasPpdAlert ? '⚡' : ''}',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : (hasPpdAlert ? const Color(0xFFDC2626) : const Color(0xFF374151)),
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: const Color(0xFF0284C7),
                        backgroundColor: hasPpdAlert ? const Color(0xFFFEF2F2) : const Color(0xFFF3F4F6),
                        onSelected: (_) => setState(() => _selectedToothId = toothNum),
                      ),
                    );
                  }),
                ),
              ),
              const Divider(height: 24),

              // Selected Tooth Details & Interactive Controls
              Text(
                'Selected: Tooth #$_selectedToothId (${selectedTooth.name})',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
              ),
              const SizedBox(height: 8),

              // Smith & Knight TWI Selector
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Expanded(child: Text('Smith & Knight TWI Grade:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF374151)), overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 8),
                  DropdownButton<int>(
                    value: selectedTooth.twiGrade,
                    isDense: true,
                    items: const [
                      DropdownMenuItem(value: 0, child: Text('Grade 0 (Normal)', style: TextStyle(fontSize: 11))),
                      DropdownMenuItem(value: 1, child: Text('Grade 1 (Enamel Facet)', style: TextStyle(fontSize: 11))),
                      DropdownMenuItem(value: 2, child: Text('Grade 2 (Dentin < 1/3)', style: TextStyle(fontSize: 11))),
                      DropdownMenuItem(value: 3, child: Text('Grade 3 (Dentin > 1/3)', style: TextStyle(fontSize: 11))),
                      DropdownMenuItem(value: 4, child: Text('Grade 4 (Pulp Exposure)', style: TextStyle(fontSize: 11))),
                    ],
                    onChanged: (val) => service.setTWIGrade(_selectedToothId, val ?? 0),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Probing Depth Slider (0 to 12 mm)
              Row(
                children: [
                  Text('PPD: ${selectedTooth.probingDepthMm.toStringAsFixed(1)} mm', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                  Expanded(
                    child: Slider(
                      value: selectedTooth.probingDepthMm.clamp(0.0, 12.0),
                      min: 0.0,
                      max: 12.0,
                      divisions: 24,
                      activeColor: selectedTooth.probingDepthMm >= 4.0 ? const Color(0xFFDC2626) : const Color(0xFF0284C7),
                      onChanged: (val) => service.setProbingDepth(_selectedToothId, val),
                    ),
                  ),
                ],
              ),

              // Surface Caries Selection & BOP Toggle
              Wrap(
                spacing: 6,
                runSpacing: 6,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  const Text('Caries Surfaces:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                  ...ToothSurface.values.map((surf) {
                    final active = selectedTooth.cariesSurfaces.contains(surf);
                    return FilterChip(
                      label: Text(surf.name, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? Colors.white : const Color(0xFF374151))),
                      selected: active,
                      selectedColor: const Color(0xFFD97706),
                      backgroundColor: const Color(0xFFF3F4F6),
                      onSelected: (_) => service.toggleSurface(_selectedToothId, surf),
                    );
                  }),
                  FilterChip(
                    label: Text(
                      selectedTooth.hasBleedingOnProbing ? 'BOP Positive 🩸' : 'BOP Negative',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: selectedTooth.hasBleedingOnProbing ? Colors.white : const Color(0xFF374151)),
                    ),
                    selected: selectedTooth.hasBleedingOnProbing,
                    selectedColor: const Color(0xFFDC2626),
                    backgroundColor: const Color(0xFFF3F4F6),
                    onSelected: (_) => service.toggleBOP(_selectedToothId),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Systemic Periodontal-Cardiovascular Telemetry Cards
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text('Deep Pockets (PPD >= 4mm): $deepPockets | BOP: ${bopPct.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280)), overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(child: Text('Cardiovascular Risk Multiplier:', style: TextStyle(fontSize: 11, color: Color(0xFF4B5563)), overflow: TextOverflow.ellipsis)),
                        const SizedBox(width: 8),
                        Text('${cvRisk.toStringAsFixed(2)}x', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(child: Text('Predicted HbA1c Elevation:', style: TextStyle(fontSize: 11, color: Color(0xFF4B5563)), overflow: TextOverflow.ellipsis)),
                        const SizedBox(width: 8),
                        Text('+${hba1cElev.toStringAsFixed(2)}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
