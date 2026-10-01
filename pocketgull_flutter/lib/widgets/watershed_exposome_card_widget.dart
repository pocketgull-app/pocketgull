import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WatershedBasinData {
  final String id;
  final String name;
  final String state;
  final double hardnessCaCO3;
  final double pfoaNgL;
  final double pfosNgL;
  final double genxNgL;
  final double microplasticsPerL;
  final String tier;
  final String remedy;
  final String estCost;

  const WatershedBasinData({
    required this.id,
    required this.name,
    required this.state,
    required this.hardnessCaCO3,
    required this.pfoaNgL,
    required this.pfosNgL,
    required this.genxNgL,
    required this.microplasticsPerL,
    required this.tier,
    required this.remedy,
    required this.estCost,
  });
}

class WatershedExposomeCardWidget extends ConsumerStatefulWidget {
  const WatershedExposomeCardWidget({super.key});

  @override
  ConsumerState<WatershedExposomeCardWidget> createState() => _WatershedExposomeCardWidgetState();
}

class _WatershedExposomeCardWidgetState extends ConsumerState<WatershedExposomeCardWidget> {
  int _activeTabIndex = 0; // 0: Watershed, 1: Gametes, 2: DCA, 3: Manageability
  String _selectedBasinId = '17110019';
  double _decisionThresholdTau = 0.20;

  static const List<WatershedBasinData> basins = [
    WatershedBasinData(
      id: '17110019',
      name: 'Puget Sound / Cedar-Sammamish',
      state: 'WA',
      hardnessCaCO3: 34.2,
      pfoaNgL: 2.1,
      pfosNgL: 1.8,
      genxNgL: 0.4,
      microplasticsPerL: 14.5,
      tier: 'LOW',
      remedy: 'NSF-53 Solid Carbon Block Gravity Pitcher',
      estCost: '\$25',
    ),
    WatershedBasinData(
      id: '07010206',
      name: 'Upper Mississippi / Twin Cities',
      state: 'MN',
      hardnessCaCO3: 268.0,
      pfoaNgL: 14.8,
      pfosNgL: 18.2,
      genxNgL: 3.1,
      microplasticsPerL: 48.0,
      tier: 'HIGH',
      remedy: 'Multi-Stage Reverse Osmosis with Remineralization',
      estCost: '\$180',
    ),
    WatershedBasinData(
      id: '02040205',
      name: 'Delaware River Basin / Philadelphia',
      state: 'PA-NJ',
      hardnessCaCO3: 142.0,
      pfoaNgL: 16.4,
      pfosNgL: 19.8,
      genxNgL: 4.5,
      microplasticsPerL: 58.4,
      tier: 'HIGH',
      remedy: 'Point-of-Use Under-Sink Carbon Block + RO',
      estCost: '\$160',
    ),
    WatershedBasinData(
      id: '02050101',
      name: 'Upper Susquehanna River',
      state: 'NY-PA',
      hardnessCaCO3: 128.5,
      pfoaNgL: 8.6,
      pfosNgL: 9.2,
      genxNgL: 1.9,
      microplasticsPerL: 36.2,
      tier: 'MODERATE',
      remedy: 'NSF-53 / NSF-58 Dual Carbon Filter',
      estCost: '\$85',
    ),
    WatershedBasinData(
      id: '14010001',
      name: 'Colorado River Headwaters',
      state: 'CO',
      hardnessCaCO3: 165.0,
      pfoaNgL: 1.8,
      pfosNgL: 1.4,
      genxNgL: 0.2,
      microplasticsPerL: 8.5,
      tier: 'LOW',
      remedy: 'Basic Sediment + Coconut Carbon Filter',
      estCost: '\$20',
    ),
    WatershedBasinData(
      id: '05140201',
      name: 'Ohio River / Louisville Reach',
      state: 'KY-IN',
      hardnessCaCO3: 172.0,
      pfoaNgL: 22.5,
      pfosNgL: 28.4,
      genxNgL: 8.7,
      microplasticsPerL: 74.0,
      tier: 'SEVERE',
      remedy: 'Certified PFAS POU Reverse Osmosis + Remineralization',
      estCost: '\$195',
    ),
    WatershedBasinData(
      id: '03050106',
      name: 'Cape Fear River Basin / Wilmington',
      state: 'NC',
      hardnessCaCO3: 42.0,
      pfoaNgL: 28.0,
      pfosNgL: 34.5,
      genxNgL: 145.0,
      microplasticsPerL: 52.0,
      tier: 'SEVERE',
      remedy: 'High-Rejection Reverse Osmosis + Granular Activated Carbon',
      estCost: '\$220',
    ),
  ];

  WatershedBasinData get _currentBasin {
    return basins.firstWhere(
      (b) => b.id == _selectedBasinId,
      orElse: () => basins.first,
    );
  }

  Map<String, double> _computeDcaMetrics(double tau) {
    final weight = tau / (1.0 - tau);
    const prev = 0.264;
    final sens = math.max(0.20, math.min(0.99, 1.02 - 0.55 * tau));
    final spec = math.max(0.40, math.min(0.98, 0.50 + 0.90 * tau));
    final tpr = sens * prev;
    final fpr = (1.0 - spec) * (1.0 - prev);
    final nbModel = tpr - fpr * weight;
    final nbAll = prev - (1.0 - prev) * weight;
    final avoided = weight > 0 ? math.max(0.0, ((nbModel - nbAll) / weight) * 100.0) : 0.0;

    return {
      'netBenefitModel': nbModel,
      'netBenefitTreatAll': nbAll,
      'interventionsAvoided': avoided,
    };
  }

  Color _getTierColor(String tier) {
    switch (tier) {
      case 'LOW':
        return const Color(0xFF10B981);
      case 'MODERATE':
        return const Color(0xFFF59E0B);
      case 'HIGH':
        return const Color(0xFFF97316);
      case 'SEVERE':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF71717A);
    }
  }

  @override
  Widget build(BuildContext context) {
    final basin = _currentBasin;
    final dca = _computeDcaMetrics(_decisionThresholdTau);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF09090B), // Obsidian dark surface
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.3)), // Teal border
        boxShadow: const [
          BoxShadow(color: Colors.black54, blurRadius: 8, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF14B8A6).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.4)),
                ),
                alignment: Alignment.center,
                child: const Text('💧', style: TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Watershed Exposomics & Lineage',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF5EEAD4), // Teal 300
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFF042F2E),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.4)),
                          ),
                          child: const Text(
                            'RWD',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF5EEAD4),
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Text(
                      'USGS/EPA Water Quality & Decision Curve Analysis',
                      style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA)),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: const Text(
                  'AUC 0.857',
                  style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Tab Strip
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTabButton(0, '🏞️ Watershed'),
                const SizedBox(width: 6),
                _buildTabButton(1, '🧬 Dual Gametes'),
                const SizedBox(width: 6),
                _buildTabButton(2, '📊 Decision Curve'),
                const SizedBox(width: 6),
                _buildTabButton(3, '🌱 Restorative Swaps'),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // TAB CONTENT
          if (_activeTabIndex == 0) _buildWatershedTab(basin),
          if (_activeTabIndex == 1) _buildGametesTab(),
          if (_activeTabIndex == 2) _buildDcaTab(dca),
          if (_activeTabIndex == 3) _buildManageabilityTab(basin),
        ],
      ),
    );
  }

  Widget _buildTabButton(int index, String label) {
    final isSelected = _activeTabIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _activeTabIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0D9488) : const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? const Color(0xFF14B8A6) : const Color(0xFF27272A),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFFA1A1AA),
          ),
        ),
      ),
    );
  }

  Widget _buildWatershedTab(WatershedBasinData basin) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Dropdown Selector
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF18181B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF3F3F46)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedBasinId,
              isExpanded: true,
              dropdownColor: const Color(0xFF18181B),
              icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF5EEAD4), size: 18),
              style: const TextStyle(fontSize: 12, color: Colors.white),
              items: basins.map((b) {
                return DropdownMenuItem<String>(
                  value: b.id,
                  child: Text('${b.name} (${b.state})', overflow: TextOverflow.ellipsis),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedBasinId = val);
              },
            ),
          ),
        ),

        const SizedBox(height: 10),

        // Grid Metrics
        Row(
          children: [
            Expanded(child: _buildMetricTile('Hardness', '${basin.hardnessCaCO3.toStringAsFixed(1)} mg/L', 'CaCO3 Mineral')),
            const SizedBox(width: 8),
            Expanded(child: _buildMetricTile('PFAS Total', '${(basin.pfoaNgL + basin.pfosNgL).toStringAsFixed(1)} ng/L', 'EPA MCL: 4 ng/L', valueColor: (basin.pfoaNgL + basin.pfosNgL) > 20 ? const Color(0xFFF59E0B) : const Color(0xFF5EEAD4))),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _buildMetricTile('Microplastics', '${basin.microplasticsPerL.toStringAsFixed(1)} /L', 'Sub-micron Density')),
            const SizedBox(width: 8),
            Expanded(child: _buildMetricTile('Methylation Tier', basin.tier, '1-Carbon Burden', valueColor: _getTierColor(basin.tier))),
          ],
        ),

        const SizedBox(height: 10),

        // Point-of-use Remedy Card
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFF042F2E).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.3)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🛡️', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Point-of-Use Restorative Remedy:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF5EEAD4))),
                    Text(basin.remedy, style: const TextStyle(fontSize: 11, color: Colors.white)),
                    Text('Est. Out-of-Pocket: ${basin.estCost}', style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF2DD4BF))),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGametesTab() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Maternal mtDNA Heteroplasmy', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
                    SizedBox(height: 4),
                    Text('3.8%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Colors.white)),
                    Text('Target < 5.0% (Safe Harbor)', style: TextStyle(fontSize: 9, color: Color(0xFF10B981))),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.3)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Paternal 74-Day tsRNA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF5EEAD4))),
                    SizedBox(height: 4),
                    Text('Day 48 / 74', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Colors.white)),
                    Text('tsRNA Stress: 24/100', style: TextStyle(fontSize: 9, color: Color(0xFFA1A1AA))),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        const Text(
          'Preconception Synchronization Invariant: Aligning maternal 90-day follicular maturation with paternal 74-day spermatogenesis neutralizes intergenerational metabolic risk before fertilization.',
          style: TextStyle(fontSize: 10, color: Color(0xFFA1A1AA), height: 1.4),
        ),
      ],
    );
  }

  Widget _buildDcaTab(Map<String, double> dca) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Clinical Decision Threshold (tau):', style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA))),
            Text('tau = ${_decisionThresholdTau.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF5EEAD4))),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: const Color(0xFF14B8A6),
            thumbColor: const Color(0xFF2DD4BF),
            inactiveTrackColor: const Color(0xFF27272A),
            trackHeight: 4,
          ),
          child: Slider(
            value: _decisionThresholdTau,
            min: 0.05,
            max: 0.50,
            divisions: 9,
            onChanged: (val) => setState(() => _decisionThresholdTau = val),
          ),
        ),
        Row(
          children: [
            Expanded(child: _buildMetricTile('Model Net Benefit', '+${(dca['netBenefitModel'] ?? 0.0).toStringAsFixed(4)}', 'Standardized Score', valueColor: const Color(0xFF5EEAD4))),
            const SizedBox(width: 8),
            Expanded(child: _buildMetricTile('Interventions Avoided', (dca['interventionsAvoided'] ?? 0.0).toStringAsFixed(1), 'Per 100 Screened', valueColor: const Color(0xFF34D399))),
          ],
        ),
      ],
    );
  }

  Widget _buildManageabilityTab(WatershedBasinData basin) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Antonovsky Manageability Invariant: Every toxicant burden mandates immediate, low-cost or free restorative substitutions to prevent iatrogenic panic.',
          style: TextStyle(fontSize: 10, color: Color(0xFFA1A1AA), height: 1.3),
        ),
        const SizedBox(height: 8),
        _buildSwapRow('🫖', 'NSF-53 Carbon Gravity Pitcher', 'Removes >99% PFOA/PFOS & chlorine', '\$25 (Bench: \$35)'),
        _buildSwapRow('🧼', 'Pure Castile Soap Swap', 'Eliminates synthetic fragrance phthalates', '\$0 Equal Swap'),
        _buildSwapRow('🥚', '1-Carbon Dietary Choline Repletion', 'Pasture egg yolks + pumpkin seeds for SAMe', 'Standard Grocery'),
        _buildSwapRow('🫁', '0.1 Hz Resonant Breathing', '6 breaths/min resets vagal tone & cortisol', 'Free (\$0)'),
        const SizedBox(height: 6),
        const Text(
          '*Clinical Notice: Supportive evidence-grounded wellness tools, not direct prescriptions. As an Amazon Associate, PocketGull earns from qualifying purchases.',
          style: TextStyle(fontSize: 8, fontStyle: FontStyle.italic, color: Color(0xFF71717A)),
        ),
      ],
    );
  }

  Widget _buildSwapRow(String icon, String title, String subtitle, String price) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF27272A)),
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(subtitle, style: const TextStyle(fontSize: 9, color: Color(0xFFA1A1AA))),
                ],
              ),
            ),
            Text(price, style: const TextStyle(fontSize: 9, fontFamily: 'monospace', color: Color(0xFF5EEAD4))),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, String subtext, {Color? valueColor}) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Color(0xFFA1A1AA), fontFamily: 'monospace')),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              color: valueColor ?? Colors.white,
            ),
          ),
          const SizedBox(height: 1),
          Text(subtext, style: const TextStyle(fontSize: 8, color: Color(0xFF71717A))),
        ],
      ),
    );
  }
}
