import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/bionic_reading_service.dart';

/// State of the Bionic Reading and RSVP Foveal Reticle Engine.
class BionicReadingState {
  final bool isBionicEnabled;
  final int rsvpSpeedWpm;
  final bool isPlayingRsvp;
  final int currentRsvpIndex;
  final List<ClinicalBionicToken> tokens;

  const BionicReadingState({
    this.isBionicEnabled = true,
    this.rsvpSpeedWpm = 600,
    this.isPlayingRsvp = false,
    this.currentRsvpIndex = 0,
    this.tokens = const [],
  });

  /// The active token centered on the ORP reticle.
  ClinicalBionicToken? get currentToken {
    if (tokens.isEmpty || currentRsvpIndex < 0 || currentRsvpIndex >= tokens.length) {
      return null;
    }
    return tokens[currentRsvpIndex];
  }

  /// Total progress through current text (0.0 to 1.0).
  double get progress {
    if (tokens.isEmpty) return 0.0;
    return (currentRsvpIndex / tokens.length).clamp(0.0, 1.0);
  }

  BionicReadingState copyWith({
    bool? isBionicEnabled,
    int? rsvpSpeedWpm,
    bool? isPlayingRsvp,
    int? currentRsvpIndex,
    List<ClinicalBionicToken>? tokens,
  }) {
    return BionicReadingState(
      isBionicEnabled: isBionicEnabled ?? this.isBionicEnabled,
      rsvpSpeedWpm: rsvpSpeedWpm ?? this.rsvpSpeedWpm,
      isPlayingRsvp: isPlayingRsvp ?? this.isPlayingRsvp,
      currentRsvpIndex: currentRsvpIndex ?? this.currentRsvpIndex,
      tokens: tokens ?? this.tokens,
    );
  }
}

/// Riverpod StateNotifier controlling Bionic Reading and the ORP RSVP stream.
class BionicReadingNotifier extends StateNotifier<BionicReadingState> {
  final BionicReadingService _service;
  Timer? _rsvpTimer;

  BionicReadingNotifier(this._service) : super(const BionicReadingState());

  /// Toggles Bionic text fixation mode across the UI.
  void toggleBionicMode() {
    state = state.copyWith(isBionicEnabled: !state.isBionicEnabled);
  }

  /// Sets the RSVP speed in Words Per Minute (e.g. 300, 450, 600, 750, 900).
  void setRsvpSpeed(int wpm) {
    state = state.copyWith(rsvpSpeedWpm: wpm.clamp(150, 1200));
    if (state.isPlayingRsvp) {
      _rescheduleNextTick();
    }
  }

  /// Loads clinical or scientific text into the RSVP engine and tokenizes it.
  void loadText(String text) {
    _rsvpTimer?.cancel();
    final tokens = _service.tokenize(text);
    state = state.copyWith(
      tokens: tokens,
      currentRsvpIndex: 0,
      isPlayingRsvp: false,
    );
  }

  /// Starts or resumes the RSVP foveal stream.
  void play() {
    if (state.tokens.isEmpty) return;
    if (state.currentRsvpIndex >= state.tokens.length) {
      state = state.copyWith(currentRsvpIndex: 0);
    }
    state = state.copyWith(isPlayingRsvp: true);
    _scheduleNextTick();
  }

  /// Pauses the RSVP stream.
  void pause() {
    _rsvpTimer?.cancel();
    state = state.copyWith(isPlayingRsvp: false);
  }

  /// Toggles between play and pause.
  void togglePlay() {
    if (state.isPlayingRsvp) {
      pause();
    } else {
      play();
    }
  }

  /// Steps forward or backward by [delta] tokens.
  void step(int delta) {
    pause();
    if (state.tokens.isEmpty) return;
    final newIdx = (state.currentRsvpIndex + delta).clamp(0, state.tokens.length - 1);
    state = state.copyWith(currentRsvpIndex: newIdx);
  }

  /// Jumps directly to a specific token index.
  void jumpTo(int index) {
    if (state.tokens.isEmpty) return;
    final target = index.clamp(0, state.tokens.length - 1);
    state = state.copyWith(currentRsvpIndex: target);
  }

  void _scheduleNextTick() {
    _rsvpTimer?.cancel();
    if (!state.isPlayingRsvp || state.tokens.isEmpty) return;

    final token = state.currentToken;
    final holdMultiplier = token?.holdMultiplier ?? 1.0;
    final baseIntervalMs = (60000.0 / state.rsvpSpeedWpm).round();
    final intervalMs = (baseIntervalMs * holdMultiplier).round().clamp(20, 3000);

    _rsvpTimer = Timer(Duration(milliseconds: intervalMs), () {
      if (!mounted || !state.isPlayingRsvp) return;

      final nextIdx = state.currentRsvpIndex + 1;
      if (nextIdx >= state.tokens.length) {
        // Finished reading
        state = state.copyWith(isPlayingRsvp: false, currentRsvpIndex: state.tokens.length - 1);
      } else {
        state = state.copyWith(currentRsvpIndex: nextIdx);
        _scheduleNextTick();
      }
    });
  }

  void _rescheduleNextTick() {
    if (state.isPlayingRsvp) {
      _scheduleNextTick();
    }
  }

  @override
  void dispose() {
    _rsvpTimer?.cancel();
    super.dispose();
  }
}

/// Global provider for BionicReadingService.
final bionicReadingServiceProvider = Provider<BionicReadingService>((ref) {
  return BionicReadingService();
});

/// Global StateNotifierProvider for Bionic Reading & RSVP stream.
final bionicReadingProvider = StateNotifierProvider<BionicReadingNotifier, BionicReadingState>((ref) {
  final service = ref.watch(bionicReadingServiceProvider);
  return BionicReadingNotifier(service);
});
