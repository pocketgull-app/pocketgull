import 'package:flutter/material.dart';
import '../models/patient_types.dart';
import 'dicom_viewer_widget.dart';

class PatientScansWidget extends StatelessWidget {
  final List<DiagnosticScan> scans;

  const PatientScansWidget({super.key, required this.scans});

  static const List<DiagnosticScan> _defaultScans = [
    DiagnosticScan(
      id: 'scan_lumbar_mri_01',
      type: 'MRI',
      title: 'Lumbar Spine MRI (L4-L5)',
      date: '2024.11.18',
      bodyPartId: 'spine',
      description: '32-slice sagittal T2 cine series evaluating L4-L5 posterior disc protrusion and thecal sac clearance.',
      status: 'REVIEWED',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final effectiveScans = scans.isEmpty ? _defaultScans : scans;

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: effectiveScans.length,
      separatorBuilder: (context, index) => const Divider(height: 32),
      itemBuilder: (context, index) {
        final scan = effectiveScans[index];
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Interactive Tele-Radiology Thumbnail
                  InkWell(
                    onTap: () => _openDicomViewer(context),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: const Color(0xFF09090B),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF38BDF8), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          const Icon(Icons.motion_photos_on_outlined, color: Color(0xFF38BDF8), size: 36),
                          Positioned(
                            bottom: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0284C7),
                                borderRadius: BorderRadius.circular(3),
                              ),
                              child: const Text(
                                '32 FRAMES',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  // Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                scan.title,
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusColor(scan.status).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: _getStatusColor(scan.status).withValues(alpha: 0.3)),
                              ),
                              child: Text(
                                scan.status.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.0,
                                  color: _getStatusColor(scan.status),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${scan.type} • ${scan.date}',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          scan.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Action Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _openDicomViewer(context),
                    icon: const Icon(Icons.movie_creation_outlined, size: 14),
                    label: const Text('LAUNCH CINE VIEWER'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: const Color(0xFF38BDF8),
                      side: const BorderSide(color: Color(0xFF0284C7)),
                      textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _openDicomViewer(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 24),
        child: SizedBox(
          height: 620,
          child: DicomViewerWidget(
            onClose: () => Navigator.of(context).pop(),
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'normal':
        return Colors.green;
      case 'abnormal':
        return Colors.red;
      case 'pending':
        return Colors.orange;
      case 'reviewed':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}
