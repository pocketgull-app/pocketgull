import 'package:flutter/material.dart';

/// 📜 PocketGull Washi Rice Paper ThemeData (Material 3)
final ThemeData pocketgullWashiTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.light,
  scaffoldBackgroundColor: const Color(0xFFFAF8F2),
  colorScheme: const ColorScheme.light(
    primary: Color(0xFF0D9488),       // Celadon Bamboo Teal
    onPrimary: Colors.white,
    secondary: Color(0xFFD97706),     // Persimmon Amber
    onSecondary: Colors.white,
    tertiary: Color(0xFF0284C7),      // Medical Indigo
    surface: Color(0xFFF5F2E9),
    onSurface: Color(0xFF292524),     // Sumi Charcoal Ink
    outline: Color(0xFFE7E2D6),
  ),
  fontFamily: 'PocketGull Sans Clinical',
  appBarTheme: const AppBarTheme(
    backgroundColor: Color(0xFFEFEAE1),
    foregroundColor: Color(0xFF292524),
    elevation: 0,
  ),
);

/// 👁️ PocketGull Obsidian Ophthalmic ThemeData (Material 3 / WCAG AAA)
final ThemeData pocketgullObsidianTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  scaffoldBackgroundColor: const Color(0xFF09090B),
  colorScheme: const ColorScheme.dark(
    primary: Color(0xFF38BDF8),       // Surgical Clinical Cyan
    onPrimary: Colors.black,
    secondary: Color(0xFF10B981),     // Telemetry Emerald
    onSecondary: Colors.black,
    tertiary: Color(0xFFFBBF24),      // Amber Gold
    surface: Color(0xFF0E0E14),
    onSurface: Color(0xFFF8FAFC),     // Luminous Stark White
    outline: Color(0xFF1E1E28),
  ),
  fontFamily: 'PocketGull Sans Clinical',
  appBarTheme: const AppBarTheme(
    backgroundColor: Color(0xFF0B0B0F),
    foregroundColor: Color(0xFFF8FAFC),
    elevation: 0,
  ),
);

/// Determines theme based on Circadian bio-rhythm hour (07:00 - 18:00 = Washi, 18:00 - 07:00 = Obsidian)
ThemeData getPocketGullCircadianTheme() {
  final hour = DateTime.now().hour;
  final isDaylight = hour >= 7 && hour < 18;
  return isDaylight ? pocketgullWashiTheme : pocketgullObsidianTheme;
}
