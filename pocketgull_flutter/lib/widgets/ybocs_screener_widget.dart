/// Y-BOCS Screener Widget — OCD assessment UI.
///
/// Flutter parity with Angular `ybocs-screener.component.ts` (244 lines).
/// Two-column layout: symptom checklist tabs + severity rating scale.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ybocs_service.dart';

class YbocsScreenerWidget extends ConsumerStatefulWidget {
  const YbocsScreenerWidget({super.key});

  @override
  ConsumerState<YbocsScreenerWidget> createState() =>
      _YbocsScreenerWidgetState();
}

class _YbocsScreenerWidgetState extends ConsumerState<YbocsScreenerWidget> {
  String _activeTab = 'obsessions';

  @override
  Widget build(BuildContext context) {
    final yState = ref.watch(ybocsProvider);
    final yNotifier = ref.read(ybocsProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryHeader(yState, isDark),
          const SizedBox(height: 16),
          _buildActionRow(yNotifier, isDark),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth >= 800) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 7, child: _buildChecklist(yState, yNotifier, isDark)),
                    const SizedBox(width: 16),
                    Expanded(flex: 5, child: _buildSeverityPanel(yState, yNotifier, isDark)),
                  ],
                );
              }
              return Column(children: [
                _buildChecklist(yState, yNotifier, isDark),
                const SizedBox(height: 16),
                _buildSeverityPanel(yState, yNotifier, isDark),
              ]);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryHeader(YbocsState yState, bool isDark) {
    final severity = yState.severityDetails;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
      ),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('CLINICAL PROTOCOL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800,
                  letterSpacing: 1.5, color: Colors.grey.shade500)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.purple.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.purple.withValues(alpha: 0.2)),
                ),
                child: Text('Y-BOCs Diagnostic Suite', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700,
                    letterSpacing: 1, color: Colors.purple.shade300)),
              ),
            ]),
            const SizedBox(height: 6),
            Text('Yale-Brown Obsessive-Compulsive Scale',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.grey.shade900)),
            const SizedBox(height: 4),
            Text('Gold standard instrument for assessing OCD symptom presence, type, and severity.',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
          ]),
        ),
        const SizedBox(width: 16),
        Container(
          width: 140, padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF09090B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
          ),
          child: Column(children: [
            RichText(text: TextSpan(children: [
              TextSpan(text: '${yState.totalScore}', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900,
                  fontFamily: 'PocketGullMono', color: isDark ? Colors.white : Colors.grey.shade900)),
              TextSpan(text: '/40', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
            ])),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 4),
              decoration: BoxDecoration(
                color: severity.color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: severity.color.withValues(alpha: 0.3)),
              ),
              child: Text(severity.name, textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: severity.color)),
            ),
            const SizedBox(height: 8),
            Wrap(alignment: WrapAlignment.center, spacing: 6, children: [
              Text('OBS: ${yState.obsessionSubtotal}/20', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold,
                  fontFamily: 'PocketGullMono', color: isDark ? Colors.grey.shade300 : Colors.grey.shade700)),
              Text('COMP: ${yState.compulsiveSubtotal}/20', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold,
                  fontFamily: 'PocketGullMono', color: isDark ? Colors.grey.shade300 : Colors.grey.shade700)),
            ]),
          ]),
        ),
      ]),
    );
  }

  Widget _buildActionRow(YbocsNotifier yNotifier, bool isDark) {
    return Wrap(spacing: 12, runSpacing: 8, children: [
      _actionButton('🎙️ Voice Interview', const Color(0xFF7C3AED), () {}),
      _actionButton('🧘 Somatic Grounding', const Color(0xFF059669), () {}),
      OutlinedButton.icon(
        onPressed: () => yNotifier.resetAssessment(),
        icon: const Text('🗑️', style: TextStyle(fontSize: 14)),
        label: const Text('Reset Form', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
        style: OutlinedButton.styleFrom(
          foregroundColor: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    ]);
  }

  Widget _actionButton(String label, Color color, VoidCallback onTap) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: color, foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 2,
      ),
      child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
    );
  }

  Widget _buildChecklist(YbocsState yState, YbocsNotifier yNotifier, bool isDark) {
    final isObs = _activeTab == 'obsessions';
    final categories = symptomCategories.where((c) => c.isObsession == isObs).toList();

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        _tabButton('Obsessions Checklist', _activeTab == 'obsessions', () => setState(() => _activeTab = 'obsessions')),
        _tabButton('Compulsions Checklist', _activeTab == 'compulsions', () => setState(() => _activeTab = 'compulsions')),
      ]),
      const SizedBox(height: 12),
      ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 600),
        child: ListView.separated(
          shrinkWrap: true,
          itemCount: categories.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, i) {
            final cat = categories[i];
            final items = symptomItems.where((s) => s.category == cat.id).toList();
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF09090B) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(cat.name, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold,
                    letterSpacing: 1.5, color: isDark ? Colors.grey.shade200 : Colors.grey.shade800)),
                Divider(color: isDark ? const Color(0xFF18181B) : const Color(0xFFF4F4F5), height: 16),
                ...items.map((item) => _checklistItem(item, yState, yNotifier, isDark)),
              ]),
            );
          },
        ),
      ),
    ]);
  }

  Widget _tabButton(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.only(bottom: 10, left: 16, right: 16),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(
            width: active ? 2 : 0,
            color: active ? const Color(0xFF7C3AED) : Colors.transparent,
          )),
        ),
        child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
            letterSpacing: 1.5, color: active ? const Color(0xFF7C3AED) : Colors.grey.shade500)),
      ),
    );
  }

  Widget _checklistItem(SymptomItem item, YbocsState yState, YbocsNotifier yNotifier, bool isDark) {
    final resp = yState.checklistAnswers[item.id] ?? const SymptomResponse();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.text, maxLines: 2, overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold,
                    color: isDark ? Colors.grey.shade200 : Colors.grey.shade900)),
            Text(item.examples, style: TextStyle(fontSize: 9, fontStyle: FontStyle.italic,
                color: Colors.grey.shade500)),
          ]),
        ),
        const SizedBox(width: 8),
        _checkToggle('Past', resp.past, () => yNotifier.toggleChecklist(item.id, 'past'), isDark),
        const SizedBox(width: 4),
        _checkToggle('Current', resp.current, () => yNotifier.toggleChecklist(item.id, 'current'), isDark, isViolet: true),
      ]),
    );
  }

  Widget _checkToggle(String label, bool active, VoidCallback onTap, bool isDark, {bool isViolet = false}) {
    final bg = active
        ? (isViolet ? const Color(0xFF7C3AED) : (isDark ? Colors.grey.shade100 : Colors.grey.shade800))
        : Colors.transparent;
    final fg = active ? Colors.white : (isDark ? Colors.grey.shade600 : Colors.grey.shade400);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(6),
          border: Border.all(color: active ? bg : (isDark ? const Color(0xFF3F3F46) : const Color(0xFFD4D4D8))),
        ),
        child: Text(label, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800,
            letterSpacing: 1, color: fg)),
      ),
    );
  }

  Widget _buildSeverityPanel(YbocsState yState, YbocsNotifier yNotifier, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        padding: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7))),
        ),
        child: Text('Severity Rating Scale', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
            letterSpacing: 1.5, color: isDark ? Colors.grey.shade200 : Colors.grey.shade800)),
      ),
      const SizedBox(height: 12),
      ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 600),
        child: ListView.separated(
          shrinkWrap: true,
          itemCount: severityQuestions.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, i) => _severityQuestion(severityQuestions[i], yState, yNotifier, isDark),
        ),
      ),
    ]);
  }

  Widget _severityQuestion(SeverityQuestion q, YbocsState yState, YbocsNotifier yNotifier, bool isDark) {
    final selectedScore = yState.severityAnswers[q.id];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(q.title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold,
            color: isDark ? Colors.grey.shade100 : Colors.grey.shade900)),
        const SizedBox(height: 2),
        Text(q.subtitle, style: TextStyle(fontSize: 9, color: Colors.grey.shade500)),
        const SizedBox(height: 10),
        ...q.options.map((opt) {
          final isSelected = selectedScore == opt.score;
          return GestureDetector(
            onTap: () => yNotifier.setSeverityScore(q.id, opt.score),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? Colors.purple.withValues(alpha: 0.06) : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isSelected ? Colors.purple.shade400 : (isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7))),
              ),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  width: 14, height: 14,
                  margin: const EdgeInsets.only(right: 10, top: 2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(width: 1.5, color: isSelected ? const Color(0xFF7C3AED) : Colors.grey.shade500),
                  ),
                  child: isSelected
                      ? Center(child: Container(width: 6, height: 6,
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF7C3AED))))
                      : null,
                ),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text(opt.label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold,
                          color: isDark ? Colors.grey.shade200 : Colors.grey.shade800)),
                      Text('Score: ${opt.score}', style: TextStyle(fontSize: 9,
                          fontFamily: 'PocketGullMono', color: Colors.grey.shade500)),
                    ]),
                    const SizedBox(height: 2),
                    Text(opt.desc, style: TextStyle(fontSize: 9, color: Colors.grey.shade500)),
                  ]),
                ),
              ]),
            ),
          );
        }),
      ]),
    );
  }
}
