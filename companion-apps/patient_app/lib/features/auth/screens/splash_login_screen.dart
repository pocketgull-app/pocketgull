import 'package:flutter/material.dart';
import '../../../shared/widgets/origami_seagull.dart';
import '../../dashboard/screens/patient_dashboard.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/patient.dart';

class SplashLoginScreen extends StatefulWidget {
  const SplashLoginScreen({super.key});

  @override
  State<SplashLoginScreen> createState() => _SplashLoginScreenState();
}

class _SplashLoginScreenState extends State<SplashLoginScreen> {
  final ApiClient _apiClient = ApiClient();
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _delegationCodeController = TextEditingController();
  bool _obscureText = true;
  List<Patient> _patients = [];
  bool _loadingPatients = true;

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  Future<void> _loadPatients() async {
    setState(() => _loadingPatients = true);
    final data = await _apiClient.fetchPatients();
    if (mounted) {
      setState(() {
        if (data.isNotEmpty) {
          _patients = data.map((json) => Patient.fromJson(json)).toList();
        } else {
          _patients = [
            Patient(
              id: 'p001',
              name: 'Homo Sapiens (Male, 58y)',
              age: 58,
              gender: 'Male',
              lastVisit: '2026-06-25',
              preexistingConditions: ['Metabolic Syndrome', 'Hypertension', 'Elevated HRV Stress'],
              state: PatientState.fromJson({
                'symptoms': ['Mild Brain Fog', 'Joint Stiffness', 'Fatigue'],
                'vitals': {'bp': '152/95', 'hr': 88, 'spO2': 94},
                'patientGoals': 'Optimize cardiovascular resilience, reduce stress through AVS therapy.',
              }),
            ),
            Patient(
              id: 'p002',
              name: 'Homo Sapiens (Female, 34y)',
              age: 34,
              gender: 'Female',
              lastVisit: '2026-07-12',
              preexistingConditions: ['Neurological Lyme', 'Cognitive Localization'],
              state: PatientState.fromJson({
                'symptoms': ['Executive Function Lag', 'Visual Fatigue'],
                'vitals': {'bp': '118/76', 'hr': 72, 'spO2': 99},
                'patientGoals': 'Theta / Alpha neuro-entrainment protocol for focus recovery.',
              }),
            ),
          ];
        }
        _loadingPatients = false;
      });
    }
  }

  @override
  void dispose() {
    _apiKeyController.dispose();
    _delegationCodeController.dispose();
    super.dispose();
  }

  void _submitApiKey() {
    final enteredCode = _delegationCodeController.text.trim().toLowerCase();
    final codeToMatch = enteredCode.isEmpty ? 'p001' : enteredCode;

    Patient? matchedPatient;
    for (final p in _patients) {
      if (p.id.toLowerCase() == codeToMatch || (codeToMatch == 'demo' || codeToMatch == 'test' || codeToMatch == 'avs')) {
        matchedPatient = p;
        break;
      }
    }

    if (matchedPatient == null && _patients.isNotEmpty) {
      matchedPatient = _patients.first;
    }

    if (matchedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid delegation code. Try p001 or demo.')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Entering Care Plan for ${matchedPatient.name}...')),
    );
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => PatientDashboard(patient: matchedPatient!)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color borderColor = isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7);
    final Color textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final Color subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final bool isWatch = screenWidth < 240 || screenHeight < 320;
    final bool isSmallPhone = screenWidth < 360 || screenHeight < 640;

    final double mascotHeight = isWatch ? 70.0 : (isSmallPhone ? 120.0 : 180.0);
    final double titleFontSize = isWatch ? 14.0 : (isSmallPhone ? 18.0 : 24.0);
    final double subtitleFontSize = isWatch ? 8.0 : (isSmallPhone ? 10.0 : 12.0);
    final double spacingMascotToTitle = isWatch ? 8.0 : 16.0;
    final double spacingTitleToFields = isWatch ? 12.0 : (isSmallPhone ? 24.0 : 40.0);
    final double horizontalPadding = isWatch ? 12.0 : 24.0;
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF18181B) : Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Origami Seagull emerging from 'pocket'
                SizedBox(
                  height: mascotHeight,
                  child: const ClipRect(
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: OrigamiSeagull(),
                    ),
                  ),
                ),
                
                SizedBox(height: spacingMascotToTitle),
                
                Text(
                  'POCKET GULL',
                  style: TextStyle(
                    fontSize: titleFontSize,
                    fontWeight: FontWeight.bold,
                    letterSpacing: isWatch ? 2.0 : 4.0,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'PATIENT CARE PLAN PORTAL',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: subtitleFontSize,
                    letterSpacing: isWatch ? 1.5 : 2.5,
                    color: subColor,
                  ),
                ),
                
                SizedBox(height: spacingTitleToFields),
                
                if (!isWatch) ...[
                  Text(
                    'Access your clinical care plan and sync biometrics securely.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: isSmallPhone ? 12 : 14,
                      color: subColor,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // API Key Field
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: Text(
                      'GEMINI API KEY',
                      style: TextStyle(fontSize: isWatch ? 8 : 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: subColor),
                    ),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: borderColor),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _apiKeyController,
                          obscureText: _obscureText,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: isWatch ? 10 : 12,
                            color: isDark ? const Color(0xFFF4F4F5) : const Color(0xFF27272A),
                          ),
                          onSubmitted: (_) => _submitApiKey(),
                          decoration: InputDecoration(
                            hintText: 'Paste Gemini API key',
                            hintStyle: TextStyle(
                              fontSize: isWatch ? 10 : 12,
                              color: isDark ? const Color(0xFF52525B) : const Color(0xFFD1D5DB),
                            ),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: isWatch ? 8 : 12),
                          ),
                        ),
                      ),
                      IconButton(
                        iconSize: isWatch ? 16 : 20,
                        icon: Icon(
                          _obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: subColor,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureText = !_obscureText;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: isWatch ? 10 : 16),

                // Patient Delegation Code
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: Text(
                      'PATIENT DELEGATION CODE',
                      style: TextStyle(fontSize: isWatch ? 8 : 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: subColor),
                    ),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: borderColor),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: TextField(
                    controller: _delegationCodeController,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: isWatch ? 10 : 12,
                      color: isDark ? const Color(0xFFF4F4F5) : const Color(0xFF27272A),
                    ),
                    onSubmitted: (_) => _submitApiKey(),
                    decoration: InputDecoration(
                      hintText: 'e.g. p001',
                      hintStyle: TextStyle(
                        fontSize: isWatch ? 10 : 12,
                        color: isDark ? const Color(0xFF52525B) : const Color(0xFFD1D5DB),
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: isWatch ? 8 : 12),
                    ),
                  ),
                ),

                SizedBox(height: isWatch ? 16 : 24),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: textColor,
                      foregroundColor: isDark ? const Color(0xFF18181B) : Colors.white,
                      padding: EdgeInsets.symmetric(vertical: isWatch ? 10 : 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    onPressed: _submitApiKey,
                    child: Text(
                      'ACCESS CARE PLAN',
                      style: TextStyle(
                        fontSize: isWatch ? 10 : 12,
                        letterSpacing: 2.0, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
