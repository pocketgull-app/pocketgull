import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../providers/services_providers.dart';
import '../models/patient_types.dart';
import 'home_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  String _searchQuery = '';
  List<Patient> _patients = [];
  bool _isLoading = true;
  bool _showNewModal = false;

  final _nameController = TextEditingController();
  final _ageController = TextEditingController();
  String _selectedGender = 'Male';
  final _goalsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadRoster();
  }

  Future<void> _loadRoster() async {
    setState(() => _isLoading = true);
    final service = ref.read(patientManagementProvider);
    final roster = await service.loadPatients();
    setState(() {
      _patients = roster;
      _isLoading = false;
    });
  }

  void _saveNewPatient() async {
    if (_nameController.text.isEmpty || _ageController.text.isEmpty) return;

    final newPatient = Patient(
      id: 'p_${DateTime.now().millisecondsSinceEpoch}',
      name: _nameController.text,
      age: int.tryParse(_ageController.text) ?? 30,
      gender: _selectedGender,
      lastVisit: DateTime.now().toIso8601String().split('T')[0].replaceAll('-', '.'),
      preexistingConditions: const [],
      patientGoals: _goalsController.text,
      vitals: const PatientVitals(bp: '120/80', hr: '72', temp: '98.6F', weight: '150 lbs', spO2: '98', height: ''),
      issues: const {},
    );

    final updated = [..._patients, newPatient];
    await ref.read(patientManagementProvider).savePatients(updated);

    setState(() {
      _patients = updated;
      _showNewModal = false;
      _nameController.clear();
      _ageController.clear();
      _goalsController.clear();
    });
  }

  void _selectPatient(Patient patient) {
    ref.read(patientProvider.notifier).loadPatient(patient);

    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (context) => const HomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _patients.where((p) {
      final query = _searchQuery.toLowerCase();
      return p.name.toLowerCase().contains(query) || p.id.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Clinical Roster',
          style: TextStyle(color: Color(0xFF1C1C1C), fontWeight: FontWeight.bold, fontSize: 22),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.grey),
            onPressed: _loadRoster,
          ),
          ElevatedButton.icon(
            onPressed: () => setState(() => _showNewModal = true),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('NEW PATIENT'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C1C),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Search Input
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    hintText: 'Search by name or ID...',
                    filled: true,
                    fillColor: const Color(0xFFF3F4F6),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : GridView.builder(
                        padding: const EdgeInsets.all(24),
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 350,
                          childAspectRatio: 1.4,
                          crossAxisSpacing: 20,
                          mainAxisSpacing: 20,
                        ),
                        itemCount: filtered.length,
                        itemBuilder: (context, idx) {
                          final patient = filtered[idx];
                          final isHighRisk = patient.triageScore > 10;
                          return InkWell(
                            onTap: () => _selectPatient(patient),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isHighRisk ? Colors.red.shade300 : Colors.grey.shade200,
                                  width: isHighRisk ? 2.0 : 1.0,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.02),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          patient.name,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1C1C1C),
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (isHighRisk)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.red.shade50,
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: const Text(
                                            'RISK',
                                            style: TextStyle(
                                              color: Colors.red,
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    '${patient.age} y/o • ${patient.gender}',
                                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                                  ),
                                  const SizedBox(height: 12),
                                  Expanded(
                                    child: Text(
                                      patient.patientGoals.isNotEmpty
                                          ? patient.patientGoals
                                          : 'No active complain details provided.',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade600,
                                        height: 1.4,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const Divider(height: 16),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'BP: ${patient.vitals.bp}',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                                      ),
                                      Text(
                                        'HR: ${patient.vitals.hr} bpm',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
          if (_showNewModal)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.4),
                child: Center(
                  child: Container(
                    width: 450,
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 20,
                        )
                      ],
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Create New Patient',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close),
                                onPressed: () => setState(() => _showNewModal = false),
                              )
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text('Full Name', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _nameController,
                            decoration: const InputDecoration(
                              filled: true,
                              fillColor: Color(0xFFF3F4F6),
                              border: OutlineInputBorder(borderSide: BorderSide.none),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Age', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                                    const SizedBox(height: 6),
                                    TextField(
                                      controller: _ageController,
                                      keyboardType: TextInputType.number,
                                      decoration: const InputDecoration(
                                        filled: true,
                                        fillColor: Color(0xFFF3F4F6),
                                        border: OutlineInputBorder(borderSide: BorderSide.none),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Gender', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                                    const SizedBox(height: 6),
                                    DropdownButtonFormField<String>(
                                      initialValue: _selectedGender,
                                      decoration: const InputDecoration(
                                        filled: true,
                                        fillColor: Color(0xFFF3F4F6),
                                        border: OutlineInputBorder(borderSide: BorderSide.none),
                                      ),
                                      items: const [
                                        DropdownMenuItem(value: 'Male', child: Text('Male')),
                                        DropdownMenuItem(value: 'Female', child: Text('Female')),
                                        DropdownMenuItem(value: 'Other', child: Text('Other')),
                                      ],
                                      onChanged: (val) => setState(() => _selectedGender = val ?? 'Male'),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text('Primary Complaint / Goals', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _goalsController,
                            maxLines: 3,
                            decoration: const InputDecoration(
                              filled: true,
                              fillColor: Color(0xFFF3F4F6),
                              border: OutlineInputBorder(borderSide: BorderSide.none),
                              hintText: 'What is the primary reason for the visit today?',
                            ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton(
                                onPressed: () => setState(() => _showNewModal = false),
                                child: const Text('Cancel', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(width: 16),
                              ElevatedButton(
                                onPressed: _saveNewPatient,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1C1C1C),
                                  foregroundColor: Colors.white,
                                ),
                                child: const Text('Create Chart'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
