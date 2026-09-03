import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/widgets/dicom_viewer_widget.dart';
import 'package:pocketgull_flutter/providers/whispy_bioreactor_provider.dart';

void main() {
  group('DicomViewerWidget Tests', () {
    testWidgets('Renders DICOM Viewer HUD, Patient 1 study, and controls cleanly', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: SizedBox(
                width: 600,
                height: 700,
                child: DicomViewerWidget(),
              ),
            ),
          ),
        ),
      );

      // Verify study header
      expect(find.text('MR'), findsOneWidget);
      expect(find.text('Lumbar Spine MRI (L4-L5 herniation check)'), findsOneWidget);

      // Verify telemetry HUD
      expect(find.text('PATIENT: p_default_patient'), findsOneWidget);
      expect(find.text('FRAME: 1 / 32'), findsOneWidget);
      expect(find.text('THK: 3.0 mm'), findsOneWidget);

      // Verify presets
      expect(find.text('SPINE'), findsOneWidget);
      expect(find.text('SOFT TISSUE'), findsOneWidget);
      expect(find.text('BONE'), findsOneWidget);

      // Verify cine play button
      final playBtn = find.byTooltip('Play 24 FPS Cine');
      expect(playBtn, findsOneWidget);

      // Verify Send to Bioreactor button
      expect(find.text('Send Defect to Bioreactor'), findsOneWidget);
    });

    testWidgets('Renders on Pixel 9 Pro (393x852) with zero RenderFlex overflow and >=44px touch target', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: SizedBox(
                width: 393,
                height: 852,
                child: DicomViewerWidget(),
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);

      // Find the Bioreactor button and check Fitts's Law height >= 44px
      final btnFinder = find.widgetWithText(ElevatedButton, 'Send Defect to Bioreactor');
      expect(btnFinder, findsOneWidget);
      final btnSize = tester.getSize(btnFinder);
      expect(btnSize.height, greaterThanOrEqualTo(44.0));
    });

    testWidgets('Tapping Send to Bioreactor dispatches scan to whispyBioreactorProvider and shows SnackBar', (tester) async {
      late WidgetRef capturedRef;
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: Consumer(
                builder: (context, ref, _) {
                  capturedRef = ref;
                  return const SizedBox(
                    width: 400,
                    height: 800,
                    child: DicomViewerWidget(),
                  );
                },
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      final btnFinder = find.widgetWithText(ElevatedButton, 'Send Defect to Bioreactor');
      await tester.tap(btnFinder);
      await tester.pump(const Duration(milliseconds: 200));

      // Verify SnackBar appeared
      expect(find.textContaining('Dispatched Lumbar Spine MRI'), findsOneWidget);
      expect(capturedRef.read(whispyBioreactorProvider).targetVoxelCount, equals(32 * 96));
    });
  });
}

