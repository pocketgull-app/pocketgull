import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'features/avs_therapy/screens/avs_therapy_screen.dart';

void main() {
  // Ensure the app matches the dark/light status bar depending on theme
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
      title: 'PocketGull AVS',
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
      home: const AvsTherapyScreen(),
    );
  }
}
