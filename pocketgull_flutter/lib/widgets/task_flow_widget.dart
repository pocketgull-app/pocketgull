import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../models/patient_types.dart';

class TaskFlowWidget extends ConsumerStatefulWidget {
  const TaskFlowWidget({super.key});

  @override
  ConsumerState<TaskFlowWidget> createState() => _TaskFlowWidgetState();
}

class _TaskFlowWidgetState extends ConsumerState<TaskFlowWidget> {
  final TextEditingController _inputController = TextEditingController();

  void _submitNote() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    // In a real app, dispatch an AddClinicalNote event to PatientBloc
    // For now, we'll just clear the text to simulate
    _inputController.clear();
  }

  void _submitTask() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    // In a real app, dispatch an AddChecklistItem event to PatientBloc
    _inputController.clear();
  }

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientProvider);
    final notes = state.clinicalNotes ?? [];
    final tasks = state.checklist ?? [];

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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 16,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50.withValues(alpha: 0.5),
                  border: Border(
                    bottom: BorderSide(color: Colors.grey.shade100),
                  ),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ACTIVE TASK',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF416B1F),
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Clinical Tasks & Notes',
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF1C1C1C),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.green.shade100),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.circle, size: 8, color: Colors.green),
                              SizedBox(width: 4),
                              Text(
                                'LIVE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${notes.length} Notes • ${tasks.length} Tasks',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Content List
              Container(
                color: const Color(0xFFF9FAFB),
                padding: const EdgeInsets.all(24),
                child: notes.isEmpty && tasks.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.symmetric(vertical: 48),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.assignment_outlined,
                              size: 48,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'No notes or tasks yet.\nAdd items using the input below.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                                letterSpacing: 1.5,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          if (tasks.isNotEmpty) ...[
                            const Padding(
                              padding: EdgeInsets.only(bottom: 12.0, left: 4),
                              child: Text(
                                'TASKS',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey,
                                  letterSpacing: 2.0,
                                ),
                              ),
                            ),
                            ...tasks.map((task) => _buildTaskItem(context, task)),
                            const SizedBox(height: 24),
                          ],
                          if (notes.isNotEmpty) ...[
                            const Padding(
                              padding: EdgeInsets.only(bottom: 12.0, left: 4),
                              child: Text(
                                'NOTES',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey,
                                  letterSpacing: 2.0,
                                ),
                              ),
                            ),
                            ...notes.map((note) => _buildNoteItem(note)),
                          ],
                        ],
                      ),
              ),

              // Input Area
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Colors.grey.shade100)),
                  borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(12),
                  ),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _inputController,
                      maxLines: 4,
                      minLines: 1,
                      decoration: InputDecoration(
                        hintText: 'Type a clinical note or task...',
                        hintStyle: TextStyle(
                          color: Colors.grey.shade400,
                          fontSize: 14,
                        ),
                        filled: true,
                        fillColor: Colors.grey.shade50,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(
                            color: Color(0xFF416B1F),
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      onSubmitted: (_) => _submitTask(),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        OutlinedButton.icon(
                          onPressed: _submitNote,
                          icon: const Icon(Icons.note_add, size: 16),
                          label: const Text('ADD NOTE'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.grey.shade700,
                            side: BorderSide(color: Colors.grey.shade200),
                            backgroundColor: Colors.grey.shade100,
                            textStyle: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          onPressed: _submitTask,
                          icon: const Icon(
                            Icons.check_circle_outline,
                            size: 16,
                          ),
                          label: const Text('ADD TASK'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1C1C1C),
                            foregroundColor: Colors.white,
                            textStyle: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
  }

  Widget _buildTaskItem(BuildContext context, ChecklistItem task) {
    final bool isAdded = task.status == BracketingState.added;
    final bool isRemoved = task.status == BracketingState.removed;

    return GestureDetector(
      onDoubleTap: () {
        HapticFeedback.lightImpact();
        ref.read(patientProvider.notifier).toggleChecklistStatus(task.id);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isAdded 
              ? const Color(0xFFF1F8E9) 
              : (isRemoved ? Colors.grey.shade50 : Colors.white),
          border: Border.all(
            color: isAdded 
                ? const Color(0xFF76B362) 
                : (isRemoved ? Colors.grey.shade300 : Colors.grey.shade200),
            width: isAdded ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: isAdded ? [
            BoxShadow(
              color: const Color(0xFF76B362).withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 4),
            )
          ] : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Indicator
            Container(
              margin: const EdgeInsets.only(top: 2),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isAdded 
                    ? const Color(0xFF76B362) 
                    : (isRemoved ? Colors.grey.shade300 : Colors.white),
                border: Border.all(
                  color: isAdded 
                      ? const Color(0xFF76B362) 
                      : (isRemoved ? Colors.grey.shade300 : Colors.grey.shade300),
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isAdded ? Icons.check : (isRemoved ? Icons.close : null),
                size: 14,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.text,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isAdded ? FontWeight.bold : FontWeight.normal,
                      color: isRemoved ? Colors.grey : const Color(0xFF1C1C1C),
                      decoration: isRemoved ? TextDecoration.lineThrough : null,
                      height: 1.4,
                    ),
                  ),
                  if (isAdded) ...[
                    const SizedBox(height: 8),
                    const Row(
                      children: [
                        Text(
                          'ADDED TO PLAN',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF416B1F),
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ] else if (isRemoved) ...[
                    const SizedBox(height: 8),
                    const Text(
                      'DISMISSED',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoteItem(ClinicalNote note) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F8E9),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  note.sourceLens.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF416B1F),
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                onPressed: () {}, // Remove note
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            note.text,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1C1C1C),
              height: 1.5,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFFEEEEEE)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                note.date, // In a real app format Date
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                  letterSpacing: 1.5,
                ),
              ),
              const Row(
                children: [
                  Icon(Icons.check, size: 12, color: Colors.teal),
                  SizedBox(width: 4),
                  Text(
                    'LOGGED',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1C1C1C),
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
