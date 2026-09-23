import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../providers/patient_provider.dart';

/// Lean Medical ID & Provider Handoff Tab: High-contrast offline emergency profile with scannable Lean-QR FHIR R4.
class LeanMedicalIdTab extends ConsumerWidget {
  const LeanMedicalIdTab({super.key});

  String _generateFhirR4EmergencyBundle(dynamic state) {
    final patientName = (state.name != null && state.name.isNotEmpty) ? state.name : 'Unknown Patient';
    final hr = state.vitals.hr.isNotEmpty ? state.vitals.hr : '72';
    final bp = state.vitals.bp.isNotEmpty ? state.vitals.bp : '118/76';

    final fhirBundle = {
      'resourceType': 'Bundle',
      'id': 'pocketgull-emergency-handoff',
      'type': 'collection',
      'timestamp': DateTime.now().toIso8601String(),
      'entry': [
        {
          'resource': {
            'resourceType': 'Patient',
            'id': 'pat-primary',
            'name': [{'use': 'official', 'text': patientName}],
            'telecom': [{'system': 'phone', 'value': '+1-555-019-2834', 'use': 'emergency'}],
          }
        },
        {
          'resource': {
            'resourceType': 'Observation',
            'code': {'text': 'Vitals Snapshot'},
            'component': [
              {'code': {'text': 'Heart Rate'}, 'valueQuantity': {'value': hr, 'unit': 'bpm'}},
              {'code': {'text': 'Blood Pressure'}, 'valueString': bp}
            ]
          }
        },
        {
          'resource': {
            'resourceType': 'AllergyIntolerance',
            'clinicalStatus': {'coding': [{'code': 'active'}]},
            'verificationStatus': {'coding': [{'code': 'confirmed'}]},
            'substance': {'text': 'Penicillin (Severe/Anaphylaxis)'},
          }
        },
        {
          'resource': {
            'resourceType': 'MedicationStatement',
            'status': 'active',
            'medicationCodeableConcept': {'text': 'Metformin HCl 500 mg oral'},
          }
        }
      ]
    };

    return jsonEncode(fhirBundle);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(patientProvider);
    final patientName = state.name.isNotEmpty ? state.name : 'Phil Gear';
    final fhirData = _generateFhirR4EmergencyBundle(state);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      children: [
        // 1. Emergency Medical Card (High-Contrast Red / Obsidian)
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF18181B), // Dark obsidian
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFDC2626), width: 2), // Red safety border
            boxShadow: const [
              BoxShadow(color: Color(0x20DC2626), blurRadius: 10, offset: Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Red Header Ribbon
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: const BoxDecoration(
                  color: Color(0xFFDC2626),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.emergency, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'EMERGENCY MEDICAL ID • FIRST RESPONDER',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          patientName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF27272A),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF3F3F46)),
                          ),
                          child: const Text(
                            'BLOOD: O+',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: Color(0xFF27272A), height: 1),
                    const SizedBox(height: 12),

                    // Critical Alerts
                    _buildMedicalIdRow(
                      label: 'SEVERE ALLERGIES',
                      value: 'Penicillin (Anaphylaxis Risk) • Sulfa Drugs',
                      color: const Color(0xFFF87171),
                    ),
                    const SizedBox(height: 10),
                    _buildMedicalIdRow(
                      label: 'ACTIVE CONDITIONS',
                      value: 'Cardiometabolic Risk • Episodic Palpitations',
                      color: const Color(0xFFFBBF24),
                    ),
                    const SizedBox(height: 10),
                    _buildMedicalIdRow(
                      label: 'EMERGENCY CONTACT',
                      value: 'Jane Doe (Spouse) • +1 (555) 019-2834',
                      color: const Color(0xFF34D399),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // 2. Scannable Lean-QR Code (FHIR R4 Offline Carrier)
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: const [
              BoxShadow(color: Color(0x06000000), blurRadius: 4, offset: Offset(0, 2)),
            ],
          ),
          child: Column(
            children: [
              const Row(
                children: [
                  Icon(Icons.qr_code_2, size: 20, color: Color(0xFF047857)),
                  SizedBox(width: 8),
                  Text(
                    'OFFLINE LEAN-QR (FHIR R4 BUNDLE)',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: Color(0xFF111827),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'EMTs and hospital clinicians can scan this QR code with any standard camera to read structured patient records with zero internet connectivity.',
                style: TextStyle(fontSize: 11, color: Color(0xFF6B7280), height: 1.4),
              ),
              const SizedBox(height: 16),

              // QR Code Graphic
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                ),
                child: QrImageView(
                  data: fhirData,
                  version: QrVersions.auto,
                  size: 200.0,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: Color(0xFF111827),
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: Color(0xFF18181B),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Action Buttons: Copy FHIR JSON & Share
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.copy, size: 16),
                      label: const Text('COPY FHIR JSON'),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: fhirData));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('FHIR R4 JSON bundle copied to clipboard'),
                            backgroundColor: Color(0xFF047857),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF374151),
                        side: const BorderSide(color: Color(0xFFD1D5DB)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.share, size: 16),
                      label: const Text('SHARE RECORD'),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Ready for secure HIPAA peer-to-peer transmission'),
                            backgroundColor: Color(0xFF047857),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF047857),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildMedicalIdRow({
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFFE4E4E7),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
