import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/dictation_service.dart';

void main() {
  group('DictationService Voice Command Parsing', () {
    late DictationService service;

    setUp(() {
      service = DictationService();
    });

    test('parses new note command', () {
      final cmd = service.parseCommand('new note Patient reported relief after lumbar traction');
      expect(cmd, isNotNull);
      expect(cmd!.action, equals(CommandAction.newNote));
      expect(cmd.remaining, equals('Patient reported relief after lumbar traction'));
    });

    test('parses pain level command', () {
      final cmd = service.parseCommand('pain level 4');
      expect(cmd, isNotNull);
      expect(cmd!.action, equals(CommandAction.setPain));
      expect(cmd.value, equals(4));
    });

    test('parses switch body part command', () {
      final cmd = service.parseCommand('switch to back');
      expect(cmd, isNotNull);
      expect(cmd!.action, equals(CommandAction.switchAndNote));
      expect(cmd.partId, equals('back'));
    });

    test('parses Socratic disconfirmation and counter-hypothesis commands', () {
      final cmd1 = service.parseCommand('challenge hypothesis');
      expect(cmd1, isNotNull);
      expect(cmd1!.action, equals(CommandAction.challengeHypothesis));

      final cmd2 = service.parseCommand('what disconfirms lumbar radiculopathy');
      expect(cmd2, isNotNull);
      expect(cmd2!.action, equals(CommandAction.challengeHypothesis));
      expect(cmd2.remaining, equals('lumbar radiculopathy'));

      final cmd3 = service.parseCommand('differential check');
      expect(cmd3, isNotNull);
      expect(cmd3!.action, equals(CommandAction.challengeHypothesis));

      final cmd4 = service.parseCommand('socratic challenge');
      expect(cmd4, isNotNull);
      expect(cmd4!.action, equals(CommandAction.challengeHypothesis));
    });
  });
}
