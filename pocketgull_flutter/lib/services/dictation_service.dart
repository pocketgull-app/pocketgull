import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter/foundation.dart';

class DictationService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isAvailable = false;
  bool _isListening = false;
  
  final ValueNotifier<String> interimText = ValueNotifier<String>('');
  final ValueNotifier<bool> isListeningNotifier = ValueNotifier<bool>(false);

  Future<bool> initialize() async {
    _isAvailable = await _speech.initialize(
      onStatus: (status) {
        if (status == 'listening') {
          _isListening = true;
          isListeningNotifier.value = true;
        } else if (status == 'notListening' || status == 'done') {
          _isListening = false;
          isListeningNotifier.value = false;
        }
      },
      onError: (errorNotification) => debugPrint('Speech Error: $errorNotification'),
    );
    return _isAvailable;
  }

  void startListening(Function(String, bool) onResult) {
    if (!_isAvailable || _isListening) return;

    _speech.listen(
      onResult: (result) {
        interimText.value = result.recognizedWords;
        onResult(result.recognizedWords, result.finalResult);
      },
      listenOptions: stt.SpeechListenOptions(
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 5),
        partialResults: true,
      ),
    );
  }

  void stopListening() {
    _speech.stop();
  }

  void cancelListening() {
    _speech.cancel();
  }

  /// Parses voice input for clinical commands.
  VoiceCommand? parseCommand(String text) {
    final lower = text.toLowerCase().trim();

    // 1. "New Note" command
    if (lower == 'new note' || (lower.startsWith('new note ') && !lower.startsWith('new note for '))) {
      String remaining = text.substring(lower.startsWith('new note ') ? 9 : 8).trim();
      return VoiceCommand(action: CommandAction.newNote, remaining: remaining);
    }

    // 2. "Switch to [part]" or "Note for [part]"
    final prefixes = ['switch to', 'select', 'go to', 'new note for', 'note for'];
    for (var prefix in prefixes) {
      if (lower.startsWith(prefix)) {
        final content = lower.substring(prefix.length).trim();
        final partId = _matchPartId(content);
        if (partId != null) {
          // Find where the part name ends in the original text to extract the remaining message
          // This is a bit simplified; real implementation would be more robust
          return VoiceCommand(
            action: CommandAction.switchAndNote, 
            partId: partId, 
            remaining: _extractRemaining(text, content, partId)
          );
        }
      }
    }

    // 3. "Set pain to [number]"
    final painMatch = RegExp(r'pain (?:level|score|is|rated)?\s*(\d+)').firstMatch(lower) ?? 
                      RegExp(r'(\d+)\s*(?:\/|out of)\s*10').firstMatch(lower);
    if (painMatch != null) {
      final level = int.tryParse(painMatch.group(1)!);
      if (level != null) {
        return VoiceCommand(action: CommandAction.setPain, value: level.clamp(0, 10));
      }
    }

    // 4. "Challenge hypothesis", "What disconfirms", "Differential check", "Socratic challenge"
    final socraticTriggers = [
      'challenge hypothesis',
      'what disconfirms',
      'differential check',
      'test counter hypothesis',
      'socratic challenge',
      'falsify diagnosis',
    ];
    for (var trigger in socraticTriggers) {
      if (lower.startsWith(trigger) || lower.contains(trigger)) {
        final remaining = lower.replaceFirst(trigger, '').trim();
        return VoiceCommand(
          action: CommandAction.challengeHypothesis,
          remaining: remaining,
        );
      }
    }

    return null;
  }

  String? _matchPartId(String text) {
    final mapping = {
      'head': 'head',
      'neck': 'neck',
      'chest': 'chest',
      'abdomen': 'abdomen',
      'pelvis': 'pelvis',
      'right shoulder': 'r_shoulder',
      'left shoulder': 'l_shoulder',
      'right arm': 'r_arm',
      'left arm': 'l_arm',
      'right hand': 'r_hand',
      'left hand': 'l_hand',
      'right leg': 'r_leg',
      'left leg': 'l_leg',
      'right knee': 'r_knee',
      'left knee': 'l_knee',
      'right foot': 'r_foot',
      'left foot': 'l_foot',
      'back': 'back',
    };

    for (var entry in mapping.entries) {
      if (text.startsWith(entry.key)) {
        return entry.value;
      }
    }
    return null;
  }

  String _extractRemaining(String original, String contentAfterPrefix, String partId) {
    // We need to find the part name used (it might be "right knee" or "right arm")
    // For now, return empty or implement a more complex split if needed
    return ''; 
  }
}

enum CommandAction { newNote, switchAndNote, setPain, challengeHypothesis }

class VoiceCommand {
  final CommandAction action;
  final String? partId;
  final String remaining;
  final dynamic value;

  VoiceCommand({
    required this.action,
    this.partId,
    this.remaining = '',
    this.value,
  });
}
