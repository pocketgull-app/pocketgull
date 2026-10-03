import 'package:flutter/material.dart';
import '../services/ble_peripheral_service.dart';

class BleSyncScreen extends StatefulWidget {
  const BleSyncScreen({super.key});

  @override
  State<BleSyncScreen> createState() => _BleSyncScreenState();
}

class _BleSyncScreenState extends State<BleSyncScreen> {
  final _ble = BlePeripheralService();
  bool _isBroadcasting = false;

  @override
  void initState() {
    super.initState();
    _isBroadcasting = _ble.isAdvertising;
  }

  void _toggleBroadcast() async {
    if (_isBroadcasting) {
      await _ble.stopServer();
      setState(() {
        _isBroadcasting = false;
      });
    } else {
      final success = await _ble.startServer();
      setState(() {
        _isBroadcasting = success;
      });
    }
  }

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
              Icon(
                Icons.bluetooth_audio_rounded,
                color: _isBroadcasting ? const Color(0xFF14B8A6) : Colors.white38,
                size: 36,
              ),
              const SizedBox(height: 6),
              const Text(
                'WEB BLUETOOTH',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _isBroadcasting ? const Color(0xFF14B8A6).withValues(alpha: 0.2) : Colors.white10,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _isBroadcasting ? 'BROADCASTING' : 'OFFLINE',
                  style: TextStyle(
                    color: _isBroadcasting ? const Color(0xFF14B8A6) : Colors.white54,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isBroadcasting ? Colors.redAccent.withValues(alpha: 0.3) : const Color(0xFF14B8A6),
                  foregroundColor: _isBroadcasting ? Colors.redAccent : Colors.black,
                  shape: const StadiumBorder(),
                  minimumSize: const Size(120, 40),
                ),
                onPressed: _toggleBroadcast,
                child: Text(
                  _isBroadcasting ? 'STOP' : 'BROADCAST',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Open Pocketgull Web AVS\nto pair directly',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white38, fontSize: 9),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
