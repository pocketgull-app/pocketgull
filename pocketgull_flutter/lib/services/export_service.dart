// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:convert';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'web_download.dart';
import '../models/patient_types.dart';
import 'clinical_intelligence_service.dart';

enum ExportMode { standard, cognition, child }

class ExportService {
  Future<void> downloadAsPdf({
    required Patient patient,
    required Map<AnalysisLens, String> reports,
    ExportMode mode = ExportMode.standard,
  }) async {
    final pdf = pw.Document();

    final timestamp = DateTime.now().toString().split('.')[0];
    
    // Define mode-specific styles
    final primaryColor = mode == ExportMode.child ? PdfColors.blue600 : PdfColors.black;
    final accentColor = mode == ExportMode.child ? PdfColors.orange500 : PdfColors.grey;
    final baseFontSize = mode == ExportMode.cognition ? 14.0 : 12.0;
    final lineSpacing = mode == ExportMode.cognition ? 2.0 : 1.5;

    // Add page for the report
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            // Letterhead
            pw.Header(
              level: 0,
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        mode == ExportMode.child ? 'My Health Adventure' : 'Pocket Gull', 
                        style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold, color: primaryColor)
                      ),
                      pw.Text(
                        mode == ExportMode.child ? 'Summary for Parents' : 'Clinical Intelligence Platform', 
                        style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey)
                      ),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Generated: $timestamp', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey)),
                      pw.Text(
                        mode == ExportMode.cognition ? 'Accessible Cognition Report' : 'Comprehensive Analysis', 
                        style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey)
                      ),
                    ],
                  )
                ]
              )
            ),
            
            pw.SizedBox(height: 20),
            
            // Patient Banner
            pw.Container(
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: accentColor),
                color: mode == ExportMode.child ? PdfColors.blue50 : PdfColors.grey100,
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
              ),
              padding: const pw.EdgeInsets.all(12),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                children: [
                  _buildPatientField('Name', patient.name, mode),
                  _buildPatientField('Age', '${patient.age}', mode),
                  _buildPatientField('Gender', patient.gender, mode),
                ]
              )
            ),
            
            pw.SizedBox(height: 20),
            
            if (mode != ExportMode.child)
              pw.Container(
                padding: const pw.EdgeInsets.all(8),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('#FFFBEB'),
                  border: pw.Border(left: pw.BorderSide(color: PdfColor.fromHex('#D97706'), width: 3)),
                ),
                child: pw.Text(
                  'AI-Assisted Clinical Report. recommendations are advisory and must be reviewed by a professional.',
                  style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
                )
              ),
            
            pw.SizedBox(height: 20),
            
            // Lenses
            ...AnalysisLens.values.where((lens) => reports.containsKey(lens) && reports[lens]!.isNotEmpty).map((lens) {
              return pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Container(
                    width: double.infinity,
                    padding: const pw.EdgeInsets.all(8),
                    color: mode == ExportMode.child ? PdfColors.orange100 : PdfColors.grey200,
                    child: pw.Text(
                      mode == ExportMode.child ? _getChildFriendlyTitle(lens) : lens.title, 
                      style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: primaryColor)
                    ),
                  ),
                  pw.SizedBox(height: 10),
                  pw.Text(
                    reports[lens]!, 
                    style: pw.TextStyle(
                      fontSize: baseFontSize, 
                      lineSpacing: lineSpacing,
                      fontWeight: mode == ExportMode.cognition ? pw.FontWeight.bold : pw.FontWeight.normal,
                    )
                  ),
                  pw.SizedBox(height: 20),
                ]
              );
            }),
          ];
        },
        footer: (pw.Context context) {
          return pw.Container(
            alignment: pw.Alignment.centerRight,
            margin: const pw.EdgeInsets.only(top: 20),
            child: pw.Text(
              'Page ${context.pageNumber} of ${context.pagesCount}',
              style: const pw.TextStyle(color: PdfColors.grey, fontSize: 10),
            ),
          );
        },
      )
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'PocketGull_Report_${patient.name.replaceAll(' ', '_')}.pdf',
    );
  }

  pw.Widget _buildPatientField(String label, String value, ExportMode mode) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(
          label.toUpperCase(), 
          style: pw.TextStyle(
            fontSize: 8, 
            color: mode == ExportMode.child ? PdfColors.blue700 : PdfColors.grey700, 
            fontWeight: pw.FontWeight.bold
          )
        ),
        pw.Text(
          value, 
          style: pw.TextStyle(
            fontSize: 12, 
            fontWeight: pw.FontWeight.bold,
            color: mode == ExportMode.child ? PdfColors.blue900 : PdfColors.black,
          )
        ),
      ]
    );
  }

  String _getChildFriendlyTitle(AnalysisLens lens) {
    switch (lens) {
      case AnalysisLens.summaryOverview:
        return 'What We Found';
      case AnalysisLens.functionalProtocols:
        return 'How to Feel Better';
      case AnalysisLens.monitoringFollowUp:
        return 'The Road Ahead';
      case AnalysisLens.patientEducation:
        return 'Staying Strong';
      default:
        return 'Health Adventure';
    }
  }

  void exportToFhirBundle(Patient patient) {
    final List<Map<String, dynamic>> entries = [
      {
        'fullUrl': 'urn:uuid:patient-0',
        'resource': {
          'resourceType': 'Patient',
          'id': patient.id,
          'name': [{'text': patient.name}],
          'gender': patient.gender.toLowerCase(),
          'birthDate': '19${(100 - patient.age).toString().padLeft(2, '0')}-01-01', // Mock DOB
        }
      },
      {
        'fullUrl': 'urn:uuid:goal-0',
        'resource': {
          'resourceType': 'Goal',
          'lifecycleStatus': 'active',
          'description': {'text': patient.patientGoals},
          'subject': {'reference': 'Patient/${patient.id}'},
        }
      },
    ];

    // Map Vitals as Observations
    final vitals = patient.vitals;
    final vitalMappings = {
      '8867-4': {'label': 'Heart Rate', 'value': vitals.hr, 'unit': 'bpm'},
      '8480-6': {'label': 'Systolic BP', 'value': vitals.bp.split('/')[0], 'unit': 'mmHg'},
      '8462-4': {'label': 'Diastolic BP', 'value': vitals.bp.split('/').length > 1 ? vitals.bp.split('/')[1] : '0', 'unit': 'mmHg'},
      '2708-6': {'label': 'Oxygen Saturation', 'value': vitals.spO2.replaceAll('%', ''), 'unit': '%'},
    };

    vitalMappings.forEach((code, data) {
      if (data['value'] != null && data['value']!.toString().isNotEmpty) {
        entries.add({
          'fullUrl': 'urn:uuid:obs-$code',
          'resource': {
            'resourceType': 'Observation',
            'status': 'final',
            'code': {
              'coding': [{'system': 'http://loinc.org', 'code': code, 'display': data['label']}]
            },
            'subject': {'reference': 'Patient/${patient.id}'},
            'valueQuantity': {
              'value': double.tryParse(data['value']!.toString()) ?? 0,
              'unit': data['unit'],
              'system': 'http://unitsofmeasure.org',
            },
          }
        });
      }
    });

    // Map Issues as Conditions
    patient.issues.forEach((partId, issues) {
      for (var i = 0; i < issues.length; i++) {
        final issue = issues[i];
        entries.add({
          'fullUrl': 'urn:uuid:cond-$partId-$i',
          'resource': {
            'resourceType': 'Condition',
            'clinicalStatus': {
              'coding': [{'system': 'http://terminology.hl7.org/CodeSystem/condition-clinical', 'code': 'active'}]
            },
            'code': {'text': '${issue.name}: ${issue.description}'},
            'subject': {'reference': 'Patient/${patient.id}'},
            'severity': {
              'text': 'Pain Level: ${issue.painLevel}/10'
            }
          }
        });
      }
    });

    final bundle = {
      'resourceType': 'Bundle',
      'type': 'collection',
      'timestamp': DateTime.now().toIso8601String(),
      'entry': entries,
    };

    final jsonString = jsonEncode(bundle);
    triggerWebDownload(jsonString, "PocketGull_FHIR_${patient.name.replaceAll(' ', '_')}.json");
  }
}
