/// Cost-Benefit Analysis Widget — Treatment comparison matrix.
///
/// Flutter parity with Angular `cost-benefit-analysis.component.ts` (757 lines).
/// Multi-paradigm (Western/Eastern/Ayurvedic) treatment comparison
/// with preference-weighted scoring, Sentinel containment mode,
/// and treatment vs. prevention view toggle.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ══════════════════════════════════════════════════════════════════════════
// DATA MODELS
// ══════════════════════════════════════════════════════════════════════════

class TreatmentOption {
  final String paradigm;
  final String name;
  final String costLabel;
  final int costValue;
  final String effortLabel;
  final int effortValue;
  final String efficacy;
  final String holisticLabel;
  final bool isNatural;
  final List<String> benefits;
  final List<String> risks;

  const TreatmentOption({
    required this.paradigm,
    required this.name,
    required this.costLabel,
    required this.costValue,
    required this.effortLabel,
    required this.effortValue,
    required this.efficacy,
    required this.holisticLabel,
    this.isNatural = false,
    required this.benefits,
    required this.risks,
  });
}

class UserPrefs {
  final bool lowCost;
  final bool lowEffort;
  final bool naturalFocus;
  const UserPrefs({this.lowCost = false, this.lowEffort = false, this.naturalFocus = false});
  UserPrefs toggle(String key) => switch (key) {
        'lowCost' => UserPrefs(lowCost: !lowCost, lowEffort: lowEffort, naturalFocus: naturalFocus),
        'lowEffort' => UserPrefs(lowCost: lowCost, lowEffort: !lowEffort, naturalFocus: naturalFocus),
        'naturalFocus' => UserPrefs(lowCost: lowCost, lowEffort: lowEffort, naturalFocus: !naturalFocus),
        _ => this,
      };
}

// ══════════════════════════════════════════════════════════════════════════
// STATIC DATA — Treatment & Prevention Options
// ══════════════════════════════════════════════════════════════════════════

const _treatmentOptions = <TreatmentOption>[
  TreatmentOption(paradigm: 'Western', name: 'Prescription Metformin & Statin Therapy',
      costLabel: 'Low (Insurance Covered)', costValue: 1,
      effortLabel: 'Oral Daily Dose', effortValue: 2,
      efficacy: 'Rapid Efficacy (1-2w)', holisticLabel: 'Allopathic Glycemic Control',
      benefits: ['Direct, rapid HbA1c reduction', 'Proven cardiovascular protection', 'Insurance covered'],
      risks: ['GI upset (transient)', 'Rare lactic acidosis risk', 'Requires lab oversight']),
  TreatmentOption(paradigm: 'Eastern', name: 'Acupuncture & Xiao Ke Wan (Herbs)',
      costLabel: 'Moderate (\$80/session)', costValue: 4,
      effortLabel: '2x Weekly Clinic Visits', effortValue: 4,
      efficacy: 'Gradual Efficacy (3-6w)', holisticLabel: 'Traditional Chinese Medicine', isNatural: true,
      benefits: ['Addresses systemic qi stagnation', 'Improves peripheral nerve sensation', 'Natural pancreatic support'],
      risks: ['Out-of-pocket session fees', 'Twice-weekly clinic travel', 'Minor bruising at points']),
  TreatmentOption(paradigm: 'Ayurvedic', name: 'Nisha Amalaki & Yoga Therapy',
      costLabel: 'Low (\$15/month)', costValue: 2,
      effortLabel: 'Daily Active Routine', effortValue: 5,
      efficacy: 'Preventive & Long-term', holisticLabel: 'Holistic Metabolic Balancing', isNatural: true,
      benefits: ['Curcumin & Amla antioxidant defense', 'Yoga reduces cortisol glucose spikes', 'Gut microbiome balance'],
      risks: ['High self-discipline required', 'Slower clinical onset (4-8 wks)', 'Needs certified guidance']),
];

const _preventionOptions = <TreatmentOption>[
  TreatmentOption(paradigm: 'Western', name: 'Screening Metrics & Low-Dose Aspirin',
      costLabel: 'Low (Preventive Benefit)', costValue: 1,
      effortLabel: 'Annual Checks / Daily Pill', effortValue: 1,
      efficacy: 'Proactive Primary Prevention', holisticLabel: 'Vascular & Metabolic Screening',
      benefits: ['Covered screening tests (A1C, Lipids)', 'Early cardiac drift identification', 'Aspirin lowers vascular risk'],
      risks: ['Minor GI bleeding risk', 'Over-diagnosis potential', 'Requires regular visits']),
  TreatmentOption(paradigm: 'Eastern', name: 'Seasonal Acupuncture & Meridian Tuning',
      costLabel: 'Moderate (\$80/month)', costValue: 3,
      effortLabel: 'Monthly Maintenance Visit', effortValue: 3,
      efficacy: 'Harmonious Qi Maintenance', holisticLabel: 'Preventive Yin/Yang Balancing', isNatural: true,
      benefits: ['Clears micro-congestions early', 'Tones immune function', 'Seasonal dietary alignment'],
      risks: ['Out-of-pocket costs', 'Subtle response (hard to notice)', 'Strict dietary adherence']),
  TreatmentOption(paradigm: 'Ayurvedic', name: 'Dinacharya (Circadian Routine)',
      costLabel: 'Very Low (\$5/month)', costValue: 1,
      effortLabel: 'Daily Morning Rituals', effortValue: 4,
      efficacy: 'Root Constitutional Wellness', holisticLabel: 'Daily Dosha Harmonization', isNatural: true,
      benefits: ['Oil pulling & tongue scraping detox', 'Chyawanprash builds immunity', 'Morning pranayama stabilizes NS'],
      risks: ['Requires pre-sunrise waking', '15-20 min daily investment', 'Incompatible with shift work']),
];

// ══════════════════════════════════════════════════════════════════════════
// WIDGET
// ══════════════════════════════════════════════════════════════════════════

class CostBenefitAnalysisWidget extends ConsumerStatefulWidget {
  final bool isSentinel;
  const CostBenefitAnalysisWidget({super.key, this.isSentinel = false});

  @override
  ConsumerState<CostBenefitAnalysisWidget> createState() => _CostBenefitAnalysisWidgetState();
}

class _CostBenefitAnalysisWidgetState extends ConsumerState<CostBenefitAnalysisWidget> {
  String _activeMode = 'treatment';
  UserPrefs _prefs = const UserPrefs();

  List<TreatmentOption> get _activeOptions =>
      _activeMode == 'treatment' ? _treatmentOptions : _preventionOptions;

  int _calculateMatch(TreatmentOption opt) {
    int score = 100;
    int activePrefCount = 0;
    if (_prefs.lowCost) { activePrefCount++; score -= (opt.costValue - 1) * 15; }
    if (_prefs.lowEffort) { activePrefCount++; score -= (opt.effortValue - 1) * 15; }
    if (_prefs.naturalFocus) { activePrefCount++; if (!opt.isNatural) score -= 40; }
    if (activePrefCount == 0) {
      if (opt.paradigm == 'Western') return 85;
      if (opt.paradigm == 'Eastern') return 70;
      return 60;
    }
    return score.clamp(0, 100);
  }

  Color _paradigmColor(String p) => switch (p) {
        'Western' => Colors.blue,
        'Eastern' => Colors.teal,
        'Ayurvedic' => Colors.amber.shade700,
        _ => Colors.grey,
      };

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final sorted = List<TreatmentOption>.from(_activeOptions)
      ..sort((a, b) => _calculateMatch(b).compareTo(_calculateMatch(a)));

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.grey.shade100.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade300),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(isDark),
          const SizedBox(height: 16),
          _buildFilters(isDark),
          const SizedBox(height: 20),
          ...sorted.map((opt) => _buildOptionCard(opt, isDark)),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _activeMode == 'treatment' ? 'TREATMENT COST-BENEFIT MATRIX' : 'PATIENT PREVENTION PROTOCOLS',
          style: TextStyle(
            fontSize: 13, fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            color: isDark ? Colors.white : Colors.grey.shade900,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          _activeMode == 'treatment' ? 'Multi-Lens Paradigm Comparison' : 'Long-Term Proactive Health Strategy',
          style: const TextStyle(fontSize: 11, letterSpacing: 1.2, color: Colors.grey),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _modeButton('treatment', 'Active Treatment', isDark),
            const SizedBox(width: 4),
            _modeButton('prevention', 'Preventive Care', isDark),
          ],
        ),
      ],
    );
  }

  Widget _modeButton(String mode, String label, bool isDark) {
    final isActive = _activeMode == mode;
    return GestureDetector(
      onTap: () => setState(() => _activeMode = mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? (isDark ? Colors.white12 : Colors.white) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isActive ? [const BoxShadow(color: Colors.black12, blurRadius: 4)] : null,
        ),
        child: Text(label, style: TextStyle(
          fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.0,
          color: isActive ? (isDark ? Colors.white : Colors.grey.shade900) : Colors.grey,
        )),
      ),
    );
  }

  Widget _buildFilters(bool isDark) {
    return Wrap(
      spacing: 6,
      children: [
        _filterChip('💵 Low Cost', 'lowCost', _prefs.lowCost, Colors.green, isDark),
        _filterChip('⚡ Low Effort', 'lowEffort', _prefs.lowEffort, Colors.blue, isDark),
        _filterChip('🌿 Natural First', 'naturalFocus', _prefs.naturalFocus, Colors.teal, isDark),
      ],
    );
  }

  Widget _filterChip(String label, String key, bool active, Color activeColor, bool isDark) {
    return GestureDetector(
      onTap: () => setState(() => _prefs = _prefs.toggle(key)),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: active ? (isDark ? activeColor.withValues(alpha: 0.15) : Colors.white) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: active ? [const BoxShadow(color: Colors.black12, blurRadius: 2)] : null,
        ),
        child: Text(label, style: TextStyle(
          fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.8,
          color: active ? activeColor : Colors.grey,
        )),
      ),
    );
  }

  Widget _buildOptionCard(TreatmentOption opt, bool isDark) {
    final match = _calculateMatch(opt);
    final pColor = _paradigmColor(opt.paradigm);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.04) : Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: match >= 80
              ? Colors.teal.withValues(alpha: 0.4)
              : (isDark ? Colors.white10 : Colors.grey.shade300),
          width: match >= 80 ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: pColor, shape: BoxShape.circle)),
                const SizedBox(width: 6),
                Text('${opt.paradigm} Lens', style: TextStyle(
                    fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.0, color: pColor)),
              ]),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: match >= 80 ? Colors.teal.withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('🎯 $match% Match', style: TextStyle(
                    fontSize: 10, fontWeight: FontWeight.w800,
                    color: match >= 80 ? Colors.teal : Colors.grey)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(opt.name, style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : Colors.grey.shade900)),
          Text(opt.holisticLabel, style: const TextStyle(
              fontSize: 10, letterSpacing: 1.2, color: Colors.grey)),
          const SizedBox(height: 12),
          // Cost meter
          _meter('Estimated Cost', opt.costLabel, opt.costValue, Colors.red, isDark),
          const SizedBox(height: 8),
          _meter('Effort / Schedule', opt.effortLabel, opt.effortValue, Colors.blue, isDark),
          const SizedBox(height: 14),
          // Benefits
          _listSection('Expected Benefits', opt.benefits, Colors.teal, '✓', isDark),
          const SizedBox(height: 10),
          _listSection('Side Effects & Risks', opt.risks, Colors.amber.shade700, '⚠', isDark),
          const SizedBox(height: 12),
          Divider(color: isDark ? Colors.white10 : Colors.grey.shade200),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Clinical Response', style: TextStyle(fontSize: 10, color: Colors.grey, letterSpacing: 1.0)),
              Text(opt.efficacy, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.grey.shade800)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _meter(String label, String valueLabel, int value, Color color, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
              letterSpacing: 0.8, color: Colors.grey)),
          Text(valueLabel, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600,
              color: isDark ? Colors.white70 : Colors.grey.shade800)),
        ]),
        const SizedBox(height: 4),
        Row(
          children: List.generate(5, (i) => Expanded(
            child: Container(
              height: 4,
              margin: const EdgeInsets.symmetric(horizontal: 1),
              decoration: BoxDecoration(
                color: i < value ? color.withValues(alpha: 0.6) : (isDark ? Colors.white10 : Colors.grey.shade200),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          )),
        ),
      ],
    );
  }

  Widget _listSection(String title, List<String> items, Color color, String icon, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2, color: color)),
        const SizedBox(height: 4),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 3),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$icon ', style: TextStyle(fontSize: 11, color: color)),
              Expanded(child: Text(item, style: TextStyle(
                  fontSize: 11, color: isDark ? Colors.white70 : Colors.grey.shade700))),
            ],
          ),
        )),
      ],
    );
  }
}
