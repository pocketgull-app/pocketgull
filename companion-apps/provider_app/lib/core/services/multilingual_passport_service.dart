// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import 'dart:convert';

class PassportLanguageSpec {
  final String code;
  final String name;
  final String nativeName;
  final String flag;
  final bool isRtl;

  const PassportLanguageSpec({
    required this.code,
    required this.name,
    required this.nativeName,
    required this.flag,
    this.isRtl = false,
  });
}

class CrossBorderPassportData {
  final String anonymousId;
  final String bloodType;
  final List<String> criticalAllergies;
  final List<String> pgxVariants;
  final List<String> chronicConditions;
  final String issuingAgency;
  final String issueDate;

  const CrossBorderPassportData({
    required this.anonymousId,
    required this.bloodType,
    required this.criticalAllergies,
    required this.pgxVariants,
    required this.chronicConditions,
    this.issuingAgency = 'MSF / WHO Field Cross-Border Health Authority',
    required this.issueDate,
  });

  String toCompactQrPayload() {
    final Map<String, dynamic> payload = {
      'v': '1.0',
      'id': anonymousId,
      'bt': bloodType,
      'alg': criticalAllergies,
      'pgx': pgxVariants,
      'sct': chronicConditions,
      'ts': issueDate,
    };
    return jsonEncode(payload);
  }
}

class MultilingualPassportService {
  static const List<PassportLanguageSpec> supportedLanguages = [
    PassportLanguageSpec(code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸'),
    PassportLanguageSpec(code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸'),
    PassportLanguageSpec(code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷'),
    PassportLanguageSpec(code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRtl: true),
    PassportLanguageSpec(code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦'),
    PassportLanguageSpec(code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪'),
  ];

  static const Map<String, Map<String, String>> translations = {
    'en': {
      'title': 'CROSS-BORDER EMERGENCY HEALTH PASSPORT',
      'blood_type': 'Blood Group',
      'allergies': 'Critical Drug Allergies',
      'pgx_alerts': 'Pharmacogenomic Contraindications (PGx)',
      'conditions': 'Active Clinical Conditions',
      'warning': 'WARNING: CYP2C19 Poor Metabolizer - Clopidogrel resistance confirmed. Use Prasugrel or Ticagrelor.',
      'sovereign_seal': 'Zero-Egress Sovereign Enclave Verified',
    },
    'es': {
      'title': 'PASAPORTE MÉDICO TRANSFRONTERIZO DE EMERGENCIA',
      'blood_type': 'Grupo Sanguíneo',
      'allergies': 'Alergias a Medicamentos Críticos',
      'pgx_alerts': 'Contraindicaciones Farmacogenómicas (PGx)',
      'conditions': 'Condiciones Clínicas Activas',
      'warning': 'ADVERTENCIA: Metabolizador lento CYP2C19 - Resistencia a Clopidogrel. Usar Prasugrel o Ticagrelor.',
      'sovereign_seal': 'Verificado en Enclave Soberano Local',
    },
    'fr': {
      'title': 'PASSEPORT MÉDICAL D\'URGENCE TRANSFRONTALIER',
      'blood_type': 'Groupe Sanguin',
      'allergies': 'Allergies Médicamenteuses Critiques',
      'pgx_alerts': 'Contre-indications Pharmacogénomiques (PGx)',
      'conditions': 'Affections Cliniques Actives',
      'warning': 'ATTENTION: Métaboliseur lent CYP2C19 - Résistance au Clopidogrel. Utiliser Prasugrel ou Ticagrélor.',
      'sovereign_seal': 'Vérifié par Enclave Souveraine Locale',
    },
    'ar': {
      'title': 'جواز السفر الصحي لحالات الطوارئ عبر الحدود',
      'blood_type': 'فصيلة الدم',
      'allergies': 'الحساسية الشديدة للأدوية',
      'pgx_alerts': 'موانع الاستعمال الدوائية الجينية (PGx)',
      'conditions': 'الحالات المرضية النشطة',
      'warning': 'تحذير: ضعف التمثيل الغذائي لـ CYP2C19 - مقاومة كلوبيدوجريل. استخدم بلاسوجريل أو تيكاجريلور.',
      'sovereign_seal': 'موثق ومشفر محلياً بدون اتصال بالإنترنت',
    },
    'uk': {
      'title': 'МІЖНАРОДНИЙ ЕКСТРЕНИЙ МЕДИЧНИЙ ПАСПОРТ',
      'blood_type': 'Група крові',
      'allergies': 'Критичні алергії на медикаменти',
      'pgx_alerts': 'Фармакогеномні протипоказання (PGx)',
      'conditions': 'Активні клінічні діагнози',
      'warning': 'ПОПЕРЕДЖЕННЯ: Повільний метаболізатор CYP2C19 - резистентність до Клопідогрелю. Застосовуйте Прасугрель або Тікагрелор.',
      'sovereign_seal': 'Підтверджено локальним автономним анклавом',
    },
    'sw': {
      'title': 'PASIPOTI YA MATIBABU YA DHARURA YA MPAKA',
      'blood_type': 'Kundi la Damu',
      'allergies': 'Mizio Mikubwa ya Dawa',
      'pgx_alerts': 'Mwingiliano wa Vinasaba na Dawa (PGx)',
      'conditions': 'Magonjwa ya Sasa ya Kliniki',
      'warning': 'ONYO: Usambazaji hafifu wa CYP2C19 - Usugu wa Clopidogrel umethibitishwa. Tumia Prasugrel au Ticagrelor.',
      'sovereign_seal': 'Imethibitishwa bila Mtandao na Usalama wa Juu',
    },
  };

  static Map<String, String> getTranslation(String langCode) {
    return translations[langCode] ?? translations['en']!;
  }
}
