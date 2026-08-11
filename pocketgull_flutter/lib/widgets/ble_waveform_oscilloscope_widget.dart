import 'package:flutter/material.dart';
import '../services/ble_wearables_service.dart';

class BleWaveformOscilloscopeWidget extends StatefulWidget {
  final BleWearablesService bleService;

  const BleWaveformOscilloscopeWidget({
    super.key,
    required this.bleService,
  });

  @override
  State<BleWaveformOscilloscopeWidget> createState() => _BleWaveformOscilloscopeWidgetState();
}

class _BleWaveformOscilloscopeWidgetState extends State<BleWaveformOscilloscopeWidget> {
  List<double> _ppgData = [];
  List<double> _ecgData = [];

  @override
  void initState() {
    super.initState();
    widget.bleService.ppgStream.listen((data) {
      if (mounted) {
        setState(() {
          _ppgData = data;
        });
      }
    });

    widget.bleService.ecgStream.listen((data) {
      if (mounted) {
        setState(() {
          _ecgData = data;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final vitals = widget.bleService.currentVitals;
    final isConnected = widget.bleService.state == BleConnectionState.connected;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0x4D06B6D4)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F000000),
            blurRadius: 16,
            spreadRadius: 2,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Connection Controls
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isConnected ? const Color(0xFF06B6D4) : Colors.grey,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    '🫀 BLE Waveform Oscilloscope',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  if (widget.bleService.isSimulationActive) {
                    widget.bleService.stopSyntheticStream();
                  } else {
                    widget.bleService.startSyntheticStream();
                  }
                  setState(() {});
                },
                icon: Icon(
                  widget.bleService.isSimulationActive ? Icons.stop : Icons.play_arrow,
                  size: 14,
                ),
                label: Text(
                  widget.bleService.isSimulationActive ? 'Stop Stream' : 'Synthetic Stream',
                  style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.bleService.isSimulationActive
                      ? const Color(0xFFF43F5E).withValues(alpha: 0.2)
                      : const Color(0xFF10B981).withValues(alpha: 0.2),
                  foregroundColor: widget.bleService.isSimulationActive ? const Color(0xFFFB7185) : const Color(0xFF34D399),
                  side: BorderSide(
                    color: widget.bleService.isSimulationActive ? const Color(0xFFF43F5E) : const Color(0xFF10B981),
                  ),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Vitals Summary Chips (Wrap to prevent horizontal overflow on narrow screens)
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.spaceAround,
            children: [
              _buildVitalChip('HR', '${vitals.heartRateBpm ?? 72} bpm', Colors.cyanAccent),
              _buildVitalChip('SpO2', '${vitals.spO2Percent?.toStringAsFixed(0) ?? 98}%', const Color(0xFF34D399)),
              _buildVitalChip('HRV RMSSD', '${widget.bleService.hrvRmssd.toStringAsFixed(0)} ms', Colors.amberAccent),
            ],
          ),

          const SizedBox(height: 8),

          // CustomPainter Dual-Trace Canvas Oscilloscope Display
          Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white10),
            ),
            child: CustomPaint(
              painter: _DualTraceOscilloscopePainter(
                ppgData: _ppgData,
                ecgData: _ecgData,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalChip(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.grey, fontSize: 10, fontFamily: 'monospace'),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
        ),
      ],
    );
  }
}

class _DualTraceOscilloscopePainter extends CustomPainter {
  final List<double> ppgData;
  final List<double> ecgData;

  _DualTraceOscilloscopePainter({
    required this.ppgData,
    required this.ecgData,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..strokeWidth = 1.0;

    // Grid background
    const gridStep = 20.0;
    for (double x = 0; x < size.width; x += gridStep) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += gridStep) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // 1. Draw PPG Trace (Top Half - Emerald Green)
    if (ppgData.length > 1) {
      final ppgPaint = Paint()
        ..color = const Color(0xFF10B981)
        ..strokeWidth = 2.0
        ..style = PaintingStyle.stroke;

      final path = Path();
      final stepX = size.width / (ppgData.length > 100 ? ppgData.length : 100);
      final ppgCenterY = size.height * 0.3;

      for (int i = 0; i < ppgData.length; i++) {
        final x = i * stepX;
        final y = ppgCenterY - ppgData[i] * 40.0;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      canvas.drawPath(path, ppgPaint);
    }

    // 2. Draw Lead-I ECG Trace (Bottom Half - Cyan)
    if (ecgData.length > 1) {
      final ecgPaint = Paint()
        ..color = const Color(0xFF06B6D4)
        ..strokeWidth = 2.0
        ..style = PaintingStyle.stroke;

      final path = Path();
      final stepX = size.width / (ecgData.length > 100 ? ecgData.length : 100);
      final ecgCenterY = size.height * 0.75;

      for (int i = 0; i < ecgData.length; i++) {
        final x = i * stepX;
        final y = ecgCenterY - ecgData[i] * 35.0;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      canvas.drawPath(path, ecgPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _DualTraceOscilloscopePainter oldDelegate) => true;
}
