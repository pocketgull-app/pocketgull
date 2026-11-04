// SPDX-License-Identifier: Apache-2.0
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/providers/dicom_provider.dart';

void main() {
  late ProviderContainer container;
  late DicomNotifier notifier;

  setUp(() {
    container = ProviderContainer();
    notifier = container.read(dicomProvider.notifier);
  });

  tearDown(() {
    container.dispose();
  });

  group('DicomNotifier Unit Tests', () {
    test('1. Initializes with Patient 1 Phil Gear Lumbar Spine MRI study', () {
      final state = container.read(dicomProvider);
      expect(state.selectedStudy, isNotNull);
      expect(state.selectedStudy!.patientId, equals('p_default_patient'));
      expect(state.selectedStudy!.frameCount, equals(32));
      expect(state.currentFrameIndex, equals(0));
      expect(state.displaySliceNumber, equals(1));
      expect(state.isPlayingCine, isFalse);
    });

    test('2. Clamps frame index within study boundaries', () {
      notifier.setFrame(15);
      expect(container.read(dicomProvider).currentFrameIndex, equals(15));
      expect(container.read(dicomProvider).displaySliceNumber, equals(16));

      notifier.setFrame(999);
      expect(container.read(dicomProvider).currentFrameIndex, equals(31)); // Max frame

      notifier.setFrame(-50);
      expect(container.read(dicomProvider).currentFrameIndex, equals(0)); // Min frame
    });

    test('3. Step forward and backward wraps around 32-frame boundary', () {
      notifier.setFrame(31);
      notifier.nextFrame();
      expect(container.read(dicomProvider).currentFrameIndex, equals(0)); // Wrapped to start

      notifier.prevFrame();
      expect(container.read(dicomProvider).currentFrameIndex, equals(31)); // Wrapped to end
    });

    test('4. Computes sliceLocationMm accurately relative to midline', () {
      // 32 frames, half = 16.0, step = 3.0mm
      notifier.setFrame(16); // Midline slice
      expect(container.read(dicomProvider).sliceLocationMm, equals(0.0));

      notifier.setFrame(10); // 6 slices lateral
      expect(container.read(dicomProvider).sliceLocationMm, equals(-18.0));

      notifier.setFrame(20); // 4 slices contralateral
      expect(container.read(dicomProvider).sliceLocationMm, equals(12.0));
    });

    test('5. Toggles and updates window presets', () {
      notifier.setWindowPreset('BONE');
      expect(container.read(dicomProvider).windowPreset, equals('BONE'));

      notifier.setWindowPreset('SOFT_TISSUE');
      expect(container.read(dicomProvider).windowPreset, equals('SOFT_TISSUE'));
    });

    test('6. Selects study matching patientId', () {
      notifier.selectStudyForPatient('p_darwin');
      expect(container.read(dicomProvider).selectedStudy!.patientId, equals('p_darwin'));
      expect(container.read(dicomProvider).selectedStudy!.frameCount, equals(24));
    });
  });
}
