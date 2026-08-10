import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ditredi/ditredi.dart';
import 'package:vector_math/vector_math_64.dart' as v;
import '../providers/patient_provider.dart';
import '../models/body_part_geometry.dart';
import '../models/patient_types.dart';
import '../services/collaboration_service.dart';

class NativeBodyViewer extends ConsumerStatefulWidget {
  final PatientState? staticPatient;
  final bool interactive;

  const NativeBodyViewer({
    super.key,
    this.staticPatient,
    this.interactive = true,
  });

  @override
  ConsumerState<NativeBodyViewer> createState() => _NativeBodyViewerState();
}

class _NativeBodyViewerState extends ConsumerState<NativeBodyViewer> {
  final _controller = DiTreDiController(
    rotationX: 5,
    rotationY: 180,
    light: v.Vector3(-0.25, -0.7, 0.35),
  );

  @override
  Widget build(BuildContext context) {
    final PatientState state = widget.staticPatient ?? ref.watch(patientProvider);
    final figures = _buildSculptedMannequin(state);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onPanUpdate: widget.interactive ? (details) {
        setState(() {
          _controller.rotationX -= details.delta.dy * 0.8;
          _controller.rotationY += details.delta.dx * 0.8;
        });
      } : null,
      onTapDown: widget.interactive ? (details) {
        final height = context.size?.height ?? 1.0;
        final width = context.size?.width ?? 1.0;
        final normalizedY = details.localPosition.dy / height;
        final normalizedX = details.localPosition.dx / width;
        
        String partId = 'chest';
        
        if (normalizedY < 0.22) {
          partId = 'head';
        } else if (normalizedY < 0.52) {
          if (normalizedX < 0.32) {
            partId = 'r_arm';
          } else if (normalizedX > 0.68) {
            partId = 'l_arm';
          } else {
            partId = 'chest';
          }
        } else if (normalizedY < 0.64) {
          if (normalizedX < 0.30) {
            partId = 'r_hand';
          } else if (normalizedX > 0.70) {
            partId = 'l_hand';
          } else {
            partId = 'abdomen';
          }
        } else if (normalizedY < 0.74) {
          partId = 'pelvis';
        } else if (normalizedY < 0.88) {
          if (normalizedX < 0.5) {
            partId = 'r_thigh';
          } else {
            partId = 'l_thigh';
          }
        } else {
          if (normalizedX < 0.5) {
            partId = 'r_shin';
          } else {
            partId = 'l_shin';
          }
        }
        
        debugPrint('3D Selection: $partId (X: $normalizedX, Y: $normalizedY)');
        ref.read(patientProvider.notifier).selectPart(partId);

        // Real-time WebSocket sync of symptom anchor with Angular platform
        try {
          ref.read(collaborationServiceProvider).syncVitals({
            'selectedPartId': partId,
            'timestamp': DateTime.now().toIso8601String(),
            'source': 'flutter-3d-body-viewer',
          });
        } catch (_) {}
      } : null,
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF09090B) : const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          children: [
            DiTreDi(
              figures: figures,
              controller: _controller,
            ),
            // Floating Interactive Layer Switcher Bar
            if (widget.interactive)
              Positioned(
                top: 10,
                left: 10,
                right: 10,
                child: Center(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black.withValues(alpha: 0.85) : Colors.white.withValues(alpha: 0.90),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: AnatomicalViewMode.values.map((mode) {
                          final isSelected = state.viewMode == mode;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 2),
                            child: InkWell(
                              onTap: () {
                                ref.read(patientProvider.notifier).changeAnatomicalViewMode(mode);
                              },
                              borderRadius: BorderRadius.circular(16),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? (isDark ? const Color(0xFF10B981) : const Color(0xFF416B1F))
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Text(
                                  mode.name.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.0,
                                    color: isSelected
                                        ? Colors.white
                                        : (isDark ? Colors.grey.shade400 : Colors.grey.shade700),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  List<Model3D> _buildSculptedMannequin(PatientState state) {
    final figures = <Model3D>[];

    switch (state.viewMode) {
      case AnatomicalViewMode.skeletal:
        // Skeletal: Vertebral Spine Column + Ribcage + Skull + Femur Bones
        figures.addAll(_generateSpineMesh(state));
        break;

      case AnatomicalViewMode.vascular:
        // Vascular / Cardiac: Core Heart Organ + Main Vascular Trunk + Translucent Body Shell
        figures.addAll(_generateOrganHeartMesh(state));
        figures.addAll(_generateVascularTrunkMesh(state));
        figures.addAll(_generateTranslucentShellMesh(state));
        break;

      case AnatomicalViewMode.muscular:
        // Muscular / Pulmonary: Lungs + Trachea + Muscle Fiber Shell
        figures.addAll(_generateLungsMesh(state));
        figures.addAll(_generateTranslucentShellMesh(state));
        break;

      case AnatomicalViewMode.orthomolecular:
        // Orthomolecular: Brain Cranial Core + Neural Pathways
        figures.addAll(_generateBrainMesh(state));
        figures.addAll(_generateTranslucentShellMesh(state));
        break;

      case AnatomicalViewMode.standard:
        // Standard Surface: Sculpted Body Mannequin with Pain Severity Colors (Red/Green/Grey)
        final parts = BodyPartGeometry.getMannequinParts();
        for (var part in parts) {
          final baseColor = _getSeverityColor(part.id, state);

          if (part.id == 'head' || part.id == 'r_shoulder' || part.id == 'l_shoulder') {
            figures.add(_generateSphereMesh(part.center, part.width / 2, baseColor));
          } else {
            figures.add(_generateTaperedCylinderMesh(
              part.center,
              topRadius: part.width / 2,
              bottomRadius: part.width * 0.4,
              height: part.height,
              color: baseColor,
            ));
          }
        }
        break;
    }

    return figures;
  }

  /// 1. Heart & Aorta Organ Generator (Vascular View)
  List<Model3D> _generateOrganHeartMesh(PatientState state) {
    final figures = <Model3D>[];
    final color = _getSeverityColor('chest', state);

    // Heart Cardiac Chamber Core
    figures.add(_generateSphereMesh(v.Vector3(0.05, 1.25, 0.08), 0.22, color));
    // Aorta Artery Arch
    figures.add(_generateTaperedCylinderMesh(
      v.Vector3(0.08, 1.42, 0.05),
      topRadius: 0.06,
      bottomRadius: 0.06,
      height: 0.20,
      color: color,
    ));

    return figures;
  }

  /// 2. Lungs & Trachea Organ Generator (Muscular View)
  List<Model3D> _generateLungsMesh(PatientState state) {
    final figures = <Model3D>[];
    final color = _getSeverityColor('chest', state);

    // Left Lung Lobe
    figures.add(_generateSphereMesh(v.Vector3(-0.16, 1.25, 0.02), 0.18, color));
    // Right Lung Lobe
    figures.add(_generateSphereMesh(v.Vector3(0.16, 1.25, 0.02), 0.18, color));
    // Central Trachea Airway
    figures.add(_generateTaperedCylinderMesh(
      v.Vector3(0, 1.48, 0.02),
      topRadius: 0.04,
      bottomRadius: 0.04,
      height: 0.25,
      color: color,
    ));

    return figures;
  }

  /// 3. Brain & Cranial Hemisphere Core (Orthomolecular View)
  List<Model3D> _generateBrainMesh(PatientState state) {
    final figures = <Model3D>[];
    final color = _getSeverityColor('head', state);

    // Left Brain Hemisphere
    figures.add(_generateSphereMesh(v.Vector3(-0.08, 1.76, 0.02), 0.16, color));
    // Right Brain Hemisphere
    figures.add(_generateSphereMesh(v.Vector3(0.08, 1.76, 0.02), 0.16, color));

    return figures;
  }

  /// 4. Vascular Trunk & Main Arteries
  List<Model3D> _generateVascularTrunkMesh(PatientState state) {
    final figures = <Model3D>[];
    final color = _getSeverityColor('chest', state);

    // Main Aortic Trunk Line
    figures.add(_generateTaperedCylinderMesh(
      v.Vector3(0, 0.85, 0.02),
      topRadius: 0.03,
      bottomRadius: 0.03,
      height: 0.90,
      color: color,
    ));

    return figures;
  }

  /// 5. Translucent Outline Body Shell for Internal Organ Views
  List<Model3D> _generateTranslucentShellMesh(PatientState state) {
    final figures = <Model3D>[];
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final shellColor = isDark
        ? Colors.grey.shade800.withValues(alpha: 0.25)
        : Colors.grey.shade300.withValues(alpha: 0.35);

    final parts = BodyPartGeometry.getMannequinParts();
    for (var part in parts) {
      if (part.id == 'head' || part.id == 'r_shoulder' || part.id == 'l_shoulder') {
        figures.add(_generateSphereMesh(part.center, part.width / 2, shellColor));
      } else {
        figures.add(_generateTaperedCylinderMesh(
          part.center,
          topRadius: part.width / 2,
          bottomRadius: part.width * 0.4,
          height: part.height,
          color: shellColor,
        ));
      }
    }

    return figures;
  }

  /// 6. Vertebral Spine Column & Ribcage Mesh (Skeletal View)
  List<Model3D> _generateSpineMesh(PatientState state) {
    final figures = <Model3D>[];
    
    // Cranial Head Skull Vault
    final headColor = _getSeverityColor('head', state);
    figures.add(_generateSphereMesh(v.Vector3(0, 1.75, 0), 0.22, headColor));

    // 11 Vertebral Discs
    for (int i = 0; i < 11; i++) {
      final yPos = 1.45 - (i * 0.10);
      final Color discColor = _getSeverityColor('chest', state);

      figures.add(_generateTaperedCylinderMesh(
        v.Vector3(0, yPos, -0.05),
        topRadius: 0.10,
        bottomRadius: 0.10,
        height: 0.07,
        color: discColor,
      ));

      // Thoracic Rib Arches (6 Rib pairs)
      if (i >= 2 && i <= 7) {
        final ribY = yPos;
        final ribColor = _getSeverityColor('chest', state);
        figures.add(_generateTaperedCylinderMesh(
          v.Vector3(-0.20, ribY, 0.05),
          topRadius: 0.03,
          bottomRadius: 0.03,
          height: 0.16,
          color: ribColor,
        ));
        figures.add(_generateTaperedCylinderMesh(
          v.Vector3(0.20, ribY, 0.05),
          topRadius: 0.03,
          bottomRadius: 0.03,
          height: 0.16,
          color: ribColor,
        ));
      }
    }

    // Pelvic Support Base
    final pelvicColor = _getSeverityColor('pelvis', state);
    figures.add(_generateTaperedCylinderMesh(
      v.Vector3(0, 0.30, 0),
      topRadius: 0.24,
      bottomRadius: 0.18,
      height: 0.24,
      color: pelvicColor,
    ));

    // Femoral Leg Bones
    final legColor = _getSeverityColor('r_thigh', state);
    figures.add(_generateTaperedCylinderMesh(v.Vector3(-0.19, -0.10, 0), topRadius: 0.08, bottomRadius: 0.06, height: 0.50, color: legColor));
    figures.add(_generateTaperedCylinderMesh(v.Vector3(0.19, -0.10, 0), topRadius: 0.08, bottomRadius: 0.06, height: 0.50, color: legColor));

    return figures;
  }

  /// 3D Sphere Mesh
  Mesh3D _generateSphereMesh(v.Vector3 center, double radius, Color color) {
    final triangles = <Face3D>[];
    const int slices = 24;
    const int stacks = 16;

    for (int i = 0; i < stacks; i++) {
      final lat0 = math.pi * (-0.5 + i.toDouble() / stacks);
      final z0 = radius * math.sin(lat0);
      final r0 = radius * math.cos(lat0);

      final lat1 = math.pi * (-0.5 + (i + 1).toDouble() / stacks);
      final z1 = radius * math.sin(lat1);
      final r1 = radius * math.cos(lat1);

      for (int j = 0; j < slices; j++) {
        final lng0 = 2 * math.pi * (j.toDouble() / slices);
        final x0 = math.cos(lng0);
        final y0 = math.sin(lng0);

        final lng1 = 2 * math.pi * ((j + 1).toDouble() / slices);
        final x1 = math.cos(lng1);
        final y1 = math.sin(lng1);

        final p1 = v.Vector3(center.x + x0 * r0, center.y + z0, center.z + y0 * r0);
        final p2 = v.Vector3(center.x + x1 * r0, center.y + z0, center.z + y0 * r0);
        final p3 = v.Vector3(center.x + x1 * r1, center.y + z1, center.z + y1 * r1);
        final p4 = v.Vector3(center.x + x0 * r1, center.y + z1, center.z + y0 * r1);

        triangles.add(Face3D(v.Triangle.points(p1, p2, p3), color: color));
        triangles.add(Face3D(v.Triangle.points(p1, p3, p4), color: color));
      }
    }

    return Mesh3D(triangles);
  }

  /// Tapered Cylinder Mesh
  Mesh3D _generateTaperedCylinderMesh(
    v.Vector3 center, {
    required double topRadius,
    required double bottomRadius,
    required double height,
    required Color color,
  }) {
    final triangles = <Face3D>[];
    const int segments = 24;

    final halfH = height / 2;
    final topY = center.y + halfH;
    final bottomY = center.y - halfH;

    for (int i = 0; i < segments; i++) {
      final a0 = 2 * math.pi * (i / segments);
      final a1 = 2 * math.pi * ((i + 1) / segments);

      final p1 = v.Vector3(center.x + topRadius * math.cos(a0), topY, center.z + topRadius * math.sin(a0));
      final p2 = v.Vector3(center.x + topRadius * math.cos(a1), topY, center.z + topRadius * math.sin(a1));
      final p3 = v.Vector3(center.x + bottomRadius * math.cos(a1), bottomY, center.z + bottomRadius * math.sin(a1));
      final p4 = v.Vector3(center.x + bottomRadius * math.cos(a0), bottomY, center.z + bottomRadius * math.sin(a0));

      triangles.add(Face3D(v.Triangle.points(p1, p2, p3), color: color));
      triangles.add(Face3D(v.Triangle.points(p1, p3, p4), color: color));
    }

    return Mesh3D(triangles);
  }

  /// Strict 3-Tier Clinical Color Palette: Grey (Resting/Healthy), Green (Low/Normal), Red (High Pain / Escalation)
  Color _getSeverityColor(String partId, PatientState state) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (state.selectedPartId == partId) {
      return const Color(0xFF10B981).withValues(alpha: 0.95); // Active selection green
    }

    final issues = state.issues[partId];
    int maxPain = 0;
    bool hasEscalation = false;
    
    if (issues != null && issues.isNotEmpty) {
      maxPain = issues.map((i) => i.painLevel).reduce((a, b) => a > b ? a : b);
      hasEscalation = issues.any((i) => i.escalationFlag || i.trajectory == 'rapidly_escalating');
    }

    // High Severity / Escalation -> Crimson Red
    if (hasEscalation || maxPain >= 7) {
      return const Color(0xFFEF4444).withValues(alpha: 0.95);
    }

    // Moderate Pain -> Amber Gold
    if (maxPain >= 4) {
      return const Color(0xFFF59E0B).withValues(alpha: 0.90);
    }

    // Mild Pain / Active Issue -> Clinical Green
    if (maxPain > 0) {
      return const Color(0xFF10B981).withValues(alpha: 0.85);
    }

    // Resting Base Tone -> Soft Neutral Grey
    return isDark ? const Color(0xFF3F3F46) : const Color(0xFFE5E7EB);
  }
}
