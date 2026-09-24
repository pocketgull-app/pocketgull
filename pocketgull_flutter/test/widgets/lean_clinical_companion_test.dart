import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/screens/home_screen.dart';
import 'package:pocketgull_flutter/widgets/lean/lean_care_plan_tab.dart';
import 'package:pocketgull_flutter/widgets/lean/lean_vitals_tab.dart';
import 'package:pocketgull_flutter/widgets/lean/lean_consult_tab.dart';
import 'package:pocketgull_flutter/widgets/lean/lean_medical_id_tab.dart';

void main() {
  group('Pocket-Gull Lean Clinical Companion Suite', () {
    testWidgets('HomeScreen renders 4-tab clinical navigation and switches tabs cleanly', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: HomeScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Brand Header
      expect(find.text('PocketGull'), findsOneWidget);
      expect(find.text('CLINICAL COMPANION'), findsOneWidget);

      // Verify Bottom Navigation Items
      expect(find.text('TODAY'), findsOneWidget);
      expect(find.text('VITALS'), findsOneWidget);
      expect(find.text('CONSULT'), findsOneWidget);
      expect(find.text('MEDICAL ID'), findsOneWidget);

      // Default Tab should be Today (Care Plan)
      expect(find.byType(LeanCarePlanTab), findsOneWidget);
      expect(find.text('CLINICAL TRAJECTORY'), findsOneWidget);

      // Switch to Vitals Tab
      await tester.tap(find.text('VITALS'));
      await tester.pumpAndSettle();
      expect(find.byType(LeanVitalsTab), findsOneWidget);
      expect(find.text('BIOMETRIC TELEMETRY (LIVE)'), findsOneWidget);

      // Switch to Consult Tab
      await tester.tap(find.text('CONSULT'));
      await tester.pumpAndSettle();
      expect(find.byType(LeanConsultTab), findsOneWidget);
      expect(find.textContaining('FDA Section 520(o) CDS'), findsOneWidget);

      // Switch to Medical ID Tab
      await tester.tap(find.text('MEDICAL ID'));
      await tester.pumpAndSettle();
      expect(find.byType(LeanMedicalIdTab), findsOneWidget);
      expect(find.text('EMERGENCY MEDICAL ID • FIRST RESPONDER'), findsOneWidget);
      expect(find.text('OFFLINE LEAN-QR (FHIR R4 BUNDLE)'), findsOneWidget);
    });

    testWidgets('LeanCarePlanTab renders 3-act trajectory, checklist, and medications', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: LeanCarePlanTab(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Check 3-Act Trajectory elements
      expect(find.text('Where You\'ve Been'), findsOneWidget);
      expect(find.text('Where You Stand Today'), findsOneWidget);
      expect(find.text('Where You\'re Going (30-Day)'), findsOneWidget);

      // Check Daily Actions
      expect(find.text('TODAY\'S ACTION PLAN'), findsOneWidget);
      expect(find.text('Morning Parasympathetic Box Breathing'), findsOneWidget);
      expect(find.text('20-Minute Zone 2 Brisk Walk'), findsOneWidget);

      // Toggle a checklist item
      final walkCheckbox = find.widgetWithText(CheckboxListTile, '20-Minute Zone 2 Brisk Walk');
      expect(walkCheckbox, findsOneWidget);
      await tester.tap(walkCheckbox);
      await tester.pumpAndSettle();

      // Check Medications
      expect(find.text('ACTIVE MEDICATIONS & SUPPLEMENTS'), findsOneWidget);
      expect(find.text('Metformin HCl 500 mg'), findsOneWidget);
      expect(find.text('ISMP SAFE'), findsNWidgets(3));
    });

    testWidgets('LeanVitalsTab displays biometric dials and logs symptoms', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: LeanVitalsTab(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Biometrics
      expect(find.text('HEART RATE'), findsOneWidget);
      expect(find.text('BLOOD PRESSURE'), findsOneWidget);
      expect(find.text('BLOOD OXYGEN'), findsOneWidget);
      expect(find.text('BODY TEMP'), findsOneWidget);

      // Camera Pulse Banner
      expect(find.text('Optical PPG Pulse Sensor'), findsOneWidget);
      expect(find.text('SCAN'), findsOneWidget);

      // Symptom Logger Form
      expect(find.text('LOG SYMPTOM BY BODY REGION'), findsOneWidget);
      expect(find.text('Head & Neck'), findsOneWidget);
      expect(find.text('Chest & Lungs'), findsOneWidget);

      // Enter symptom and tap log
      await tester.enterText(find.byType(TextField), 'Mild tension behind eyes');
      await tester.tap(find.text('LOG SYMPTOM NOTE'));
      await tester.pumpAndSettle();

      // Verify Logged item appears
      expect(find.text('CURRENTLY LOGGED REGIONS'), findsOneWidget);
      expect(find.text('Mild tension behind eyes'), findsOneWidget);
    });

    testWidgets('LeanConsultTab displays FDA CDS banner and starter chips', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: LeanConsultTab(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('FDA Section 520(o) CDS'), findsOneWidget);
      expect(find.text('Analyze my latest vitals & recovery'), findsOneWidget);
      expect(find.text('Review supplement timing for sleep'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('LeanMedicalIdTab displays emergency card, allergies, and QR code', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: LeanMedicalIdTab(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('EMERGENCY MEDICAL ID • FIRST RESPONDER'), findsOneWidget);
      expect(find.text('BLOOD: O+'), findsOneWidget);
      expect(find.text('SEVERE ALLERGIES'), findsOneWidget);
      expect(find.text('Penicillin (Anaphylaxis Risk) • Sulfa Drugs'), findsOneWidget);
      expect(find.text('OFFLINE LEAN-QR (FHIR R4 BUNDLE)'), findsOneWidget);
      expect(find.text('COPY FHIR JSON'), findsOneWidget);
      expect(find.text('SHARE RECORD'), findsOneWidget);
    });
  });
}
