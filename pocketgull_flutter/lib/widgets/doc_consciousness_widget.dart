/// DOC Consciousness Widget — Disorders of Consciousness stimulation protocol.
///
/// Flutter parity with Angular `doc-consciousness.component.ts` (345 lines).
/// Form for GCS / DOC level / etiology → generates session schedule.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/doc_protocol_service.dart';

class DocConsciousnessWidget extends ConsumerStatefulWidget {
  const DocConsciousnessWidget({super.key});

  @override
  ConsumerState<DocConsciousnessWidget> createState() => _DocConsciousnessState();
}

class _DocConsciousnessState extends ConsumerState<DocConsciousnessWidget> {
  int _gcsScore = 8;
  DocLevel _docLevel = DocLevel.vsUws;
  int _daysPostOnset = 14;
  String _etiology = '';
  String _preferredMusic = '';
  bool _familyVoiceAvailable = true;
  bool _hasAutonomicStorming = false;
  bool _activeIcpMonitor = false;
  bool _hasPhotosensitivity = false;

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(docProtocolProvider);
    final notifier = ref.read(docProtocolProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF070A0F) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.8) : const Color(0xFFE5E7EB)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(children: [
        _buildHeader(session, isDark),
        Padding(
          padding: const EdgeInsets.all(20),
          child: session == null
              ? _buildForm(notifier, isDark)
              : _buildSession(session, notifier, isDark),
        ),
      ]),
    );
  }

  Widget _buildHeader(DocStimulationSession? session, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFF0F172A), Color(0xFF1E293B)]),
        borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Row(children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFF0EA5E9).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(child: Text('⚡', style: TextStyle(fontSize: 14))),
          ),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Consciousness Support Protocol',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('DOC / Coma Sensory Stimulation',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600,
                    letterSpacing: 1.5, color: const Color(0xFF0EA5E9).withValues(alpha: 0.8))),
          ]),
        ]),
        if (session != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF0EA5E9).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF0EA5E9).withValues(alpha: 0.2)),
            ),
            child: const Text('Protocol Active',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
                    letterSpacing: 1, color: Color(0xFF38BDF8))),
          ),
      ]),
    );
  }

  Widget _buildForm(DocProtocolNotifier notifier, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Safety Notice
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.amber.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.amber.withValues(alpha: 0.2)),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('⚕️', style: TextStyle(fontSize: 14)),
          const SizedBox(width: 10),
          Expanded(child: RichText(text: TextSpan(style: TextStyle(fontSize: 11, color: Colors.amber.shade300.withValues(alpha: 0.8)), children: [
            TextSpan(text: 'Research-informed, not a clinical decision system. ',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber.shade400)),
            const TextSpan(text: 'All protocols require physician oversight. Discontinue if ICP elevates or autonomic storming occurs.'),
          ]))),
        ]),
      ),
      const SizedBox(height: 16),

      // GCS + DOC Level
      Row(children: [
        Expanded(child: _formField('GCS Score', _buildGcsSlider(isDark), isDark)),
        const SizedBox(width: 12),
        Expanded(child: _formField('DOC Level', _buildDocDropdown(isDark), isDark)),
      ]),
      const SizedBox(height: 12),

      // Etiology + Days
      Row(children: [
        Expanded(child: _formField('Etiology',
            _textInput(_etiology, 'TBI, hypoxic, stroke...', (v) => setState(() => _etiology = v), isDark), isDark)),
        const SizedBox(width: 12),
        Expanded(child: _formField('Days Post-Onset',
            _textInput('$_daysPostOnset', '0', (v) => setState(() => _daysPostOnset = int.tryParse(v) ?? 14), isDark), isDark)),
      ]),
      const SizedBox(height: 12),

      _formField('Preferred Music (from family)',
          _textInput(_preferredMusic, 'Classic rock, Frank Sinatra...', (v) => setState(() => _preferredMusic = v), isDark), isDark),
      const SizedBox(height: 12),

      Wrap(spacing: 16, runSpacing: 8, children: [
        _checkbox('Family voices available', _familyVoiceAvailable, (v) => setState(() => _familyVoiceAvailable = v), isDark),
        _checkbox('Autonomic storming (PSH)', _hasAutonomicStorming, (v) => setState(() => _hasAutonomicStorming = v), isDark),
        _checkbox('ICP monitor in place', _activeIcpMonitor, (v) => setState(() => _activeIcpMonitor = v), isDark),
        _checkbox('Photosensitivity/seizure', _hasPhotosensitivity, (v) => setState(() => _hasPhotosensitivity = v), isDark),
      ]),
      const SizedBox(height: 20),

      SizedBox(
        width: double.infinity,
        child: Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF0284C7), Color(0xFF2563EB)]),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [BoxShadow(color: const Color(0xFF0EA5E9).withValues(alpha: 0.2), blurRadius: 16)],
          ),
          child: ElevatedButton(
            onPressed: () => notifier.generate(DocProfile(
              gcsScore: _gcsScore, docLevel: _docLevel, daysPostOnset: _daysPostOnset,
              etiology: _etiology, preferredMusic: _preferredMusic,
              familyVoiceAvailable: _familyVoiceAvailable,
              hasAutonomicStorming: _hasAutonomicStorming,
              activeIcpMonitor: _activeIcpMonitor,
              hasPhotosensitivity: _hasPhotosensitivity,
            )),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent, shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('⚡ Generate Stimulation Protocol',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white)),
          ),
        ),
      ),
    ]);
  }

  Widget _buildSession(DocStimulationSession sess, DocProtocolNotifier notifier, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0EA5E9).withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF0EA5E9).withValues(alpha: 0.2)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('CLINICIAN NOTE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
              letterSpacing: 1.5, color: Color(0xFF38BDF8))),
          const SizedBox(height: 4),
          Text(sess.clinicianNote, style: TextStyle(fontSize: 11,
              color: isDark ? Colors.grey.shade300 : Colors.grey.shade700)),
          const SizedBox(height: 8),
          Row(children: [
            _statChip('Total', '${sess.totalDurationMin} min', const Color(0xFF38BDF8)),
            const SizedBox(width: 12),
            _statChip('Sessions/Day', '${sess.sessionsPerDay}×', const Color(0xFF60A5FA)),
            const SizedBox(width: 12),
            _statChip('Blocks', '${sess.schedule.length}', const Color(0xFF818CF8)),
          ]),
        ]),
      ),
      const SizedBox(height: 12),

      if (sess.safetyWarnings.isNotEmpty) ...[
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.red.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.red.withValues(alpha: 0.2)),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('SAFETY ADVISORIES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
                letterSpacing: 1.5, color: Colors.red.shade400)),
            const SizedBox(height: 4),
            ...sess.safetyWarnings.map((w) => Text(w,
                style: TextStyle(fontSize: 11, color: Colors.red.shade300.withValues(alpha: 0.8)))),
          ]),
        ),
        const SizedBox(height: 12),
      ],

      Text('SESSION SCHEDULE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
          letterSpacing: 1.5, color: Colors.grey.shade500)),
      const SizedBox(height: 8),
      ...sess.schedule.map((block) => _blockCard(block, isDark)),
      const SizedBox(height: 12),

      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.purple.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.purple.withValues(alpha: 0.2)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('FAMILY GUIDANCE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
              letterSpacing: 1.5, color: Colors.purple.shade400)),
          const SizedBox(height: 4),
          ...sess.familyGuidance.map((g) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(g, style: TextStyle(fontSize: 11,
                color: isDark ? Colors.grey.shade300 : Colors.grey.shade700)),
          )),
        ]),
      ),
      const SizedBox(height: 12),

      SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: () => ref.read(docProtocolProvider.notifier).generate(
            const DocProfile(gcsScore: 8, docLevel: DocLevel.vsUws, daysPostOnset: 14),
          ),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFD1D5DB)),
          ),
          child: Text('Reset / New Patient', style: TextStyle(fontSize: 11,
              fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.grey.shade500)),
        ),
      ),
    ]);
  }

  // ── Shared Helpers ──

  Widget _formField(String label, Widget child, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
          letterSpacing: 1.5, color: Colors.grey.shade500)),
      const SizedBox(height: 6),
      child,
    ]);
  }

  Widget _buildGcsSlider(bool isDark) {
    final color = _gcsScore <= 7 ? Colors.red.shade400
        : _gcsScore <= 12 ? Colors.amber.shade400 : Colors.green.shade400;
    final interp = _gcsScore <= 7 ? 'Severe — coma / vegetative range'
        : _gcsScore <= 12 ? 'Moderate — MCS range'
        : _gcsScore <= 14 ? 'Mild — emerging / EMCS range' : 'Normal consciousness';

    return Column(children: [
      Row(children: [
        Expanded(child: Slider(
          value: _gcsScore.toDouble(), min: 3, max: 15, divisions: 12,
          activeColor: const Color(0xFF0EA5E9),
          onChanged: (v) {
            final gcs = v.round();
            DocLevel level = DocLevel.vsUws;
            if (gcs <= 7) { level = DocLevel.coma; }
            else if (gcs <= 10) { level = DocLevel.mcsMinus; }
            else if (gcs <= 12) { level = DocLevel.mcsPlus; }
            else if (gcs <= 14) { level = DocLevel.emcs; }
            setState(() { _gcsScore = gcs; _docLevel = level; });
          },
        )),
        Text('$_gcsScore', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: color)),
      ]),
      Text(interp, style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic, color: Colors.grey.shade500)),
    ]);
  }

  Widget _buildDocDropdown(bool isDark) {
    return DropdownButtonFormField<DocLevel>(
      initialValue: _docLevel, isExpanded: true,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFD1D5DB))),
        filled: true, fillColor: isDark ? const Color(0xFF0F172A).withValues(alpha: 0.6) : const Color(0xFFF8FAFC),
      ),
      style: TextStyle(fontSize: 11, color: isDark ? Colors.grey.shade200 : Colors.grey.shade800),
      items: const [
        DropdownMenuItem(value: DocLevel.coma, child: Text('Coma (no wake-sleep)')),
        DropdownMenuItem(value: DocLevel.vsUws, child: Text('Vegetative / UWS')),
        DropdownMenuItem(value: DocLevel.mcsMinus, child: Text('MCS- (non-verbal)')),
        DropdownMenuItem(value: DocLevel.mcsPlus, child: Text('MCS+ (command-following)')),
        DropdownMenuItem(value: DocLevel.emcs, child: Text('Emerging from MCS')),
        DropdownMenuItem(value: DocLevel.lockedIn, child: Text('Locked-in Syndrome ⚠️')),
      ],
      onChanged: (v) => setState(() => _docLevel = v!),
    );
  }

  Widget _textInput(String initialValue, String hint, ValueChanged<String> onChanged, bool isDark) {
    return TextFormField(
      initialValue: initialValue,
      onChanged: onChanged,
      style: TextStyle(fontSize: 11, color: isDark ? Colors.grey.shade200 : Colors.grey.shade800),
      decoration: InputDecoration(
        hintText: hint, hintStyle: TextStyle(color: Colors.grey.shade600, fontSize: 11),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFD1D5DB))),
        filled: true, fillColor: isDark ? const Color(0xFF0F172A).withValues(alpha: 0.6) : const Color(0xFFF8FAFC),
      ),
    );
  }

  Widget _checkbox(String label, bool value, ValueChanged<bool> onChanged, bool isDark) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      SizedBox(width: 18, height: 18, child: Checkbox(
        value: value, onChanged: (v) => onChanged(v ?? false),
        activeColor: const Color(0xFF0EA5E9),
      )),
      const SizedBox(width: 6),
      Text(label, style: TextStyle(fontSize: 10, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600)),
    ]);
  }

  Widget _statChip(String label, String value, Color color) {
    return Column(children: [
      Text(label, style: TextStyle(fontSize: 9, letterSpacing: 1.5, color: Colors.grey.shade500)),
      Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color)),
    ]);
  }

  Widget _blockCard(DocStimBlock block, bool isDark) {
    const emojiMap = {'quiet': '🤫', 'familiar-voice': '🗣️', 'auditory': '🎵',
        'vibroacoustic': '〰️', 'tactile-audio': '🤲', 'gamma-light': '💡'};
    const colorMap = {'quiet': Color(0xFF64748B), 'familiar-voice': Color(0xFF8B5CF6),
        'auditory': Color(0xFF0EA5E9), 'vibroacoustic': Color(0xFF3B82F6),
        'tactile-audio': Color(0xFF6366F1), 'gamma-light': Color(0xFFF59E0B)};
    final modColor = colorMap[block.modality] ?? Colors.grey.shade500;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: modColor.withValues(alpha: 0.25)),
      ),
      child: Column(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: modColor.withValues(alpha: 0.05),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(7)),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Row(children: [
              Text(emojiMap[block.modality] ?? '⬡', style: const TextStyle(fontSize: 14)),
              const SizedBox(width: 8),
              Text(block.label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
                  letterSpacing: 1, color: modColor)),
              if (block.frequencyHz != null) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0EA5E9).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text('${block.frequencyHz} Hz', style: const TextStyle(fontSize: 10,
                      fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                ),
              ],
            ]),
            Text('${block.durationMin} min', style: TextStyle(fontSize: 10,
                fontWeight: FontWeight.bold, color: Colors.grey.shade500)),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(block.instruction, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500,
                color: isDark ? Colors.grey.shade200 : Colors.grey.shade800)),
            const SizedBox(height: 4),
            Text(block.rationale, style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic,
                color: Colors.grey.shade500)),
          ]),
        ),
      ]),
    );
  }
}
