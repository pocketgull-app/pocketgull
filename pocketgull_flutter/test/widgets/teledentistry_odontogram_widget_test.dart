import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/widgets/teledentistry_odontogram_widget.dart';

void main() {
  testWidgets('TeledentistryOdontogramWidget renders 32-tooth odontogram, PPD slider, and SIBI telemetry', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: TeledentistryOdontogramWidget(),
            ),
          ),
        ),
      ),
    );

    expect(find.text('FDI 32-TOOTH ODONTOGRAM & SIBI BRIDGE'), findsOneWidget);
    expect(find.textContaining('SIBI'), findsWidgets);
    expect(find.textContaining('Maxillary Arch'), findsOneWidget);
    expect(find.textContaining('Mandibular Arch'), findsOneWidget);
    expect(find.textContaining('Cardiovascular Risk Multiplier:'), findsOneWidget);
  });
}
