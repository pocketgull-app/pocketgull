import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import 'box_breathing_wrapper.dart';
import 'history_timeline_widget.dart';
import '../models/patient_types.dart';
import '../services/dictation_service.dart';
import 'dictation_modal_widget.dart';

class IntakeFormWidget extends ConsumerStatefulWidget {
  const IntakeFormWidget({super.key});

  @override
  ConsumerState<IntakeFormWidget> createState() => _IntakeFormWidgetState();
}

class _IntakeFormWidgetState extends ConsumerState<IntakeFormWidget> {
  final TextEditingController _goalsController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _recController = TextEditingController();
  final DictationService _dictationService = DictationService();
  bool _isBreathingEnabled = true;

  @override
  void initState() {
    super.initState();
    final patientState = ref.read(patientProvider);
    _goalsController.text = patientState.patientGoals;
    _dictationService.initialize();
  }

  void _showDictationModal(BuildContext buttonContext, TextEditingController controller, String partId, BodyPartIssue note, List<BodyPartIssue> history) {
    final RenderBox button = buttonContext.findRenderObject() as RenderBox;
    final RenderBox overlay = Navigator.of(context).overlay!.context.findRenderObject() as RenderBox;
    final Offset offset = button.localToGlobal(Offset.zero, ancestor: overlay);

    // Format historical context
    String historicalContext = "";
    if (history.isNotEmpty) {
      historicalContext = history.where((n) => n.noteId != note.noteId && n.noteId != 'temp').map((n) {
        return "[Date: ${n.date ?? 'Unknown'}] Pain: ${n.painLevel}, Symptoms: ${n.description}";
      }).join("\n");
    }

    showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.1),
      builder: (context) {
        double leftPos = offset.dx - 360; 
        if (leftPos < 20) leftPos = 20;

        return Stack(
          children: [
            Positioned(
              left: leftPos,
              top: offset.dy + button.size.height + 8,
              child: Material(
                color: Colors.transparent,
                child: SizedBox(
                  width: 380,
                  child: DictationModalWidget(
                    dictationService: _dictationService,
                    partId: partId,
                    historicalContext: historicalContext,
                    onCancel: () {
                      _dictationService.cancelListening();
                      Navigator.pop(context);
                    },
                    onAccept: (text, aiResult) {
                      _handleDictationResult(text, aiResult, controller, partId, note);
                      Navigator.pop(context);
                    },
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
    
    _dictationService.startListening((text, isFinal) {
      // Optional: Real-time feedback
    });
  }

  void _handleDictationResult(String text, dynamic aiResult, TextEditingController controller, String partId, BodyPartIssue note) {
    final command = _dictationService.parseCommand(text);
    
    if (command != null) {
      switch (command.action) {
        case CommandAction.newNote:
          break;
        case CommandAction.switchAndNote:
          if (command.partId != null) {
            ref.read(patientProvider.notifier).selectPart(command.partId!);
          }
          break;
        case CommandAction.setPain:
          if (command.value is int) {
             final updatedNote = BodyPartIssue(
                id: note.id,
                noteId: note.noteId,
                name: note.name,
                painLevel: command.value,
                description: note.description,
                symptoms: note.symptoms,
                recommendation: note.recommendation,
                date: note.date,
              );
              ref.read(patientProvider.notifier).updateIssue(note.id, updatedNote);
          }
          break;
      }
      return;
    }

    // Default: Append text to controller
    final currentText = controller.text;
    final newText = currentText.isEmpty ? text : '$currentText $text';
    controller.text = newText;
    
    // If AI extracted data, use it!
    int resolvedPainLevel = note.painLevel;
    String resolvedRecs = note.recommendation ?? '';
    String? resolvedTrajectory = note.trajectory;
    String? resolvedDeltaSummary = note.deltaSummary;
    bool resolvedEscalationFlag = note.escalationFlag;
    
    if (aiResult != null) {
      if (aiResult.painLevel != null) resolvedPainLevel = aiResult.painLevel;
      if (aiResult.recommendations != null) {
        resolvedRecs = (resolvedRecs.isEmpty) ? aiResult.recommendations : '$resolvedRecs ${aiResult.recommendations}';
        _recController.text = resolvedRecs;
      }
      if (aiResult.trajectory != null) resolvedTrajectory = aiResult.trajectory;
      if (aiResult.deltaSummary != null) resolvedDeltaSummary = aiResult.deltaSummary;
      if (aiResult.escalationFlag != null) resolvedEscalationFlag = aiResult.escalationFlag;
    }

    // Trigger bloc update
    final updatedNote = BodyPartIssue(
      id: note.id,
      noteId: note.noteId,
      name: note.name,
      painLevel: resolvedPainLevel,
      description: controller == _descController ? newText : note.description,
      symptoms: note.symptoms,
      recommendation: controller == _recController ? newText : resolvedRecs,
      date: note.date,
      trajectory: resolvedTrajectory,
      deltaSummary: resolvedDeltaSummary,
      escalationFlag: resolvedEscalationFlag,
    );
    ref.read(patientProvider.notifier).updateIssue(note.id, updatedNote);
  }

  Widget _buildTrajectoryAlert(BodyPartIssue note) {
    if (note.trajectory == null) return const SizedBox.shrink();

    Color bgColor = Colors.blue.shade50;
    Color iconColor = Colors.blue;
    IconData icon = Icons.info_outline;

    if (note.trajectory == 'rapidly_escalating' || note.escalationFlag) {
      bgColor = Colors.red.shade50;
      iconColor = Colors.red;
      icon = Icons.warning_amber_rounded;
    } else if (note.trajectory == 'gradually_worsening') {
      bgColor = Colors.orange.shade50;
      iconColor = Colors.orange;
      icon = Icons.trending_up;
    } else if (note.trajectory == 'improving') {
      bgColor = Colors.green.shade50;
      iconColor = Colors.green;
      icon = Icons.trending_down;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: iconColor.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'TRAJECTORY: ${note.trajectory!.replaceAll('_', ' ').toUpperCase()}',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: iconColor,
                    letterSpacing: 1.0,
                  ),
                ),
                if (note.deltaSummary != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    note.deltaSummary!,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.black87,
                      height: 1.3,
                    ),
                  ),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PATIENT INTAKE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF689F38),
                        letterSpacing: 2.0,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Chief Complaint & Goals',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF1C1C1C),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  const Text(
                    'BREATHING UX',
                    style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey),
                  ),
                  Switch(
                    value: _isBreathingEnabled,
                    onChanged: (val) => setState(() => _isBreathingEnabled = val),
                    activeThumbColor: const Color(0xFF689F38),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Patient Goals',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF4B5563),
            ),
          ),
          const SizedBox(height: 8),
          BoxBreathingWrapper(
            isBreathing: _isBreathingEnabled,
            child: TextField(
              controller: _goalsController,
              maxLines: 4,
              onChanged: (value) {
                ref.read(patientProvider.notifier).updateGoals(value);
              },
              decoration: _inputDecoration('Enter patient goals or symptoms...'),
            ),
          ),
          const SizedBox(height: 32),
          
          Consumer(
            builder: (context, ref, child) {
              final state = ref.watch(patientProvider);
              if (state.selectedPartId == null) {
                return _buildEmptyState();
              }
              
              final selectedPartId = state.selectedPartId!;
              final issues = state.issues[selectedPartId] ?? [];
              final currentNote = issues.firstWhere(
                (i) => i.noteId == state.selectedNoteId, 
                orElse: () => issues.isNotEmpty ? issues.first : BodyPartIssue(
                  id: selectedPartId, 
                  noteId: 'temp', 
                  name: selectedPartId.toUpperCase(), 
                  painLevel: 0, 
                  description: '', 
                  symptoms: const []
                )
              );

              // Update controllers if note changed
              if (_descController.text != currentNote.description) {
                _descController.text = currentNote.description;
              }
              if (_recController.text != (currentNote.recommendation ?? '')) {
                _recController.text = currentNote.recommendation ?? '';
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAssessmentHeader(state, currentNote),
                  const SizedBox(height: 16),
                  _buildTrajectoryAlert(currentNote),
                  const SizedBox(height: 8),
                  _buildPainSection(currentNote),
                  const SizedBox(height: 24),
                  _buildObservationsSection(currentNote, issues),
                  const SizedBox(height: 24),
                  _buildRecommendationsSection(currentNote, issues),
                  const SizedBox(height: 32),
                  HistoryTimelineWidget(partId: selectedPartId),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.all(16),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 48),
          Icon(Icons.person_pin_circle_outlined, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text(
            'Select a body part to begin assessment',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  Widget _buildAssessmentHeader(PatientState state, BodyPartIssue note) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                note.date == null ? 'ACTIVE INPUT' : 'HISTORICAL RECORD',
                style: const TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF416B1F),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                note.name,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1C1C1C),
                ),
              ),
            ],
          ),
          if (note.date == null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'LIVE',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPainSection(BodyPartIssue note) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'PAIN SEVERITY',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2),
            ),
            Text(
              '${note.painLevel}/10',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w300, color: Color(0xFF1C1C1C)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SliderTheme(
          data: SliderThemeData(
            trackHeight: 6,
            activeTrackColor: _getPainColor(note.painLevel),
            inactiveTrackColor: Colors.grey.shade100,
            thumbColor: Colors.white,
            overlayColor: _getPainColor(note.painLevel).withValues(alpha: 0.2),
            valueIndicatorColor: _getPainColor(note.painLevel),
            valueIndicatorTextStyle: const TextStyle(color: Colors.white),
          ),
          child: Slider(
            value: note.painLevel.toDouble(),
            min: 0,
            max: 10,
            divisions: 10,
            label: note.painLevel.toString(),
            onChanged: (value) {
              final updatedNote = BodyPartIssue(
                id: note.id,
                noteId: note.noteId,
                name: note.name,
                painLevel: value.toInt(),
                description: note.description,
                symptoms: note.symptoms,
                recommendation: note.recommendation,
                date: note.date,
              );
              ref.read(patientProvider.notifier).updateIssue(note.id, updatedNote);
            },
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('None', style: TextStyle(fontSize: 9, color: Colors.grey)),
              Text('Moderate', style: TextStyle(fontSize: 9, color: Colors.grey)),
              Text('Severe', style: TextStyle(fontSize: 9, color: Colors.grey)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildObservationsSection(BodyPartIssue note, List<BodyPartIssue> history) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'INTEGRATIVE OBSERVATIONS',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2),
        ),
        const SizedBox(height: 8),
        BoxBreathingWrapper(
          isBreathing: _isBreathingEnabled && note.date == null,
          child: TextField(
            controller: _descController,
            maxLines: 5,
            onChanged: (value) {
              final updatedNote = BodyPartIssue(
                id: note.id,
                noteId: note.noteId,
                name: note.name,
                painLevel: note.painLevel,
                description: value,
                symptoms: note.symptoms,
                recommendation: note.recommendation,
                date: note.date,
                trajectory: note.trajectory,
                deltaSummary: note.deltaSummary,
                escalationFlag: note.escalationFlag,
              );
              ref.read(patientProvider.notifier).updateIssue(note.id, updatedNote);
            },
            decoration: _inputDecoration('Describe symptoms, triggers, and observations...').copyWith(
              suffixIcon: Builder(
                builder: (btnContext) => IconButton(
                  icon: const Icon(Icons.mic_none, size: 18, color: Color(0xFF689F38)),
                  onPressed: () => _showDictationModal(btnContext, _descController, note.id, note, history),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendationsSection(BodyPartIssue note, List<BodyPartIssue> history) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'RECOMMENDATIONS',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _recController,
          maxLines: 3,
          onChanged: (value) {
            final updatedNote = BodyPartIssue(
              id: note.id,
              noteId: note.noteId,
              name: note.name,
              painLevel: note.painLevel,
              description: note.description,
              symptoms: note.symptoms,
              recommendation: value,
              date: note.date,
              trajectory: note.trajectory,
              deltaSummary: note.deltaSummary,
              escalationFlag: note.escalationFlag,
            );
            ref.read(patientProvider.notifier).updateIssue(note.id, updatedNote);
          },
          decoration: _inputDecoration('Suggested treatments, referrals, or next steps...').copyWith(
            suffixIcon: Builder(
              builder: (btnContext) => IconButton(
                icon: const Icon(Icons.mic_none, size: 18, color: Color(0xFF689F38)),
                onPressed: () => _showDictationModal(btnContext, _recController, note.id, note, history),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Color _getPainColor(int level) {
    if (level <= 3) return Colors.green;
    if (level <= 6) return Colors.orange;
    return Colors.red;
  }
}
