import 'package:flutter/material.dart';
import '../services/sleep_transition_service.dart';

class HypnagogicSleepScreen extends StatefulWidget {
  const HypnagogicSleepScreen({super.key});

  @override
  State<HypnagogicSleepScreen> createState() => _HypnagogicSleepScreenState();
}

class _HypnagogicSleepScreenState extends State<HypnagogicSleepScreen> {
  final _sleepService = SleepTransitionService();
  bool _isTracking = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: SizedBox(
          width: 384,
          height: 384,
          child: StreamBuilder<SleepState>(
            stream: _sleepService.stateStream,
            initialData: _sleepService.currentState,
            builder: (context, snapshot) {
              final state = snapshot.data ?? _sleepService.currentState;
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.nightlight_round, color: Color(0xFF8B5CF6), size: 36),
                  const SizedBox(height: 6),
                  const Text(
                    'HYPNAGOGIC SLEEP',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getStateDescription(state),
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white70, fontSize: 10),
                  ),
                  const SizedBox(height: 12),
                  if (!_isTracking)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        foregroundColor: Colors.white,
                        shape: const StadiumBorder(),
                        minimumSize: const Size(120, 42),
                      ),
                      onPressed: () {
                        setState(() {
                          _isTracking = true;
                        });
                        _sleepService.startSleepTracking();
                      },
                      child: const Text('START SLEEP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    )
                  else
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white12,
                        foregroundColor: Colors.white60,
                        shape: const StadiumBorder(),
                        minimumSize: const Size(100, 36),
                      ),
                      onPressed: () {
                        setState(() {
                          _isTracking = false;
                        });
                        _sleepService.stopSleepTracking();
                      },
                      child: const Text('CANCEL', style: TextStyle(fontSize: 11)),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  String _getStateDescription(SleepState state) {
    switch (state) {
      case SleepState.awakeSettling:
        return 'Theta 6Hz Pacing Active\nDetecting Stillness...';
      case SleepState.hypnagogaDrowsy:
        return 'Drowsiness Detected\nRamping to 1.5Hz Delta';
      case SleepState.sleepSpindleConfirmed:
        return 'Sleep Spindles Confirmed\nFading Haptics & Sound';
      case SleepState.dormantProtected:
        return 'Sleep Protected\nSilent Tracking Engaged';
    }
  }
}
