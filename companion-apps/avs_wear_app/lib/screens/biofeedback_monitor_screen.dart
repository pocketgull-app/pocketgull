import 'package:flutter/material.dart';
import '../services/ceda_biofeedback_service.dart';

class BiofeedbackMonitorScreen extends StatefulWidget {
  const BiofeedbackMonitorScreen({super.key});

  @override
  State<BiofeedbackMonitorScreen> createState() => _BiofeedbackMonitorScreenState();
}

class _BiofeedbackMonitorScreenState extends State<BiofeedbackMonitorScreen> {
  final _service = CedaBiofeedbackService();

  @override
  void initState() {
    super.initState();
    _service.startMonitoring();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: SizedBox(
          width: 384,
          height: 384,
          child: StreamBuilder<BiofeedbackSnapshot>(
            stream: _service.stream,
            initialData: _service.latest,
            builder: (context, snapshot) {
              final bio = snapshot.data ?? _service.latest;
              final toneColor = _getToneColor(bio.tone);
              final toneLabel = _getToneLabel(bio.tone);

              return SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 24),
                    const Text(
                      'AUTONOMIC HUD',
                      style: TextStyle(color: Colors.white60, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 6),
                    // Coherence Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: toneColor.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: toneColor, width: 1),
                      ),
                      child: Text(
                        toneLabel,
                        style: TextStyle(color: toneColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // 3-Metric Row (HR, cEDA, Temp)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildMetric('HR', '${bio.heartRate.toInt()}', 'bpm', const Color(0xFFEF4444)),
                        _buildMetric('cEDA', bio.cedaMicrosiemens.toStringAsFixed(2), 'µS', const Color(0xFF14B8A6)),
                        _buildMetric('TEMP', bio.skinTempCelsius.toStringAsFixed(1), '°C', const Color(0xFFF59E0B)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Suggestion
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        _getSuggestionText(bio.suggestion),
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white70, fontSize: 10, fontStyle: FontStyle.italic),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Stress / Calm Test Toggles
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        InkWell(
                          onTap: () => _service.simulateStressEvent(),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                            child: const Text('Sim Stress', style: TextStyle(color: Colors.redAccent, fontSize: 9)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: () => _service.simulateCalmDescent(),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.teal.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                            child: const Text('Sim Calm', style: TextStyle(color: Color(0xFF14B8A6), fontSize: 9)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, String unit, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        Text(unit, style: const TextStyle(color: Colors.white38, fontSize: 8)),
      ],
    );
  }

  Color _getToneColor(AutonomicTone tone) {
    switch (tone) {
      case AutonomicTone.sympatheticAroused:
        return const Color(0xFFEF4444);
      case AutonomicTone.vagalCoherent:
        return const Color(0xFF14B8A6);
      case AutonomicTone.deepParasympathetic:
        return const Color(0xFF8B5CF6);
    }
  }

  String _getToneLabel(AutonomicTone tone) {
    switch (tone) {
      case AutonomicTone.sympatheticAroused:
        return 'SYMPATHETIC SURGE';
      case AutonomicTone.vagalCoherent:
        return 'VAGAL COHERENT';
      case AutonomicTone.deepParasympathetic:
        return 'DEEP PARASYMPATHETIC';
    }
  }

  String _getSuggestionText(AdaptiveSuggestion suggestion) {
    switch (suggestion) {
      case AdaptiveSuggestion.holdAlphaBridge:
        return 'High Arousal: Holding 10Hz Alpha Bridge';
      case AdaptiveSuggestion.deepenToTheta:
        return 'Calm Receptive: Deepening toward 6Hz Theta';
      case AdaptiveSuggestion.continuePacing:
        return 'Optimal Coherence: Pacing Stable';
    }
  }
}
