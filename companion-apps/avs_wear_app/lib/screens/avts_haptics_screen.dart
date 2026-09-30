import 'package:flutter/material.dart';
import '../services/tactile_engine.dart';

class AvtsHapticsScreen extends StatefulWidget {
  const AvtsHapticsScreen({super.key});

  @override
  State<AvtsHapticsScreen> createState() => _AvtsHapticsScreenState();
}

class _AvtsHapticsScreenState extends State<AvtsHapticsScreen> {
  final _engine = TactileEngine();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: SizedBox(
          width: 384,
          height: 384,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'TACTILE BANDS',
                style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  _buildBandButton('ALPHA', '10 Hz', const Color(0xFF14B8A6), HapticCadence.alpha),
                  _buildBandButton('THETA', '6 Hz', const Color(0xFF6366F1), HapticCadence.theta),
                  _buildBandButton('DELTA', '1.5 Hz', const Color(0xFF8B5CF6), HapticCadence.delta),
                  _buildBandButton('BETA', '16 Hz', const Color(0xFFF59E0B), HapticCadence.beta),
                ],
              ),
              const SizedBox(height: 12),
              if (_engine.currentCadence != HapticCadence.idle)
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent.withValues(alpha: 0.2),
                    foregroundColor: Colors.redAccent,
                    shape: const StadiumBorder(),
                    minimumSize: const Size(100, 36),
                  ),
                  onPressed: () {
                    setState(() {
                      _engine.stop();
                    });
                  },
                  child: const Text('STOP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBandButton(String label, String freq, Color color, HapticCadence cadence) {
    final isSelected = _engine.currentCadence == cadence;
    return InkWell(
      onTap: () {
        setState(() {
          if (isSelected) {
            _engine.stop();
          } else {
            _engine.startCadence(cadence);
          }
        });
      },
      child: Container(
        width: 82,
        height: 52,
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.3) : Colors.white10,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : Colors.white24,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.white70,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              freq,
              style: TextStyle(
                color: isSelected ? color : Colors.white38,
                fontSize: 9,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
