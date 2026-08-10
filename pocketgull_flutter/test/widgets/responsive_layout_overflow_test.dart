import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/widgets/analysis_report_widget.dart';
import 'package:pocketgull_flutter/widgets/camera_pulse_widget.dart';
import 'package:pocketgull_flutter/widgets/cgm_time_in_range_widget.dart';

void main() {
  group('Multi-Device Responsive Breakpoint Suite (Zero RenderFlex Overflows)', () {
    Widget createResponsiveApp(Widget child, Size size) {
      return ProviderScope(
        child: MaterialApp(
          home: MediaQuery(
            data: MediaQueryData(size: size),
            child: Scaffold(
              body: SizedBox(
                width: size.width,
                height: size.height,
                child: child,
              ),
            ),
          ),
        ),
      );
    }

    testWidgets('AnalysisReportWidget renders without RenderFlex overflow on Pixel 9 Pro (393x852)', (tester) async {
      await tester.pumpWidget(
        createResponsiveApp(const AnalysisReportWidget(), const Size(393, 852)),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
    });

    testWidgets('CameraPulseWidget renders without RenderFlex overflow on Mobile (360x640)', (tester) async {
      await tester.pumpWidget(
        createResponsiveApp(const CameraPulseWidget(), const Size(360, 640)),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('OPTICAL PPG PULSE MEASUREMENT'), findsOneWidget);
    });

    testWidgets('CgmTimeInRangeWidget renders without RenderFlex overflow on Tablet (800x1280)', (tester) async {
      await tester.pumpWidget(
        createResponsiveApp(const CgmTimeInRangeWidget(), const Size(800, 1280)),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('CGM TIME IN RANGE (TIR)'), findsOneWidget);
    });
  });
}
