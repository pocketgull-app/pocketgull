import 'package:flutter/material.dart';
import '../../../core/models/patient.dart';
import '../../../core/models/triage_evaluation.dart';
import '../../../core/services/haptic_feedback_service.dart';
import '../../../core/services/triage_cache_service.dart';
import 'patient_detail_screen.dart';
import 'smoe_canvas_screen.dart';

class TriageCommandBoard extends StatefulWidget {
  final List<Patient> initialPatients;
  final VoidCallback onRefresh;

  const TriageCommandBoard({
    super.key,
    required this.initialPatients,
    required this.onRefresh,
  });

  @override
  State<TriageCommandBoard> createState() => _TriageCommandBoardState();
}

class _TriageCommandBoardState extends State<TriageCommandBoard> {
  String _searchQuery = '';
  EsiLevel? _selectedFilter; // null means 'All'
  bool _isTriageView = true;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF18181B) : Colors.white;
    final borderColor = isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7);
    final textColor = isDark ? const Color(0xFFFAFAFA) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    // Compute all triage evaluations
    final evaluations = TriageCacheService.loadTriageEvaluations(widget.initialPatients);

    // Counts
    final totalCount = evaluations.length;
    final esi1Count = evaluations.where((e) => e.esiLevel == EsiLevel.esi1Stat).length;
    final esi2Count = evaluations.where((e) => e.esiLevel == EsiLevel.esi2Emergent).length;
    final esi3Count = evaluations.where((e) => e.esiLevel == EsiLevel.esi3Urgent).length;
    final esi4Count = evaluations.where((e) => e.esiLevel == EsiLevel.esi4LessUrgent).length;
    final esi5Count = evaluations.where((e) => e.esiLevel == EsiLevel.esi5NonUrgent).length;

    // Filtered list
    final filtered = evaluations.where((e) {
      if (_selectedFilter != null && e.esiLevel != _selectedFilter) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchName = e.patientName.toLowerCase().contains(q);
        final matchId = e.patientId.toLowerCase().contains(q);
        final matchExpert = e.predictedTopExperts.any((slot) => slot.name.toLowerCase().contains(q));
        if (!matchName && !matchId && !matchExpert) return false;
      }
      return true;
    }).toList();

    return Column(
      children: [
        // Mode & View Toggle Bar
        Container(
          color: surfaceColor,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            HapticFeedbackService.triggerModeSelection();
                            setState(() => _isTriageView = true);
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: _isTriageView
                                  ? (isDark ? const Color(0xFF09090B) : Colors.white)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: _isTriageView
                                  ? [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)]
                                  : null,
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text('🚨', style: TextStyle(fontSize: 12)),
                                const SizedBox(width: 4),
                                Text(
                                  'Triage Matrix',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: _isTriageView ? textColor : subColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            HapticFeedbackService.triggerModeSelection();
                            setState(() => _isTriageView = false);
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: !_isTriageView
                                  ? (isDark ? const Color(0xFF09090B) : Colors.white)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: !_isTriageView
                                  ? [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)]
                                  : null,
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text('📋', style: TextStyle(fontSize: 12)),
                                const SizedBox(width: 4),
                                Text(
                                  'Patient Roster',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: !_isTriageView ? textColor : subColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              IconButton(
                icon: const Icon(Icons.share, size: 20),
                tooltip: 'Export FHIR R4 Bundle',
                onPressed: () {
                  HapticFeedbackService.triggerModeSelection();
                  final bundle = TriageCacheService.exportToFhirR4Bundle();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: const Color(0xFF0D9488),
                      content: Text(
                        'Exported Hospital Triage FHIR R4 Bundle (${bundle.length} bytes)',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),

        // Acuity KPI Strip (Horizontal scroll)
        if (_isTriageView)
          Container(
            color: surfaceColor,
            height: 64,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _kpiPill('ALL', totalCount, _selectedFilter == null, () {
                  HapticFeedbackService.triggerModeSelection();
                  setState(() => _selectedFilter = null);
                }, textColor, surfaceColor, borderColor),
                _kpiPill('ESI-1 STAT', esi1Count, _selectedFilter == EsiLevel.esi1Stat, () {
                  HapticFeedbackService.triggerEsiAcuityHaptic(EsiLevel.esi1Stat);
                  setState(() => _selectedFilter = EsiLevel.esi1Stat);
                }, Colors.redAccent, surfaceColor, Colors.red.withValues(alpha: 0.4)),
                _kpiPill('ESI-2 Emergent', esi2Count, _selectedFilter == EsiLevel.esi2Emergent, () {
                  HapticFeedbackService.triggerEsiAcuityHaptic(EsiLevel.esi2Emergent);
                  setState(() => _selectedFilter = EsiLevel.esi2Emergent);
                }, Colors.deepOrangeAccent, surfaceColor, Colors.orange.withValues(alpha: 0.4)),
                _kpiPill('ESI-3 Urgent', esi3Count, _selectedFilter == EsiLevel.esi3Urgent, () {
                  HapticFeedbackService.triggerEsiAcuityHaptic(EsiLevel.esi3Urgent);
                  setState(() => _selectedFilter = EsiLevel.esi3Urgent);
                }, Colors.amber[800]!, surfaceColor, Colors.amber.withValues(alpha: 0.4)),
                _kpiPill('ESI-4 Less Urgent', esi4Count, _selectedFilter == EsiLevel.esi4LessUrgent, () {
                  HapticFeedbackService.triggerEsiAcuityHaptic(EsiLevel.esi4LessUrgent);
                  setState(() => _selectedFilter = EsiLevel.esi4LessUrgent);
                }, Colors.green[700]!, surfaceColor, Colors.green.withValues(alpha: 0.4)),
                _kpiPill('ESI-5 Non-Urgent', esi5Count, _selectedFilter == EsiLevel.esi5NonUrgent, () {
                  HapticFeedbackService.triggerEsiAcuityHaptic(EsiLevel.esi5NonUrgent);
                  setState(() => _selectedFilter = EsiLevel.esi5NonUrgent);
                }, Colors.grey[700]!, surfaceColor, Colors.grey.withValues(alpha: 0.4)),
              ],
            ),
          ),

        // Search Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            style: TextStyle(fontSize: 13, color: textColor),
            decoration: InputDecoration(
              hintText: 'Search patient, condition, or SMoE expert...',
              hintStyle: TextStyle(fontSize: 12, color: subColor),
              prefixIcon: Icon(Icons.search, size: 20, color: subColor),
              isDense: true,
              filled: true,
              fillColor: surfaceColor,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
            ),
          ),
        ),

        // Patient Cards or Roster
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async => widget.onRefresh(),
            child: filtered.isEmpty
                ? Center(
                    child: Text('No patients match criteria.', style: TextStyle(color: subColor, fontSize: 13)),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final triage = filtered[index];

                      if (!_isTriageView) {
                        return _buildStandardRosterTile(triage, textColor, subColor, surfaceColor, borderColor, isDark);
                      }

                      return _buildTriageCard(triage, textColor, subColor, surfaceColor, isDark);
                    },
                  ),
          ),
        ),
      ],
    );
  }

  Widget _kpiPill(
    String label,
    int count,
    bool isSelected,
    VoidCallback onTap,
    Color activeColor,
    Color surfaceColor,
    Color borderColor,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withValues(alpha: 0.15) : surfaceColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? activeColor : borderColor, width: isSelected ? 1.5 : 1.0),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: isSelected ? activeColor : const Color(0xFF71717A),
              ),
            ),
            Text(
              '$count',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: isSelected ? activeColor : null,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTriageCard(
    PatientTriageEvaluation triage,
    Color textColor,
    Color subColor,
    Color surfaceColor,
    bool isDark,
  ) {
    final borderUrgencyColor = _getEsiColor(triage.esiLevel);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: borderUrgencyColor.withValues(alpha: triage.esiLevel.levelNumber <= 2 ? 0.7 : 0.25),
          width: triage.esiLevel.levelNumber <= 2 ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: borderUrgencyColor.withValues(alpha: isDark ? 0.2 : 0.06),
            blurRadius: triage.esiLevel.levelNumber <= 2 ? 8 : 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: borderUrgencyColor.withValues(alpha: 0.15),
                child: Text(
                  triage.patientName.isNotEmpty ? triage.patientName[0] : '?',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: borderUrgencyColor),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      triage.patientName,
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: textColor),
                    ),
                    Text(
                      'ID: ${triage.patientId} • ${triage.age}y • ${triage.gender}',
                      style: TextStyle(fontSize: 11, color: subColor, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: borderUrgencyColor.withValues(alpha: isDark ? 0.3 : 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      triage.esiLabel,
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: borderUrgencyColor),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'NEWS2: ${triage.news2Score} • ${triage.targetMaxWaitMinutes == 0 ? "Immediate" : "< ${triage.targetMaxWaitMinutes}m"}',
                    style: TextStyle(fontSize: 10, color: subColor, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),

          // Triage Rationale
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF121214) : const Color(0xFFF4F4F5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              triage.priorityRationale,
              style: TextStyle(fontSize: 11, color: textColor),
            ),
          ),

          // Accompanied Status Ribbon
          if (triage.accompaniedBy != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFA855F7).withValues(alpha: isDark ? 0.2 : 0.1),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Text('👤', style: TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  const Text('With Patient: ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFA855F7))),
                  Expanded(
                    child: Text(
                      triage.accompaniedBy!.label,
                      style: TextStyle(fontSize: 10, color: textColor),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Language Access Ribbon
          if (triage.languageAccess != null) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: triage.languageAccess!.interpreterNeeded
                    ? const Color(0xFFF59E0B).withValues(alpha: isDark ? 0.2 : 0.1)
                    : (isDark ? const Color(0xFF27272A) : const Color(0xFFF4F4F5)),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: triage.languageAccess!.interpreterNeeded
                      ? const Color(0xFFF59E0B).withValues(alpha: 0.4)
                      : const Color(0xFF27272A),
                ),
              ),
              child: Row(
                children: [
                  Text(triage.languageAccess!.interpreterNeeded ? '🗣️' : '🌐', style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  if (triage.languageAccess!.interpreterNeeded)
                    const Text('Interpreter Required: ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                  Expanded(
                    child: Text(
                      '${triage.languageAccess!.preferredLanguage} (${triage.languageAccess!.modality})',
                      style: TextStyle(fontSize: 10, color: textColor),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Physiological Telemetry Strip
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _metricChip('BP', triage.vitalsSummary.bp, textColor, subColor),
              _metricChip('HR', '${triage.vitalsSummary.hr} bpm', textColor, subColor),
              _metricChip('SpO2', '${triage.vitalsSummary.spO2}%', textColor, subColor),
              _metricChip('Temp', '${triage.vitalsSummary.temp}°C', textColor, subColor),
            ],
          ),

          // Outliers
          if (triage.vitalsSummary.hasCriticalOutlier) ...[
            const SizedBox(height: 6),
            Wrap(
              spacing: 4,
              children: triage.vitalsSummary.criticalOutliers.map((o) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text('⚠️ $o', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                );
              }).toList(),
            ),
          ],

          // SMoE Top-2 Expert Slots
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D9488).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF0D9488).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Text(triage.predictedTopExperts[0].icon, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          triage.predictedTopExperts[0].name,
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '${triage.predictedTopExperts[0].probabilityPercent}%',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0D9488)),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Text(triage.predictedTopExperts[1].icon, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          triage.predictedTopExperts[1].name,
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '${triage.predictedTopExperts[1].probabilityPercent}%',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF6366F1)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Admit to SMoE Canvas Button
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                HapticFeedbackService.triggerEsiAcuityHaptic(triage.esiLevel);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SmoeCanvasScreen(evaluation: triage),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Text('🌐', style: TextStyle(fontSize: 13)),
              label: const Text(
                'Admit to Synoptic Canvas →',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _metricChip(String label, String value, Color textColor, Color subColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 9, color: subColor, fontFamily: 'monospace')),
        Text(value, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textColor, fontFamily: 'monospace')),
      ],
    );
  }

  Widget _buildStandardRosterTile(
    PatientTriageEvaluation triage,
    Color textColor,
    Color subColor,
    Color surfaceColor,
    Color borderColor,
    bool isDark,
  ) {
    final patient = widget.initialPatients.firstWhere(
      (p) => p.id == triage.patientId,
      orElse: () => Patient(
        id: triage.patientId,
        name: triage.patientName,
        age: triage.age,
        gender: triage.gender,
        lastVisit: '2026-10-01',
        preexistingConditions: const [],
        state: PatientState(vitals: const {}),
      ),
    );

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getEsiColor(triage.esiLevel).withValues(alpha: 0.15),
          child: Text(
            triage.patientName.isNotEmpty ? triage.patientName[0] : '?',
            style: TextStyle(fontWeight: FontWeight.bold, color: _getEsiColor(triage.esiLevel)),
          ),
        ),
        title: Text(triage.patientName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor)),
        subtitle: Text('Age: ${triage.age} • ${triage.esiLabel} • NEWS2: ${triage.news2Score}', style: TextStyle(fontSize: 11, color: subColor)),
        trailing: const Icon(Icons.chevron_right, size: 20),
        onTap: () {
          HapticFeedbackService.triggerModeSelection();
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PatientDetailScreen(patient: patient),
            ),
          );
        },
      ),
    );
  }

  Color _getEsiColor(EsiLevel level) {
    switch (level) {
      case EsiLevel.esi1Stat:
        return Colors.redAccent;
      case EsiLevel.esi2Emergent:
        return Colors.deepOrangeAccent;
      case EsiLevel.esi3Urgent:
        return Colors.amber[800]!;
      case EsiLevel.esi4LessUrgent:
        return Colors.green[700]!;
      case EsiLevel.esi5NonUrgent:
        return Colors.grey[700]!;
    }
  }
}
