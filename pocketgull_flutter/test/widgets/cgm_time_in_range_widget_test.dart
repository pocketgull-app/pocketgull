import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/widgets/cgm_time_in_range_widget.dart';

void main() {
  testWidgets('CgmTimeInRangeWidget renders TIR metrics, distribution bar, and legend', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CgmTimeInRangeWidget(
                glucoseReadingsMgDl: [85.0, 95.0, 110.0, 130.0, 160.0, 175.0, 210.0],
              ),
            ),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('CGM TIME IN RANGE (TIR)'), findsOneWidget);
    expect(find.text('TARGET MET'), findsOneWidget);
    expect(find.text('GMI %'), findsOneWidget);
    expect(find.text('MEAN'), findsOneWidget);
    expect(find.text('CV %'), findsOneWidget);
  });
}
