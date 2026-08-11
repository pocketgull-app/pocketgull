import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../providers/analysis_provider.dart';
import '../providers/services_providers.dart';
import '../services/clinical_intelligence_service.dart';
import '../services/export_service.dart';
import '../models/patient_types.dart';
import 'report_tabs_widget.dart';
import 'summary_node_widget.dart';
import 'clinical_gauge_widget.dart';
import 'clinical_trend_widget.dart';

import '../widgets/ybocs_screener_widget.dart';
import '../widgets/research_tab_widget.dart';
import '../widgets/mood_consciousness_matrix_widget.dart';
import '../widgets/teledentistry_odontogram_widget.dart';
import '../widgets/skeptical_epistemology_card_widget.dart';
import '../widgets/camera_pulse_widget.dart';


class AnalysisReportWidget extends ConsumerStatefulWidget {
  const AnalysisReportWidget({super.key});

  @override
  ConsumerState<AnalysisReportWidget> createState() => _AnalysisReportWidgetState();
}
// ... [rest of UI states remain unchanged] ...
class _AnalysisReportWidgetState extends ConsumerState<AnalysisReportWidget> {
  bool _isChatOpen = false;
  ExportMode _exportMode = ExportMode.standard;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(analysisProvider);
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header with Generate button
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CLINICAL INTELLIGENCE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF416B1F),
                            letterSpacing: 2.0,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Analysis & Care Plan',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF1C1C1C),
                          ),
                        ),
                      ],
                    ),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        if (state.reports.isNotEmpty) ...[
                          _buildCognitionToggles(context, state),
                          IconButton(
                            tooltip: 'Export FHIR Bundle',
                            icon: const Icon(Icons.share_outlined, size: 20),
                            onPressed: () => _handleFhirExport(context),
                          ),
                          IconButton(
                            tooltip: 'Print Report',
                            icon: const Icon(Icons.print_outlined, size: 20),
                            onPressed: () => _handleExport(context, state),
                          ),
                        ],
                        ElevatedButton(
                          onPressed: state.isLoading && state.reports.isEmpty
                              ? null
                              : () => _handleGenerate(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1C1C1C),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                          ),
                          child: state.isLoading && state.reports.isEmpty
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'GENERATE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Tab Bar
              ReportTabsWidget(
                activeLens: state.activeLens,
                onLensChanged: (lens) {
                  ref.read(analysisProvider.notifier).changeLens(lens);
                  setState(() => _isChatOpen = false);
                },
              ),

              // Content Area
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: _buildContent(context, state),
              ),
            ],
          ),
        ),
      );
  }

  Widget _buildCognitionToggles(BuildContext context, AnalysisState state) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      child: Row(
        children: [
          _buildModeIcon(context, 'clinical', Icons.science_outlined, state.readingLevel == 'clinical'),
          _buildModeIcon(context, 'simplified', Icons.auto_awesome_outlined, state.readingLevel == 'simplified'),
          _buildModeIcon(context, 'dyslexia', Icons.visibility_outlined, state.readingLevel == 'dyslexia'),
          _buildModeIcon(context, 'child', Icons.child_care_outlined, state.readingLevel == 'child'),
        ],
      ),
    );
  }

  Widget _buildModeIcon(BuildContext context, String mode, IconData icon, bool isActive) {
    return IconButton(
      icon: Icon(icon, size: 16, color: isActive ? const Color(0xFF1C1C1C) : Colors.grey),
      onPressed: () => ref.read(analysisProvider.notifier).changeReadingLevel(mode),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      constraints: const BoxConstraints(),
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildContent(BuildContext context, AnalysisState state) {
    if (state.error != null) {
      return Center(
        child: Text(
          'Error: ${state.error}',
          style: const TextStyle(color: Colors.red),
        ),
      );
    }

    if (state.activeLens == AnalysisLens.ybocsScreener) {
      return const SizedBox(
        height: 600,
        child: YbocsScreenerWidget(),
      );
    }

    if (state.activeLens == AnalysisLens.research) {
      return const SizedBox(
        height: 600,
        child: ResearchTabWidget(
          hits: [
            ProteinHit(
              id: 'P01308',
              name: 'Insulin (INS)',
              identity: '98.5%',
              evalue: '1.2e-45',
            ),
            ProteinHit(
              id: 'P01009',
              name: 'Alpha-1-antitrypsin (SERPINA1)',
              identity: '91.2%',
              evalue: '3.4e-38',
            ),
          ],
        ),
      );
    }

    final activeReport = state.reports[state.activeLens];

    return Column(
      children: [
        if (state.activeLens == AnalysisLens.summaryOverview) ...[
          const CameraPulseWidget(),
          const SizedBox(height: 16),
          const Row(
            children: [
              Expanded(
                child: ClinicalGaugeWidget(
                  label: 'Certainty',
                  value: 8.5,
                  type: GaugeType.certainty,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: ClinicalGaugeWidget(
                  label: 'Stability',
                  value: 7.2,
                  type: GaugeType.stability,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Row(
            children: [
              Expanded(
                child: ClinicalTrendWidget(
                  label: 'Stability',
                  values: [5.0, 5.5, 6.2, 7.0, 7.2],
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: ClinicalTrendWidget(
                  label: 'Complexity',
                  values: [8.0, 7.5, 7.0, 6.8, 6.5],
                  lowerIsBetter: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
        if (state.activeLens == AnalysisLens.functionalProtocols || state.activeLens == AnalysisLens.ybocsScreener) ...[
          const TeledentistryOdontogramWidget(),
          const SizedBox(height: 16),
          const SkepticalEpistemologyCardWidget(),
          const SizedBox(height: 16),
          const MoodConsciousnessMatrixWidget(),
          const SizedBox(height: 16),
        ],
        if (activeReport == null || activeReport.isEmpty) ...[
          Center(
            child: Column(
              children: [
                const SizedBox(height: 16),
                Icon(Icons.analytics_outlined, size: 48, color: Colors.grey.shade300),
                const SizedBox(height: 12),
                Text(
                  state.isLoading
                      ? 'Analyzing patient data...'
                      : 'No AI analysis generated for this lens yet. Tap GENERATE above.',
                  style: TextStyle(color: Colors.grey.shade500),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ] else ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Text(
                  'EXPORT MODE:',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
                ),
                const SizedBox(width: 12),
                _buildModeChip('STD', ExportMode.standard),
                const SizedBox(width: 8),
                _buildModeChip('COG', ExportMode.cognition),
                const SizedBox(width: 8),
                _buildModeChip('PED', ExportMode.child),
              ],
            ),
          ),
          SummaryNodeWidget(
            title: state.activeLens.title,
            content: activeReport,
            status: VerificationStatus.verified,
            showChat: _isChatOpen,
            chatMessages: state.chatMessages,
            isChatLoading: state.isLoading && state.reports.isNotEmpty,
            onSendMessage: (msg) {
              ref.read(analysisProvider.notifier).askAgent(msg, context: activeReport);
            },
            onAskAgent: () {
              setState(() => _isChatOpen = !_isChatOpen);
            },
            onClearChat: () {
              ref.read(analysisProvider.notifier).clearChat();
              setState(() => _isChatOpen = false);
            },
            onExportFhir: () => _handleFhirExport(context),
          ),
        ],
      ],
    );
  }

  void _handleGenerate(BuildContext context) async {
    final patientState = ref.read(patientProvider);
    final issuesList = patientState.issues.values.expand((list) => list).map((i) => i.description).join(', ');
    final data = "Patient: ${patientState.name}\n"
        "Issues: ${issuesList.isNotEmpty ? issuesList : 'None reported'}\n"
        "Vitals: BP ${patientState.vitals.bp}, HR ${patientState.vitals.hr} bpm, Temp ${patientState.vitals.temp}, SpO2 ${patientState.vitals.spO2}%\n"
        "Goals: ${patientState.patientGoals}";
    
    final orcidService = ref.read(orcidServiceProvider);
    final orcidProfile = orcidService.profile;
    
    // Start AI Chat Session
    final intelService = ref.read(clinicalIntelligenceProvider);
    await intelService.startChatSession(data, orcidProfile: orcidProfile);
    
    // Generate Report
    if (context.mounted) {
      ref.read(analysisProvider.notifier).generateComprehensiveReport(data, orcidProfile: orcidProfile);
    }
  }

  void _handleExport(BuildContext context, AnalysisState state) {
    final patientState = ref.read(patientProvider);
    
    // Create a Patient object for the export
    final patient = Patient(
      id: 'p001',
      name: 'Current Patient',
      age: 45,
      gender: 'Unknown',
      lastVisit: 'Today',
      preexistingConditions: const [],
      patientGoals: patientState.patientGoals,
      vitals: patientState.vitals,
      issues: patientState.issues,
      history: const [],
      bookmarks: const [],
    );

    ref.read(exportServiceProvider).downloadAsPdf(
          patient: patient,
          reports: state.reports,
          mode: _exportMode,
        );
  }

  void _handleFhirExport(BuildContext context) {
    final patientState = ref.read(patientProvider);
    
    final patient = Patient(
      id: 'p001',
      name: 'Current Patient',
      age: 45,
      gender: 'Unknown',
      lastVisit: 'Today',
      preexistingConditions: const [],
      patientGoals: patientState.patientGoals,
      vitals: patientState.vitals,
      issues: patientState.issues,
    );

    ref.read(exportServiceProvider).exportToFhirBundle(patient);
  }

  Widget _buildModeChip(String label, ExportMode mode) {
    final isSelected = _exportMode == mode;
    return GestureDetector(
      onTap: () => setState(() => _exportMode = mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF416B1F) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.grey.shade600,
          ),
        ),
      ),
    );
  }
}

