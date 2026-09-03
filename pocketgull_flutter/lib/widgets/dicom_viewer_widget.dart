import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/dicom_provider.dart';
import '../providers/whispy_bioreactor_provider.dart';

/// Full-fidelity DICOM Multi-Frame Tele-Radiology Viewer for Pocket-Gull.
///
/// Features 24 FPS cine loop playback, slice location telemetry,
/// and procedural MRI cross-sectional rendering for Patient 1 (Phil Gear)
/// and clinical roster studies.
class DicomViewerWidget extends ConsumerWidget {
  final VoidCallback? onClose;

  const DicomViewerWidget({super.key, this.onClose});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dicomProvider);
    final notifier = ref.read(dicomProvider.notifier);
    final study = state.selectedStudy;

    if (study == null) {
      return const Center(child: Text('NO STUDY SELECTED', style: TextStyle(color: Colors.white)));
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF09090B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        children: [
          // Top Study & Navigation Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFF18181B),
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
              border: Border(bottom: BorderSide(color: Color(0xFF27272A))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              study.modalities.join('/'),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              study.studyDescription,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${study.patientName} • UID: ...${study.studyInstanceUid.split('.').last}',
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 10,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),
                if (onClose != null)
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                    onPressed: onClose,
                    tooltip: 'Close Viewer',
                  ),
              ],
            ),
          ),

          // Main Viewport with Procedural MRI Slice Canvas & DICOM HUD Overlay
          Expanded(
            child: Stack(
              children: [
                // Procedural Anatomical Canvas
                Positioned.fill(
                  child: ClipRect(
                    child: CustomPaint(
                      painter: DicomSlicePainter(
                        frameIndex: state.currentFrameIndex,
                        totalFrames: study.frameCount,
                        windowPreset: state.windowPreset,
                      ),
                    ),
                  ),
                ),

                // Top Left Clinical HUD
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF3F3F46)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PATIENT: ${study.patientId}',
                          style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                        const Text(
                          'TE: 85 ms • TR: 3200 ms',
                          style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 9, fontFamily: 'monospace'),
                        ),
                        const Text(
                          'FOV: 240 mm • MATRIX: 512x512',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                ),

                // Top Right Slice & Spatial Telemetry HUD
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF3F3F46)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'FRAME: ${state.displaySliceNumber} / ${study.frameCount}',
                          style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'LOC: ${state.sliceLocationMm >= 0 ? '+' : ''}${state.sliceLocationMm.toStringAsFixed(1)} mm',
                          style: TextStyle(
                            color: state.sliceLocationMm.abs() < 2.0 ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1),
                            fontSize: 9,
                            fontFamily: 'monospace',
                            fontWeight: state.sliceLocationMm.abs() < 2.0 ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        Text(
                          'THK: ${study.sliceThicknessMm} mm',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                ),

                // Bottom Left Window Level HUD
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'PRESET: ${state.windowPreset}',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontFamily: 'monospace'),
                    ),
                  ),
                ),

                // Center Midline Crosshair Tag when viewing herniation apex
                if (state.sliceLocationMm.abs() < 3.0)
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF7F1D1D).withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFEF4444)),
                      ),
                      child: const Text(
                        'HERNIATION APEX (L4-L5)',
                        style: TextStyle(
                          color: Color(0xFFFEE2E2),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Bottom Control Panel: Scrubber, Cine controls & Presets
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF18181B),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(15)),
              border: Border(top: BorderSide(color: Color(0xFF27272A))),
            ),
            child: Column(
              children: [
                // Slice Scrubber Slider
                Row(
                  children: [
                    Text(
                      '1',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontFamily: 'monospace'),
                    ),
                    Expanded(
                      child: SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          thumbColor: const Color(0xFFFBBF24),
                          activeTrackColor: const Color(0xFFD97706),
                          inactiveTrackColor: const Color(0xFF27272A),
                          trackHeight: 3,
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                        ),
                        child: Slider(
                          value: state.currentFrameIndex.toDouble(),
                          min: 0,
                          max: (study.frameCount - 1).toDouble(),
                          onChanged: (val) {
                            notifier.setFrame(val.round());
                          },
                        ),
                      ),
                    ),
                    Text(
                      '${study.frameCount}',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontFamily: 'monospace'),
                    ),
                  ],
                ),

                // Cine Controls and Windowing Presets
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Playback Controls
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.skip_previous, color: Colors.white, size: 20),
                          tooltip: 'Previous Frame',
                          onPressed: () => notifier.prevFrame(),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 36,
                          height: 36,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFBBF24),
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            padding: EdgeInsets.zero,
                            icon: Icon(
                              state.isPlayingCine ? Icons.pause : Icons.play_arrow,
                              color: const Color(0xFF09090B),
                              size: 20,
                            ),
                            tooltip: state.isPlayingCine ? 'Pause Cine' : 'Play 24 FPS Cine',
                            onPressed: () => notifier.toggleCine(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.skip_next, color: Colors.white, size: 20),
                          tooltip: 'Next Frame',
                          onPressed: () => notifier.nextFrame(),
                        ),
                      ],
                    ),
                    const SizedBox(width: 10),

                    // Window Preset Chips
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: ['SPINE', 'SOFT_TISSUE', 'BONE'].map((preset) {
                            final isSelected = state.windowPreset == preset;
                            return Padding(
                              padding: const EdgeInsets.only(left: 4),
                              child: ChoiceChip(
                                visualDensity: VisualDensity.compact,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                label: Text(preset.replaceAll('_', ' ')),
                                selected: isSelected,
                                labelStyle: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                                ),
                                selectedColor: const Color(0xFFD97706),
                                backgroundColor: const Color(0xFF27272A),
                                side: BorderSide(
                                  color: isSelected ? const Color(0xFFFBBF24) : Colors.transparent,
                                ),
                                onSelected: (selected) {
                                  if (selected) notifier.setWindowPreset(preset);
                                },
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Bioreactor Seeding Dispatch Button (WCAG AAA & Fitts's Law >= 44px)
                SizedBox(
                  height: 44,
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF042F2E),
                      foregroundColor: const Color(0xFF2DD4BF),
                      elevation: 0,
                      side: const BorderSide(color: Color(0xFF0D9488), width: 1.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    icon: const Text('🫧', style: TextStyle(fontSize: 16)),
                    label: const Text(
                      'Send Defect to Bioreactor',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.4,
                      ),
                    ),
                    onPressed: () {
                      final voxelCount = study.frameCount * 96;
                      ref.read(whispyBioreactorProvider.notifier).loadPatientScan(
                            study.studyInstanceUid,
                            voxelCount: voxelCount,
                          );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            '🫧 Dispatched ${study.studyDescription} to Whispy Bioreactor ($voxelCount voxels)',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          duration: const Duration(seconds: 2),
                          backgroundColor: const Color(0xFF042F2E),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// CustomPainter that renders procedural sagittal MRI cross-sections of the lumbar spine.
///
/// Models L3, L4, L5, S1 vertebral bodies, disc spaces, thecal sac with CSF,
/// and the posterior L4-L5 herniation contour shifting dynamically across frames.
class DicomSlicePainter extends CustomPainter {
  final int frameIndex;
  final int totalFrames;
  final String windowPreset;

  DicomSlicePainter({
    required this.frameIndex,
    required this.totalFrames,
    required this.windowPreset,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = const Color(0xFF050507);
    canvas.drawRect(Offset.zero & size, bgPaint);

    final cx = size.width / 2;
    final cy = size.height / 2;

    // Relative slice location from lateral (-1.0) to midline (0.0) to contralateral (1.0)
    final relLoc = ((frameIndex / (totalFrames - 1)) * 2.0) - 1.0;
    final midlineProximity = 1.0 - relLoc.abs(); // 1.0 at midline, 0.0 at lateral borders

    // Base color tones adjusted by window preset
    Color boneCortexColor = const Color(0xFFE2E8F0);
    Color boneMarrowColor = const Color(0xFF64748B);
    Color discColor = const Color(0xFF94A3B8);
    Color csfColor = const Color(0xFFF8FAFC); // High T2 signal
    Color thecalBorderColor = const Color(0xFF475569);

    if (windowPreset == 'BONE') {
      boneCortexColor = Colors.white;
      boneMarrowColor = const Color(0xFF94A3B8);
      csfColor = const Color(0xFF475569);
    } else if (windowPreset == 'SOFT_TISSUE') {
      boneCortexColor = const Color(0xFF94A3B8);
      boneMarrowColor = const Color(0xFF475569);
      discColor = const Color(0xFFCBD5E1);
      csfColor = Colors.white;
    }

    // 1. Draw Thecal Sac (Posterior to vertebral bodies)
    final thecalWidth = (36.0 + midlineProximity * 14.0);
    final thecalX = cx + 38;
    final thecalRect = Rect.fromLTWH(thecalX, cy - 140, thecalWidth, 280);

    final csfPaint = Paint()
      ..color = csfColor.withValues(alpha: 0.85)
      ..style = PaintingStyle.fill;
    canvas.drawRRect(RRect.fromRectAndRadius(thecalRect, const Radius.circular(12)), csfPaint);

    final thecalBorderPaint = Paint()
      ..color = thecalBorderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawRRect(RRect.fromRectAndRadius(thecalRect, const Radius.circular(12)), thecalBorderPaint);

    // Cauda Equina nerve roots (vertical striations inside thecal sac)
    final nervePaint = Paint()
      ..color = const Color(0xFF334155)
      ..strokeWidth = 1.2;
    for (int i = 0; i < 4; i++) {
      final nx = thecalX + 6 + (i * 7.0);
      canvas.drawLine(Offset(nx, cy - 130), Offset(nx, cy + 130), nervePaint);
    }

    // 2. Draw Vertebral Bodies: L3, L4, L5, S1
    final vertebrae = [
      {'name': 'L3', 'y': cy - 110, 'h': 44.0, 'w': 65.0},
      {'name': 'L4', 'y': cy - 45, 'h': 46.0, 'w': 68.0},
      {'name': 'L5', 'y': cy + 22, 'h': 48.0, 'w': 72.0},
      {'name': 'S1', 'y': cy + 90, 'h': 50.0, 'w': 75.0},
    ];

    final cortexPaint = Paint()
      ..color = boneCortexColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    final marrowPaint = Paint()
      ..color = boneMarrowColor.withValues(alpha: 0.6)
      ..style = PaintingStyle.fill;

    for (final vert in vertebrae) {
      final vy = vert['y'] as double;
      final vh = vert['h'] as double;
      final vw = vert['w'] as double;
      final vx = cx - 35;

      final vRect = RRect.fromRectAndRadius(Rect.fromLTWH(vx, vy, vw, vh), const Radius.circular(6));
      canvas.drawRRect(vRect, marrowPaint);
      canvas.drawRRect(vRect, cortexPaint);
    }

    // 3. Draw Intervertebral Discs
    // L3-L4 Disc (Normal)
    final discL3L4 = RRect.fromRectAndRadius(
      Rect.fromLTWH(cx - 33, cy - 64, 66, 17),
      const Radius.circular(3),
    );
    canvas.drawRRect(discL3L4, Paint()..color = discColor);

    // L4-L5 Disc (PATHOLOGY: Focal Posterior Protrusion / Herniation)
    // Herniation apex pushes posterior into the thecal sac as midlineProximity approaches 1.0!
    final protrusionDepth = (14.0 * midlineProximity).clamp(2.0, 16.0);
    final discL4L5Path = Path()
      ..moveTo(cx - 33, cy + 3)
      ..lineTo(cx + 33, cy + 3)
      // Posterior protrusion pouch extending toward thecal sac
      ..cubicTo(
        cx + 33 + protrusionDepth * 0.7, cy + 5,
        cx + 33 + protrusionDepth, cy + 10,
        cx + 33 + protrusionDepth * 0.5, cy + 17,
      )
      ..lineTo(cx + 33, cy + 19)
      ..lineTo(cx - 33, cy + 19)
      ..close();

    final herniationDiscPaint = Paint()
      ..color = midlineProximity > 0.65 ? const Color(0xFFEF4444).withValues(alpha: 0.7) : discColor
      ..style = PaintingStyle.fill;
    canvas.drawPath(discL4L5Path, herniationDiscPaint);

    final herniationOutlinePaint = Paint()
      ..color = midlineProximity > 0.65 ? const Color(0xFFFCA5A5) : boneCortexColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawPath(discL4L5Path, herniationOutlinePaint);

    // L5-S1 Disc (Mild degeneration)
    final discL5S1 = RRect.fromRectAndRadius(
      Rect.fromLTWH(cx - 32, cy + 72, 68, 16),
      const Radius.circular(3),
    );
    canvas.drawRRect(discL5S1, Paint()..color = discColor.withValues(alpha: 0.8));

    // 4. Anterior and Posterior Longitudinal Ligaments
    final ligamentPaint = Paint()
      ..color = boneCortexColor.withValues(alpha: 0.7)
      ..strokeWidth = 2.0;
    // Anterior line
    canvas.drawLine(Offset(cx - 35, cy - 130), Offset(cx - 35, cy + 140), ligamentPaint);
  }

  @override
  bool shouldRepaint(covariant DicomSlicePainter oldDelegate) {
    return oldDelegate.frameIndex != frameIndex ||
        oldDelegate.windowPreset != windowPreset ||
        oldDelegate.totalFrames != totalFrames;
  }
}
