import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../providers/services_providers.dart';
import '../widgets/lean/lean_care_plan_tab.dart';
import '../widgets/lean/lean_vitals_tab.dart';
import '../widgets/lean/lean_consult_tab.dart';
import '../widgets/lean/lean_medical_id_tab.dart';

/// Pocket-Gull Mobile Companion Home Screen.
/// Clean, focused 4-tab navigation shell delivering immediate clinical clarity:
/// 1. Today (Care Plan & Actions)
/// 2. Vitals & Symptoms (Biometrics & Body Logger)
/// 3. Consult (AI Clinical Co-Pilot)
/// 4. Medical ID (Offline Emergency ID & Lean-QR FHIR R4)
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedTabIndex = 0;

  @override
  void initState() {
    super.initState();
    // Proactively initialize default patient if empty
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final patientService = ref.read(patientManagementProvider);
      final patients = await patientService.loadPatients();
      if (patients.isNotEmpty && mounted) {
        final current = ref.read(patientProvider);
        if (current.name.isEmpty || current.name == 'Selected Patient') {
          ref.read(patientProvider.notifier).loadPatient(patients.first);
        }
      }
    });
  }

  void _showPatientSwitcherModal(BuildContext context) async {
    final patientService = ref.read(patientManagementProvider);
    final patients = await patientService.loadPatients();

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.switch_account, size: 20, color: Color(0xFF047857)),
                    SizedBox(width: 8),
                    Text(
                      'SELECT PATIENT PROFILE',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.1,
                        color: Color(0xFF111827),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 8),
                ...patients.map((p) {
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFF047857),
                      child: Text(
                        p.name.isNotEmpty ? p.name[0] : 'P',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: Text(
                      p.name,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${p.age}y ${p.gender} • ${p.preexistingConditions.isNotEmpty ? p.preexistingConditions.first : "Healthy Baseline"}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                    ),
                    onTap: () {
                      ref.read(patientProvider.notifier).loadPatient(p);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Switched profile to ${p.name}'),
                          backgroundColor: const Color(0xFF047857),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(patientProvider);
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width > 800;

    final String patientName = (state.name.isNotEmpty && state.name != 'Selected Patient')
        ? state.name
        : 'Active Patient';

    final tabs = [
      const LeanCarePlanTab(),
      const LeanVitalsTab(),
      const LeanConsultTab(),
      const LeanMedicalIdTab(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        toolbarHeight: 64,
        elevation: 0,
        backgroundColor: Colors.white,
        titleSpacing: 16,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE5E7EB), height: 1.0),
        ),
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF047857),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.spa, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'POCKET-GULL',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.0,
                    color: Color(0xFF111827),
                  ),
                ),
                Text(
                  'CLINICAL COMPANION',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Profile Switcher Chip
          InkWell(
            onTap: () => _showPatientSwitcherModal(context),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.account_circle, size: 16, color: Color(0xFF047857)),
                  const SizedBox(width: 6),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 110),
                    child: Text(
                      patientName,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_drop_down, size: 14, color: Color(0xFF6B7280)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Offline Ready Indicator Badge
          Container(
            padding: const EdgeInsets.all(6),
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: const Tooltip(
              message: 'Offline Local Database Ready (Hive/FHIR)',
              child: Icon(Icons.offline_pin, size: 16, color: Color(0xFF047857)),
            ),
          ),
        ],
      ),
      body: isDesktop
          ? Row(
              children: [
                NavigationRail(
                  selectedIndex: _selectedTabIndex,
                  onDestinationSelected: (index) => setState(() => _selectedTabIndex = index),
                  labelType: NavigationRailLabelType.all,
                  selectedLabelTextStyle: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF047857),
                    letterSpacing: 0.8,
                  ),
                  unselectedLabelTextStyle: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF6B7280),
                  ),
                  selectedIconTheme: const IconThemeData(color: Color(0xFF047857)),
                  destinations: const [
                    NavigationRailDestination(
                      icon: Icon(Icons.calendar_today_outlined),
                      selectedIcon: Icon(Icons.calendar_today),
                      label: Text('TODAY'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.monitor_heart_outlined),
                      selectedIcon: Icon(Icons.monitor_heart),
                      label: Text('VITALS'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.chat_bubble_outline),
                      selectedIcon: Icon(Icons.chat_bubble),
                      label: Text('CONSULT'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.qr_code_2_outlined),
                      selectedIcon: Icon(Icons.qr_code_2),
                      label: Text('MEDICAL ID'),
                    ),
                  ],
                ),
                const VerticalDivider(width: 1, color: Color(0xFFE5E7EB)),
                Expanded(child: tabs[_selectedTabIndex]),
              ],
            )
          : tabs[_selectedTabIndex],
      bottomNavigationBar: isDesktop
          ? null
          : Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE5E7EB), width: 1.0)),
              ),
              child: BottomNavigationBar(
                currentIndex: _selectedTabIndex,
                onTap: (index) => setState(() => _selectedTabIndex = index),
                backgroundColor: Colors.white,
                elevation: 0,
                selectedItemColor: const Color(0xFF047857),
                unselectedItemColor: const Color(0xFF6B7280),
                selectedFontSize: 11,
                unselectedFontSize: 11,
                selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
                type: BottomNavigationBarType.fixed,
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.calendar_today_outlined, size: 20),
                    activeIcon: Icon(Icons.calendar_today, size: 20),
                    label: 'TODAY',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.monitor_heart_outlined, size: 20),
                    activeIcon: Icon(Icons.monitor_heart, size: 20),
                    label: 'VITALS',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.chat_bubble_outline, size: 20),
                    activeIcon: Icon(Icons.chat_bubble, size: 20),
                    label: 'CONSULT',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.qr_code_2_outlined, size: 20),
                    activeIcon: Icon(Icons.qr_code_2, size: 20),
                    label: 'MEDICAL ID',
                  ),
                ],
              ),
            ),
    );
  }
}
