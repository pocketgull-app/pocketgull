// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import 'package:flutter_test/flutter_test.dart';
import 'package:provider_app/core/services/backpack_dispensary_service.dart';
import 'package:provider_app/core/services/multilingual_passport_service.dart';

void main() {
  group('BackpackDispensaryService Unit Tests', () {
    test('1. Contains critical WHO EML emergency protocols', () {
      expect(BackpackDispensaryService.protocols.containsKey('severe_malaria'), isTrue);
      expect(BackpackDispensaryService.protocols.containsKey('severe_preeclampsia'), isTrue);
      expect(BackpackDispensaryService.protocols.containsKey('cholera_shock'), isTrue);
      expect(BackpackDispensaryService.protocols.containsKey('snakebite_hemotoxic'), isTrue);
      expect(BackpackDispensaryService.protocols.containsKey('severe_acute_malnutrition'), isTrue);

      final snakebite = BackpackDispensaryService.protocols['snakebite_hemotoxic']!;
      expect(snakebite.bedsideTest, contains('20WBCT'));
      expect(snakebite.harmfulPracticesToReject, contains(contains('Tourniquet')));
    });

    test('2. Calculates pediatric MUAC triage under MSF / WHO CMAM guidelines', () {
      // Uncomplicated SAM (MUAC < 115mm, no edema, passed appetite test)
      final samOutpatient = BackpackDispensaryService.calculatePediatricMuac(
        muacMm: 110.0,
        edemaPresent: false,
        passedAppetiteTest: true,
      );
      expect(samOutpatient.triageLocation, contains('OUTPATIENT'));
      expect(samOutpatient.initialNutrition, contains('RUTF'));
      expect(samOutpatient.isEmergency, isFalse);

      // Complicated SAM (MUAC < 115mm, failed appetite test)
      final samInpatient = BackpackDispensaryService.calculatePediatricMuac(
        muacMm: 110.0,
        edemaPresent: false,
        passedAppetiteTest: false,
      );
      expect(samInpatient.triageLocation, contains('INPATIENT'));
      expect(samInpatient.initialNutrition, contains('F-75'));
      expect(samInpatient.isEmergency, isTrue);

      // Bilateral Edema (automatically complicated SAM regardless of MUAC)
      final edemaSam = BackpackDispensaryService.calculatePediatricMuac(
        muacMm: 130.0,
        edemaPresent: true,
        passedAppetiteTest: true,
      );
      expect(edemaSam.triageLocation, contains('INPATIENT'));
      expect(edemaSam.isEmergency, isTrue);

      // MAM (115 <= MUAC < 125)
      final mam = BackpackDispensaryService.calculatePediatricMuac(
        muacMm: 120.0,
        edemaPresent: false,
        passedAppetiteTest: true,
      );
      expect(mam.classification, contains('Moderate Acute Malnutrition'));
      expect(mam.triageLocation, contains('SUPPLEMENTARY FEEDING'));

      // Well Nourished (MUAC >= 125)
      final normal = BackpackDispensaryService.calculatePediatricMuac(
        muacMm: 135.0,
        edemaPresent: false,
        passedAppetiteTest: true,
      );
      expect(normal.classification, contains('Well Nourished'));
    });
  });

  group('MultilingualPassportService Unit Tests', () {
    test('1. Verifies 6 supported cross-border languages and RTL flags', () {
      expect(MultilingualPassportService.supportedLanguages.length, equals(6));
      final ar = MultilingualPassportService.supportedLanguages.firstWhere((l) => l.code == 'ar');
      expect(ar.isRtl, isTrue);

      final en = MultilingualPassportService.supportedLanguages.firstWhere((l) => l.code == 'en');
      expect(en.isRtl, isFalse);
    });

    test('2. Encodes de-identified compact QR payload and PGx alerts', () {
      const passport = CrossBorderPassportData(
        anonymousId: 'P-GULL-TEST',
        bloodType: 'O-Negative',
        criticalAllergies: ['Penicillin'],
        pgxVariants: ['CYP2C19 *2/*2'],
        chronicConditions: ['SCTID: 44054006'],
        issueDate: '2026-10-10',
      );

      final qrJson = passport.toCompactQrPayload();
      expect(qrJson, contains('"id":"P-GULL-TEST"'));
      expect(qrJson, contains('"bt":"O-Negative"'));
      expect(qrJson, contains('"pgx":["CYP2C19 *2/*2"]'));

      final transEn = MultilingualPassportService.getTranslation('en');
      expect(transEn['warning'], contains('CYP2C19'));
      expect(transEn['warning'], contains('Clopidogrel'));

      final transEs = MultilingualPassportService.getTranslation('es');
      expect(transEs['warning'], contains('CYP2C19'));
    });
  });
}
