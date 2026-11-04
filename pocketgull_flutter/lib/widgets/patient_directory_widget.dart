import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';
import '../providers/patient_management_provider.dart';

/// Patient directory — roster of all patients.
///
/// Flutter parity with Angular `patient-directory.component.ts`.
/// Displays a searchable, sortable list of patients with triage color coding.

class PatientDirectoryWidget extends ConsumerStatefulWidget {
  final void Function(Patient patient)? onPatientSelected;

  const PatientDirectoryWidget({super.key, this.onPatientSelected});

  @override
  ConsumerState<PatientDirectoryWidget> createState() => _PatientDirectoryWidgetState();
}

class _PatientDirectoryWidgetState extends ConsumerState<PatientDirectoryWidget> {
  String _searchQuery = '';
  String _sortBy = 'name'; // name, triageScore, lastVisit
  bool _sortAscending = true;

  @override
  Widget build(BuildContext context) {
    final patientsAsync = ref.watch(patientManagementProvider);

    return patientsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(
        child: Text('Failed to load patients: $err',
            style: TextStyle(color: Theme.of(context).colorScheme.error)),
      ),
      data: (patients) => _buildDirectory(context, patients),
    );
  }

  Widget _buildDirectory(BuildContext context, List<Patient> patients) {
    final filtered = patients.where((p) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return p.name.toLowerCase().contains(q) ||
          p.preexistingConditions.any((c) => c.toLowerCase().contains(q));
    }).toList();

    // Sort
    filtered.sort((a, b) {
      int result;
      switch (_sortBy) {
        case 'triageScore':
          result = a.triageScore.compareTo(b.triageScore);
          break;
        case 'lastVisit':
          result = a.lastVisit.compareTo(b.lastVisit);
          break;
        default:
          result = a.name.compareTo(b.name);
      }
      return _sortAscending ? result : -result;
    });

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search patients...',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Theme.of(context).colorScheme.surfaceContainerHighest,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
            onChanged: (v) => setState(() => _searchQuery = v),
          ),
        ),
        // Sort controls
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              Text('Sort by: ', style: Theme.of(context).textTheme.bodySmall),
              ChoiceChip(
                label: const Text('Name'),
                selected: _sortBy == 'name',
                onSelected: (_) => setState(() {
                  _sortAscending = _sortBy == 'name' ? !_sortAscending : true;
                  _sortBy = 'name';
                }),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Triage'),
                selected: _sortBy == 'triageScore',
                onSelected: (_) => setState(() {
                  _sortAscending = _sortBy == 'triageScore' ? !_sortAscending : false;
                  _sortBy = 'triageScore';
                }),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Last Visit'),
                selected: _sortBy == 'lastVisit',
                onSelected: (_) => setState(() {
                  _sortAscending = _sortBy == 'lastVisit' ? !_sortAscending : false;
                  _sortBy = 'lastVisit';
                }),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        // Patient list
        Expanded(
          child: filtered.isEmpty
              ? Center(
                  child: Text(
                    patients.isEmpty ? 'No patients in roster' : 'No matches found',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                )
              : ListView.builder(
                  itemCount: filtered.length,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemBuilder: (context, index) {
                    final patient = filtered[index];
                    return _PatientCard(
                      patient: patient,
                      onTap: () => widget.onPatientSelected?.call(patient),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _PatientCard extends StatelessWidget {
  final Patient patient;
  final VoidCallback? onTap;

  const _PatientCard({required this.patient, this.onTap});

  Color _kaizenColor(BuildContext context) {
    switch (patient.kaizenColor) {
      case 'red':
        return Colors.red.shade400;
      case 'yellow':
        return Colors.amber.shade400;
      case 'green':
      default:
        return Colors.green.shade400;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Triage color indicator
              Container(
                width: 4,
                height: 48,
                decoration: BoxDecoration(
                  color: _kaizenColor(context),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 12),
              // Patient info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      patient.name,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${patient.age}y • ${patient.gender} • Last: ${patient.lastVisit}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                ),
              ),
              // Triage score badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _kaizenColor(context).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${patient.triageScore}',
                  style: TextStyle(
                    color: _kaizenColor(context),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
