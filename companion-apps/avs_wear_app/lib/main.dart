import 'package:flutter/material.dart';
import 'screens/vagal_reset_screen.dart';
import 'screens/avts_haptics_screen.dart';
import 'screens/biofeedback_monitor_screen.dart';
import 'screens/hypnagogic_sleep_screen.dart';
import 'screens/ble_sync_screen.dart';

void main() {
  runApp(const PocketgullWearApp());
}

class PocketgullWearApp extends StatelessWidget {
  const PocketgullWearApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pocketgull AVS Wear',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF14B8A6),
          secondary: Color(0xFF6366F1),
          surface: Colors.black,
        ),
      ),
      home: const WearHomeScreen(),
    );
  }
}

class WearHomeScreen extends StatefulWidget {
  const WearHomeScreen({super.key});

  @override
  State<WearHomeScreen> createState() => _WearHomeScreenState();
}

class _WearHomeScreenState extends State<WearHomeScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Widget> _screens = const [
    VagalResetScreen(),           // Screen 1: 3-Min Vagal Reset (Feature 4 & 1)
    AvtsHapticsScreen(),          // Screen 2: Tactile Bands (Feature 1)
    BiofeedbackMonitorScreen(),   // Screen 3: cEDA & Autonomic HUD (Feature 2)
    HypnagogicSleepScreen(),       // Screen 4: Hypnagogic Sleep Spindle (Feature 5)
    BleSyncScreen(),              // Screen 5: Web Bluetooth Bridge (Feature 3)
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          PageView(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            children: _screens,
          ),
          // Bottom Page Indicator Dots for Circular Display
          Positioned(
            bottom: 6,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(_screens.length, (index) {
                final isSelected = _currentPage == index;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2.5),
                  width: isSelected ? 6 : 4,
                  height: isSelected ? 6 : 4,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelected ? const Color(0xFF14B8A6) : Colors.white24,
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}
