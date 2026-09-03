/// Theme Service & Design Tokens — Dark, Light, Calm, System, and Spark Mode.
///
/// Flutter parity with Angular `theme.service.ts` and `styles.css`.
/// Manages app-wide themes with persistent storage and ThemeData generation.
library;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Supported app themes matching TypeScript client.
enum AppTheme { light, dark, system, spark, calm, washi }

class ThemeState {
  final AppTheme currentTheme;
  final Brightness resolvedBrightness;
  final bool reduceMotion;
  final ThemeData themeData;

  const ThemeState({
    required this.currentTheme,
    required this.resolvedBrightness,
    required this.reduceMotion,
    required this.themeData,
  });

  bool get isDark => resolvedBrightness == Brightness.dark;
  bool get isSpark => currentTheme == AppTheme.spark;
  bool get isCalm => currentTheme == AppTheme.calm;
  bool get isWashi => currentTheme == AppTheme.washi;

  ThemeState copyWith({
    AppTheme? currentTheme,
    Brightness? resolvedBrightness,
    bool? reduceMotion,
    ThemeData? themeData,
  }) => ThemeState(
    currentTheme: currentTheme ?? this.currentTheme,
    resolvedBrightness: resolvedBrightness ?? this.resolvedBrightness,
    reduceMotion: reduceMotion ?? this.reduceMotion,
    themeData: themeData ?? this.themeData,
  );
}

class ThemeNotifier extends Notifier<ThemeState> {
  static const _themeKey = 'pocket_gull_theme';
  static const _motionKey = 'pocket_gull_reduce_motion';

  @override
  ThemeState build() {
    final initialTheme = AppTheme.light;
    final initialBrightness = Brightness.light;
    _loadSavedTheme();
    return ThemeState(
      currentTheme: initialTheme,
      resolvedBrightness: initialBrightness,
      reduceMotion: false,
      themeData: PocketGullTheme.buildTheme(initialTheme, initialBrightness),
    );
  }

  Future<void> _loadSavedTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_themeKey);
    final reduceMotion = prefs.getBool(_motionKey) ?? false;

    AppTheme theme = AppTheme.light;
    if (saved != null && saved != 'spark') {
      // Never auto-load Spark on cold launch for clinical safety.
      theme = AppTheme.values.firstWhere(
        (t) => t.name == saved,
        orElse: () => AppTheme.light,
      );
    }

    final brightness = _resolve(theme);
    state = ThemeState(
      currentTheme: theme,
      resolvedBrightness: brightness,
      reduceMotion: reduceMotion,
      themeData: PocketGullTheme.buildTheme(theme, brightness),
    );
  }

  void setTheme(AppTheme theme) {
    final brightness = _resolve(theme);
    state = state.copyWith(
      currentTheme: theme,
      resolvedBrightness: brightness,
      themeData: PocketGullTheme.buildTheme(theme, brightness),
    );
    _persist();
  }

  void setReduceMotion(bool reduce) {
    state = state.copyWith(reduceMotion: reduce);
    _persist();
  }

  Brightness _resolve(AppTheme theme) => switch (theme) {
        AppTheme.dark => Brightness.dark,
        AppTheme.spark => Brightness.dark,
        AppTheme.calm => Brightness.light,
        AppTheme.washi => Brightness.light,
        AppTheme.light => Brightness.light,
        AppTheme.system => SchedulerBinding
            .instance.platformDispatcher.platformBrightness,
      };

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, state.currentTheme.name);
    await prefs.setBool(_motionKey, state.reduceMotion);
  }
}

final themeProvider = NotifierProvider<ThemeNotifier, ThemeState>(() {
  return ThemeNotifier();
});

/// Design System Theme Generator matching Angular CSS tokens.
class PocketGullTheme {
  // Spark Mode Ember & Cyberpunk Accents
  static const Color sparkBackground = Color(0xFF0A0503);
  static const Color sparkCardBackground = Color(0xFF140D0A);
  static const Color sparkNeonEmerald = Color(0xFF00FF9D);
  static const Color sparkNeonCyan = Color(0xFF00E5FF);
  static const Color sparkEmberGlow = Color(0xFFFF5500);

  // Calm Mode Soft Paper-White Accents
  static const Color calmBackground = Color(0xFFFAF9F6);
  static const Color calmCardBackground = Color(0xFFFFFFFF);
  static const Color calmSageGreen = Color(0xFF3E6B5C);

  // Rice Paper Washi High-Contrast Light Theme (Ocular Astigmatism Ergonomics & WCAG AAA)
  static const Color washiBackground = Color(0xFFFAF8F0);
  static const Color washiCardBackground = Color(0xFFFFFFFF);
  static const Color washiInkPrimary = Color(0xFF18181B); // >12:1 contrast ratio against washi
  static const Color washiInkSecondary = Color(0xFF27272A);
  static const Color washiTealAccent = Color(0xFF0D9488);
  static const Color washiBorder = Color(0xFFE4E4E7);

  // Standard Dark Obsidian
  static const Color darkBackground = Color(0xFF09090B);
  static const Color darkCardBackground = Color(0xFF18181B);

  // Standard Light Pristine
  static const Color lightBackground = Color(0xFFF9FAFB);
  static const Color lightCardBackground = Color(0xFFFFFFFF);

  static ThemeData buildTheme(AppTheme theme, Brightness brightness) {
    switch (theme) {
      case AppTheme.spark:
        return _buildSparkTheme();
      case AppTheme.calm:
        return _buildCalmTheme();
      case AppTheme.washi:
        return _buildWashiTheme();
      case AppTheme.dark:
        return _buildDarkTheme();
      case AppTheme.light:
      case AppTheme.system:
        return brightness == Brightness.dark
            ? _buildDarkTheme()
            : _buildLightTheme();
    }
  }

  static ThemeData _buildWashiTheme() {
    return ThemeData.light(useMaterial3: true).copyWith(
      scaffoldBackgroundColor: washiBackground,
      cardColor: washiCardBackground,
      dividerColor: washiBorder,
      colorScheme: const ColorScheme.light(
        surface: washiBackground,
        primary: washiTealAccent,
        secondary: washiInkSecondary,
        onSurface: washiInkPrimary,
        outline: washiBorder,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: washiBackground,
        foregroundColor: washiInkPrimary,
        elevation: 0,
      ),
      cardTheme: const CardThemeData(
        color: washiCardBackground,
        elevation: 1,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: washiBorder, width: 1),
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: washiInkPrimary, fontWeight: FontWeight.w500),
        bodyMedium: TextStyle(color: washiInkPrimary),
        bodySmall: TextStyle(color: washiInkSecondary),
        titleLarge: TextStyle(color: washiInkPrimary, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(color: washiInkPrimary, fontWeight: FontWeight.w600),
      ),
    );
  }

  static ThemeData _buildSparkTheme() {
    return ThemeData.dark(useMaterial3: true).copyWith(
      scaffoldBackgroundColor: sparkBackground,
      cardColor: sparkCardBackground,
      colorScheme: const ColorScheme.dark(
        surface: sparkBackground,
        primary: sparkNeonEmerald,
        secondary: sparkNeonCyan,
        tertiary: sparkEmberGlow,
        onSurface: Color(0xFFF4F4F5),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: sparkBackground,
        foregroundColor: sparkNeonEmerald,
        elevation: 0,
      ),
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: sparkCardBackground,
        contentTextStyle: TextStyle(color: sparkNeonEmerald),
      ),
    );
  }

  static ThemeData _buildCalmTheme() {
    return ThemeData.light(useMaterial3: true).copyWith(
      scaffoldBackgroundColor: calmBackground,
      cardColor: calmCardBackground,
      colorScheme: const ColorScheme.light(
        surface: calmBackground,
        primary: calmSageGreen,
        secondary: Color(0xFF6B8E23),
        onSurface: Color(0xFF2A2D34),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: calmBackground,
        foregroundColor: calmSageGreen,
        elevation: 0,
      ),
    );
  }

  static ThemeData _buildDarkTheme() {
    return ThemeData.dark(useMaterial3: true).copyWith(
      scaffoldBackgroundColor: darkBackground,
      cardColor: darkCardBackground,
      colorScheme: const ColorScheme.dark(
        surface: darkBackground,
        primary: Color(0xFF3EBC9E),
        secondary: Color(0xFF416B1F),
        onSurface: Color(0xFFF4F4F5),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBackground,
        foregroundColor: Color(0xFFF4F4F5),
        elevation: 0,
      ),
    );
  }

  static ThemeData _buildLightTheme() {
    return ThemeData.light(useMaterial3: true).copyWith(
      scaffoldBackgroundColor: lightBackground,
      cardColor: lightCardBackground,
      colorScheme: const ColorScheme.light(
        surface: lightBackground,
        primary: Color(0xFF416B1F),
        secondary: Color(0xFF1C1C1C),
        onSurface: Color(0xFF111827),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightBackground,
        foregroundColor: Color(0xFF111827),
        elevation: 0,
      ),
    );
  }
}
