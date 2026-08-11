import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/widgets/camera_pulse_widget.dart';
import 'package:pocketgull_flutter/services/mobile_camera_pulse_service.dart';

void main() {
  group('CameraPulseWidget Tests', () {
    testWidgets('renders initial trigger button cleanly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CameraPulseWidget(),
          ),
        ),
      );

      expect(find.text('OPTICAL PPG PULSE MEASUREMENT'), findsOneWidget);
      expect(find.text('Acquire Pulse via Camera'), findsOneWidget);
    });

    testWidgets('tapping acquire button triggers acquisition progress', (WidgetTester tester) async {
      CameraPulseReading? acquiredReading;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CameraPulseWidget(
              onReadingAcquired: (reading) {
                acquiredReading = reading;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('Acquire Pulse via Camera'));
      await tester.pump();

      expect(find.text('Hold finger over camera lens...'), findsOneWidget);

      // Fast-forward 5 seconds to complete acquisition
      await tester.pump(const Duration(seconds: 5));

      expect(acquiredReading, isNotNull);
      expect(find.text('ACQUIRED PULSE RATE'), findsOneWidget);
      expect(find.text('BPM'), findsOneWidget);
    });
  });
}
