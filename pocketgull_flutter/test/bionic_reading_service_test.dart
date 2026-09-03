import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/bionic_reading_service.dart';

void main() {
  late BionicReadingService service;

  setUp(() {
    service = BionicReadingService();
  });

  group('BionicReadingService Unit Tests', () {
    test('1. calculateOrpIndex conforms to clinical foveal gaze formula', () {
      expect(BionicReadingService.calculateOrpIndex(1), equals(0));
      expect(BionicReadingService.calculateOrpIndex(3), equals(1));
      expect(BionicReadingService.calculateOrpIndex(5), equals(1));
      expect(BionicReadingService.calculateOrpIndex(6), equals(2));
      expect(BionicReadingService.calculateOrpIndex(8), equals(2));
      expect(BionicReadingService.calculateOrpIndex(10), equals(3));
      expect(BionicReadingService.calculateOrpIndex(13), equals(3));
      expect(BionicReadingService.calculateOrpIndex(14), equals(4));
      expect(BionicReadingService.calculateOrpIndex(20), equals(4));
    });

    test('2. Anchors curated medical prefixes/morphemes', () {
      final tokens = service.tokenize('bradycardia tachycardia osteoarthritis cholecystitis pneumothorax');
      expect(tokens.length, equals(5));

      // bradycardia -> fixation 'brady', suffix 'cardia'
      expect(tokens[0].category, equals('medical-morpheme'));
      expect(tokens[0].fixation, equals('brady'));
      expect(tokens[0].suffix, equals('cardia'));

      // tachycardia -> fixation 'tachy', suffix 'cardia'
      expect(tokens[1].category, equals('medical-morpheme'));
      expect(tokens[1].fixation, equals('tachy'));
      expect(tokens[1].suffix, equals('cardia'));

      // osteoarthritis -> fixation 'osteo', suffix 'arthritis'
      expect(tokens[2].category, equals('medical-morpheme'));
      expect(tokens[2].fixation, equals('osteo'));
      expect(tokens[2].suffix, equals('arthritis'));

      // cholecystitis -> fixation 'chole', suffix 'cystitis'
      expect(tokens[3].category, equals('medical-morpheme'));
      expect(tokens[3].fixation, equals('chole'));
      expect(tokens[3].suffix, equals('cystitis'));

      // pneumothorax -> fixation 'pneumo', suffix 'thorax'
      expect(tokens[4].category, equals('medical-morpheme'));
      expect(tokens[4].fixation, equals('pneumo'));
      expect(tokens[4].suffix, equals('thorax'));
    });

    test('3. Formats FDA / ISMP Tall Man LASA drugs with distinct fixation blocks', () {
      final tokens = service.tokenize('hydroxyzine hydralazine bupropion buspirone');
      expect(tokens.length, equals(4));

      // hydroxyzine -> hydrOXYzine (fixation 'hydrOXY', suffix 'zine')
      expect(tokens[0].category, equals('medication-tallman'));
      expect(tokens[0].tallManWord, equals('hydrOXYzine'));
      expect(tokens[0].fixation, equals('hydroxy'));
      expect(tokens[0].suffix, equals('zine'));

      // hydralazine -> hydraLAZine (fixation 'hydraLAZ', suffix 'ine')
      expect(tokens[1].category, equals('medication-tallman'));
      expect(tokens[1].tallManWord, equals('hydraLAZine'));
      expect(tokens[1].fixation, equals('hydralaz'));
      expect(tokens[1].suffix, equals('ine'));

      // bupropion -> buPROPion
      expect(tokens[2].category, equals('medication-tallman'));
      expect(tokens[2].tallManWord, equals('buPROPion'));
      expect(tokens[2].fixation, equals('buprop'));

      // buspirone -> busPIRone
      expect(tokens[3].category, equals('medication-tallman'));
      expect(tokens[3].tallManWord, equals('busPIRone'));
      expect(tokens[3].fixation, equals('buspir'));
    });

    test('4. Correctly assigns holdMultiplier for RSVP cadence on punctuation', () {
      final tokens = service.tokenize('Patient stable. Vitals normal, pending Labs: complete!');
      expect(tokens.length, equals(7));

      // 'stable.' -> holdMultiplier 1.5
      expect(tokens[1].coreWord, equals('stable'));
      expect(tokens[1].trailingPunct, equals('.'));
      expect(tokens[1].holdMultiplier, equals(1.5));

      // 'normal,' -> holdMultiplier 1.25
      expect(tokens[3].coreWord, equals('normal'));
      expect(tokens[3].trailingPunct, equals(','));
      expect(tokens[3].holdMultiplier, equals(1.25));

      // 'Labs:' -> holdMultiplier 1.25
      expect(tokens[5].coreWord, equals('Labs'));
      expect(tokens[5].trailingPunct, equals(':'));
      expect(tokens[5].holdMultiplier, equals(1.25));

      // 'complete!' -> holdMultiplier 1.5
      expect(tokens[6].coreWord, equals('complete'));
      expect(tokens[6].trailingPunct, equals('!'));
      expect(tokens[6].holdMultiplier, equals(1.5));
    });

    test('5. Splits word around center ORP character for zero-saccadic alignment', () {
      final tokens = service.tokenize('bradycardia');
      final token = tokens.first;

      expect(token.coreWord, equals('bradycardia')); // len = 11
      expect(token.orpIndex, equals(3)); // calculateOrpIndex(11) = 3
      expect(token.orpChar, equals('d'));
      expect(token.leftOfOrp, equals('bra'));
      expect(token.rightOfOrp, equals('ycardia'));
      expect(token.leftOfOrp + token.orpChar + token.rightOfOrp, equals('bradycardia'));
    });
  });
}
