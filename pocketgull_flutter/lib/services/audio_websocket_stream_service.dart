import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'dart:developer' as developer;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

enum GeminiLiveAudioState { disconnected, connecting, streaming, idle }

class AudioWebsocketStreamService {
  io.Socket? _socket;
  final _audioStateController = StreamController<GeminiLiveAudioState>.broadcast();
  final _pcmAudioChunkController = StreamController<Uint8List>.broadcast();
  final _transcriptStreamController = StreamController<String>.broadcast();

  GeminiLiveAudioState _state = GeminiLiveAudioState.disconnected;
  GeminiLiveAudioState get state => _state;

  Stream<GeminiLiveAudioState> get audioStateStream => _audioStateController.stream;
  Stream<Uint8List> get pcmAudioChunkStream => _pcmAudioChunkController.stream;
  Stream<String> get transcriptStream => _transcriptStreamController.stream;

  /// Connects to Gemini Live Multimodal WebSocket Endpoint (sub-200ms audio stream).
  void connectLiveAudioStream({String serverUrl = 'http://localhost:4000'}) {
    if (_socket != null) return;

    _updateState(GeminiLiveAudioState.connecting);

    _socket = io.io(serverUrl, io.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .disableReconnection()
      .setQuery({'client': 'flutter-companion-audio', 'mode': 'gemini-live-pcm'})
      .build());

    _socket!.connect();

    _socket!.onConnect((_) {
      developer.log('[AudioWebsocketStreamService] Connected to Gemini Live PCM Stream.');
      _updateState(GeminiLiveAudioState.streaming);
    });

    _socket!.on('gemini_audio_chunk', (data) {
      if (data is String) {
        final bytes = base64Decode(data);
        _pcmAudioChunkController.add(bytes);
      } else if (data is List<int>) {
        _pcmAudioChunkController.add(Uint8List.fromList(data));
      }
    });

    _socket!.on('gemini_live_transcript', (data) {
      final text = data is Map ? (data['text'] ?? '') : data.toString();
      _transcriptStreamController.add(text);
    });

    _socket!.onDisconnect((_) {
      developer.log('[AudioWebsocketStreamService] Disconnected from Gemini Live Stream.');
      _updateState(GeminiLiveAudioState.disconnected);
    });
  }

  /// Transmits client PCM 16kHz 16-bit audio chunk to Express backend & Gemini 2.5 Flash.
  void sendAudioChunk(Uint8List pcmBuffer) {
    if (_socket == null || !_socket!.connected) return;

    final base64Pcm = base64Encode(pcmBuffer);
    _socket!.emit('client_pcm_chunk', {
      'sampleRate': 16000,
      'channels': 1,
      'data': base64Pcm,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
  }

  /// Triggers Solfeggio 528 Hz / 432 Hz bio-haptic and 110 BPM CPR pulse entrainment stream to Discord Voice.
  void triggerDiscordVoiceEntrainment({double frequencyHz = 528.0, int bpm = 110}) {
    if (_socket == null || !_socket!.connected) return;

    _socket!.emit('discord_voice_entrainment', {
      'frequencyHz': frequencyHz,
      'bpm': bpm,
      'channel': 'discord-webrtc-voice',
    });
    developer.log('[AudioWebsocketStreamService] Solfeggio $frequencyHz Hz + $bpm BPM entrainment sent to Discord Voice.');
  }

  void _updateState(GeminiLiveAudioState newState) {
    _state = newState;
    _audioStateController.add(newState);
  }

  void dispose() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _audioStateController.close();
    _pcmAudioChunkController.close();
    _transcriptStreamController.close();
  }
}

final audioWebsocketStreamProvider = Provider<AudioWebsocketStreamService>((ref) {
  final service = AudioWebsocketStreamService();
  ref.onDispose(() => service.dispose());
  return service;
});
