import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/dicom_models.dart';

/// State of the DICOM Multi-Frame Tele-Radiology Viewer.
class DicomState {
  final DicomStudy? selectedStudy;
  final int currentFrameIndex;
  final bool isPlayingCine;
  final int cineFps;
  final String windowPreset; // 'SPINE' | 'SOFT_TISSUE' | 'BONE' | 'INVERTED'
  final double zoom;

  const DicomState({
    this.selectedStudy,
    this.currentFrameIndex = 0,
    this.isPlayingCine = false,
    this.cineFps = 24,
    this.windowPreset = 'SPINE',
    this.zoom = 1.0,
  });

  /// The active frame slice number (1-based for clinicians).
  int get displaySliceNumber => currentFrameIndex + 1;

  /// Total frames in active study.
  int get totalFrames => selectedStudy?.frameCount ?? 1;

  /// Computed slice location in millimeters relative to midline.
  double get sliceLocationMm {
    if (selectedStudy == null) return 0.0;
    final total = selectedStudy!.frameCount;
    final half = total / 2.0;
    final step = selectedStudy!.sliceThicknessMm;
    return (currentFrameIndex - half) * step;
  }

  DicomState copyWith({
    DicomStudy? selectedStudy,
    int? currentFrameIndex,
    bool? isPlayingCine,
    int? cineFps,
    String? windowPreset,
    double? zoom,
  }) {
    return DicomState(
      selectedStudy: selectedStudy ?? this.selectedStudy,
      currentFrameIndex: currentFrameIndex ?? this.currentFrameIndex,
      isPlayingCine: isPlayingCine ?? this.isPlayingCine,
      cineFps: cineFps ?? this.cineFps,
      windowPreset: windowPreset ?? this.windowPreset,
      zoom: zoom ?? this.zoom,
    );
  }
}

/// Riverpod StateNotifier controlling DICOM study selection and cine loop playback.
class DicomNotifier extends StateNotifier<DicomState> {
  Timer? _cineTimer;

  DicomNotifier() : super(const DicomState()) {
    // Default to Patient 1 (Phil Gear) study
    selectStudy(DicomStudy.defaultStudies.first);
  }

  /// Selects an active DICOM study.
  void selectStudy(DicomStudy study) {
    pauseCine();
    state = state.copyWith(
      selectedStudy: study,
      currentFrameIndex: 0,
      cineFps: study.frameRateFps,
      isPlayingCine: false,
    );
  }

  /// Selects study matching a specific patientId (or falls back to Patient 1).
  void selectStudyForPatient(String patientId) {
    final matched = DicomStudy.defaultStudies.firstWhere(
      (s) => s.patientId == patientId,
      orElse: () => DicomStudy.defaultStudies.first,
    );
    selectStudy(matched);
  }

  /// Sets the active frame index (clamped to frame count).
  void setFrame(int frame) {
    if (state.selectedStudy == null) return;
    final clamped = frame.clamp(0, state.selectedStudy!.frameCount - 1);
    state = state.copyWith(currentFrameIndex: clamped);
  }

  /// Steps to the next frame (wraps around).
  void nextFrame() {
    if (state.selectedStudy == null) return;
    final total = state.selectedStudy!.frameCount;
    final next = (state.currentFrameIndex + 1) % total;
    state = state.copyWith(currentFrameIndex: next);
  }

  /// Steps to the previous frame (wraps around).
  void prevFrame() {
    if (state.selectedStudy == null) return;
    final total = state.selectedStudy!.frameCount;
    final prev = (state.currentFrameIndex - 1 + total) % total;
    state = state.copyWith(currentFrameIndex: prev);
  }

  /// Starts cine multi-frame playback loop.
  void playCine() {
    if (state.selectedStudy == null) return;
    state = state.copyWith(isPlayingCine: true);
    _startCineTimer();
  }

  /// Pauses cine loop.
  void pauseCine() {
    _cineTimer?.cancel();
    state = state.copyWith(isPlayingCine: false);
  }

  /// Toggles cine playback state.
  void toggleCine() {
    if (state.isPlayingCine) {
      pauseCine();
    } else {
      playCine();
    }
  }

  /// Sets cine playback FPS (e.g. 12, 18, 24, 30).
  void setCineFps(int fps) {
    state = state.copyWith(cineFps: fps.clamp(5, 60));
    if (state.isPlayingCine) {
      _startCineTimer();
    }
  }

  /// Sets Hounsfield Unit (HU) windowing preset.
  void setWindowPreset(String preset) {
    state = state.copyWith(windowPreset: preset);
  }

  /// Sets canvas zoom level.
  void setZoom(double zoom) {
    state = state.copyWith(zoom: zoom.clamp(0.5, 3.0));
  }

  void _startCineTimer() {
    _cineTimer?.cancel();
    final intervalMs = (1000.0 / state.cineFps).round().clamp(16, 200);

    _cineTimer = Timer.periodic(Duration(milliseconds: intervalMs), (_) {
      if (!mounted || !state.isPlayingCine || state.selectedStudy == null) {
        _cineTimer?.cancel();
        return;
      }
      nextFrame();
    });
  }

  @override
  void dispose() {
    _cineTimer?.cancel();
    super.dispose();
  }
}

/// Global StateNotifierProvider for DICOM Tele-Radiology.
final dicomProvider = StateNotifierProvider<DicomNotifier, DicomState>((ref) {
  return DicomNotifier();
});
