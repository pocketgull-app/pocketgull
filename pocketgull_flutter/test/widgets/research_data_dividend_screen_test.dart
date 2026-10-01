import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/screens/research_data_dividend_screen.dart';
import 'package:pocketgull_flutter/providers/research_consent_provider.dart';

void main() {
  group('ResearchDataDividendScreen Widget Tests (WCAG AAA & Telemetry)', () {
    testWidgets('renders balance, lifetime earnings, and ethical precedent banner', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: ResearchDataDividendScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Screen Header
      expect(find.text('🧬 Research Data Dividend'), findsOneWidget);

      // Verify Available Balance & Lifetime Earnings
      expect(find.text('\$75.00'), findsOneWidget);
      expect(find.textContaining('Lifetime Earnings: \$125.00'), findsOneWidget);
      expect(find.text('85% Patient Revenue Share', findRichText: true), findsNothing); // contained in text
      expect(find.textContaining('85% Patient Revenue Share'), findsOneWidget);

      // Verify Ethical Precedent Banner
      expect(find.textContaining('NIH "All of Us"'), findsOneWidget);

      // Verify Live Telemetry Streaming Card
      expect(find.text('ENCRYPTED TELEMETRY STREAMING (LIVE)'), findsOneWidget);
      expect(find.text('ACTIVE'), findsOneWidget);
      expect(find.textContaining('Sentinel nodes routing packets'), findsOneWidget);
      expect(find.textContaining('Offline Ledger Sealed • Hive Secure Storage'), findsOneWidget);

      // Verify Active Cohorts
      expect(find.text('Type 2 Diabetes & Glucose Dynamics'), findsOneWidget);
      expect(find.text('Oncology Epigenetic Biomarkers'), findsOneWidget);
      expect(find.text('Long-COVID & Autonomic HRV'), findsOneWidget);
      expect(find.text('+\$25.00 / query'), findsOneWidget);
      expect(find.text('k-Anonymity: 12'), findsOneWidget);
    });

    testWidgets('toggles encrypted biosignal telemetry streaming from AppBar action', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: ResearchDataDividendScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('ENCRYPTED TELEMETRY STREAMING (LIVE)'), findsOneWidget);
      expect(find.text('ACTIVE'), findsOneWidget);

      // Tap sensors action icon to toggle off
      await tester.tap(find.byTooltip('Toggle Encrypted Biosignal Stream'));
      await tester.pumpAndSettle();

      expect(find.text('TELEMETRY STREAM PAUSED'), findsOneWidget);
      expect(find.text('STANDBY'), findsOneWidget);
      expect(find.textContaining('Biosignal packet streaming is disabled'), findsOneWidget);

      // Tap again to toggle back on
      await tester.tap(find.byTooltip('Toggle Encrypted Biosignal Stream'));
      await tester.pumpAndSettle();

      expect(find.text('ENCRYPTED TELEMETRY STREAMING (LIVE)'), findsOneWidget);
      expect(find.text('ACTIVE'), findsOneWidget);
    });

    testWidgets('toggles cohort enrollment switch cleanly', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      late WidgetRef capturedRef;
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: Consumer(
              builder: (context, ref, child) {
                capturedRef = ref;
                return const ResearchDataDividendScreen();
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Check initial enrollment of Long-COVID cohort (initially false)
      final longCovidCohort = capturedRef.read(researchConsentProvider).cohorts.firstWhere(
            (c) => c.id == 'cohort_long_covid_autonomic',
          );
      expect(longCovidCohort.isEnrolled, isFalse);

      // Find the switches
      final switches = find.byType(Switch);
      expect(switches, findsNWidgets(3));

      // Toggle the 3rd switch (Long-COVID)
      await tester.tap(switches.at(2));
      await tester.pumpAndSettle();

      final updatedCohort = capturedRef.read(researchConsentProvider).cohorts.firstWhere(
            (c) => c.id == 'cohort_long_covid_autonomic',
          );
      expect(updatedCohort.isEnrolled, isTrue);
    });

    testWidgets('triggers cash out payout and updates ledger', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: ResearchDataDividendScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Initially balance is $75.00
      expect(find.text('\$75.00'), findsOneWidget);

      final cashOutBtn = find.widgetWithText(ElevatedButton, 'Cash Out');
      expect(cashOutBtn, findsOneWidget);

      // Verify minimum touch target height is at least 48px
      final btnSize = tester.getSize(cashOutBtn);
      expect(btnSize.height, greaterThanOrEqualTo(48.0));

      // Tap Cash Out
      await tester.tap(cashOutBtn);
      await tester.pump(); // Start SnackBar animation

      // SnackBar should be visible
      expect(find.text('Stripe Connect payout transfer initiated!'), findsOneWidget);

      await tester.pumpAndSettle();

      // Balance is now $0.00
      expect(find.text('\$0.00'), findsOneWidget);

      // Cash out button should now be disabled (null onPressed)
      final buttonWidget = tester.widget<ElevatedButton>(cashOutBtn);
      expect(buttonWidget.onPressed, isNull);

      // Recent Dividend Transfers section should now be visible
      expect(find.text('RECENT DIVIDEND TRANSFERS'), findsOneWidget);
      expect(find.text('Stripe Express Payout Transfer'), findsOneWidget);
      expect(find.text('+\$75.00'), findsOneWidget);
    });
  });
}
