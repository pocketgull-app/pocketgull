import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'features/avs_therapy/screens/avs_therapy_screen.dart';
import 'features/movement_quest/screens/movement_quest_screen.dart';

void main() {
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ),
  );
  runApp(const PocketGullApp());
}

class PocketGullApp extends StatelessWidget {
  const PocketGullApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PocketGull Patient',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFEEEEEE),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF09090B),
        useMaterial3: true,
      ),
      home: const MainNavigationHub(),
    );
  }
}

class MainNavigationHub extends StatefulWidget {
  const MainNavigationHub({super.key});

  @override
  State<MainNavigationHub> createState() => _MainNavigationHubState();
}

class _MainNavigationHubState extends State<MainNavigationHub> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    MovementQuestScreen(),
    AvsTherapyScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFF27272A))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: const Color(0xFF09090B),
          selectedItemColor: const Color(0xFF34D399),
          unselectedItemColor: const Color(0xFFA1A1AA),
          selectedFontSize: 12,
          unselectedFontSize: 12,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.park_outlined),
              activeIcon: Icon(Icons.park),
              label: 'Biophilic Quest',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.waves_outlined),
              activeIcon: Icon(Icons.waves),
              label: 'AVS Therapy',
            ),
          ],
        ),
      ),
    );
  }
}
